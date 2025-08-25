import { createDbConnection } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  const conn = await createDbConnection();

  const [rows] = await conn.query(
    "SELECT * FROM editorial_titles ORDER BY title ASC LIMIT ? OFFSET ?",
    [limit, offset]
  );
  const [[{ total }]] = await conn.query("SELECT COUNT(*) as total FROM editorial_titles");
  await conn.end();

  return NextResponse.json({ success: true, titles: rows,total });
}

export async function POST(req) {
  const body = await req.json();
  const { title, is_active } = body;

  const status = is_active ? 1 : 0; // fix: define `status` as a number


  const conn = await createDbConnection();
  await conn.query(
    "INSERT INTO editorial_titles (title, status) VALUES (?, ?)",
    [title, status]
  );
  await conn.end();

  return NextResponse.json({ success: true, message: "Title added" });
}


// export async function PATCH(req) {
//   const body = await req.json();
//   const { id, title, is_active } = body;

//   const status = is_active === true || is_active === 1 ? 1 : 0;

//   const conn = await createDbConnection();
//   await conn.query(
//     "UPDATE editorial_titles SET title = ?, status = ? WHERE id = ?",
//     [title, status, id]
//   );
//   await conn.end();

//   return NextResponse.json({ success: true, message: "Title updated" });
// }

export async function PATCH(req) {
  const body = await req.json();
  const { id, title, status } = body;

  if (!id) {
    return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
  }

  const conn = await createDbConnection();

  // Decide query based on input
  if (title !== undefined && status !== undefined) {
    // Full update (form)
    await conn.query(
      "UPDATE editorial_titles SET title = ?, status = ? WHERE id = ?",
      [title, status, id]
    );
  } else if (status !== undefined) {
    // Switch-only update
    await conn.query(
      "UPDATE editorial_titles SET status = ? WHERE id = ?",
      [status, id]
    );
  } else if (title !== undefined) {
    // Just in case only title is passed
    await conn.query(
      "UPDATE editorial_titles SET title = ? WHERE id = ?",
      [title, id]
    );
  } else {
    await conn.end();
    return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 });
  }

  await conn.end();
  return NextResponse.json({ success: true, message: "Title updated" });
}


export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const conn = await createDbConnection();
  await conn.query("DELETE FROM editorial_titles WHERE id = ?", [id]);
  await conn.end();
  return NextResponse.json({ success: true, message: "Title deleted" });
}
