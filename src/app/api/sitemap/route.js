import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const APP_DIR = path.join(process.cwd(), "src", "app");
const validPageFileRegex = /^page\.(js|jsx|ts|tsx)$/;

function getAllRoutes(dirPath, basePath = "") {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let routes = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const routePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      if (basePath === "" && entry.name !== "(home)") continue;
      routes = routes.concat(getAllRoutes(fullPath, routePath));
    } else if (validPageFileRegex.test(entry.name)) {
      const cleanedRoute =
        "/" + basePath.replace(/\\/g, "/").replace(/\/page$/, "");

      if (cleanedRoute === "/(home)") {
        routes.push("/");
      } else if (cleanedRoute.startsWith("/(home)/")) {
        routes.push(cleanedRoute.replace("/(home)/", ""));
      }
    }
  }

  return routes;
}

export async function GET() {
  try {
    const rawRoutes = getAllRoutes(APP_DIR).filter(
      (url) => url.trim().length > 0 && !url.includes("[")
    );

    const rows = rawRoutes.map((url) => {
      if (url === "/") {
        return { value: url, label: "Home" };
      }

      const parts = url.split("/").filter(Boolean);
      const lastPart = parts[parts.length - 1];

      const label = lastPart
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return { value: url, label };
    });

    return NextResponse.json({ rows });
  } catch (error) {
    console.error("❌ JSON Sitemap generation failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
