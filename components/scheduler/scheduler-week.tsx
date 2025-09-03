"use client"

import { useMemo, useState, useEffect, useRef } from "react"

type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  color?: string
}

type Props = {
  initialEvents?: CalendarEvent[]
  startOfWeekUTCOffsetMinutes?: number
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

// Layout constants
const HOUR_PX = 56 // height per hour in px (overall grid height = 24 * HOUR_PX)
const MINUTE_PX = HOUR_PX / 60

function startOfWeek(d: Date) {
  const s = new Date(d)
  s.setHours(0, 0, 0, 0)
  s.setDate(s.getDate() - s.getDay()) // Sunday
  return s
}

function addDays(d: Date, days: number) {
  const nd = new Date(d)
  nd.setDate(nd.getDate() + days)
  return nd
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function minutesSinceStartOfDay(d: Date) {
  return d.getHours() * 60 + d.getMinutes()
}

type Positioned = CalendarEvent & { top: number; height: number; lane: number; lanes: number }

function layoutDay(events: CalendarEvent[]): Positioned[] {
  // Sort by start time
  const sorted = [...events].sort((a, b) => +a.start - +b.start || +a.end - +b.end)

  // Greedy lane assignment for overlaps
  const positions: Positioned[] = []
  const active: { lane: number; ev: Positioned }[] = []

  function freeLane(): number {
    const used = new Set(active.map((a) => a.lane))
    let l = 0
    while (used.has(l)) l++
    return l
  }

  for (const ev of sorted) {
    // Drop finished
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].ev.end <= ev.start) active.splice(i, 1)
    }

    const lane = freeLane()
    const top = minutesSinceStartOfDay(ev.start) * MINUTE_PX
    const height = Math.max(24, (minutesSinceStartOfDay(ev.end) - minutesSinceStartOfDay(ev.start)) * MINUTE_PX)

    const positioned: Positioned = { ...ev, top, height, lane, lanes: 1 }
    active.push({ lane, ev: positioned })
    positions.push(positioned)

    // Update lanes count for all overlapping events
    const currentMaxLane = Math.max(...active.map((a) => a.lane)) + 1
    for (const a of active) a.ev.lanes = Math.max(a.ev.lanes, currentMaxLane)
  }

  return positions
}

 const now = new Date()
  const startOfWeek1 = new Date(now)
  // align to Sunday
  startOfWeek1.setDate(now.getDate() - now.getDay())

const initialEvents = [
    {
      id: "e1",
      title: "Design Review",
      start: new Date(startOfWeek1.getFullYear(), startOfWeek1.getMonth(), startOfWeek1.getDate() + 1, 9, 30),
      end: new Date(startOfWeek1.getFullYear(), startOfWeek1.getMonth(), startOfWeek1.getDate() + 1, 11, 0),
      color: "#1a73e8",
    },
    {
      id: "e2",
      title: "Team Standup",
      start: new Date(startOfWeek1.getFullYear(), startOfWeek1.getMonth(), startOfWeek1.getDate() + 2, 10, 0),
      end: new Date(startOfWeek1.getFullYear(), startOfWeek1.getMonth(), startOfWeek1.getDate() + 2, 10, 45),
      color: "#7c3aed",
    },
    {
      id: "e3",
      title: "Client Call",
      start: new Date(startOfWeek1.getFullYear(), startOfWeek1.getMonth(), startOfWeek1.getDate() + 4, 14, 0),
      end: new Date(startOfWeek1.getFullYear(), startOfWeek1.getMonth(), startOfWeek1.getDate() + 4, 15, 0),
      color: "#059669",
    },
    {
      id: "e4",
      title: "Overlapping 1",
      start: new Date(startOfWeek1.getFullYear(), startOfWeek1.getMonth(), startOfWeek1.getDate() + 4, 9, 0),
      end: new Date(startOfWeek1.getFullYear(), startOfWeek1.getMonth(), startOfWeek1.getDate() + 4, 10, 30),
      color: "#2563eb",
    },
    {
      id: "e5",
      title: "Overlapping 2",
      start: new Date(startOfWeek1.getFullYear(), startOfWeek1.getMonth(), startOfWeek1.getDate() + 4, 9, 15),
      end: new Date(startOfWeek1.getFullYear(), startOfWeek1.getMonth(), startOfWeek1.getDate() + 4, 10, 15),
      color: "#ef4444",
    },
  ]


export function SchedulerWeek() {
  const [baseDate, setBaseDate] = useState(() => startOfWeek(new Date()))
  const [events] = useState<CalendarEvent[]>(initialEvents)
  const containerRef = useRef<HTMLDivElement>(null)

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(baseDate, i)), [baseDate])

  const byDay = useMemo(() => {
    return days.map((d) => events.filter((e) => isSameDay(e.start, d)))
  }, [days, events])

  const positionedByDay = useMemo(() => byDay.map((list) => layoutDay(list)), [byDay])

  const title = useMemo(() => {
    const start = days[0]
    const end = days[6]
    const sameMonth = start.getMonth() === end.getMonth()
    const monthPart = sameMonth
      ? start.toLocaleString(undefined, { month: "long" })
      : `${start.toLocaleString(undefined, { month: "long" })} – ${end.toLocaleString(undefined, {
          month: "long",
        })}`
    return `${monthPart} ${start.getFullYear()}`
  }, [days])

  // Auto-scroll near current time on mount
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const now = new Date()
    const y = minutesSinceStartOfDay(now) * MINUTE_PX - 200
    el.scrollTop = Math.max(0, y)
  }, [])

  const now = new Date()

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBaseDate(startOfWeek(new Date()))}
            className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
          >
            Today
          </button>
          <div className="flex rounded-md border">
            <button
              aria-label="Previous week"
              onClick={() => setBaseDate(addDays(baseDate, -7))}
              className="px-3 py-1.5 hover:bg-accent"
            >
              {"<"}
            </button>
            <button
              aria-label="Next week"
              onClick={() => setBaseDate(addDays(baseDate, 7))}
              className="border-l px-3 py-1.5 hover:bg-accent"
            >
              {">"}
            </button>
          </div>
          <div className="ml-2 text-sm text-muted-foreground">{title}</div>
        </div>
      </div>

      {/* Grid */}
      <div className="relative">
        {/* Day headers */}
        <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b text-center text-sm">
          
          {days.map((d, idx) => {
            const isToday = isSameDay(d, now)
            return (
              <div key={idx} className="h-12 border-r p-2">
                <div className="mx-auto flex w-fit items-center gap-2">
                  <span className="text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                      isToday ? "bg-blue-600 text-white" : "text-foreground"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Scrollable body */}
        <div ref={containerRef} className="max-h-[70vh] overflow-auto">
          <div className="grid grid-cols-[64px_repeat(7,1fr)]">
            {/* Time gutter */}
            <div className="relative border-r" style={{ height: 24 * HOUR_PX }}>
              {HOURS.map((h) => (
                <div key={h} className="relative h-[56px]">
                  <div className="absolute -translate-y-2 px-2 text-xs text-muted-foreground">
                    {h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 border-t" />
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((d, dayIdx) => {
              const positioned = positionedByDay[dayIdx]
              const isToday = isSameDay(d, now)
              const nowTop = minutesSinceStartOfDay(now) * MINUTE_PX
              return (
                <div key={dayIdx} className="relative border-r" style={{ height: 24 * HOUR_PX }}>
                  {/* Hour lines + half-hour faint lines */}
                  {HOURS.map((h) => (
                    <div key={h} className="relative h-[56px]">
                      <div className="absolute bottom-0 left-0 right-0 border-t" />
                      <div className="absolute left-0 right-0 top-1/2 border-t border-dashed opacity-30" />
                    </div>
                  ))}

                  {/* Now line */}
                  {isToday && (
                    <div
                      className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
                      style={{ top: nowTop }}
                    >
                      <div className="h-2 w-2 -translate-x-1/2 rounded-full bg-red-600 shadow" />
                      <div className="h-px w-full bg-red-600" />
                    </div>
                  )}

                  {/* Events */}
                  {positioned.map((ev) => {
                    const width = 100 / ev.lanes
                    const left = ev.lane * width
                    return (
                      <div
                        key={ev.id}
                        className="absolute z-20 overflow-hidden rounded-md border text-xs text-white shadow-sm"
                        style={{
                          top: ev.top,
                          height: ev.height,
                          left: `${left}%`,
                          width: `calc(${width}% - 4px)`,
                          background: ev.color || "#2563eb",
                        }}
                      >
                        <div className="line-clamp-3 p-2 leading-5">
                          <div className="font-medium">{ev.title}</div>
                          <div className="opacity-80">
                            {ev.start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} –{" "}
                            {ev.end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
