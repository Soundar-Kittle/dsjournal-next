import { getStaticRoutes } from "@/utils/getStaticRoutes";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await getStaticRoutes();
    return NextResponse.json({ rows });
  } catch (error) {
    console.error("❌ JSON Sitemap generation failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
