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

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const q = searchParams.get("q")?.trim()?.toLowerCase();
//   const journalIds = searchParams.get("journal")?.split(",").map((v) => v.trim());

//   if (!q) return Response.json({ results: [] });

//   const connection = await createDbConnection();
//   const results = [];

//   try {
//     // ================================
//     // 1️⃣ ARTICLES
//     // ================================
//     const [articles] = await connection.query(
//       `
//       SELECT 
//   id, 
//   article_title AS title, 
//   article_id,
//   abstract,
//   authors,
//   'article' AS type
//       FROM articles
//       WHERE article_title LIKE ? OR article_id LIKE ?
//       LIMIT 20
//       `,
//       [`%${q}%`, `%${q}%`]
//     );
//     results.push(...articles);

//     // ================================
//     // 2️⃣ JOURNALS
//     // ================================
//     const [journals] = await connection.query(
//       `
//       SELECT id, journal_name AS title, short_name, 'journal' AS type
//       FROM journals
//       WHERE journal_name LIKE ? OR short_name LIKE ?
//       LIMIT 10
//       `,
//       [`%${q}%`, `%${q}%`]
//     );

//     // Add derived slug (from name)
//     journals.forEach((j) => {
//       const slug = j.short_name
//         ? j.short_name.toLowerCase().replace(/\s+/g, "-")
//         : j.title.toLowerCase().replace(/\s+/g, "-");
//       results.push({ ...j, slug: `/${slug}`, type: "journal" });
//     });

// // ================================
// // 3️⃣ JOURNAL PAGES (from journal_pages table)
// // ================================
// const [pages] = await connection.query(`
//   SELECT jp.id, jp.page_title AS title, j.short_name, j.journal_name
//   FROM journal_pages jp
//   LEFT JOIN journals j ON jp.journal_id = j.id
//   WHERE jp.page_title LIKE ? 
//      OR REGEXP_REPLACE(jp.content, '<[^>]*>', '') LIKE ?
//   LIMIT 20
// `, [`%${q}%`, `%${q}%`]);

// const pagesWithSlug = pages.map((p) => {
//   const journalSlug = (p.short_name || p.journal_name || "")
//     .toLowerCase()
//     .replace(/\s+/g, "-")
//     .replace(/[^a-z0-9-]/g, "");

//   const pageSlug = p.title.replace(/_/g, "-").toLowerCase();

//   return {
//     id: p.id,
//     title: p.title.replace(/_/g, " "),
//     slug: `/${journalSlug}/${pageSlug}`,  // ✅ no /page prefix
//     type: "page",
//   };
// });

// results.push(...pagesWithSlug);


//     // ================================
//     // 4️⃣ STATIC WEBSITE PAGES (Next.js /app directory)
//     // ================================
//     const appDir = path.join(process.cwd(), "src/app");

//     function scanDirectory(dirPath) {
//       const entries = fs.readdirSync(dirPath, { withFileTypes: true });
//       for (const entry of entries) {
//         const fullPath = path.join(dirPath, entry.name);
//         if (entry.isDirectory()) {
//           if (entry.name.startsWith("(") || entry.name.startsWith("[")) continue;
//           scanDirectory(fullPath);
//         } else if (entry.name.match(/^page\.(jsx|tsx|js|html)$/i)) {
//           try {
//             const content = fs.readFileSync(fullPath, "utf-8").toLowerCase();
//             const cleanText = content.replace(/<[^>]*>/g, " ");
//             if (cleanText.includes(q)) {
//               const relative = fullPath
//                 .replace(appDir, "")
//                 .replace(/\\/g, "/")
//                 .replace(/\/page\.(jsx|tsx|js|html)$/i, "")
//                 .replace(/^\/+/, "");
//               const slug = `/${relative.replace(/^\(home\)\//, "")}`;
//               const title = relative
//                 .split("/")
//                 .slice(-1)[0]
//                 .replace(/-/g, " ")
//                 .replace(/\b\w/g, (c) => c.toUpperCase());
//               results.push({ title, slug, type: "static" });
//             }
//           } catch (err) {
//             console.warn("Error reading file:", fullPath, err.message);
//           }
//         }
//       }
//     }
//     scanDirectory(appDir);

//     // ================================
// // 5️⃣ STATIC PAGES (from `metas` table)
// // ================================
// const [metaPages] = await connection.query(
//   `
//   SELECT id, reference_id AS slug, reference_type, 'meta_page' AS type
//   FROM metas
//   WHERE reference_type = 'page'
//   `
// );

// const metaResults = metaPages
//   .filter((m) => {
//     // Only include if query matches reference_id or common words
//     return m.slug.toLowerCase().includes(q.toLowerCase());
//   })
//   .map((m) => ({
//     title: m.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
//     slug: `/${m.slug}`, // ✅ clean URLs like /for-authors or /licensing-policy
//     type: "meta_page",
//   }));

// results.push(...metaResults);

//     // ================================
//     // ✅ Return Combined Results
//     // ================================
//     return Response.json({ success: true, count: results.length, results });
//   } catch (error) {
//     console.error("❌ Search error:", error);
//     return Response.json({ error: error.message }, { status: 500 });
//   } finally {
//     connection.end();
//   }
// }

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim()?.toLowerCase();
  const journalIds = searchParams.get("journal")?.split(",").map(v => v.trim());

  if (!q) return Response.json({ results: [] });

  const connection = await createDbConnection();
  let results = [];

  let journalFilter = "";
if (journalIds && journalIds.length > 0) {
  journalFilter = ` AND a.journal_id IN (${journalIds.map(() => "?").join(",")}) `;
}

  try {
    // ---------------------------------------------------------
    // 1️⃣ ARTICLES (IMPROVED — includes abstract + authors clean)
    // ---------------------------------------------------------
// 1️⃣ ARTICLES
const like = `%${q}%`;

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
    OR LOWER(a.article_id)   LIKE ?
    OR LOWER(a.authors)      LIKE ?
  LIMIT 50
  `,
  [like, like, like]
);

// 🔹 Normalize rows into article results
const articleResults = articles.map((a) => {
  const cleanShort = a.short_name
    ?.toLowerCase()
    ?.replace(/^ds-/, ""); // "DS-DST" → "dst"

  return {
    id: a.id,
    type: "article",
    title: a.title,
    article_id: a.article_id,
    journal_id: a.journal_id,
    journal_name: a.journal_name,
    short_name: a.short_name,
    volume_number: a.volume_number,
    issue_number: a.issue_number,
    year: a.year,
    // URL like /dst/DST-V4I2P101
    slug: `/${cleanShort}/${a.article_id}`,
    // cleaned abstract snippet
    abstract_snippet: a.abstract
      ? a.abstract.replace(/<[^>]*>/g, "").slice(0, 250)
      : "",
    // authors stored like ["Li Mingliang","Lai PC"] → "Li Mingliang, Lai PC"
    authors: a.authors
      ? a.authors.replace(/[\[\]"]+/g, "").split(",").join(", ")
      : "",
  };
});

// push article cards (when Article is checked)
results.push(...articleResults);


// 2️⃣ AUTHORS (aggregate from matching articles)
const authorMap = {}; // { "Lai PC": [ {article...}, ... ] }

articleResults.forEach((row) => {
  const raw = row.authors || "";

  const list = raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  list.forEach((name) => {
    // only include authors whose name matches the query
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

// Convert map → array of { type: "author", name, articles: [...] }
Object.keys(authorMap).forEach((authorName) => {
  results.push({
    type: "author",
    name: authorName,
    articles: authorMap[authorName],
  });
});

    // ---------------------------------------------------------
    // 2️⃣ JOURNALS
    // ---------------------------------------------------------
    const [journals] = await connection.query(
      `
      SELECT id, journal_name AS title, short_name, 'journal' AS type
      FROM journals
      WHERE LOWER(journal_name) LIKE ?
         OR LOWER(short_name) LIKE ?
      LIMIT 15
      `,
      [`%${q}%`, `%${q}%`]
    );

    journals.forEach(j => {
      const slug = (j.short_name || j.title)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      results.push({
        ...j,
        slug: `/${slug}`,
        type: "journal",
      });
    });

    // ---------------------------------------------------------
    // 3️⃣ JOURNAL PAGES
    // ---------------------------------------------------------
    const [pages] = await connection.query(
      `
      SELECT 
        jp.id, 
        jp.page_title AS title, 
        j.short_name, 
        j.journal_name
      FROM journal_pages jp
      LEFT JOIN journals j ON jp.journal_id = j.id
      WHERE LOWER(jp.page_title) LIKE ?
         OR LOWER(REGEXP_REPLACE(jp.content, '<[^>]*>', '')) LIKE ?
      LIMIT 20
      `,
      [`%${q}%`, `%${q}%`]
    );

    const pagesWithSlug = pages.map(p => {
      const journalSlug = (p.short_name || p.journal_name || "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const pageSlug = p.title
        .replace(/_/g, "-")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");

      return {
        id: p.id,
        title: p.title.replace(/_/g, " "),
        slug: `/${journalSlug}/${pageSlug}`,
        type: "page",
      };
    });

    results.push(...pagesWithSlug);

    // ---------------------------------------------------------
    // 4️⃣ SCAN STATIC NEXT.JS PAGES
    // ---------------------------------------------------------
    const appDir = path.join(process.cwd(), "src/app");

    function scanDirectory(dirPath) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const full = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          if (entry.name.startsWith("(") || entry.name.startsWith("[")) continue;
          scanDirectory(full);
        } else if (/^page\.(jsx|tsx|js|html)$/i.test(entry.name)) {
          try {
            const content = fs.readFileSync(full, "utf-8").toLowerCase();
            const clean = content.replace(/<[^>]*>/g, "");

            if (clean.includes(q)) {
              const relative = full
                .replace(appDir, "")
                .replace(/\\/g, "/")
                .replace(/\/page\.(jsx|tsx|js|html)$/i, "")
                .replace(/^\/+/, "");

              const slug = `/${relative.replace(/^\(home\)\//, "")}`;

              const title = relative
                .split("/")
                .slice(-1)[0]
                .replace(/-/g, " ")
                .replace(/\b\w/g, c => c.toUpperCase());

              results.push({
                type: "static",
                title,
                slug,
              });
            }
          } catch (e) {
            console.warn("Static scan error:", full, e.message);
          }
        }
      }
    }

    scanDirectory(appDir);

    // ---------------------------------------------------------
    // 5️⃣ META STATIC PAGES (metas table)
    // ---------------------------------------------------------
    const [metaPages] = await connection.query(
      `
      SELECT reference_id AS slug, 'meta_page' AS type
      FROM metas
      WHERE reference_type = 'page'
      `
    );

    metaPages.forEach(m => {
      if (m.slug.toLowerCase().includes(q.toLowerCase())) {
        results.push({
          type: "meta_page",
          slug: `/${m.slug}`,
          title: m.slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        });
      }
    });

    // ---------------------------------------------------------
    // RETURN RESULTS
    // ---------------------------------------------------------
    return Response.json({
      success: true,
      count: results.length,
      results,
    });

  } catch (error) {
    console.error("❌ Search error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    connection.end();
  }
}
