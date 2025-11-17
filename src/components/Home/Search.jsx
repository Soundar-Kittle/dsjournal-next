"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Globe,
  User,
  Book,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/Home/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [q, setQ] = useState("");
  const [selectedJournal, setSelectedJournal] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState([]);
  const [journals, setJournals] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [searchType, setSearchType] = useState(["article"]); // ✅ default checked: "article"

  useEffect(() => {
    const param = searchParams.get("q") || "";
    setQ(param);
  }, [searchParams]);

  const typeIcons = {
    article: <FileText size={16} className="text-primary" />,
    author: <User size={16} className="text-primary" />,
    journal: <Book size={16} className="text-primary" />,
    website: <Globe size={16} className="text-primary" />,
  };

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

    // ✅ Update URL query param in the browser
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (selectedJournal) params.set("journal", selectedJournal);

    router.push(`/search?${params.toString()}`); // ✅ refreshes URL but not full page

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
        <Breadcrumbs
          parents={[{ menu_label: "Search", menu_link: "/search" }]}
        />
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-10 py-10">
        {/* =================== 🔍 BASIC SEARCH =================== */}
        <form onSubmit={handleSearch} className="space-y-4 mb-6">
          {/* Main Search Input */}

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
                  Advanced Search
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
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                key="advanced-search"
                initial={{ opacity: 0, y: -20 }} // fly-in from top
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }} // fly-out to top
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
                className="border border-gray-200 bg-gray-50 rounded-lg p-5 shadow-sm space-y-6"
              >
                {/* ✅ Search Type Checkboxes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Type
                  </label>
                  <div className="flex flex-wrap gap-6">
                    {["article", "author", "journal", "website"].map((type) => (
                      <label
                        key={type}
                        className="inline-flex items-center gap-2 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          value={type}
                          checked={searchType.includes(type)}
                          onChange={(e) => {
                            const { checked, value } = e.target;
                            setSearchType((prev) =>
                              checked
                                ? [...prev, value]
                                : prev.filter((t) => t !== value)
                            );
                          }}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="flex items-center gap-1 capitalize">
                          {typeIcons[type]} {type}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    You can select multiple types (e.g. Article + Author)
                  </p>
                </div>

                {/* ✅ Journal Filter — only show when NOT searching website */}
                {(searchType.includes("article") ||
                  searchType.includes("author") ||
                  searchType.includes("journal")) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Journal
                    </label>
                    <div className="border border-gray-200 rounded-lg bg-white p-4 max-h-64 overflow-y-auto shadow-sm">
                      {journals.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          Loading journals…
                        </p>
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
                                {j.short_name || j.journal_name}
                              </label>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
                {results.map((item) => {
                  // 🧩 Determine icon, link, and label based on type
                  let icon, href, subtitle;

                  switch (item.type) {
                    case "article":
                      icon = (
                        <FileText
                          size={22}
                          className="text-primary shrink-0 mt-1"
                        />
                      );
                      href = `/article/${item.article_id ?? item.id}`;
                      subtitle = "Article";
                      break;

                    case "journal":
                      icon = (
                        <Book
                          size={22}
                          className="text-blue-600 shrink-0 mt-1"
                        />
                      );
                      href = `/journal/${item.short_name ?? item.id}`;
                      subtitle = "Journal";
                      break;

                    case "page":
                      icon = (
                        <Globe
                          size={22}
                          className="text-green-600 shrink-0 mt-1"
                        />
                      );
                      href = `${item.slug ?? item.title}`;
                      subtitle = "Website Page";
                      break;

                    case "static":
                      icon = (
                        <Globe
                          size={22}
                          className="text-orange-600 shrink-0 mt-1"
                        />
                      );
                      href = `/${
                        item.slug ??
                        item.title.toLowerCase().replace(/\s+/g, "-")
                      }`;
                      subtitle = "Static Page";
                      break;

                    default:
                      icon = (
                        <FileText
                          size={22}
                          className="text-gray-500 shrink-0 mt-1"
                        />
                      );
                      href = "#";
                      subtitle = "Other";
                  }

                  return (
                    <Link
                      key={`${item.type}-${item.id ?? item.slug ?? item.title}`}
                      href={href}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition bg-white group"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        {icon}
                        <h3 className="font-medium text-gray-800 group-hover:text-primary line-clamp-2">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500">{subtitle}</p>
                    </Link>
                  );
                })}
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
};

export default SearchPage;
