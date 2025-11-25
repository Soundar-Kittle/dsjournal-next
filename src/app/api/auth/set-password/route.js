import { createDbConnection } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { email, new_password, reset_token } = await req.json();
  if (!email || !new_password) {
    return Response.json(
      { success: false, message: "Email and password required" },
      { status: 400 }
    );
  }

  const conn = await createDbConnection();
  try {
    const [[user]] = await conn.query(
      "SELECT id, role, reset_token, reset_token_expires_at FROM users WHERE email=? LIMIT 1",
      [email]
    );
    if (!user)
      return Response.json({ success: false, message: "User not found" });

    if (!reset_token || reset_token !== user.reset_token) {
      return Response.json(
        { success: false, message: "Invalid reset token" },
        { status: 400 }
      );
    }

    if (new Date(user.reset_token_expires_at) < new Date()) {
      return Response.json(
        { success: false, message: "Reset token expired" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(new_password, 12);
    await conn.query(
      "UPDATE users SET password_hash=?, is_password_set=1, reset_token=NULL, reset_token_expires_at=NULL WHERE email=?",
      [hash, email]
    );

    return Response.json(
      {
        success: true,
        message: "Password updated",
        role: user.role,
      },
      { status: 200 }
    );
  } finally {
    await conn.end();
  }
}
