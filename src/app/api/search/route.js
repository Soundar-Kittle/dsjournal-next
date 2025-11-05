import { createDbConnection } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q) return Response.json({ results: [] });

  const connection = await createDbConnection();

  try {
    // ✅ Unified search across journals & articles
    const [journals] = await connection.query(
      `
      SELECT id, journal_name AS title, short_name, 'journal' AS type
      FROM journals
      WHERE journal_name LIKE ? OR short_name LIKE ?
      LIMIT 10
      `,
      [`%${q}%`, `%${q}%`]
    );

    const [articles] = await connection.query(
      `
      SELECT id, article_title AS title, article_id, 'article' AS type
      FROM articles
      WHERE article_title LIKE ? OR article_id LIKE ?
      LIMIT 20
      `,
      [`%${q}%`, `%${q}%`]
    );

    return Response.json({ results: [...journals, ...articles] });
  } catch (error) {
    console.error("❌ Search error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    connection.end();
  }
}
