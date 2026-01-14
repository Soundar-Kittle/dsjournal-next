import { createDbConnection } from "@/lib/db";
import { handleFileUploads } from "@/lib/fileUpload";
import { resolveUploadedFiles } from "@/lib/removeFile";
import { cleanData } from "@/lib/utils";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req) {
  let connection;
  try {
    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries());
    const cleanedData = cleanData(body);
    const uploadedFiles = await handleFileUploads(formData);

    connection = await createDbConnection();
    await connection.beginTransaction();

    const [existingRows] = await connection.query(`
      SELECT settings_name, settings_value FROM settings_admin
      WHERE settings_name IN ('logo', 'icon')
    `);

    const existing = {};
    for (const row of existingRows) {
      existing[row.settings_name] = row.settings_value;
    }

    const filePaths = resolveUploadedFiles(
      uploadedFiles,
      cleanedData,
      existing,
      ["logo", "icon"]
    );

    for (const [key, value] of Object.entries(cleanedData)) {
      if (key !== "folder") {
        const stringValue =
          typeof value === "object" ? JSON.stringify(value) : value;

        const [existingSetting] = await connection.query(
          `SELECT id FROM settings_admin WHERE settings_name = ?`,
          [key]
        );

        if (existingSetting.length > 0) {
          const settingId = existingSetting[0].id;
          await connection.query(
            `UPDATE settings_admin SET settings_value = ? WHERE id = ?`,
            [stringValue, settingId]
          );
        } else {
          await connection.query(
            `INSERT INTO settings_admin (settings_name, settings_value) VALUES (?, ?)`,
            [key, stringValue]
          );
        }
      }
    }

    for (const [key, filePath] of Object.entries(filePaths)) {
      const [existingSetting] = await connection.query(
        `SELECT id FROM settings_admin WHERE settings_name = ?`,
        [key]
      );

      if (existingSetting.length > 0) {
        const settingId = existingSetting[0].id;
        await connection.query(
          `UPDATE settings_admin SET settings_value = ? WHERE id = ?`,
          [filePath, settingId]
        );
      } else {
        await connection.query(
          `INSERT INTO settings_admin (settings_name, settings_value) VALUES (?, ?)`,
          [key, filePath]
        );
      }
    }

    await connection.commit();
    revalidateTag("settings");
    revalidatePath("/");
    revalidatePath("/contact-us");
    return Response.json(
      { message: "Settings updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ API Error:", error);
    return Response.json(
      { error: "Failed to update settings", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.end();
  }
}

export async function GET() {
  let connection;
  try {
    connection = await createDbConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT id, settings_name, settings_value FROM settings_admin`
    );

    const parsedRows = rows.map((row) => {
      let value = row.settings_value;
      try {
        const parsed = JSON.parse(row.settings_value);
        if (typeof parsed === "object") value = parsed;
      } catch (_) {}
      return {
        id: row.id,
        settings_name: row.settings_name,
        settings_value: value,
      };
    });

    await connection.commit();
    return Response.json({ rows: parsedRows }, { status: 200 });
  } catch (error) {
    if (connection) await connection.rollback();
    return Response.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.end();
  }
}
