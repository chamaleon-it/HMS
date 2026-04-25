"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";

import List from "./List";
import Filter, { STATUSES } from "./Filter";
import useAppointmentList from "./data/useAppointmentList";

import { motion } from "framer-motion";

import LabHeader from "@/components/dashboard/lab/LabHeader";
export default function AppointmentPage() {
  const [query, setQuery] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<string[]>(["Upcoming"]);
  const [date, setDate] = useState<Date>(new Date());
  const [activeDate, setActiveDate] = useState<"Today" | "7 days" | "30 days" | "Custom">("Today");
  const currentStatus = activeStatuses.length === 0 ? "All" : activeStatuses[0];

  const { data, mutate, isLoading } = useAppointmentList({ activeStatuses, date, activeDate });

  return (
    <AppShell>
      <div className="p-0 sm:p-5 min-h-[calc(100vh-80px)] overflow-hidden flex flex-col">
        <div className="shrink-0 mb-4 px-4 sm:px-0 print:hidden">
          <LabHeader
            title="Appointments"
            subtitle="Manage customer appointments and schedules"
          />
        </div>

        <div className="shrink-0 mb-2.5 px-4 sm:px-0 print:hidden">
          <Filter
            query={query}
            setQuery={setQuery}
            date={date}
            setDate={setDate}
            activeDate={activeDate}
            setActiveDate={setActiveDate}
            mutate={mutate}
          />
        </div>


        <div className="flex flex-col flex-1 overflow-hidden px-4 sm:px-0 print:hidden">
          <div

            className="flex flex-col h-full"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mb-4 shrink-0">

              <div className="relative inline-flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-full w-fit shadow-sm print:hidden">
                {STATUSES.map((s) => {
                  const active = currentStatus === s;
                  return (
                    <button
                      key={s}
                      onClick={() =>
                        setActiveStatuses(s === "All" ? [] : [s])
                      }
                      className={
                        "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap " +
                        (active ? "text-white" : "text-gray-500 hover:text-gray-800")
                      }
                      type="button"
                    >
                      {active && (
                        <motion.span
                          layoutId="status-filter-indicator"
                          className="absolute inset-0 rounded-full shadow-md bg-linear-to-r from-indigo-600 to-fuchsia-500"

                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10">{s}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <List query={query} activeStatuses={activeStatuses} date={date} data={data} mutate={mutate} isLoading={isLoading} activeDate={activeDate} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
