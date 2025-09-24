// import { NextResponse } from "next/server";
// import { createDbConnection } from "@/lib/db";


// // GET /api/month-groups?journal_id=123&issue_id=456
// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const journal_id = parseInt(searchParams.get("journal_id"));
//   const issue_id = parseInt(searchParams.get("issue_id"));
//   const connection = await createDbConnection();

//   try {
//     const [months] = await connection.query(
//       `SELECT id, from_month, to_month
//        FROM month_groups
//        WHERE journal_id = ? AND issue_id = ?`,
//       [journal_id, issue_id]
//     );

//     return NextResponse.json({ success: true, months });
//   } catch (error) {
//     console.error("Month group fetch error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch month groups" },
//       { status: 500 }
//     );
//   } finally {
//     await connection.end();
//   }
// }

// export async function POST(req) {
//   const connection = await createDbConnection();

//   try {
//     const body = await req.json();
//     const { journal_id, issue_id, from_month, to_month } = body;

//     if (!journal_id || !issue_id || !from_month) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     const [existing] = await connection.query(
//       `SELECT id FROM month_groups WHERE journal_id = ? AND issue_id = ? AND from_month = ?`,
//       [journal_id, issue_id, from_month]
//     );

//     if (existing.length > 0) {
//       return NextResponse.json(
//         { success: false, message: "Month group already exists for this issue" },
//         { status: 409 }
//       );
//     }

//     const [result] = await connection.query(
//       `INSERT INTO month_groups (journal_id, issue_id, from_month, to_month, created_at, updated_at)
//        VALUES (?, ?, ?, ?, NOW(), NOW())`,
//       [journal_id, issue_id, from_month, to_month || null]
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Month group created successfully",
//       insertedId: result.insertId
//     });
//   } catch (error) {
//     console.error("Month group creation error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to create month group" },
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
//       `UPDATE month_groups SET from_month=?, to_month=? WHERE id=?`,
//       [body.from_month, body.to_month, body.id]
//     );
//     return NextResponse.json({ success: true, message: "Month group updated" });
//   } finally {
//     await connection.end();
//   }
// }

import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";

// ✅ GET /api/month-groups?journal_id=123&volume_id=5&issue_id=456
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const journal_id = parseInt(searchParams.get("journal_id"));
  const volume_id = parseInt(searchParams.get("volume_id"));
  const issue_id = parseInt(searchParams.get("issue_id"));
  const connection = await createDbConnection();

  try {
    let query = `SELECT id, journal_id, volume_id, issue_id, from_month, to_month 
                 FROM month_groups 
                 WHERE journal_id = ?`;
    let params = [journal_id];

    if (volume_id) {
      query += ` AND volume_id = ?`;
      params.push(volume_id);
    }
    if (issue_id) {
      query += ` AND issue_id = ?`;
      params.push(issue_id);
    }

    const [months] = await connection.query(query, params);
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

// ✅ POST create month group
export async function POST(req) {
  const connection = await createDbConnection();

  try {
    const body = await req.json();
    const { journal_id, volume_id, issue_id, from_month, to_month } = body;

    if (!journal_id || !volume_id || !issue_id || !from_month) {
      return NextResponse.json(
        { success: false, message: "journal_id, volume_id, issue_id, from_month are required" },
        { status: 400 }
      );
    }

    // prevent duplicate month group for same issue
    const [existing] = await connection.query(
      `SELECT id FROM month_groups 
       WHERE journal_id = ? AND volume_id = ? AND issue_id = ? AND from_month = ?`,
      [journal_id, volume_id, issue_id, from_month]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Month group already exists for this issue" },
        { status: 409 }
      );
    }

    const [result] = await connection.query(
      `INSERT INTO month_groups (journal_id, volume_id, issue_id, from_month, to_month, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [journal_id, volume_id, issue_id, from_month, to_month || null]
    );

    return NextResponse.json({
      success: true,
      message: "Month group created successfully",
      insertedId: result.insertId,
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

// ✅ PUT update month group
export async function PUT(req) {
  const body = await req.json();
  const connection = await createDbConnection();

  try {
    const { id, from_month, to_month } = body;
    if (!id) return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });

    await connection.query(
      `UPDATE month_groups SET from_month=?, to_month=?, updated_at=NOW() WHERE id=?`,
      [from_month, to_month || null, id]
    );

    return NextResponse.json({ success: true, message: "Month group updated" });
  } catch (e) {
    console.error("Month group update error:", e);
    return NextResponse.json({ success: false, message: "Failed to update month group" }, { status: 500 });
  } finally {
    await connection.end();
  }
}

// ✅ DELETE /api/month-groups
export async function DELETE(req) {
  const connection = await createDbConnection();
  try {
    const body = await req.json();
    const { id } = body || {};
    if (!id) return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });

    await connection.query(`DELETE FROM month_groups WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, message: "Month group deleted" });
  } catch (e) {
    console.error("Month group delete error:", e);
    return NextResponse.json({ success: false, message: "Failed to delete month group" }, { status: 500 });
  } finally {
    await connection.end();
  }
}

