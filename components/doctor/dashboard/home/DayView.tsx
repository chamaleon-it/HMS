import React, { useMemo, useState, useEffect } from "react";
import {
  Stethoscope,
  FlaskConical,
  CalendarPlus,
  
  Clock,
  
  
} from "lucide-react";
import { useRouter } from "next/navigation";
import Appointment from "./Appointment";
import ScheduleTabsPreview from "./ScheduleTabsPreview";

// Types
type ApptType = "consultation" | "lab" | "followup";
type ApptStatus = "pending" | "consulted" | "missed";

export interface AppointmentType {
  id: string;
  name: string;
  time: string;
  type: ApptType;
  status: ApptStatus;
  avatar?: string;
  duration?: number;
}

// Generate 10 sample patients with staggered times
function generatePatients(count = 10): AppointmentType[] {
  const names = [
    "John Mathew",
    "Aisha Kareem",
    "Ravi Kumar",
    "Neha Sharma",
    "Arjun Reddy",
    "Fatima Noor",
    "Kiran Das",
    "Lina Paul",
    "Vivek Menon",
    "Sana Iqbal",
    "Rohit Nair",
    "Meera George",
    "Aditya Varma",
    "Priya S",
    "Sameer Ali",
  ];
  const types: ApptType[] = ["consultation", "lab", "followup"];
  let startMin = 9 * 60; // start at 09:00
  const list: AppointmentType[] = [];
  for (let i = 0; i < count; i++) {
    const dur = 15 + (i % 3) * 5; // 15–25 min durations
    list.push({
      id: `${i + 1}`,
      name: names[i % names.length],
      time: fromMinutes(startMin),
      type: types[i % types.length],
      status: i === 0 ? "consulted" : "pending",
      duration: dur,
    });
    startMin += dur;
  }
  return list;
}

const seed: AppointmentType[] = generatePatients(10);

const typeMeta: Record<
  ApptType,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  consultation: {
    label: "Consultation",
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: <Stethoscope className="h-4 w-4" />,
  },
  lab: {
    label: "Lab Test",
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: <FlaskConical className="h-4 w-4" />,
  },
  followup: {
    label: "Follow-up",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: <Clock className="h-4 w-4" />,
  },
};

export function classNames(...cls: (string | false | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}
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

export default function DailyViewTimeline() {
  const router = useRouter();
  const [appts, setAppts] = useState<AppointmentType[]>(seed);
  const [nowMin, setNowMin] = useState<number>(getNowMinutes());
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNowMin(getNowMinutes()), 30000);
    return () => clearInterval(id);
  }, []);


  const HOUR_ROW_PX = 80;
  const times = useMemo(() => {
    if (!appts.length) return ["09:00"];
    const sorted = [...appts].sort(
      (a, b) => toMinutes(a.time) - toMinutes(b.time)
    );
    const start = Math.max(0, toMinutes(sorted[0].time) - 60);
    const end = Math.min(
      24 * 60,
      toMinutes(sorted[sorted.length - 1].time) + 60
    );
    const out: string[] = [];
    for (let t = start; t <= end; t += 60) out.push(fromMinutes(t));
    return out;
  }, [appts]);
  const startMin = times.length ? toMinutes(times[0]) : 0;
  const endMin = times.length ? toMinutes(times[times.length - 1]) : 0;
  const containerH = Math.max(1, times.length * HOUR_ROW_PX);
  const nowOffsetPx = Math.max(
    0,
    Math.min(
      containerH,
      ((nowMin - startMin) / Math.max(1, endMin - startMin)) * containerH
    )
  );

  const markConsulted = (id: string) => {
    setAppts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "consulted" } : a))
    );
    setCurrentId((prev) => (prev === id ? null : prev));
    router.push("/consulting");
  };
  const removeAppt = (id: string) => {
    setAppts((prev) => prev.filter((a) => a.id !== id));
    setCurrentId((prev) => (prev === id ? null : prev));
    setMenuOpenId((prev) => (prev === id ? null : prev));
  };

  const callIn = (id: string) => {
    setCurrentId(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">Today&apos;s Schedule</h1>
        <button className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-2 hover:opacity-90 transition">
          <CalendarPlus className="h-4 w-4" /> Add Appointment
        </button>
      </div>

<ScheduleTabsPreview />

      <div className="">
        {/* Scrollable timeline + cards */}
        <div className="relative min-h-[60vh] max-h-[100vh] overflow-y-auto pr-2">
          {/* Slim vertical line + progress */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gray-200" />
          <div
            className="absolute left-6 md:left-8 top-0 w-px bg-indigo-500"
            style={{ height: nowOffsetPx }}
          />
          {/* Now chip */}
          <div
            className="absolute left-3 md:left-5"
            style={{ top: nowOffsetPx }}
          >
            <div className="inline-flex items-center gap-1 rounded-full bg-white border px-2 py-0.5 text-xs text-indigo-700 shadow">
              Now {fromMinutes(nowMin)}
            </div>
          </div>

          {/* Hour ticks */}
          <ul className="space-y-8">
            {times.map((t, idx) => (
              <li key={t} className="relative flex gap-6 md:gap-8">
                <div
                  className={classNames(
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
          </ul>

          {/* Cards overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="flex flex-col gap-4 ml-24 mr-2">
              {appts
                .sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
                .map((a, idx) => (<Appointment key={idx} a={a} callIn={callIn} currentId={currentId} idx={idx} markConsulted={markConsulted} menuOpenId={menuOpenId} removeAppt={removeAppt} setAppts={setAppts} setMenuOpenId={setMenuOpenId} typeMeta={typeMeta}/>))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Dev Tests (run in browser console) ---
if (typeof window !== "undefined") {
  try {
    console.assert(toMinutes("00:00") === 0, "toMinutes midnight");
    console.assert(toMinutes("23:59") === 23 * 60 + 59, "toMinutes endOfDay");
    const rt = fromMinutes(toMinutes("09:30"));
    console.assert(rt.includes(":30"), "fromMinutes roundtrip");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Dev tests failed:", e);
  }
}
