import { createDbConnection } from "@/lib/db";
import { revalidatePath } from "next/cache";

function cleanData(body) {
  // optional simple cleaner if you used it earlier
  return {
    id: body.id || null,
    is_common: body.is_common ? 1 : 0,
    journal_id: body.journal_id || null,
    month_group_id: body.month_group_id || null,
    date_mode: body.date_mode,
    manual_date: body.manual_date || null,
    start_date: body.start_date || null,
    end_date: body.end_date || null,
    permit_dates: body.permit_dates || null,
    is_active: body.is_active ? 1 : 0,
  };
}

/* -------------------------- CREATE (POST) -------------------------- */
export async function POST(req) {
  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();

    const body = await req.json();
    const cleanedData = cleanData(body);

    const [result] = await connection.query(
      `INSERT INTO call_for_papers 
        (is_common, journal_id, month_group_id, date_mode, manual_date, start_date, end_date, permit_dates, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanedData.is_common,
        cleanedData.is_common ? null : cleanedData.journal_id,
        cleanedData.is_common ? null : cleanedData.month_group_id, // ✅ added this
        cleanedData.date_mode,
        cleanedData.manual_date,
        cleanedData.start_date,
        cleanedData.end_date,
        cleanedData.permit_dates,
        cleanedData.is_active,
      ]
    );

    await connection.commit();
    // revalidatePath("/call-for-paper");

    return Response.json(
      {
        success: true,
        message: "Call for Paper added successfully",
        id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    await connection.rollback();
    console.error("❌ Add Call for Paper Error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to add Call for Paper",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

/* -------------------------- GET (LIST / PAGINATED) -------------------------- */
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
  } catch (e) {
    return Response.json(
      { message: "Invalid filters format" },
      { status: 400 }
    );
  }

  const search = parsedFilters.search || "";

  // Sorting
  let orderByClause = "cfp.created_at DESC";
  try {
    const sortingArray = JSON.parse(sorting);
    if (Array.isArray(sortingArray) && sortingArray.length > 0) {
      const sortConditions = sortingArray
        .map((s) => {
          const direction = s.desc ? "DESC" : "ASC";
          switch (s.id) {
            case "id":
              return `cfp.id ${direction}`;
            case "start_date":
              return `cfp.start_date ${direction}`;
            case "manual_date":
              return `cfp.manual_date ${direction}`;
            case "created_at":
              return `cfp.created_at ${direction}`;
            default:
              return "";
          }
        })
        .filter(Boolean);
      if (sortConditions.length > 0) orderByClause = sortConditions.join(", ");
    }
  } catch {
    // fallback to default
  }

  // Filters
  const conditions = ["1=1"];
  const queryParams = [];
  const countParams = [];

  if (search) {
    conditions.push(`(
      cfp.journal_id LIKE ? OR
      cfp.date_mode LIKE ?
    )`);
    const w = `%${search}%`;
    queryParams.push(w, w);
    countParams.push(w, w);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  let limitClause = "";
  if (all !== "true") {
    limitClause = `LIMIT ? OFFSET ?`;
    queryParams.push(pageSize, pageIndex * pageSize);
  }

  const query = `
    SELECT 
      cfp.id, cfp.is_common, cfp.journal_id, cfp.date_mode,  
      DATE_FORMAT(cfp.manual_date, '%Y-%m-%d') as manual_date,
      DATE_FORMAT(cfp.start_date, '%Y-%m-%d') as start_date,
      DATE_FORMAT(cfp.end_date, '%Y-%m-%d') as end_date,
      cfp.permit_dates,
      cfp.is_active,
      DATE_FORMAT(cfp.created_at, '%Y-%m-%d') as created_at,
      DATE_FORMAT(cfp.updated_at, '%Y-%m-%d') as updated_at,
      j.journal_name
    FROM call_for_papers cfp
    LEFT JOIN journals j ON cfp.journal_id = j.id
    ${whereClause}
    ORDER BY ${orderByClause}
    ${limitClause}
  `;

  const countQuery = `
    SELECT COUNT(*) AS count
    FROM call_for_papers cfp
    ${whereClause}
  `;

  const pool = await createDbConnection();
  try {
    const [rows] = await pool.query(query, queryParams);
    const [countRows] = await pool.query(countQuery, countParams);
    const rowCount = countRows[0]?.count ?? 0;

    return Response.json({ rows, rowCount }, { status: 200 });
  } catch (error) {
    console.error("❌ Get Call for Papers Error:", error);
    return Response.json(
      { message: "Failed to fetch Call for Papers", error: error.message },
      { status: 500 }
    );
  }
}

/* -------------------------- UPDATE (PATCH) -------------------------- */
export async function PATCH(req) {
  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();

    const body = await req.json();
    const cleanedData = cleanData(body);

    if (!cleanedData.id)
      return Response.json({ error: "Missing ID" }, { status: 400 });

    await connection.query(
      `UPDATE call_for_papers
       SET 
         is_common = ?, 
         journal_id = ?, 
         month_group_id = ?,     -- ✅ added here
         date_mode = ?, 
         manual_date = ?, 
         start_date = ?, 
         end_date = ?, 
         permit_dates = ?, 
         is_active = ?
       WHERE id = ?`,
      [
        cleanedData.is_common,
        cleanedData.is_common ? null : cleanedData.journal_id,
        cleanedData.is_common ? null : cleanedData.month_group_id, // ✅ handled null if common
        cleanedData.date_mode,
        cleanedData.manual_date,
        cleanedData.start_date,
        cleanedData.end_date,
        cleanedData.permit_dates,
        cleanedData.is_active,
        cleanedData.id,
      ]
    );

    await connection.commit();
    // revalidatePath("/call-for-paper");

    return Response.json(
      { success: true, message: "Call for Paper updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    await connection.rollback();
    console.error("❌ Update Call for Paper Error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to update Call for Paper",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
/* -------------------------- DELETE -------------------------- */
export async function DELETE(req) {
  const { id } = await req.json();
  if (!id) return Response.json({ error: "Missing ID" }, { status: 400 });

  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();
    await connection.query(`DELETE FROM call_for_papers WHERE id = ?`, [id]);
    await connection.commit();
    // revalidatePath("/call-for-paper");

    return Response.json(
      { message: "Call for Paper deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    await connection.rollback();
    console.error("❌ Delete Call for Paper Error:", error);
    return Response.json(
      { error: "Failed to delete Call for Paper" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
