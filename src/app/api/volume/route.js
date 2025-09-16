import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";

export const dynamic = "force-dynamic";

const intOrNull = (x) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
};

// GET /api/volume?journal_id=123
// GET /api/volume?journal_id=2&year=2025
// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const journal_id = parseInt(searchParams.get("journal_id"));
//   const year = parseInt(searchParams.get("year"));

//   if (!journal_id) {
//     return NextResponse.json({ success: false, message: "Missing journal_id" }, { status: 400 });
//   }

//   const connection = await createDbConnection();

//   try {
//     const [volumes] = await connection.query(
//       `SELECT id, volume_number, volume_label, alias_name
//        FROM volumes
//        WHERE journal_id = ?
//        ${year ? "AND year = ?" : ""}`,
//       year ? [journal_id, year] : [journal_id]
//     );

//     return NextResponse.json({ success: true, volumes });
//   } catch (error) {
//     console.error("Volume fetch error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch volumes" },
//       { status: 500 }
//     );
//   } finally {
//     await connection.end();
//   }
// }
// export async function GET(req) {
//   const url = new URL(req.url);
//   // accept journal id in multiple ways
//   let journal_id =
//     intOrNull(url.searchParams.get("journal_id")) ??
//     intOrNull(url.searchParams.get("jid"));

//   const journal_short = (url.searchParams.get("journal_short") || "").trim();
//   const year = intOrNull(url.searchParams.get("year"));

//   const connection = await createDbConnection();

//   try {
//     // resolve journal_short -> id if needed
//     if (journal_id === null && journal_short) {
//       const [[jr]] = await connection.query(
//         "SELECT id FROM journals WHERE journal_short = ? LIMIT 1",
//         [journal_short]
//       );
//       if (jr) journal_id = jr.id;
//     }

//     if (journal_id === null) {
//       return NextResponse.json(
//         { success: false, message: "Missing journal_id (use journal_id, jid, or journal_short)" },
//         { status: 400 }
//       );
//     }

//     const sql =
//       `SELECT id, volume_number, volume_label, alias_name, year
//        FROM volumes
//        WHERE journal_id = ?
//        ${year !== null ? "AND year = ?" : ""}
//        ORDER BY year DESC, volume_number DESC`;

//     const params = year !== null ? [journal_id, year] : [journal_id];
//     const [volumes] = await connection.query(sql, params);

//     return NextResponse.json({ success: true, volumes });
//   } catch (error) {
//     console.error("Volume fetch error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch volumes" },
//       { status: 500 }
//     );
//   } finally {
//     await connection.end();
//   }
// }

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

export async function PUT(req) {
  const body = await req.json();
  const connection = await createDbConnection();

  try {
    await connection.query(
      `UPDATE issues SET issue_number=?, issue_label=?, alias_name=? WHERE id=?`,
      [body.issue_number, body.issue_label, body.alias_name, body.id]
    );
    return NextResponse.json({ success: true, message: "Issue updated" });
  } finally {
    await connection.end();
  }
}