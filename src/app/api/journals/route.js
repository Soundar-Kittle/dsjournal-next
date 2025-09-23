// // app/api/journals/route.js
// import { NextResponse } from "next/server";
// import { parseForm } from "@/lib/parseForm";
// import { createDbConnection } from "@/lib/db";
// import path from "path";
// import fs from "fs";

// // Disable Next.js body parser for file uploads
// export const config = { api: { bodyParser: false } };

// // ---------- helpers ----------
// const intOrNull = (v) => (v === undefined || v === null || v === "" ? null : parseInt(v, 10));

// // Compute a sort_index based on desired position.
// async function computeSortIndex(conn, { position, afterId }) {
//   // default = last
//   if (position === "first") {
//     const [[r]] = await conn.query("SELECT COALESCE(MIN(sort_index),10) AS min_idx FROM journals");
//     return r.min_idx - 10; // put at top
//   }
//   if (afterId) {
//     const [[prev]] = await conn.query("SELECT sort_index FROM journals WHERE id=? LIMIT 1", [afterId]);
//     if (!prev) {
//       const [[mx]] = await conn.query("SELECT COALESCE(MAX(sort_index),0) AS max_idx FROM journals");
//       return mx.max_idx + 10;
//     }
//     const [[nx]] = await conn.query(
//       "SELECT MIN(sort_index) AS next_idx FROM journals WHERE sort_index > ?",
//       [prev.sort_index]
//     );
//     if (nx?.next_idx) {
//       // insert between prev and next
//       return Math.floor((prev.sort_index + nx.next_idx) / 2);
//     }
//     // no next: append to end
//     return prev.sort_index + 10;
//   }
//   const [[mx]] = await conn.query("SELECT COALESCE(MAX(sort_index),0) AS max_idx FROM journals");
//   return mx.max_idx + 10;
// }

// // ---------- CREATE ----------
// export async function POST(req) {
//   try {
//     const { fields, files } = await parseForm(req);
//     const {
//       journal_name, short_name, issn_online, issn_print,
//       is_print_issn = 0, is_e_issn = 0,
//       subject, year_started, publication_frequency, language,
//       paper_submission_id, format, publication_fee,
//       publisher, doi_prefix,
//       // new (optional) ordering hints
//       position,           // "first" | undefined
//       after_id            // id to insert after
//     } = fields;

//     let coverImagePath = null;
//     const cover = files?.cover_image?.[0];
//     if (cover) {
//       const ext = path.extname(cover.originalFilename || "");
//       const fileName = `cover_${Date.now()}${ext}`;
//       const uploadDir = path.join(process.cwd(), "public/uploads/covers");
//       fs.mkdirSync(uploadDir, { recursive: true });
//       const savePath = path.join(uploadDir, fileName);
//       fs.renameSync(cover.filepath, savePath);
//       coverImagePath = `uploads/covers/${fileName}`;
//     }

//     const conn = await createDbConnection();

//     // decide sort_index
//     const sort_index = await computeSortIndex(conn, {
//       position: (position || "").toLowerCase() === "first" ? "first" : undefined,
//       afterId: intOrNull(after_id)
//     });

//     await conn.query(
//       `INSERT INTO journals (
//         journal_name, short_name,
//         issn_online, issn_print, is_print_issn, is_e_issn,
//         subject, year_started,
//         publication_frequency, language,
//         paper_submission_id, format,
//         publication_fee, publisher, doi_prefix,
//         cover_image, sort_index
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         journal_name,
//         short_name,
//         issn_online,
//         issn_print,
//         parseInt(is_print_issn || "0"),
//         parseInt(is_e_issn || "0"),
//         subject,
//         new Date(year_started).getFullYear(), // keep your year logic
//         publication_frequency,
//         language,
//         paper_submission_id,
//         format,
//         publication_fee,
//         publisher,
//         doi_prefix,
//         coverImagePath,
//         sort_index
//       ]
//     );

//     await conn.end();
//     return NextResponse.json({ success: true, message: "Journal created" });
//   } catch (err) {
//     console.error("POST /api/journals error:", err);
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   }
// }

// // ---------- UPDATE (includes optional reorder) ----------
// export async function PATCH(req) {
//   try {
//     const { fields, files } = await parseForm(req);
//     const {
//       id, journal_name, short_name,
//       issn_online, issn_print, is_print_issn = 0, is_e_issn = 0,
//       subject, year_started,
//       publication_frequency, language,
//       paper_submission_id, format,
//       publication_fee, publisher, doi_prefix,
//       // new (optional) ordering hints for reposition
//       sort_index: sortIndexRaw, // explicit value
//       position,                 // "first"
//       after_id                  // id to move after
//     } = fields;

//     let coverImagePath = null;
//     const cover = files?.cover_image?.[0];
//     if (cover) {
//       const ext = path.extname(cover.originalFilename || "");
//       const fileName = `cover_${Date.now()}${ext}`;
//       const uploadDir = path.join(process.cwd(), "public/uploads/covers");
//       fs.mkdirSync(uploadDir, { recursive: true });
//       const savePath = path.join(uploadDir, fileName);
//       fs.renameSync(cover.filepath, savePath);
//       coverImagePath = `uploads/covers/${fileName}`;
//     }

//     const conn = await createDbConnection();

//     // determine new sort_index if caller asked to reposition
//     let newSortIndex = intOrNull(sortIndexRaw);
//     if (newSortIndex === null && (position || after_id)) {
//       newSortIndex = await computeSortIndex(conn, {
//         position: (position || "").toLowerCase() === "first" ? "first" : undefined,
//         afterId: intOrNull(after_id)
//       });
//     }

//     const sets = [
//       "journal_name = ?","short_name = ?",
//       "issn_online = ?","issn_print = ?",
//       "is_print_issn = ?","is_e_issn = ?",
//       "subject = ?","year_started = ?",
//       "publication_frequency = ?","language = ?",
//       "paper_submission_id = ?","format = ?",
//       "publication_fee = ?","publisher = ?","doi_prefix = ?"
//     ];
//     const params = [
//       journal_name, short_name,
//       issn_online, issn_print,
//       parseInt(is_print_issn || "0"), parseInt(is_e_issn || "0"),
//       subject, parseInt(year_started),
//       publication_frequency, language,
//       paper_submission_id, format, publication_fee,
//       publisher, doi_prefix
//     ];

//     if (coverImagePath) { sets.push("cover_image = ?"); params.push(coverImagePath); }
//     if (newSortIndex !== null) { sets.push("sort_index = ?"); params.push(newSortIndex); }

//     params.push(id);

//     const sql = `UPDATE journals SET ${sets.join(", ")} WHERE id = ?`;
//     await conn.query(sql, params);
//     await conn.end();

//     return NextResponse.json({ success: true, message: "Journal updated" });
//   } catch (err) {
//     console.error("PATCH /api/journals error:", err);
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   }
// }

// // ---------- READ ----------
// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("jid") || searchParams.get("id");
//   const short = searchParams.get("short");

//   try {
//     const conn = await createDbConnection();
//     let result;

//     if (id) {
//       [result] = await conn.query("SELECT * FROM journals WHERE id = ? LIMIT 1", [id]);
//     } else if (short) {
//       [result] = await conn.query(
//         "SELECT * FROM journals WHERE LOWER(short_name) = LOWER(?) LIMIT 1",
//         [short]
//       );
//     } else {
//       [result] = await conn.query(
//         "SELECT * FROM journals ORDER BY sort_index ASC, id ASC"
//       );
//     }

//     await conn.end();
//     return NextResponse.json({ success: true, journals: result });
//   } catch (err) {
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   }
// }

// // ---------- DELETE ----------
// export async function DELETE(req) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id");
//   if (!id) {
//     return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
//   }

//   try {
//     const conn = await createDbConnection();
//     await conn.query("DELETE FROM journals WHERE id = ?", [id]);
//     await conn.end();
//     return NextResponse.json({ success: true, message: "Journal deleted" });
//   } catch (err) {
//     console.error("DELETE /api/journals error:", err);
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   }
// }

// app/api/journals/route.js
import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs"; // needed to use fs in App Router

// ---------- helpers ----------
const intOrNull = (v) => (v === undefined || v === null || v === "" ? null : parseInt(v, 10));

async function computeSortIndex(conn, { position, afterId }) {
  // default = last
  if (position === "first") {
    const [[r]] = await conn.query("SELECT COALESCE(MIN(sort_index),10) AS min_idx FROM journals");
    return r.min_idx - 10; // put at top
  }
  if (afterId) {
    const [[prev]] = await conn.query("SELECT sort_index FROM journals WHERE id=? LIMIT 1", [afterId]);
    if (!prev) {
      const [[mx]] = await conn.query("SELECT COALESCE(MAX(sort_index),0) AS max_idx FROM journals");
      return mx.max_idx + 10;
    }
    const [[nx]] = await conn.query(
      "SELECT MIN(sort_index) AS next_idx FROM journals WHERE sort_index > ?",
      [prev.sort_index]
    );
    if (nx?.next_idx !== null && nx?.next_idx !== undefined) {
      return Math.floor((prev.sort_index + nx.next_idx) / 2);
    }
    return prev.sort_index + 10;
  }
  const [[mx]] = await conn.query("SELECT COALESCE(MAX(sort_index),0) AS max_idx FROM journals");
  return mx.max_idx + 10;
}

function toYearOrNull(s) {
  if (!s) return null;
  const y = new Date(String(s)).getFullYear();
  return Number.isFinite(y) ? y : null;
}

/**
 * Save a File from formData() to /public/<subdir> and return a web-safe path.
 * @param {File|null|string} file - Web File from formData() (NOT formidable)
 * @param {string} subdir - relative to /public
 * @returns {Promise<string|null>} e.g. "uploads/covers/cover_123.png" or null
 */
async function saveCoverFromFormData(file, subdir = "uploads/covers") {
  if (!file || typeof file === "string") return null; // no file selected

  const relDir = String(subdir).replace(/\\/g, "/").replace(/^\/+/, "").replace(/\.\./g, "");
  const base = (file.name || "cover").replace(/[^\w.-]/g, "_");
  const ext = path.extname(base) || ".png";
  const fileName = `cover_${Date.now()}${ext}`;

  const absDir = path.join(process.cwd(), "public", ...relDir.split("/"));
  const absPath = path.join(absDir, fileName);
  await fs.mkdir(absDir, { recursive: true });

  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absPath, buf);

  return `${relDir}/${fileName}`; // web-safe, no leading slash
}

// ---------- CREATE ----------
export async function POST(req) {
  let conn;
  try {
    const form = await req.formData();

    const journal_name = form.get("journal_name")?.toString().trim() || "";
    const short_name   = form.get("short_name")?.toString().trim() || "";
    if (!journal_name || !short_name) {
      return NextResponse.json({ success: false, message: "journal_name and short_name are required" }, { status: 400 });
    }

    const row = {
      journal_name,
      short_name,
      issn_online: form.get("issn_online")?.toString() || null,
      issn_print:  form.get("issn_print")?.toString()  || null,
      is_print_issn: form.get("is_print_issn")?.toString() === "1" ? 1 : 0,
      is_e_issn:     form.get("is_e_issn")?.toString() === "1" ? 1 : 0,
      subject: form.get("subject")?.toString() || null,
      year_started: toYearOrNull(form.get("year_started")?.toString() || ""),
      publication_frequency: form.get("publication_frequency")?.toString() || null,
      language: form.get("language")?.toString() || null,
      paper_submission_id: form.get("paper_submission_id")?.toString() || null,
      format: form.get("format")?.toString() || null,
      publication_fee: form.get("publication_fee")?.toString() || null,
      publisher: form.get("publisher")?.toString() || null,
      doi_prefix: form.get("doi_prefix")?.toString() || null,
      cover_image: null, // set below
      sort_index: 0,     // set below
    };

    // File from native formData
    const coverFile = form.get("cover_image"); // File | null
    const savedPath = await saveCoverFromFormData(coverFile, "uploads/covers"); // or "uploads/cover"
    row.cover_image = savedPath ? savedPath.replace(/\\/g, "/") : null;

    const position = form.get("position")?.toString() || "";
    const afterId  = intOrNull(form.get("after_id"));

    conn = await createDbConnection();
    row.sort_index = await computeSortIndex(conn, {
      position: position.toLowerCase() === "first" ? "first" : undefined,
      afterId,
    });

    // Use INSERT ... SET ? to avoid value-count mismatches
    await conn.query("INSERT INTO journals SET ?", row);
    await conn.end();

    return NextResponse.json({ success: true, message: "Journal created" });
  } catch (e) {
    if (conn) try { await conn.end(); } catch {}
    console.error("POST /api/journals error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// ---------- UPDATE (includes optional reorder) ----------
export async function PATCH(req) {
  let conn;
  try {
    const form = await req.formData();
    const id = intOrNull(form.get("id"));
    if (!id) {
      return NextResponse.json({ success: false, message: "valid id required" }, { status: 400 });
    }

    const sets = [];
    const params = [];
    const setIf = (col, val) => { sets.push(`${col} = ?`); params.push(val); };

    const journal_name = form.get("journal_name");
    if (journal_name !== null) setIf("journal_name", journal_name.toString());

    const short_name = form.get("short_name");
    if (short_name !== null) setIf("short_name", short_name.toString());

    const issn_online = form.get("issn_online");
    if (issn_online !== null) setIf("issn_online", issn_online.toString() || null);

    const issn_print = form.get("issn_print");
    if (issn_print !== null) setIf("issn_print", issn_print.toString() || null);

    const is_print_issn = form.get("is_print_issn");
    if (is_print_issn !== null) setIf("is_print_issn", is_print_issn.toString() === "1" ? 1 : 0);

    const is_e_issn = form.get("is_e_issn");
    if (is_e_issn !== null) setIf("is_e_issn", is_e_issn.toString() === "1" ? 1 : 0);

    const subject = form.get("subject");
    if (subject !== null) setIf("subject", subject.toString() || null);

    const ys = form.get("year_started");
    if (ys !== null) setIf("year_started", toYearOrNull(ys.toString() || ""));

    const publication_frequency = form.get("publication_frequency");
    if (publication_frequency !== null) setIf("publication_frequency", publication_frequency.toString() || null);

    const language = form.get("language");
    if (language !== null) setIf("language", language.toString() || null);

    const paper_submission_id = form.get("paper_submission_id");
    if (paper_submission_id !== null) setIf("paper_submission_id", paper_submission_id.toString() || null);

    const format = form.get("format");
    if (format !== null) setIf("format", format.toString() || null);

    const publication_fee = form.get("publication_fee");
    if (publication_fee !== null) setIf("publication_fee", publication_fee.toString() || null);

    const publisher = form.get("publisher");
    if (publisher !== null) setIf("publisher", publisher.toString() || null);

    const doi_prefix = form.get("doi_prefix");
    if (doi_prefix !== null) setIf("doi_prefix", doi_prefix.toString() || null);

    // Optional new file (native formData)
    const coverFile = form.get("cover_image");
    const newCoverPath = await saveCoverFromFormData(coverFile, "uploads/covers");
    if (newCoverPath) setIf("cover_image", newCoverPath.replace(/\\/g, "/"));

    // Optional reposition
    const position = form.get("position")?.toString() || "";
    const afterId  = intOrNull(form.get("after_id"));
    const sortIndexRaw = intOrNull(form.get("sort_index"));
    let newSortIndex = sortIndexRaw;

    conn = await createDbConnection();
    if (newSortIndex === null && (position || afterId !== null)) {
      newSortIndex = await computeSortIndex(conn, {
        position: position.toLowerCase() === "first" ? "first" : undefined,
        afterId,
      });
    }
    if (newSortIndex !== null) setIf("sort_index", newSortIndex);

    if (sets.length === 0) {
      await conn.end();
      return NextResponse.json({ success: true, message: "Nothing to update" });
    }

    params.push(id);
    await conn.query(`UPDATE journals SET ${sets.join(", ")} WHERE id = ? LIMIT 1`, params);
    await conn.end();

    return NextResponse.json({ success: true, message: "Journal updated" });
  } catch (e) {
    if (conn) try { await conn.end(); } catch {}
    console.error("PATCH /api/journals error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// ---------- READ ----------
// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("jid") || searchParams.get("id");
//   const short = searchParams.get("short");

//   try {
//     const conn = await createDbConnection();
//     let result;

//     if (id) {
//       [result] = await conn.query("SELECT * FROM journals WHERE id = ? LIMIT 1", [id]);
//     } else if (short) {
//       [result] = await conn.query(
//         "SELECT * FROM journals WHERE LOWER(short_name) = LOWER(?) LIMIT 1",
//         [short]
//       );
//     } else {
//       [result] = await conn.query(
//         "SELECT * FROM journals ORDER BY sort_index ASC, id ASC"
//       );
//     }

//     await conn.end();
//     return NextResponse.json({ success: true, journals: result });
//   } catch (err) {
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   }
// }

// ---------- READ ----------
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id    = searchParams.get("jid") || searchParams.get("id");
  const short = searchParams.get("short");
  const slug  = searchParams.get("slug"); // cleaned slug like "lll"

  let conn;
  try {
    conn = await createDbConnection();
    let result;

    if (id) {
      [result] = await conn.query("SELECT * FROM journals WHERE id = ? LIMIT 1", [id]);
    } else if (short) {
      [result] = await conn.query(
        "SELECT * FROM journals WHERE LOWER(TRIM(short_name)) = LOWER(TRIM(?)) LIMIT 1",
        [short]
      );
    } else if (slug) {
      // match DS- prefix variants OR explicit slug/alias columns if you have them
      const [rows] = await conn.query(
        `SELECT * FROM journals
         WHERE
           REPLACE(LOWER(TRIM(short_name)), 'ds-', '') = LOWER(TRIM(?))
           OR REPLACE(LOWER(TRIM(short_name)), 'ds', '') = LOWER(TRIM(?))
           OR LOWER(TRIM(short_name)) = LOWER(TRIM(?))          -- allow exact short_name
           OR LOWER(TRIM(slug))       = LOWER(TRIM(?))          -- if you have a slug column
           OR LOWER(TRIM(alias))      = LOWER(TRIM(?))          -- if you have an alias column
         LIMIT 1`,
        [slug, slug, slug, slug, slug]
      );
      result = rows;
    } else {
      [result] = await conn.query(
        "SELECT * FROM journals ORDER BY sort_index ASC, id ASC"
      );
    }

    await conn.end();
    const rows = Array.isArray(result) ? result : result ? [result] : [];
    return NextResponse.json({ success: true, journals: rows });
  } catch (err) {
    if (conn) try { await conn.end(); } catch {}
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
  }

  try {
    const conn = await createDbConnection();
    await conn.query("DELETE FROM journals WHERE id = ?", [id]);
    await conn.end();
    return NextResponse.json({ success: true, message: "Journal deleted" });
  } catch (err) {
    console.error("DELETE /api/journals error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
