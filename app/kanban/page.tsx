"use client"

import AppShell from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const columns = [
  { title: "To-do" },
  { title: "In-Progress" },
  { title: "Completed" },
  { title: "Review" },
  { title: "Revision" },
]

const cards = [
  { column: 0, title: "Design", text: "Sed eligendi facere repellendus. Ipsam ipsum incidunt minima harum tenetur." },
  { column: 0, title: "Development", text: "Ab sit asperiores architecto repudiandae." },
  { column: 1, title: "Design", text: "Sed eligendi facere repellendus." },
  { column: 1, title: "Research", text: "Ipsam ipsum incidunt minima harum tenetur." },
  { column: 2, title: "Design", text: "Repudiandae architecto." },
  { column: 3, title: "Research", text: "Sed eligendi facere repellendus." },
]

export default function KanbanPage() {
  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-semibold">Kanban</h1>
      <div className="overflow-x-auto">
        <div className="flex min-w-[1000px] gap-6">
          {columns.map((col, idx) => (
            <div key={col.title} className="w-72 shrink-0">
              <Card className="bg-violet-50/50">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">{col.title}</CardTitle>
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                    + Add card
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cards
                    .filter((c) => c.column === idx)
                    .map((c, i) => (
                      <div key={i} className="rounded-xl border bg-background p-4 shadow-sm">
                        <div className="font-medium">{c.title}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{c.text}</div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
