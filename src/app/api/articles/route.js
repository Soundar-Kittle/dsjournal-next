// import { NextResponse } from "next/server";
// import { parseForm } from "@/lib/parseForm";
// import { createDbConnection } from "@/lib/db";
// import path from "path";
// import fs from "fs";

// export const config = { api: { bodyParser: false } };

// const toNull = (v) => {
//   if (v === undefined || v === null) return null;
//   const s = String(v).trim();
//   return s === "" ? null : s;
// };

// const normalizeTitle = (s) =>
//   String(s || "")
//     .normalize("NFKC")
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, " ");

// // ────────────────────────────────
// // POST  →  Create Article
// // ────────────────────────────────
// export async function POST(req) {
//   const conn = await createDbConnection();
//   try {
//     const { fields, files } = await parseForm(req);
//     const idNum = fields.id ? Number(fields.id) : 0;
//     const isEdit = idNum > 0;

//     const {
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

//     const titleNorm = normalizeTitle(article_title);

//     // ── Required checks
//     if (!journal_id || !volume_id || !issue_id || !article_id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "journal_id, volume_id, issue_id and article_id are required.",
//         },
//         { status: 400 }
//       );
//     }

//     // ── Journal prefix validation (updated)
//     const [[jr]] = await conn.query(
//       "SELECT short_name FROM journals WHERE id = ? LIMIT 1",
//       [journal_id]
//     );
//     if (!jr)
//       return NextResponse.json(
//         { success: false, message: "Invalid journal_id." },
//         { status: 400 }
//       );

//     // No DS- stripping; direct match

// // ── Journal prefix validation (strict per journal short_name, strip "DS-" if exists)
// let expectedPrefix = (jr.short_name || "").trim().toUpperCase();

// // 🩵 Remove leading "DS-" if present
// if (expectedPrefix.startsWith("DS-")) {
//   expectedPrefix = expectedPrefix.replace(/^DS-/, "");
// }

// const articleIdUpper = String(article_id).trim().toUpperCase();

// // ✅ Require strict prefix like DST-V4I3P103 or LLL-V4I3P103 etc.
// const validPrefixPattern = new RegExp(`^${expectedPrefix}-V\\d+I\\d+P\\d+$`, "i");

// if (!validPrefixPattern.test(articleIdUpper)) {
//   return NextResponse.json(
//     {
//       success: false,
//       message: `Article ID must strictly follow "${expectedPrefix}-V<volume>I<issue>P<serial>", e.g. "${expectedPrefix}-V4I3P103".`,
//     },
//     { status: 400 }
//   );
// }

//     // ── Volume / Issue consistency
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

//     const m = String(article_id).match(/-V(\d+)I(\d+)/i);
//     if (!m) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             'Article ID must include "-V<vol>I<issue>" (e.g. DST-V4I3P103).',
//         },
//         { status: 400 }
//       );
//     }
//     const [, volInId, issInId] = m;
//     if (String(volInId) !== volNum || String(issInId) !== issNum) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: `Article ID volume/issue must be V${volNum}I${issNum} (got V${volInId}I${issInId}).`,
//         },
//         { status: 400 }
//       );
//     }

//     // ── Uniqueness
//     const [dupes] = await conn.query(
//       "SELECT id FROM articles WHERE article_id = ? AND id <> ? LIMIT 1",
//       [article_id, idNum]
//     );
//     if (dupes.length) {
//       return NextResponse.json(
//         { success: false, message: "Another article already uses this article_id." },
//         { status: 409 }
//       );
//     }

//     if (!article_title || !String(article_title).trim()) {
//       return NextResponse.json(
//         { success: false, message: "Title is required." },
//         { status: 400 }
//       );
//     }

//     const [titleDupes] = await conn.query(
//       `SELECT id FROM articles WHERE journal_id = ? AND title_norm = ? AND id <> ? LIMIT 1`,
//       [journal_id, titleNorm, idNum]
//     );
//     if (titleDupes.length) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "An article with the same title already exists in this journal.",
//         },
//         { status: 409 }
//       );
//     }

//     if (doi && String(doi).trim()) {
//       const [doiDupes] = await conn.query(
//         `SELECT id FROM articles WHERE doi = ? AND id <> ? LIMIT 1`,
//         [doi, idNum]
//       );
//       if (doiDupes.length) {
//         return NextResponse.json(
//           { success: false, message: "Another article already uses this DOI." },
//           { status: 409 }
//         );
//       }
//     }

//     // ── PDF path
//     let pdfPath;
//     const uploaded = files?.pdf?.[0];
//     if (uploaded?.relativePath) {
//       pdfPath = uploaded.relativePath.startsWith("/")
//         ? uploaded.relativePath
//         : `/${uploaded.relativePath}`;
//     } else if (isEdit) {
//       const [[row]] = await conn.query(
//         `SELECT pdf_path FROM articles WHERE id = ?`,
//         [idNum]
//       );
//       pdfPath = row?.pdf_path || null;
//     } else {
//       const prefix = idPrefix;
//       pdfPath = `/${path.posix.join(
//         "upload",
//         prefix,
//         `volume-${volNum}`,
//         `issue-${issNum}`,
//         `${article_id}.pdf`
//       )}`;
//     }

//     if (pdfPath) {
//       const [pdfDupes] = await conn.query(
//         `SELECT id FROM articles WHERE pdf_path = ? AND id <> ? LIMIT 1`,
//         [pdfPath, idNum]
//       );
//       if (pdfDupes.length) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Another article already uses the same PDF file.",
//           },
//           { status: 409 }
//         );
//       }
//     }

//     // ── Normalize arrays
//     const keywordArray =
//       typeof keywords === "string"
//         ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
//         : Array.isArray(keywords)
//         ? keywords.map((k) => k.trim()).filter(Boolean)
//         : [];

//     const authorArray =
//       typeof authors === "string"
//         ? authors.split(",").map((a) => a.trim()).filter(Boolean)
//         : Array.isArray(authors)
//         ? authors.map((a) => a.trim()).filter(Boolean)
//         : [];

//     // ── Payload (null-safe)
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
//       abstract:
//         abstract && String(abstract).trim() !== "" ? String(abstract) : null,
//       keywords: JSON.stringify(keywordArray),
//       references:
//         references && String(references).trim() !== ""
//           ? String(references)
//           : null,
//       received: toNull(received),
//       revised: toNull(revised),
//       accepted: toNull(accepted),
//       published: toNull(published),
//       pdf_path: toNull(pdfPath),
//       article_status: toNull(article_status),
//     };

//     // ── Insert
//     const sql = `
//       INSERT INTO articles (
//         journal_id, volume_id, issue_id,
//         month_from, month_to,
//         article_id, doi, article_title,
//         page_from, page_to, authors, abstract, keywords, \`references\`,
//         received, revised, accepted, published,
//         pdf_path, article_status, created_at, updated_at
//       )
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
//     `;

//     const params = [
//       payload.journal_id,
//       payload.volume_id,
//       payload.issue_id,
//       payload.month_from,
//       payload.month_to,
//       payload.article_id,
//       payload.doi,
//       payload.article_title,
//       payload.page_from,
//       payload.page_to,
//       payload.authors,
//       payload.abstract,
//       payload.keywords,
//       payload.references,
//       payload.received,
//       payload.revised,
//       payload.accepted,
//       payload.published,
//       payload.pdf_path,
//       payload.article_status,
//     ];

//     const [result] = await conn.query(sql, params);
//     return NextResponse.json({
//       success: true,
//       message: "Article submitted successfully",
//       insertedId: result.insertId,
//     });
//   } catch (e) {
//     // 🔍 improved dev logging
//     console.error("POST /api/articles error:", e);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to save article",
//         sqlError: e.sqlMessage,
//         sqlCode: e.code,
//         stack: process.env.NODE_ENV === "development" ? e.stack : undefined,
//       },
//       { status: 500 }
//     );
//   } finally {
//     await conn.end();
//   }
// }

// // ==========================================================
// // PUT — Update article + manage PDF file
// // ==========================================================
// export async function PUT(req) {
//   const connection = await createDbConnection();
//   try {
//     const formData = await req.formData();
//     const id = formData.get("id");
//     if (!id)
//       return NextResponse.json({ success: false, message: "Article ID required" }, { status: 400 });

//     // --- collect form fields ---
//     const updates = {};
// // --- update query dynamically ---
// for (const [k, v] of formData.entries()) {
//   if (["pdf", "remove_pdf"].includes(k)) continue;

//   // Wrap keywords/authors as JSON if plain text
//   if (["keywords", "authors"].includes(k)) {
//     try {
//       JSON.parse(v);
//       updates[k] = v; // already JSON
//     } catch {
//       updates[k] = JSON.stringify(v);
//     }
//   } else {
//     updates[k] = v;
//   }
// }

//     // --- fetch existing article ---
//     const [rows] = await connection.query(`SELECT pdf_path FROM articles WHERE id = ?`, [id]);
//     const existing = rows[0] || {};
//     const oldPath =
//       existing.pdf_path && existing.pdf_path.trim() !== ""
//         ? path.join(process.cwd(), "public", existing.pdf_path.replace(/^\/+/, ""))
//         : null;

//     // --- define upload folder ---
//     const uploadDir = path.join(process.cwd(), "public", "uploads", "articles");
//     await fs.promises.mkdir(uploadDir, { recursive: true });

//     // ==========================================================
//     // CASE 1️⃣: New file uploaded (same or different name)
//     // ==========================================================
//     const newFile = formData.get("pdf");
//     if (newFile && newFile.size > 0) {
//       const newName = newFile.name; // keep original filename
//       const newFullPath = path.join(uploadDir, newName);

//       // 🧹 Remove old file if exists (even if same name)
//       if (oldPath && fs.existsSync(oldPath)) {
//         try {
//           await fs.promises.unlink(oldPath);
//           console.log("🗑️ Deleted old file:", oldPath);
//         } catch (err) {
//           console.warn("⚠️ Failed to delete old file:", err.message);
//         }
//       }

//       // 💾 Save new file (overwrite safe)
//       const buffer = Buffer.from(await newFile.arrayBuffer());
//       await writeFile(newFullPath, buffer);
//       console.log("✅ Saved new file:", newFullPath);

//       updates.pdf_path = `/uploads/articles/${newName}`;
//     }

//     // ==========================================================
//     // CASE 2️⃣: File explicitly removed (remove_pdf flag)
//     // ==========================================================
//     const removeFlag = formData.get("remove_pdf");
//     if (removeFlag === "1" && oldPath && fs.existsSync(oldPath)) {
//       try {
//         await fs.promises.unlink(oldPath);
//         console.log("🗑️ Removed PDF manually:", oldPath);
//       } catch (err) {
//         console.warn("⚠️ Failed to remove old file:", err.message);
//       }
//       updates.pdf_path = "";
//     }

//     // ==========================================================
//     // CASE 3️⃣: No new file + no removal → keep current file
//     // ==========================================================
//     if (!newFile && removeFlag !== "1") {
//       delete updates.pdf_path;
//     }

//     // --- update query dynamically ---
// const fields = Object.keys(updates)
//   .map((k) => {
//     const safeKey = k === "references" ? "`references`" : k;
//     return `${safeKey} = ?`;
//   })
//   .join(", ");
//   const values = Object.values(updates);

//     await connection.query(`UPDATE articles SET ${fields}, updated_at = NOW() WHERE id = ?`, [
//       ...values,
//       id,
//     ]);

//     return NextResponse.json({
//       success: true,
//       message: newFile
//         ? "✅ Article updated and file replaced."
//         : removeFlag === "1"
//         ? "✅ Article updated and file removed."
//         : "✅ Article updated successfully.",
//     });
//   } catch (err) {
//     console.error("❌ PUT /articles error:", err);
//     return NextResponse.json(
//       { success: false, message: err.message || "Error updating article" },
//       { status: 500 }
//     );
//   } finally {
//     await connection.end();
//   }
// }
// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id");
//   const article_id = searchParams.get("article_id");
//   const journal_id = searchParams.get("journal_id");
//   const checkTitle = searchParams.get("checkTitle");
//   const title = searchParams.get("title");

//   // new filters
//   const query = searchParams.get("query")?.toLowerCase() || "";
//   const volume = searchParams.get("volume");
//   const issue = searchParams.get("issue");
//   const year = searchParams.get("year");

//   const page = parseInt(searchParams.get("page") || "1", 10);
//   const limit = parseInt(searchParams.get("limit") || "0", 10); // 0 = no pagination

//   const conn = await createDbConnection();

//   try {
//     // ✅ title duplicate check
//     if (checkTitle && journal_id && title) {
//       const [rows] = await conn.query(
//         `SELECT id
//          FROM articles
//          WHERE journal_id = ?
//          AND LOWER(TRIM(article_title)) = LOWER(TRIM(?))
//          LIMIT 1`,
//         [journal_id, title]
//       );
//       return NextResponse.json({ exists: rows.length > 0, success: true });
//     }

//     // ✅ single article fetch
//     if (id || article_id) {
//       const where = id ? "a.id = ?" : "a.article_id = ?";
//       const val = id ? Number(id) : article_id;

//       const [rows] = await conn.query(
//         `SELECT
//         a.id, a.journal_id, a.volume_id, a.issue_id, a.month_from, a.month_to,
//           a.article_id, a.doi, a.article_title, a.page_from, a.page_to,
//           a.authors, a.abstract, a.keywords, a.\`references\`,
//           DATE_FORMAT(a.received,  '%Y-%m-%d') AS received,
//           DATE_FORMAT(a.revised,   '%Y-%m-%d') AS revised,
//           DATE_FORMAT(a.accepted,  '%Y-%m-%d') AS accepted,
//           DATE_FORMAT(a.published, '%Y-%m-%d') AS published,
//           a.pdf_path, a.article_status, a.created_at, a.updated_at,
//           v.volume_number, v.volume_label, v.year,
//           i.issue_number, i.issue_label
//         FROM articles a
//         LEFT JOIN volumes v ON a.volume_id = v.id
//         LEFT JOIN issues i ON a.issue_id = i.id
//         WHERE ${where}
//         LIMIT 1`,
//         [val]
//       );

//       if (!rows.length) {
//         return NextResponse.json(
//           { success: false, message: "Article not found" },
//           { status: 404 }
//         );
//       }
//       return NextResponse.json({ success: true, article: rows[0] });
//     }

//     // ✅ multiple articles with optional filters + pagination
//     let baseWhere = "WHERE 1=1";
//     const params = [];

//     if (journal_id) {
//       baseWhere += " AND a.journal_id = ?";
//       params.push(journal_id);
//     }

//     if (query) {
//       baseWhere += ` AND (
//         LOWER(a.article_title) LIKE ? OR
//         LOWER(a.article_id) LIKE ? OR
//         LOWER(a.authors) LIKE ?
//       )`;
//       params.push(`%${query}%`, `%${query}%`, `%${query}%`);
//     }

//     if (volume) {
//       baseWhere += " AND a.volume_id = ?";
//       params.push(volume);
//     }

//     if (issue) {
//       baseWhere += " AND a.issue_id = ?";
//       params.push(issue);
//     }

//     if (year) {
//       baseWhere += " AND v.year = ?";
//       params.push(year);
//     }

//     // count for pagination
//     const [countRows] = await conn.query(
//       `SELECT COUNT(*) AS total
//        FROM articles a
//        LEFT JOIN volumes v ON a.volume_id = v.id
//        LEFT JOIN issues i ON a.issue_id = i.id
//        ${baseWhere}`,
//        params
//     );

//     const total = countRows[0]?.total ?? 0;

//     // main query
//     let sql = `
//     SELECT
//     a.id, a.journal_id, a.volume_id, a.issue_id, a.month_from, a.month_to,
//     a.article_id, a.doi, a.article_title, a.page_from, a.page_to,
//     a.authors, a.abstract, a.keywords, a.\`references\`,
//     DATE_FORMAT(a.received,  '%Y-%m-%d') AS received,
//     DATE_FORMAT(a.revised,   '%Y-%m-%d') AS revised,
//     DATE_FORMAT(a.accepted,  '%Y-%m-%d') AS accepted,
//     DATE_FORMAT(a.published, '%Y-%m-%d') AS published,
//     a.pdf_path, a.article_status, a.created_at, a.updated_at,
//     v.volume_number, v.volume_label, v.year,
//     i.issue_number, i.issue_label
//     FROM articles a
//     LEFT JOIN volumes v ON a.volume_id = v.id
//     LEFT JOIN issues i ON a.issue_id = i.id
//     ${baseWhere}
//     ORDER BY a.id DESC
//     `;

//     if (limit > 0) {
//       const offset = (page - 1) * limit;
//       sql += " LIMIT ?, ?";
//       params.push(offset, limit);
//     }

//     const [rows] = await conn.query(sql, params);

//     return NextResponse.json({
//       success: true,
//       articles: rows,
//       total,
//       page,
//       limit,
//     });
//   } catch (e) {
//     console.error("GET /api/articles error:", e);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch articles",
//         error: e.sqlMessage ?? e.message,
//       },
//       { status: 500 }
//     );
//   } finally {
//     await conn.end();
//   }
// }
// export async function DELETE(req) {
//   const conn = await createDbConnection();
//   try {
//       // 1) Accept id from either query string OR JSON body
//       const { searchParams } = new URL(req.url);
//       let id = searchParams.get("id");

//       if (!id) {
//         const ct = req.headers.get("content-type") || "";
//         if (ct.includes("application/json")) {
//           const body = await req.json().catch(() => ({}));
//           if (body?.id) id = body.id;
//         }
//       }

//       id = Number(id);
//       if (!id) {
//         return NextResponse.json(
//           { success: false, message: "Article ID is required" },
//           { status: 400 }
//         );
//       }

//       // 2) Fetch article to know the file path
//       const [[article]] = await conn.query(
//         "SELECT id, pdf_path FROM articles WHERE id = ? LIMIT 1",
//         [id]
//       );
//       if (!article) {
//         return NextResponse.json(
//           { success: false, message: "Article not found" },
//           { status: 404 }
//         );
//       }

//       // 3) Try to remove the PDF (fix: strip leading slash before joining)
//       if (article.pdf_path) {
//         const relative = String(article.pdf_path).replace(/^\/+/, ""); // <-- important
//         const localPath = path.join(process.cwd(), "public", relative);
//         try {
//           if (fs.existsSync(localPath)) {
//             fs.unlinkSync(localPath);
//           }
//         } catch (fileErr) {
//           // Non-fatal: continue with DB delete
//           console.warn("PDF delete warning:", fileErr?.message);
//         }
//       }

//       // 4) Delete the row
//       const [result] = await conn.query("DELETE FROM articles WHERE id = ?", [id]);

//       // MySQL returns affectedRows; if 0, nothing was deleted
//       if (!result?.affectedRows) {
//         return NextResponse.json(
//           { success: false, message: "Delete failed or already removed" },
//           { status: 409 }
//         );
//       }

//       return NextResponse.json({
//         success: true,
//         message: "Article deleted",
//         deletedId: id,
//       });
//     } catch (err) {
//       // Foreign key safety (e.g., referenced elsewhere)
//       if (err?.code === "ER_ROW_IS_REFERENCED_2" || err?.errno === 1451) {
//         return NextResponse.json(
//           {
//             success: false,
//             message:
//             "Cannot delete: this article is referenced by other records (FK constraint).",
//           },
//           { status: 409 }
//         );
//       }

//       console.error("DELETE /api/articles error:", err);
//       return NextResponse.json(
//         { success: false, message: err.sqlMessage ?? err.message ?? "Unknown error" },
//         { status: 500 }
//       );
//     } finally {
//       await conn.end();
//     }
// }

import { NextResponse } from "next/server";
import { parseForm } from "@/lib/parseForm";
import { createDbConnection } from "@/lib/db";
import path from "path";
import fs, { writeFile } from "fs";
import { revalidatePath, revalidateTag } from "next/cache";

// Disable Next.js body parsing (we handle multipart)
export const config = { api: { bodyParser: false } };

// ────────────────────────────────
// Helpers
// ────────────────────────────────
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

// ────────────────────────────────
// POST  →  Create Article
// ────────────────────────────────
export async function POST(req) {
  const conn = await createDbConnection();
  try {
    const { fields, files } = await parseForm(req);
    const idNum = fields.id ? Number(fields.id) : 0;
    const isEdit = idNum > 0;

    const {
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
      references,
      received,
      revised,
      accepted,
      published,
      page_from,
      page_to,
      article_status,
    } = fields;

    const titleNorm = normalizeTitle(article_title);

    // ── Required checks
    if (!journal_id || !volume_id || !issue_id || !article_id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "journal_id, volume_id, issue_id, and article_id are required.",
        },
        { status: 400 }
      );
    }

    // ── Journal prefix validation
    const [[jr]] = await conn.query(
      "SELECT short_name FROM journals WHERE id = ? LIMIT 1",
      [journal_id]
    );
    if (!jr)
      return NextResponse.json(
        { success: false, message: "Invalid journal_id." },
        { status: 400 }
      );

    let expectedPrefix = (jr.short_name || "").trim().toUpperCase();
    if (expectedPrefix.startsWith("DS-"))
      expectedPrefix = expectedPrefix.replace(/^DS-/, "");
    const jounalSlug = expectedPrefix.toLowerCase();

    const articleIdUpper = String(article_id).trim().toUpperCase();
    const validPrefixPattern = new RegExp(
      `^${expectedPrefix}-V\\d+I\\d+P\\d+$`,
      "i"
    );
    if (!validPrefixPattern.test(articleIdUpper)) {
      return NextResponse.json(
        {
          success: false,
          message: `Article ID must follow "${expectedPrefix}-V<volume>I<issue>P<serial>", e.g. "${expectedPrefix}-V4I3P103".`,
        },
        { status: 400 }
      );
    }

    // ── Volume / Issue consistency
    const [[volRow]] = await conn.query(
      "SELECT volume_number FROM volumes WHERE id = ? LIMIT 1",
      [volume_id]
    );
    const [[issRow]] = await conn.query(
      "SELECT issue_number FROM issues WHERE id = ? LIMIT 1",
      [issue_id]
    );
    if (!volRow || !issRow)
      return NextResponse.json(
        { success: false, message: "Invalid volume_id or issue_id." },
        { status: 400 }
      );

    const volNum = String(volRow.volume_number);
    const issNum = String(issRow.issue_number);
    const m = String(article_id).match(/-V(\d+)I(\d+)/i);
    if (!m)
      return NextResponse.json(
        {
          success: false,
          message: 'Article ID must include "-V<vol>I<issue>".',
        },
        { status: 400 }
      );

    const [, volInId, issInId] = m;
    if (volInId !== volNum || issInId !== issNum) {
      return NextResponse.json(
        {
          success: false,
          message: `Article ID volume/issue mismatch. Expected V${volNum}I${issNum}.`,
        },
        { status: 400 }
      );
    }

    // ── Uniqueness
    const [dupes] = await conn.query(
      "SELECT id FROM articles WHERE article_id = ? AND id <> ? LIMIT 1",
      [article_id, idNum]
    );
    if (dupes.length)
      return NextResponse.json(
        { success: false, message: "Duplicate article_id." },
        { status: 409 }
      );

    if (!article_title?.trim())
      return NextResponse.json(
        { success: false, message: "Title is required." },
        { status: 400 }
      );

    const [titleDupes] = await conn.query(
      `SELECT id FROM articles WHERE journal_id = ? AND title_norm = ? AND id <> ? LIMIT 1`,
      [journal_id, titleNorm, idNum]
    );
    if (titleDupes.length)
      return NextResponse.json(
        {
          success: false,
          message: "An article with this title already exists in this journal.",
        },
        { status: 409 }
      );

    if (doi?.trim()) {
      const [doiDupes] = await conn.query(
        `SELECT id FROM articles WHERE doi = ? AND id <> ? LIMIT 1`,
        [doi, idNum]
      );
      if (doiDupes.length)
        return NextResponse.json(
          { success: false, message: "Duplicate DOI." },
          { status: 409 }
        );
    }

    // ── PDF path
    let pdfPath = null;
    const uploaded = files?.pdf?.[0];
    if (uploaded?.relativePath) {
      pdfPath = uploaded.relativePath.startsWith("/")
        ? uploaded.relativePath
        : `/${uploaded.relativePath}`;
    }

    // ── Normalize authors/keywords arrays → JSON strings
    const keywordArray =
      typeof keywords === "string"
        ? keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : Array.isArray(keywords)
        ? keywords.map((k) => k.trim()).filter(Boolean)
        : [];

    const authorArray =
      typeof authors === "string"
        ? authors
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        : Array.isArray(authors)
        ? authors.map((a) => a.trim()).filter(Boolean)
        : [];

    // ── Payload
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
      abstract: abstract?.trim() ? String(abstract) : null,
      keywords: JSON.stringify(keywordArray),
      references: references?.trim() ? String(references) : null,
      received: toNull(received),
      revised: toNull(revised),
      accepted: toNull(accepted),
      published: toNull(published),
      pdf_path: toNull(pdfPath),
      article_status: toNull(article_status),
    };

    const sql = `
      INSERT INTO articles (
        journal_id, volume_id, issue_id,
        month_from, month_to, article_id, doi, article_title,
        page_from, page_to, authors, abstract, keywords, \`references\`,
        received, revised, accepted, published,
        pdf_path, article_status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const params = Object.values(payload);

    const [result] = await conn.query(sql, params);
    revalidateTag("articles");
    revalidatePath(`/${jounalSlug}/${article_id}`);
    revalidatePath(`/${jounalSlug}/archives`);
    revalidatePath(`/${jounalSlug}/current-issue`);
    revalidatePath(
      `/${jounalSlug}/archives/volume${volume_id}/issue${issue_id}`
    );
    return NextResponse.json({
      success: true,
      message: "✅ Article submitted successfully",
      insertedId: result.insertId,
    });
  } catch (e) {
    console.error("POST /api/articles error:", e);
    return NextResponse.json(
      {
        success: false,
        message: e.sqlMessage || e.message || "Failed to save article",
      },
      { status: 500 }
    );
  } finally {
    await conn.end();
  }
}

// ==========================================================
// PUT — Update article + manage PDF file
// ==========================================================
export async function PUT(req) {
  const connection = await createDbConnection();
  try {
    const formData = await req.formData();
    const id = formData.get("id");
    const journal_id = Number(formData.get("journal_id"));
    const volume_id = Number(formData.get("volume_id"));
    const issue_id = Number(formData.get("issue_id"));
    if (!id)
      return NextResponse.json(
        { success: false, message: "Article ID required" },
        { status: 400 }
      );

    const [[jr]] = await connection.query(
      "SELECT short_name FROM journals WHERE id = ? LIMIT 1",
      [journal_id]
    );
    if (!jr)
      return NextResponse.json(
        { success: false, message: "Invalid journal_id." },
        { status: 400 }
      );

    let expectedPrefix = (jr.short_name || "").trim().toUpperCase();
    if (expectedPrefix.startsWith("DS-"))
      expectedPrefix = expectedPrefix.replace(/^DS-/, "");
    const jounalSlug = expectedPrefix.toLowerCase();

    const updates = {};
    for (const [k, v] of formData.entries()) {
      if (["pdf", "remove_pdf"].includes(k)) continue;

      if (["keywords", "authors"].includes(k)) {
        try {
          JSON.parse(v);
          updates[k] = v;
        } catch {
          updates[k] = JSON.stringify(v);
        }
      } else {
        updates[k] = v;
      }
    }

    const [rows] = await connection.query(
      `SELECT pdf_path FROM articles WHERE id = ?`,
      [id]
    );
    const existing = rows[0] || {};
    const oldPath = existing.pdf_path
      ? path.join(
          process.cwd(),
          "public",
          existing.pdf_path.replace(/^\/+/, "")
        )
      : null;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "articles");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const newFile = formData.get("pdf");
    if (newFile && newFile.size > 0) {
      const newName = newFile.name;
      const newFullPath = path.join(uploadDir, newName);
      if (oldPath && fs.existsSync(oldPath)) await fs.promises.unlink(oldPath);
      const buffer = Buffer.from(await newFile.arrayBuffer());
      await writeFile(newFullPath, buffer);
      updates.pdf_path = `/uploads/articles/${newName}`;
    }

    const removeFlag = formData.get("remove_pdf");
    if (removeFlag === "1" && oldPath && fs.existsSync(oldPath)) {
      await fs.promises.unlink(oldPath);
      updates.pdf_path = "";
    }

    if (!newFile && removeFlag !== "1") delete updates.pdf_path;

    const fields = Object.keys(updates)
      .map((k) => `${k === "references" ? "`references`" : k} = ?`)
      .join(", ");
    const values = Object.values(updates);

    await connection.query(
      `UPDATE articles SET ${fields}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    revalidateTag("articles");
    revalidatePath(`/${jounalSlug}/${article_id}`);
    revalidatePath(`/${jounalSlug}/archives`);
    revalidatePath(`/${jounalSlug}/current-issue`);
    revalidatePath(
      `/${jounalSlug}/archives/volume${volume_id}/issue${issue_id}`
    );

    return NextResponse.json({
      success: true,
      message: newFile
        ? "✅ Article updated and file replaced."
        : removeFlag === "1"
        ? "✅ Article updated and file removed."
        : "✅ Article updated successfully.",
    });
  } catch (err) {
    console.error("❌ PUT /articles error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Error updating article" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");
  const article_id = searchParams.get("article_id");
  const journal_id = searchParams.get("journal_id");
  const checkTitle = searchParams.get("checkTitle");
  const title = searchParams.get("title");

  // 🔍 New filters
  const query = searchParams.get("query")?.toLowerCase() || "";
  const volume = searchParams.get("volume");
  const issue = searchParams.get("issue");
  const year = searchParams.get("year");

  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.max(parseInt(searchParams.get("limit") || "0", 10), 0); // 0 = no pagination

  const conn = await createDbConnection();

  try {
    /* ──────────────────────────────────────────────────────────────
     ✅ 1. Duplicate title check
    ────────────────────────────────────────────────────────────── */
    if (checkTitle && journal_id && title) {
      const [rows] = await conn.query(
        `
        SELECT id 
        FROM articles 
        WHERE journal_id = ? 
          AND LOWER(TRIM(article_title)) = LOWER(TRIM(?))
        LIMIT 1
        `,
        [journal_id, title]
      );
      return NextResponse.json({ exists: rows.length > 0, success: true });
    }

    /* ──────────────────────────────────────────────────────────────
     ✅ 2. Fetch single article by ID or article_id
    ────────────────────────────────────────────────────────────── */
    if (id || article_id) {
      const where = id ? "a.id = ?" : "a.article_id = ?";
      const val = id ? Number(id) : article_id;

      const [rows] = await conn.query(
        `
        SELECT 
          a.id, a.journal_id, a.volume_id, a.issue_id,
          a.month_from, a.month_to,
          a.article_id, a.doi, a.article_title,
          a.page_from, a.page_to,
          a.authors, a.abstract, a.keywords, a.\`references\`,
          DATE_FORMAT(a.received,  '%Y-%m-%d') AS received,
          DATE_FORMAT(a.revised,   '%Y-%m-%d') AS revised,
          DATE_FORMAT(a.accepted,  '%Y-%m-%d') AS accepted,
          DATE_FORMAT(a.published, '%Y-%m-%d') AS published,
          a.pdf_path, a.article_status, a.created_at, a.updated_at,
          v.volume_number, v.volume_label, v.year,
          i.issue_number, i.issue_label
        FROM articles a
        LEFT JOIN volumes v ON a.volume_id = v.id
        LEFT JOIN issues i ON a.issue_id = i.id
        WHERE ${where}
        LIMIT 1
        `,
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

    /* ──────────────────────────────────────────────────────────────
     ✅ 3. Fetch multiple articles (filters + pagination)
    ────────────────────────────────────────────────────────────── */
    let baseWhere = "WHERE 1=1";
    const params = [];

    if (journal_id) {
      baseWhere += " AND a.journal_id = ?";
      params.push(journal_id);
    }

    if (query) {
      baseWhere += `
        AND (
          LOWER(a.article_title) LIKE ? OR
          LOWER(a.article_id) LIKE ? OR
          LOWER(a.authors) LIKE ?
        )
      `;
      const like = `%${query}%`;
      params.push(like, like, like);
    }

    if (volume) {
      baseWhere += " AND a.volume_id = ?";
      params.push(volume);
    }

    if (issue) {
      baseWhere += " AND a.issue_id = ?";
      params.push(issue);
    }

    if (year) {
      baseWhere += " AND v.year = ?";
      params.push(year);
    }

    // 🧮 Count for pagination
    const [countRows] = await conn.query(
      `
      SELECT COUNT(*) AS total
      FROM articles a
      LEFT JOIN volumes v ON a.volume_id = v.id
      LEFT JOIN issues i ON a.issue_id = i.id
      ${baseWhere}
      `,
      params
    );

    const total = countRows[0]?.total ?? 0;

    // 🧾 Main query
    let sql = `
      SELECT 
        a.id, a.journal_id, a.volume_id, a.issue_id,
        a.month_from, a.month_to,
        a.article_id, a.doi, a.article_title,
        a.page_from, a.page_to,
        a.authors, a.abstract, a.keywords, a.\`references\`,
        DATE_FORMAT(a.received,  '%Y-%m-%d') AS received,
        DATE_FORMAT(a.revised,   '%Y-%m-%d') AS revised,
        DATE_FORMAT(a.accepted,  '%Y-%m-%d') AS accepted,
        DATE_FORMAT(a.published, '%Y-%m-%d') AS published,
        a.pdf_path, a.article_status, a.created_at, a.updated_at,
        v.volume_number, v.volume_label, v.year,
        i.issue_number, i.issue_label
      FROM articles a
      LEFT JOIN volumes v ON a.volume_id = v.id
      LEFT JOIN issues i ON a.issue_id = i.id
      ${baseWhere}
      ORDER BY a.id DESC
    `;

    // 📄 Apply pagination
    if (limit > 0) {
      const offset = (page - 1) * limit;
      sql += " LIMIT ?, ?";
      params.push(offset, limit);
    }

    const [rows] = await conn.query(sql, params);

    return NextResponse.json({
      success: true,
      articles: rows,
      total,
      page,
      limit,
    });
  } catch (e) {
    console.error("❌ GET /api/articles failed:", e);
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
