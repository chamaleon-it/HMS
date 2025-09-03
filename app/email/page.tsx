"use client"

import AppShell from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

const mails = [
  { subject: "Daily Meeting Schedule with Stakeholders", preview: "Lorem ipsum dolor sit amet...", time: "5h" },
  { subject: "Weekly Server Maintenance", preview: "Consectetur adipiscing elit...", time: "5h", selected: true },
  { subject: "Design Newsletter", preview: "Sed do eiusmod...", time: "5h" },
  { subject: "Your Daily Booster", preview: "Lorem ipsum dolor...", time: "5h" },
]

export default function EmailPage() {
  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-semibold">Email</h1>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr_360px]">
        {/* Left rail */}
        <Card>
          <CardContent className="pt-6">
            <Button className="w-full bg-violet-600 hover:bg-violet-700">+ New Mail</Button>
            <div className="mt-6 space-y-2">
              <Button variant="secondary" className="w-full justify-between">
                Inbox <Badge className="bg-red-500">2</Badge>
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Sent
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Favorite
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Draft
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Important
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Scheduled
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                More
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Center list */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search here..." className="pl-9 bg-muted/40" />
          </div>
          <Card>
            <CardContent className="divide-y p-0">
              {mails.map((m, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 ${m.selected ? "bg-violet-50" : ""}`}>
                  <div className="h-10 w-10 rounded-md bg-muted" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{m.subject}</div>
                    <div className="truncate text-sm text-muted-foreground">{m.preview}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{m.time}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview</CardTitle>
              <Badge className="bg-amber-500">Important</Badge>
            </div>
            <div className="mt-2 text-lg font-semibold">Daily Meeting Schedule with Stakeholders</div>
            <div className="text-sm text-muted-foreground">Today, March 30th 2021 04:45 PM</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-muted" />
              <div>
                <div className="text-sm font-medium">Tony Soap</div>
                <div className="text-xs text-muted-foreground">soap@email.com</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Hi Nella, Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
              labore et dolore magna aliqua.
            </p>
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Write your message here...</div>
              <div className="mt-3 flex justify-end">
                <Button className="bg-violet-600 hover:bg-violet-700">Send</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
