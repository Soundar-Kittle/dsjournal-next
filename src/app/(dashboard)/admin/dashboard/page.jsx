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
    currentIssues: [],
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

      {/* ----- Header ----- */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Journal Dashboard
        </h2>
        <p className="text-gray-600 text-sm">
          Overview of articles, journals & issues
        </p>
      </div>

      {/* ----- Top Summary Cards ----- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Total Published Papers"
          value={analytics.totalPapers}
          icon={<FileText size={26} />}
          gradient="from-blue-500/10 to-blue-500/5"
          iconColor="text-blue-500"
        />

        <StatCard
          title="Active Journals"
          value={analytics.activeJournals}
          icon={<BookOpen size={26} />}
          gradient="from-green-500/10 to-green-500/5"
          iconColor="text-green-500"
        />

        <StatCard
          title="Upcoming Issues"
          value={analytics.upcomingIssues}
          icon={<CalendarDays size={26} />}
          gradient="from-orange-500/10 to-orange-500/5"
          iconColor="text-orange-500"
        />
      </div>

      {/* ----- Charts Section ----- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Monthly Bar Chart */}
        <DashboardCard title="Monthly Paper Publications" actionLabel="View Report">
          {analytics.monthlyPapers?.length > 0 ? (
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyPapers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart />
          )}
        </DashboardCard>

        {/* Pie Chart */}
        <DashboardCard title="Journal-wise Publications">
          {analytics.journalWise?.length > 0 ? (
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.journalWise}
                    dataKey="total"
                    nameKey="journal"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {analytics.journalWise.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart />
          )}
        </DashboardCard>
      </div>

      {/* ----- Current Issues Table ----- */}
      <DashboardCard title="Current Issue Summary" className="mt-10">

        {analytics.currentIssues?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-100 rounded-lg text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4 text-left">Journal</th>
                  <th className="py-3 px-4 text-left">Volume</th>
                  <th className="py-3 px-4 text-left">Issue</th>
                  <th className="py-3 px-4 text-left">Published Month</th>
                </tr>
              </thead>
              <tbody>
                {analytics.currentIssues.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 font-medium">{item.journal}</td>
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
          <EmptyChart message="No current issues found" />
        )}
      </DashboardCard>
    </div>
  );
}



/* ----------------------------------- */
/* Reusable Dashboard Components */
/* ----------------------------------- */

function StatCard({ title, value, icon, gradient, iconColor }) {
  return (
    <div className={`p-6 rounded-xl shadow-sm border border-gray-200 
      bg-gradient-to-br ${gradient} hover:shadow-md transition`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${iconColor} bg-white shadow`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, actionLabel, children, className }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

        {actionLabel && (
          <button className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition">
            {actionLabel} <ArrowUpRight size={16} className="ml-1" />
          </button>
        )}
      </div>

      {children}
    </div>
  );
}

function EmptyChart({ message = "No data available" }) {
  return (
    <div className="text-gray-500 py-16 text-center border border-dashed rounded-lg">
      {message}
    </div>
  );
}
