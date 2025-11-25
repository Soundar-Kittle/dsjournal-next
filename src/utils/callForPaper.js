// import { createDbConnection } from "@/lib/db";

// export async function getCallForPaper(journalId) {
//   const conn = await createDbConnection();
//   try {
//     const [rows] = await conn.query(
//       `
//       SELECT
//         id, journal_id, month_group_id, date_mode,
//         DATE_FORMAT(manual_date, "%Y-%m-%d") AS manual_date,
//         DATE_FORMAT(start_date, "%Y-%m-%d") AS start_date,
//         DATE_FORMAT(end_date, "%Y-%m-%d") AS end_date, is_active
//       FROM call_for_papers
//       WHERE journal_id = ? AND is_active = 1
//       ORDER BY manual_date >= CURDATE() ASC, manual_date ASC
//       LIMIT 1
//       `,
//       [journalId]
//     );
//     console.log("call for paper", rows);

//     if (!rows.length) return null;

//     const record = rows[0];
//     const rawDate =
//       record.date_mode === "manual"
//         ? record.manual_date
//         : record.end_date || record.start_date;

//     const display_date = rawDate
//       ? new Date(rawDate).toLocaleDateString("en-IN", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         })
//       : "—";

//     return { ...record, display_date };
//   } finally {
//     conn.end();
//   }
// }
///////////////////
///////////////////

import { createDbConnection } from "@/lib/db";
import { unstable_cache } from "next/cache";

export async function _getCallForPaper(journalId) {
  const conn = await createDbConnection();

  try {
    let query = `
      SELECT 
        id, journal_id, month_group_id, date_mode,
        DATE_FORMAT(manual_date, "%Y-%m-%d") AS manual_date, 
        DATE_FORMAT(start_date, "%Y-%m-%d") AS start_date, 
        DATE_FORMAT(end_date, "%Y-%m-%d") AS end_date,
        is_active, is_common
      FROM call_for_papers
      WHERE is_active = 1
    `;

    let params = [];

    // If journalId exists → filter by journal
    // else → fallback to common CFP
    if (journalId) {
      query += " AND journal_id = ?";
      params.push(journalId);
    } else {
      query += " AND is_common = 1";
    }

    query += `
      ORDER BY manual_date >= CURDATE() ASC, manual_date ASC
      LIMIT 1
    `;

    const [rows] = await conn.query(query, params);

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

export const getCallForPaper = unstable_cache(
  async (journalId) => _getCallForPaper(journalId),
  [`call_for_papers_list`],
  {
    tags: ["call_for_papers"],
  }
);
