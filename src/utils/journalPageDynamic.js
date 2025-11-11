//import { createDbConnection } from "@/lib/db";

// export async function getRenderedJournalPage(journal_id, page_title) {
//   const conn = await createDbConnection();
//   try {
//     // Fetch page content
//     const [[page]] = await conn.query(
//       "SELECT * FROM journal_pages WHERE journal_id = ? AND page_title = ? LIMIT 1",
//       [journal_id, page_title]
//     );
//     if (!page) return null;

//     // Fetch dynamic variables
//     const [vars] = await conn.query(
//       "SELECT var_key, var_value FROM journal_dynamic_values WHERE journal_id = ?",
//       [journal_id]
//     );

//     const map = Object.fromEntries(vars.map((v) => [v.var_key, v.var_value]));

//     // Replace placeholders like {{var_key}}
//     let rendered = page.content;
//     Object.entries(map).forEach(([key, val]) => {
//       const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
//       rendered = rendered.replace(regex, val);
//     });

//     return { ...page, rendered_content: rendered };
//   } catch (err) {
//     console.error("❌ getRenderedJournalPage Error:", err);
//     return null;
//   } finally {
//     conn.end();
//   }
// }

import { createDbConnection } from "@/lib/db";
import { getCallForPaper } from "@/utils/callForPaper";

export async function getRenderedJournalPage(journalId, pageTitle) {
  const conn = await createDbConnection();
  try {
    // 🧩 Step 1: Fetch journal page content
    const [[page]] = await conn.query(
      `SELECT * FROM journal_pages WHERE journal_id = ? AND page_title = ? LIMIT 1`,
      [journalId, pageTitle]
    );

    if (!page) return null;

    // 🧩 Step 2: Fetch related call-for-paper info
    const cfp = await getCallForPaper(journalId);

    // 🧩 Step 3: Replace placeholder with actual date
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
