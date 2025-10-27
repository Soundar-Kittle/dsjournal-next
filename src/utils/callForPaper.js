import { createDbConnection } from "@/lib/db";

export async function getCallForPaper(journalId) {
  const connection = await createDbConnection();
  try {
    const sql = `
      SELECT 
        cfp.id,
        cfp.is_common,
        cfp.journal_id,
        cfp.date_mode,
        DATE_FORMAT(cfp.manual_date, "%Y-%m-%d") AS manual_date,
        DATE_FORMAT(cfp.start_date, "%Y-%m-%d") AS start_date,
        DATE_FORMAT(cfp.end_date, "%Y-%m-%d") AS end_date,
        cfp.permit_dates,
        cfp.is_active,
        j.journal_name
      FROM call_for_papers cfp
      LEFT JOIN journals j ON cfp.journal_id = j.id
      WHERE 
        cfp.is_active = 1
        AND (
          (cfp.journal_id = ? AND cfp.is_common = 0)
          OR (cfp.is_common = 1)
        )
      ORDER BY 
        cfp.is_common ASC,
        cfp.created_at DESC
      LIMIT 1
    `;

    const [[row]] = await connection.query(sql, [journalId]);
    if (!row) return null;

    // Optional: check date validity (based on date_mode)
    const today = new Date();
    let isValid = true;

    if (row.date_mode === "manual") {
      isValid = !!row.manual_date && new Date(row.manual_date) >= today;
    } else if (row.date_mode === "auto") {
      const start = row.start_date ? new Date(row.start_date) : null;
      const end = row.end_date ? new Date(row.end_date) : null;
      isValid = start && end && today >= start && today <= end;
    }

    return isValid ? row : null;
  } catch (error) {
    console.error("❌ getCallForPaperByJournalId Error:", error);
    return null;
  } finally {
    await connection.end();
  }
}
