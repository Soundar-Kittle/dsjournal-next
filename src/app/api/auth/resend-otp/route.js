import { createDbConnection } from "@/lib/db";
import { sendOtpEmail } from "@/lib/sendOtpEmail";

export async function POST(req) {
  const { email } = await req.json();
  if (!email)
    return Response.json(
      { success: false, message: "Email required" },
      { status: 400 }
    );

  const conn = await createDbConnection();
  try {
    const [[user]] = await conn.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (!user)
      return Response.json({ success: false, message: "No OTP request found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await conn.query(
      "UPDATE users SET otp_code=?, otp_expires_at=?, updated_at=NOW() WHERE email=?",
      [otp, otpExpiry, email]
    );

    await sendOtpEmail(email, otp);

    return Response.json(
      { success: true, message: "OTP resent" },
      { status: 200 }
    );
  } finally {
    await conn.end();
  }
}
