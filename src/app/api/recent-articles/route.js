import { createDbConnection } from "@/lib/db";

export async function GET() {
  const connection = await createDbConnection();
  try {
    const [rows] = await connection.query(`
      SELECT 
        a.article_id,
        a.article_title,
        j.journal_name,
        j.short_name,
        v.volume_number,
        i.issue_number,
        v.year
      FROM articles a
      JOIN journals j ON a.journal_id = j.id
      JOIN volumes v ON a.volume_id = v.id
      JOIN issues i  ON a.issue_id = i.id
      WHERE a.article_status = 'published'
      ORDER BY a.id DESC
      LIMIT 6
    `);

    // Process short_name to remove "DS-" prefix and convert to lowercase
    const processedRows = rows.map((row) => ({
      ...row,
      slug: row.short_name
        ? row.short_name.replace(/^DS-/, "").toLowerCase()
        : null,
    }));

    return Response.json({ results: processedRows });
  } catch (err) {
    console.error("❌ Recent Articles Error:", err);
    return Response.json({ results: [] }, { status: 500 });
  } finally {
    connection.end();
  }
}
