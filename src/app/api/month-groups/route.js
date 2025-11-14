import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { getJournalSlug } from "@/utils/getJouralSlug";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const journal_id = searchParams.get("journal_id");
  const volume_id = searchParams.get("volume_id");
  const issue_id = searchParams.get("issue_id");
  const connection = await createDbConnection();

  if (!journal_id) {
    return NextResponse.json({
      success: false,
      message: "journal_id is required",
    });
  }

  try {
    let query = `
      SELECT 
        mg.id,
        mg.journal_id,
        mg.volume_id,
        mg.issue_id,
        mg.from_month,
        mg.to_month,
        v.volume_number,
        v.volume_label,
        v.year,
        i.issue_number,
        i.issue_label
      FROM month_groups mg
      LEFT JOIN volumes v ON v.id = mg.volume_id
      LEFT JOIN issues i ON i.id = mg.issue_id
      WHERE mg.journal_id = ?
        AND mg.from_month IS NOT NULL
        AND mg.from_month != ''
        AND mg.to_month IS NOT NULL
        AND mg.to_month != ''
    `;

    const params = [journal_id];

    if (volume_id) {
      query += ` AND mg.volume_id = ?`;
      params.push(volume_id);
    }

    if (issue_id) {
      query += ` AND mg.issue_id = ?`;
      params.push(issue_id);
    }

    // ✅ Single ORDER BY after all conditions
    query += `
      ORDER BY 
        v.year DESC,
        v.volume_number DESC,
        i.issue_number ASC,
        FIELD(mg.from_month,
          'January','February','March',
          'April','May','June',
          'July','August','September',
          'October','November','December'
        )
    `;

    const [rows] = await connection.query(query, params);
    return NextResponse.json({ success: true, months: rows });
  } catch (err) {
    console.error("❌ month-groups GET error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch month groups",
      },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

// ✅ POST
export async function POST(req) {
  const connection = await createDbConnection();
  try {
    const body = await req.json();

    // month map
    const monthNames = [
      "",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // auto-convert if numeric
    const fromMonthName =
      typeof body.from_month === "number" || /^\d+$/.test(body.from_month)
        ? monthNames[Number(body.from_month)]
        : body.from_month;

    const toMonthName = body.to_month
      ? typeof body.to_month === "number" || /^\d+$/.test(body.to_month)
        ? monthNames[Number(body.to_month)]
        : body.to_month
      : null;

    const [result] = await connection.query(
      `INSERT INTO month_groups (journal_id, volume_id, issue_id, from_month, to_month)
       VALUES (?, ?, ?, ?, ?)`,
      [
        body.journal_id,
        body.volume_id,
        body.issue_id,
        fromMonthName,
        toMonthName,
      ]
    );

    let slug = null;
    if (body.journal_id) {
      const slugRes = await getJournalSlug(connection, body.journal_id);
      slug = slugRes.slug;
    }

    revalidateTag("journal_month_groups");
    revalidatePath(`/${slug}/current-issue`);
    revalidatePath(`/${slug}/archives`);

    return NextResponse.json({
      success: true,
      message: "Month group added successfully",
      id: result.insertId,
    });
  } catch (err) {
    console.error("❌ month-groups POST error:", err);
    return NextResponse.json({
      success: false,
      message: "Failed to add month group",
    });
  }
}

// ✅ PUT update month group
export async function PUT(req) {
  const body = await req.json();
  const connection = await createDbConnection();

  try {
    const { id, from_month, to_month } = body;
    if (!id)
      return NextResponse.json(
        { success: false, message: "id is required" },
        { status: 400 }
      );

    const [rows] = await connection.query(
      `SELECT journal_id FROM month_groups WHERE id = ?`,
      [id]
    );
    const journal_id = rows?.[0]?.journal_id;

    await connection.query(
      `UPDATE month_groups 
       SET from_month=?, to_month=?, updated_at=NOW() 
       WHERE id=?`,
      [from_month, to_month || null, id]
    );

    let slug = null;
    if (journal_id) {
      const slugRes = await getJournalSlug(connection, journal_id);
      slug = slugRes.slug;
    }

    revalidateTag("journal_month_groups");
    revalidatePath(`/${slug}/current-issue`);
    revalidatePath(`/${slug}/archives`);

    return NextResponse.json({
      success: true,
      message: "Month group updated",
    });
  } catch (error) {
    console.error("Month group update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update month group" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

// ✅ DELETE /api/month-groups
export async function DELETE(req) {
  const connection = await createDbConnection();
  try {
    const body = await req.json();
    const { id } = body || {};
    if (!id)
      return NextResponse.json(
        { success: false, message: "id is required" },
        { status: 400 }
      );

    const [rows] = await connection.query(
      `SELECT journal_id FROM month_groups WHERE id = ?`,
      [id]
    );
    const journal_id = rows?.[0]?.journal_id;

    await connection.query(`DELETE FROM month_groups WHERE id = ?`, [id]);

    let slug = null;
    if (journal_id) {
      const slugRes = await getJournalSlug(connection, journal_id);
      slug = slugRes.slug;
    }

    revalidateTag("journal_month_groups");
    revalidatePath(`/${slug}/current-issue`);
    revalidatePath(`/${slug}/archives`);
    return NextResponse.json({
      success: true,
      message: "Month group deleted",
    });
  } catch (error) {
    console.error("Month group delete error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete month group" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
