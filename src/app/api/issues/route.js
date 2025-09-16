import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";


export const dynamic = "force-dynamic";

const intOrNull = (x) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
};

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const journal_id = parseInt(searchParams.get("journal_id"));
//   const month_id = parseInt(searchParams.get("month_id")); // optional

//   const connection = await createDbConnection();

//   try {
//     let query = `SELECT id, issue_number, issue_label, alias_name, journal_id
//                  FROM issues
//                  WHERE journal_id = ?`;
//     let params = [journal_id];

//     if (!isNaN(month_id)) {
//       query += " AND month_id = ?";
//       params.push(month_id);
//     }

//     const [issues] = await connection.query(query, params);

//     return NextResponse.json({ success: true, issues });
//   } catch (error) {
//     console.error("Issue fetch error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch issues" },
//       { status: 500 }
//     );
//   } finally {
//     await connection.end();
//   }
// }

// export async function GET(req) {
//   const url = new URL(req.url);
//   let journal_id =
//     intOrNull(url.searchParams.get("journal_id")) ??
//     intOrNull(url.searchParams.get("jid"));
//   const journal_short = (url.searchParams.get("journal_short") || "").trim();

//   const volume_id = intOrNull(url.searchParams.get("volume_id")); // optional

//   const connection = await createDbConnection();

//   try {
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
//       `SELECT id, issue_number, alias_name
//          FROM issues
//         WHERE journal_id = ?
//           ${volume_id !== null ? "AND volume_id = ?" : ""}
//         ORDER BY issue_number DESC`;

//     const params = volume_id !== null ? [journal_id, volume_id] : [journal_id];
//     const [issues] = await connection.query(sql, params);

//     return NextResponse.json({ success: true, issues });
//   } catch (error) {
//     console.error("Issues fetch error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch issues" },
//       { status: 500 }
//     );
//   } finally {
//     await connection.end();
//   }
// }

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const journal_id = searchParams.get("journal_id");

  if (!journal_id) {
    return NextResponse.json({ success: false, message: "journal_id is required" }, { status: 400 });
  }

  const connection = await createDbConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, journal_id, issue_number, issue_label, alias_name
       FROM issues
       WHERE journal_id = ?`,
      [journal_id]
    );
    return NextResponse.json({ success: true, issues: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Error fetching issues" }, { status: 500 });
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

export async function PUT(req) {
  const body = await req.json();
  const connection = await createDbConnection();

  try {
    await connection.query(
      `UPDATE volumes SET volume_number=?, volume_label=?, alias_name=?, year=? WHERE id=?`,
      [body.volume_number, body.volume_label, body.alias_name, body.year, body.id]
    );
    return NextResponse.json({ success: true, message: "Volume updated" });
  } finally {
    await connection.end();
  }
}