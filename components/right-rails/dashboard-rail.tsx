"use client"

import Image from "next/image"
import { ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid, Tooltip } from "recharts"

const serverStatus = [
  { k: "ID", v: 12 },
  { k: "US", v: 18 },
  { k: "SG", v: 10 },
  { k: "JP", v: 16 },
  { k: "DE", v: 14 },
  { k: "FR", v: 20 },
]

const contacts = [
  { id: 1, name: "Tony" },
  { id: 2, name: "Karen" },
  { id: 3, name: "Jordan" },
  { id: 4, name: "Jack" },
  { id: 5, name: "Nadia" },
  { id: 6, name: "Johnny" },
  { id: 7, name: "Martha" },
  { id: 8, name: "John" },
]

const messages = [
  { id: 1, name: "Samantha Willian", text: "Lorem ipsum dolor sit amet..." },
  { id: 2, name: "Tony Soap", text: "Consectetur adipiscing elit..." },
  { id: 3, name: "Jordan Rico", text: "Amet labore et dolore magna..." },
  { id: 4, name: "Neila Adja", text: "Minima harum tenetur..." },
]

const activities = [
  { id: 1, label: "Transaction Assets", time: "2h ago", color: "bg-violet-600" },
  { id: 2, label: "New Email Register", time: "2h ago", color: "bg-indigo-500" },
  { id: 3, label: "Transaction Assets", time: "2h ago", color: "bg-blue-400" },
]

export default function DashboardRightRail() {
  return (
    <div className="space-y-6">
      <section>
        <header className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Server Status</h3>
        </header>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serverStatus} margin={{ left: -20, right: 0, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="k" axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="v" radius={[6, 6, 0, 0]} fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <header className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Contacts</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground">View All</button>
        </header>
        <div className="grid grid-cols-4 gap-3">
          {contacts?.map((c) => (
            <div key={c.id} className="flex flex-col items-center gap-1">
              <Image src="/diverse-avatars.png" alt={c.name} width={40} height={40} className="rounded-md" />
              <span className="text-[10px] text-muted-foreground">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <header className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Messages</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground">View All</button>
        </header>
        <ul className="space-y-3">
          {messages?.map((m) => (
            <li key={m.id} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-md bg-violet-200" />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">{m.name}</p>
                <p className="truncate text-xs leading-snug text-muted-foreground">{m.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <header className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Recent Activity</h3>
        </header>
        <div className="space-y-3">
          {activities?.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${a.color}`} />
                <div>
                  <p className="text-sm font-medium leading-tight">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </div>
              <button className="h-6 w-6 rounded-md border text-xs text-muted-foreground">›</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
