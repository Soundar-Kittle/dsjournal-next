// import { createDbConnection } from "@/lib/db";

// export async function getCallForPaper(journalId) {
//   const connection = await createDbConnection();
//   try {
//     const sql = `
//       SELECT 
//         cfp.id,
//         cfp.is_common,
//         cfp.journal_id,
//         cfp.date_mode,
//         DATE_FORMAT(cfp.manual_date, "%Y-%m-%d") AS manual_date,
//         DATE_FORMAT(cfp.start_date, "%Y-%m-%d") AS start_date,
//         DATE_FORMAT(cfp.end_date, "%Y-%m-%d") AS end_date,
//         cfp.permit_dates,
//         cfp.is_active,
//         j.journal_name
//       FROM call_for_papers cfp
//       LEFT JOIN journals j ON cfp.journal_id = j.id
//       WHERE 
//         cfp.is_active = 1
//         AND (
//           (cfp.journal_id = ? AND cfp.is_common = 0)
//           OR (cfp.is_common = 1)
//         )
//       ORDER BY 
//         cfp.is_common ASC,
//         cfp.created_at DESC
//       LIMIT 1
//     `;

//     const [[row]] = await connection.query(sql, [journalId]);
//     if (!row) return null;

//     // Optional: check date validity (based on date_mode)
//     const today = new Date();
//     let isValid = true;

//     if (row.date_mode === "manual") {
//       isValid = !!row.manual_date && new Date(row.manual_date) >= today;
//     } else if (row.date_mode === "auto") {
//       const start = row.start_date ? new Date(row.start_date) : null;
//       const end = row.end_date ? new Date(row.end_date) : null;
//       isValid = start && end && today >= start && today <= end;
//     }

//     return isValid ? row : null;
//   } catch (error) {
//     console.error("❌ getCallForPaperByJournalId Error:", error);
//     return null;
//   } finally {
//     await connection.end();
//   }
// }


// import { getCallForPaper } from "@/utils/callForPaper";
// import pool from "@/lib/db";

// export async function getRenderedJournalPage(journalId, pageTitle) {
//   const conn = await createDbConnection();
//   try {
//     const [[page]] = await conn.query(
//       `SELECT * FROM journal_pages WHERE journal_id = ? AND page_title = ? LIMIT 1`,
//       [journalId, pageTitle]
//     );

//     if (!page) return null;

//     // 🧩 Get the dynamic Call for Paper date
//     const cfp = await getCallForPaper(journalId);
//     let rendered = page.content || "";

//     // Replace placeholder
//     if (cfp?.display_date) {
//       rendered = rendered.replace(
//         /{{\s*call_for_paper_date\s*}}/g,
//         cfp.display_date
//       );
//     }

//     return { ...page, rendered_content: rendered };
//   } finally {
//     conn.end();
//   }
// }


import { createDbConnection } from "@/lib/db";

export async function getCallForPaper(journalId) {
  const conn = await createDbConnection();
  try {
    const [rows] = await conn.query(
      `
      SELECT 
        id, journal_id, month_group_id, date_mode,
        manual_date, start_date, end_date, is_active
      FROM call_for_papers
      WHERE journal_id = ? AND is_active = 1
      ORDER BY manual_date >= CURDATE() ASC, manual_date ASC
      LIMIT 1
      `,
      [journalId]
    );

    if (!rows.length) return null;

    const record = rows[0];
    const rawDate =
      record.date_mode === "manual"
        ? record.manual_date
        : record.end_date || record.start_date;

    const display_date = rawDate
      ? new Date(rawDate).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

    return { ...record, display_date };
  } finally {
    conn.end();
  }
}
