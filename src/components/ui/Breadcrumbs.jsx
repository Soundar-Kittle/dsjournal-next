"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs({ base, menuItems = [] }) {
  const pathname = usePathname();
  const currentItem = menuItems.find((item) => item.menu_link === pathname);

  return (
    <nav className="text-md text-gray-600 py-5 border-b border-gray-200">
      <ol className="flex flex-wrap items-center space-x-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Home */}
        <li>
          <Link href="/" className="text-blue hover:text-light-blue">
            Home
          </Link>
        </li>

        {/* Base (Authors, Reviewers, etc.) */}
        {base && (
          <>
            <li>/</li>
            <li>
              {pathname === base.menu_link ? (
                <span>{base.menu_label}</span>
              ) : (
                <Link
                  href={base.menu_link}
                  className="text-blue hover:text-light-blue"
                >
                  {base.menu_label}
                </Link>
              )}
            </li>
          </>
        )}

        {/* Current page (plain text if not base) */}
        {currentItem && currentItem.menu_link !== base?.menu_link && (
          <>
            <li>/</li>
            <li>
              <span>{currentItem.menu_label}</span>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
