// /api/articles/stage/[id]
import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";
import { refsArrayToQuill } from "@/lib/refsQuill.js";
import { olHtmlToQuill } from "@/lib/refsQuill";
import { getAllowedKeys } from "@/lib/refLinks-allowed.js";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
  }

  const { html } = await req.json().catch(() => ({}));
  if (!html || typeof html !== "string") {
    return NextResponse.json({ success: false, message: "Body must include { html: '<ol>...</ol>' }" }, { status: 400 });
  }

  const quill = olHtmlToQuill(html);

  const conn = await createDbConnection();
  try {
    await conn.query("UPDATE staged_articles SET `references`=? WHERE id=?", [quill, id]);
    return NextResponse.json({ success: true, staged_article_id: id, quill });
  } finally {
    await conn.end();
  }
}

// src/app/api/articles/stage/[id]/route.js
// export async function GET(req, context) {
//   const { params } = await context;   // ✅ await params
//   const id = params.id;

//   try {
//     const conn = await createDbConnection();

//     const [[st]] = await conn.query(
//       "SELECT * FROM staged_articles WHERE id=?",
//       [id]
//     );

//     if (!st) {
//       return Response.json({ success: false, message: "Not found" }, { status: 404 });
//     }

//     // ✅ Parse references stored as JSON or plain
//     let refs = [];
//     if (st.references) {
//       try {
//         refs = JSON.parse(st.references);
//       } catch {
//         refs = [st.references];
//       }
//     }

//     return Response.json({
//       success: true,
//       staged: st,
//       references: refs,
//       authors: [], // fallback since no authors table
//     });
//   } catch (err) {
//     console.error("❌ GET /api/articles/stage/[id]", err);
//     return Response.json(
//       { success: false, message: err.message },
//       { status: 500 }
//     );
//   }
// }
export async function GET(_req, context) {
  const { id } = await context.params;

  try {
    const conn = await createDbConnection();
    try {
      const [[st]] = await conn.query(
        "SELECT * FROM `staged_articles` WHERE `id`=?",
        [id]
      );
      if (!st) {
        return Response.json({ success: false, message: "Not found" }, { status: 404 });
      }
      return Response.json({
        success: true,
        staged: st,
        references: st.references || "", // raw HTML string
        authors: []                      // no table yet
      });
    } finally {
      await conn.end();
    }
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req, context) {
  // 🔑 await params from context
  const { id } = await context.params;

  try {
    const body = await req.json();
    const {
      title,
      keywords,
      pages_from,
      pages_to,
      received_date,
      revised_date,
      accepted_date,
      published_date,
      article_id,
      // This must be the CKEditor HTML string (innerHTML)
      references
    } = body;

    const conn = await createDbConnection();
    try {
      await conn.beginTransaction();

      // 🔒 Use placeholders and backtick the reserved column name
      const sql = `
        UPDATE \`staged_articles\`
        SET \`title\`=?, \`keywords\`=?, \`pages_from\`=?, \`pages_to\`=?,
            \`received_date\`=?, \`revised_date\`=?, \`accepted_date\`=?, \`published_date\`=?,
            \`article_id\`=?, \`references\`=?, \`status\`='reviewing', \`updated_at\`=CURRENT_TIMESTAMP
        WHERE \`id\`=?`;
      const vals = [
        title ?? null,
        keywords ?? null,
        pages_from ?? null,
        pages_to ?? null,
        received_date ?? null,
        revised_date ?? null,
        accepted_date ?? null,
        published_date ?? null,
        article_id ?? null,
        (typeof references === "string" ? references : "") ?? null, // save raw HTML
        id
      ];

      await conn.query(sql, vals);
      await conn.commit();
      return NextResponse.json({ success: true });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      await conn.end();
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, message: String(err?.message || err) },
      { status: 500 }
    );
  }
}