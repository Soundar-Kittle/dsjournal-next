import { verifyToken, generateToken } from "@/lib/jwt";
import { createDbConnection } from "@/lib/db";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ token: null, user: null }, { status: 200 });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    const conn = await createDbConnection();
    const [[user]] = await conn.query(
      "SELECT id, email, role FROM users WHERE email=? LIMIT 1",
      [decoded.email]
    );
    await conn.end();

    if (!user) throw new Error("User not found");

    const newToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return Response.json({ token: newToken, user }, { status: 200 });
  } catch (err) {
    return Response.json({ token: null, user: null }, { status: 200 });
  }
}
