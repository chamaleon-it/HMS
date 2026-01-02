import { TabsContent } from "@/components/ui/tabs";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";

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

const consultedStyles = {
  container: "opacity-60 grayscale",
  chip: "bg-gray-200 text-gray-700",
  dot: "bg-gray-400",
  badge:
    "inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200",
} as const;

// ==== Config ====
const START_HOUR = 8;
const END_HOUR = 21;
const BLOCK_MINUTES = 15; // grid step
const ROW_HEIGHT_REM = 1.25; // each 15 min = 1.25rem → 1h = 5rem
const DEFAULT_DURATION_MIN = 60;

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

type ApiStatus =
  | "Upcoming"
  | "Consulted"
  | "Observation"
  | "Completed"
  | "Not show";
type ApiType = keyof typeof colorMap;

type WeekItem = {
  _id: string;
  date: string | Date;
  endDate?: string | Date;
  type: ApiType;
  status: ApiStatus;
  patient: { name: string; _id: string };
};

export default function WeeklyCalender({
  selectedDate,
}: {
  selectedDate: Date | undefined;
}) {
  const { data: weeklyData } = useSWR<{ message: string; data: WeekItem[] }>(
    `/appointments/calender/weekly?date=${selectedDate}`
  );
  const weekItems = useMemo(() => weeklyData?.data ?? [], [weeklyData]);



  const { eventsInWeek } = useMemo(() => {
    const ws = startOfWeekSunday(selectedDate);
    const we = endOfWeekSunday(selectedDate);
    const normalized = weekItems
      ?.map((it) => {
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

  return (
    <TabsContent
      value="week"
      className="bg-white rounded-xl shadow p-4 overflow-auto h-full min-h-[50vh]"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">This Week</h3>
      </div>

      <div className="min-w-[960px]">
        {/* Header row */}
        <div className="grid grid-cols-[64px_repeat(7,1fr)] text-xs text-gray-500 px-2">
          <div></div>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]?.map((d, i) => (
            <div key={i} className="text-center font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-[64px_repeat(7,1fr)]">
          {/* Time labels */}
          <div className="flex flex-col">
            {[...Array(ROWS)]?.map((_, i) =>
              i % 4 === 0 ? (
                <div
                  key={i}
                  className="px-2 text-[10px] text-gray-500 flex items-start justify-end pt-1 border-t border-gray-300"
                  style={{ height: `${ROW_HEIGHT_REM}rem` }}
                >
                  {START_HOUR + i / 4}:00
                </div>
              ) : (
                <div
                  key={i}
                  className="border-t border-gray-100"
                  style={{ height: `${ROW_HEIGHT_REM}rem` }}
                />
              )
            )}
          </div>

          {/* Days columns */}
          {[...Array(7)]?.map((_, col) => (
            <div key={col} className="border-l border-gray-200">
              {[...Array(ROWS)]?.map((_, i) => (
                <div
                  key={i}
                  className={
                    i % 4 === 0
                      ? "border-t border-gray-300"
                      : "border-t border-gray-100"
                  }
                  style={{ height: `${ROW_HEIGHT_REM}rem` }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Events */}
        <div
          className="pointer-events-none grid grid-cols-[64px_repeat(7,1fr)]"
          style={{
            marginTop: `calc(-1 * ${ROWS} * ${ROW_HEIGHT_REM}rem)`,
          }}
        >
          <div></div>
          {[...Array(7)]?.map((_, colIdx) => {
            const dayEvents = eventsInWeek.filter(
              (e) => dayToCol(e.start) === colIdx
            );
            return (
              <div key={colIdx} className="relative">
                {dayEvents?.map((e, i) => {
                  const { clampedStart, heightMin } = clampTopAndHeight(
                    e.start,
                    e.end
                  );
                  const topRem =
                    (clampedStart / BLOCK_MINUTES) * ROW_HEIGHT_REM;
                  const heightRem =
                    (heightMin / BLOCK_MINUTES) * ROW_HEIGHT_REM;
                  const typeStyles =
                    colorMap[e.type] ?? colorMap["Consultation"];
                  const isConsulted =
                    e.status === "Consulted" || e.status === "Completed";
                  const isNotShow = e.status === "Not show";
                  const isUpcoming =
                    e.status === "Upcoming" || e.status === "Observation";

                  return (
                    <motion.div
                      key={e._id + i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className={[
                        "absolute left-2 right-2 rounded-lg text-xs p-2 shadow ring-1 duration-200 hover:z-50 hover:scale-[1.02]",
                        typeStyles.block,
                        typeStyles.ring,
                        isConsulted ? "bg-sky-100" : "",
                        isNotShow ? "bg-red-100" : "",
                        isUpcoming ? "bg-gray-100" : "",
                        "pointer-events-auto",
                      ].join(" ")}
                      style={{
                        top: `${topRem}rem`,
                        height: `${heightRem}rem`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${(isConsulted && consultedStyles.dot) ||
                            (isNotShow && "bg-red-500") ||
                            typeStyles.dot
                            }`}
                        />
                        <span className="font-medium truncate">
                          {e.patient?.name ?? "—"}
                        </span>
                      </div>
                      <div className="opacity-70">
                        {fmtTime(e.start)} –{" "}
                        {fmtTime(new Date(e.start.getTime() + 15 * 60 * 1000))}
                      </div>
                      {e.status && (
                        <div className="mt-1">
                          <span className={consultedStyles.badge}>
                            {e.status}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </TabsContent>
  );
}
