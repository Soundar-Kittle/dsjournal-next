import { createDbConnection } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const journalId = searchParams.get("journalId");

  const conn = await createDbConnection();
  const [rows] = await conn.query(
    `SELECT jer.id, jer.journal_id, jer.member_id, jer.title_id,
            em.name AS member_name, et.title AS title_name
     FROM journal_editorial_roles jer
     JOIN editorial_members em ON jer.member_id = em.id
     JOIN editorial_titles et ON jer.title_id = et.id
     WHERE jer.journal_id = ?`,
    [journalId]
  );
  await conn.end();
  return NextResponse.json({ success: true, roles: rows });
}

export async function POST(req) {
  const body = await req.json();
  const { journal_id, member_id, title_id } = body;
  const conn = await createDbConnection();
  await conn.query(
    `INSERT INTO journal_editorial_roles (journal_id, member_id, title_id) VALUES (?, ?, ?)`,
    [journal_id, member_id, title_id]
  );
  await conn.end();
  return NextResponse.json({ success: true, message: "Role assigned" });
}

export async function PATCH(req) {
  const body = await req.json();
  const { id, title_id, member_id } = body;
  const conn = await createDbConnection();
  await conn.query(
    `UPDATE journal_editorial_roles SET title_id = ?, member_id = ? WHERE id = ?`,
    [title_id, member_id, id]
  );
  await conn.end();
  return NextResponse.json({ success: true, message: "Role updated" });
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const conn = await createDbConnection();
  await conn.query("DELETE FROM journal_editorial_roles WHERE id = ?", [id]);
  await conn.end();
  return NextResponse.json({ success: true, message: "Role deleted" });
}
