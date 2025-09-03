import type React from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { Input } from "../ui/input"
import { Bell } from "lucide-react"

type AppShellProps = {
  children: React.ReactNode
}

export default function AppShell({ children,  }: AppShellProps) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="min-h-screen flex-1">
        <div className="flex items-center justify-between bg-white shadow px-6 py-3">
          <Input placeholder="Search patients or appointments..." className="w-1/3" />
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-gray-500" />
            <div className="flex items-center gap-2">
              <img src="https://i.pravatar.cc/40" className="rounded-full w-8 h-8" />
              <span className="font-medium">Dr. Nadir Sha</span>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
