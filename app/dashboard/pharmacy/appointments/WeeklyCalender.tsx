import { TabsContent } from "@/components/ui/tabs";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import {
  toMinutes,
} from "@/lib/fDateAndTime";

const colorMap = {
  Consultation: {
    chip: "bg-blue-100 text-blue-800",
    block: "bg-blue-100 text-blue-800",
    ring: "ring-blue-200",
    dot: "bg-blue-500",
    label: "Consultation",
  },
  "Lab Test": {
    chip: "bg-amber-100 text-amber-800",
    block: "bg-amber-100 text-amber-800",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
    label: "Lab Test",
  },
  "Follow-up": {
    chip: "bg-emerald-100 text-emerald-800",
    block: "bg-emerald-100 text-emerald-800",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
    label: "Follow-up",
  },
} as const;

// Status-based coloring logic
const getStatusStyles = (status: ApiStatus) => {
  switch (status) {
    case "Upcoming": return "bg-indigo-50 border-indigo-200 text-indigo-900";
    case "Consulted":
    case "Completed": return "bg-emerald-50 border-emerald-200 text-emerald-900";
    case "Observation": return "bg-sky-50 border-sky-200 text-sky-900";
    case "Not show": return "bg-amber-50 border-amber-200 text-amber-900";
    case "Admit":
    case "Test": return "bg-rose-50 border-rose-200 text-rose-900";
    default: return "bg-white border-zinc-200 text-zinc-900";
  }
}

const getStatusDot = (status: ApiStatus) => {
  switch (status) {
    case "Upcoming": return "bg-indigo-500";
    case "Consulted":
    case "Completed": return "bg-emerald-500";
    case "Observation": return "bg-sky-500";
    case "Not show": return "bg-amber-500";
    case "Admit":
    case "Test": return "bg-rose-500";
    default: return "bg-zinc-400";
  }
}




// ==== Config ====
const START_HOUR = 8;
const END_HOUR = 21;
const BLOCK_MINUTES = 15; // grid step
const ROW_HEIGHT_REM = 1.25; // Compact height
const DEFAULT_DURATION_MIN = 30; // Default to 30 mins for better visual if missing

const ROWS = ((END_HOUR - START_HOUR) * 60) / BLOCK_MINUTES;

// ==== Helpers ====
function startOfWeekSunday(d = new Date()) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}
function endOfWeekSunday(d = new Date()) {
  const start = startOfWeekSunday(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return end;
}
function fmtTime(date: Date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const suffix = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${m.toString().padStart(2, "0")} ${suffix}`;
}

const getRoundForTime = (
  time: string,
  rounds?: { label: string; start: string; end: string }[]
) => {
  if (!rounds?.length) return null;
  const tm = toMinutes(time);
  return (
    rounds.find((r) => tm >= toMinutes(r.start) && tm <= toMinutes(r.end)) ||
    null
  );
};

type ApiStatus =
  | "Upcoming"
  | "Consulted"
  | "Observation"
  | "Not show"
  | "Completed"
  | "Admit"
  | "Test";

type ApiType = keyof typeof colorMap | "New" | "Follow up"; // Merging types

type WeekItem = {
  _id: string;
  date: string | Date;
  endDate?: string | Date;
  type: ApiType;
  status: ApiStatus;
  patient: { name: string; _id: string; details?: any };
  visitCount?: number;
  isNew?: boolean; // Or determine from visitCount
};

export default function WeeklyCalender({
  selectedDate,
  doctorId,
  doctorName,
  onSelectAppointment,
  isPanelOpen = false
}: {
  selectedDate: Date | undefined;
  doctorId?: string;
  doctorName?: string;
  onSelectAppointment?: (apt: WeekItem) => void;
  isPanelOpen?: boolean;
}) {
  const startOfWeek = startOfWeekSunday(selectedDate);
  const { data } = useSWR<{ message: string; data: WeekItem[] }>(
    `/appointments/calender/weekly?startOfWeek=${startOfWeek.toISOString()}${doctorId ? `&doctor=${doctorId}` : ""
    }`
  );
  const weekItems = useMemo(() => data?.data ?? [], [data]);

  const { data: availabilityData } = useSWR<{
    message: string;
    data: {
      startDate: Date;
      endDate: Date;
      startTime: string;
      endTime: string;
      days: string[];
      rounds: { label: string; start: string; end: string }[];
    };
  }>(doctorId ? `/users/doctor_availability/${doctorId}` : null);

  const availability = availabilityData?.data;

  const { eventsInWeek } = useMemo(() => {
    const ws = startOfWeekSunday(selectedDate);
    const we = endOfWeekSunday(selectedDate);
    const normalized = weekItems
      .map((it) => {
        const start = new Date(it.date);
        const end = it.endDate
          ? new Date(it.endDate)
          : new Date(start.getTime() + DEFAULT_DURATION_MIN * 60_000);
        return { ...it, start, end };
      })
      .filter((it) => it.start >= ws && it.start < we)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    return { weekStart: ws, eventsInWeek: normalized };
  }, [weekItems, selectedDate]);

  const dayToCol = (date: Date) => date.getDay();
  const minutesSinceStart = (date: Date) =>
    (date.getHours() - START_HOUR) * 60 + date.getMinutes();

  const clampTopAndHeight = (start: Date, end: Date) => {
    const startMin = minutesSinceStart(start);
    const endMin = minutesSinceStart(end);
    const gridMax = (END_HOUR - START_HOUR) * 60;
    const clampedStart = Math.max(0, Math.min(startMin, gridMax));
    const clampedEnd = Math.max(0, Math.min(endMin, gridMax));
    const heightMin = Math.max(
      15,
      clampedEnd - clampedStart || DEFAULT_DURATION_MIN
    );
    return { clampedStart, heightMin };
  };

  // Pre-calculate grid slots status (working/not-working)
  const isSlotAvailable = (dayIndex: number, timeStr: string) => {
    if (!availability) return true; // Default to white if no info? Or grey? Let's say white.

    // 1. Check Day
    // availability.days e.g. ["Mon", "Tue"]
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
    if (!availability.days.includes(dayName)) return false;

    // 2. Check Time Range
    const slotMins = toMinutes(timeStr);
    const startMins = toMinutes(availability.startTime);
    const endMins = toMinutes(availability.endTime);
    if (slotMins < startMins || slotMins >= endMins) return false;

    // 3. Check Rounds
    if (getRoundForTime(timeStr, availability.rounds)) return false;

    return true;
  };

  // Helper to check if a column date is today
  const isToday = (dayIndex: number) => {
    const now = new Date();
    // startOfWeekSunday gives us Sunday.
    const startOfWeek = startOfWeekSunday(selectedDate);
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(targetDate.getDate() + dayIndex);
    return now.toDateString() === targetDate.toDateString();
  }

  // Helper for past dates
  const isPastDate = (dayIndex: number) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const startOfWeek = startOfWeekSunday(selectedDate);
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(targetDate.getDate() + dayIndex);
    targetDate.setHours(0, 0, 0, 0);

    return targetDate < now;
  }

  // Helper to get date number for header
  const getDateNumber = (dayIndex: number) => {
    const startOfWeek = startOfWeekSunday(selectedDate);
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(targetDate.getDate() + dayIndex);
    return targetDate.getDate();
  }

  // Current Time Line Position
  const [currentTimeMinutes, setCurrentTimeMinutes] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Calculate minutes since START_HOUR
    const now = new Date();
    const currentMinutes = (now.getHours() * 60) + now.getMinutes();
    const startMinutes = START_HOUR * 60;

    if (currentMinutes >= startMinutes && currentMinutes <= END_HOUR * 60) {
      setCurrentTimeMinutes(currentMinutes - startMinutes);
    } else {
      setCurrentTimeMinutes(null);
    }

    // Update every minute
    const interval = setInterval(() => {
      const n = new Date();
      const cm = (n.getHours() * 60) + n.getMinutes();
      if (cm >= startMinutes && cm <= END_HOUR * 60) {
        setCurrentTimeMinutes(cm - startMinutes);
      } else {
        setCurrentTimeMinutes(null);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TabsContent
      value="week"
      className={`bg-white shadow-sm border border-gray-100 p-0 overflow-hidden h-full flex flex-col transition-all duration-300 ${isPanelOpen ? "rounded-r-2xl border-l-0" : "rounded-2xl"}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-30">
        <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-range"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /><path d="M17 14h-6" /><path d="M13 18H7" /><path d="M7 14h.01" /><path d="M17 18h.01" /></svg>
          </span>
          Weekly Schedule
          {doctorName && <span className="text-gray-400 font-normal text-sm ml-1">for {doctorName}</span>}
        </h3>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> Upcoming</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Consulted</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div> Observation</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Not show</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Admit/Test</div>
          <div className="flex items-center gap-1.5 h-4 px-2 rounded-full bg-red-50 text-[9px] text-red-600 border border-red-100 uppercase">Live</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        <div className="min-w-[900px]">
          {/* Header row */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] text-sm text-gray-500 sticky top-0 bg-white/95 backdrop-blur-sm z-20 border-b border-gray-200 shadow-xs">
            <div className="border-r border-gray-100 p-3 flex items-center justify-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
              TIME
            </div>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => {
              const today = isToday(i);
              const past = isPastDate(i);
              return (
                <div key={i} className={`flex flex-col items-center justify-center py-3 border-r border-gray-100 ${today ? 'bg-blue-50/40' : past ? 'bg-gray-50/50 opacity-60' : ''}`}>
                  <div className={`text-xs font-bold uppercase mb-1 ${today ? 'text-blue-600' : 'text-gray-400'}`}>{d}</div>
                  <div className={`text-xl font-bold w-10 h-10 flex items-center justify-center rounded-full transition-all ${today ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-110' : 'text-gray-700'}`}>
                    {getDateNumber(i)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
            {/* Time labels */}
            <div className="flex flex-col border-r border-gray-200 bg-gray-50/30">
              {[...Array(ROWS)].map((_, i) => {
                const minutes = i * BLOCK_MINUTES;
                const h = Math.floor(minutes / 60) + START_HOUR;
                const m = minutes % 60;
                const isHour = i % 4 === 0;
                const label = isHour ? `${h > 12 ? h - 12 : h} ${h >= 12 ? 'PM' : 'AM'}` : null;

                return (
                  <div
                    key={i}
                    className="pr-2 text-[10px] sm:text-[11px] text-gray-400 font-medium flex items-start justify-end pt-1 relative"
                    style={{ height: `${ROW_HEIGHT_REM}rem` }}
                  >
                    {label && <span className="-translate-y-1/2">{label}</span>}
                    {/* Tick mark */}
                    <div className="absolute right-0 top-0 w-1.5 border-t border-gray-300"></div>
                  </div>
                );
              })}
            </div>

            {/* Days columns */}
            {[...Array(7)].map((_, col) => {
              const today = isToday(col);
              const past = isPastDate(col);

              return (
                <div key={col} className={`border-r border-gray-100 relative ${today ? 'bg-blue-50/5' : past ? 'bg-gray-50/30' : ''}`}>
                  {[...Array(ROWS)].map((_, i) => {
                    const minutes = i * BLOCK_MINUTES;
                    const h = Math.floor(minutes / 60) + START_HOUR;
                    const m = minutes % 60;
                    const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

                    const available = isSlotAvailable(col, timeStr);
                    const isUnavailable = !available;

                    return (
                      <div
                        key={i}
                        className={`border-b border-gray-100/50 w-full transition-colors duration-200`}
                        style={{
                          height: `${ROW_HEIGHT_REM}rem`,
                          // Striped pattern for unavailable
                          backgroundImage: isUnavailable ? 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 50%, #f3f4f6 50%, #f3f4f6 75%, transparent 75%, transparent)' : undefined,
                          backgroundSize: '6px 6px',
                          backgroundColor: isUnavailable ? '#f9fafb' : (past ? '#fafafa' : 'white'),
                          opacity: past && !isUnavailable ? 0.7 : 1
                        }}
                      />
                    );
                  })}

                  {/* Day Hover Effect Overlay - Optional */}
                  {!past && <div className="absolute inset-0 hover:bg-black/0.5 pointer-events-none transition-colors" />}

                  {/* Current Time Line - Only render if today */}
                  {today && currentTimeMinutes !== null && (
                    <div
                      className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none flex items-center"
                      style={{ top: `${(currentTimeMinutes / BLOCK_MINUTES) * ROW_HEIGHT_REM}rem` }}
                    >
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1.5 shadow-md shadow-red-200"></div>
                      <div className="flex-1 bg-linear-to-r from-red-500/20 to-transparent h-px"></div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Events Layer - Absolute over the grid */}
            <div className="absolute top-0 left-0 w-full h-full grid grid-cols-[60px_repeat(7,1fr)] pointer-events-none">
              <div></div> {/* Time col spacer */}
              {[...Array(7)].map((_, colIdx) => {
                const dayEvents = eventsInWeek.filter(
                  (e) => dayToCol(e.start) === colIdx
                );

                const past = isPastDate(colIdx);

                return (
                  <div key={colIdx} className={`relative h-full ${past ? 'opacity-60 saturate-50' : ''}`}>
                    {dayEvents.map((e, i) => {
                      const { clampedStart, heightMin } = clampTopAndHeight(
                        e.start,
                        e.end
                      );
                      const topRem =
                        (clampedStart / BLOCK_MINUTES) * ROW_HEIGHT_REM;
                      const heightRem =
                        (heightMin / BLOCK_MINUTES) * ROW_HEIGHT_REM;

                      const statusStyles = getStatusStyles(e.status);
                      const dotClass = getStatusDot(e.status);
                      const isNew = e.visitCount === 1 || e.type === "New";

                      return (
                        <motion.div
                          key={e._id + i}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onSelectAppointment?.(e);
                          }}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: i * 0.05 }}
                          className={[
                            "absolute left-1 right-1 rounded sm:rounded-md text-[11px] p-1.5 leading-tight cursor-pointer transition-all duration-200 group overflow-hidden z-10 border shadow-sm hover:z-50",
                            statusStyles,
                            !past ? "hover:shadow-md hover:scale-[1.02]" : "cursor-default",
                            "pointer-events-auto flex flex-col justify-start",
                          ].join(" ")}
                          style={{
                            top: `${topRem}rem`,
                            height: `${heightRem}rem`,
                          }}
                        >
                          <div className="flex items-center justify-between gap-1 w-full relative">
                            {/* Status line */}
                            <div className={`absolute -left-1.5 top-0 bottom-0 w-0.5 rounded-l ${dotClass}`}></div>

                            {/* Name and N badge */}
                            <div className="flex items-center gap-1 overflow-hidden">
                              {isNew && (
                                <span className="shrink-0 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full flex items-center justify-center h-4 min-w-4" title="New Patient">N</span>
                              )}
                              <span className="font-bold truncate text-[10px] sm:text-xs text-gray-900">
                                {e.patient?.name ?? "—"}
                              </span>
                            </div>

                            {/* Visit Count Badge - Right aligned */}
                            {(e.visitCount ?? 0) > 0 && (
                              <span className="shrink-0 bg-gray-100 text-gray-500 text-[9px] px-1 rounded-sm border border-gray-200" title="Visit Count">
                                {e.visitCount}
                              </span>
                            )}
                          </div>

                          {/* Time */}
                          {heightRem > 2.0 && (
                            <div className="flex items-center gap-1 opacity-70 text-[9px] font-medium tracking-tight mt-0.5">
                              {fmtTime(e.start)}
                            </div>
                          )}

                          {/* Extra info if tall enough */}
                          {heightRem > 3.5 && (
                            <div className="mt-auto pt-1 border-t border-black/5 flex flex-wrap gap-1">
                              <span className="text-[9px] opacity-80 truncate w-full font-medium">{e.status}</span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
