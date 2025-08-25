"use client";
import Link from "next/link";

export default function DashboardHome() {
  const items = [
    {
      title: "Volume & Issue",
      href: "/dashboard/volume-issue",
      description: "Manage volume and issue entries per journal.",
    },
    {
      title: "Month of Issue",
      href: "/dashboard/month-issue",
      description: "Configure publishing frequency like Monthly, Quarterly, etc.",
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Journal Settings</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="block border border-gray-200 rounded-xl p-6 bg-white hover:shadow-md transition duration-200"
          >
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
