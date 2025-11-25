"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Search as SearchIcon } from "lucide-react";
import Image from "next/image";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Journals", href: "/journals" },
  { label: "Authors", href: "/for-authors" },
  { label: "Reviewers", href: "/for-reviewers" },
  { label: "Editors", href: "/for-editors" },
];

export default function Header({ settings }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  function onSearchSubmit(e) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setDesktopSearchOpen(false);
    setMobileSearchOpen(false);
    setMobileOpen(false);
  }

  const linkCls = (href) => {
    const isActive = pathname === href || pathname?.startsWith(href + "/");
    return `
      relative transition duration-300 text-base
      ${
        isActive
          ? "text-primary font-semibold"
          : "text-slate-700 hover:text-primary"
      }
      after:absolute after:left-0 after:bottom-[-4px] after:h-[3px] after:w-full after:rounded 
      ${
        isActive
          ? "after:bg-primary"
          : "after:bg-primary after:scale-x-0 hover:after:scale-x-100"
      }
      after:origin-center after:transition-transform after:duration-300
    `;
  };

  return (
    <header
      className="sticky top-0 z-100 bg-[#f4f8fa] xxl:bg-white py-5 px-3"
      onMouseLeave={() => setDesktopSearchOpen(false)}
    >
      <div>
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              // src="/logo.png"
              src={`/${settings?.logo}` || "/logo.png"}
              alt="Dream Science"
              width={140}
              height={40}
              priority
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              className="w-40 h-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5 text-sm">
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

            {/* Desktop search */}
            <div className="hidden md:flex items-center relative">
              <button
                aria-label="Search"
                className="p-2 hover:text-primary"
                onMouseEnter={() => setDesktopSearchOpen(true)}
              >
                <SearchIcon className="h-5 w-5" />
              </button>

              {desktopSearchOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-[320px] bg-secondary text-white rounded-md shadow-lg p-3
                  before:content-[''] before:absolute before:-top-2 before:right-4 before:w-4 before:h-4 before:bg-secondary before:rotate-45 before:shadow-md"
                >
                  <form onSubmit={onSearchSubmit} className="relative">
                    <input
                      name="q"
                      type="search"
                      placeholder="Search Your Article"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 pr-24 text-sm text-white outline-none"
                    />
                    <button
                      type="submit"
                      className="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2 rounded bg-primary px-3 py-1.5 text-white text-sm"
                    >
                      search
                    </button>
                  </form>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile toggles (unchanged) */}
          <div className="md:hidden flex items-center gap-2 relative">
            <button
              aria-label="Search"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="p-2 cursor-pointer"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
            <button
              aria-label="Menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="cursor-pointer p-2"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            {mobileSearchOpen && (
              <div className="absolute right-0 top-full mt-2 w-[300px] bg-secondary text-white rounded-md shadow-lg p-3 z-100">
                <form onSubmit={onSearchSubmit} className="relative">
                  <input
                    name="q"
                    type="search"
                    placeholder="Search Your Article"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 pr-24 text-sm outline-none"
                  />
                  <button
                    type="submit"
                    className="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2 rounded bg-primary px-3 py-1.5 text-white text-sm"
                  >
                    search
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu panel (unchanged) */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white absolute left-0 top-full w-full shadow-md">
          <div className="max-w-7xl px-4 py-3">
            <nav className="flex flex-col  w-full gap-2 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={`rounded px-3 py-2 hover:text-primary relative transition duration-300 text-base`}
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
