import React, {
  useMemo,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { CalendarPlus } from "lucide-react";
import ScheduleTabsPreview from "./ScheduleTabsPreview";
import useSWR from "swr";
import { AppointmentData, AppointmentType } from "./interface";
import { PatientCard } from "./PatientCard";

// ---- time helpers ----
export function fromMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
function getNowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
function getMinutesOfDay(d: Date | string) {
  const dt = new Date(d);
  return dt.getHours() * 60 + dt.getMinutes();
}
function isSameYMD(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function floorToStep(mins: number, step = 15) {
  return Math.floor(mins / step) * step;
}

export default function DailyViewTimeline({
  setOpenAppointment,
  selectedDate,
}: {
  setOpenAppointment: Dispatch<SetStateAction<boolean>>;
  selectedDate: Date | undefined;
}) {
  const day = selectedDate ? new Date(selectedDate) : new Date();
  const keyDate = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate()
  ).toISOString();

  const { data: appointmentData, mutate } = useSWR<AppointmentData>(
    `/appointments/list?date=${encodeURIComponent(keyDate)}`
  );
  const appointment = appointmentData?.data ?? [];

  const [nowMin, setNowMin] = useState(getNowMinutes());
  const isToday = isSameYMD(day, new Date());

  useEffect(() => {
    const id = setInterval(() => setNowMin(getNowMinutes()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    mutate();
  }, [mutate, keyDate]);

  const [currenctStatus, setCurrenctStatus] = useState<
    "Upcoming" | "Consulted" | "Observation" | "Not show"
  >("Upcoming");

  // ---- working hours ----
  const START_MIN = 9 * 60; // 09:00
  const END_MIN = 18 * 60; // 18:00
  const STEP = 15;

  const selectedAppointments = useMemo(
    () => appointment.filter((e) => e.status === currenctStatus),
    [appointment, currenctStatus]
  );

  const apptsBySlot = useMemo(() => {
    const map = new Map<number, AppointmentType[]>();
    for (const a of selectedAppointments as unknown as AppointmentType[]) {
      const minute = getMinutesOfDay(a.date);
      const slot = floorToStep(minute, STEP);
      if (slot < START_MIN || slot > END_MIN) continue;
      if (!map.has(slot)) map.set(slot, []);
      map.get(slot)!.push(a);
    }
    return map;
  }, [selectedAppointments, END_MIN, START_MIN]);

  const visibleSlots = useMemo(() => {
    if (apptsBySlot.size === 0) {
      const out: number[] = [];
      for (let m = START_MIN; m <= END_MIN; m += STEP) out.push(m);
      return out;
    }
    return Array.from(apptsBySlot.keys()).sort((a, b) => a - b);
  }, [apptsBySlot, END_MIN, START_MIN]);

  const nowSlot = isToday ? floorToStep(nowMin, STEP) : null;
  const showNowPill =
    isToday && nowSlot !== null && visibleSlots.includes(nowSlot);

  const GUTTER_W = 120;
  const MIN_H = "60vh";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">Today&apos;s Schedule</h1>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-2 hover:opacity-90 transition cursor-pointer"
          onClick={() => setOpenAppointment(true)}
        >
          <CalendarPlus className="h-4 w-4" /> Add Appointment
        </button>
      </div>

      <ScheduleTabsPreview
        currenctStatus={currenctStatus}
        setCurrenctStatus={setCurrenctStatus}
      />

      <div className="relative mt-2 rounded-xl bg-white">
        <div
          className="overflow-y-auto relative"
          style={{ minHeight: MIN_H, maxHeight: "75vh" }}
        >
          {visibleSlots.map((m) => {
            const items = apptsBySlot.get(m) ?? [];
            const labelBold = m % 60 === 0;
            const isNowHere = showNowPill && m === nowSlot;

            return (
              <div
                key={m}
                className="grid items-start relative"
                style={{ gridTemplateColumns: `${currenctStatus !== "Upcoming" ? 0 : GUTTER_W}px minmax(0,1fr)` }}
              >
               {currenctStatus === "Upcoming" && <div className="sticky left-0 z-10 bg-white flex items-center justify-between px-3 py-3">
                  <span
                    className={`text-[11px] select-none ${
                      labelBold
                        ? "font-semibold text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {fromMinutes(m)}
                  </span>

                  {isNowHere && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-medium text-indigo-700 shadow-sm">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      Now {fromMinutes(nowMin)}
                    </span>
                  )}
                </div>}
                {currenctStatus !== "Upcoming" && <div className=""></div>}

                <div className="relative flex flex-col gap-2 px-2 py-2 ">
                  {currenctStatus === "Upcoming" && <div className="absolute z-10 -left-[112px] top-0 bottom-0 w-px bg-gray-300" />}
                  {items.length > 0 ? (
                    items.map((a) => (
                      <div key={a._id} className="pl-4">
                        <PatientCard a={a as AppointmentType} mutate={mutate} />
                      </div>
                    ))
                  ) : (
                    <div className="h-10" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
