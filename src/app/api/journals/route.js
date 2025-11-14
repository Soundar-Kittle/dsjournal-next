import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";
import { handleFileUploads } from "@/lib/fileUpload";
import { removeFile } from "@/lib/removeFile";
import { cleanData } from "@/lib/utils";
import { revalidatePath, revalidateTag } from "next/cache";

export const runtime = "nodejs";

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
    const short_name =
      form.get("short_name")?.toString().trim().toUpperCase() || "";
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

    const slug = short_name.replace(/^DS-/i, "").toLowerCase();

    // Use INSERT ... SET ? to avoid value-count mismatches
    await conn.query("INSERT INTO journals SET ?", row);
    await conn.end();
    revalidateTag("journals");
    revalidateTag("journal_slug");
    revalidateTag("journal_month_groups");
    revalidateTag("journal_analytics");

    revalidatePath("/journals");
    revalidatePath(`/${slug}`);

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

export async function PATCH(req) {
  const conn = await createDbConnection();
  try {
    await conn.beginTransaction();

    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries());
    const cleanedData = cleanData(body);

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
      short_name: String(cleanedData.short_name)?.toUpperCase() || null,
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

    const slug = short_name.replace(/^DS-/i, "").toLowerCase();

    await conn.commit();
    revalidateTag("journals");
    revalidateTag("journal_slug");
    revalidateTag("journal_month_groups");
    revalidateTag("journal_analytics");

    revalidatePath("/journals");
    revalidatePath(`/${slug}`);
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

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("jid") || searchParams.get("id");
  const short = searchParams.get("short");
  const slug = searchParams.get("slug"); // e.g. "dst", "lll"
  const all = searchParams.get("all") === "true";

  let conn;
  try {
    conn = await createDbConnection();
    let rows = [];

    // 🟢 1️⃣ Fetch by ID
    if (id) {
      const [r] = await conn.query(
        `SELECT *, 
          (SELECT COUNT(*) FROM articles a WHERE a.journal_id = j.id) AS article_count 
         FROM journals j WHERE j.id = ? LIMIT 1`,
        [id]
      );
      rows = r;
    }

    // 🟢 2️⃣ Fetch by Short Name (case-insensitive)
    else if (short) {
      const [r] = await conn.query(
        `SELECT *, 
          (SELECT COUNT(*) FROM articles a WHERE a.journal_id = j.id) AS article_count 
         FROM journals j
         WHERE LOWER(TRIM(j.short_name)) = LOWER(TRIM(?)) 
         LIMIT 1`,
        [short]
      );
      rows = r;
    }

    // 🟢 3️⃣ Fetch by Slug (handles DS-, ds-, and clean slugs like “dst”)
    else if (slug) {
      const [r] = await conn.query(
        `
        SELECT *,
          (SELECT COUNT(*) FROM articles a WHERE a.journal_id = j.id) AS article_count
        FROM journals j
        WHERE 
          LOWER(REPLACE(j.short_name, 'DS-', '')) = LOWER(?)
          OR LOWER(REPLACE(j.short_name, 'ds-', '')) = LOWER(?)
          OR LOWER(j.short_name) = LOWER(?)
        LIMIT 1
        `,
        [slug, slug, slug]
      );
      rows = r;
    }

    // 🟢 4️⃣ Fetch all journals (sorted)
    else {
      const [r] = await conn.query(`
        SELECT 
          j.id,
          j.journal_name,
          j.short_name,
          j.issn_online,
          j.issn_print,
          j.cover_image,
          j.is_active,
          (
            SELECT COUNT(*) FROM articles a WHERE a.journal_id = j.id
          ) AS article_count
        FROM journals j
        ORDER BY j.sort_index ASC, j.id ASC
      `);
      rows = r;
    }

    await conn.end();

    // 🟩 Normalize output
    const journals = Array.isArray(rows) ? rows : rows ? [rows] : [];

    return NextResponse.json({
      success: true,
      count: journals.length,
      journals,
    });
  } catch (err) {
    if (conn)
      try {
        await conn.end();
      } catch {}

    console.error("❌ Journals API Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
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
      `SELECT cover_image, banner_image, paper_template, copyright_form, short_name
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

    const slug = journal.short_name?.replace(/^DS-/i, "").toLowerCase();

    await conn.query(`DELETE FROM journals WHERE id = ?`, [id]);

    if (journal.cover_image) removeFile(journal.cover_image);
    if (journal.banner_image) removeFile(journal.banner_image);
    if (journal.paper_template) removeFile(journal.paper_template);
    if (journal.copyright_form) removeFile(journal.copyright_form);

    await conn.commit();
    revalidateTag("journals");
    revalidateTag("journal_slug");
    revalidateTag("journal_month_groups");
    revalidateTag("journal_analytics");

    revalidatePath("/journals");
    revalidatePath(`/${slug}`);

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
