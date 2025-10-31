  // import { NextResponse } from "next/server";
  // import { createDbConnection } from "@/lib/db";

  // export async function POST(req, { params }) {
  //   const id = Number(params.id);
  //   if (!Number.isFinite(id)) {
  //     return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
  //   }

  //   const { action } = await req.json().catch(() => ({}));
  //   if (!["accept", "reject"].includes(action)) {
  //     return NextResponse.json({ success: false, message: "Action must be accept or reject" }, { status: 400 });
  //   }

  //   const conn = await createDbConnection();
  //   try {
  //     let sql;
  //     if (action === "accept") {
  //       sql = `UPDATE staged_articles 
  //             SET status='approved', accepted_date=NOW(), updated_at=NOW() 
  //             WHERE id=?`;
  //     } else {
  //       sql = `UPDATE staged_articles 
  //             SET status='rejected', updated_at=NOW() 
  //             WHERE id=?`;
  //     }
  //     await conn.query(sql, [id]);
  //     return NextResponse.json({ success: true, id, action });
  //   } catch (e) {
  //     return NextResponse.json({ success: false, message: String(e) }, { status: 500 });
  //   } finally {
  //     await conn.end();
  //   }
  // }

// /api/articles/stage/[id]/status/route.js

import path from "path";
import fs , {writeFile} from "fs/promises";
import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";


// function cleanJournalFolderName(shortNameRaw) {
//   if (!shortNameRaw) return "unknown_journal";
//   let s = String(shortNameRaw).trim();
//   // Remove prefix like "DS-" from "DS-DST"
//   const dashIdx = s.indexOf("-");
//   if (dashIdx !== -1) s = s.slice(dashIdx + 1).trim();
//   return s.replace(/\s+/g, "_") || "unknown_journal";
// }

// Fallback util if not imported
function cleanJournalFolderName(name) {
  if (!name) return "unknown_journal";
  return name
    .replace(/^DS-/, "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toUpperCase();
}

export async function PUT(req, context) {
  const { id } = context.params;
  const contentType = req.headers.get("content-type") || "";
  const conn = await createDbConnection();

  try {
    // 1️⃣ Fetch staged article with related info
    const [rows] = await conn.query(
      `
      SELECT 
        sa.*, 
        j.short_name AS journal_short,
        v.volume_number AS volume_number,
        i.issue_number AS issue_number
      FROM staged_articles sa
      LEFT JOIN journals j ON j.id = sa.journal_id
      LEFT JOIN volumes v ON v.id = sa.volume_id
      LEFT JOIN issues i ON i.id = sa.issue_id
      WHERE sa.id = ?
      LIMIT 1
      `,
      [id]
    );

    const existing = rows?.[0];
    if (!existing) {
      return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
    }

    // Prevent modification after publication
    const lockedStatuses = ["published", "archived"];
    if (lockedStatuses.includes(existing.status)) {
      return NextResponse.json(
        { ok: false, message: `Cannot update once ${existing.status}` },
        { status: 403 }
      );
    }

    let status = null;
    let pdfPath = existing.pdf_path || null;
    let body = {};

    // 2️⃣ Handle multipart (approval with PDF upload)
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      status = form.get("status") || existing.status;
      const file = form.get("file");

      if (
        status === "approved" &&
        (!file || typeof file === "string" || !file.name.endsWith(".pdf"))
      ) {
        return NextResponse.json(
          { ok: false, message: "PDF file is required for approval." },
          { status: 400 }
        );
      }

      if (file && typeof file !== "string") {
        const journalFolder = cleanJournalFolderName(existing.journal_short);
        const volumeFolder = `volume-${existing.volume_number || "NA"}`;
        const issueFolder = `issue-${existing.issue_number || "NA"}`;

        const baseName =
          (existing.article_id || file.name.replace(/\.pdf$/i, "")) + ".pdf";

        const uploadDir = path.join(
          process.cwd(),
          "public",
          "uploads",
          journalFolder,
          volumeFolder,
          issueFolder
        );
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, baseName);
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        pdfPath = `/uploads/${journalFolder}/${volumeFolder}/${issueFolder}/${baseName}`;
      }

      body = {};
    } else {
      // 3️⃣ JSON body (for regular updates)
      body = await req.json();
      status = body.status || existing.status;
    }

    // 4️⃣ Prepare update fields
    const normalized = {
      title: body.title,
      abstract: body.abstract,
      authors: body.authors,
      keywords: body.keywords,
      references: body.references,
      volume_number: body.volumeNumber ?? body.volume_number,
      issue_number: body.issueNumber ?? body.issue_number,
      year: body.year,
      pages_from: body.pagesFrom ?? body.pages_from,
      pages_to: body.pagesTo ?? body.pages_to,
      doi_url: body.doiUrl ?? body.doi_url,
      pdf_path: pdfPath,
      status,
    };

    const setClauses = [];
    const vals = [];

    for (const [col, val] of Object.entries(normalized)) {
      if (val !== undefined && val !== null && val !== "") {
        const colSql = col === "references" ? "`references`" : col;
        setClauses.push(`${colSql} = ?`);
        vals.push(typeof val === "object" ? JSON.stringify(val) : val);
      }
    }

    if (!setClauses.length) {
      return NextResponse.json({ ok: false, message: "No fields to update" }, { status: 400 });
    }

    const updateSql = `
      UPDATE staged_articles 
      SET ${setClauses.join(", ")}, updated_at = NOW()
      WHERE id = ?
    `;
    await conn.query(updateSql, [...vals, id]);

    // 5️⃣ When approved — copy to final articles
    if (status === "approved") {
      await conn.query(
        `
        INSERT INTO articles (
          journal_id,
          volume_id,
          issue_id,
          article_id,
          article_title,
          authors,
          abstract,
          keywords,
          \`references\`,
          page_from,
          page_to,
          received,
          revised,
          accepted,
          published,
          doi,
          pdf_path,
          created_at
        )
        SELECT
          sa.journal_id,
          sa.volume_id,
          sa.issue_id,
          sa.article_id,
          sa.title,
          sa.authors,
          sa.abstract,
          CASE
            WHEN JSON_VALID(sa.keywords) THEN sa.keywords
            ELSE JSON_QUOTE(sa.keywords)
          END,
          sa.\`references\`,
          sa.pages_from,
          sa.pages_to,
          sa.received_date,
          sa.revised_date,
          sa.accepted_date,
          sa.published_date,
          sa.doi_url,
          sa.pdf_path,
          NOW()
        FROM staged_articles sa
        WHERE sa.id = ?
        `,
        [id]
      );
    }

    return NextResponse.json({
      ok: true,
      status,
      pdf_path: pdfPath,
      message:
        status === "approved"
          ? "✅ Approved & published to articles"
          : "Updated successfully",
    });
  } catch (e) {
    console.error("❌ PUT /api/articles/stage/[id]/status failed:", e);
    return NextResponse.json(
      { ok: false, message: e?.sqlMessage || e?.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    try {
      await conn.end();
    } catch {}
  }
}
// export async function PUT(req, context) {
//   const { id } = await context.params;
//   const body = await req.json();
//   const conn = await createDbConnection();

//   try {
//     // 1️⃣ Fetch current record
//     const [[existing]] = await conn.query(
//       "SELECT * FROM staged_articles WHERE id=? LIMIT 1",
//       [id]
//     );

//     if (!existing) {
//       return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
//     }

//     // 2️⃣ Status lock rule
//     const lockedStatuses = ["published", "archived"];
//     if (lockedStatuses.includes(existing.status)) {
//       return NextResponse.json(
//         { ok: false, message: `Cannot update once ${existing.status}` },
//         { status: 403 }
//       );
//     }

//     // 3️⃣ Normalize keys from frontend (camelCase → snake_case)
//     const normalized = {
//       title: body.title,
//       abstract: body.abstract,
//       authors: body.authors,
//       keywords: body.keywords,
//       references: body.references,
//       volume_number: body.volumeNumber ?? body.volume_number,
//       issue_number: body.issueNumber ?? body.issue_number,
//       year: body.year,
//       pages_from: body.pagesFrom ?? body.pages_from,
//       pages_to: body.pagesTo ?? body.pages_to,
//       status: body.status,
//       doi_url: body.doiUrl ?? body.doi_url,
//     };

//     // 4️⃣ Build dynamic SQL
//     const fields = [];
//     const values = [];

//     for (const [key, val] of Object.entries(normalized)) {
//       if (val !== undefined && val !== null && val !== "") {
//         const column = key === "references" ? "`references` = ?" : `${key} = ?`;
//         fields.push(column);
//         values.push(typeof val === "object" ? JSON.stringify(val) : val);
//       }
//     }

//     if (!fields.length) {
//       return NextResponse.json(
//         { ok: false, message: "No fields to update" },
//         { status: 400 }
//       );
//     }

//     // 5️⃣ Execute
//     const sql = `UPDATE staged_articles SET ${fields.join(", ")}, updated_at=NOW() WHERE id=?`;
//     await conn.query(sql, [...values, id]);

//     // 6️⃣ Optional: if final approval, you can auto-copy into articles table here
//     if (body.status === "approved") {
//       await conn.query(
//         `
//         INSERT INTO articles (
//           journal_id, title, article_id, abstract, authors, keywords, references,
//           volume_number, issue_number, year, pages_from, pages_to, doi_url, pdf_path, created_at
//         )
//         SELECT 
//           journal_id, title, article_id, abstract, authors, keywords, references,
//           volume_number, issue_number, year, pages_from, pages_to, doi_url, NULL, NOW()
//         FROM staged_articles WHERE id=?;
//         `,
//         [id]
//       );
//     }

//     return NextResponse.json({ ok: true, message: "Updated successfully" });
//   } catch (e) {
//     console.error("PUT /api/articles/stage/[id]/status failed:", e);
//     return NextResponse.json(
//       { ok: false, message: e?.sqlMessage || e?.message || "Internal Server Error" },
//       { status: 500 }
//     );
//   } finally {
//     try {
//       await conn.end();
//     } catch {}
//   }
// }

