// import { NextResponse } from "next/server";
// import { parseForm } from "@/lib/parseForm";
// import { createDbConnection } from "@/lib/db";
// import path from "path";
// import fs from "fs";

// export const config = {
//   api: { bodyParser: false },
// };

// const toNull = (v) => {
//   if (v === undefined || v === null) return null;
//   const s = String(v).trim();
//   return s === "" ? null : s;
// };

// export async function POST(req) {
//   const conn = await createDbConnection();
//   try {
//     const { fields, files } = await parseForm(req);

//     const isEdit = !!fields.id;

//     const normalizeTitle = (s) =>
//   String(s || "")
//     .normalize("NFKC")        // Unicode-safe
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, " ");    // collapse whitespace

//     const {
//       id,
//       journal_id,
//       volume_id,
//       issue_id,
//       month_from,
//       month_to,
//       article_id,
//       doi,
//       article_title,
//       authors,
//       abstract,
//       keywords,
//       references,
//       received,
//       revised,
//       accepted,
//       published,
//       page_from,
//       page_to,
//       article_status,
//     } = fields;

//    // Normalize the title like the DB side will compare it
//    const titleNorm = String(article_title).trim().toLowerCase().replace(/\s+/g, " ");

//     // ─────────────────────────────────────────────────────────────
//     // 1) VALIDATION: Journal prefix + volume/issue pattern & match
//     // ─────────────────────────────────────────────────────────────
//     if (!journal_id || !volume_id || !issue_id || !article_id) {
//       return NextResponse.json(
//         { success: false, message: "journal_id, volume_id, issue_id and article_id are required." },
//         { status: 400 }
//       );
//     }

//     // expected journal prefix (e.g., DS-AIR -> AIR)
//     const [[jr]] = await conn.query(
//       "SELECT short_name FROM journals WHERE id = ? LIMIT 1",
//       [journal_id]
//     );
//     if (!jr) {
//       return NextResponse.json({ success: false, message: "Invalid journal_id." }, { status: 400 });
//     }
//     const expectedPrefix = (jr.short_name || "").replace(/^DS-/, "").trim().toUpperCase();

//     const idPrefix = String(article_id).split("-")[0]?.toUpperCase();
//     if (expectedPrefix !== idPrefix) {
//       return NextResponse.json(
//         { success: false, message: `Article ID must start with "${expectedPrefix}-" (got "${idPrefix}-").` },
//         { status: 400 }
//       );
//     }

//     // read volume/issue numbers
//     const [[volRow]] = await conn.query(
//       "SELECT volume_number FROM volumes WHERE id = ? LIMIT 1",
//       [volume_id]
//     );
//     const [[issRow]] = await conn.query(
//       "SELECT issue_number FROM issues WHERE id = ? LIMIT 1",
//       [issue_id]
//     );
//     if (!volRow || !issRow) {
//       return NextResponse.json(
//         { success: false, message: "Invalid volume_id or issue_id." },
//         { status: 400 }
//       );
//     }
//     const volNum = String(volRow.volume_number);
//     const issNum = String(issRow.issue_number);

//     // enforce -V<vol>I<issue> pattern in article_id
//     const m = String(article_id).match(/-V(\d+)I(\d+)/i);
//     if (!m) {
//       return NextResponse.json(
//         { success: false, message: 'Article ID must include volume/issue as "-V<vol>I<issue>" (e.g. AIR-V1I1P101).' },
//         { status: 400 }
//       );
//     }
//     const [, volInId, issInId] = m;
//     if (String(volInId) !== volNum || String(issInId) !== issNum) {
//       return NextResponse.json(
//         { success: false, message: `Article ID volume/issue must be V${volNum}I${issNum} (got V${volInId}I${issInId}).` },
//         { status: 400 }
//       );
//     }

//     // uniqueness check for article_id (do not clash with other rows)
//     const [dupes] = await conn.query(
//       "SELECT id FROM articles WHERE article_id = ? AND id <> ? LIMIT 1",
//       [article_id, isEdit ? id : 0]
//     );
//     if (dupes.length) {
//       return NextResponse.json(
//         { success: false, message: "Another article already uses this article_id." },
//         { status: 409 }
//       );
//     }

// // ─────────────────────────────────────────────────────────────
// // Duplicate TITLE within the same journal (case/space-insensitive)
// // ─────────────────────────────────────────────────────────────
// if (!article_title || !String(article_title).trim()) {
//   return NextResponse.json(
//     { success: false, message: "Title is required." },
//     { status: 400 }
//   );
// }



// const [titleDupes] = await conn.query(
//   `
//   SELECT id
//   FROM articles
//   WHERE journal_id = ?
//     AND REGEXP_REPLACE(LOWER(TRIM(article_title)), '\\\\s+', ' ') = ?
//     AND id <> ?
//   LIMIT 1
//   `,
//   [journal_id, titleNorm, isEdit ? id : 0]
// );

// if (titleDupes.length) {
//   return NextResponse.json(
//     { success: false, message: "An article with the same title already exists in this journal." },
//     { status: 409 }
//   );
// }

//     // ─────────────────────────────────────────────────────────────
//     // 2) Build/keep pdf_path (no overwrite on edit without upload)
//     // ─────────────────────────────────────────────────────────────
//     let pdfPath;
//     const uploaded = files?.pdf?.[0];

//     if (uploaded?.relativePath) {
//       // parseForm saved the file under /public/upload/... and returned relative web path
//       pdfPath = uploaded.relativePath.startsWith("/")
//         ? uploaded.relativePath
//         : `/${uploaded.relativePath}`;
//     } else if (isEdit) {
//       // keep existing pdf_path
//       const [[row]] = await conn.query(`SELECT pdf_path FROM articles WHERE id = ?`, [id]);
//       pdfPath = row?.pdf_path || null;
//     } else {
//       // create without upload → canonical fallback in SAME format
//       const prefix = idPrefix; // already validated against expectedPrefix
//       pdfPath = `/${path.posix.join(
//         "upload",
//         prefix,
//         `volume-${volNum}`,
//         `issue-${issNum}`,
//         `${article_id}.pdf`
//       )}`;
//     }

//     // ─────────────────────────────────────────────────────────────
//     // 3) Normalize arrays from comma-separated inputs
//     // ─────────────────────────────────────────────────────────────
//     const keywordArray =
//       typeof keywords === "string"
//         ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
//         : Array.isArray(keywords)
//           ? keywords.map((k) => k.trim()).filter(Boolean)
//           : [];

//     const authorArray =
//       typeof authors === "string"
//         ? authors.split(",").map((a) => a.trim()).filter(Boolean)
//         : Array.isArray(authors)
//           ? authors.map((a) => a.trim()).filter(Boolean)
//           : [];

//     const payload = {
//       journal_id: toNull(journal_id),
//       volume_id: toNull(volume_id),
//       issue_id: toNull(issue_id),
//       month_from: toNull(month_from),
//       month_to: toNull(month_to),
//       article_id: toNull(article_id),
//       doi: toNull(doi),
//       article_title: toNull(article_title),
//       page_from: toNull(page_from),
//       page_to: toNull(page_to),
//       authors: JSON.stringify(authorArray),
//       abstract: toNull(abstract),
//       keywords: JSON.stringify(keywordArray),
//       references: toNull(references),
//       received: toNull(received),
//       revised: toNull(revised),
//       accepted: toNull(accepted),
//       published: toNull(published),
//       pdf_path: toNull(pdfPath),
//       article_status: toNull(article_status),
//     };

//     // ─────────────────────────────────────────────────────────────
//     // 4) Insert / Update
//     // ─────────────────────────────────────────────────────────────
//     if (isEdit) {
// const sql = `
//   UPDATE articles SET
//     journal_id = ?, volume_id = ?, issue_id = ?,
//     month_from = ?, month_to = ?,
//     article_id = ?, doi = ?, article_title = ?, title_norm = ?,
//     page_from = ?, page_to = ?, authors = ?, abstract = ?, keywords = ?, \`references\` = ?,
//     received = ?, revised = ?, accepted = ?, published = ?,
//     pdf_path = ?, article_status = ?, updated_at = NOW()
//   WHERE id = ?
//   LIMIT 1
// `;

// const params = [
//   payload.journal_id, payload.volume_id, payload.issue_id,
//   payload.month_from, payload.month_to,
//   payload.article_id, payload.doi, payload.article_title,
//   titleNorm, // 👈 normalized title
//   payload.page_from, payload.page_to, payload.authors, payload.abstract, payload.keywords, payload.references,
//   payload.received, payload.revised, payload.accepted, payload.published,
//   payload.pdf_path, payload.article_status,
//   id,
// ];


//       const [result] = await conn.query(sql, params);
//       return NextResponse.json({
//         success: true,
//         message: "Article updated successfully",
//         affectedRows: result.affectedRows,
//       });
//     } else {
// const sql = `
//   INSERT INTO articles (
//     journal_id, volume_id, issue_id,
//     month_from, month_to,
//     article_id, doi, article_title, title_norm,
//     page_from, page_to, authors, abstract, keywords, \`references\`,
//     received, revised, accepted, published,
//     pdf_path, article_status, created_at, updated_at
//   )
//   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
// `;

// const params = [
//   payload.journal_id, payload.volume_id, payload.issue_id,
//   payload.month_from, payload.month_to,
//   payload.article_id, payload.doi, payload.article_title,
//   titleNorm, // 👈 normalized title
//   payload.page_from, payload.page_to, payload.authors, payload.abstract, payload.keywords, payload.references,
//   payload.received, payload.revised, payload.accepted, payload.published,
//   payload.pdf_path, payload.article_status,
// ];


//       const [result] = await conn.query(sql, params);
//       return NextResponse.json({
//         success: true,
//         message: "Article submitted successfully",
//         insertedId: result.insertId,
//       });
//     }
// } catch (e) {
//   if (e.code === 'ER_DUP_ENTRY') {
//     return NextResponse.json(
//       { success: false, message: "A title already exists in this journal." },
//       { status: 409 }
//     );
//   }
//   throw e;
// } finally {
//     await conn.end();
//   }
// }
// // GET /api/articles?journal_id=2
// // GET /api/articles?id=123 OR /api/articles?article_id=AIR-V11P103 OR /api/articles?journal_id=2
// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id");
//   const article_id = searchParams.get("article_id");
//   const journal_id = searchParams.get("journal_id");
//   const conn = await createDbConnection();
//   try {
//     if (id || article_id) {
//       const where = id ? "id = ?" : "article_id = ?";
//       const val = id ? Number(id) : article_id;

//       const [rows] = await conn.query(
//         `SELECT 
//            id, journal_id, volume_id, issue_id, month_from, month_to,
//            article_id, doi, article_title, page_from, page_to,
//            authors, abstract, keywords, \`references\`,
//            DATE_FORMAT(received,  '%Y-%m-%d') AS received,
//            DATE_FORMAT(revised,   '%Y-%m-%d') AS revised,
//            DATE_FORMAT(accepted,  '%Y-%m-%d') AS accepted,
//            DATE_FORMAT(published, '%Y-%m-%d') AS published,
//            pdf_path, article_status, created_at, updated_at
//          FROM articles
//          WHERE ${where}
//          LIMIT 1`,
//         [val]
//       );
//       if (!rows.length) {
//         return NextResponse.json({ success: false, message: "Article not found" }, { status: 404 });
//       }
//       return NextResponse.json({ success: true, article: rows[0] });
//     }

//     let sql = `SELECT * FROM articles`;
//     const params = [];
//     if (journal_id) { sql += ` WHERE journal_id = ?`; params.push(journal_id); }
//     const [rows] = await conn.query(sql, params);
//     return NextResponse.json({ success: true, articles: rows });
//   } finally {
//     await conn.end();
//   }
// }

// export async function DELETE(req) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id");

//   if (!id) {
//     return NextResponse.json({ success: false, error: "Article ID is required" }, { status: 400 });
//   }

//   const conn = await createDbConnection();
//   try {
//     const [[article]] = await conn.query("SELECT pdf_path FROM articles WHERE id = ?", [id]);
//     if (article?.pdf_path) {
//       const localPath = path.join(process.cwd(), "public", article.pdf_path);
//       if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
//     }

//     await conn.query("DELETE FROM articles WHERE id = ?", [id]);
//     return NextResponse.json({ success: true, message: "Article deleted" });
//   } catch (err) {
//     console.error("DELETE /api/articles error:", err);
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   } finally {
//     await conn.end();
//   }
// }

import { NextResponse } from "next/server";
import { parseForm } from "@/lib/parseForm";
import { createDbConnection } from "@/lib/db";
import path from "path";
import fs from "fs";

export const config = { api: { bodyParser: false } };

const toNull = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};

const normalizeTitle = (s) =>
  String(s || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export async function POST(req) {
  const conn = await createDbConnection();
  try {
    const { fields, files } = await parseForm(req);
    const isEdit = !!fields.id;

    const {
      id,
      journal_id,
      volume_id,
      issue_id,
      month_from,
      month_to,
      article_id,
      doi,
      article_title,
      authors,
      abstract,
      keywords,
      references, // CKEditor HTML (preserve as-is)
      received,
      revised,
      accepted,
      published,
      page_from,
      page_to,
      article_status,
    } = fields;

    const titleNorm = normalizeTitle(article_title);

    // ── Validation
    if (!journal_id || !volume_id || !issue_id || !article_id) {
      return NextResponse.json(
        { success: false, message: "journal_id, volume_id, issue_id and article_id are required." },
        { status: 400 }
      );
    }

    // journal prefix (e.g., DS-AIR -> AIR)
    const [[jr]] = await conn.query("SELECT short_name FROM journals WHERE id = ? LIMIT 1", [journal_id]);
    if (!jr) return NextResponse.json({ success: false, message: "Invalid journal_id." }, { status: 400 });

    const expectedPrefix = (jr.short_name || "").replace(/^DS-/, "").trim().toUpperCase();
    const idPrefix = String(article_id).split("-")[0]?.toUpperCase();
    if (expectedPrefix !== idPrefix) {
      return NextResponse.json(
        { success: false, message: `Article ID must start with "${expectedPrefix}-" (got "${idPrefix}-").` },
        { status: 400 }
      );
    }

    // volume / issue numbers
    const [[volRow]] = await conn.query("SELECT volume_number FROM volumes WHERE id = ? LIMIT 1", [volume_id]);
    const [[issRow]] = await conn.query("SELECT issue_number FROM issues WHERE id = ? LIMIT 1", [issue_id]);
    if (!volRow || !issRow) {
      return NextResponse.json(
        { success: false, message: "Invalid volume_id or issue_id." },
        { status: 400 }
      );
    }
    const volNum = String(volRow.volume_number);
    const issNum = String(issRow.issue_number);

    // enforce -V<vol>I<issue> in article_id
    const m = String(article_id).match(/-V(\d+)I(\d+)/i);
    if (!m) {
      return NextResponse.json(
        { success: false, message: 'Article ID must include "-V<vol>I<issue>" (e.g. AIR-V1I1P101).' },
        { status: 400 }
      );
    }
    const [, volInId, issInId] = m;
    if (String(volInId) !== volNum || String(issInId) !== issNum) {
      return NextResponse.json(
        { success: false, message: `Article ID volume/issue must be V${volNum}I${issNum} (got V${volInId}I${issInId}).` },
        { status: 400 }
      );
    }

    // unique article_id (except self)
    const [dupes] = await conn.query(
      "SELECT id FROM articles WHERE article_id = ? AND id <> ? LIMIT 1",
      [article_id, isEdit ? id : 0]
    );
    if (dupes.length) {
      return NextResponse.json(
        { success: false, message: "Another article already uses this article_id." },
        { status: 409 }
      );
    }

    // title required + unique (using generated column title_norm)
    if (!article_title || !String(article_title).trim()) {
      return NextResponse.json({ success: false, message: "Title is required." }, { status: 400 });
    }
    const [titleDupes] = await conn.query(
      `SELECT id FROM articles WHERE journal_id = ? AND title_norm = ? AND id <> ? LIMIT 1`,
      [journal_id, titleNorm, isEdit ? id : 0]
    );
    if (titleDupes.length) {
      return NextResponse.json(
        { success: false, message: "An article with the same title already exists in this journal." },
        { status: 409 }
      );
    }

    // ── PDF path
    let pdfPath;
    const uploaded = files?.pdf?.[0];

    if (uploaded?.relativePath) {
      pdfPath = uploaded.relativePath.startsWith("/") ? uploaded.relativePath : `/${uploaded.relativePath}`;
    } else if (isEdit) {
      const [[row]] = await conn.query(`SELECT pdf_path FROM articles WHERE id = ?`, [id]);
      pdfPath = row?.pdf_path || null;
    } else {
      const prefix = idPrefix;
      pdfPath = `/${path.posix.join("upload", prefix, `volume-${volNum}`, `issue-${issNum}`, `${article_id}.pdf`)}`;
    }

    // ── Normalize arrays
    const keywordArray =
      typeof keywords === "string"
        ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : Array.isArray(keywords)
        ? keywords.map((k) => k.trim()).filter(Boolean)
        : [];

    const authorArray =
      typeof authors === "string"
        ? authors.split(",").map((a) => a.trim()).filter(Boolean)
        : Array.isArray(authors)
        ? authors.map((a) => a.trim()).filter(Boolean)
        : [];

    const payload = {
      journal_id: toNull(journal_id),
      volume_id: toNull(volume_id),
      issue_id: toNull(issue_id),
      month_from: toNull(month_from),
      month_to: toNull(month_to),
      article_id: toNull(article_id),
      doi: toNull(doi),
      article_title: toNull(article_title),
      page_from: toNull(page_from),
      page_to: toNull(page_to),
      authors: JSON.stringify(authorArray),
      abstract: toNull(abstract),
      keywords: JSON.stringify(keywordArray),
      // ⬇️ Preserve CKEditor HTML (do NOT trim/sanitize here)
      references: references === undefined ? null : String(references),
      received: toNull(received),
      revised: toNull(revised),
      accepted: toNull(accepted),
      published: toNull(published),
      pdf_path: toNull(pdfPath),
      article_status: toNull(article_status),
    };

    // ── Insert / Update
    if (isEdit) {
      const sql = `
        UPDATE articles SET
          journal_id = ?, volume_id = ?, issue_id = ?,
          month_from = ?, month_to = ?,
          article_id = ?, doi = ?, article_title = ?,
          page_from = ?, page_to = ?, authors = ?, abstract = ?, keywords = ?, \`references\` = ?,
          received = ?, revised = ?, accepted = ?, published = ?,
          pdf_path = ?, article_status = ?, updated_at = NOW()
        WHERE id = ?
        LIMIT 1
      `;
      const params = [
        payload.journal_id, payload.volume_id, payload.issue_id,
        payload.month_from, payload.month_to,
        payload.article_id, payload.doi, payload.article_title,
        payload.page_from, payload.page_to, payload.authors, payload.abstract, payload.keywords, payload.references,
        payload.received, payload.revised, payload.accepted, payload.published,
        payload.pdf_path, payload.article_status,
        id,
      ];
      const [result] = await conn.query(sql, params);
      return NextResponse.json({ success: true, message: "Article updated successfully", affectedRows: result.affectedRows });
    } else {
      const sql = `
        INSERT INTO articles (
          journal_id, volume_id, issue_id,
          month_from, month_to,
          article_id, doi, article_title,
          page_from, page_to, authors, abstract, keywords, \`references\`,
          received, revised, accepted, published,
          pdf_path, article_status, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      const params = [
        payload.journal_id, payload.volume_id, payload.issue_id,
        payload.month_from, payload.month_to,
        payload.article_id, payload.doi, payload.article_title,
        payload.page_from, payload.page_to, payload.authors, payload.abstract, payload.keywords, payload.references,
        payload.received, payload.revised, payload.accepted, payload.published,
        payload.pdf_path, payload.article_status,
      ];
      const [result] = await conn.query(sql, params);
      return NextResponse.json({ success: true, message: "Article submitted successfully", insertedId: result.insertId });
    }
  } catch (e) {
    console.error("POST /api/articles error:", e);
    return NextResponse.json(
      { success: false, message: "Failed to save article", error: e.sqlMessage ?? e.message ?? "Unknown error" },
      { status: 500 }
    );
  } finally {
    await conn.end();
  }
}

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id");
//   const article_id = searchParams.get("article_id");
//   const journal_id = searchParams.get("journal_id");
//   const conn = await createDbConnection();

//   try {
//     if (id || article_id) {
//       const where = id ? "id = ?" : "article_id = ?";
//       const val = id ? Number(id) : article_id;

//       const [rows] = await conn.query(
//         `SELECT 
//            id, journal_id, volume_id, issue_id, month_from, month_to,
//            article_id, doi, article_title, page_from, page_to,
//            authors, abstract, keywords, \`references\`,
//            DATE_FORMAT(received,  '%Y-%m-%d') AS received,
//            DATE_FORMAT(revised,   '%Y-%m-%d') AS revised,
//            DATE_FORMAT(accepted,  '%Y-%m-%d') AS accepted,
//            DATE_FORMAT(published, '%Y-%m-%d') AS published,
//            pdf_path, article_status, created_at, updated_at
//          FROM articles
//          WHERE ${where}
//          LIMIT 1`,
//         [val]
//       );
//       if (!rows.length) return NextResponse.json({ success: false, message: "Article not found" }, { status: 404 });
//       return NextResponse.json({ success: true, article: rows[0] });
//     }

//     let sql = `SELECT * FROM articles`;
//     const params = [];
//     if (journal_id) {
//       sql += ` WHERE journal_id = ?`;
//       params.push(journal_id);
//     }
//     const [rows] = await conn.query(sql, params);
//     return NextResponse.json({ success: true, articles: rows });
//   } catch (e) {
//     console.error("GET /api/articles error:", e);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch articles", error: e.sqlMessage ?? e.message },
//       { status: 500 }
//     );
//   } finally {
//     await conn.end();
//   }
// }

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const article_id = searchParams.get("article_id");
  const journal_id = searchParams.get("journal_id");
  const conn = await createDbConnection();

  try {
    // 👉 Single article fetch
    if (id || article_id) {
      const where = id ? "a.id = ?" : "a.article_id = ?";
      const val = id ? Number(id) : article_id;

      const [rows] = await conn.query(
        `SELECT 
           a.id, a.journal_id, a.volume_id, a.issue_id, a.month_from, a.month_to,
           a.article_id, a.doi, a.article_title, a.page_from, a.page_to,
           a.authors, a.abstract, a.keywords, a.\`references\`,
           DATE_FORMAT(a.received,  '%Y-%m-%d') AS received,
           DATE_FORMAT(a.revised,   '%Y-%m-%d') AS revised,
           DATE_FORMAT(a.accepted,  '%Y-%m-%d') AS accepted,
           DATE_FORMAT(a.published, '%Y-%m-%d') AS published,
           a.pdf_path, a.article_status, a.created_at, a.updated_at,
           v.volume_number, v.volume_label, v.year   -- 👈 year from volumes
         FROM articles a
         LEFT JOIN volumes v ON a.volume_id = v.id
         WHERE ${where}
         LIMIT 1`,
        [val]
      );

      if (!rows.length) {
        return NextResponse.json(
          { success: false, message: "Article not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, article: rows[0] });
    }

    // 👉 Multiple articles fetch
    let sql = `
      SELECT 
        a.id, a.journal_id, a.volume_id, a.issue_id, a.month_from, a.month_to,
        a.article_id, a.doi, a.article_title, a.page_from, a.page_to,
        a.authors, a.abstract, a.keywords, a.\`references\`,
        DATE_FORMAT(a.received,  '%Y-%m-%d') AS received,
        DATE_FORMAT(a.revised,   '%Y-%m-%d') AS revised,
        DATE_FORMAT(a.accepted,  '%Y-%m-%d') AS accepted,
        DATE_FORMAT(a.published, '%Y-%m-%d') AS published,
        a.pdf_path, a.article_status, a.created_at, a.updated_at,
        v.volume_number, v.volume_label, v.year   -- 👈 year from volumes
      FROM articles a
      LEFT JOIN volumes v ON a.volume_id = v.id
    `;

    const params = [];
    if (journal_id) {
      sql += ` WHERE a.journal_id = ?`;
      params.push(journal_id);
    }

    const [rows] = await conn.query(sql, params);
    return NextResponse.json({ success: true, articles: rows });
  } catch (e) {
    console.error("GET /api/articles error:", e);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch articles",
        error: e.sqlMessage ?? e.message,
      },
      { status: 500 }
    );
  } finally {
    await conn.end();
  }
}



export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "Article ID is required" }, { status: 400 });

  const conn = await createDbConnection();
  try {
    const [[article]] = await conn.query("SELECT pdf_path FROM articles WHERE id = ?", [id]);
    if (article?.pdf_path) {
      const localPath = path.join(process.cwd(), "public", article.pdf_path);
      try {
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      } catch (fileErr) {
        console.warn("PDF delete warning:", fileErr?.message);
      }
    }

    await conn.query("DELETE FROM articles WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Article deleted" });
  } catch (err) {
    console.error("DELETE /api/articles error:", err);
    return NextResponse.json(
      { success: false, error: err.sqlMessage ?? err.message ?? "Unknown error" },
      { status: 500 }
    );
  } finally {
    await conn.end();
  }
}
