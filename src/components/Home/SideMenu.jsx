"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BsMenuDown, BsMenuUp } from "react-icons/bs";
import { FaCaretRight } from "react-icons/fa6";

export default function SideMenu({
  title = "Menu",
  items = [], // [{ menu_label, menu_link }]
  initiallyOpen = true,
  className = "",
  storageKey,
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
    <aside className={`bg-white border border-gray-200 ${className}`}>
      {/* header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between bg-secondary text-white p-3 text-md font-medium"
      >
        <span className="font-medium">{title}</span>
        <div className="flex items-center gap-1">
          <span className="cursor-pointer">
            {open ? <BsMenuDown size={18} /> : <BsMenuUp size={18} />}
          </span>
        </div>
      </button>

      {/* body */}
      <div
        className={`border-1 border-[#ccc] p-2 bg-[#eee]  grid transition-[grid-template-rows] duration-300 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="bg-white">
            {items.map((it, index) => {
              const active = isActive(it.menu_link);
              return (
                <li
                  key={it.menu_link}
                  className=" hover:bg-gray-100 border-1 border-[#ccc] group border-b-0 last:border-b-1"
                >
                  <Link
                    href={it.menu_link || "#"}
                    scroll={true}
                    className={`flex w-full px-3 py-2.5 text-md transition
                      ${
                        active
                          ? "bg-[#0d6efd] text-white font-semibold"
                          : " group-hover:text-[#444]"
                      }
                    `}
                  >
                    <span>
                      <FaCaretRight
                        size={18}
                        className={`mr-1 inline-flex  ${
                          active ? "text-white" : "group-hover:text-[#555]"
                        }`}
                      />

                      {it.menu_label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
