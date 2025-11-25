// import { createDbConnection } from "@/lib/db";

// export async function getArticleById(articleId) {
//   const connection = await createDbConnection();
//   try {
//     const sql = `
//       SELECT * ,
//       v.volume_number,
//       i.issue_number,
//       a.month_from,
//       a.month_to,
//       v.year,
//       j.journal_name
//       FROM articles a
//       JOIN volumes v ON a.volume_id = v.id
//       JOIN issues i  ON a.issue_id  = i.id
//       JOIN journals j  ON a.journal_id  = j.id
//       WHERE a.article_id = ? AND a.article_status = 'published'
//       LIMIT 1
//     `;
//     const [[rows]] = await connection.execute(sql, [articleId]);

//     return rows;
//   } finally {
//     await connection.end();
//   }
// }
/////////////////
/////////////////
/////////////////
/////////////////

import { createDbConnection } from "@/lib/db";
import { unstable_cache } from "next/cache";

async function _getArticleById(articleId) {
  const connection = await createDbConnection();
  try {
    const sql = `
      SELECT *,
      v.volume_number,
      i.issue_number,
      a.month_from,
      a.month_to,
      v.year,
      j.journal_name
      FROM articles a 
      JOIN volumes v ON a.volume_id = v.id
      JOIN issues i  ON a.issue_id  = i.id
      JOIN journals j ON a.journal_id = j.id
      WHERE a.article_id = ? AND a.article_status = 'published'
      LIMIT 1
    `;

    const [[rows]] = await connection.execute(sql, [articleId]);
    return rows;
  } finally {
    await connection.end();
  }
}

export const getArticleById = unstable_cache(
  async (articleId) => _getArticleById(articleId),
  ["article_by_id"],
  {
    tags: ["articles"],
  }
);
