import { createDbConnection } from "@/lib/db";
import { NextResponse } from "next/server";

/* -------------------------------
   🟢 GET — Paginated Fetch
-------------------------------- */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  const conn = await createDbConnection();

  try {
    const [rows] = await conn.query(
      `
      SELECT jm.*, j.journal_name 
      FROM journal_mail_accounts jm
      JOIN journals j ON jm.journal_id = j.id
      ORDER BY jm.id DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    const [[{ total }]] = await conn.query(`
      SELECT COUNT(*) as total FROM journal_mail_accounts
    `);

    return NextResponse.json({ success: true, mails: rows, total });
  } catch (err) {
    console.error("GET /api/journals-mail Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  } finally {
    await conn.end();
  }
}

/* -------------------------------
   🟡 POST — Add Mail Config
-------------------------------- */
export async function POST(req) {
  const body = await req.json();
  const {
    journal_id,
    purpose,
    email,
    smtp_host,
    smtp_port,
    secure, // ✅ new field
    smtp_user,
    smtp_pass,
    is_active,
  } = body;

  if (!journal_id || !email) {
    return NextResponse.json(
      { success: false, message: "journal_id and email are required" },
      { status: 400 }
    );
  }

  const conn = await createDbConnection();

  try {
    await conn.query(
      `
      INSERT INTO journal_mail_accounts 
      (journal_id, purpose, email, smtp_host, smtp_port, secure, smtp_user, smtp_pass, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        journal_id,
        purpose || "editor",
        email,
        smtp_host || null,
        smtp_port || null,
        secure ? 1 : 0, // ✅ store as tinyint
        smtp_user || null,
        smtp_pass || null,
        is_active ? 1 : 0,
      ]
    );

    return NextResponse.json({ success: true, message: "Mail config added" });
  } catch (err) {
    console.error("POST /api/journals-mail Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  } finally {
    await conn.end();
  }
}

/* -------------------------------
   🟠 PATCH — Update Mail Config
-------------------------------- */
export async function PATCH(req) {
  const body = await req.json();
  const {
    id,
    journal_id,
    purpose,
    email,
    smtp_host,
    smtp_port,
    secure, // ✅ include secure update
    smtp_user,
    smtp_pass,
    is_active,
  } = body;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "id is required for update" },
      { status: 400 }
    );
  }

  const conn = await createDbConnection();

  try {
    await conn.query(
      `
      UPDATE journal_mail_accounts 
      SET journal_id = ?, 
          purpose = ?, 
          email = ?, 
          smtp_host = ?, 
          smtp_port = ?, 
          secure = ?, 
          smtp_user = ?, 
          smtp_pass = ?, 
          is_active = ?
      WHERE id = ?
      `,
      [
        journal_id,
        purpose,
        email,
        smtp_host,
        smtp_port,
        secure ? 1 : 0,
        smtp_user,
        smtp_pass,
        is_active ? 1 : 0,
        id,
      ]
    );

    return NextResponse.json({ success: true, message: "Mail config updated" });
  } catch (err) {
    console.error("PATCH /api/journals-mail Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  } finally {
    await conn.end();
  }
}

/* -------------------------------
   🔴 DELETE — Remove Mail Config
-------------------------------- */
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "id is required" },
      { status: 400 }
    );
  }

  const conn = await createDbConnection();

  try {
    await conn.query("DELETE FROM journal_mail_accounts WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Mail config deleted" });
  } catch (err) {
    console.error("DELETE /api/journals-mail Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  } finally {
    await conn.end();
  }
}
