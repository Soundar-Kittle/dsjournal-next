import { createDbConnection } from "@/lib/db";

export async function POST(req) {
  const { email, otp } = await req.json();
  const conn = await createDbConnection();
  try {
    const [[user]] = await conn.query(
      "SELECT * FROM users WHERE email=? LIMIT 1",
      [email]
    );
    if (!user)
      return Response.json({ success: false, message: "User not found" });

    if (user.otp_code !== otp)
      return Response.json({ success: false, message: "Invalid OTP" });
    if (new Date(user.otp_expires_at) < new Date())
      return Response.json({ success: false, message: "OTP expired" });

    await conn.query(
      "UPDATE users SET is_verified=1, otp_code=NULL, otp_expires_at=NULL WHERE email=?",
      [email]
    );

    return Response.json(
      { success: true, reset_token: user.reset_token },
      { status: 200 }
    );
  } finally {
    await conn.end();
  }
}
