import { createDbConnection } from "@/lib/db";

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

function slugFromShortName(s) {
  if (!s) return null;
  return s
    .replace(/^DS-?/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
