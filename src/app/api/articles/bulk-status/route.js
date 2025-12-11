import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";
import { revalidateTag } from "next/cache";

export async function POST(req) {
  const conn = await createDbConnection();

  try {
    const body = await req.json();
    const { ids, status } = body;

    console.log("Body:", body);

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "No article IDs provided" },
        { status: 400 }
      );
    }

    if (status !== "published" && status !== "unpublished") {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    // Prepare safe normalized IDs
    const normalizedIds = ids.map((id) => id.trim().toUpperCase());
    const placeholders = normalizedIds.map(() => "?").join(",");

    // 🔥 UPDATE WITH TRIM + UPPER → SOLVES THE MATCH ISSUE
    const [result] = await conn.query(
      `
      UPDATE articles
      SET article_status = ?, updated_at = NOW()
      WHERE TRIM(UPPER(article_id)) IN (${placeholders})
      `,
      [status, ...normalizedIds]
    );

    console.log("UPDATE RESULT:", result);

    // 🔍 Fetch updated rows
    const [rowsAfter] = await conn.query(
      `
      SELECT id, article_id, article_status
      FROM articles
      WHERE TRIM(UPPER(article_id)) IN (${placeholders})
      `,
      [...normalizedIds]
    );

    console.log("Rows AFTER update:", rowsAfter);

    revalidateTag("articles", "max");
    revalidateTag("volume-issue", "max");
    revalidateTag("journal_month_groups", "max");

    return NextResponse.json({
      success: true,
      updated: result.changedRows,
      rowsAfter,
    });
    
  } catch (err) {
    console.error("Bulk update error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
