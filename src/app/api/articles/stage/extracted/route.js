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

export async function PUT(req, { params }) {
  const id = params.id;
  const body = await req.json();

  const {
    title, keywords, pages_from, pages_to,
    received_date, revised_date, accepted_date, published_date,
    article_id, referencesHtml // ⭐ expect full HTML from frontend
  } = body;

  const conn = await createDbConnection();
  try {
await conn.query(
  `UPDATE staged_articles
   SET title=?,
       keywords=?,
       pages_from=?,
       pages_to=?,
       received_date=?,
       revised_date=?,
       accepted_date=?,
       published_date=?,
       article_id=?,
       status='reviewing',
       \`references\`=?,   -- ✅ escaped with backticks
       updated_at=NOW()
   WHERE id=?`,
  [
    title, keywords, pages_from, pages_to,
    received_date, revised_date, accepted_date, published_date,
    article_id, referencesHtml, id
  ]
);


    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  } finally {
    await conn.end();
  }
}
