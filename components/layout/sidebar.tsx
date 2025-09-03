"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Mail, KanbanSquare, ActivitySquare, Receipt, DollarSign, Bitcoin, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/email", label: "Email", icon: Mail },
  { href: "/kanban", label: "Kanban", icon: KanbanSquare },
  { href: "/ticketing", label: "Ticketing", icon: ActivitySquare },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/invoicing", label: "Invoicing", icon: Receipt },
  { href: "/banking", label: "Banking", icon: DollarSign },
  { href: "/crypto", label: "Crypto", icon: Bitcoin },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="sticky top-0 h-screen w-16 lg:w-56 shrink-0 border-r bg-background/70 backdrop-blur">
      <div className="flex h-16 items-center justify-center">
        <div className="h-8 w-8 rounded-md bg-violet-600" aria-label="Logo" />
      </div>
      <nav className="flex flex-col gap-2 px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className="relative" aria-current={active ? "page" : undefined}>
              <span
                className={cn(
                  "group relative flex h-11 items-center rounded-lg px-2 lg:px-3 text-muted-foreground transition-colors hover:text-foreground justify-center lg:justify-start",
                  active && "text-violet-600",
                )}
                title={label}
              >
                <Icon className="h-5 w-5" />
                <span className="ml-3 hidden lg:inline text-sm font-medium">{label}</span>
              </span>
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-full bg-violet-600" />
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
