"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SmallVerticalBars } from "./charts/small-vertical-bars"

export function RightRail() {

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] overflow-auto pb-6 lg:block">
      {/* Server Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Server Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SmallVerticalBars />
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>
              <div className="text-foreground font-medium">Country</div>
              <div>Indonesia</div>
            </div>
            <div>
              <div className="text-foreground font-medium">Domain</div>
              <div>website.com</div>
            </div>
            <div>
              <div className="text-foreground font-medium">Device</div>
              <div>Mobile</div>
            </div>
            <div>
              <div className="text-foreground font-medium">Speed</div>
              <div>2.0 mbps</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Contacts</CardTitle>
            <button className="text-xs text-violet-600">View All</button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {["Tony", "Karen", "Jordan", "Jack", "Naslia", "Johnny"]?.map((n) => (
              <div key={n} className="flex flex-col items-center gap-1">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/diverse-avatars.png" alt={`${n} avatar`} />
                    <AvatarFallback>{n.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -right-0.5 -bottom-0.5 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="text-[11px] text-muted-foreground">{n}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Messages</CardTitle>
            <button className="text-xs text-violet-600">View All</button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Samantha Willian", preview: "Lorem ipsum dolor sit amet...", color: "bg-violet-200" },
            { name: "Tony Soap", preview: "Consectetur adipiscing elit...", color: "bg-amber-200" },
            { name: "Jordan Rico", preview: "Sed do eiusmod tempor...", color: "bg-sky-200" },
            { name: "Nadia Aja", preview: "Incididunt ut labore...", color: "bg-slate-200" },
          ]?.map((m) => (
            <div key={m.name} className="flex items-start gap-3">
              <div className={`h-9 w-9 rounded-md ${m.color}`} />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{m.name}</div>
                <div className="truncate text-xs text-muted-foreground">{m.preview}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 inline-flex rounded-full bg-muted p-1">
            <Badge className="rounded-full bg-violet-600 text-white hover:bg-violet-600">Activity</Badge>
            <span className="ml-2 rounded-full px-3 py-1 text-xs text-muted-foreground">Update</span>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              { t: "Transaction Assets", time: "2 Hour Ago", tone: "bg-violet-500" },
              { t: "New Email Register", time: "2 Hour Ago", tone: "bg-amber-500" },
              { t: "Transaction Assets", time: "2 Hour Ago", tone: "bg-violet-500" },
              { t: "New Email Register", time: "2 Hour Ago", tone: "bg-amber-500" },
            ]?.map((a, i) => (
              <li key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-block h-3 w-3 rounded-full ${a.tone}`} />
                  <span>{a.t}</span>
                </div>
                <span className="text-xs text-muted-foreground">{a.time}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </aside>
  )
}
