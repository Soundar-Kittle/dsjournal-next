import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";

export async function GET() {
  const conn = await createDbConnection();
  try {
    const [rows] = await conn.query(
      `SELECT id, journal_id, file_name, title, abstract, keywords, references,
              year, volume_number, issue_number, created_at, updated_at
       FROM staged_articles
       WHERE status = 'extracted'
       ORDER BY updated_at DESC`
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (e) {
    return NextResponse.json({ success: false, message: String(e) }, { status: 500 });
  } finally {
    await conn.end();
  }
}
