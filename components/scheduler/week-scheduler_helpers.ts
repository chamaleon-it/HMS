import { addDays, isSameDay } from "date-fns"
import type { CalendarEvent } from "./types"
import { eventOverlaps } from "./utils"

export const HOURS = { start: 8, end: 20 }

export function laneLayout(events: CalendarEvent[], weekStart: Date) {
  // group by day
  const days: Array<{ date: Date; events: Array<CalendarEvent & { lane: number; lanes: number }>; lanes: number }> = []
  for (let i = 0; i < 7; i++) {
    days.push({ date: addDays(weekStart, i), events: [], lanes: 1 })
  }

  for (const evt of events) {
    const idx = days.findIndex((d) => isSameDay(d.date, evt.start))
    if (idx === -1) continue
    // assign lane
    const used: number[] = []
    for (const placed of days[idx].events) {
      if (eventOverlaps(evt, placed)) used.push(placed.lane)
    }
    let lane = 0
    while (used.includes(lane)) lane++
    const withLane = { ...evt, lane, lanes: 1 }
    days[idx].events.push(withLane)
    days[idx].lanes = Math.max(days[idx].lanes, lane + 1)
  }

  // update lanes count on each event
  for (const d of days) {
    d.events = d.events.map((e) => ({ ...e, lanes: d.lanes }))
  }

  return days
}
