import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";


// GET /api/month-groups?journal_id=123&issue_id=456
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const journal_id = parseInt(searchParams.get("journal_id"));
  const issue_id = parseInt(searchParams.get("issue_id"));
  const connection = await createDbConnection();

  try {
    const [months] = await connection.query(
      `SELECT id, from_month, to_month
       FROM month_groups
       WHERE journal_id = ? AND issue_id = ?`,
      [journal_id, issue_id]
    );

    return NextResponse.json({ success: true, months });
  } catch (error) {
    console.error("Month group fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch month groups" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

export async function POST(req) {
  const connection = await createDbConnection();

  try {
    const body = await req.json();
    const { journal_id, issue_id, from_month, to_month } = body;

    if (!journal_id || !issue_id || !from_month) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const [existing] = await connection.query(
      `SELECT id FROM month_groups WHERE journal_id = ? AND issue_id = ? AND from_month = ?`,
      [journal_id, issue_id, from_month]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Month group already exists for this issue" },
        { status: 409 }
      );
    }

    const [result] = await connection.query(
      `INSERT INTO month_groups (journal_id, issue_id, from_month, to_month, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [journal_id, issue_id, from_month, to_month || null]
    );

    return NextResponse.json({
      success: true,
      message: "Month group created successfully",
      insertedId: result.insertId
    });
  } catch (error) {
    console.error("Month group creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create month group" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
