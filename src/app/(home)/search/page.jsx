"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, FileText, X } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/Home/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [selectedJournal, setSelectedJournal] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState([]);
  const [journals, setJournals] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("article"); // default to article

  // ✅ Fetch all journals
  useEffect(() => {
    async function fetchJournals() {
      try {
        const res = await fetch("/api/journals?all=true");
        const data = await res.json();

        setJournals(data.journals || []);
      } catch (err) {
        console.error("Failed to load journals:", err);
      }
    }
    fetchJournals();
  }, []);

  // ✅ Load recent articles
  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await fetch("/api/recent-articles");
        const data = await res.json();
        setRecent(data.results || []);
      } catch (err) {
        console.error("Failed to fetch recent articles:", err);
      }
    }
    fetchRecent();
  }, []);

  // ✅ Handle Search
  async function handleSearch(e) {
    e.preventDefault();
    if (!q.trim() && !selectedJournal) return;

    setLoading(true);
    try {
      const url = new URL(`/api/search`, window.location.origin);
      if (q) url.searchParams.append("q", q);
      if (selectedJournal) url.searchParams.append("journal", selectedJournal);

      const res = await fetch(url);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <header>
        <PageHeader title="Search" />
        <Breadcrumbs />
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-10 py-10">
        {/* =================== 🔍 BASIC SEARCH =================== */}
        <form onSubmit={handleSearch} className="space-y-4 mb-6">
          {/* Main Search Input */}
          
          {/* =================== 🔘 SEARCH TYPE FILTER =================== */}
<div className="flex flex-wrap items-center justify-start gap-6 mt-4 text-sm sm:text-base">
  {["website", "article", "author", "journal"].map((type) => (
    <label
      key={type}
      className="inline-flex items-center gap-2 cursor-pointer select-none"
    >
      <input
        type="radio"
        name="searchType"
        value={type}
        checked={searchType === type}
        onChange={(e) => setSearchType(e.target.value)}
        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
      />
      <span className="capitalize">{type}</span>
    </label>
  ))}
</div>
          <div className="flex items-center w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm">
            <input
              type="text"
              placeholder="Search by article title, author, or DOI…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 flex items-center gap-2 hover:bg-primary/90 transition whitespace-nowrap"
            >
              <Search size={18} />
              Search
            </button>
          </div>


          {/* Advanced Search Toggle */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition"
            >
              {showAdvanced ? (
                <>
                  <X size={16} />
                  Close Advanced Search
                </>
              ) : (
                <>
                  <SlidersHorizontal size={16} />
                  Advanced Search
                </>
              )}
            </button>
          </div>

          {/* Advanced Search Section */}
          {showAdvanced && (
            <div className="border border-gray-200 bg-gray-50 rounded-lg p-5 shadow-sm space-y-4 animate-fade-in">
              {/* Journal Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Journal
                </label>
                <div className="border border-gray-200 rounded-lg bg-white p-4 max-h-64 overflow-y-auto shadow-sm">
                  {journals.length === 0 ? (
                    <p className="text-gray-500 text-sm">Loading journals…</p>
                  ) : (
                    <ul className="space-y-2">
                      {journals.map((j) => (
                        <li key={j.id} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`journal-${j.id}`}
                            value={j.id}
                            checked={selectedJournal.includes(String(j.id))}
                            onChange={(e) => {
                              const { checked, value } = e.target;
                              setSelectedJournal((prev) =>
                                checked
                                  ? [...prev, value]
                                  : prev.filter((v) => v !== value)
                              );
                            }}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <label
                            htmlFor={`journal-${j.id}`}
                            className="text-sm text-gray-700 cursor-pointer select-none"
                          >
                            {j.short_name
                              ? `${j.journal_name}`
                              : j.journal_name}
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* =================== 🔁 RESULTS =================== */}
        {loading && (
          <p className="text-center text-gray-500 animate-pulse">Searching…</p>
        )}

        {!loading && q && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">
              Search Results for “{q}”
            </h2>

            {results.length === 0 ? (
              <p className="text-gray-500">No results found.</p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {results.map((item) => (
                  <Link
                    key={item.article_id}
                    href={`/article/${item.article_id}`}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition bg-white group"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <FileText
                        size={22}
                        className="text-primary shrink-0 mt-1"
                      />
                      <h3 className="font-medium text-gray-800 group-hover:text-primary line-clamp-2">
                        {item.article_title}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {item.journal_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Vol {item.volume_number} | Issue {item.issue_number} |{" "}
                      {item.year}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================== 📰 RECENT ARTICLES =================== */}
        {!q && !loading && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold mb-5 text-gray-800">
              Recent Articles
            </h2>
            {recent.length === 0 ? (
              <p className="text-gray-500">No recent articles available.</p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {recent.map((article) => (
                  <Link
                    key={article.article_id}
                    href={`/article/${article.article_id}`}
                    className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition group"
                  >
                    <h3 className="font-medium text-gray-800 mb-1 group-hover:text-primary line-clamp-2">
                      {article.article_title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {article.journal_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Vol {article.volume_number} | Issue {article.issue_number}{" "}
                      | {article.year}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
