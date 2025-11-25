// import { NextResponse } from "next/server";
// import { createDbConnection } from "@/lib/db";

// export const dynamic = "force-dynamic";

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const journal_id = searchParams.get("journal_id");
//   const year = searchParams.get("year");

//   if (!journal_id) {
//     return NextResponse.json({ success: false, message: "journal_id is required" }, { status: 400 });
//   }

//   const connection = await createDbConnection();
//   try {
//     let query = `SELECT id, journal_id, volume_number, volume_label, alias_name, year
//                  FROM volumes
//                  WHERE journal_id = ?`;
//     const params = [journal_id];

//     if (year) {
//       query += ` AND year = ?`;
//       params.push(year);
//     }

//     const [rows] = await connection.query(query, params);
//     return NextResponse.json({ success: true, volumes: rows });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ success: false, message: "Error fetching volumes" }, { status: 500 });
//   } finally {
//     await connection.end();
//   }
// }

// // POST /api/volume
// export async function POST(req) {
//   const connection = await createDbConnection();

//   try {
//     const body = await req.json();
//     const { journal_id, volume_number, volume_label, alias_name, year } = body;

//     if (!journal_id || !volume_number || !volume_label || !year) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Check for duplicate volume_number in the same journal
//     const [existing] = await connection.query(
//       `SELECT id FROM volumes WHERE journal_id = ? AND volume_number = ?`,
//       [journal_id, volume_number]
//     );

//     if (existing.length > 0) {
//       return NextResponse.json(
//         { success: false, message: "Volume number already exists" },
//         { status: 409 }
//       );
//     }

//     const [result] = await connection.query(
//       `INSERT INTO volumes (journal_id, volume_number, volume_label, alias_name, year)
//        VALUES (?, ?, ?, ?, ?)`,
//       [journal_id, volume_number, volume_label, alias_name || null, year]
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Volume created successfully",
//       insertedId: result.insertId
//     });
//   } catch (error) {
//     console.error("Volume creation error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to create volume" },
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
//       `UPDATE issues SET issue_number=?, issue_label=?, alias_name=? WHERE id=?`,
//       [body.issue_number, body.issue_label, body.alias_name, body.id]
//     );
//     return NextResponse.json({ success: true, message: "Issue updated" });
//   } finally {
//     await connection.end();
//   }
// }

import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const journal_id = searchParams.get("journal_id");
  const year = searchParams.get("year");

  if (!journal_id) {
    return NextResponse.json({ success: false, message: "journal_id is required" }, { status: 400 });
  }

  const connection = await createDbConnection();
  try {
    let query = `SELECT id, journal_id, volume_number, volume_label, alias_name, year
                 FROM volumes
                 WHERE journal_id = ?`;
    const params = [journal_id];

    if (year) {
      query += ` AND year = ?`;
      params.push(year);
    }

    const [rows] = await connection.query(query, params);
    return NextResponse.json({ success: true, volumes: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Error fetching volumes" }, { status: 500 });
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

// ✅ PUT should update VOLUMES (was pointing to issues before)
export async function PUT(req) {
  const body = await req.json();
  const connection = await createDbConnection();

  try {
    const { id, volume_number, volume_label, alias_name, year } = body;
    if (!id) return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });

    await connection.query(
      `UPDATE volumes SET volume_number=?, volume_label=?, alias_name=?, year=? WHERE id=?`,
      [volume_number, volume_label, alias_name, year, id]
    );
    return NextResponse.json({ success: true, message: "Volume updated" });
  } catch (e) {
    console.error("Volume update error:", e);
    return NextResponse.json({ success: false, message: "Failed to update volume" }, { status: 500 });
  } finally {
    await connection.end();
  }
}

// ✅ DELETE /api/volume
export async function DELETE(req) {
  const connection = await createDbConnection();
  try {
    const body = await req.json();
    const { id } = body || {};
    if (!id) return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });

    await connection.query(`DELETE FROM volumes WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, message: "Volume deleted" });
  } catch (e) {
    console.error("Volume delete error:", e);
    return NextResponse.json({ success: false, message: "Failed to delete volume" }, { status: 500 });
  } finally {
    await connection.end();
  }
}
