"use client"

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { WEEK_START } from "./utils"

type Props = {
  monthDate: Date
  onChangeMonth: (d: Date) => void
  selectedWeekStart: Date
  onSelectWeekStart: (d: Date) => void
}

export default function MiniMonth({ monthDate, onChangeMonth, selectedWeekStart, onSelectWeekStart }: Props) {
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: WEEK_START as 0 })
  const days = eachDayOfInterval({ start: gridStart, end: endOfMonth(addMonths(monthStart, 1)) })

  return (
    <div className="rounded-xl border bg-card p-3 col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <button
          className="rounded-md px-2 py-1 text-sm hover:bg-muted"
          onClick={() => onChangeMonth(addMonths(monthDate, -1))}
        >
          ‹
        </button>
        <div className="text-sm font-medium">{format(monthDate, "MMMM yyyy")}</div>
        <button
          className="rounded-md px-2 py-1 text-sm hover:bg-muted"
          onClick={() => onChangeMonth(addMonths(monthDate, 1))}
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d) => {
          const inMonth = isSameMonth(d, monthDate)
          const isTodayFlag = isToday(d)
          const isSelected =
            d >= selectedWeekStart && d < new Date(selectedWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
          return (
            <button
              key={d.toISOString()}
              onClick={() => onSelectWeekStart(startOfWeek(d, { weekStartsOn: WEEK_START as 0 }))}
              className={`rounded-md py-1 text-sm ${inMonth ? "text-foreground" : "text-muted-foreground/50"} ${isSelected ? "bg-violet-100 text-violet-700" : "hover:bg-muted"} ${isTodayFlag ? "ring-1 ring-violet-500" : ""}`}
            >
              {format(d, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}
