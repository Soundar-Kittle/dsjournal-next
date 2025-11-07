"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { LogOut, Search, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { MenuSection } from "./MenuSection";
import { SidebarHeader } from "./SidebarHeader";
import { useGlobalHotkeys, normaliseHotkey, kbdGlyph } from "./hotkeys";

import { queryClient } from "@/lib/queryClient";
import { Button } from "../ui/button";
import { toast } from "sonner";

const HIDE_BUTTON = {
  sm: "sm:hidden",
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
};

const SHOW_PILL = {
  sm: "hidden sm:block",
  md: "hidden md:block",
  lg: "hidden lg:block",
  xl: "hidden xl:block",
};

const DESKTOP_SIDEBAR = {
  sm: "sm:relative sm:translate-x-0",
  md: "md:relative md:translate-x-0",
  lg: "lg:relative lg:translate-x-0",
  xl: "xl:relative xl:translate-x-0",
};

const ITEM_PAD = {
  base: "px-4 py-3 gap-3 text-sm",
  compact: "px-3 py-2 gap-2 text-[13px]",
  cozy: "px-5 py-4 gap-4 text-base",
};

const SEARCH_H = {
  base: "py-2",
  compact: "py-1.5",
  cozy: "py-3",
};

const PROFILE_H = {
  base: "py-4",
  compact: "py-3",
  cozy: "py-5",
};

const PILL_W = {
  base: "h-8 w-8",
  compact: "h-7 w-7",
  cozy: "h-9 w-9",
};

export const Sidebar = ({
  children,
  menuItems = [],
  drawerBreakpoint = "md",
  showCollapse = true,
  showBadge = true,
  showHotkeys = true,
  showSearch = true,
  density = "base",
  user = null,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [flyoutStyle, setFlyoutStyle] = useState({});

  const searchRef = useRef(null);
  const menuRefs = useRef([]);
  const flyoutRef = useRef(null);

  const hideBtn = HIDE_BUTTON[drawerBreakpoint];
  const showPill = SHOW_PILL[drawerBreakpoint];
  const desktopCt = DESKTOP_SIDEBAR[drawerBreakpoint];
  const toggleMobile = () => setMobileOpen((o) => !o);
  const toggleSidebar = () => {
    setCollapsed((p) => !p);
    setOpenDropdown(null);
  };

  const effectiveCollapsed = mobileOpen ? false : collapsed;
  const widthClass = effectiveCollapsed ? "w-17" : "w-64";

  const itemPad = ITEM_PAD[density];
  const searchPad = SEARCH_H[density];
  const pillSize = PILL_W[density];

  // Hotkeys
  const hotkeyMap = useMemo(() => {
    const map = new Map();

    if (showHotkeys) {
      menuItems.forEach((item) => {
        if (item.hotkey && item.path !== "#")
          map.set(normaliseHotkey(item.hotkey), () => router.push(item.path));
        item.subItems?.forEach((sub) => {
          if (sub.hotkey)
            map.set(normaliseHotkey(sub.hotkey), () => router.push(sub.path));
        });
      });
    }

    if (showSearch)
      map.set("ctrl+/", () => {
        searchRef.current?.focus();
        searchRef.current?.select();
      });

    return map;
  }, [menuItems, router, showHotkeys, showSearch]);

  useGlobalHotkeys(hotkeyMap);

  const searchTerm = search.trim().toLowerCase();

  const { sections, filteredFlat } = useMemo(() => {
   const match = (v) => {
  if (!v || typeof v !== "string") return false;
  return v.toLowerCase().includes(searchTerm);
};
    const grouped = [];

    const ensure = (title) => {
      let g = grouped.find((s) => s.title === title);
      if (!g) {
        g = { title, items: [] };
        grouped.push(g);
      }
      return g;
    };

menuItems.forEach((item) => {
  const secTitle = item?.section ?? "General";
  const section = ensure(secTitle);

  const title = item?.title || "";
  const path = item?.path || "";
  
  if (!searchTerm || match(secTitle)) {
    section.items.push(item);
    return;
  }

  if (item?.subItems?.length) {
    const parentHit = match(title) || match(path);
    if (parentHit) {
      section.items.push(item);
      return;
    }

    const subs = item.subItems.filter(
      (s) => match(s.title) || match(s.path)
    );
    if (subs.length) section.items.push({ ...item, subItems: subs });
    return;
  }

  if (match(title) || match(path)) section.items.push(item);
});

    const nonEmpty = grouped.filter((s) => s.items.length);
    return {
      sections: nonEmpty,
      filteredFlat: nonEmpty.flatMap((s) => s.items),
    };
  }, [menuItems, searchTerm]);

  useEffect(() => {
    menuRefs.current = menuRefs.current.slice(0, filteredFlat.length);
    const h = (e) => {
      if (
        flyoutRef.current &&
        !flyoutRef.current.contains(e.target) &&
        menuRefs.current.every((r) => r && !r.contains(e.target))
      )
        setOpenDropdown(null);
    };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, [filteredFlat.length]);

  const toggleDropdown = (idx) => {
    if (effectiveCollapsed) {
      const el = menuRefs.current[idx];
      if (el) {
        const { top, width } = el.getBoundingClientRect();
        setFlyoutStyle({ top, left: width + 4 });
      }
    }
    setOpenDropdown((p) => (p === idx ? null : idx));
  };

  const keyToggleDropdown = (idx) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDropdown(idx);
    }
  };

  const keyNavigate = (path) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(path);
    }
  };
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const role = user?.role;

      localStorage.removeItem("user");
      queryClient.removeQueries();

      // Toast
      toast.success("You have been logged out");

      // Redirect to correct login page
      if (role === "admin") {
        router.replace("/admin/login");
      } else if (role === "author") {
        router.replace("/author/login");
      } else {
        router.replace("/"); // fallback
      }
    } catch (err) {
      toast.error("Logout failed");
      console.error("❌ Logout error:", err);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {mobileOpen && (
        <div
          onClick={toggleMobile}
          className={`fixed inset-0 bg-black/40 z-40 ${hideBtn}`}
        />
      )}

      <aside
        role="navigation"
        aria-label="Primary"
        className={`
          flex flex-col bg-gray-50
          transition-all duration-300
          ${widthClass}
          ${desktopCt}
          fixed inset-y-0 left-0 z-50
          transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarHeader collapsed={effectiveCollapsed} />
        <div className=" h-full">
          {/* Search */}
          {showSearch && !collapsed && (
            <div className="px-4 pt-4 pb-2">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute inset-y-0 left-0 ml-3 my-auto pointer-events-none text-primary"
                  aria-hidden
                />
                <input
                  ref={searchRef}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search… (${kbdGlyph}+/)`}
                  aria-label="Search menu"
                  className={`
                    border-primary border text-primary bg-white
                    rounded-md ${searchPad} pl-10 w-full pr-4
                    outline-none focus:ring-primary
                    focus:border-primary transition-all
                  `}
                />
              </div>
            </div>
          )}

    <nav className="flex-grow overflow-y-auto pt-2 px-2">
  {sections.length > 0 ? (
    sections.map((section, idx) => {
      const start = sections
        .slice(0, idx)
        .reduce((s, sec) => s + sec.items.length, 0);
      return (
        <MenuSection
          key={section.title}
          title={section.title}
          items={section.items}
          collapsed={effectiveCollapsed}
          openIdx={openDropdown}
          pathname={pathname}
          searchTerm={searchTerm}
          toggleDropdown={toggleDropdown}
          keyToggleDropdown={keyToggleDropdown}
          keyNavigate={keyNavigate}
          setRef={(el, i) => (menuRefs.current[i] = el)}
          startIndex={start}
          showBadge={showBadge}
          showHotkeys={showHotkeys}
          itemPad={itemPad}
        />
      );
    })
  ) : (
    <div className="text-center text-gray-500 py-6 text-sm italic">
      Unknown items
    </div>
  )}
</nav>

          {effectiveCollapsed && openDropdown !== null && (
            <div
              ref={flyoutRef}
              style={flyoutStyle}
              className="fixed z-50 shadow-lg"
            >
              {filteredFlat[openDropdown].subItems ? (
                <div className="bg-[var(--color-card)] rounded-md border border-[var(--color-border)] w-48 shadow-lg">
                  <div className="py-2 px-4 border-b border-[var(--color-border)] font-medium">
                    {filteredFlat[openDropdown].title}
                  </div>
                  <ul
                    className="py-2"
                    aria-label={`Submenu of ${filteredFlat[openDropdown].title}`}
                  >
                    {filteredFlat[openDropdown].subItems.map((sub) => (
                      <li key={sub.path}>
                        <Link
                          href={sub.path}
                          className="block px-4 py-2 hover:bg-[var(--color-muted)] transition-colors"
                          onKeyDown={keyNavigate(sub.path)}
                        >
                          {sub.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-[var(--color-card)] px-4 py-2 rounded-md border border-[var(--color-border)] shadow-lg whitespace-nowrap">
                  {filteredFlat[openDropdown].title}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-x-auto relative">
        <header className="flex justify-between items-center bg-gray-50 h-[72px]  p-4 sticky top-0 z-40">
          <button
            onClick={toggleMobile}
            className="md:hidden p-2 rounded-md bg-white shadow border border-border cursor-pointer"
            aria-label="Open menu"
          >
            <svg
              className="w-5 h-5 text-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h1 className="text-lg font-bold text-gray-800"></h1>

          <div className="flex items-center gap-5">
            <Link href={user?.role ? `/${user?.role}/dashboard/settings` : "/dashboard/settings"}>
              <Settings className="w-5 h-5 text-primary hover:rotate-90 duration-500" />
            </Link>
            <Button onClick={handleLogout}>
              <LogOut size={14} />
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 shadow-[inset_0_0_3px_2px_var(--color-border)] md:rounded-tl-xl">
          {children}
        </main>
      </div>
    </div>
  );
};
