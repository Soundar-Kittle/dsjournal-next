import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Function to determine MIME type based on file extension
 */
function getMimeType(filename) {
  const extension = path.extname(filename).toLowerCase();
  const mimeTypes = {
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
  };

  return mimeTypes[extension] || "application/octet-stream";
}

export async function GET(req, { params }) {
  try {
    const { path: pathSegments } = await params;

    // Combine segments into a relative path
    const relativePath = path.join(...pathSegments);

    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      relativePath
    );

    // ✅ Ensure file exists
    if (!fs.existsSync(filePath)) {
      console.warn("File not found:", filePath);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const filename = pathSegments[pathSegments.length - 1];
    const mimeType = getMimeType(filename);

    // ✅ Read file and return response
    const file = fs.readFileSync(filePath);
    return new NextResponse(file, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Expires: "0",
        Pragma: "no-cache",
        "Surrogate-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("❌ Catch-all File Serving Error:", error);
    return NextResponse.json({ error: "Error serving file" }, { status: 500 });
  }
}
