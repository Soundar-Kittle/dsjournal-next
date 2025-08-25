import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";

export async function POST(req) {
  let conn;
  try {
    const { orderedIds } = await req.json();
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ success: false, message: "orderedIds required" }, { status: 400 });
    }

    const ids = orderedIds.map(Number).filter(Number.isFinite);
    if (ids.length === 0) {
      return NextResponse.json({ success: false, message: "No valid ids" }, { status: 400 });
    }

    const cases = ids.map((id, idx) => `WHEN ${id} THEN ${idx}`).join(" ");
    const inList = ids.join(",");

    const sql = `
      UPDATE journals
      SET sort_index = CASE id ${cases} END
      WHERE id IN (${inList})
    `;

    conn = await createDbConnection();
    await conn.beginTransaction();
    await conn.query(sql);
    await conn.commit();

    return NextResponse.json({ success: true });
  } catch (e) {
    if (conn) try { await conn.rollback(); } catch {}
    console.error("reorder bulk error:", e);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  } finally {
    if (conn) try { await conn.end(); } catch {}
  }
}
