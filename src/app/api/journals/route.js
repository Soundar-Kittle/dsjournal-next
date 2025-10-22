import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";
import { handleFileUploads } from "@/lib/fileUpload";
import { removeFile } from "@/lib/removeFile";
import { cleanData } from "@/lib/utils";

export const runtime = "nodejs"; // needed to use fs in App Router

// ---------- helpers ----------
const intOrNull = (v) =>
  v === undefined || v === null || v === "" ? null : parseInt(v, 10);

async function computeSortIndex(conn, { position, afterId }) {
  // default = last
  if (position === "first") {
    const [[r]] = await conn.query(
      "SELECT COALESCE(MIN(sort_index),10) AS min_idx FROM journals"
    );
    return r.min_idx - 10; // put at top
  }
  if (afterId) {
    const [[prev]] = await conn.query(
      "SELECT sort_index FROM journals WHERE id=? LIMIT 1",
      [afterId]
    );
    if (!prev) {
      const [[mx]] = await conn.query(
        "SELECT COALESCE(MAX(sort_index),0) AS max_idx FROM journals"
      );
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
  const [[mx]] = await conn.query(
    "SELECT COALESCE(MAX(sort_index),0) AS max_idx FROM journals"
  );
  return mx.max_idx + 10;
}

function toYearOrNull(s) {
  if (!s) return null;
  const y = new Date(String(s)).getFullYear();
  return Number.isFinite(y) ? y : null;
}

// ---------- CREATE ----------
export async function POST(req) {
  let conn;
  try {
    const form = await req.formData();

    const journal_name = form.get("journal_name")?.toString().trim() || "";
    const short_name = form.get("short_name")?.toString().trim() || "";
    if (!journal_name || !short_name) {
      return NextResponse.json(
        { success: false, message: "journal_name and short_name are required" },
        { status: 400 }
      );
    }
    const uploadedFiles = await handleFileUploads(form);

    const row = {
      journal_name,
      short_name,
      issn_online: form.get("issn_online")?.toString() || null,
      issn_print: form.get("issn_print")?.toString() || null,
      is_print_issn: form.get("is_print_issn")?.toString() === "1" ? 1 : 0,
      is_e_issn: form.get("is_e_issn")?.toString() === "1" ? 1 : 0,
      subject: form.get("subject")?.toString() || null,
      year_started: toYearOrNull(form.get("year_started")?.toString() || ""),
      publication_frequency:
        form.get("publication_frequency")?.toString() || null,
      language: form.get("language")?.toString() || null,
      paper_submission_id: form.get("paper_submission_id")?.toString() || null,
      format: form.get("format")?.toString() || null,
      publication_fee: form.get("publication_fee")?.toString() || null,
      publisher: form.get("publisher")?.toString() || null,
      doi_prefix: form.get("doi_prefix")?.toString() || null,
      cover_image: uploadedFiles.cover_image || null,
      banner_image: uploadedFiles.banner_image || null,
      paper_template: uploadedFiles.paper_template || null,
      copyright_form: uploadedFiles.copyright_form || null,
      sort_index: 0,
    };

    const position = form.get("position")?.toString() || "";
    const afterId = intOrNull(form.get("after_id"));

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
    if (conn)
      try {
        await conn.end();
      } catch {}
    console.error("POST /api/journals error:", e);
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}

// ---------- UPDATE (includes optional reorder) ----------
// export async function PATCH(req) {
//   let conn;
//   try {
//     const form = await req.formData();
//     const id = intOrNull(form.get("id"));
//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: "valid id required" },
//         { status: 400 }
//       );
//     }

//     const sets = [];
//     const params = [];
//     const setIf = (col, val) => {
//       sets.push(`${col} = ?`);
//       params.push(val);
//     };

//     const journal_name = form.get("journal_name");
//     if (journal_name !== null) setIf("journal_name", journal_name.toString());

//     const short_name = form.get("short_name");
//     if (short_name !== null) setIf("short_name", short_name.toString());

//     const issn_online = form.get("issn_online");
//     if (issn_online !== null)
//       setIf("issn_online", issn_online.toString() || null);

//     const issn_print = form.get("issn_print");
//     if (issn_print !== null) setIf("issn_print", issn_print.toString() || null);

//     const is_print_issn = form.get("is_print_issn");
//     if (is_print_issn !== null)
//       setIf("is_print_issn", is_print_issn.toString() === "1" ? 1 : 0);

//     const is_e_issn = form.get("is_e_issn");
//     if (is_e_issn !== null)
//       setIf("is_e_issn", is_e_issn.toString() === "1" ? 1 : 0);

//     const subject = form.get("subject");
//     if (subject !== null) setIf("subject", subject.toString() || null);

//     const ys = form.get("year_started");
//     if (ys !== null) setIf("year_started", toYearOrNull(ys.toString() || ""));

//     const publication_frequency = form.get("publication_frequency");
//     if (publication_frequency !== null)
//       setIf("publication_frequency", publication_frequency.toString() || null);

//     const language = form.get("language");
//     if (language !== null) setIf("language", language.toString() || null);

//     const paper_submission_id = form.get("paper_submission_id");
//     if (paper_submission_id !== null)
//       setIf("paper_submission_id", paper_submission_id.toString() || null);

//     const format = form.get("format");
//     if (format !== null) setIf("format", format.toString() || null);

//     const publication_fee = form.get("publication_fee");
//     if (publication_fee !== null)
//       setIf("publication_fee", publication_fee.toString() || null);

//     const publisher = form.get("publisher");
//     if (publisher !== null) setIf("publisher", publisher.toString() || null);

//     const doi_prefix = form.get("doi_prefix");
//     if (doi_prefix !== null) setIf("doi_prefix", doi_prefix.toString() || null);

//     // Optional new file (native formData)
//     const coverFile = form.get("cover_image");
//     const newCoverPath = await saveCoverFromFormData(
//       coverFile,
//       "uploads/covers"
//     );
//     if (newCoverPath) setIf("cover_image", newCoverPath.replace(/\\/g, "/"));

//     const bannerFile = form.get("banner_image");
//     const newBannerPath = await saveCoverFromFormData(
//       bannerFile,
//       "uploads/journal_banners"
//     );
//     if (newBannerPath) setIf("banner_image", newBannerPath.replace(/\\/g, "/"));

//     // Optional reposition
//     const position = form.get("position")?.toString() || "";
//     const afterId = intOrNull(form.get("after_id"));
//     const sortIndexRaw = intOrNull(form.get("sort_index"));
//     let newSortIndex = sortIndexRaw;

//     conn = await createDbConnection();
//     if (newSortIndex === null && (position || afterId !== null)) {
//       newSortIndex = await computeSortIndex(conn, {
//         position: position.toLowerCase() === "first" ? "first" : undefined,
//         afterId,
//       });
//     }
//     if (newSortIndex !== null) setIf("sort_index", newSortIndex);

//     if (sets.length === 0) {
//       await conn.end();
//       return NextResponse.json({ success: true, message: "Nothing to update" });
//     }

//     params.push(id);
//     await conn.query(
//       `UPDATE journals SET ${sets.join(", ")} WHERE id = ? LIMIT 1`,
//       params
//     );
//     await conn.end();

//     return NextResponse.json({ success: true, message: "Journal updated" });
//   } catch (e) {
//     if (conn)
//       try {
//         await conn.end();
//       } catch {}
//     console.error("PATCH /api/journals error:", e);
//     return NextResponse.json(
//       { success: false, error: e.message },
//       { status: 500 }
//     );
//   }
// }

export async function PATCH(req) {
  const conn = await createDbConnection();
  try {
    await conn.beginTransaction();

    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries());
    const cleanedData = cleanData(body);

    console.log("cleanedData =====>>...>>>", cleanedData);

    const uploadedFiles = await handleFileUploads(formData);
    const id = intOrNull(cleanedData.id);
    if (!id)
      return NextResponse.json(
        { success: false, message: "Valid journal id required" },
        { status: 400 }
      );

    // 🧠 Fetch existing record (for cleanup later)
    const [existingRows] = await conn.query(
      `SELECT cover_image, banner_image, paper_template, copyright_form 
       FROM journals WHERE id = ?`,
      [id]
    );
    const existing = existingRows?.[0] || {};

    // 🖼️ Handle file replacement/removal
    const newFiles = {
      cover_image: uploadedFiles.cover_image || null,
      banner_image: uploadedFiles.banner_image || null,
      paper_template: uploadedFiles.paper_template || null,
      copyright_form: uploadedFiles.copyright_form || null,
    };

    const getFinalFile = (key) => {
      const stateKey = `${key}_state`;

      let parsedState = null;
      const raw = cleanedData[stateKey];
      try {
        parsedState = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        parsedState = null;
      }

      const isRemoval = parsedState
        ? Object.values(parsedState).some(
            (val) => Array.isArray(val) && val.length === 0
          )
        : false;

      if (isRemoval) {
        if (existing[key]) removeFile(existing[key]); 
        return null; 
      }

      if (newFiles[key]) {
        if (existing[key] && newFiles[key] !== existing[key]) {
          removeFile(existing[key]);
        }
        return newFiles[key];
      }

      return existing[key] ?? null;
    };

    const row = {
      journal_name: cleanedData.journal_name || null,
      short_name: cleanedData.short_name || null,
      issn_online: cleanedData.issn_online || null,
      issn_print: cleanedData.issn_print || null,
      is_print_issn: cleanedData.is_print_issn === "1" ? 1 : 0,
      is_e_issn: cleanedData.is_e_issn === "1" ? 1 : 0,
      subject: cleanedData.subject || null,
      year_started: toYearOrNull(cleanedData.year_started || ""),
      publication_frequency: cleanedData.publication_frequency || null,
      language: cleanedData.language || null,
      paper_submission_id: cleanedData.paper_submission_id || null,
      format: cleanedData.format || null,
      publication_fee: cleanedData.publication_fee || null,
      publisher: cleanedData.publisher || null,
      doi_prefix: cleanedData.doi_prefix || null,
      cover_image: getFinalFile("cover_image"),
      banner_image: getFinalFile("banner_image"),
      paper_template: getFinalFile("paper_template"),
      copyright_form: getFinalFile("copyright_form"),
    };

    // Optional sort reposition
    const position = cleanedData.position?.toString() || "";
    const afterId = intOrNull(cleanedData.after_id);
    const sortIndexRaw = intOrNull(cleanedData.sort_index);
    let newSortIndex = sortIndexRaw;

    if (newSortIndex === null && (position || afterId !== null)) {
      newSortIndex = await computeSortIndex(conn, {
        position: position.toLowerCase() === "first" ? "first" : undefined,
        afterId,
      });
    }
    if (newSortIndex !== null) row.sort_index = newSortIndex;

    // 🧩 Build update dynamically
    const sets = [];
    const params = [];
    Object.entries(row).forEach(([key, val]) => {
      if (val !== undefined) {
        sets.push(`${key} = ?`);
        params.push(val);
      }
    });

    if (sets.length === 0) {
      await conn.rollback();
      return NextResponse.json({
        success: false,
        message: "Nothing to update",
      });
    }

    params.push(id);
    await conn.query(
      `UPDATE journals SET ${sets.join(", ")} WHERE id = ? LIMIT 1`,
      params
    );

    await conn.commit();
    return NextResponse.json({
      success: true,
      message: "Journal updated successfully",
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ PATCH /api/journals error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update journal" },
      { status: 500 }
    );
  } finally {
    await conn.end();
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
  const id = searchParams.get("jid") || searchParams.get("id");
  const short = searchParams.get("short");
  const slug = searchParams.get("slug"); // cleaned slug like "lll"

  let conn;
  try {
    conn = await createDbConnection();
    let result;

    if (id) {
      [result] = await conn.query(
        "SELECT * FROM journals WHERE id = ? LIMIT 1",
        [id]
      );
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
           OR LOWER(TRIM(short_name))       = LOWER(TRIM(?))          -- if you have a slug column
           OR LOWER(TRIM(short_name))      = LOWER(TRIM(?))          -- if you have an alias column
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
    if (conn)
      try {
        await conn.end();
      } catch {}
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Journal ID is required" },
      { status: 400 }
    );
  }

  const conn = await createDbConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT cover_image, banner_image, paper_template, copyright_form 
         FROM journals WHERE id = ?`,
      [id]
    );
    const journal = rows?.[0];

    if (!journal) {
      await conn.rollback();
      return NextResponse.json(
        { success: false, error: "Journal not found" },
        { status: 404 }
      );
    }

    await conn.query(`DELETE FROM journals WHERE id = ?`, [id]);

    if (journal.cover_image) removeFile(journal.cover_image);
    if (journal.banner_image) removeFile(journal.banner_image);
    if (journal.paper_template) removeFile(journal.paper_template);
    if (journal.copyright_form) removeFile(journal.copyright_form);

    await conn.commit();
    return NextResponse.json({
      success: true,
      message: "Journal and associated files deleted successfully",
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ DELETE /api/journals error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete journal" },
      { status: 500 }
    );
  } finally {
    await conn.end();
  }
}
