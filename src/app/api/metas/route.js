import { createDbConnection } from "@/lib/db";
import { cleanData } from "@/lib/utils";
import { handleFileUploads } from "@/lib/fileUpload";
import { removeFile } from "@/lib/removeFile";

/* ================================
   ADD META
   ================================ */
export async function POST(req) {
  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();

    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries());
    const cleanedData = cleanData(body);
    const uploadedFiles = await handleFileUploads(formData);

    const { reference_type, reference_id } = cleanedData;

    if (!reference_id) {
      return Response.json(
        { error: "Reference ID is required" },
        { status: 400 }
      );
    }

    // Prevent duplicate
    const [existing] = await connection.query(
      `SELECT id FROM metas WHERE reference_type = ? AND reference_id = ?`,
      [reference_type, reference_id]
    );
    if (existing.length > 0) {
      return Response.json(
        { error: "Meta already exists for this page" },
        { status: 409 }
      );
    }

    const formKeys = [...formData.keys()];
    const metaIndexes = new Set();
    formKeys.forEach((key) => {
      const m = key.match(/metas\[(\d+)\]/);
      if (m) metaIndexes.add(parseInt(m[1]));
    });

    const attributeIds = [];
    for (const index of metaIndexes) {
      const attribute_scope = formData.get(`metas[${index}][attribute_scope]`);
      const attribute_type = formData.get(`metas[${index}][attribute_type]`);
      const attribute_key = formData.get(`metas[${index}][attribute_key]`);
      const is_content = formData.get(`metas[${index}][is_content]`) === "1";

      let content = "";
      if (is_content) {
        content = formData.get(`metas[${index}][content]`) || "";
      } else {
        const imageField = `metas[${index}][image]`;
        content = uploadedFiles[imageField] || "";
      }

      const [attrRes] = await connection.query(
        `INSERT INTO meta_attributes (attribute_scope, attribute_type, attribute_key, content)
         VALUES (?, ?, ?, ?)`,
        [attribute_scope, attribute_type, attribute_key, content]
      );
      attributeIds.push(attrRes.insertId);
    }

    const [result] = await connection.query(
      `INSERT INTO metas (reference_type, reference_id, meta_attribute_ids)
       VALUES (?, ?, ?)`,
      [reference_type, reference_id, JSON.stringify(attributeIds)]
    );

    await connection.commit();
    return Response.json(
      { message: "Meta added successfully", id: result.insertId },
      { status: 201 }
    );
  } catch (err) {
    await connection.rollback();
    console.error("❌ Add Meta Error:", err);
    return Response.json(
      { error: "Failed to add meta", details: err.message },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

/* ================================
   GET META (with filters, sorting, pagination)
   ================================ */
export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const pageIndex = parseInt(searchParams.get("pageIndex") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const all = searchParams.get("all") || "false";
  const sorting =
    searchParams.get("sorting") || '[{"id":"created_at","desc":true}]';
  const filters = searchParams.get("filters") || "{}";

  let parsedFilters = {};
  try {
    parsedFilters =
      typeof filters === "string" && filters !== "undefined"
        ? JSON.parse(filters)
        : {};
  } catch {
    return Response.json({ error: "Invalid filters format" }, { status: 400 });
  }

  const search = parsedFilters.search || "";
  const reference_type = parsedFilters.reference_type || "";
  const reference_id = parsedFilters.reference_id || "";

  // Sorting
  let orderByClause = "m.created_at DESC";
  try {
    const sortingArray = JSON.parse(sorting);
    if (Array.isArray(sortingArray) && sortingArray.length > 0) {
      const sortConds = sortingArray
        .map((s) => {
          const dir = s.desc ? "DESC" : "ASC";
          switch (s.id) {
            case "id":
              return `m.id ${dir}`;
            case "reference_id":
              return `m.reference_id ${dir}`;
            case "created_at":
              return `m.created_at ${dir}`;
            default:
              return "";
          }
        })
        .filter(Boolean);
      if (sortConds.length > 0) orderByClause = sortConds.join(", ");
    }
  } catch (err) {
    console.error("❌ Sorting parse error:", err);
  }

  // WHERE builder
  const conditions = ["1=1"];
  const params = [];
  const countParams = [];

  if (search) {
    conditions.push(`(
      m.reference_id LIKE ? OR
      m.reference_type LIKE ?
    )`);
    const w = `%${search}%`;
    params.push(w, w);
    countParams.push(w, w);
  }
  if (reference_type) {
    conditions.push("m.reference_type = ?");
    params.push(reference_type);
    countParams.push(reference_type);
  }
  if (reference_id) {
    conditions.push("m.reference_id = ?");
    params.push(reference_id);
    countParams.push(reference_id);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  let limitClause = "";
  if (all !== "true") {
    limitClause = `LIMIT ? OFFSET ?`;
    params.push(pageSize, pageIndex * pageSize);
  }

  const query = `
    SELECT m.id, m.reference_type, m.reference_id, m.meta_attribute_ids,
           DATE_FORMAT(m.created_at, '%Y-%m-%d') as created_at,
           DATE_FORMAT(m.updated_at, '%Y-%m-%d') as updated_at
    FROM metas m
    ${whereClause}
    ORDER BY ${orderByClause}
    ${limitClause}
  `;

  const countQuery = `SELECT COUNT(*) as count FROM metas m ${whereClause}`;

  const connection = await createDbConnection();
  try {
    const [rows] = await connection.query(query, params);
    const [countRows] = await connection.query(countQuery, countParams);
    const rowCount = countRows[0]?.count || 0;

    const processed = [];
    for (const row of rows) {
      let ids = [];
      try {
        ids = JSON.parse(row.meta_attribute_ids);
        if (!Array.isArray(ids)) ids = [ids];
      } catch {
        ids = [row.meta_attribute_ids];
      }

      let attributes = [];
      if (ids.length > 0) {
        const placeholders = ids.map(() => "?").join(",");
        const [attrRes] = await connection.query(
          `SELECT id, attribute_scope, attribute_type, attribute_key, content
           FROM meta_attributes WHERE id IN (${placeholders})`,
          ids
        );
        attributes = attrRes;
      }

      processed.push({
        ...row,
        metas: attributes.map((a) => ({
          id: a.id,
          attribute_scope: a.attribute_scope,
          attribute_type: a.attribute_type,
          attribute_key: a.attribute_key,
          content: a.content,
          is_content: !/\.(jpg|jpeg|png|webp)$/i.test(a.content),
          image: /\.(jpg|jpeg|png|webp)$/i.test(a.content) ? a.content : null,
        })),
      });
    }

    return Response.json({ rows: processed, rowCount }, { status: 200 });
  } catch (err) {
    console.error("❌ Get Meta Error:", err);
    return Response.json(
      { error: "Failed to fetch meta", details: err.message },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

/* ================================
   PATCH META
   ================================ */
/* ================================
   PATCH META
   ================================ */
export async function PATCH(req) {
  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();

    const formData = await req.formData();
    const id = formData.get("id");
    if (!id)
      return Response.json({ error: "Missing Meta ID" }, { status: 400 });

    const body = Object.fromEntries(formData.entries());
    const cleanedData = cleanData(body);
    const uploadedFiles = await handleFileUploads(formData);

    const { reference_type, reference_id } = cleanedData;

    // ✅ Prevent duplicate reference
    const [conflict] = await connection.query(
      `SELECT id FROM metas WHERE reference_type=? AND reference_id=? AND id != ?`,
      [reference_type, reference_id, id]
    );
    if (conflict.length > 0) {
      return Response.json(
        { error: "Meta already exists for this reference" },
        { status: 409 }
      );
    }

    // ✅ Fetch current attributes (for cleanup)
    const [cur] = await connection.query(
      `SELECT meta_attribute_ids FROM metas WHERE id=?`,
      [id]
    );
    let oldIds = [];
    try {
      oldIds = JSON.parse(cur[0].meta_attribute_ids);
      if (!Array.isArray(oldIds)) oldIds = [oldIds];
    } catch {
      oldIds = [cur[0].meta_attribute_ids];
    }

    let oldAttrs = [];
    if (oldIds.length > 0) {
      const placeholders = oldIds.map(() => "?").join(",");
      const [attrs] = await connection.query(
        `SELECT id, content FROM meta_attributes WHERE id IN (${placeholders})`,
        oldIds
      );
      oldAttrs = attrs;
    }

    // ✅ Delete old attributes from DB
    if (oldIds.length > 0) {
      const placeholders = oldIds.map(() => "?").join(",");
      await connection.query(
        `DELETE FROM meta_attributes WHERE id IN (${placeholders})`,
        oldIds
      );
    }

    // ✅ Collect new attributes
    const formKeys = [...formData.keys()];
    const indexes = new Set();
    formKeys.forEach((key) => {
      const m = key.match(/metas\[(\d+)\]/);
      if (m) indexes.add(parseInt(m[1]));
    });

    const newIds = [];
    const newContents = []; // track new content for cleanup check

    for (const index of indexes) {
      const attribute_scope = formData.get(`metas[${index}][attribute_scope]`);
      const attribute_type = formData.get(`metas[${index}][attribute_type]`);
      const attribute_key = formData.get(`metas[${index}][attribute_key]`);
      const is_content = formData.get(`metas[${index}][is_content]`) === "1";

      let content = "";
      if (is_content) {
        content = formData.get(`metas[${index}][content]`) || "";
      } else {
        const imageField = `metas[${index}][image]`;

        // ✅ Try uploaded file first
        if (uploadedFiles[imageField]) {
          content = uploadedFiles[imageField];
        } else {
          // ✅ Fallback to existing URL (string value from formData)
          content = formData.get(imageField) || "";
        }
      }

      newContents.push(content);

      const [attrRes] = await connection.query(
        `INSERT INTO meta_attributes (attribute_scope, attribute_type, attribute_key, content)
         VALUES (?, ?, ?, ?)`,
        [attribute_scope, attribute_type, attribute_key, content]
      );
      newIds.push(attrRes.insertId);
    }

    // ✅ Update metas table
    await connection.query(
      `UPDATE metas SET reference_type=?, reference_id=?, meta_attribute_ids=? WHERE id=?`,
      [reference_type, reference_id, JSON.stringify(newIds), id]
    );

    // ✅ Cleanup old image files that are no longer used
    for (const attr of oldAttrs) {
      if (/\.(jpg|jpeg|png|webp)$/i.test(attr.content)) {
        const stillUsed = newContents.includes(attr.content);
        if (!stillUsed) {
          removeFile(attr.content);
        }
      }
    }

    await connection.commit();
    return Response.json(
      { message: "Meta updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    await connection.rollback();
    console.error("❌ Update Meta Error:", err);
    return Response.json(
      { error: "Failed to update meta", details: err.message },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

/* ================================
   DELETE META
   ================================ */
export async function DELETE(req) {
  const { id } = await req.json();
  if (!id) return Response.json({ error: "Missing Meta ID" }, { status: 400 });

  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT meta_attribute_ids FROM metas WHERE id=?`,
      [id]
    );
    if (rows.length === 0) {
      return Response.json({ error: "Meta not found" }, { status: 404 });
    }

    let ids = [];
    try {
      ids = JSON.parse(rows[0].meta_attribute_ids);
      if (!Array.isArray(ids)) ids = [ids];
    } catch {
      ids = [rows[0].meta_attribute_ids];
    }

    // Fetch attributes before deletion
    let attrs = [];
    if (ids.length > 0) {
      const placeholders = ids.map(() => "?").join(",");
      const [attrRes] = await connection.query(
        `SELECT id, content FROM meta_attributes WHERE id IN (${placeholders})`,
        ids
      );
      attrs = attrRes;
    }

    // Delete meta + attributes
    await connection.query(`DELETE FROM metas WHERE id=?`, [id]);
    if (ids.length > 0) {
      const placeholders = ids.map(() => "?").join(",");
      await connection.query(
        `DELETE FROM meta_attributes WHERE id IN (${placeholders})`,
        ids
      );
    }

    // ✅ Remove old files
    for (const attr of attrs) {
      if (/\.(jpg|jpeg|png|webp)$/i.test(attr.content)) {
        removeFile(attr.content);
      }
    }

    await connection.commit();
    return Response.json(
      { message: "Meta deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    await connection.rollback();
    console.error("❌ Delete Meta Error:", err);
    return Response.json(
      { error: "Failed to delete meta", details: err.message },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
