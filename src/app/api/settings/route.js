// app/api/settings/route.js
import path from "path";
import fs from "fs";
import { parseForm } from "@/lib/parseForm";
import { createDbConnection } from "@/lib/db";
import { NextResponse } from "next/server";

export const config = { api: { bodyParser: false } };

export async function POST(req) {
  try {
    const { fields, files } = await parseForm(req);
    const { journal_name, alias_name, icon, social_links } = fields;

    const logo = files?.logo?.newFilename || null;
    const conn = await createDbConnection();
    await conn.query(
      `INSERT INTO settings (journal_name, alias_name, icon, logo, social_links)
       VALUES (?, ?, ?, ?, ?)`,
      [
        journal_name,
        alias_name,
        icon,
        logo,
        social_links, // should be stringified JSON
      ]
    );
    await conn.end();

    return NextResponse.json({ success: true, message: "Settings saved!" });
  } catch (err) {
    console.error("Insert failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const connection = await createDbConnection();
    const [rows] = await connection.query(
      "SELECT * FROM settings WHERE id = 1 LIMIT 1"
    );
    await connection.end();

    if (!rows.length) {
      return Response.json(
        { success: false, message: "No settings found" },
        { status: 404 }
      );
    }

    const settings = rows[0];
    // ✅ Fix: parse social_links from string to array
    try {
      settings.social_links = JSON.parse(settings.social_links || "[]");
    } catch {
      settings.social_links = [];
    }
    return Response.json({ success: true, settings });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const { fields, files } = await parseForm(req);
    const { journal_name = "", alias_name = "", social_links = "[]" } = fields;

    const parsedLinks =
      typeof social_links === "string"
        ? social_links
        : JSON.stringify(social_links);

    const logo = files?.logo?.[0];
    const icon = files?.icon?.[0];

    console.log(fields);

    let logoPath = null;
    let iconPath = null;

    if (logo) {
      const ext = path.extname(logo.originalFilename);
      const fileName = `logo_${Date.now()}${ext}`;
      const uploadDir = path.join(process.cwd(), "public/uploads/logos");
      console.log("uploadDir:", uploadDir);
      fs.mkdirSync(uploadDir, { recursive: true });
      const savePath = path.join(uploadDir, fileName);
      fs.renameSync(logo.filepath, savePath);
      logoPath = `uploads/logos/${fileName}`;
    }

    if (icon) {
      const ext = path.extname(icon.originalFilename);
      const fileName = `icon_${Date.now()}${ext}`;
      const uploadDir = path.join(process.cwd(), "public/uploads/icons");
      fs.mkdirSync(uploadDir, { recursive: true });
      const savePath = path.join(uploadDir, fileName);
      fs.renameSync(icon.filepath, savePath);
      iconPath = `uploads/icons/${fileName}`;
    }

    const conn = await createDbConnection();

    const sql = `
      UPDATE settings
      SET journal_name = ?, alias_name = ?, social_links = ?
      ${logoPath ? ", logo = ?" : ""}
      ${iconPath ? ", icon = ?" : ""}
      WHERE id = 1
    `;

    const params = [journal_name, alias_name, parsedLinks];
    if (logoPath) params.push(logoPath);
    if (iconPath) params.push(iconPath);

    await conn.query(sql, params);
    await conn.end();

    console.log("Settings updated");

    return NextResponse.json({ success: true, message: "Settings updated" });
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
