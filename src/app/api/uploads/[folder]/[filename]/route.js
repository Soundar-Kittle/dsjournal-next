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

  return mimeTypes[extension] || "application/octet-stream"; // Default MIME type
}

export async function GET(req, { params }) {
  try {
    const { folder, filename } = await params;
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      folder,
      filename
    );

    // ✅ Ensure file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // ✅ Get MIME type manually
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
    console.error("❌ File Serving Error:", error);
    return NextResponse.json({ error: "Error serving file" }, { status: 500 });
  }
}
