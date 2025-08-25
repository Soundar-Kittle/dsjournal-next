"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import JournalCard from "@/components/Home/Journals/JournalCard";

// normalize cover paths like "uploads/..." → "/uploads/..."
function toCoverUrl(v) {
  if (!v) return null;
  let u = String(v).trim();
  if (u === "null") return null;
  if (!u.startsWith("http://") && !u.startsWith("https://") && !u.startsWith("/")) u = "/" + u;
  if (u.startsWith("http://")) u = u.replace(/^http:\/\//, "https://");
  return u;
}

export default function JournalsPage() {
  // ✅ prevent SSR/CSR mismatch by rendering only after mount
 const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // or a tiny skeleton

  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/journals", { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data?.records)
        ? data.records
        : Array.isArray(data?.journals)
        ? data.journals
        : [];
      const norm = list.map((r) => ({
        id: Number(r.id),
        name: String(r.name ?? r.journal_name ?? r.title ?? ""),
        slug: String(r.slug ?? r.alias ?? r.id),
        cover_url: toCoverUrl(r.cover_url ?? r.cover ?? r.cover_image ?? null),
        issn_print: r.issn_print && r.issn_print !== "null" ? r.issn_print : "",
        issn_online: r.issn_online && r.issn_online !== "null" ? r.issn_online : "",
      }));
      setJournals(norm);
    } catch (e) {
      console.error("Failed to fetch journals", e);
      setJournals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return journals;
    return journals.filter(
      (j) =>
        (j.name || "").toLowerCase().includes(q) ||
        (j.issn_online || "").toLowerCase().includes(q) ||
        (j.issn_print || "").toLowerCase().includes(q)
    );
  }, [journals, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <nav className="text-sm text-slate-500">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-slate-700">Home</Link></li>
            <li className="select-none">/</li>
            <li className="font-medium text-slate-700">Journals</li>
          </ol>
        </nav>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Journals</h1>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by journal name or ISSN…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 rounded border border-slate-300 px-3 py-2"
        />
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="aspect-[3/4] w-full rounded-t-2xl bg-slate-100" />
              <div className="p-4"><div className="h-4 w-3/4 rounded bg-slate-100" /></div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="text-slate-600">No journals found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((j) => (
            <JournalCard key={j.id} j={j} />
          ))}
        </div>
      )}
    </div>
  );
}
