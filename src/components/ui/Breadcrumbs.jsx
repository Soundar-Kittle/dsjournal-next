"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

export default function Breadcrumbs({ menuItems = [] }) {
  const pathname = usePathname()

  const { base, currentItem } = useMemo(() => {
    if (!pathname) return { base: null, currentItem: null }

    const segments = pathname.split("/").filter(Boolean)
    const baseSegment = segments[0]

    const formatLabel = segment => {
      if (/^for-(authors|journals|editors|reviewers)$/i.test(segment)) {
        return segment
          .replace(/^for-/, "")
          .replace(/-/g, " ")
          .trim()
      }
      return segment.replace(/-/g, " ").trim()
    }

    const base = baseSegment
      ? { menu_label: formatLabel(baseSegment), menu_link: `/${baseSegment}` }
      : null

    const currentItem = menuItems.find(item => item.menu_link === pathname)

    return { base, currentItem }
  }, [pathname, menuItems])

  return (
    <nav className="py-5 border-b border-gray-200">
      <ol
        className="
          flex flex-wrap items-center space-x-1 
          max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 
          text-sm sm:text-base md:text-lg
        "
      >
        {/* Home */}
        <li>
          <Link href="/" className="text-blue hover:text-light-blue">
            Home
          </Link>
        </li>

        {/* Base */}
        {base && (
          <>
            <li>/</li>
            <li>
              {pathname === base.menu_link ? (
                <span className="capitalize">{base.menu_label}</span>
              ) : (
                <Link
                  href={base.menu_link}
                  className="text-blue hover:text-light-blue capitalize"
                >
                  {base.menu_label}
                </Link>
              )}
            </li>
          </>
        )}

        {/* Current page */}
        {currentItem && currentItem.menu_link !== base?.menu_link && (
          <>
            <li>/</li>
            <li>
              <span className="capitalize">{currentItem.menu_label}</span>
            </li>
          </>
        )}
      </ol>
    </nav>
  )
}
