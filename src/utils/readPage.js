import fs from "fs";
import path from "path";
import { createDbConnection } from "@/lib/db";

/**
 * Reads content either from DB (journal_pages) or static page file
 * @param {string} slug - example: 'about', 'editorial-board'
 * @param {number|null} journalId - optional for multi-journal system
 */
export async function readPage(slug, journalId = null) {
  const connection = await createDbConnection();
  try {
    // 1️⃣ Try fetching from DB
    const [rows] = await connection.query(
      `SELECT * FROM journal_pages 
       WHERE page_title = ? ${journalId ? "AND journal_id = ?" : ""} LIMIT 1`,
      journalId ? [slug, journalId] : [slug]
    );

    if (rows.length > 0) {
      const page = rows[0];
      return {
        source: "database",
        title: page.page_title,
        content: page.content,
        is_active: page.is_active,
      };
    }

    // 2️⃣ Fallback: Try static file in /app/static-pages/
    const filePath = path.join(process.cwd(), "src/app/static-pages", `${slug}.html`);
    if (fs.existsSync(filePath)) {
      const htmlContent = fs.readFileSync(filePath, "utf-8");
      return { source: "static", title: slug, content: htmlContent, is_active: true };
    }

    // 3️⃣ Fallback: Return null if not found
    return null;
  } catch (err) {
    console.error("❌ readPage error:", err);
    return null;
  } finally {
    await connection.end();
  }
}
