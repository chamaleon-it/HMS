import type React from "react"
import { Sidebar } from "./sidebar"
import Header from "./topbar"
import Footer from "./Footer"

type AppShellProps = {
  children: React.ReactNode
}

export default function AppShell({ children,  }: AppShellProps) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="min-h-screen flex-1">
      <Header />
        {children}
        <Footer />
      </div>
    </div>
  )
}
