import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export async function POST(req) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Email, password and role required" },
        { status: 400 }
      );
    }

    const conn = await createDbConnection();
    const [[user]] = await conn.query(
      "SELECT id, name, email, password_hash, role FROM users WHERE email=? LIMIT 1",
      [email]
    );
    await conn.end();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.role !== role) {
      return NextResponse.json(
        {
          success: false,
          message: `This account is not allowed to login as ${role}`,
        },
        { status: 403 }
      );
    }

    const match = await bcrypt.compare(password, user.password_hash || "");
    if (!match) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secretKey,
      { expiresIn: "8h" }
    );

    // ✅ Create response and attach cookie
    const res = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    return res;
  } catch (err) {
    console.error("❌ Login Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
