import { createDbConnection } from "@/lib/db";
import { sendOtpEmail } from "@/lib/sendOtpEmail";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  const { email } = await req.json();
  if (!email)
    return Response.json(
      { success: false, message: "Email required" },
      { status: 400 }
    );

  const conn = await createDbConnection();
  try {
    const [[user]] = await conn.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if (!user) {
      return Response.json(
        { success: false, message: "Email not registered" },
        { status: 400 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const resetToken = uuidv4();

    await conn.query(
      `UPDATE users
       SET otp_code=?, otp_expires_at=?, reset_token=?, reset_token_expires_at=?
       WHERE email=?`,
      [otp, otpExpiry, resetToken, otpExpiry, email]
    );

    await sendOtpEmail(email, otp);

    return Response.json(
      { success: true, message: "OTP sent to email" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Forgot-password error", err);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  } finally {
    await conn.end();
  }
}
