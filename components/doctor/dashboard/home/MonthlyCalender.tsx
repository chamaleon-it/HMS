import { TabsContent } from "@/components/ui/tabs";
import React from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { cn } from "@/lib/utils";

const colorMap = {
  Consultation: {
    chip: "bg-blue-100 text-blue-800",
    block: "bg-blue-100 text-blue-800",
    ring: "ring-blue-200",
    dot: "bg-(--color-synapse-light)",
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
    dot: "bg-(--color-synapse-dark)",
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

export default function MonthlyCalender({
  selectedDate = new Date(),
}: {
  selectedDate: Date | undefined;
}) {
  const currentDate = selectedDate ? new Date(selectedDate) : new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const yearStr = currentDate.getFullYear();
  const monthStr = String(currentDate.getMonth() + 1).padStart(2, "0");
  const dayStr = String(currentDate.getDate()).padStart(2, "0");
  const dateParam = `${yearStr}-${monthStr}-${dayStr}`;

  const { data } = useSWR<{
    message: string;
    data: {
      _id: string;
      patient: {
        name: string;
      };
      date: string;
      type: string;
      status: string;
    }[];
  }>(`/appointments/calender-monthly?date=${dateParam}`);

  return (
    <TabsContent
      value="month"
      className="bg-white rounded-xl shadow p-4 overflow-y-auto h-full"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800">Monthly Bookings</h3>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs text-gray-600">
          {Object.entries(colorMap).map(([key, v]) => (
            <div key={key} className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full ${v.dot}`}></span>
              <span>{v.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${consultedStyles.dot}`}
            ></span>
            <span>Consulted</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((e) => (
          <p key={e} className="text-center p-2.5 border rounded-lg font-medium text-xs text-slate-600">
            {e}
          </p>
        ))}
        {Array(firstDayOfWeek)
          .fill(0)
          .map((_, idx) => (
            <div key={idx}></div>
          ))}

        {[...Array(daysInMonth)].map((_, i) => {
          const monthStr = String(month + 1).padStart(2, "0");
          const dayStr = String(i + 1).padStart(2, "0");
          const targetDateStr = `${year}-${monthStr}-${dayStr}`;

          const events =
            data?.data.filter((b) => {
              if (!b.date) return false;
              const bDateStr = typeof b.date === "string" ? b.date.split("T")[0] : "";
              return bDateStr === targetDateStr;
            }) || [];

          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="relative border rounded-lg p-2 h-28 overflow-y-auto hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-600">{i + 1}</p>
                {events.length > 0 && (
                  <span className="text-[10px] bg-slate-900 text-white rounded-full min-w-5 h-4 px-1 flex items-center justify-center font-bold">
                    {events.length}
                  </span>
                )}
              </div>

              {events.length === 0 && (
                <div className="text-[11px] text-slate-400 mt-2">
                  No bookings
                </div>
              )}

              {events.map((ev, j) => {
                const patientName = ev?.patient?.name || "Patient";
                return (
                  <div
                    key={ev._id || j}
                    className={cn(
                      "mt-1 text-[11px] rounded px-1.5 py-0.5 font-medium truncate",
                      ev.status === "Upcoming" && "bg-blue-600 text-white",
                      ev.status === "Consulted" && "bg-slate-200 text-slate-700",
                      ev.status === "Test" && "bg-amber-500 text-white",
                      ev.status === "Observation" && "bg-purple-600 text-white",
                      ev.status === "Admit" && "bg-rose-600 text-white"
                    )}
                    title={`${patientName} • ${ev.status}`}
                  >
                    {patientName} • {ev.status}
                  </div>
                );
              })}
            </motion.div>
          );
        })}
      </div>
    </TabsContent>
  );
}
