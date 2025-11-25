// /api/editorial-members/verify.js
import { createDbConnection } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { email, otp } = await req.json();

  const conn = await createDbConnection();
  const [rows] = await conn.query(
    "SELECT * FROM editorial_members WHERE email = ? AND otp = ?",
    [email, otp]
  );

  if (rows.length === 0) {
    await conn.end();
    return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 400 });
  }

  await conn.query(
    "UPDATE editorial_members SET is_verified = 1, otp = NULL WHERE id = ?",
    [rows[0].id]
  );

  await conn.end();
  return NextResponse.json({ success: true, message: "Email verified successfully" });
}
