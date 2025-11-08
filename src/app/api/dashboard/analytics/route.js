import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";

export async function GET() {
  const conn = await createDbConnection();

  try {
    // === 1️⃣ Total Published Papers ===
    const [[{ totalPapers }]] = await conn.query(`
      SELECT COUNT(*) AS totalPapers 
      FROM articles 
      WHERE article_status = 'published'
    `);

    // === 2️⃣ Active Journals ===
    const [[{ activeJournals }]] = await conn.query(`
      SELECT COUNT(*) AS activeJournals 
      FROM journals 
      WHERE journal_status = 1
    `);

    // === 3️⃣ Upcoming Issues (future publishing date) ===
    const [[{ upcomingIssues }]] = await conn.query(`
      SELECT COUNT(*) AS upcomingIssues 
      FROM journal_issues 
      WHERE issue_publish_date > NOW()
    `);

    // === 4️⃣ Monthly Published Articles (last 12 months) ===
    const [monthlyData] = await conn.query(`
      SELECT 
        DATE_FORMAT(article_publish_date, '%b %Y') AS month,
        COUNT(*) AS count
      FROM articles
      WHERE article_status = 'published'
        AND article_publish_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(article_publish_date, '%Y-%m')
      ORDER BY MIN(article_publish_date) ASC
    `);

    // === 5️⃣ Journal-wise total papers (optional extra) ===
    const [journalWise] = await conn.query(`
      SELECT 
        j.journal_name AS journal,
        COUNT(a.id) AS total
      FROM journals j
      LEFT JOIN articles a 
        ON a.journal_id = j.id AND a.article_status = 'published'
      GROUP BY j.id
      ORDER BY total DESC
    `);

    // === 6️⃣ Current Issue per Journal ===
const [currentIssues] = await conn.query(`
  SELECT 
    j.journal_name AS journal,
    ji.volume_no AS volume,
    ji.issue_no AS issue,
    DATE_FORMAT(ji.issue_publish_date, '%b %Y') AS publish_month
  FROM journals j
  LEFT JOIN journal_issues ji 
    ON ji.journal_id = j.id
    AND ji.issue_publish_date = (
      SELECT MAX(issue_publish_date)
      FROM journal_issues
      WHERE journal_id = j.id
    )
  WHERE j.journal_status = 1
  ORDER BY j.journal_name ASC
`);

    return NextResponse.json({
      success: true,
      totalPapers,
      activeJournals,
      upcomingIssues,
      monthlyPapers: monthlyData,
      journalWise, // bonus if you want to display a pie chart later
       currentIssues, // 🆕 Add this
    });

  } catch (error) {
    console.error("❌ Dashboard Analytics Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load analytics" },
      { status: 500 }
    );
  } finally {
    await conn.end();
  }
}
