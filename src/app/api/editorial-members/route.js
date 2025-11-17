// import { createDbConnection } from "@/lib/db";
// import { NextResponse } from "next/server";
// import { randomInt } from "crypto";
// import { sendEmail } from "@/lib/email";

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const all = searchParams.get("all") === "true";
//   const page = parseInt(searchParams.get("page")) || 1;
//   const limit = parseInt(searchParams.get("limit")) || 10;
//   const offset = (page - 1) * limit;

//   const conn = await createDbConnection();

//   let rows;
//   let total;

//   if (all) {
//     // Fetch everything (no pagination)
//     [rows] = await conn.query(
//       `SELECT *
//        FROM editorial_members
//        ORDER BY name ASC`
//     );
//     [[{ total }]] = await conn.query(
//       "SELECT COUNT(*) as total FROM editorial_members"
//     );
//   } else {
//     // Fetch with pagination
//     [rows] = await conn.query(
//       `SELECT *
//        FROM editorial_members
//        ORDER BY name ASC
//        LIMIT ? OFFSET ?`,
//       [limit, offset]
//     );
//     [[{ total }]] = await conn.query(
//       "SELECT COUNT(*) as total FROM editorial_members"
//     );
//   }

//   await conn.end();

//   return NextResponse.json({ success: true, members: rows, total });
// }

// export async function POST(req) {
//   const body = await req.json();
//   const {
//     name,
//     designation,
//     department,
//     university,
//     country,
//     state,
//     city,
//     address_lines, // HTML string
//     has_address = 0, // 👈 add with default
//     email,
//     profile_link,
//     is_active,
//     journal_id,
//   } = body;

//   const conn = await createDbConnection();

//   const otp = randomInt(100000, 999999); // Generate OTP

//   await conn.query(
//     `INSERT INTO editorial_members
//        (name, designation, department, university, country, state, city,
//         address_lines, has_address, email, profile_link, status, otp, is_verified)
//      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//     [
//       name,
//       designation,
//       department,
//       university,
//       country,
//       state,
//       city,
//       address_lines || "", // store HTML string
//       has_address ? 1 : 0, // 0/1 flag
//       email,
//       profile_link,
//       is_active,
//       otp,
//       0,
//     ]
//   );

//   await conn.end();

//   return NextResponse.json({
//     success: true,
//     message: "Member added, OTP sent.",
//   });
// }

// export async function PATCH(req) {
//   const body = await req.json();
//   const {
//     id,
//     name,
//     designation,
//     department,
//     university,
//     country,
//     state,
//     city,
//     address_lines,
//     has_address = 0,
//     email,
//     profile_link,
//     is_active,
//     is_verified = null,
//   } = body;

//   const conn = await createDbConnection();

//   const fields = [
//     name,
//     designation,
//     department,
//     university,
//     country,
//     state,
//     city,
//     address_lines || "",
//     has_address ? 1 : 0, // 🆕
//     email,
//     profile_link,
//     is_active,
//   ];
//   let query = `UPDATE editorial_members SET
//       name = ?, designation = ?, department = ?, university = ?,
//       country = ?, state = ?, city = ?, address_lines = ?,
//      has_address = ?,                -- 🆕
//      email = ?, profile_link = ?, status = ?`;

//   if (is_verified !== null) {
//     query += ", is_verified = ?";
//     fields.push(is_verified);
//   }

//   query += " WHERE id = ?";
//   fields.push(id);

//   await conn.query(query, fields);
//   await conn.end();

//   return NextResponse.json({ success: true, message: "Member updated" });
// }

// /* ---------------- DELETE (unchanged) ---------------- */
// export async function DELETE(req) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id");

//   const conn = await createDbConnection();
//   await conn.query("DELETE FROM editorial_members WHERE id = ?", [id]);
//   await conn.end();

//   return NextResponse.json({ success: true, message: "Member deleted" });
// }

import { createDbConnection } from "@/lib/db";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/* ----------------------- GET ----------------------- */
export async function GET(req) {
  const conn = await createDbConnection();
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search")?.trim() || "";
  const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
  const limitParam = searchParams.get("limit");
  const limit = limitParam === "All" ? null : parseInt(limitParam) || 10;
  const offset = (page - 1) * (limit || 0);

  try {
    // 🧩 Base query
    let baseSql = `SELECT * FROM editorial_members`;
    let countSql = `SELECT COUNT(*) AS total FROM editorial_members`;
    const whereClause = [];
    const params = [];

    // 🔍 Add WHERE for search
    if (search) {
      whereClause.push(`(name LIKE ? OR email LIKE ? OR university LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (whereClause.length > 0) {
      baseSql += ` WHERE ${whereClause.join(" AND ")}`;
      countSql += ` WHERE ${whereClause.join(" AND ")}`;
    }

    baseSql += ` ORDER BY id DESC`;

    if (limit) {
      baseSql += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    // 🧠 Execute both queries
    const [rows] = await conn.query(baseSql, params);
    const [[{ total }]] = await conn.query(countSql, params.slice(0, 3));

    return NextResponse.json({ members: rows, total });
  } catch (err) {
    console.error("❌ GET /editorial-members failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await conn.end(); // ✅ Proper cleanup
  }
}

/* ----------------------- POST ----------------------- */
export async function POST(req) {
  const conn = await createDbConnection();
  const body = await req.json();
  const {
    name,
    designation,
    department,
    university,
    country,
    state,
    city,
    address_lines,
    has_address = 0,
    email,
    profile_link,
    is_active = 1,
  } = body;

  try {
    await conn.query(
      `INSERT INTO editorial_members 
      (name, designation, department, university, country, state, city, 
      address_lines, has_address, email, profile_link, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        designation,
        department,
        university,
        country,
        state,
        city,
        address_lines || "",
        has_address ? 1 : 0,
        email,
        profile_link,
        is_active ? 1 : 0,
      ]
    );
    revalidateTag("editorial_board");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ POST /editorial-members failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ----------------------- PATCH ----------------------- */
export async function PATCH(req) {
  const body = await req.json();
  const {
    id,
    name,
    designation,
    department,
    university,
    country,
    state,
    city,
    address_lines,
    has_address = 0,
    email,
    profile_link,
    is_active,
    is_verified = null,
  } = body;

  const conn = await createDbConnection();

  const fields = [
    name,
    designation,
    department,
    university,
    country,
    state,
    city,
    address_lines || "",
    has_address ? 1 : 0,
    email,
    profile_link,
    is_active, // ✅ will map to status
  ];

  let query = `
    UPDATE editorial_members SET
      name = ?, 
      designation = ?, 
      department = ?, 
      university = ?,
      country = ?, 
      state = ?, 
      city = ?, 
      address_lines = ?,
      has_address = ?, 
      email = ?, 
      profile_link = ?, 
      status = ?`; // ✅ changed here

  if (is_verified !== null) {
    query += ", is_verified = ?";
    fields.push(is_verified);
  }

  query += " WHERE id = ?";
  fields.push(id);

  await conn.query(query, fields);
  await conn.end();
  revalidateTag("editorial_board");
  return NextResponse.json({ success: true, message: "Member updated" });
}

/* ----------------------- DELETE ----------------------- */
export async function DELETE(req) {
  const conn = await createDbConnection();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    await conn.query("DELETE FROM editorial_members WHERE id = ?", [id]);
    revalidateTag("editorial_board");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /editorial-members failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
