export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  color?: "violet" | "green" | "blue" | "yellow"
  location?: string
  description?: string
  allDay?: boolean
  attendees?: string[]
}
