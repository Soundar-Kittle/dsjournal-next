// import { NextResponse } from "next/server";
// import { createDbConnection } from "@/lib/db";


// export const dynamic = "force-dynamic";

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const journal_id = searchParams.get("journal_id");

//   if (!journal_id) {
//     return NextResponse.json({ success: false, message: "journal_id is required" }, { status: 400 });
//   }

//   const connection = await createDbConnection();
//   try {
//     const [rows] = await connection.query(
//       `SELECT id, journal_id, issue_number, issue_label, alias_name
//        FROM issues
//        WHERE journal_id = ?`,
//       [journal_id]
//     );
//     return NextResponse.json({ success: true, issues: rows });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ success: false, message: "Error fetching issues" }, { status: 500 });
//   } finally {
//     await connection.end();
//   }
// }


// export async function POST(req) {
//   const connection = await createDbConnection();

//   try {
//     const body = await req.json();
//     const { journal_id, issue_number, issue_label, alias_name } = body;

//     if (!journal_id || !issue_number || !issue_label ) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Check for duplicate issue_number for same journal
//     const [existing] = await connection.query(
//       `SELECT id FROM issues WHERE journal_id = ? AND issue_number = ?`,
//       [journal_id, issue_number]
//     );

//     if (existing.length > 0) {
//       return NextResponse.json(
//         { success: false, message: "Issue number already exists" },
//         { status: 409 }
//       );
//     }

//     const [result] = await connection.query(
//       `INSERT INTO issues (journal_id, issue_number, issue_label, alias_name, is_active, created_at, updated_at)
//        VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
//       [journal_id, issue_number, issue_label, alias_name || null]
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Issue created successfully",
//       insertedId: result.insertId
//     });
//   } catch (error) {
//     console.error("Issue creation error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to create issue" },
//       { status: 500 }
//     );
//   } finally {
//     await connection.end();
//   }
// }

// export async function PUT(req) {
//   const body = await req.json();
//   const connection = await createDbConnection();

//   try {
//     await connection.query(
//       `UPDATE volumes SET volume_number=?, volume_label=?, alias_name=?, year=? WHERE id=?`,
//       [body.volume_number, body.volume_label, body.alias_name, body.year, body.id]
//     );
//     return NextResponse.json({ success: true, message: "Volume updated" });
//   } finally {
//     await connection.end();
//   }
// }

import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";

export const dynamic = "force-dynamic";

// ✅ GET issues by journal + volume
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const journal_id = searchParams.get("journal_id");
  const volume_id = searchParams.get("volume_id");

  if (!journal_id) {
    return NextResponse.json({ success: false, message: "journal_id is required" }, { status: 400 });
  }

  const connection = await createDbConnection();
  try {
    let query = `SELECT id, journal_id, volume_id, issue_number, issue_label, alias_name 
                 FROM issues 
                 WHERE journal_id = ?`;
    let params = [journal_id];

    if (volume_id) {
      query += ` AND volume_id = ?`;
      params.push(volume_id);
    }

    const [rows] = await connection.query(query, params);
    return NextResponse.json({ success: true, issues: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Error fetching issues" }, { status: 500 });
  } finally {
    await connection.end();
  }
}

// ✅ POST create issue (linked to volume)
export async function POST(req) {
  const connection = await createDbConnection();
  try {
    const body = await req.json();
    const { journal_id, volume_id, issue_number, issue_label, alias_name, alias_name_issue } = body;

    if (!journal_id || !volume_id || !issue_number || !issue_label) {
      return NextResponse.json(
        { success: false, message: "journal_id, volume_id, issue_number, issue_label are required" },
        { status: 400 }
      );
    }

    // prevent duplicate issue in same volume
    const [existing] = await connection.query(
      `SELECT id FROM issues WHERE journal_id = ? AND volume_id = ? AND issue_number = ?`,
      [journal_id, volume_id, issue_number]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Issue number already exists in this volume" },
        { status: 409 }
      );
    }

    const aliasVal = alias_name ?? alias_name_issue ?? null;

    const [result] = await connection.query(
      `INSERT INTO issues (journal_id, volume_id, issue_number, issue_label, alias_name, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [journal_id, volume_id, issue_number, issue_label, aliasVal]
    );

    return NextResponse.json({
      success: true,
      message: "Issue created successfully",
      insertedId: result.insertId,
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

// ✅ PUT update issue
export async function PUT(req) {
  const body = await req.json();
  const connection = await createDbConnection();

  try {
    const { id, volume_id, issue_number, issue_label, alias_name, alias_name_issue } = body;
    if (!id) return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });

    const aliasVal = alias_name ?? alias_name_issue ?? null;

    await connection.query(
      `UPDATE issues 
       SET volume_id=?, issue_number=?, issue_label=?, alias_name=?, updated_at=NOW()
       WHERE id=?`,
      [volume_id, issue_number, issue_label, aliasVal, id]
    );

    return NextResponse.json({ success: true, message: "Issue updated" });
  } catch (e) {
    console.error("Issue update error:", e);
    return NextResponse.json({ success: false, message: "Failed to update issue" }, { status: 500 });
  } finally {
    await connection.end();
  }
}

// ✅ DELETE issue
export async function DELETE(req) {
  const connection = await createDbConnection();
  try {
    const body = await req.json();
    const { id } = body || {};
    if (!id) return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });

    await connection.query(`DELETE FROM issues WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, message: "Issue deleted" });
  } catch (e) {
    console.error("Issue delete error:", e);
    return NextResponse.json({ success: false, message: "Failed to delete issue" }, { status: 500 });
  } finally {
    await connection.end();
  }
}
