import { createDbConnection } from "@/lib/db";

export async function getSitemapArticles() {
  const connection = await createDbConnection();
  try {
    const sql = `
      SELECT 
        LOWER(
          CASE
            WHEN j.short_name LIKE 'DS-%' THEN SUBSTRING(j.short_name, 4)
            WHEN j.short_name LIKE 'ds-%' THEN SUBSTRING(j.short_name, 4)
            WHEN j.short_name LIKE 'Ds-%' THEN SUBSTRING(j.short_name, 4)
            WHEN j.short_name LIKE 'dS-%' THEN SUBSTRING(j.short_name, 4)
            ELSE j.short_name
          END
        ) AS journal_slug,
        a.article_id
      FROM articles a
      JOIN journals j ON a.journal_id = j.id
      WHERE j.is_active = 1 AND a.article_status = 'published'
      ORDER BY j.id, a.id;
    `;
    const [rows] = await connection.execute(sql);
    return rows;
  } finally {
    await connection.end();
  }
}
