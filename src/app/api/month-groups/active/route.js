import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function GET(req) {
  const connection = await createDbConnection();
  try {
    const { searchParams } = new URL(req.url);
    const journal_id = searchParams.get("journal_id");
    if (!journal_id)
      return NextResponse.json({ success: false, message: "journal_id required" });

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1–12
    const currentYear = now.getFullYear();

    const [rows] = await connection.query(`
      SELECT 
        mg.id,
        mg.journal_id,
        mg.volume_id,
        mg.issue_id,
        mg.from_month,
        mg.to_month,
        i.issue_number,
        i.issue_label,
        v.volume_number,
        v.volume_label,
        v.year
      FROM month_groups mg
      LEFT JOIN issues i ON i.id = mg.issue_id
      LEFT JOIN volumes v ON v.id = mg.volume_id
      WHERE mg.journal_id = ?
      ORDER BY v.year ASC, v.volume_number ASC, i.issue_number ASC
    `, [journal_id]);

    const results = rows.map(r => {
      const fromIdx = MONTHS.indexOf(r.from_month) + 1;
      const toIdx = MONTHS.indexOf(r.to_month) + 1;
      if (fromIdx === 0 || toIdx === 0) return null;

      // If volume year < current year => it's past
      if (r.year < currentYear) return { ...r, status: "Past" };
      // If volume year > current year => it's definitely upcoming
      if (r.year > currentYear) return { ...r, status: "Upcoming" };

      // Same year => determine based on month range
      const isRunning =
        fromIdx <= toIdx
          ? currentMonth >= fromIdx && currentMonth <= toIdx
          : currentMonth >= fromIdx || currentMonth <= toIdx;

      const isUpcoming =
        !isRunning && fromIdx > currentMonth;

      let status = "Past";
      if (isRunning) status = "Running";
      else if (isUpcoming) status = "Upcoming";

      return { ...r, status };
    }).filter(Boolean);

    // Keep only current or upcoming
    const activeUpcoming = results.filter(r =>
      r.status === "Running" || r.status === "Upcoming"
    );

    // Sort: Running first, then by year ascending
    const sorted = activeUpcoming.sort((a, b) => {
      if (a.status !== b.status) return a.status === "Running" ? -1 : 1;
      if (a.year !== b.year) return a.year - b.year;
      return a.volume_number - b.volume_number;
    });

    return NextResponse.json({
      success: true,
      message: "Active & upcoming issues (by year + month)",
      month_groups: sorted,
    });

  } catch (err) {
    console.error("❌ month-groups active error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch month groups" });
  } finally {
    await connection.end();
  }
}
