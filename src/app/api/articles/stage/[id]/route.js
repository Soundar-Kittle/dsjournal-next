// // /api/articles/stage/[id]
// import { NextResponse } from "next/server";
// import { createDbConnection } from "@/lib/db";


// export const dynamic = "force-dynamic";

// // export async function POST(req, { params }) {
// //   const id = Number(params.id);
// //   if (!Number.isFinite(id)) {
// //     return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
// //   }

// //   const { html } = await req.json().catch(() => ({}));
// //   if (!html || typeof html !== "string") {
// //     return NextResponse.json({ success: false, message: "Body must include { html: '<ol>...</ol>' }" }, { status: 400 });
// //   }

// //   const quill = olHtmlToQuill(html);

// //   const conn = await createDbConnection();
// //   try {
// //     await conn.query("UPDATE staged_articles SET `references`=? WHERE id=?", [quill, id]);
// //     return NextResponse.json({ success: true, staged_article_id: id, quill });
// //   } finally {
// //     await conn.end();
// //   }
// // }

// export async function POST(req, { params }) {
//   const id = Number(params.id);
//   const authors = extracted_preview.authors || [];
//   if (!Number.isFinite(id)) {
//     return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
//   }

//   const { action } = await req.json().catch(() => ({}));
//   if (!["accept", "reject"].includes(action)) {
//     return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
//   }

//   const newStatus = action === "accept" ? "approved" : "rejected";

//   const conn = await createDbConnection();
//   try {
//     const [result] = await conn.query(
//   `INSERT INTO staged_articles 
//    (journal_id, article_id, title, abstract, keywords, authors, references, status, created_at, updated_at)
//    VALUES (?, ?, ?, ?, ?, ?, ?, 'extracted', NOW(), NOW())`,
//   [
//     journal_id,
//     extracted_preview.article_id,
//     extracted_preview.title,
//     extracted_preview.abstract,
//     extracted_preview.keywords,
//     JSON.stringify(authors),                // ✅ array -> string
//     extracted_preview.referencesHtml || "", // ✅ keep refs
//   ]
// );

//     if (!result.affectedRows) {
//       return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
//     }

//     return NextResponse.json({
//       success: true,
//       message: `Article ${action}ed successfully`,
//       staged_article_id: id,
//       status: newStatus,
//     });
//   } catch (err) {
//     return NextResponse.json({ success: false, message: err.message }, { status: 500 });
//   } finally {
//     await conn.end();
//   }
// }

// export async function GET(_req, context) {
//   const { id } = await context.params;

//   try {
//     const conn = await createDbConnection();
//     try {
//  const [[st]] = await conn.query("SELECT * FROM staged_articles WHERE id=?", [id]);

//       if (!st) {
//         return Response.json({ success: false, message: "Not found" }, { status: 404 });
//       }
//         return Response.json({
//           success: true,
//           staged: st,
//           references: st.references || "",
//           authors: st.authors ? JSON.parse(st.authors) : [],
//         });
//     } finally {
//       await conn.end();
//     }
//   } catch (err) {
//     return Response.json({ success: false, message: err.message }, { status: 500 });
//   }
// }

// // route.js PUT
// export async function PUT(req, context) {
//   const { id } = context.params;

//   try {
//     const body = await req.json();
//    const {
//   title,
//   abstract,
//   keywords,
//   pages_from,
//   pages_to,
//   received_date,
//   revised_date,
//   accepted_date,
//   published_date,
//   article_id,
//   authors,             // ✅ from frontend
//   doi,
//   volume_number,
//   issue_number,
//   year,
//   references,
// } = body;

// console.log("body",body);

//     const conn = await createDbConnection();
//     try {
//       await conn.beginTransaction();

//       const sql = `
//         UPDATE staged_articles
//          SET title=?,
//       abstract=?,
//       keywords=?,
//       pages_from=?,
//       pages_to=?,
//       received_date=?,
//       revised_date=?,
//       accepted_date=?,
//       published_date=?,
//       article_id=?,
//       authors=?,              -- ✅ save authors JSON
//       doi=?,
//       volume_number=?,
//       issue_number=?,
//       year=?,
//       references=?,
//       status='reviewing',
//       updated_at=CURRENT_TIMESTAMP
//   WHERE id=?`;

//       const vals = [
//   title ?? null,
//   abstract ?? null,
//   keywords ?? null,
//   pages_from ?? null,
//   pages_to ?? null,
//   received_date ?? null,
//   revised_date ?? null,
//   accepted_date ?? null,
//   published_date ?? null,
//   article_id ?? null,
//   authors?.length ? JSON.stringify(authors) : null,  // ✅ stringify array
//   doi ?? null,
//   volume_number ?? null,
//   issue_number ?? null,
//   year ?? null,
//   typeof references === "string" ? references : null,
//   id,
// ];

//       await conn.query(sql, vals);
//       await conn.commit();

//       return NextResponse.json({ success: true });
//     } catch (err) {
//       await conn.rollback();
//       throw err;
//     } finally {
//       await conn.end();
//     }
//   } catch (err) {
//     return NextResponse.json(
//       { success: false, message: err.message },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";

function safeJson(str, fallback = []) {
  try {
    return JSON.parse(str || "[]");
  } catch {
    return fallback;
  }
}

const parseAuthors = (v) => {
  if (!v) return [];
  try {
    return typeof v === "string" ? JSON.parse(v) : v;
  } catch {
    return [];
  }
};

const parseKeywords = (v) => {
  if (!v) return [];
  // try JSON array first
  if (Array.isArray(v)) return v;
  try {
    const parsed = JSON.parse(v);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore, fall back to split
  }
  // fallback: comma-separated text from DB
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};


function normalizeAuthors(authors) {
  if (!authors) return [];
  if (Array.isArray(authors)) return authors;
  try {
    const parsed = JSON.parse(authors);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}


export async function GET(req, context) {
  const { id } = await context.params;
  const articleId = Number(id ?? 0);

  if (!articleId) {
    return NextResponse.json(
      { success: false, message: "Invalid ID" },
      { status: 400 }
    );
  }

  const conn = await createDbConnection();

  try {
    const [[row]] = await conn.query(
      `SELECT
         id, journal_id, file_name, storage_path, title, article_id, abstract,
         authors, keywords, \`references\` AS refs,
         volume_number, issue_number, year, pages_from, pages_to, status,
         received_date, revised_date, accepted_date, published_date,
         created_at, updated_at, volume_id, issue_id, doi_url
       FROM staged_articles
       WHERE id = ? LIMIT 1`,
      [articleId]
    );

    if (!row) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      staged: {
        ...row,
        authors: parseAuthors(row.authors),
        keywords: parseKeywords(row.keywords),
        references: row.refs || "",
      },
    });
  } catch (e) {
    console.error("GET /api/articles/stage/[id] failed:", e);
    return NextResponse.json(
      { success: false, message: e.sqlMessage || e.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    try {
      await conn.end();
    } catch {}
  }
}

export async function PUT(req, { params }) {
  const id = Number(params?.id ?? 0);
  if (!id) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });

  const body = await req.json();
  const {
    title,
    abstract,
    keywords,
    pages_from,
    pages_to,
    received_date,
    revised_date,
    accepted_date,
    published_date,
    article_id,
    authors,
    doi,
    volume_number,
    issue_number,
    year,
    references,
  } = body;

  const conn = await createDbConnection();

  try {
    await conn.query(
      `
      UPDATE staged_articles SET
        title = ?,
        abstract = ?,
        keywords = ?,
        pages_from = ?,
        pages_to = ?,
        received_date = ?,
        revised_date = ?,
        accepted_date = ?,
        published_date = ?,
        article_id = ?,
        authors = ?,
        doi = ?,
        volume_number = ?,
        issue_number = ?,
        year = ?,
        \`references\` = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        title ?? null,
        abstract ?? null,
        keywords ?? null,
        pages_from ?? null,
        pages_to ?? null,
        received_date ?? null,
        revised_date ?? null,
        accepted_date ?? null,
        published_date ?? null,
        article_id ?? null,
        JSON.stringify(authors ?? []),
        doi ?? null,
        volume_number ?? null,
        issue_number ?? null,
        year ?? null,
        references ?? null,
        id,
      ]
    );

    return NextResponse.json({ success: true, message: "Article updated successfully" });
  } catch (e) {
    console.error("❌ PUT /api/articles/stage/[id] failed:", e);
    return NextResponse.json(
      { success: false, message: e.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    try {
      await conn.end();
    } catch {}
  }
}
