import React, {
  useMemo,
  useState,
  useEffect,
  SetStateAction,
  Dispatch,
} from "react";
import { CalendarPlus } from "lucide-react";
import Appointment from "./Appointment";
import ScheduleTabsPreview from "./ScheduleTabsPreview";
import useSWR from "swr";
import { AppointmentData } from "./interface";
// import { cn } from "@/lib/utils";

export function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
export function fromMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
function getNowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export default function DailyViewTimeline({
  setOpenAppointment,
}: {
  setOpenAppointment: Dispatch<SetStateAction<boolean>>;
}) {
  const { data: appointmentData, mutate } =
    useSWR<AppointmentData>("/appointments/list");

  const appointment = appointmentData?.data ?? [];

  const [nowMin, setNowMin] = useState<number>(getNowMinutes());
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNowMin(getNowMinutes()), 30000);
    return () => clearInterval(id);
  }, []);

  // const HOUR_ROW_PX = 80;
  // const times = useMemo(() => {
  //   if (appointment.length < 2) {
  //     return [];
  //   }
  //   return ["09:00"];
  // }, []);
  // const startMin = times.length ? toMinutes(times[0]) : 0;
  // const endMin = times.length ? toMinutes(times[times.length - 1]) : 0;
  // const containerH = Math.max(1, times.length * HOUR_ROW_PX);
  // const nowOffsetPx = Math.max(
  //   0,
  //   Math.min(
  //     containerH,
  //     ((nowMin - startMin) / Math.max(1, endMin - startMin)) * containerH
  //   )
  // );

  useEffect(() => {
    mutate();
  }, [mutate]);

  const [currenctStatus, setCurrenctStatus] = useState<
    "Upcoming" | "Consulted" | "Observation" | "Not show"
  >("Upcoming");

  const selectedAppointments = useMemo(
    () => appointment.filter((e) => e.status === currenctStatus),
    [currenctStatus, appointment]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
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

      <div className="">
        <div className="relative min-h-[60vh] max-h-[100vh] overflow-y-auto pr-2">
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gray-200" />
          <div className="absolute left-6 md:left-8 top-0 w-px bg-indigo-500" />

          <div className="absolute left-3 md:left-5">
            <div className="inline-flex items-center gap-1 rounded-full bg-white border px-2 py-0.5 text-xs text-indigo-700 shadow">
              Now {fromMinutes(nowMin)}
            </div>
          </div>

          {/* <ul className="space-y-8">
            {times.map((t, idx) => (
              <li key={t} className="relative flex gap-6 md:gap-8">
                <div
                  className={cn(
                    "w-16 text-sm pt-1 text-right pr-2 select-none",
                    idx === Math.floor(nowOffsetPx / HOUR_ROW_PX)
                      ? "text-indigo-700 font-semibold"
                      : "text-gray-500"
                  )}
                >
                  {t}
                </div>
                <div className="pt-1" />
              </li>
            ))}
          </ul> */}

          <div className="absolute inset-0 pointer-events-none">
            <div className="flex flex-col gap-4 ml-24 mr-2">
              {selectedAppointments.map((a, idx) => (
                <Appointment
                  key={idx}
                  a={a}
                  idx={idx}
                  menuOpenId={menuOpenId}
                  setMenuOpenId={setMenuOpenId}
                  mutate={mutate}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
