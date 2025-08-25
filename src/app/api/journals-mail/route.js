import { createDbConnection } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  const conn = await createDbConnection();
  const [rows] = await conn.query(
    `SELECT jm.*, j.journal_name 
     FROM journal_mail_accounts jm
     JOIN journals j ON jm.journal_id = j.id
     ORDER BY jm.id DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const [[{ total }]] = await conn.query(`SELECT COUNT(*) as total FROM journal_mail_accounts`);

  await conn.end();
  return NextResponse.json({ success: true, mails: rows, total });
}

export async function POST(req) {
  const body = await req.json();
  const {
    journal_id,
    purpose,
    email,
    smtp_host,
    smtp_port,
    smtp_user,
    smtp_pass,
    is_active,
  } = body;

  const conn = await createDbConnection();
  await conn.query(
    `INSERT INTO journal_mail_accounts 
     (journal_id, purpose, email, smtp_host, smtp_port, smtp_user, smtp_pass, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [journal_id, purpose, email, smtp_host, smtp_port, smtp_user, smtp_pass, is_active]
  );
  await conn.end();

  return NextResponse.json({ success: true, message: "Mail config added" });
}

export async function PATCH(req) {
  const body = await req.json();
  const {
    id,
    journal_id,
    purpose,
    email,
    smtp_host,
    smtp_port,
    smtp_user,
    smtp_pass,
    is_active,
  } = body;

  const conn = await createDbConnection();
  await conn.query(
    `UPDATE journal_mail_accounts 
     SET journal_id = ?, purpose = ?, email = ?, smtp_host = ?, smtp_port = ?, smtp_user = ?, smtp_pass = ?, is_active = ?
     WHERE id = ?`,
    [journal_id, purpose, email, smtp_host, smtp_port, smtp_user, smtp_pass, is_active, id]
  );
  await conn.end();

  return NextResponse.json({ success: true, message: "Mail config updated" });
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const conn = await createDbConnection();
  await conn.query("DELETE FROM journal_mail_accounts WHERE id = ?", [id]);
  await conn.end();

  return NextResponse.json({ success: true, message: "Mail config deleted" });
}
