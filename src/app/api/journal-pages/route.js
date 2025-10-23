import { createDbConnection } from "@/lib/db";
import { cleanData } from "@/lib/utils";

/* ---------------------- POST: Create Journal Page ---------------------- */
export async function POST(req) {
  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();

    const body = await req.json();
    const cleaned = cleanData(body);

    console.log(body);

    if (!cleaned.journal_id || !cleaned.page_title) {
      return Response.json(
        { message: "Missing journal_id or page_title" },
        { status: 400 }
      );
    }

    const [result] = await connection.query(
      `INSERT INTO journal_pages (journal_id, page_title, content, is_active)
       VALUES (?, ?, ?, ?)`,
      [
        cleaned.journal_id,
        cleaned.page_title,
        cleaned.content || "",
        cleaned.is_active ?? 1,
      ]
    );

    await connection.commit();
    return Response.json(
      {
        message: "Journal page created successfully",
        id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    await connection.rollback();
    console.error("❌ Add Journal Page Error:", error);
    return Response.json(
      { message: "Failed to add journal page", error: error.message },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

/* ---------------------- GET: List Journal Pages ---------------------- */
export async function GET(req) {
  const { searchParams } = new URL(req.url);

  // pagination and filters
  const pageIndex = parseInt(searchParams.get("pageIndex") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const all = searchParams.get("all") || "false";
  const journal_id = searchParams.get("journal_id");
  const search = searchParams.get("search") || "";

  const offset = pageIndex * pageSize;

  const conditions = ["1 = 1"];
  const queryParams = [];
  const countParams = [];

  if (journal_id) {
    conditions.push(`jp.journal_id = ?`);
    queryParams.push(journal_id);
    countParams.push(journal_id);
  }

  if (search) {
    conditions.push(`jp.page_title LIKE ?`);
    const like = `%${search}%`;
    queryParams.push(like);
    countParams.push(like);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const limitClause = all === "true" ? "" : `LIMIT ? OFFSET ?`;

  if (all !== "true") {
    queryParams.push(pageSize, offset);
  }

  const query = `
    SELECT 
      jp.id,
      jp.journal_id,
      jp.page_title,
      jp.content,
      jp.is_active,
      DATE_FORMAT(jp.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
      DATE_FORMAT(jp.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at,
      j.journal_name AS journal_name
    FROM journal_pages jp
    LEFT JOIN journals j ON jp.journal_id = j.id
    ${whereClause}
    ORDER BY jp.id DESC
    ${limitClause}
  `;

  const countQuery = `
    SELECT COUNT(*) AS count
    FROM journal_pages jp
    ${whereClause}
  `;

  const connection = await createDbConnection();
  try {
    const [rows] = await connection.query(query, queryParams);
    const [count] = await connection.query(countQuery, countParams);

    return Response.json(
      {
        rows,
        rowCount: count?.[0]?.count ?? 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Get Journal Pages Error:", error);
    return Response.json(
      { message: "Failed to fetch journal pages", error: error.message },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

/* ---------------------- PATCH: Update Journal Page ---------------------- */
export async function PATCH(req) {
  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();

    const body = await req.json();
    const cleaned = cleanData(body);

    if (!cleaned.id) {
      return Response.json(
        { message: "Missing journal page ID" },
        { status: 400 }
      );
    }

    const [existing] = await connection.query(
      `SELECT * FROM journal_pages WHERE id = ?`,
      [cleaned.id]
    );
    if (!existing.length) {
      return Response.json(
        { message: "Journal page not found" },
        { status: 404 }
      );
    }

    await connection.query(
      `UPDATE journal_pages
       SET journal_id = ?, page_title = ?, content = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        cleaned.journal_id || existing[0].journal_id,
        cleaned.page_title || existing[0].page_title,
        cleaned.content ?? existing[0].content,
        cleaned.is_active ?? existing[0].is_active,
        cleaned.id,
      ]
    );

    await connection.commit();
    return Response.json(
      { message: "Journal page updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    await connection.rollback();
    console.error("❌ Update Journal Page Error:", error);
    return Response.json(
      { message: "Failed to update journal page", error: error.message },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

/* ---------------------- DELETE: Remove Journal Page ---------------------- */
export async function DELETE(req) {
  const { id } = await req.json();
  if (!id)
    return Response.json(
      { message: "Missing journal page ID" },
      { status: 400 }
    );

  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();

    await connection.query(`DELETE FROM journal_pages WHERE id = ?`, [id]);

    await connection.commit();
    return Response.json(
      { message: "Journal page deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    await connection.rollback();
    console.error("❌ Delete Journal Page Error:", error);
    return Response.json(
      { message: "Failed to delete journal page", error: error.message },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
