import { createDbConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { sendEmail } from "@/lib/email";
// import { getJournalSettings } from "@/lib/settings"; // fetch journal-wise settings

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  const conn = await createDbConnection();
 const [rows] = await conn.query(
   `SELECT id, name, email, university, status,
           has_address, address_lines   -- 🆕 include flag
    FROM editorial_members
    ORDER BY name ASC
    LIMIT ? OFFSET ?`,
   [limit, offset]
 );

  const [[{ total }]] = await conn.query("SELECT COUNT(*) as total FROM editorial_members");
  await conn.end();

  return NextResponse.json({ success: true, members: rows, total });
}

export async function POST(req) {
  const body = await req.json();
  const {
    name,
    designation,
    department,
    university,
    country,
    state,
    city,
    address_lines,           // HTML string
    has_address = 0,         // 👈 add with default
    email, 
    profile_link, 
    is_active, 
    journal_id
  } = body;

  const conn = await createDbConnection();

  const otp = randomInt(100000, 999999); // Generate OTP

  // const [settingsRows] = await conn.query("SELECT email FROM journal_settings WHERE journal_id = ?", [journal_id]);
  // const systemEmail = settingsRows.length > 0 ? settingsRows[0].email : null;

//   const [settingsRows] = await conn.query(
//   `SELECT email FROM journal_mail_accounts 
//    WHERE journal_id = ? AND purpose = 'editor' AND is_active = 1 
//    LIMIT 1`, 
//   [journal_id]
// );
// const systemEmail = settingsRows.length > 0 ? settingsRows[0].email : null;

 await conn.query(
    `INSERT INTO editorial_members
       (name, designation, department, university, country, state, city,
        address_lines, has_address, email, profile_link, status, otp, is_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name, designation, department, university, country, state, city,
      address_lines || "",              // store HTML string
      has_address ? 1 : 0,              // 0/1 flag
      email, profile_link, is_active, otp, 0
    ]
  );

  // if (systemEmail) {
  //   await sendEmail({
  //     to: email,
  //     subject: "Editorial Board Email Verification",
  //     text: `Your OTP code is ${otp}`,
  //     from: systemEmail,
  //   });
  // }

  await conn.end();

  return NextResponse.json({ success: true, message: "Member added, OTP sent." });
}

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
     address_lines, has_address = 0,
 email, profile_link, is_active, is_verified = null
  } = body;

  const conn = await createDbConnection();

  const fields = [name, designation, department, university, country, state, city, 
    address_lines || "",
   has_address ? 1 : 0,              // 🆕
   email, profile_link, is_active
  ];
  let query = `UPDATE editorial_members SET
      name = ?, designation = ?, department = ?, university = ?,
      country = ?, state = ?, city = ?, address_lines = ?,
     has_address = ?,                -- 🆕
     email = ?, profile_link = ?, status = ?`;

  if (is_verified !== null) {
    query += ", is_verified = ?";
    fields.push(is_verified);
  }

  query += " WHERE id = ?";
  fields.push(id);

  await conn.query(query, fields);
  await conn.end();

  return NextResponse.json({ success: true, message: "Member updated" });
}

/* ---------------- DELETE (unchanged) ---------------- */
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const conn = await createDbConnection();
  await conn.query("DELETE FROM editorial_members WHERE id = ?", [id]);
  await conn.end();

  return NextResponse.json({ success: true, message: "Member deleted" });
}

