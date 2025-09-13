// /api/articles/stage/[id]
import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";
import { refsArrayToQuill } from "@/lib/refsQuill.js";
import { olHtmlToQuill } from "@/lib/refsQuill";
import { getAllowedKeys } from "@/lib/refLinks-allowed.js";

export const dynamic = "force-dynamic";

// put near your other utils in each route file
const refsArrayToHtml = (arr = []) => {
  const items = (arr || [])
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .map((s) => s.replace(/^\[\d+\]\s*/, "")) // strip leading [1], [2], ...
    .map((s) => `<li>${s}</li>`)
    .join("");
  return items ? `<ol class="references">${items}</ol>` : null;
};

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

export async function GET(_req, { params }) {
  try {
    const id = params.id;
    const conn = await createDbConnection();
    try {
      const [[st]] = await conn.query("SELECT * FROM staged_articles WHERE id=?", [id]);
      if (!st) return NextResponse.json({ success:false, message:"Not found" }, { status:404 });

      let authors = [], references = [];
      try {
        [authors] = await conn.query(
          "SELECT author_order, full_name FROM staged_article_authors WHERE staged_article_id=? ORDER BY author_order",
          [id]
        );
      } catch {}
      try {
        [references] = await conn.query(
          "SELECT ref_order, raw_citation FROM staged_article_references WHERE staged_article_id=? ORDER BY ref_order",
          [id]
        );
      } catch {}

      return NextResponse.json({ success:true, staged: st, authors, references });
    } finally { await conn.end(); }
  } catch (e) {
    return NextResponse.json({ success:false, message:String(e?.message||e) }, { status:500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const id = params.id;
    const body = await req.json();
   
    const {
      title, keywords, pages_from, pages_to,
      received_date, revised_date, accepted_date, published_date,
      article_id, authors = [], references = []
    } = body;

    // const referencesHtml = refsArrayToHtml(references); // ⭐ build the one-field HTML
const [[st]] = await conn.query("SELECT journal_id FROM staged_articles WHERE id=?", [id]);
const allowedKeys = await getAllowedKeys(conn, st?.journal_id ?? null);
const labelMap    = await getLabelMap(conn);
    //  const referencesHtml = refsArrayToQuill(references, allowedKeys);
    const referencesHtml = refsArrayToQuillPresentOnly(references, allowedKeys, labelMap);

    const conn = await createDbConnection();
    try {
      await conn.beginTransaction();

      // dynamic column check ...
      const [colsRows] = await conn.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staged_articles'`
      );
      const existing = new Set(colsRows.map(r => r.COLUMN_NAME));

      const up = {
        title, keywords, pages_from, pages_to,
        received_date, revised_date, accepted_date, published_date,
        article_id,
        status: "reviewing",
        // ⭐ include HTML into the single 'references' TEXT field (if column exists)
        references: referencesHtml || null,
      };

      const setters = [];
      const vals = [];
      for (const [k, v] of Object.entries(up)) {
        if (!existing.has(k)) continue;
        setters.push(`${k} = ?`);
        vals.push(v ?? null);
      }
      if (setters.length) {
        const sql = `UPDATE staged_articles SET ${setters.join(", ")}, updated_at=NOW() WHERE id=?`;
        vals.push(id);
        await conn.query(sql, vals);
      }

      // keep replacing rows in staged_article_references (as you already do)
      try {
        await conn.query("DELETE FROM staged_article_references WHERE staged_article_id=?", [id]);
        if (references.length) {
          const arr = references.map((r, i) => [id, i + 1, typeof r === "string" ? r : r.raw_citation]);
          await conn.query(
            "INSERT INTO staged_article_references (staged_article_id, ref_order, raw_citation) VALUES ?",
            [arr]
          );
        }
      } catch (e) { if (e?.code !== "ER_NO_SUCH_TABLE") throw e; }

      await conn.commit();
      return NextResponse.json({ success: true });
    } catch (e) {
      await conn.rollback(); throw e;
    } finally { await conn.end(); }
  } catch (e) {
    return NextResponse.json({ success:false, message:String(e?.message||e) }, { status:500 });
  }
}
