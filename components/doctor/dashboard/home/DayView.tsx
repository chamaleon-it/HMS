import React, {
  useMemo,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { CalendarPlus, UserPlus } from "lucide-react";
import ScheduleTabsPreview from "./ScheduleTabsPreview";
import { AppointmentType } from "./interface";
import { PatientCard } from "./PatientCard";
import useAppointmentList from "@/app/dashboard/doctor/appointments/data/useAppointmentList";

// ---- time helpers ----
export function fromMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
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

const START_MIN = 9 * 60;
const END_MIN = 18 * 60;
const STEP = 15;

export default function DailyViewTimeline({
  setOpenAppointment,
  selectedDate,
}: {
  setOpenAppointment: Dispatch<SetStateAction<"walk-in" | boolean>>;
  selectedDate: Date | undefined;
}) {
  const day = selectedDate ? new Date(selectedDate) : new Date();
  const keyDate = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate()
  ).toISOString();

  const { data: appointmentData, mutate } = useAppointmentList({ date: day });
  const appointment = useMemo(
    () => appointmentData?.data ?? [],
    [appointmentData]
  );

  const [nowMin, setNowMin] = useState(getMinutesOfDay(new Date()));
  const isToday = isSameYMD(day, new Date());

  useEffect(() => {
    const id = setInterval(() => setNowMin(getMinutesOfDay(new Date())), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    mutate();
  }, [mutate, keyDate]);

  const [currenctStatus, setCurrenctStatus] = useState<
    "Upcoming" | "Consulted" | "Observation" | "Not show"
  >("Upcoming");

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
  }, [selectedAppointments]);

  const visibleSlots = useMemo(() => {
    if (apptsBySlot.size === 0) {
      const out: number[] = [];
      for (let m = START_MIN; m <= END_MIN; m += STEP) out.push(m);
      return out;
    }
    return Array.from(apptsBySlot.keys()).sort((a, b) => a - b);
  }, [apptsBySlot]);

  const GUTTER_W = 120;
  const MIN_H = "60vh";

  // --- NOW pill row (for when appointments exist) ---
  const NowRow = () => (
    <div
      className="grid items-center relative"
      style={{
        gridTemplateColumns: `${GUTTER_W}px minmax(0,1fr)`,
      }}
    >
      <div className="sticky left-0 z-20 bg-white flex items-center justify-between px-3 py-2">
        <span className="text-[11px] invisible">.</span>
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-white border border-gray-300 px-2 py-0.5 text-[11px] font-medium text-indigo-600 shadow-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-600" />
          Now {fromMinutes(nowMin)}
        </span>
      </div>
      <div className="relative px-2 py-2">
        <div className="absolute -left-[112px] right-0 top-1/2 -translate-y-1/2 h-px bg-gray-300/70" />
      </div>
    </div>
  );

  // logic only when appointments exist
  const hasAppointments = apptsBySlot.size > 0;

  const shouldInsertNowBefore = (prev: number | null, current: number) => {
    if (!isToday || !hasAppointments) return false;
    if (prev === null && nowMin < current) return true;
    if (prev !== null && nowMin > prev && nowMin <= current) return true;
    return false;
  };

  const shouldInsertNowAfterLast =
    isToday &&
    hasAppointments &&
    nowMin > visibleSlots[visibleSlots.length - 1];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">Today&apos;s Schedule</h1>
        <div className="flex gap-5">
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 transition font-medium shadow-sm cursor-pointer"
            onClick={() => setOpenAppointment("walk-in")}
          >
            <UserPlus className="h-4 w-4" />
            Walk-in Appointment
          </button>

          {/* Regular Appointment */}
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-2 hover:bg-black/80 transition font-medium shadow-sm cursor-pointer"
            onClick={() => setOpenAppointment(true)}
          >
            <CalendarPlus className="h-4 w-4" />
            Add Appointment
          </button>
        </div>
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
          {/* if no appointments → show default timeline like before */}
          {!hasAppointments &&
            visibleSlots.map((m) => {
              const labelBold = m % 60 === 0;
              const isNowHere =
                isToday && floorToStep(nowMin, STEP) === floorToStep(m, STEP);

              return (
                <div
                  key={m}
                  className="grid items-start relative"
                  style={{
                    gridTemplateColumns: `${GUTTER_W}px minmax(0,1fr)`,
                  }}
                >
                  <div className="sticky left-0 z-10 bg-white flex items-center justify-between px-3 py-3">
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
                      <div className=" flex  items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-medium text-indigo-700 shadow-sm">
                        <p className="block h-1.5 w-1.5 rounded-full bg-indigo-600" />
                        <p className=" whitespace-nowrap flex items-center">
                          Now {fromMinutes(nowMin)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="relative px-2 py-2">
                    <div className="absolute z-10 -left-[112px] top-0 bottom-0 w-px bg-gray-300" />
                    <div className="h-10" />
                  </div>
                </div>
              );
            })}

          {hasAppointments &&
            visibleSlots.map((m, idx) => {
              const items = apptsBySlot.get(m) ?? [];
              const prev = idx === 0 ? null : visibleSlots[idx - 1];
              const labelBold = m % 60 === 0;

              return (
                <React.Fragment key={m}>
                  {shouldInsertNowBefore(prev, m) && <NowRow />}

                  <div
                    className="grid items-start relative"
                    style={{
                      gridTemplateColumns: `${GUTTER_W}px minmax(0,1fr)`,
                    }}
                  >
                    <div className="sticky left-0 z-10 bg-white flex items-center justify-between px-3 py-3">
                      <span
                        className={`text-[11px] select-none rounded-full border px-2 py-0.5 ${
                          labelBold
                            ? "font-semibold border-gray-300 text-gray-800 bg-white"
                            : "font-medium border-gray-200 text-gray-500 bg-white"
                        }`}
                      >
                        {fromMinutes(m)}
                      </span>
                    </div>

                    <div className="relative flex flex-col gap-2 px-2 py-2">
                      {items.map((a) => (
                        <div key={a._id} className="pl-4">
                          <PatientCard
                            a={a as AppointmentType}
                            mutate={mutate}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

          {shouldInsertNowAfterLast && <NowRow />}
        </div>
      </div>
    </div>
  );
}
