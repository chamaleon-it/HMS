import {
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ListChecks,
  Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { fromMinutes, toMinutes } from "./DayView";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";

type ApptType = "consultation" | "lab" | "followup";
type ApptStatus = "pending" | "consulted" | "missed";

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

interface Appointment {
  id: string;
  name: string;
  time: string;
  type: ApptType;
  status: ApptStatus;
  avatar?: string;
  duration?: number;
}

export default function Summery() {
  const [appts] = useState<Appointment[]>(seed);
  const stats = useMemo(() => {
    const completed = appts.filter((a) => a.status === "consulted");
    const pending = appts.filter((a) => a.status === "pending");
    const sortedPending = [...pending].sort(
      (a, b) => toMinutes(a.time) - toMinutes(b.time)
    );
    const current = sortedPending[0];
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
  }, [appts]);

  return (
    <div className="">
      <div className="rounded-2xl border shadow-sm p-5 sticky top-6 space-y-4">
        <h3 className="text-lg font-semibold">Summary</h3>
        <div className="grid grid-cols-3 gap-3">
          <Kpi
            icon={<Users className="h-4 w-4" />}
            label="Total"
            value={0}
            className="bg-gray-50"
          />
          <Kpi
            icon={<ListChecks className="h-4 w-4" />}
            label="Pending"
            value={0}
            className="bg-indigo-50"
          />
          <Kpi
            icon={<ClipboardCheck className="h-4 w-4" />}
            label="Done"
            value={0}
            className="bg-emerald-50"
          />
        </div>

        <div className="rounded-xl border p-3">
          <div className="text-sm text-gray-500 mb-1">Current</div>
          {stats.current ? (
            <div className="flex items-center justify-between">
              <div className="font-medium truncate max-w-[60%]">
                {stats.current.name}
              </div>
              <div className="text-sm text-gray-500">{stats.current.time}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">—</div>
          )}
          {stats.current && (
            <button className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm shadow hover:bg-emerald-500">
              <CheckCircle2 className="h-4 w-4" /> Mark Consulted
            </button>
          )}
        </div>

        <div className="rounded-xl border p-3">
          <div className="text-sm text-gray-500 mb-1">Next up</div>
          {stats.nextUp ? (
            <div className="flex items-center justify-between">
              <div className="font-medium truncate max-w-[60%]">
                {stats.nextUp.name}
              </div>
              <div className="text-sm text-gray-500">{stats.nextUp.time}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No pending appointments</div>
          )}
          {stats.nextUp && (
            <button className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
              <ChevronRight className="h-4 w-4" /> Call Next
            </button>
          )}
        </div>

        <Card className="p-4">
        {/* <CardHeader> */}
          <h3 className="font-semibold mb-2">Calendar</h3>
        {/* </CardHeader> */}
        {/* <CardContent> */}
          <Calendar mode="single" selected={new Date()} />
        {/* </CardContent> */}
      </Card>
      </div>
      
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={classNames("rounded-xl px-3 py-2 text-center", className)}>
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function classNames(...cls: (string | false | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}
