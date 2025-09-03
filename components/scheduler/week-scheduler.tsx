"use client"

import type React from "react"
import { useMemo, useRef, useState } from "react"
import { addDays, format, setHours, setMinutes, differenceInMinutes } from "date-fns"
import type { CalendarEvent } from "./types"
import { useLocalStorage } from "./use-local-storage"
import MiniMonth from "./mini-month"
import EventForm from "./event-form"
import { HOURS, laneLayout } from "./week-scheduler_helpers"
import { startOfWeekLocal, addDaysSafe, fmtDayHeader, clampToSlot } from "./utils"
import { v4 as uuidv4 } from "uuid";

type Draft = { start: Date; end: Date; dayIndex: number } | null

export default function WeekScheduler() {
  const [current, setCurrent] = useState(new Date())
  const weekStart = useMemo(() => startOfWeekLocal(current), [current])
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>("scheduler:events", seedEvents(weekStart))
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<CalendarEvent>>({})
  const [monthDate, setMonthDate] = useState(current)
  const [draft, setDraft] = useState<Draft>(null)

  const gridRef = useRef<HTMLDivElement>(null)

  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i))
  const laidOut = useMemo(() => laneLayout(events, weekStart), [events, weekStart])

  function openNew(start: Date, end: Date) {
    setEditing({ start, end, color: "violet" })
    setModalOpen(true)
  }

  function handleSave(evt: CalendarEvent) {
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === evt.id)
      if (idx >= 0) {
        const clone = [...prev]
        clone[idx] = evt
        return clone
      }
      return [...prev, evt]
    })
    setModalOpen(false)
  }

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
    setModalOpen(false)
  }

  function prevWeek() {
    setCurrent(addDays(current, -7))
    setMonthDate(addDays(monthDate, -7))
  }

  function nextWeek() {
    setCurrent(addDays(current, 7))
    setMonthDate(addDays(monthDate, 7))
  }

  const now = new Date()
  const nowDayIdx = now >= weekStart && now < addDays(weekStart, 7) ? differenceInDaysTrunc(now, weekStart) : -1
  const nowTop = (((now.getHours() - HOURS.start) * 60 + now.getMinutes()) / ((HOURS.end - HOURS.start) * 60)) * 100

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left panel: mini month + filters */}
      <aside className="col-span-12 space-y-4 md:col-span-12 lg:col-span-12 grid gap-4 grid-cols-5">
        <MiniMonth
          monthDate={monthDate}
          onChangeMonth={setMonthDate}
          selectedWeekStart={weekStart}
          onSelectWeekStart={(d) => setCurrent(d)}
        />

        <div className="rounded-xl border bg-card col-span-3">
          <div className="border-b p-3 text-sm font-medium">My Calendars</div>
          <ul className="p-3 text-sm">
            <li className="flex items-center gap-2 py-1">
              <span className="h-3 w-3 rounded-full bg-violet-500" /> Work
            </li>
            <li className="flex items-center gap-2 py-1">
              <span className="h-3 w-3 rounded-full bg-emerald-500" /> Personal
            </li>
            <li className="flex items-center gap-2 py-1">
              <span className="h-3 w-3 rounded-full bg-sky-500" /> Meetings
            </li>
            <li className="flex items-center gap-2 py-1">
              <span className="h-3 w-3 rounded-full bg-amber-400" /> Reminders
            </li>
          </ul>
        </div>
      </aside>

      {/* Main calendar */}
      <section className="col-span-12 md:col-span-12 lg:col-span-12">
        {/* Toolbar */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setCurrent(new Date())}
            >
              Today
            </button>
            <div className="flex overflow-hidden rounded-md border">
              <button className="px-3 py-2 text-sm hover:bg-muted" onClick={prevWeek}>
                ‹
              </button>
              <button className="border-l px-3 py-2 text-sm hover:bg-muted" onClick={nextWeek}>
                ›
              </button>
            </div>
            <div className="text-lg font-semibold">{format(weekStart, "MMMM yyyy")}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
              onClick={() => {
                const start = clampToSlot(setMinutes(setHours(new Date(), 9), 0))
                const end = clampToSlot(setMinutes(setHours(new Date(), 10), 0))
                openNew(start, end)
              }}
            >
              + Add Schedule
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-[80px_repeat(7,_1fr)] border-b text-sm">
          <div className="h-12 border-r bg-background/50"></div>
          {weekDays.map((d, idx) => {
            const { dow, date, isToday } = fmtDayHeader(d)
            return (
              <div
                key={idx}
                className={`flex h-12 flex-col items-center justify-center border-r ${isToday ? "text-violet-700" : ""}`}
              >
                <div className="text-[11px] text-muted-foreground">{dow.toUpperCase()}</div>
                <div
                  className={`text-base font-medium ${isToday ? "rounded-full bg-violet-600 px-2 py-0.5 text-white" : ""}`}
                >
                  {date}
                </div>
              </div>
            )
          })}
        </div>

        {/* Grid */}
        <div className="relative grid grid-cols-[80px_repeat(7,_1fr)]">
          {/* Time gutter */}
          <div className="select-none border-r text-[11px] text-muted-foreground">
            {Array.from({ length: HOURS.end - HOURS.start + 1 }).map((_, i) => {
              const hour = HOURS.start + i
              return (
                <div key={hour} className="h-16 -translate-y-2 pr-2 text-right">
                  {format(setHours(new Date(), hour), "ha")}
                </div>
              )
            })}
          </div>

          {/* Days columns */}
          {weekDays.map((day, dayIdx) => (
            <DayColumn
              key={dayIdx}
              day={day}
              dayIdx={dayIdx}
              events={laidOut[dayIdx]?.events ?? []}
              lanes={laidOut[dayIdx]?.lanes ?? 1}
              onAdd={(start, end) => openNew(start, end)}
              onEdit={(evt) => {
                setEditing(evt)
                setModalOpen(true)
              }}
              gridRef={gridRef}
            />
          ))}

          {/* Now line */}
          {nowDayIdx >= 0 && (
            <div
              className="pointer-events-none absolute left-[80px] right-0 z-10"
              style={{ top: `calc(${nowTop}% + 48px)` }}
            >
              <div
                className="ml-[calc((100%/7)*var(--day-index))] mr-[calc(100%-(100%/7)*(var(--day-index)+1))] flex items-center gap-1"
                style={{ ["--day-index" as any]: nowDayIdx }}
              >
                <div className="h-[2px] w-full bg-red-500/80"></div>
                <div className="h-2 w-2 -translate-y-[3px] rounded-full bg-red-500"></div>
              </div>
            </div>
          )}
        </div>
      </section>

      <EventForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSave={handleSave}
        onDelete={editing.id ? handleDelete : undefined}
      />
    </div>
  )
}

function differenceInDaysTrunc(a: Date, b: Date) {
  const diff = a.getTime() - b.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

type DayColumnProps = {
  day: Date
  dayIdx: number
  events: Array<CalendarEvent & { lane: number; lanes: number }>
  lanes: number
  onAdd: (start: Date, end: Date) => void
  onEdit: (evt: CalendarEvent) => void
  gridRef: React.RefObject<HTMLDivElement>
}

function DayColumn({ day, dayIdx, events, lanes, onAdd, onEdit }: DayColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<{ y1: number; y2: number } | null>(null)

  function yToDate(yPct: number) {
    const minutes = (HOURS.end - HOURS.start) * 60 * (yPct / 100)
    const h = Math.floor(minutes / 60) + HOURS.start
    const m = Math.round((minutes % 60) / 30) * 30
    return setMinutes(setHours(day, h), m)
  }

  function handleMouseDown(e: React.MouseEvent) {
    const bounds = columnRef.current!.getBoundingClientRect()
    const yPct = ((e.clientY - bounds.top) / bounds.height) * 100
    setDrag({ y1: yPct, y2: yPct })
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!drag) return
    const bounds = columnRef.current!.getBoundingClientRect()
    const yPct = ((e.clientY - bounds.top) / bounds.height) * 100
    setDrag((d) => (d ? { ...d, y2: Math.min(100, Math.max(0, yPct)) } : null))
  }

  function handleMouseUp() {
    if (!drag) return
    const top = Math.min(drag.y1, drag.y2)
    const bottom = Math.max(drag.y1, drag.y2)
    const start = yToDate(top)
    const end = yToDate(bottom)
    if (differenceInMinutes(end, start) >= 15) {
      onAdd(start, end)
    }
    setDrag(null)
  }

  return (
    <div
      ref={columnRef}
      className="relative border-r"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* hour rows */}
      {Array.from({ length: (HOURS.end - HOURS.start) * 2 }).map((_, i) => (
        <div key={i} className={`h-8 border-b ${i % 2 === 0 ? "border-muted" : "border-muted/60"}`} />
      ))}

      {/* draft selection */}
      {drag && (
        <div
          className="pointer-events-none absolute left-1 right-1 rounded-md bg-violet-500/10 ring-1 ring-violet-500"
          style={{
            top: `${Math.min(drag.y1, drag.y2)}%`,
            height: `${Math.abs(drag.y2 - drag.y1)}%`,
          }}
        />
      )}

      {/* events */}
      {events.map((evt) => {
        const topPct =
          (((evt.start?.getHours() - HOURS.start) * 60 + evt.start.getMinutes()) / ((HOURS.end - HOURS.start) * 60)) *
          100
        const heightPct = Math.max(
          2,
          (differenceInMinutes(evt.end, evt.start) / ((HOURS.end - HOURS.start) * 60)) * 100,
        )
        const leftPct = (evt.lane / evt.lanes) * 100
        const widthPct = 100 / evt.lanes

        const colorClass =
          evt.color === "green"
            ? "bg-emerald-500/20 text-emerald-800 ring-emerald-500/40"
            : evt.color === "blue"
              ? "bg-sky-500/20 text-sky-800 ring-sky-500/40"
              : evt.color === "yellow"
                ? "bg-amber-400/30 text-amber-900 ring-amber-400/60"
                : "bg-violet-500/20 text-violet-800 ring-violet-500/40"

        return (
          <button
            key={evt.id}
            onClick={(e) => {
              e.stopPropagation()
              onEdit(evt)
            }}
            className={`absolute left-0 top-0 overflow-hidden rounded-md px-2 py-1 text-left text-[12px] ring-1 ${colorClass} hover:brightness-110`}
            style={{
              top: `calc(${topPct}% + 0px)`,
              height: `calc(${heightPct}% - 1px)`,
              width: `calc(${widthPct}% - 6px)`,
              transform: `translateX(${leftPct}%)`,
            }}
          >
            <div className="truncate font-medium">{evt.title}</div>
            <div className="truncate text-[11px] text-black/60">
              {format(evt.start, "h:mma")} – {format(evt.end, "h:mma")}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function seedEvents(weekStart: Date): CalendarEvent[] {
  const d = (
    i: number,
    sh: number,
    sm: number,
    eh: number,
    em: number,
    color: CalendarEvent["color"],
    title: string,
  ) => ({
    id: uuidv4(),
    title,
    start: setMinutes(setHours(addDaysSafe(weekStart, i), sh), sm),
    end: setMinutes(setHours(addDaysSafe(weekStart, i), eh), em),
    color,
  })
  return [
    d(1, 9, 0, 10, 0, "violet", "Jane Feedback"),
    d(1, 11, 0, 12, 0, "green", "Design System"),
    d(2, 10, 0, 11, 0, "blue", "Discuss Holo Project"),
    d(3, 11, 0, 12, 0, "violet", "Daily Sync"),
    d(4, 9, 30, 10, 0, "yellow", "Upload Shots"),
  ]
}
