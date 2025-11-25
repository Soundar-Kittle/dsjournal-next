import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";



/* 🔹 POST = Create volume or issue */

export async function POST(req) {
  const body = await req.json();
  const connection = await createDbConnection();

  try {
    await connection.beginTransaction();

    const { type } = body;

    if (type === "volume") {
      const journal_id = parseInt(body.journal_id);
      const volume_number = parseInt(body.volume_number);
      const year = parseInt(body.year);
      const { volume_label, alias_name } = body;

      const [existingVolume] = await connection.query(
        `SELECT id FROM volumes WHERE journal_id = ? AND volume_number = ?`,
        [journal_id, volume_number]
      );

      if (existingVolume.length > 0) {
        return NextResponse.json(
          { message: "Volume already exists for this journal." },
          { status: 409 }
        );
      }

      const [insertResult] = await connection.query(
        `INSERT INTO volumes (journal_id, volume_number, volume_label, alias_name, year, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [journal_id, volume_number, volume_label, alias_name, year]
      );

      await connection.commit();
      return NextResponse.json({ message: "Volume created successfully", insertedId: insertResult.insertId }, { status: 200 });
    }

    else if (type === "issue") {
      const journal_id = parseInt(body.journal_id);
      const issue_number = parseInt(body.issue_number);
      const { issue_label, alias_name_issue } = body;

      const [existingIssue] = await connection.query(
        `SELECT id FROM issues WHERE journal_id = ? AND issue_number = ?`,
        [journal_id, issue_number]
      );

      if (existingIssue.length > 0) {
        return NextResponse.json(
          { message: "Issue already exists for this journal." },
          { status: 409 }
        );
      }

      const [insertResult] = await connection.query(
        `INSERT INTO issues (journal_id, issue_number, issue_label, alias_name, is_active)
         VALUES (?, ?, ?, ?, 1)`,
        [journal_id, issue_number, issue_label, alias_name_issue]
      );

      await connection.commit();
      return NextResponse.json({ message: "Issue created successfully", insertedId: insertResult.insertId }, { status: 200 });
    }

else if (type === "month") {
  console.log("Inserting into month_groups...");

  const journal_id = parseInt(body.journal_id);
  const issue_id = parseInt(body.issue_id);
  const { from_month, to_month = null } = body;

  await connection.query(
    `INSERT INTO month_groups (journal_id, issue_id, from_month, to_month, created_at, updated_at)
     VALUES (?, ?, ?, ?, NOW(), NOW())`,
    [journal_id, issue_id, from_month, to_month]
  );

  // ✅ Fetch all issues for the journal
  const [issues] = await connection.query(
    `SELECT id, issue_number, issue_label, alias_name
     FROM issues
     WHERE journal_id = ?`,
    [journal_id]
  );

  await connection.commit();
  return NextResponse.json(
    {
      message: "Month group created successfully",
      issues
    },
    { status: 200 }
  );
}

    else {
      return NextResponse.json({ message: "Invalid type provided" }, { status: 400 });
    }
  } catch (error) {
    await connection.rollback();
    console.error("DB Insert Error:", error);
    return NextResponse.json({ message: "Error inserting data", error: error.message }, { status: 500 });
  } finally {
    await connection.end();
  }
}


