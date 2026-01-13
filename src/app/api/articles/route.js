import { NextResponse } from "next/server";
import { parseForm } from "@/lib/parseForm";
import { createDbConnection } from "@/lib/db";
import path from "path";
// import fs, { writeFile } from "fs";
import fs from "fs/promises";
import { revalidatePath, revalidateTag } from "next/cache";
import { getJournalSlug } from "@/utils/getJouralSlug";

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

/**
 * Safely convert authors/keywords from UI into JSON array
 */
function parseToArray(value) {
  if (!value) return [];

  let output = [];

  // First try JSON.parse (edit mode sends ["A","B"])
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((v) => String(v).trim()).filter(Boolean);
    }
  } catch {}

  // Fallback: split by comma (add mode sends "A, B")
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function POST(req) {
  const conn = await createDbConnection();
  try {
    const { fields, files } = await parseForm(req);
    const idNum = fields.id ? Number(fields.id) : 0;

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

    // ------------------------------
    // SAFE JSON HANDLING (FIXED)
    // ------------------------------
    const authorArray = parseToArray(authors);
    const keywordArray = parseToArray(keywords);

    // ------------------------------
    // Required validation (KEEP SAME)
    // ------------------------------
    if (!journal_id || !volume_id || !issue_id || !article_id) {
      return NextResponse.json(
        { success: false, message: "Required fields missing." },
        { status: 400 }
      );
    }

    // --- Fetch journal prefix
    const [[jr]] = await conn.query(
      "SELECT short_name FROM journals WHERE id = ? LIMIT 1",
      [journal_id]
    );
    if (!jr)
      return NextResponse.json(
        { success: false, message: "Invalid journal_id" },
        { status: 400 }
      );

    let expectedPrefix = jr.short_name.replace(/^DS-/, "").trim().toUpperCase();
    const journalSlug = expectedPrefix.toLowerCase();

    // --- Validate article ID prefix
    const articleIdUpper = String(article_id).trim().toUpperCase();
    const validPrefixPattern = new RegExp(
      `^${expectedPrefix}-V\\d+I\\d+P\\d+$`,
      "i"
    );

    if (!validPrefixPattern.test(articleIdUpper)) {
      return NextResponse.json(
        {
          success: false,
          message: `Article ID must follow ${expectedPrefix}-V<vol>I<issue>P<num>`,
        },
        { status: 400 }
      );
    }

    // ------------------------------
    // Handle PDF upload
    // ------------------------------
    let pdfPath = null;
    const uploaded = files?.pdf?.[0];
    // if (uploaded?.relativePath) {
    //   pdfPath = uploaded.relativePath.startsWith("/")
    //     ? uploaded.relativePath
    //     : `/${uploaded.relativePath}`;
    // }
    if (uploaded?.relativePath) {
      pdfPath = uploaded.relativePath;
    }

    // ------------------------------
    // Build insert payload
    // ------------------------------
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
      authors: JSON.stringify(authorArray), // FIXED
      abstract: abstract?.trim() ? abstract : null,
      keywords: JSON.stringify(keywordArray), // FIXED
      references: references?.trim() ? references : null,
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

    const [result] = await conn.query(sql, Object.values(payload));
    revalidateTag("articles", "max");
    revalidateTag("volume-issue", "max");
    revalidateTag("journal_month_groups", "max");
    // --- Fetch volume & issue numbers for revalidation
    const [[volRow]] = await conn.query(
      "SELECT volume_number FROM volumes WHERE id = ?",
      [volume_id]
    );
    const [[issRow]] = await conn.query(
      "SELECT issue_number FROM issues WHERE id = ?",
      [issue_id]
    );
    const volNum = volRow?.volume_number;
    const issNum = issRow?.issue_number;

    revalidatePath(`/${journalSlug}/archives`);
    revalidatePath(`/${journalSlug}/${article_id}`);
    revalidatePath(`/${journalSlug}/current-issue`);
    if (volNum && issNum) {
      revalidatePath(`/${journalSlug}/archives/volume${volNum}/issue${issNum}`);
    }

    return NextResponse.json({
      success: true,
      message: "Article added successfully.",
      insertedId: result.insertId,
    });
  } catch (e) {
    console.error("POST /api/articles error:", e);
    return NextResponse.json(
      { success: false, message: e.message || "Failed to save article" },
      { status: 500 }
    );
  } finally {
    await conn.end();
  }
}

export async function PUT(req) {
  const conn = await createDbConnection();

  try {
    const formData = await req.formData();
    const id = formData.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID required" },
        { status: 400 }
      );
    }

    const journal_id = Number(formData.get("journal_id"));
    const volume_id = Number(formData.get("volume_id"));
    const issue_id = Number(formData.get("issue_id"));
    const article_id = Number(formData.get("article_id"));

    let updates = {};

    // --------------------------------------
    // PARSE NORMAL FIELDS
    // --------------------------------------
    for (const [key, value] of formData.entries()) {
      if (key === "pdf" || key === "remove_pdf") continue;

      if (key === "authors") {
        updates.authors = JSON.stringify(parseToArray(value));
      } else if (key === "keywords") {
        updates.keywords = JSON.stringify(parseToArray(value));
      } else {
        updates[key] = value ?? null;
      }
    }

    // --------------------------------------
    // FETCH OLD PDF PATH
    // --------------------------------------
    const [[oldRow]] = await conn.query(
      "SELECT pdf_path ,article_id FROM articles WHERE id = ? LIMIT 1",
      [id]
    );
    const article_number = oldRow?.article_id;

    const oldPdfPath = oldRow?.pdf_path
      ? path.join(process.cwd(), "public", oldRow.pdf_path.replace(/^\/+/, ""))
      : null;

    const newFile = formData.get("pdf");
    const removeFlag = formData.get("remove_pdf") === "1";

    const uploadDir = path.join(process.cwd(), "public", "uploads", "articles");
    await fs.mkdir(uploadDir, { recursive: true });

    // Helper → check if file exists
    async function fileExists(file) {
      try {
        await fs.access(file);
        return true;
      } catch {
        return false;
      }
    }

    // --------------------------------------
    // RULE 1: New file uploaded → REPLACE old
    // --------------------------------------
    if (newFile && newFile.size > 0) {
      const fileName = newFile.name;
      const newFullPath = path.join(uploadDir, fileName);

      // Delete old PDF if exists
      if (oldPdfPath && (await fileExists(oldPdfPath))) {
        await fs.unlink(oldPdfPath);
      }

      // Save new PDF
      const buffer = Buffer.from(await newFile.arrayBuffer());
      await fs.writeFile(newFullPath, buffer);

      updates.pdf_path = `uploads/articles/${fileName}`;
    }

    // --------------------------------------
    // RULE 2: No new file + remove flag → delete file
    // --------------------------------------
    else if (removeFlag) {
      if (oldPdfPath && (await fileExists(oldPdfPath))) {
        await fs.unlink(oldPdfPath);
      }
      updates.pdf_path = "";
    }

    // --------------------------------------
    // RULE 3: No new file, no remove → keep old path
    // (DO NOTHING → do not include pdf_path in updates)
    // --------------------------------------

    // --------------------------------------
    // BUILD SQL UPDATE QUERY
    // --------------------------------------
    const fields = Object.keys(updates)
      .map((k) => (k === "references" ? "`references` = ?" : `${k} = ?`))
      .join(", ");

    const values = Object.values(updates);

    if (fields.length > 0) {
      await conn.query(
        `UPDATE articles SET ${fields}, updated_at = NOW() WHERE id = ?`,
        [...values, id]
      );
    }

    // --------------------------------------
    // CACHE REVALIDATION
    // --------------------------------------
    let slug = null;
    if (journal_id) {
      const { slug: s } = await getJournalSlug(conn, journal_id);
      slug = s;
    }

    revalidateTag("articles", "max");
    revalidateTag("volume-issue", "max");
    revalidateTag("journal_month_groups", "max");

    if (slug) {
      // --- Fetch volume & issue numbers for revalidation
      const [[volRow]] = await conn.query(
        "SELECT volume_number FROM volumes WHERE id = ?",
        [volume_id]
      );
      const [[issRow]] = await conn.query(
        "SELECT issue_number FROM issues WHERE id = ?",
        [issue_id]
      );
      const volNum = volRow?.volume_number;
      const issNum = issRow?.issue_number;

      revalidatePath(`/${slug}/archives`);
      revalidatePath(`/${slug}/${article_number}`);
      revalidatePath(`/${slug}/current-issue`);
      if (volNum && issNum) {
        revalidatePath(`/${slug}/archives/volume${volNum}/issue${issNum}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Article updated successfully.",
    });
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  } finally {
    await conn.end();
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

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Article ID is required" },
      { status: 400 }
    );
  }

  const conn = await createDbConnection();

  try {
    // Fetch PDF path if any
    const [rows] = await conn.query(
      "SELECT pdf_path, journal_id, article_id, volume_id, issue_id FROM articles WHERE id = ? LIMIT 1",
      [id]
    );

    const pdfPath = rows?.[0]?.pdf_path
      ? rows[0].pdf_path.replace(/^\/+/, "")
      : null;

    const journal_id = rows?.[0]?.journal_id;
    const article_id = rows?.[0]?.article_id;
    const volume_id = rows?.[0]?.volume_id;
    const issue_id = rows?.[0]?.issue_id;

    // Delete DB row
    await conn.query("DELETE FROM articles WHERE id = ?", [id]);

    // Delete PDF if it exists
    if (pdfPath) {
      const fullPath = path.join(process.cwd(), "public", pdfPath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
    }

    let slug = null;
    if (journal_id) {
      const slugRes = await getJournalSlug(conn, journal_id);
      slug = slugRes.slug;
    }

    // --- Fetch volume & issue numbers for revalidation
    let volNum = null;
    let issNum = null;
    if (volume_id && issue_id) {
      const [[volRow]] = await conn.query(
        "SELECT volume_number FROM volumes WHERE id = ?",
        [volume_id]
      );
      const [[issRow]] = await conn.query(
        "SELECT issue_number FROM issues WHERE id = ?",
        [issue_id]
      );
      volNum = volRow?.volume_number;
      issNum = issRow?.issue_number;
    }

    revalidateTag("articles", "max");
    revalidateTag("volume-issue", "max");
    revalidateTag("journal_month_groups", "max");
    revalidatePath(`/${slug}/archives`);
    revalidatePath(`/${slug}/${article_id}`);
    revalidatePath(`/${slug}/current-issue`);
    if (volNum && issNum) {
      revalidatePath(`/${slug}/archives/volume${volNum}/issue${issNum}`);
    }
    return NextResponse.json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.sqlMessage || err.message || "Error deleting article",
      },
      { status: 500 }
    );
  } finally {
    await conn.end();
  }
}
