import type React from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

type AppShellProps = {
  children: React.ReactNode
  rightSlot?: React.ReactNode
}

export default function AppShell({ children, rightSlot }: AppShellProps) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="min-h-screen flex-1">
        <Topbar />
        <div className="mx-auto max-w-[1600px] px-6 py-6">
          <div className={`grid gap-6 ${rightSlot ? "lg:grid-cols-[1fr_360px]" : ""}`}>
            <main>{children}</main>
            {rightSlot ? <aside className="hidden lg:block">{rightSlot}</aside> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
