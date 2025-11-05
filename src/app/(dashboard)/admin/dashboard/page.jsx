"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  FileText,
  BookOpen,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

export default function DashboardHome() {
  const [analytics, setAnalytics] = useState({
    totalPapers: 0,
    activeJournals: 0,
    upcomingIssues: 0,
    monthlyPapers: [],
    journalWise: [],
  });

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/dashboard/analytics");
        const data = await res.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Error loading analytics:", error);
      }
    }
    fetchAnalytics();
  }, []);

  const COLORS = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // amber
    "#EF4444", // red
    "#8B5CF6", // violet
    "#EC4899", // pink
    "#14B8A6", // teal
  ];

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Journal Dashboard
      </h2>

      {/* ====== STAT CARDS ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Total Published Papers"
          value={analytics.totalPapers}
          icon={<FileText className="text-blue-500" size={26} />}
          color="bg-blue-50"
        />
        <StatCard
          title="Active Journals"
          value={analytics.activeJournals}
          icon={<BookOpen className="text-green-500" size={26} />}
          color="bg-green-50"
        />
        <StatCard
          title="Upcoming Issues"
          value={analytics.upcomingIssues}
          icon={<CalendarDays className="text-orange-500" size={26} />}
          color="bg-orange-50"
        />
      </div>

      {/* ====== CHARTS SECTION ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* === Monthly Publications === */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Monthly Paper Publications
            </h3>
            <button className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition">
              View Report <ArrowUpRight size={16} className="ml-1" />
            </button>
          </div>

          {analytics.monthlyPapers?.length > 0 ? (
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyPapers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart />
          )}
        </div>

        {/* === Journal Wise Pie Chart === */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Journal-wise Publications
            </h3>
          </div>

          {analytics.journalWise?.length > 0 ? (
            <div className="h-[340px] w-full flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.journalWise}
                    dataKey="total"
                    nameKey="journal"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(1)}%)`
                    }
                  >
                    {analytics.journalWise.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} Papers`, "Count"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart />
          )}
        </div>

        {/* === Current Issues Table === */}
<div className="mt-10 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">
    Current Issue Summary
  </h3>

  {analytics.currentIssues?.length > 0 ? (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border border-gray-100 rounded-lg">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="py-3 px-4 text-left">Journal</th>
            <th className="py-3 px-4 text-left">Volume No</th>
            <th className="py-3 px-4 text-left">Issue No</th>
            <th className="py-3 px-4 text-left">Published Month</th>
          </tr>
        </thead>
        <tbody>
          {analytics.currentIssues.map((item, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-100 hover:bg-gray-50 transition"
            >
              <td className="py-3 px-4 font-medium text-gray-800">
                {item.journal}
              </td>
              <td className="py-3 px-4">{item.volume || "-"}</td>
              <td className="py-3 px-4">{item.issue || "-"}</td>
              <td className="py-3 px-4 text-gray-500">
                {item.publish_month || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="text-gray-500 text-center py-10 border border-dashed rounded-lg">
      No current issues found
    </div>
  )}
</div>
      </div>
    </div>
  );
}

/* ========== COMPONENTS ========== */
function StatCard({ title, value, icon, color }) {
  return (
    <div
      className={`flex items-center justify-between p-6 rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md transition`}
    >
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-semibold text-gray-800">
          {value ?? 0}
        </h3>
      </div>
      <div className={`p-3 rounded-full ${color}`}>{icon}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="text-gray-500 text-center py-20 border border-dashed rounded-lg">
      No data available
    </div>
  );
}
