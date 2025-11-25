// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { FaCaretRight } from "react-icons/fa6";
// import { CircleArrowUp } from "lucide-react";

// export default function SideMenu({
//   title = "Menu",
//   items = [],
//   className = "",
// }) {
//   const pathname = usePathname();
//   const [open, setOpen] = useState(false);

//   // set default open depending on screen size
//   useEffect(() => {
//     const mql = window.matchMedia("(min-width: 1024px)"); // lg breakpoint
//     setOpen(mql.matches);

//     const handler = (e) => setOpen(e.matches); // auto adjust on resize
//     mql.addEventListener("change", handler);

//     return () => mql.removeEventListener("change", handler);
//   }, []);

//   const isActive = (href) => {
//     if (!pathname || !href) return false;
//     return pathname === href;
//   };

//   return (
//     <aside className={`bg-white border border-gray-200 ${className}`}>
//       {/* header */}
//       <button
//         type="button"
//         onClick={() => setOpen((v) => !v)}
//         aria-expanded={open}
//         className={`w-full flex items-center justify-between bg-secondary p-3 text-white text-md font-medium`}
//       >
//         <span className="font-medium">{title}</span>
//         <div className="flex items-center gap-1">
//           <span className="cursor-pointer">
//             <CircleArrowUp
//               size={24}
//               className={`${!open ? "rotate-180" : ""} duration-300`}
//             />
//           </span>
//         </div>
//       </button>

//       {/* body */}
//       <div
//         className={`border-1 border-[#ccc] ${
//           open ? "p-2" : ""
//         } bg-[#eee] grid transition-[grid-template-rows] duration-300 ease-in-out ${
//           open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
//         }`}
//       >
//         <div className="overflow-hidden">
//           <ul className="bg-white">
//             {items.map((it, i) => {
//               const active = isActive(it.menu_link);
//               return (
//                 <li
//                   key={i}
//                   className="hover:bg-gray-100 border-1 border-[#ccc] group border-b-0 last:border-b-1"
//                 >
//                   <Link
//                     download={it?.name}
//                     href={it.menu_link || "#"}
//                     scroll={false}
//                     onClick={(e) => {
//                       if (it.menu_link?.includes("#")) {
//                         e.preventDefault();
//                         const id = it.menu_link.split("#")[1];
//                         const el = document.getElementById(id);
//                         if (el) {
//                           el.scrollIntoView({ behavior: "smooth" });
//                           window.history.pushState(null, "", it.menu_link);
//                         }
//                       } else {
//                         window.scrollTo({ top: 0, behavior: "smooth" });
//                       }
//                     }}
//                     className={`flex w-full px-3 py-2.5 text-md transition
//                       ${
//                         active
//                           ? "bg-[#0d6efd] text-white font-semibold"
//                           : " group-hover:text-[#444]"
//                       }
//                     `}
//                   >
//                     <span>
//                       <FaCaretRight
//                         size={18}
//                         className={`mr-1 inline-flex ${
//                           active ? "text-white" : "group-hover:text-[#555]"
//                         }`}
//                       />
//                       {it.menu_label}
//                     </span>
//                   </Link>
//                 </li>
//               );
//             })}
//           </ul>
//         </div>
//       </div>
//     </aside>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideMenu({ title, items, initiallyOpen = true, storageKey }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(initiallyOpen);

  // Restore state from localStorage
  useEffect(() => {
    if (!storageKey) return;
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) setOpen(saved === "true");
  }, [storageKey]);

  // Save state changes
  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, open);
  }, [open, storageKey]);


  // 📌 AUTO COLLAPSE ON MOBILE
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setOpen(false);                    // collapse on mobile
      } else {
        // Desktop restores saved state
        if (storageKey) {
          const saved = localStorage.getItem(storageKey);
          if (saved !== null) {
            setOpen(saved === "true");
          } else {
            setOpen(true);                 // default open on desktop
          }
        } else {
          setOpen(true);
        }
      }
    };

    handleResize();                         // run at load
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [storageKey]);

  return (
    <div className="border rounded-md shadow-sm bg-white overflow-hidden">

      {/* HEADER */}
      <div className="bg-[#143C46] text-white py-4 px-5 font-semibold tracking-wide text-left">
        {title}
      </div>


      {/* CURTAIN MENU */}
      <div
        className={`transition-all duration-300 overflow-hidden ${open ? "max-h-[1500px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <ul className="flex flex-col py-2">
          {items.map((item, index) => {
            const active = pathname === item.menu_link;
            return (
              <li key={index}>
                <Link
                  href={item.menu_link}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm transition-colors ${active
                      ? "bg-[#E7F5F8] text-[#0F2C36] font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <ChevronRight size={14} className={`${active ? "text-[#0F2C36]" : "text-gray-500"}`} />
                  {item.menu_label}
                </Link>

                {/* Horizontal separator */}
                {index !== items.length - 1 && (
                  <div className="border-b border-gray-200 ml-5 mr-5"></div>
                )}
              </li>

            );
          })}
        </ul>
      </div>

      {/* BOTTOM ARROW (Always at bottom!) */}
      <div className="flex justify-center py-3 bg-white">
        <ChevronDown
          size={24}
          onClick={() => setOpen(!open)}
          className={`cursor-pointer transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"
            }`}
        />
      </div>
    </div>
  );
}
