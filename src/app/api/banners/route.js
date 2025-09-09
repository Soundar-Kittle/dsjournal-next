import { createDbConnection } from "@/lib/db";
import { cleanData } from "@/lib/utils";
import { handleFileUploads } from "@/lib/fileUpload";
import { removeFile } from "@/lib/removeFile";

export async function POST(req) {
  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();

    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries());
    const cleanedData = cleanData(body);
    const uploadedFiles = await handleFileUploads(formData);

    const visibility = {
      show_content: cleanedData.show_content == "false" ? 0 : 1,
      show_button: cleanedData.show_button == "false" ? 0 : 1,
      show_description: cleanedData.show_description == "false" ? 0 : 1,
    };

    const [result] = await connection.query(
      `INSERT INTO banners 
        (title, image, button_link, button_name, description, status, visibility, alignment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanedData.title,
        uploadedFiles.image || null,
        cleanedData.button_link || null,
        cleanedData.button_name || null,
        cleanedData.description || null,
        cleanedData.status || 1,
        JSON.stringify(visibility),
        cleanedData.alignment,
      ]
    );

    await connection.commit();
    return Response.json(
      { message: "Banner added successfully", id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    await connection.rollback();
    console.error("❌ Add Banner Error:", error);
    return Response.json(
      { error: "Failed to add banner", details: error.message },
      { status: 500 }
    );
  } finally {
    await connection.end(); // ✅ close single connection
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const pageIndex = parseInt(searchParams.get("pageIndex") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const offset = pageIndex * pageSize;
  const pool = await createDbConnection();
  try {
    const [rows] = await pool.query(
      `SELECT id, title, image, button_link, button_name, description, status, visibility, alignment,
              DATE_FORMAT(created_at, '%Y-%m-%d') as created_at,
              DATE_FORMAT(updated_at, '%Y-%m-%d') as updated_at
       FROM banners
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    const normalized = rows.map((r) => ({
      ...r,
      visibility:
        typeof r.visibility === "string"
          ? JSON.parse(r.visibility)
          : r.visibility,
    }));

    const [count] = await pool.query(`SELECT COUNT(*) as count FROM banners`);

    return Response.json(
      { rows: normalized, rowCount: count[0]?.count || 0 },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Get Banner Error:", error);
    return Response.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function PATCH(req) {
  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();

    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries());
    const cleanedData = cleanData(body);
    const uploadedFiles = await handleFileUploads(formData);

    if (!cleanedData.id) {
      return Response.json({ error: "Missing Banner ID" }, { status: 400 });
    }

    const [existingRows] = await connection.query(
      `SELECT image FROM banners WHERE id = ?`,
      [cleanedData.id]
    );
    const existingImage = existingRows?.[0]?.image;

    const newImage = uploadedFiles.image || null;
    let finalImage = newImage || cleanedData.image || null;

    let parsedImage;
    try {
      parsedImage =
        typeof cleanedData.image === "string"
          ? JSON.parse(cleanedData.image)
          : cleanedData.image;
    } catch {
      parsedImage = {};
    }

    const isImageRemoval = parsedImage?.image?.length === 0;

    if (isImageRemoval && existingImage) {
      removeFile(existingImage);
      finalImage = null;
    }

    const isSameImage = existingImage && uploadedFiles.image === existingImage;
    if (newImage && existingImage && !isSameImage) {
      removeFile(existingImage);
    }

    const visibility = {
      show_content: cleanedData.show_content == "false" ? 0 : 1,
      show_button: cleanedData.show_button == "false" ? 0 : 1,
      show_description: cleanedData.show_description == "false" ? 0 : 1,
    };

    await connection.query(
      `UPDATE banners 
       SET title = ?, image = ?, button_link = ?,button_name = ?, description = ?, status = ?, visibility = ?, alignment = ?
       WHERE id = ?`,
      [
        cleanedData.title,
        finalImage,
        cleanedData.button_link || null,
        cleanedData.button_name || null,
        cleanedData.description || null,
        cleanedData.status || 1,
        JSON.stringify(visibility),
        cleanedData.alignment,
        cleanedData.id,
      ]
    );

    await connection.commit();
    return Response.json(
      { message: "Banner updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    await connection.rollback();
    console.error("❌ Update Banner Error:", error);
    return Response.json({ error: "Failed to update banner" }, { status: 500 });
  } finally {
    await connection.end(); // ✅ close connection
  }
}

export async function DELETE(req) {
  const { id } = await req.json();
  if (!id)
    return Response.json({ error: "Missing Banner ID" }, { status: 400 });

  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT image FROM banners WHERE id = ?`,
      [id]
    );
    const existingImage = rows?.[0]?.image;

    await connection.query(`DELETE FROM banners WHERE id = ?`, [id]);
    console.log(existingImage);
    if (existingImage) removeFile(existingImage);

    await connection.commit();
    return Response.json(
      { message: "Banner deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    await connection.rollback();
    console.error("❌ Delete Banner Error:", error);
    return Response.json({ error: "Failed to delete banner" }, { status: 500 });
  } finally {
    await connection.end(); // ✅ close connection
  }
}
