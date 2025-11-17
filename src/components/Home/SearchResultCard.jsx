"use client";

import Link from "next/link";
import { FileText, Book, Globe, User } from "lucide-react";

export default function SearchResultCard({ item }) {
  const iconMap = {
    article: <FileText size={16} className="text-gray-500" />,
    journal: <Book size={16} className="text-gray-500" />,
    author: <User size={16} className="text-gray-500" />,
    page: <Globe size={16} className="text-gray-500" />,
    static: <Globe size={16} className="text-gray-500" />,
    meta_page: <Globe size={16} className="text-gray-500" />,
  };

  const icon = iconMap[item.type] || iconMap["page"];
  const href = item.slug || "#";

  // ===================================================
  //  ⭐ AUTHOR CARD RENDER
  // ===================================================
  if (item.type === "author") {
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow transition">
        {/* HEADER */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
          <User size={16} className="text-gray-500" />
          <span>Author</span>
        </div>

        {/* AUTHOR NAME */}
        <h2 className="text-lg font-semibold text-blue-700 leading-snug mb-3">
          {item.name}
        </h2>

        {/* LIST OF ARTICLES UNDER AUTHOR */}
        {item.articles?.map((a) => (
          <Link
            key={a.article_id}
            href={a.slug}
            className="block mb-1 text-sm text-gray-700 hover:underline"
          >
            • {a.title}
          </Link>
        ))}
      </div>
    );
  }

  // ===================================================
  //  ⭐ ARTICLE, JOURNAL, PAGE — DEFAULT CARD RENDER
  // ===================================================

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow transition cursor-pointer">
      {/* TOP ROW */}
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
        {icon}
        <span className="capitalize">{item.type}</span>

        {item.article_id && (
          <>
            <span>•</span>
            <span className="font-medium">{item.article_id}</span>
          </>
        )}
      </div>

      {/* TITLE */}
      <Link href={href} className="hover:underline">
        <h2 className="text-lg font-semibold text-blue-700 leading-snug mb-1">
          {item.title}
        </h2>
      </Link>

      {/* ARTICLE EXTRA FIELDS */}
      {item.type === "article" && (
        <>
          {/* Abstract Snippet */}
          {item.abstract_snippet && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {item.abstract_snippet}…
            </p>
          )}

          {/* Authors */}
          {item.authors && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {item.authors}
            </p>
          )}
        </>
      )}
    </div>
  );
}
