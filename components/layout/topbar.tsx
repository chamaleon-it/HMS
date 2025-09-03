"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, MessageCircle, Settings, Search } from "lucide-react"

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-4">
        <div className="flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9 bg-muted/40" placeholder="Search here..." />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <span className="inline-flex h-4 w-6 items-center justify-center rounded-sm bg-muted text-[10px]">
                US
              </span>
              English (US)
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>English (US)</DropdownMenuItem>
            <DropdownMenuItem>Deutsch</DropdownMenuItem>
            <DropdownMenuItem>Español</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" aria-label="Messages" className="relative">
          <MessageCircle className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] text-white">
            2
          </span>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] text-white">
            2
          </span>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>

        <div className="hidden sm:flex items-center gap-3">
          <Avatar>
            <AvatarImage alt="Admin avatar" src="/diverse-avatars.png" />
            <AvatarFallback>ZW</AvatarFallback>
          </Avatar>
          <div className="leading-none">
            <div className="text-sm font-medium">Zara Wardani</div>
            <div className="text-xs text-muted-foreground">Admin</div>
          </div>
        </div>
      </div>
    </header>
  )
}
