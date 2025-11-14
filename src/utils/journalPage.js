import { createDbConnection } from "@/lib/db";
import { unstable_cache } from "next/cache";

export async function _getJournalPageByTitle(journalId, pageTitle) {
  const connection = await createDbConnection();
  try {
    const sql = `
      SELECT 
        jp.*,
        j.journal_name
      FROM journal_pages jp
      JOIN journals j ON jp.journal_id = j.id
      WHERE jp.journal_id = ? 
        AND jp.page_title = ?
      LIMIT 1
    `;

    const [rows] = await connection.execute(sql, [journalId, pageTitle]);

    // Return first row or null
    return rows.length > 0 ? rows[0] : null;
  } finally {
    await connection.end();
  }
}

export const getJournalPageByTitle = unstable_cache(
  async (journalId, pageTitle) => _getJournalPageByTitle(journalId, pageTitle),
  [`journal-page-list`],
  {
    tags: ["journal-page"],
  }
);
