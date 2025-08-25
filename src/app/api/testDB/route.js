// pages/api/settings/get.js (or app/api/settings/route.js if adapted)
// import { createDbConnection } from "@/lib/db";

// export default async function handler(req, res) {
//   const conn = await createDbConnection()

//   const [rows] = await conn.query("SELECT * FROM settings LIMIT 1")
//   await conn.end()

//   res.status(200).json(rows[0])
// }

import { createDbConnection } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const conn = await createDbConnection()
    const [rows] = await conn.query("SELECT 1 + 1 AS result")
    await conn.end()

    return NextResponse.json({
      success: true,
      message: "DB connected successfully",
      result: rows[0].result,
    })
  } catch (error) {
    console.error("DB Connection Error:", error)
    return NextResponse.json(
      { success: false, error: "DB connection failed", details: error.message },
      { status: 500 }
    )
  }
}