import {
  addDays,
  addMinutes,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isWithinInterval,
  setMinutes,
  startOfWeek,
} from "date-fns"

export const WEEK_START = 0 // 0 = Sunday

export function startOfWeekLocal(d: Date) {
  return startOfWeek(d, { weekStartsOn: WEEK_START as 0 })
}

export function endOfWeekLocal(d: Date) {
  return endOfWeek(d, { weekStartsOn: WEEK_START as 0 })
}

export function hoursRange(startHour = 8, endHour = 20) {
  const res: number[] = []
  for (let h = startHour; h <= endHour; h++) res.push(h)
  return res
}

export function clampToSlot(date: Date) {
  // snap to 30 minutes
  const minutes = date.getMinutes()
  const snapped = minutes < 15 ? 0 : minutes < 45 ? 30 : 60
  const base = setMinutes(date, snapped === 60 ? 0 : snapped)
  return snapped === 60 ? addMinutes(base, 60) : base
}

export function fmtDayHeader(d: Date) {
  return {
    dow: format(d, "EEE"),
    date: format(d, "d"),
    isToday: isSameDay(d, new Date()),
  }
}

export function addDaysSafe(d: Date, days: number) {
  return addDays(d, days)
}

export function eventOverlaps(a: { start: Date; end: Date }, b: { start: Date; end: Date }) {
  return (
    isWithinInterval(a.start, { start: b.start, end: b.end }) ||
    isWithinInterval(a.end, { start: b.start, end: b.end }) ||
    isWithinInterval(b.start, { start: a.start, end: a.end }) ||
    isWithinInterval(b.end, { start: a.start, end: a.end }) ||
    (isBefore(a.start, b.start) && isBefore(b.end, a.end))
  )
}
