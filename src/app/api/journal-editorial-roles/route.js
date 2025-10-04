import { createDbConnection } from "@/lib/db";
import { NextResponse } from "next/server";

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const journalId = searchParams.get("journalId");

//   const conn = await createDbConnection();
//   const [rows] = await conn.query(
//     `SELECT jer.id, jer.journal_id, jer.member_id, jer.title_id,
//             em.name AS member_name, et.title AS title_name
//      FROM journal_editorial_roles jer
//      JOIN editorial_members em ON jer.member_id = em.id
//      JOIN editorial_titles et ON jer.title_id = et.id
//      WHERE jer.journal_id = ?`,
//     [journalId]
//   );
//   await conn.end();
//   return NextResponse.json({ success: true, roles: rows });
// }

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const journalId = searchParams.get("journalId");

  if (!journalId) {
    return NextResponse.json(
      { success: false, message: "journalId required", roles: [] },
      { status: 400 }
    );
  }

  const conn = await createDbConnection();
  const [rows] = await conn.query(
    `
    SELECT 
      jer.id, jer.journal_id, jer.member_id, jer.title_id,
      jer.sort_order, jer.title_sort_order, jer.is_active,
      em.name AS member_name, et.title AS title_name
    FROM journal_editorial_roles jer
    JOIN editorial_members em ON jer.member_id = em.id
    JOIN editorial_titles et ON jer.title_id = et.id
    WHERE jer.journal_id = ?
    ORDER BY jer.title_sort_order ASC
    `,
    [journalId]
  );
  await conn.end();

  return NextResponse.json({ success: true, roles: rows });
}

// export async function POST(req) {
//   const body = await req.json();
//   const { journal_id, member_id, title_id } = body;
//   const conn = await createDbConnection();
//   await conn.query(
//     `INSERT INTO journal_editorial_roles (journal_id, member_id, title_id) VALUES (?, ?, ?)`,
//     [journal_id, member_id, title_id]
//   );
//   await conn.end();
//   return NextResponse.json({ success: true, message: "Role assigned" });
// }

export async function POST(req) {
  try {
    const body = await req.json();
    const { journal_id, member_id, title_id } = body || {};

    if (!journal_id || !member_id || !title_id) {
      return NextResponse.json(
        { success: false, message: "journal_id, member_id, title_id required" },
        { status: 400 }
      );
    }

    const conn = await createDbConnection();

    // 1. Check if this title group already exists in this journal
    const [existingRows] = await conn.query(
      `SELECT title_sort_order 
       FROM journal_editorial_roles 
       WHERE journal_id = ? AND title_id = ? 
       LIMIT 1`,
      [journal_id, title_id]
    );
    const existingGroup = existingRows[0];

    let titleSortOrder;

    if (existingGroup) {
      // Title already exists in this journal → keep its group order
      titleSortOrder = existingGroup.title_sort_order;
    } else {
      // New title group → assign next available order in this journal
      const [[{ maxTitleSort }]] = await conn.query(
        `SELECT COALESCE(MAX(title_sort_order), 0) AS maxTitleSort 
         FROM journal_editorial_roles 
         WHERE journal_id = ?`,
        [journal_id]
      );
      titleSortOrder = (maxTitleSort ?? 0) + 1;
    }

    // 2. Get the member's order inside this title group
    const [[{ maxMemberOrder }]] = await conn.query(
      `SELECT COALESCE(MAX(sort_order), 0) AS maxMemberOrder 
       FROM journal_editorial_roles 
       WHERE journal_id = ? AND title_id = ?`,
      [journal_id, title_id]
    );
    const memberSortOrder = (maxMemberOrder ?? 0) + 1;

    // 3. Insert new record
    await conn.query(
      `INSERT INTO journal_editorial_roles 
        (journal_id, member_id, title_id, title_sort_order, sort_order) 
       VALUES (?, ?, ?, ?, ?)`,
      [journal_id, member_id, title_id, titleSortOrder, memberSortOrder]
    );

    await conn.end();
    return NextResponse.json({ success: true, message: "Role assigned" });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// export async function PATCH(req) {
//   const body = await req.json();
//   const { id, title_id, member_id } = body;
//   const conn = await createDbConnection();
//   await conn.query(
//     `UPDATE journal_editorial_roles SET title_id = ?, member_id = ? WHERE id = ?`,
//     [title_id, member_id, id]
//   );
//   await conn.end();
//   return NextResponse.json({ success: true, message: "Role updated" });
// }

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, member_id, title_id } = body || {};

    if (!id || !member_id || !title_id) {
      return NextResponse.json(
        { success: false, message: "id, member_id, title_id required" },
        { status: 400 }
      );
    }

    const conn = await createDbConnection();

    // find current role
    const [roleRows] = await conn.query(
      `SELECT journal_id, title_id AS old_title_id 
       FROM journal_editorial_roles 
       WHERE id = ?`,
      [id]
    );
    const role = roleRows[0];

    if (!role) {
      await conn.end();
      return NextResponse.json(
        { success: false, message: "Role not found" },
        { status: 404 }
      );
    }

    if (Number(role.old_title_id) !== Number(title_id)) {
      // 1. Find or assign new title_sort_order
      const [existingRows] = await conn.query(
        `SELECT title_sort_order 
         FROM journal_editorial_roles 
         WHERE journal_id = ? AND title_id = ? 
         LIMIT 1`,
        [role.journal_id, title_id]
      );
      const existingGroup = existingRows[0];

      let titleSortOrder;

      if (existingGroup) {
        titleSortOrder = existingGroup.title_sort_order;
      } else {
        const [[{ maxTitleSort }]] = await conn.query(
          `SELECT COALESCE(MAX(title_sort_order), 0) AS maxTitleSort 
           FROM journal_editorial_roles 
           WHERE journal_id = ?`,
          [role.journal_id]
        );
        titleSortOrder = (maxTitleSort ?? 0) + 1;
      }

      // 2. Find new member sort order inside that title group
      const [[{ maxMemberOrder }]] = await conn.query(
        `SELECT COALESCE(MAX(sort_order), 0) AS maxMemberOrder 
         FROM journal_editorial_roles 
         WHERE journal_id = ? AND title_id = ?`,
        [role.journal_id, title_id]
      );
      const memberSortOrder = (maxMemberOrder ?? 0) + 1;

      // 3. Update role into new group
      await conn.query(
        `UPDATE journal_editorial_roles 
         SET member_id = ?, title_id = ?, title_sort_order = ?, sort_order = ? 
         WHERE id = ?`,
        [member_id, title_id, titleSortOrder, memberSortOrder, id]
      );
    } else {
      // Same title → keep orders, just update member/title_id
      await conn.query(
        `UPDATE journal_editorial_roles 
         SET member_id = ?, title_id = ? 
         WHERE id = ?`,
        [member_id, title_id, id]
      );
    }

    await conn.end();
    return NextResponse.json({ success: true, message: "Role updated" });
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { journal_id, scope, title_id, orderedIds } = body || {};

    if (
      !journal_id ||
      !Array.isArray(orderedIds) ||
      !orderedIds.length ||
      !scope
    ) {
      return NextResponse.json(
        { success: false, message: "journal_id, scope, orderedIds required" },
        { status: 400 }
      );
    }

    const conn = await createDbConnection();

    if (scope === "global") {
      // Track title groups as they appear in the ordered list
      let currentTitle = null;
      let titleOrder = 0;
      let memberOrderMap = {};

      for (let idx = 0; idx < orderedIds.length; idx++) {
        const id = orderedIds[idx];

        // find this role
        const [rows] = await conn.query(
          `SELECT title_id FROM journal_editorial_roles 
           WHERE id = ? AND journal_id = ?`,
          [id, journal_id]
        );
        const role = rows[0];
        if (!role) continue;

        // new title group encountered
        if (role.title_id !== currentTitle) {
          titleOrder++;
          currentTitle = role.title_id;
          memberOrderMap[currentTitle] = 1;
        }

        await conn.query(
          `UPDATE journal_editorial_roles 
           SET title_sort_order = ?, sort_order = ? 
           WHERE id = ?`,
          [titleOrder, memberOrderMap[currentTitle]++, id]
        );
      }
    } else if (scope === "title" && title_id) {
      // Only reorder members inside a specific title
      for (let idx = 0; idx < orderedIds.length; idx++) {
        const id = orderedIds[idx];
        await conn.query(
          `UPDATE journal_editorial_roles 
           SET sort_order = ? 
           WHERE id = ? AND journal_id = ? AND title_id = ?`,
          [idx + 1, id, journal_id, title_id]
        );
      }
    }

    await conn.end();
    return NextResponse.json({ success: true, message: "Order updated" });
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const conn = await createDbConnection();
  await conn.query("DELETE FROM journal_editorial_roles WHERE id = ?", [id]);
  await conn.end();
  return NextResponse.json({ success: true, message: "Role deleted" });
}
