// "use client";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useMemo } from "react";

// export default function Breadcrumbs({ menuItems = [], parents = [] }) {
//   const pathname = usePathname();

//   const crumbs = useMemo(() => {
//     if (!pathname) return [];

//     const segments = pathname.split("/").filter(Boolean);
//     const baseSegment = segments[0];

//     const formatLabel = (segment) => {
//       if (/^for-(authors|journals|editors|reviewers)$/i.test(segment)) {
//         return segment.replace(/^for-/, "").replace(/-/g, " ").trim();
//       }
//       return segment.replace(/-/g, " ").trim();
//     };

//     const base = baseSegment
//       ? { menu_label: formatLabel(baseSegment), menu_link: `/${baseSegment}` }
//       : null;

//     const currentItem = menuItems.find((item) => item.menu_link === pathname);

//     // Build final crumbs in order
//     const list = [
//       { menu_label: "Home", menu_link: "/" },
//       ...parents,
//       ...(base ? [base] : []),
//       ...(currentItem && (!base || currentItem.menu_link !== base.menu_link)
//         ? [currentItem]
//         : []),
//     ];

//     return list;
//   }, [pathname, menuItems, parents]);

//   return (
//     <nav className="py-3 border-b border-gray-200">
//       <ol
//         className="flex flex-wrap items-center space-x-1 
//         container mx-auto px-4 sm:px-6 lg:px-16 xxl:px-12
//         text-xs md:text-sm lg:text-base"
//       >
//         {crumbs.map((crumb, idx) => {
//           const isLast = idx === crumbs.length - 1;
//           return (
//             <li key={crumb.menu_link} className="flex items-center">
//               {idx > 0 && <span className="px-1">/</span>}
//               {isLast ? (
//                 // Last breadcrumb → plain text
//                 <span className="capitalize">{crumb.menu_label}</span>
//               ) : (
//                 <Link
//                   href={crumb.menu_link}
//                   className="text-blue hover:text-light-blue capitalize"
//                 >
//                   {crumb.menu_label}
//                 </Link>
//               )}
//             </li>
//           );
//         })}
//       </ol>
//     </nav>
//   );
// }


"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export default function Breadcrumbs({ parents = [] }) {
  const pathname = usePathname();

  const crumbs = useMemo(() => {
    if (!pathname) return [];

    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    const formatLabel = (str) =>
      str
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();

    const list = [
      { menu_label: "Home", menu_link: "/" },
      ...parents,
    ];

    // Base page (e.g. /dsm or /dst)
    if (segments.length === 1) return list;

    // Subpages (e.g. /dsm/editorial-board)
    list.push({
      menu_label: formatLabel(lastSegment),
      menu_link: pathname,
    });

    return list;
  }, [pathname, parents]);

  return (
    <nav className="py-3 border-b border-gray-200">
      <ol
        className="flex flex-wrap items-center space-x-1 
        container mx-auto px-4 sm:px-6 lg:px-16 xxl:px-12
        text-xs md:text-sm lg:text-base"
      >
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={crumb.menu_link} className="flex items-center">
              {idx > 0 && <span className="px-1">/</span>}
              {isLast ? (
                <span className="capitalize">{crumb.menu_label}</span>
              ) : (
                <Link
                  href={crumb.menu_link}
                  className="text-blue hover:text-light-blue capitalize"
                >
                  {crumb.menu_label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
