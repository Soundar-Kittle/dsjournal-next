import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";

export async function GET() {
  const conn = await createDbConnection();

  try {
    // === 1️⃣ Total Published Papers ===
    const [[{ totalPapers }]] = await conn.query(`
      SELECT COUNT(*) AS totalPapers 
      FROM articles 
      WHERE published IS NOT NULL
    `);

    // === 2️⃣ Active Journals ===
    const [[{ activeJournals }]] = await conn.query(`
      SELECT COUNT(*) AS activeJournals 
      FROM journals 
      WHERE is_active = 1
    `);

    // === 3️⃣ Upcoming Issues (future publishing date) ===
const [[{ upcomingIssues }]] = await conn.query(`
  SELECT COUNT(*) AS upcomingIssues 
  FROM journal_volume_issue 
  WHERE published > NOW()
`);

    // === 4️⃣ Monthly Published Articles (last 12 months) ===
    const [monthlyData] = await conn.query(`
      SELECT 
        DATE_FORMAT(published, '%b %Y') AS month,
        COUNT(*) AS count
      FROM articles
      WHERE published IS NOT NULL
        AND published >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(published, '%Y-%m')
      ORDER BY MIN(published) ASC
    `);

    // === 5️⃣ Journal-wise total publications ===
    const [journalWise] = await conn.query(`
      SELECT 
        j.journal_name AS journal,
        COUNT(a.id) AS total
      FROM journals j
      LEFT JOIN articles a 
        ON a.journal_id = j.id AND a.published IS NOT NULL
      GROUP BY j.id
      ORDER BY total DESC
    `);

    // === 6️⃣ Current Issue Summary ===
    const [currentIssues] = await conn.query(`
      SELECT 
        j.journal_name AS journal,
        vi.volume_no AS volume,
        vi.issue_no AS issue,
        DATE_FORMAT(vi.publish_date, '%b %Y') AS publish_month
      FROM journals j
      LEFT JOIN journal_volume_issue vi 
        ON vi.journal_id = j.id
        AND vi.publish_date = (
          SELECT MAX(publish_date)
          FROM journal_volume_issue
          WHERE journal_id = j.id
        )
      WHERE j.is_active = 1
      ORDER BY j.journal_name ASC
    `);

    return NextResponse.json({
      success: true,
      totalPapers,
      activeJournals,
      upcomingIssues,
      monthlyPapers: monthlyData,
      journalWise,
      currentIssues,
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