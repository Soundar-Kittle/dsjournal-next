import { createDbConnection } from "@/lib/db";

function slugFromShortName(s) {
  if (!s) return null;
  return s
    .replace(/^DS-?/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getJournalBySlug(slug) {
  if (!slug) return null;
  const normalized = `DS-${slug.toUpperCase()}`;

  const connection = await createDbConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM journals WHERE short_name = ? LIMIT 1`,
      [normalized]
    );

    return rows.length > 0 ? rows[0] : null;
  } finally {
    await connection.end();
  }
}

export async function getJournals(q) {
  const connection = await createDbConnection();
  try {
    let sql = `
      SELECT * FROM journals
      WHERE is_active = 1
    `;
    const params = [];

    if (q) {
      sql += `
        AND (
          journal_name LIKE ? 
          OR issn_print LIKE ? 
          OR issn_online LIKE ?
        )
      `;
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    sql += ` ORDER BY journal_name ASC`;

    const [rows] = await connection.execute(sql, params);

    return rows.map((r) => ({
      id: Number(r.id),
      name: String(r.journal_name ?? ""),
      slug: r.slug
        ? String(r.slug).toLowerCase()
        : slugFromShortName(r.short_name) ?? String(r.id),
      cover_image: r.cover_image,
      issn_print: r.issn_print,
      issn_online: r.issn_online,
    }));
  } finally {
    await connection.end();
  }
}

// export async function getMonthGroupsBySlug(slug) {
//   if (!slug) return [];

//   const journal = await getJournalBySlug(slug);
//   if (!journal) return [];

//   const connection = await createDbConnection();
//   try {
//     const sql = `
//       SELECT 
//         mg.id,
//         mg.journal_id,
//         mg.volume_id,
//         mg.issue_id,
//         mg.from_month,
//         mg.to_month,
//         v.volume_number AS volume,
//         i.issue_number  AS issue,
//         v.year AS year
//       FROM month_groups mg
//       JOIN volumes v ON mg.volume_id = v.id
//       JOIN issues  i ON mg.issue_id  = i.id
//       WHERE mg.journal_id = ?
//       ORDER BY v.year DESC, v.volume_number DESC, i.issue_number ASC
//     `;

//     const [rows] = await connection.execute(sql, [journal.id]);

//     // group by year
//     const grouped = rows.reduce((acc, row) => {
//       const year = row.year;
//       if (!acc[year]) acc[year] = [];

//       acc[year].push({
//         volume: row.volume,
//         issue: row.issue,
//         label: `Volume ${row.volume} Issue ${row.issue}, ${row.from_month}-${row.to_month}`,
//         href: `/volume${row.volume}/issue${row.issue}`,
//       });

//       return acc;
//     }, {});

//     return Object.entries(grouped)
//       .sort(([a], [b]) => b - a)
//       .map(([year, items]) => ({
//         year,
//         items: items.sort((a, b) => {
//           if (b.issue !== a.issue) return b.issue - a.issue;
//           return a.issue - b.issue;
//         }),
//       }));
//   } finally {
//     await connection.end();
//   }
// }

export async function getMonthGroupsBySlug(slug) {
  if (!slug) return { grouped: [], currentIssue: null };

  const journal = await getJournalBySlug(slug);
  if (!journal) return { grouped: [], currentIssue: null };

  const connection = await createDbConnection();
  try {
    const sql = `
      SELECT 
        mg.id,
        mg.journal_id,
        mg.volume_id,
        mg.issue_id,
        mg.from_month,
        mg.to_month,
        v.volume_number AS volume,
        i.issue_number  AS issue,
        v.year AS year
      FROM month_groups mg
      JOIN volumes v ON mg.volume_id = v.id
      JOIN issues  i ON mg.issue_id  = i.id
      WHERE mg.journal_id = ?
      ORDER BY v.year DESC, v.volume_number DESC, i.issue_number DESC
    `;

    const [rows] = await connection.execute(sql, [journal.id]);

    if (!rows.length) {
      return { grouped: [], currentIssue: null };
    }

    // pick the very first row as "current issue" since it's already sorted DESC
    const current = rows[0];
    const currentIssue = {
      volume: current.volume,
      issue: current.issue,
      label: `Volume ${current.volume} Issue ${current.issue}`,
    };

    // group by year
    const grouped = rows.reduce((acc, row) => {
      const year = row.year;
      if (!acc[year]) acc[year] = [];

      acc[year].push({
        volume: row.volume,
        issue: row.issue,
        label: `Volume ${row.volume} Issue ${row.issue}, ${row.from_month}-${row.to_month}`,
        href: `/volume${row.volume}/issue${row.issue}`,
      });

      return acc;
    }, {});

    return {
      currentIssue,
      grouped: Object.entries(grouped)
        .sort(([a], [b]) => b - a)
        .map(([year, items]) => ({
          year,
          items: items.sort((a, b) => b.issue - a.issue),
        })),
    };
  } finally {
    await connection.end();
  }
}
