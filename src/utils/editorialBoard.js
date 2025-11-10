import { createDbConnection } from "@/lib/db";
import { getJournalBySlug } from "./journals";

export async function getEditorialBoardBySlug(slug) {
  if (!slug) return [];

  const journal = await getJournalBySlug(slug);
  if (!journal) return [];

  const connection = await createDbConnection();
  try {
    const sql = `
      SELECT 
        t.id   AS title_id,
        t.title AS title_name,
        r.sort_order,
        r.title_sort_order,
        m.id   AS member_id,
        m.name,
        m.designation,
        m.department,
        m.university,
        m.country,
        m.state,
        m.city,
        m.address_lines,
        m.has_address,
        m.profile_link,
        m.email,
        m.status AS member_status,
        m.is_verified
      FROM journal_editorial_roles r
      JOIN editorial_titles t   ON r.title_id = t.id
      JOIN editorial_members m  ON r.member_id = m.id
      WHERE r.journal_id = ?
        AND r.is_active = 1
        AND t.status = 1
        AND m.status = 1
      ORDER BY t.id ASC, r.title_sort_order ASC, r.sort_order ASC, m.id ASC
    `;

    const [rows] = await connection.execute(sql, [journal.id]);

    // Group by title
    const grouped = rows.reduce((acc, row) => {
      if (!acc[row.title_id]) {
        acc[row.title_id] = {
          title_order: row.title_sort_order,
          title: row.title_name,
          members: [],
        };
      }

      acc[row.title_id].members.push({
        id: row.member_id,
        name: row.name,
        designation: row.designation,
        department: row.department,
        university: row.university,
        country: row.country,
        state: row.state,
        city: row.city,
        address: row.has_address ? row.address_lines : null,
        email: row.email,
        has_address: !!row.has_address,
        profile_link: row.profile_link,
        is_verified: !!row.is_verified,
      });

      return acc;
    }, {});

    return Object.values(grouped);
  } finally {
    await connection.end();
  }
}
