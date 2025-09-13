import { createDbConnection } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function POST(req) {
  try {
    const { name, email, password, role = "author" } = await req.json();

    if (!name || !email || !password) {
      return Response.json(
        { success: false, message: "Name, email and password required" },
        { status: 400 }
      );
    }

    if (!["admin", "author", "editor"].includes(role)) {
      return Response.json(
        { success: false, message: "Invalid role" },
        { status: 400 }
      );
    }

    const conn = await createDbConnection();

    // check duplicate email
    const [[existing]] = await conn.query(
      "SELECT id FROM users WHERE email=? LIMIT 1",
      [email]
    );
    if (existing) {
      await conn.end();
      return Response.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 12);

    const [result] = await conn.query(
      `INSERT INTO users 
        (name, email, password_hash, role, is_verified, is_password_set, created_at, updated_at) 
       VALUES (?,?,?,?,1,1,NOW(),NOW())`,
      [name, email, hash, role]
    );

    await conn.end();

    const token = jwt.sign({ id: result.insertId, email, role }, JWT_SECRET, {
      expiresIn: "30m",
    });

    return Response.json(
      {
        success: true,
        message: "Registration successful",
        token,
        user: { id: result.insertId, name, email, role },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Register Error:", err);
    return Response.json(
      { success: false, message: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
