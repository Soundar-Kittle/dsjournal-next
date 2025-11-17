import { createDbConnection } from "@/lib/db";
import { unstable_cache } from "next/cache";

export async function _getJournalBySlug(slug) {
  if (!slug) return null;

  const normalizedSlug = slug.trim().toUpperCase();
  const withPrefix = `DS-${normalizedSlug}`; 

  const connection = await createDbConnection();
  try {
    const [rows] = await connection.execute(
      `
      SELECT * FROM journals
      WHERE short_name = ? AND is_active = 1
      LIMIT 1
      `,
      [withPrefix] 
    );

    return rows.length > 0 ? rows[0] : null;
  } finally {
    await connection.end();
  }
}

export async function _getJournals(q) {
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

    sql += ` ORDER BY sort_index ASC`;

    const [rows] = await connection.execute(sql, params);

    // ✅ Normalize slug: remove DS- prefix if present, lowercase always
    const normalizeSlug = (shortName, journalName, id) => {
      const base = shortName?.trim() || journalName?.trim() || `journal-${id}`;

      if (/^DS-/i.test(base)) {
        // remove prefix DS-
        return base.replace(/^DS-/i, "").toLowerCase(); // DS-DST → dst, DS-M → m
      }

      // otherwise keep same, just lowercase
      return base.toLowerCase();
    };

    return rows.map((r) => ({
      id: Number(r.id),
      name: String(r.journal_name ?? ""),
      slug: normalizeSlug(r.short_name, r.journal_name, r.id),
      cover_image: r.cover_image,
      issn_print: r.issn_print,
      issn_online: r.issn_online,
    }));
  } finally {
    await connection.end();
  }
}

export async function _getMonthGroupsBySlug(slug) {
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
        AND EXISTS (
          SELECT 1
          FROM articles a
          WHERE a.journal_id = mg.journal_id
            AND a.volume_id = mg.volume_id
            AND a.issue_id = mg.issue_id
            AND a.article_status = 'published'
        )
      ORDER BY v.year DESC, v.volume_number DESC, i.issue_number DESC
    `;

    const [rows] = await connection.execute(sql, [journal.id]);

    if (!rows.length) {
      return { grouped: [], currentIssue: null };
    }

    // ✅ pick the first row as currentIssue (it’s the latest with at least one article)
    const current = rows[0];
    const currentIssue = {
      volume: current.volume,
      issue: current.issue,
      label: `Volume ${current.volume} Issue ${current.issue}`,
      href: `/volume${current.volume}/issue${current.issue}`,
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

export async function _getJournalAnalytics() {
  const connection = await createDbConnection();
  try {
    const [rows] = await connection.execute(`
      SELECT 
        j.short_name,
        j.journal_name,
        COUNT(a.id) AS total_papers,
        SUM(a.article_status = 'published') AS published_papers,
        MAX(a.published_at) AS last_published
      FROM journals j
      LEFT JOIN articles a ON j.id = a.journal_id
      GROUP BY j.id
      ORDER BY j.sort_index ASC
    `);

    return rows.map((r) => ({
      short_name: r.short_name,
      journal_name: r.journal_name,
      total_papers: Number(r.total_papers),
      published_papers: Number(r.published_papers),
      last_published: r.last_published,
    }));
  } finally {
    await connection.end();
  }
}

export const getJournals = unstable_cache(
  async (q) => _getJournals(q),
  ["journals-list"],
  {
    tags: ["journals"],
  }
);

export const getJournalBySlug = unstable_cache(
  async (slug) => _getJournalBySlug(slug),
  ["journal_by_slug"],
  {
    tags: ["journal_slug"],
  }
);

export const getMonthGroupsBySlug = unstable_cache(
  async (slug) => _getMonthGroupsBySlug(slug),
  ["journals-month-groups"],
  {
    tags: ["journal_month_groups"],
  }
);

export const getJournalAnalytics = unstable_cache(
  async () => _getJournalAnalytics(),
  ["journals-analytics"],
  {
    tags: ["journal_analytics"],
  }
);
