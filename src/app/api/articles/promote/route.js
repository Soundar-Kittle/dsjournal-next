// Promote one verified staged row into your EXISTING `articles` table (no schema change)
import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";

export const dynamic = "force-dynamic";

const cleanName = (s="") => s.replace(/\b\d+[*]?\b/g,"").replace(/\s+/g," ").trim();
const toJsonArr = v => Array.isArray(v) ? JSON.stringify(v)
  : JSON.stringify(String(v||"").split(/[;,]/).map(s=>s.trim()).filter(Boolean));

async function nextSeq(conn, volume_id, issue_id) {
  const [[mx]] = await conn.query(
    `SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(article_id,'P',-1) AS UNSIGNED)),0) AS max_seq
     FROM articles WHERE volume_id=? AND issue_id=? AND article_id REGEXP 'P[0-9]+$'`,
    [volume_id, issue_id]
  );
  return (mx?.max_seq || 0) + 1;
}
async function ensureUnique(conn, candidate, volume_id, issue_id) {
  const m = candidate.match(/^(.*P)(\d{1,})$/i);
  if (!m) {
    const [[row]] = await conn.query(
      `SELECT id FROM articles WHERE volume_id=? AND issue_id=? AND article_id=? LIMIT 1`,
      [volume_id, issue_id, candidate]
    );
    return row ? `${candidate}-DUP` : candidate;
  }
  let prefix = m[1], n = parseInt(m[2],10);
  while (true) {
    const id = `${prefix}${String(n).padStart(3,"0")}`;
    const [[row]] = await conn.query(
      `SELECT id FROM articles WHERE volume_id=? AND issue_id=? AND article_id=? LIMIT 1`,
      [volume_id, issue_id, id]
    );
    if (!row) return id;
    n++;
  }
}
function fallbackId({ staged, journal_short="ART", volume_id, issue_id, seq }) {
  if (staged.article_id?.trim()) return staged.article_id.trim();
  if (staged.doi?.includes("/")) return staged.doi.split("/").pop();
  return `${journal_short}-V${volume_id}I${issue_id}P${String(seq).padStart(3,"0")}`;
}

export async function POST(req) {
  try {
    const {
      staged_article_id,
      journal_id, volume_id, issue_id,
      month_from, month_to,
      page_from, page_to,
      pdf_path = null,
      article_status = "unpublished",
      journal_short
    } = await req.json();

    if (!staged_article_id || !volume_id || !issue_id) {
      return NextResponse.json(
        { success:false, message:"staged_article_id, volume_id and issue_id are required" },
        { status:400 }
      );
    }

    const conn = await createDbConnection();
    try {
      await conn.beginTransaction();

      const [[st]] = await conn.query(`SELECT * FROM staged_articles WHERE id=? FOR UPDATE`, [staged_article_id]);
      if (!st) { await conn.rollback(); return NextResponse.json({ success:false, message:"Staged article not found" }, { status:404 }); }

      const JID = Number(journal_id ?? st.journal_id);

      // Validate volume & issue belong to this journal
      const [[vol]] = await conn.query(`SELECT id, journal_id FROM volumes WHERE id=?`, [volume_id]);
      if (!vol || vol.journal_id !== JID) {
        await conn.rollback();
        return NextResponse.json({ success:false, message:`Volume ${volume_id} not found for journal_id=${JID}` }, { status:400 });
      }
      const [[iss]] = await conn.query(`SELECT id, journal_id FROM issues WHERE id=?`, [issue_id]);
      if (!iss || iss.journal_id !== JID) {
        await conn.rollback();
        return NextResponse.json({ success:false, message:`Issue ${issue_id} not found for journal_id=${JID}` }, { status:400 });
      }

      const [sauth] = await conn.query(
        `SELECT author_order, full_name FROM staged_article_authors WHERE staged_article_id=? ORDER BY author_order`,
        [staged_article_id]
      );
      const [srefs] = await conn.query(
        `SELECT ref_order, raw_citation FROM staged_article_references WHERE staged_article_id=? ORDER BY ref_order`,
        [staged_article_id]
      );

      const authorsJSON = JSON.stringify(sauth.map(a => cleanName(a.full_name)));
      const keywordsJSON = toJsonArr(st.keywords);
      const refsText = srefs.map(r => r.raw_citation?.trim()).filter(Boolean).join("\n");
      const finalYear = st.year || (st.published_date ? new Date(st.published_date).getFullYear() : null);

      // article_id
      const seq = await nextSeq(conn, volume_id, issue_id);
      const candidate = fallbackId({ staged: st, journal_short, volume_id, issue_id, seq });
      const article_id_val = await ensureUnique(conn, candidate, volume_id, issue_id);

      const [ins] = await conn.query(
        `INSERT INTO articles
         (journal_id, volume_id, issue_id, month_from, month_to, year,
          article_id, doi, article_title, page_from, page_to, authors,
          abstract, keywords, references, received, revised, accepted, published,
          pdf_path, article_status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          JID, volume_id, issue_id,
          month_from ?? st.month_from, month_to ?? st.month_to, finalYear,
          article_id_val, st.doi ?? null, st.title ?? null,
          page_from ?? st.pages_from ?? null, page_to ?? st.pages_to ?? null,
          authorsJSON, st.abstract ?? null, keywordsJSON, refsText || null,
          st.received_date || null, st.revised_date || null, st.accepted_date || null, st.published_date || null,
          pdf_path, article_status
        ]
      );

      await conn.query(`UPDATE staged_articles SET status='approved' WHERE id=?`, [staged_article_id]);
      await conn.commit();

      return NextResponse.json({ success:true, article_id_pk: ins.insertId, article_id: article_id_val });
    } catch (e) {
      await conn.rollback(); throw e;
    } finally {
      await conn.end();
    }
  } catch (err) {
    return NextResponse.json({ success:false, message:"Promotion failed", error:String(err?.message || err) }, { status:500 });
  }
}
