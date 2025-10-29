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
import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";

function safeJson(str, fallback = []) {
  try {
    if (typeof str === "string") return JSON.parse(str || "[]");
    if (Array.isArray(str)) return str;
    return fallback;
  } catch {
    return fallback;
  }
}



export async function PUT(req, context) {
  const { id } = await context.params; // ✅ fixed
  const body = await req.json();
  const conn = await createDbConnection();

  try {
    // 1️⃣ Fetch current record
    const [[existing]] = await conn.query(
      "SELECT status FROM staged_articles WHERE id=? LIMIT 1",
      [id]
    );

    if (!existing) {
      return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
    }

    // 2️⃣ Optional lock rule
    const lockedStatuses = ["published", "archived"];
    if (lockedStatuses.includes(existing.status)) {
      return NextResponse.json(
        { ok: false, message: `Cannot update once ${existing.status}` },
        { status: 403 }
      );
    }

    // 3️⃣ Normalize keys from frontend (camelCase → snake_case)
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
      status: body.status,
      doi_url: body.doiUrl ?? body.doi_url,
    };

    // 4️⃣ Build dynamic SQL
    const fields = [];
    const values = [];

    for (const [key, val] of Object.entries(normalized)) {
      if (val !== undefined && val !== null && val !== "") {
        const column =
          key === "references" ? "`references` = ?" : `${key} = ?`;
        fields.push(column);
        values.push(
          typeof val === "object" ? JSON.stringify(val) : val
        );
      }
    }

    if (!fields.length) {
      return NextResponse.json(
        { ok: false, message: "No fields to update" },
        { status: 400 }
      );
    }

    // 5️⃣ Execute
    const sql = `UPDATE staged_articles SET ${fields.join(", ")}, updated_at=NOW() WHERE id=?`;
    await conn.query(sql, [...values, id]);

    return NextResponse.json({ ok: true, message: "Updated successfully" });
  } catch (e) {
    console.error("PUT /api/articles/stage/[id]/status failed:", e);
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