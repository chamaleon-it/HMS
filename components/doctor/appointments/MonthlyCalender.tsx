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

export default function MonthlyCalender({
  selectedDate,
}: {
  selectedDate: Date;
}) {
  const param = new URLSearchParams();
  param.append("date", selectedDate.toString());

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
  }>(`/appointments/calender-monthly?date=${selectedDate.toString()}`);

  

  const firstDayOFTheMonth = new Date(
    new Date(selectedDate).getFullYear(),
    new Date(selectedDate).getMonth(),
    1
  ).getDay();

  return (
    <TabsContent
      value="month"
      className="bg-white rounded-xl shadow p-4 overflow-y-auto h-full"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold">Monthly Bookings</h3>
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
          <p key={e} className="text-center p-2.5 border rounded-lg">
            {e}
          </p>
        ))}
        {Array(firstDayOFTheMonth)
          .fill(0)
          .map((_, idx) => (
            <div key={idx}></div>
          ))}
        {[...Array(31)].map((_, i) => {
          const date = `${selectedDate.getFullYear()}-${
            selectedDate.getMonth() + 1
          }-${String(i + 1).padStart(2, "0")}`;
          const events = data?.data.filter((b) => b.date === date) || [];

          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="relative border rounded-lg p-2 h-28 overflow-hidden hover:bg-gray-50 cursor-pointer"
            >
              <p className="text-xs text-gray-500">{i + 1}</p>
              {events.length > 0 && (
                <span className="absolute top-1 right-1 text-[10px] bg-gray-900 text-white rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center">
                  {events.length}
                </span>
              )}
              {events.length === 0 && (
                <div className="text-[11px] text-gray-400 mt-2">
                  No bookings
                </div>
              )}
              {events.map((ev, j) => {
                return (
                  <div
                    key={j}
                    className={cn(
                      "mt-1 text-[11px] rounded px-1 truncate bg-gray-200",
                      ev.status === "Upcoming" && "bg-blue-500",
                      ev.status === "Consulted" && "bg-gray-200",
                      ev.status === "Test" && "bg-amber-500"
                    )}
                  >
                    {ev?.patient?.name} ({ev.type}){" • " + ev.status}
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
