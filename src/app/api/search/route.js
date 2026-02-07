import { createDbConnection } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim()?.toLowerCase();
  if (!q) return Response.json({ results: [] });

  const like = `%${q}%`;

  const connection = await createDbConnection();
  let results = [];

  try {
    // ---------------------------------------------------------
    // 1️⃣ ARTICLES
    // ---------------------------------------------------------
    const [articles] = await connection.query(
      `
      SELECT 
        a.id,
        a.article_title AS title,
        a.article_id,
        a.abstract,
        a.authors,
        a.journal_id,
        j.journal_name,
        j.short_name,
        v.volume_number,
        v.year,
        i.issue_number
      FROM articles a
      LEFT JOIN journals j ON a.journal_id = j.id
      LEFT JOIN volumes v ON a.volume_id = v.id
      LEFT JOIN issues  i ON a.issue_id  = i.id
      WHERE 
        LOWER(a.article_title) LIKE ?
        OR LOWER(a.article_id) LIKE ?
        OR LOWER(a.authors) LIKE ?
      LIMIT 50
      `,
      [like, like, like]
    );

    const articleResults = articles.map((a) => ({
      id: a.id,
      type: "article",
      title: a.title,
      article_id: a.article_id,
      journal_id: a.journal_id,
      journal_name: a.journal_name,
      slug: `/${a.short_name.toLowerCase().replace(/^ds-/, "")}/${a.article_id}`,
      abstract_snippet: a.abstract
        ? a.abstract.replace(/<[^>]*>/g, "").slice(0, 250)
        : "",
      authors: Array.isArray(a.authors)
        ? a.authors.join(", ")
        : typeof a.authors === "string"
          ? a.authors
              .replace(/[\[\]"]+/g, "")
              .split(",")
              .join(", ")
          : "",
    }));

    results.push(...articleResults);

    // ---------------------------------------------------------
    // 2️⃣ AUTHORS (from article results)
    // ---------------------------------------------------------
    const authorMap = {};

    articleResults.forEach((row) => {
      const list = (row.authors || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      list.forEach((name) => {
        if (!name.toLowerCase().includes(q)) return;

        if (!authorMap[name]) authorMap[name] = [];

        authorMap[name].push({
          article_id: row.article_id,
          title: row.title,
          slug: row.slug,
          journal_name: row.journal_name,
        });
      });
    });

    Object.keys(authorMap).forEach((name) =>
      results.push({
        type: "author",
        name,
        articles: authorMap[name],
      })
    );

    // ---------------------------------------------------------
    // NO STATIC PAGES FOR NOW (disabled)
    // ---------------------------------------------------------

    return Response.json({ success: true, count: results.length, results });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    connection.end();
  }
}
