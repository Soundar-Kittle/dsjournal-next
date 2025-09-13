import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create a response
    const res = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Delete the cookie
    res.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0), // 👈 expired
    });

    return res;
  } catch (err) {
    console.error("❌ Logout error:", err);
    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    );
  }
}
