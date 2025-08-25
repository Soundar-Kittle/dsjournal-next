"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideMenu({
  title = "Menu",
  items = [],               // [{ menu_label, menu_link }]
  initiallyOpen = true,
  className = "",
  storageKey,               // optional: remember open/closed across pages
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(initiallyOpen);

  // restore saved state
  useEffect(() => {
    if (!storageKey) return;
    try {
      const v = localStorage.getItem(storageKey);
      if (v !== null) setOpen(v === "1");
    } catch {}
  }, [storageKey]);

  // persist state
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, open ? "1" : "0");
    } catch {}
  }, [open, storageKey]);

  const isActive = (href) => {
    if (!pathname || !href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className={className}>
      {/* header: click to shrink/expand */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between bg-teal-900 text-white px-4 py-2 rounded-t-md"
      >
        <span className="font-medium">{title}</span>
        <span className={`transition-transform ${open ? "rotate-0" : "-rotate-90"}`}>▾</span>
      </button>

      {/* body with smooth collapse (grid-rows trick) */}
      <div
        className={`border border-t-0 rounded-b-md p-2 grid transition-[grid-template-rows] duration-300 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="space-y-1">
            {items.map((it) => (
              <li key={it.menu_link}>
                <Link
                  href={it.menu_link || "#"}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-gray-100 transition ${
                    isActive(it.menu_link)
                      ? "text-teal-700 font-semibold"
                      : "text-slate-700"
                  }`}
                >
                  <span className="text-[11px] leading-none select-none">▸</span>
                  <span className="truncate">{it.menu_label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
