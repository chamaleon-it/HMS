import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Stethoscope,
  FlaskConical,
  CalendarPlus,
  CheckCircle2,
  Clock,
  User2,
  ChevronRight,
  Trash2,
  MoreVertical,
  Megaphone,
  DoorOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Types
type ApptType = "consultation" | "lab" | "followup";
type ApptStatus = "pending" | "consulted" | "missed";

interface Appointment {
  id: string;
  name: string;
  time: string;
  type: ApptType;
  status: ApptStatus;
  avatar?: string;
  duration?: number;
}

// Generate 10 sample patients with staggered times
function generatePatients(count = 10): Appointment[] {
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
  const list: Appointment[] = [];
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

const seed: Appointment[] = generatePatients(10);

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

function classNames(...cls: (string | false | undefined)[]) {
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
  const [appts, setAppts] = useState<Appointment[]>(seed);
  const [nowMin, setNowMin] = useState<number>(getNowMinutes());
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNowMin(getNowMinutes()), 30000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const completed = appts.filter((a) => a.status === "consulted");
    const pending = appts.filter((a) => a.status === "pending");
    const sortedPending = [...pending].sort(
      (a, b) => toMinutes(a.time) - toMinutes(b.time)
    );
    const current = currentId
      ? sortedPending.find((a) => a.id === currentId)
      : sortedPending[0];
    const nextUp = current
      ? sortedPending.find((a) => a.id !== current.id)
      : sortedPending[0];
    return {
      total: appts.length,
      pending: sortedPending.length,
      completed: completed.length,
      current,
      nextUp,
    };
  }, [appts, currentId]);

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
    const el = document.getElementById(`card-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">Today&apos;s Schedule</h1>
        <button className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-2 hover:opacity-90 transition">
          <CalendarPlus className="h-4 w-4" /> Add Appointment
        </button>
      </div>

      <div className="mb-4 rounded-2xl border bg-gray-50 px-3 py-2 flex flex-wrap items-center gap-3">
        {stats.current && (
          <div className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Current: <span className="font-medium">{stats.current.name}</span>
          </div>
        )}
        {stats.nextUp && (
          <div className="inline-flex items-center gap-2 text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
            Next: <span className="font-medium">{stats.nextUp.name}</span>{" "}
            <ChevronRight className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="">
        {/* Scrollable timeline + cards */}
        <div className="relative min-h-[50vh] max-h-[100vh] overflow-y-auto pr-2">
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
                .map((a, idx) => (
                  <motion.div
                    id={`card-${a.id}`}
                    key={a.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(0.4, idx * 0.02) }}
                    className={classNames(
                      "relative pointer-events-auto rounded-2xl border p-4 pr-5 shadow-sm bg-white",
                      a.status === "consulted" && "opacity-70"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {a.avatar ? (
                        <img
                          src={a.avatar}
                          alt="avatar"
                          className={classNames(
                            "h-10 w-10 rounded-full object-cover",
                            a.status === "consulted" && "grayscale"
                          )}
                        />
                      ) : (
                        <div
                          className={classNames(
                            "h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600",
                            a.status === "consulted" && "grayscale"
                          )}
                        >
                          <User2 className="h-5 w-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <div
                            className={classNames(
                              "truncate font-medium text-gray-900",
                              a.status === "consulted" && "line-through"
                            )}
                          >
                            {a.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="shrink-0 text-sm text-gray-500">
                              {a.time}
                            </div>
                            <div className="relative shrink-0">
                              <button
                                onClick={() =>
                                  setMenuOpenId((p) =>
                                    p === a.id ? null : a.id
                                  )
                                }
                                className="inline-flex items-center justify-center rounded-full hover:bg-gray-100 p-1.5"
                                title="More"
                              >
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                              </button>
                              {menuOpenId === a.id && (
                                <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border bg-white shadow-lg p-1">
                                  <button
                                    onClick={() => {
                                      setMenuOpenId(null);
                                      setAppts((prev) =>
                                        prev.map((p) =>
                                          p.id === a.id
                                            ? { ...p, status: "pending" }
                                            : p
                                        )
                                      );
                                      callIn(a.id);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50"
                                  >
                                    Call again
                                  </button>
                                  <button
                                    onClick={() => {
                                      removeAppt(a.id);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={classNames(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                              typeMeta[a.type].bg,
                              typeMeta[a.type].text
                            )}
                          >
                            {typeMeta[a.type].icon}
                            {typeMeta[a.type].label}
                          </span>
                          {currentId === a.id && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              Current
                            </span>
                          )}
                          {a.status === "consulted" && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              <CheckCircle2 className="h-4 w-4" /> Consulted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {a.status !== "consulted" && (
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => callIn(a.id)}
                          className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <Megaphone className="h-4 w-4 mr-2" /> Call In
                        </button>
                        <button
                          onClick={() => markConsulted(a.id)}
                          className="inline-flex items-center gap-2 rounded-full bg-green-600 text-white px-4 py-2 text-sm  hover:bg-green-500  !ring-2 !ring-green-400 shadow-lg"
                        >
                          <DoorOpen className="h-4 w-4 mr-2" /> Start Consult
                        </button>
                        <button
                          onClick={() => removeAppt(a.id)}
                          className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-red-50 text-red-700 border-red-200"
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
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
