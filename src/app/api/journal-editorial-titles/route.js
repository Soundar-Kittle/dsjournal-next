
/* ──────────────────────────────────────────────
   PATCH  /api/journal-editorial-titles
   body:
     ① { id, is_active }
     ② { id, display_name }          (optional rename)
     ③ { journal_id, order:[4,2,1] } (drag-drop reorder)
   ────────────────────────────────────────────── */
// export async function PATCH(req) {
//   const body = await req.json();
//   const conn = await createDbConnection();

//   /* ③ Drag-drop reorder */
//   if (body.order && Array.isArray(body.order) && body.journal_id) {
//     try {
//       await Promise.all(
//         body.order.map((titleId, idx) =>
//           conn.query(
//             "UPDATE journal_editorial_titles SET display_order = ? WHERE journal_id = ? AND title_id = ?",
//             [idx, body.journal_id, titleId]
//           )
//         )
//       );
//       await conn.end();
//       return NextResponse.json({ success: true, message: "Order updated" });
//     } catch (err) {
//       await conn.end();
//       return NextResponse.json(
//         { success: false, error: err.message },
//         { status: 500 }
//       );
//     }
//   }

//   /* ① / ② Single-row update  */
//   if (!body.id)
//     return NextResponse.json(
//       { success: false, error: "id is required" },
//       { status: 400 }
//     );

//   const fields = [];
//   const params = [];

//   if (body.is_active !== undefined) {
//     fields.push("is_active = ?");
//     params.push(body.is_active ? 1 : 0);
//   }
//   if (body.display_name !== undefined) {
//     fields.push("display_name = ?");
//     params.push(body.display_name);
//   }

//   if (!fields.length) {
//     await conn.end();
//     return NextResponse.json(
//       { success: false, error: "No valid fields supplied" },
//       { status: 400 }
//     );
//   }

//   params.push(body.id);

//   try {
//     await conn.query(
//       `UPDATE journal_editorial_titles SET ${fields.join(", ")} WHERE id = ?`,
//       params
//     );
//     await conn.end();
//     return NextResponse.json({ success: true, message: "Block updated" });
//   } catch (err) {
//     await conn.end();
//     return NextResponse.json(
//       { success: false, error: err.message },
//       { status: 500 }
//     );
//   }
// }

/* ───────────────────────────────────────── */
/*   src/app/api/journal-editorial-titles/route.js
/* ───────────────────────────────────────── */
import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";

/* ───────────── GET /api/journal-editorial-titles?journal=ID ─────────── */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const journalId = searchParams.get("journal");

  if (!journalId) {
    return NextResponse.json(
      { success: false, error: "journal param required" },
      { status: 400 }
    );
  }

  const conn = await createDbConnection();
  const [rows] = await conn.query(
    `
    SELECT
      jt.id, jt.journal_id, jt.title_id,
      t.title,
      jt.display_order,
      jt.is_active
    FROM journal_editorial_titles jt
    JOIN editorial_titles t ON t.id = jt.title_id
    WHERE jt.journal_id = ?
    ORDER BY jt.display_order ASC
    `,
    [journalId]
  );
  await conn.end();
  return NextResponse.json({ success: true, titles: rows });
}

/* ─────────── POST  /api/journal-editorial-titles ────────────
   • bulk attach:  { journal_id, bulk:true }
   • single attach:{ journal_id, title_id, display_order? }
---------------------------------------------------------------- */
export async function POST(req) {
  const body = await req.json();
  const { journal_id } = body;

  if (!journal_id)
    return NextResponse.json(
      { success: false, error: "journal_id required" },
      { status: 400 }
    );

  const conn = await createDbConnection();

  try {
    /* ── bulk attach all active titles ─────────────────────── */
    if (body.bulk) {
      console.log("▶ bulk attach for journal", journal_id);

      await conn.query(
        `
        SET @row := -1;
        INSERT IGNORE INTO journal_editorial_titles
              (journal_id, title_id, display_order, is_active)
        SELECT ?, et.id, @row := @row + 1, 1
        FROM editorial_titles et
        WHERE et.status = 1
        ORDER BY et.id
        `,
        [journal_id]
      );

      await conn.end();
      return NextResponse.json({ success: true, message: "Bulk blocks created" });
    }

    /* ── single attach ─────────────────────────────────────── */
    const { title_id, display_order = 0 } = body;
    if (!title_id) {
      await conn.end();
      return NextResponse.json(
        { success: false, error: "title_id required" },
        { status: 400 }
      );
    }

    console.log("▶ single attach – j:", journal_id, "t:", title_id);

    await conn.query(
      `INSERT IGNORE INTO journal_editorial_titles
         (journal_id, title_id, display_order, is_active)
       VALUES (?, ?, ?, 1)`,
      [journal_id, title_id, display_order]
    );

    await conn.end();
    return NextResponse.json({ success: true, message: "Block created" });
  } catch (err) {
    await conn.end();
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

/* ───────────── PATCH /api/journal-editorial-titles ────────────
   A. Drag-drop order     { journal_id, order:[titleId,…] }
   B. Toggle / rename     { id, is_active?, display_name? }
---------------------------------------------------------------- */
export async function PATCH(req) {
  const body = await req.json();
  const conn = await createDbConnection();


  /* A. drag-drop reorder */
  if (Array.isArray(body.order) && body.journal_id) {
    await Promise.all(
      body.order.map((titleId, idx) =>
        conn.query(
          `UPDATE journal_editorial_titles
             SET display_order = ?
           WHERE journal_id = ? AND title_id = ?`,
          [idx, body.journal_id, titleId]
        )
      )
    );
    await conn.end();
    return NextResponse.json({ success: true, message: "Order saved" });
  }

  /* B. toggle or rename single block */
  if (!body.id) {
    await conn.end();
    return NextResponse.json(
      { success: false, error: "id is required" },
      { status: 400 }
    );
  }

  const fields = [];
  const params = [];

  if (body.is_active !== undefined) {
    fields.push("is_active = ?");
    params.push(body.is_active ? 1 : 0);
  }
  if (body.display_name !== undefined) {
    fields.push("display_name = ?");
    params.push(body.display_name);
  }

  if (!fields.length) {
    await conn.end();
    return NextResponse.json(
      { success: false, error: "No valid fields supplied" },
      { status: 400 }
    );
  }

  params.push(body.id);
  await conn.query(
    `UPDATE journal_editorial_titles SET ${fields.join(", ")} WHERE id = ?`,
    params
  );
  await conn.end();
  return NextResponse.json({ success: true, message: "Block updated" });
}
