// import { createDbConnection } from "@/lib/db";

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const q = searchParams.get("q")?.trim();

//   if (!q) return Response.json({ results: [] });

//   const connection = await createDbConnection();

//   try {
//     // ✅ Unified search across journals & articles
//     const [journals] = await connection.query(
//       `
//       SELECT id, journal_name AS title, short_name, 'journal' AS type
//       FROM journals
//       WHERE journal_name LIKE ? OR short_name LIKE ?
//       LIMIT 10
//       `,
//       [`%${q}%`, `%${q}%`]
//     );

//     const [articles] = await connection.query(
//       `
//       SELECT id, article_title AS title, article_id, 'article' AS type
//       FROM articles
//       WHERE article_title LIKE ? OR article_id LIKE ?
//       LIMIT 20
//       `,
//       [`%${q}%`, `%${q}%`]
//     );

//     return Response.json({ results: [...journals, ...articles] });
//   } catch (error) {
//     console.error("❌ Search error:", error);
//     return Response.json({ error: error.message }, { status: 500 });
//   } finally {
//     connection.end();
//   }
// }

import { createDbConnection } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim()?.toLowerCase();
  const journalIds = searchParams.get("journal")?.split(",").map((v) => v.trim());

  if (!q) return Response.json({ results: [] });

  const connection = await createDbConnection();
  const results = [];

  try {
    // ================================
    // 1️⃣ ARTICLES
    // ================================
    const [articles] = await connection.query(
      `
      SELECT id, article_title AS title, article_id, 'article' AS type
      FROM articles
      WHERE article_title LIKE ? OR article_id LIKE ?
      LIMIT 20
      `,
      [`%${q}%`, `%${q}%`]
    );
    results.push(...articles);

    // ================================
    // 2️⃣ JOURNALS
    // ================================
    const [journals] = await connection.query(
      `
      SELECT id, journal_name AS title, short_name, 'journal' AS type
      FROM journals
      WHERE journal_name LIKE ? OR short_name LIKE ?
      LIMIT 10
      `,
      [`%${q}%`, `%${q}%`]
    );

    // Add derived slug (from name)
    journals.forEach((j) => {
      const slug = j.short_name
        ? j.short_name.toLowerCase().replace(/\s+/g, "-")
        : j.title.toLowerCase().replace(/\s+/g, "-");
      results.push({ ...j, slug: `/${slug}`, type: "journal" });
    });

// ================================
// 3️⃣ JOURNAL PAGES (from journal_pages table)
// ================================
const [pages] = await connection.query(`
  SELECT jp.id, jp.page_title AS title, j.short_name, j.journal_name
  FROM journal_pages jp
  LEFT JOIN journals j ON jp.journal_id = j.id
  WHERE jp.page_title LIKE ? 
     OR REGEXP_REPLACE(jp.content, '<[^>]*>', '') LIKE ?
  LIMIT 20
`, [`%${q}%`, `%${q}%`]);

const pagesWithSlug = pages.map((p) => {
  const journalSlug = (p.short_name || p.journal_name || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const pageSlug = p.title.replace(/_/g, "-").toLowerCase();

  return {
    id: p.id,
    title: p.title.replace(/_/g, " "),
    slug: `/${journalSlug}/${pageSlug}`,  // ✅ no /page prefix
    type: "page",
  };
});

results.push(...pagesWithSlug);


    // ================================
    // 4️⃣ STATIC WEBSITE PAGES (Next.js /app directory)
    // ================================
    const appDir = path.join(process.cwd(), "src/app");

    function scanDirectory(dirPath) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          if (entry.name.startsWith("(") || entry.name.startsWith("[")) continue;
          scanDirectory(fullPath);
        } else if (entry.name.match(/^page\.(jsx|tsx|js|html)$/i)) {
          try {
            const content = fs.readFileSync(fullPath, "utf-8").toLowerCase();
            const cleanText = content.replace(/<[^>]*>/g, " ");
            if (cleanText.includes(q)) {
              const relative = fullPath
                .replace(appDir, "")
                .replace(/\\/g, "/")
                .replace(/\/page\.(jsx|tsx|js|html)$/i, "")
                .replace(/^\/+/, "");
              const slug = `/${relative.replace(/^\(home\)\//, "")}`;
              const title = relative
                .split("/")
                .slice(-1)[0]
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
              results.push({ title, slug, type: "static" });
            }
          } catch (err) {
            console.warn("Error reading file:", fullPath, err.message);
          }
        }
      }
    }
    scanDirectory(appDir);

    // ================================
// 5️⃣ STATIC PAGES (from `metas` table)
// ================================
const [metaPages] = await connection.query(
  `
  SELECT id, reference_id AS slug, reference_type, 'meta_page' AS type
  FROM metas
  WHERE reference_type = 'page'
  `
);

const metaResults = metaPages
  .filter((m) => {
    // Only include if query matches reference_id or common words
    return m.slug.toLowerCase().includes(q.toLowerCase());
  })
  .map((m) => ({
    title: m.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    slug: `/${m.slug}`, // ✅ clean URLs like /for-authors or /licensing-policy
    type: "meta_page",
  }));

results.push(...metaResults);

    // ================================
    // ✅ Return Combined Results
    // ================================
    return Response.json({ success: true, count: results.length, results });
  } catch (error) {
    console.error("❌ Search error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    connection.end();
  }
}
