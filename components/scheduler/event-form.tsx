"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { CalendarEvent } from "./types"

type Props = {
  open: boolean
  onClose: () => void
  initial: Partial<CalendarEvent>
  onSave: (evt: CalendarEvent) => void
  onDelete?: (id: string) => void
}

const COLORS: Array<{ key: CalendarEvent["color"]; label: string; bg: string; text: string }> = [
  { key: "violet", label: "Violet", bg: "bg-violet-500", text: "text-white" },
  { key: "green", label: "Green", bg: "bg-emerald-500", text: "text-white" },
  { key: "blue", label: "Blue", bg: "bg-sky-500", text: "text-white" },
  { key: "yellow", label: "Yellow", bg: "bg-amber-400", text: "text-black" },
]

export default function EventForm({ open, onClose, initial, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(initial.title ?? "")
  const [color, setColor] = useState<CalendarEvent["color"]>(initial.color ?? "violet")
  const [start, setStart] = useState(initial.start ? new Date(initial.start) : new Date())
  const [end, setEnd] = useState(initial.end ? new Date(initial.end) : new Date())
  const [location, setLocation] = useState(initial.location ?? "")
  const [description, setDescription] = useState(initial.description ?? "")

  useEffect(() => {
    setTitle(initial.title ?? "")
    setColor(initial.color ?? "violet")
    setStart(initial.start ? new Date(initial.start) : new Date())
    setEnd(initial.end ? new Date(initial.end) : new Date())
    setLocation(initial.location ?? "")
    setDescription(initial.description ?? "")
  }, [initial])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/20 p-2 sm:p-4">
      <div className="w-full max-w-sm rounded-xl border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b p-3">
          <div className="text-sm font-medium">Add Schedule</div>
          <button className="rounded-md p-1 hover:bg-muted" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="space-y-3 p-3">
          <input
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
            placeholder="New event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-muted-foreground">Start</label>
            <label className="text-xs text-muted-foreground">End</label>
            <input
              type="datetime-local"
              className="rounded-md border bg-background px-2 py-1 text-sm"
              value={format(start, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setStart(new Date(e.target.value))}
            />
            <input
              type="datetime-local"
              className="rounded-md border bg-background px-2 py-1 text-sm"
              value={format(end, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setEnd(new Date(e.target.value))}
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Color</div>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.key}
                  className={`h-7 w-7 rounded-full ring-2 ring-offset-2 ${c.bg} ${color === c.key ? "ring-violet-500" : "ring-transparent"}`}
                  onClick={() => setColor(c.key)}
                  aria-label={c.label}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <input
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <textarea
            className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
            placeholder="Add description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {onDelete && initial.id ? (
                <button
                  onClick={() => onDelete?.(initial.id!)}
                  className="rounded-md border px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button className="rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={onClose}>
                Cancel
              </button>
              <button
                className="rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
                onClick={() =>
                  onSave({
                    id: initial.id ?? crypto.randomUUID(),
                    title: title || "(no title)",
                    start,
                    end,
                    color,
                    location,
                    description,
                    allDay: false,
                    attendees: [],
                  })
                }
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
