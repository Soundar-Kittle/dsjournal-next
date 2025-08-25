"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Home, BarChart2, Settings, User, BookImage } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";


const items = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Journals", href: "/dashboard/journals", icon: BookImage },
  {
    title: "Journals",
    icon: BookImage,
    children: [
      { title: "List of Journals", href: "/dashboard/journals" },
      { title: "Journals Mails", href: "/dashboard/journals/journals-mails" },
    ]
  },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
   {
    title: "Editorial Board",
    icon: Settings,
    children: [
      { title: "Members", href: "/dashboard/editorial-board/members" },
      { title: "Titles", href: "/dashboard/editorial-board/titles" },
      { title: "Assign Roles", href: "/dashboard/editorial-board/assign-roles" }
    ]
  },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "flex flex-col bg-muted h-full border-r transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        {!collapsed && (
          <div>
            <div className="text-sm font-medium">Dream Science</div>
            <div className="text-xs text-muted-foreground">Journal</div>
          </div>
        )}
       <button
  onClick={() => setCollapsed(!collapsed)}
  className={cn(
    "p-2 hover:bg-muted-foreground/10 rounded-md transition",
    collapsed ? "mx-auto" : "ml-auto"
  )}
>
  {collapsed ? (
    <Menu className="w-5 h-5" />
  ) : (
    <X className="w-5 h-5" />
  )}
</button>

      </div>

      {/* Nav Items */}
      <TooltipProvider delayDuration={100}>
  <nav className="flex-1 overflow-y-auto mt-4 space-y-1">
    {items.map(({ title, href, icon: Icon, children }) => {
  if (children) {
    return (
      <Collapsible key={title}>
        <CollapsibleTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-4 px-4 py-2 cursor-pointer hover:bg-muted-foreground/5",
              collapsed && "justify-center"
            )}
          >
            <Icon className="w-5 h-5" />
            {!collapsed && <span>{title}</span>}
            {!collapsed && <ChevronDown className="ml-auto w-4 h-4" />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className={cn("pl-10", collapsed && "hidden")}>
          {children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block py-1 text-sm hover:text-primary"
            >
              {child.title}
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Standard single-level link
  const link = (
    <Link
      key={href}
      href={href}
      className={cn(
        "flex items-center gap-4 px-4 py-2 hover:bg-muted-foreground/5",
        collapsed && "justify-center"
      )}
    >
      <Icon className="w-5 h-5" />
      {!collapsed && <span>{title}</span>}
    </Link>
  );

  return collapsed ? (
    <Tooltip key={href}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{title}</TooltipContent>
    </Tooltip>
  ) : (
    link
  );
})}
  </nav>
</TooltipProvider>

      {/* User at bottom */}
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6" />
          {!collapsed && <span>Jane Doe</span>}
        </div>
      </div>
    </div>
  )
}
