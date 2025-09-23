  import { NextResponse } from "next/server";
  import { createDbConnection } from "@/lib/db";

  export async function POST(req, { params }) {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
    }

    const { action } = await req.json().catch(() => ({}));
    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json({ success: false, message: "Action must be accept or reject" }, { status: 400 });
    }

    const conn = await createDbConnection();
    try {
      let sql;
      if (action === "accept") {
        sql = `UPDATE staged_articles 
              SET status='approved', accepted_date=NOW(), updated_at=NOW() 
              WHERE id=?`;
      } else {
        sql = `UPDATE staged_articles 
              SET status='rejected', updated_at=NOW() 
              WHERE id=?`;
      }
      await conn.query(sql, [id]);
      return NextResponse.json({ success: true, id, action });
    } catch (e) {
      return NextResponse.json({ success: false, message: String(e) }, { status: 500 });
    } finally {
      await conn.end();
    }
  }

