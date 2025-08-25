import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";


// GET /api/volume?journal_id=123
// GET /api/volume?journal_id=2&year=2025
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const journal_id = parseInt(searchParams.get("journal_id"));
  const year = parseInt(searchParams.get("year"));

  if (!journal_id) {
    return NextResponse.json({ success: false, message: "Missing journal_id" }, { status: 400 });
  }

  const connection = await createDbConnection();

  try {
    const [volumes] = await connection.query(
      `SELECT id, volume_number, volume_label, alias_name
       FROM volumes
       WHERE journal_id = ?
       ${year ? "AND year = ?" : ""}`,
      year ? [journal_id, year] : [journal_id]
    );

    return NextResponse.json({ success: true, volumes });
  } catch (error) {
    console.error("Volume fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch volumes" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

// POST /api/volume
export async function POST(req) {
  const connection = await createDbConnection();

  try {
    const body = await req.json();
    const { journal_id, volume_number, volume_label, alias_name, year } = body;

    if (!journal_id || !volume_number || !volume_label || !year) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for duplicate volume_number in the same journal
    const [existing] = await connection.query(
      `SELECT id FROM volumes WHERE journal_id = ? AND volume_number = ?`,
      [journal_id, volume_number]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Volume number already exists" },
        { status: 409 }
      );
    }

    const [result] = await connection.query(
      `INSERT INTO volumes (journal_id, volume_number, volume_label, alias_name, year)
       VALUES (?, ?, ?, ?, ?)`,
      [journal_id, volume_number, volume_label, alias_name || null, year]
    );

    return NextResponse.json({
      success: true,
      message: "Volume created successfully",
      insertedId: result.insertId
    });
  } catch (error) {
    console.error("Volume creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create volume" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
