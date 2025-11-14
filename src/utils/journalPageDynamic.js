import { createDbConnection } from "@/lib/db";
import { getCallForPaper } from "@/utils/callForPaper";
import { unstable_cache } from "next/cache";

export async function _getRenderedJournalPage(journalId, pageTitle) {
  const conn = await createDbConnection();
  try {
    const [[page]] = await conn.query(
      `SELECT * FROM journal_pages WHERE journal_id = ? AND page_title = ? LIMIT 1`,
      [journalId, pageTitle]
    );

    if (!page) return null;
    const cfp = await getCallForPaper(journalId);

    let rendered = page.content || "";

    if (cfp?.display_date) {
      rendered = rendered.replace(
        /{{\s*call_for_paper_date\s*}}/g,
        cfp.display_date
      );
    }

    return {
      ...page,
      rendered_content: rendered,
    };
  } catch (err) {
    console.error("❌ Error in getRenderedJournalPage:", err);
    return null;
  } finally {
    conn.end();
  }
}

export const getRenderedJournalPage = unstable_cache(
  async (journalId, pageTitle) => _getRenderedJournalPage(journalId, pageTitle),
  [`rendered-page-list`],
  {
    tags: ["rendered-page"],
  }
);

// export const getRenderedJournalPage = unstable_cache(
//   async (journalId, pageTitle) =>
//     _getRenderedJournalPage(journalId, pageTitle),
//   (journalId, pageTitle) => [
//     `rendered_page_${journalId}_${pageTitle}`,
//   ],

//   {
//     tags: (journalId, pageTitle) => [
//       `journal_page_${journalId}_${pageTitle}`,
//       `cfp_tag_${journalId || "common"}`,
//     ],
//   }
// );
