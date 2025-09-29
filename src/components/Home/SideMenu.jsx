"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCaretRight } from "react-icons/fa6";
import { CircleArrowDown, CircleArrowUp } from "lucide-react";

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
        className={`w-full flex items-center justify-between bg-secondary p-3 text-white text-md font-medium`}
      >
        <span className="font-medium">{title}</span>
        <div className="flex items-center gap-1">
          <span className="cursor-pointer">
            {/* {open ? <CircleArrowDown  size={24} /> : <CircleArrowUp  size={24} />} */}
            <CircleArrowUp
              size={24}
              className={`${!open ? "rotate-180" : ""} duration-300`}
            />
          </span>
        </div>
      </button>

      {/* body */}
      <div
        className={`border-1 border-[#ccc]  ${
          open ? "p-2" : ""
        } bg-[#eee]  grid transition-[grid-template-rows] duration-300 ease-in-out ${
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
                    scroll={false}
                    // onClick={(e) => {
                    //   if (it.menu_link?.includes("#")) {
                    //     e.preventDefault();
                    //     const id = it.menu_link.split("#")[1];
                    //     const el = document.getElementById(id);
                    //     if (el) {
                    //       el.scrollIntoView({ behavior: "smooth" });
                    //       window.history.pushState(null, "", it.menu_link);
                    //     }
                    //   }
                    // }}
                    onClick={(e) => {
                      if (it.menu_link?.includes("#")) {
                        e.preventDefault();
                        const id = it.menu_link.split("#")[1];
                        const el = document.getElementById(id);
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth" });
                          window.history.pushState(null, "", it.menu_link);
                        }
                      } else {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
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
