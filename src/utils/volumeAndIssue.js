// import { createDbConnection } from "@/lib/db";
// import { getJournalBySlug } from "./jounals";

// export async function getArticlesBySlugVolumeIssue(slug, volumeNum, issueNum) {
//   const journal = await getJournalBySlug(slug);
//   if (!journal) return null;

//   const connection = await createDbConnection();
//   try {
//     const sql = `
//       SELECT 
//         a.id,
//         a.article_id,
//         a.article_title,
//         a.authors,
//         a.month_from,
//         a.month_to,
//         v.volume_number,
//         i.issue_number,
//         v.year,
//         i.issue_label
//       FROM articles a
//       JOIN volumes v ON a.volume_id = v.id
//       JOIN issues i  ON a.issue_id  = i.id
//       WHERE a.journal_id = ?
//         AND v.volume_number = ?
//         AND i.issue_number = ?
//         AND a.article_status = 'published'
//       ORDER BY a.id ASC
//     `;

//     const [rows] = await connection.execute(sql, [
//       journal.id,
//       volumeNum,
//       issueNum,
//     ]);

//     return rows.map((r) => ({
//       articleId: r.article_id,
//       title: r.article_title,
//       authors: Array.isArray(r.authors)
//         ? r.authors
//         : JSON.parse(r.authors || "[]"),
//       volume: r.volume_number,
//       issue: r.issue_number,
//       year: r.year,
//       months: [r.month_from, r.month_to].filter(Boolean).join("-"),
//     }));
//   } finally {
//     await connection.end();
//   }
// }

import { createDbConnection } from "@/lib/db";
import { getJournalBySlug } from "@/utils/jounals";

export async function getArticlesBySlugVolumeIssue(slug, volumeNum, issueNum) {
  if (!slug || !volumeNum || !issueNum) return [];

  // ✅ Normalize and fetch journal (handles DSM, DS-DST, DST, etc.)
  const normalizedSlug = slug.trim().toUpperCase();
  const journal =
    (await getJournalBySlug(normalizedSlug)) ||
    (await getJournalBySlug(`DS-${normalizedSlug}`));

  if (!journal) return [];

  const connection = await createDbConnection();
  try {
    const sql = `
      SELECT 
        a.id,
        a.article_id,
        a.article_title,
        a.authors,
        a.month_from,
        a.month_to,
        v.volume_number,
        i.issue_number,
        v.year,
        i.issue_label
      FROM articles a
      JOIN volumes v ON a.volume_id = v.id
      JOIN issues i  ON a.issue_id  = i.id
      WHERE a.journal_id = ?
        AND v.volume_number = ?
        AND i.issue_number = ?
        AND a.article_status = 'published'
      ORDER BY a.id ASC
    `;

    const [rows] = await connection.execute(sql, [
      journal.id,
      volumeNum,
      issueNum,
    ]);

    return rows.map((r) => ({
      articleId: r.article_id,
      title: r.article_title,
      authors: (() => {
        try {
          return Array.isArray(r.authors)
            ? r.authors
            : JSON.parse(r.authors || "[]");
        } catch {
          return [r.authors];
        }
      })(),
      volume: r.volume_number,
      issue: r.issue_number,
      year: r.year,
      months: [r.month_from, r.month_to].filter(Boolean).join("-"),
    }));
  } finally {
    await connection.end();
  }
}
