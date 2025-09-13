"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Search as SearchIcon } from "lucide-react";


const NAV = [
  { label: "Home", href: "/" },
  { label: "Journals", href: "/journals" },
  { label: "Authors", href: "/for-authors" },
  { label: "Reviewers", href: "/reviewers" },
  { label: "Editors", href: "/editors" }, // <- no hash
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // client-side submit (no hashes involved)
  function onSearchSubmit(e) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setMobileSearchOpen(false);
    setMobileOpen(false);
  }

  const linkCls = (href) =>
    `hover:text-emerald-700 transition ${
      pathname === href || pathname?.startsWith(href + "/")
        ? "text-emerald-700 font-semibold"
        : "text-slate-700"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-emerald-600/10 ring-1 ring-emerald-600/30 grid place-content-center">
              <span className="text-emerald-700 font-black">DS</span>
            </div>
            <span className="font-semibold tracking-tight">Dream Science</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={linkCls(item.href)}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop search */}
          <div className="hidden md:flex items-center">
            <form onSubmit={onSearchSubmit} className="relative w-[320px]">
              <input
                name="q"
                type="search"
                placeholder="Search your article"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 pr-24 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-600 px-3 py-1.5 text-white text-sm"
              >
                search
              </button>
            </form>
          </div>

          {/* Mobile toggles */}
          <div className="md:hidden flex items-center gap-2">
            <button
              aria-label="Search"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="p-2"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
            <button
              aria-label="Menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <form onSubmit={onSearchSubmit} className="relative">
              <input
                name="q"
                type="search"
                placeholder="Search your article"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 pr-24 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-600 px-3 py-1.5 text-white text-sm"
              >
                search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <nav className="flex flex-col gap-2 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={`rounded px-3 py-2 ${linkCls(item.href)} hover:bg-slate-50`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
