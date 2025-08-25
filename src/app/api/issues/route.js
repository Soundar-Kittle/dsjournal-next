import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const journal_id = parseInt(searchParams.get("journal_id"));
  const month_id = parseInt(searchParams.get("month_id")); // optional

  const connection = await createDbConnection();

  try {
    let query = `SELECT id, issue_number, issue_label, alias_name, journal_id
                 FROM issues
                 WHERE journal_id = ?`;
    let params = [journal_id];

    if (!isNaN(month_id)) {
      query += " AND month_id = ?";
      params.push(month_id);
    }

    const [issues] = await connection.query(query, params);

    return NextResponse.json({ success: true, issues });
  } catch (error) {
    console.error("Issue fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch issues" },
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
    const { journal_id, issue_number, issue_label, alias_name } = body;

    if (!journal_id || !issue_number || !issue_label ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for duplicate issue_number for same journal
    const [existing] = await connection.query(
      `SELECT id FROM issues WHERE journal_id = ? AND issue_number = ?`,
      [journal_id, issue_number]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Issue number already exists" },
        { status: 409 }
      );
    }

    const [result] = await connection.query(
      `INSERT INTO issues (journal_id, issue_number, issue_label, alias_name, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
      [journal_id, issue_number, issue_label, alias_name || null]
    );

    return NextResponse.json({
      success: true,
      message: "Issue created successfully",
      insertedId: result.insertId
    });
  } catch (error) {
    console.error("Issue creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create issue" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
