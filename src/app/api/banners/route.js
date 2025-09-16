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
      show_content: cleanedData.show_content == "0" ? 0 : 1,
      show_button: cleanedData.show_button == "0" ? 0 : 1,
      show_description: cleanedData.show_description == "0" ? 0 : 1,
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

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const pageIndex = parseInt(searchParams.get("pageIndex") || "0", 10);
//   const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
//   const offset = pageIndex * pageSize;
//   const pool = await createDbConnection();
//   try {
//     const [rows] = await pool.query(
//       `SELECT id, title, image, button_link, button_name, description, status, visibility, alignment,
//               DATE_FORMAT(created_at, '%Y-%m-%d') as created_at,
//               DATE_FORMAT(updated_at, '%Y-%m-%d') as updated_at
//        FROM banners
//        ORDER BY id DESC
//        LIMIT ? OFFSET ?`,
//       [pageSize, offset]
//     );

//     const normalized = rows.map((r) => ({
//       ...r,
//       visibility:
//         typeof r.visibility === "string"
//           ? JSON.parse(r.visibility)
//           : r.visibility,
//     }));

//     const [count] = await pool.query(`SELECT COUNT(*) as count FROM banners`);

//     return Response.json(
//       { rows: normalized, rowCount: count[0]?.count || 0 },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("❌ Get Banner Error:", error);
//     return Response.json({ error: "Failed to fetch banners" }, { status: 500 });
//   }
// }

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  // Query params
  const pageIndex = parseInt(searchParams.get("pageIndex") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const all = searchParams.get("all") || "false";
  const sorting =
    searchParams.get("sorting") || '[{"id":"created_at","desc":true}]';
  const filters = searchParams.get("filters") || "{}";

  // Parse filters safely
  let parsedFilters = {};
  try {
    parsedFilters =
      typeof filters === "string" && filters !== "undefined"
        ? JSON.parse(filters)
        : {};
  } catch (e) {
    return Response.json(
      { message: "Invalid filters format" },
      { status: 400 }
    );
  }

  // Supported filters
  const search = parsedFilters.search || parsedFilters.Search || "";

  // Sorting
  let orderByClause = "b.created_at DESC";
  try {
    const sortingArray = JSON.parse(sorting);
    if (Array.isArray(sortingArray) && sortingArray.length > 0) {
      const sortConditions = sortingArray
        .map((s) => {
          const direction = s.desc ? "DESC" : "ASC";
          switch (s.id) {
            case "id":
              return `b.id ${direction}`;
            case "title":
              return `b.title ${direction}`;
            case "status":
              return `b.status ${direction}`;
            case "created_at":
              return `b.created_at ${direction}`;
            default:
              return "";
          }
        })
        .filter(Boolean);
      if (sortConditions.length > 0) orderByClause = sortConditions.join(", ");
    }
  } catch (err) {
    console.error("Error parsing sorting, defaulting to created_at DESC:", err);
  }

  // WHERE clause builder
  const conditions = ["1 = 1"];
  const queryParams = [];
  const countParams = [];

  if (search) {
    conditions.push(`(
      b.title       LIKE ?
      OR b.description LIKE ?
      OR b.status   LIKE ?
    )`);
    const w = `%${search}%`;
    queryParams.push(w, w, w);
    countParams.push(w, w, w);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  // Pagination
  let limitClause = "";
  if (all !== "true") {
    limitClause = `LIMIT ? OFFSET ?`;
    queryParams.push(pageSize, pageIndex * pageSize);
  }

  // Final queries
  const query = `
    SELECT
      b.id, b.title, b.image, b.button_link, b.button_name, b.description,
      b.status, b.visibility, b.alignment,
      DATE_FORMAT(b.created_at, '%Y-%m-%d') as created_at,
      DATE_FORMAT(b.updated_at, '%Y-%m-%d') as updated_at
    FROM banners b
    ${whereClause}
    ORDER BY ${orderByClause}
    ${limitClause}
  `;

  const countQuery = `
    SELECT COUNT(*) AS count
    FROM banners b
    ${whereClause}
  `;

  const pool = await createDbConnection();
  try {
    const [rows] = await pool.query(query, queryParams);
    const [countRows] = await pool.query(countQuery, countParams);
    const rowCount = countRows[0]?.count ?? 0;

    // Normalize visibility JSON if needed
    const normalized = rows.map((r) => ({
      ...r,
      visibility:
        typeof r.visibility === "string"
          ? JSON.parse(r.visibility)
          : r.visibility,
    }));

    return Response.json({ rows: normalized, rowCount }, { status: 200 });
  } catch (error) {
    console.error("❌ Get Banners Error:", error);
    return Response.json(
      { message: "Failed to fetch banners", error: error.message },
      { status: 500 }
    );
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
    let finalImage = newImage || cleanedData.image || existingImage || "";

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
      show_content: cleanedData.show_content == "0" ? 0 : 1,
      show_button: cleanedData.show_button == "0" ? 0 : 1,
      show_description: cleanedData.show_description == "0" ? 0 : 1,
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
