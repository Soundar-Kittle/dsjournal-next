// /api/articles/stage/[id]/status/route.js

import path from "path";
import fs , {writeFile} from "fs/promises";
import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";


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

// export async function PUT(req, context) {
//   const { id } = context.params;
//   const contentType = req.headers.get("content-type") || "";
//   const conn = await createDbConnection();

//   try {
//     // 1️⃣ Fetch staged article with related info
//     const [rows] = await conn.query(
//       `
//       SELECT 
//         sa.*, 
//         j.short_name AS journal_short,
//         v.volume_number AS volume_number,
//         i.issue_number AS issue_number
//       FROM staged_articles sa
//       LEFT JOIN journals j ON j.id = sa.journal_id
//       LEFT JOIN volumes v ON v.id = sa.volume_id
//       LEFT JOIN issues i ON i.id = sa.issue_id
//       WHERE sa.id = ?
//       LIMIT 1
//       `,
//       [id]
//     );

//     const existing = rows?.[0];
//     if (!existing) {
//       return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
//     }

//     // Prevent modification after publication
//     const lockedStatuses = ["published", "archived"];
//     if (lockedStatuses.includes(existing.status)) {
//       return NextResponse.json(
//         { ok: false, message: `Cannot update once ${existing.status}` },
//         { status: 403 }
//       );
//     }

//     let status = null;
//     let pdfPath = existing.pdf_path || null;
//     let body = {};

//     // 2️⃣ Handle multipart (approval with PDF upload)
//     if (contentType.includes("multipart/form-data")) {
//       const form = await req.formData();
//       status = form.get("status") || existing.status;
//       const file = form.get("file");

//       if (
//         status === "approved" &&
//         (!file || typeof file === "string" || !file.name.endsWith(".pdf"))
//       ) {
//         return NextResponse.json(
//           { ok: false, message: "PDF file is required for approval." },
//           { status: 400 }
//         );
//       }

//       if (file && typeof file !== "string") {
//         const journalFolder = cleanJournalFolderName(existing.journal_short);
//         const volumeFolder = `volume-${existing.volume_number || "NA"}`;
//         const issueFolder = `issue-${existing.issue_number || "NA"}`;

//         const baseName =
//           (existing.article_id || file.name.replace(/\.pdf$/i, "")) + ".pdf";

//         const uploadDir = path.join(
//           process.cwd(),
//           "public",
//           "uploads",
//           journalFolder,
//           volumeFolder,
//           issueFolder
//         );
//         await fs.mkdir(uploadDir, { recursive: true });

//         const filePath = path.join(uploadDir, baseName);
//         const buffer = Buffer.from(await file.arrayBuffer());
//         await fs.writeFile(filePath, buffer);

//         pdfPath = `/uploads/${journalFolder}/${volumeFolder}/${issueFolder}/${baseName}`;
//       }

//       body = {};
//     } else {
//       // 3️⃣ JSON body (for regular updates)
//       body = await req.json();
//       status = body.status || existing.status;
//     }

//     // 4️⃣ Prepare update fields
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
//       doi_url: body.doiUrl ?? body.doi_url,
//       pdf_path: pdfPath,
//       status,
//     };

//     const setClauses = [];
//     const vals = [];

//     for (const [col, val] of Object.entries(normalized)) {
//       if (val !== undefined && val !== null && val !== "") {
//         const colSql = col === "references" ? "`references`" : col;
//         setClauses.push(`${colSql} = ?`);
//         vals.push(typeof val === "object" ? JSON.stringify(val) : val);
//       }
//     }

//     if (!setClauses.length) {
//       return NextResponse.json({ ok: false, message: "No fields to update" }, { status: 400 });
//     }

//     const updateSql = `
//       UPDATE staged_articles 
//       SET ${setClauses.join(", ")}, updated_at = NOW()
//       WHERE id = ?
//     `;
//     await conn.query(updateSql, [...vals, id]);

//     // 5️⃣ When approved — copy to final articles
//     if (status === "approved") {
//       await conn.query(
//         `
//         INSERT INTO articles (
//           journal_id,
//           volume_id,
//           issue_id,
//           article_id,
//           article_title,
//           authors,
//           abstract,
//           keywords,
//           \`references\`,
//           page_from,
//           page_to,
//           received,
//           revised,
//           accepted,
//           published,
//           doi,
//           pdf_path,
//           created_at
//         )
//         SELECT
//           sa.journal_id,
//           sa.volume_id,
//           sa.issue_id,
//           sa.article_id,
//           sa.title,
//           sa.authors,
//           sa.abstract,
//           CASE
//             WHEN JSON_VALID(sa.keywords) THEN sa.keywords
//             ELSE JSON_QUOTE(sa.keywords)
//           END,
//           sa.\`references\`,
//           sa.pages_from,
//           sa.pages_to,
//           sa.received_date,
//           sa.revised_date,
//           sa.accepted_date,
//           sa.published_date,
//           sa.doi_url,
//           sa.pdf_path,
//           NOW()
//         FROM staged_articles sa
//         WHERE sa.id = ?
//         `,
//         [id]
//       );
//     }

//     return NextResponse.json({
//       ok: true,
//       status,
//       pdf_path: pdfPath,
//       message:
//         status === "approved"
//           ? "✅ Approved & published to articles"
//           : "Updated successfully",
//     });
//   } catch (e) {
//     console.error("❌ PUT /api/articles/stage/[id]/status failed:", e);
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


export async function PUT(req, context) {
  const { id } = context.params;
  const contentType = req.headers.get("content-type") || "";
  const conn = await createDbConnection();

  try {
    // 1️⃣ Fetch staged article
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
    if (!existing)
      return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

    const lockedStatuses = ["published", "archived"];
    if (lockedStatuses.includes(existing.status)) {
      return NextResponse.json(
        { ok: false, message: `Cannot update once ${existing.status}` },
        { status: 403 }
      );
    }

    let status = existing.status;
    let pdfPath = existing.pdf_path || null;
    let body = {};

    // 2️⃣ Multipart (PDF upload + status)
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

      // File saving
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

        if (existing.pdf_path) {
          const oldPath = path.join(process.cwd(), "public", existing.pdf_path);
          try {
            await fs.unlink(oldPath);
          } catch {}
        }

        const filePath = path.join(uploadDir, baseName);
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        pdfPath = `/uploads/${journalFolder}/${volumeFolder}/${issueFolder}/${baseName}`;
      }

      body = {};
    } else {
      // JSON body (regular update)
      body = await req.json();
      status = body.status || existing.status;
    }

    // 3️⃣ Normalize data
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
        vals.push(val);
      }
    }

    if (!setClauses.length)
      return NextResponse.json({ ok: false, message: "No fields to update" }, { status: 400 });

    // 4️⃣ Begin transaction
    await conn.beginTransaction();

    // Update staged article
    await conn.query(
      `
      UPDATE staged_articles 
      SET ${setClauses.join(", ")}, updated_at = NOW()
      WHERE id = ?
      `,
      [...vals, id]
    );

// 5️⃣ On approval — copy to articles, keep staged as approved
if (status === "approved") {
  // 🔹 Fetch month_from / month_to from month_groups
  const [monthRows] = await conn.query(
    `
    SELECT from_month, to_month
    FROM month_groups
    WHERE journal_id = ? AND volume_id = ? AND issue_id = ?
    LIMIT 1
    `,
    [existing.journal_id, existing.volume_id, existing.issue_id]
  );

  let monthFrom = monthRows?.[0]?.from_month || null;
  let monthTo = monthRows?.[0]?.to_month || null;

  // 🔹 Console debug
  console.log("🧾 month_groups lookup:", {
    journal_id: existing.journal_id,
    volume_id: existing.volume_id,
    issue_id: existing.issue_id,
    monthFrom,
    monthTo,
    raw: monthRows,
  });

  // Fallback: volume-level if issue-level not found
  if (!monthFrom || !monthTo) {
    const [fallback] = await conn.query(
      `
      SELECT from_month, to_month
      FROM month_groups
      WHERE journal_id = ? AND volume_id = ?
      ORDER BY id DESC LIMIT 1
      `,
      [existing.journal_id, existing.volume_id]
    );

    monthFrom = monthFrom || fallback?.[0]?.from_month || null;
    monthTo = monthTo || fallback?.[0]?.to_month || null;
  }

  // 🔹 Insert into articles
  await conn.query(
    `
    INSERT INTO articles (
      journal_id,
      volume_id,
      issue_id,
      month_from,
      month_to,
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
      ? AS month_from,
      ? AS month_to,
      sa.article_id,
      sa.title,
      sa.authors,
      sa.abstract,
      sa.keywords,
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
    [monthFrom, monthTo, id]
  );

  // Keep staged as approved
  await conn.query(
    `UPDATE staged_articles SET status = 'approved', updated_at = NOW() WHERE id = ?`,
    [id]
  );
}

    await conn.commit();

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
    await conn.rollback();
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