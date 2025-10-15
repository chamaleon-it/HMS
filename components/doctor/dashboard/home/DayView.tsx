import React, {
  useMemo,
  useState,
  useEffect,
  SetStateAction,
  Dispatch,
} from "react";
import { CalendarPlus } from "lucide-react";
import ScheduleTabsPreview from "./ScheduleTabsPreview";
import useSWR from "swr";
import { AppointmentData } from "./interface";
import { PatientCard } from "./PatientCard";
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
  selectedDate
}: {
  setOpenAppointment: Dispatch<SetStateAction<boolean>>;
  selectedDate:Date|undefined
}) {
  const { data: appointmentData, mutate } =
    useSWR<AppointmentData>(`/appointments/list?date=${selectedDate}`);

  const appointment = appointmentData?.data ?? [];

  const [nowMin, setNowMin] = useState<number>(getNowMinutes());

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
          <div className="inline-flex items-center gap-1 rounded-full bg-white border px-2 py-0.5 text-xs text-indigo-700 shadow">
            Now {fromMinutes(nowMin)}
          </div>

          <div className="flex flex-col gap-4 ml-24 mr-2">
            {selectedAppointments.map((a, idx) => (
              <PatientCard key={idx} a={a} mutate={mutate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
