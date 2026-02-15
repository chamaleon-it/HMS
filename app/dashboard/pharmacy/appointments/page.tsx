"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

import { Plus, CalendarDays, Clock, FlaskConical, Bed, AlertTriangle, CheckCircle2 } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import Calendar from "./Calender";
import List from "./List";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { CreateAppointmentForm } from "./CreateAppointmentForm";
import Statistics from "./Statistics";
import Filter, { STATUSES } from "./Filter";
import Drawer from "@/components/ui/drawer";
import useAppointmentList from "./data/useAppointmentList";
import PharmacyHeader from "../components/PharmacyHeader";
import { motion } from "framer-motion";

export default function AppointmentPage() {
  const [query, setQuery] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<string[]>(["Upcoming"]);
  const [openCreate, setOpenCreate] = useState<"walk-in" | boolean>(false);
  const [date, setDate] = useState(new Date());

  const { mutate } = useAppointmentList({ query, activeStatuses, date });
  const [tab, setTab] = useState<"list" | "calendar">("list");

  // We consider "All" active if activeStatuses is empty
  const currentStatus = activeStatuses.length === 0 ? "All" : activeStatuses[0];

  return (
    <AppShell>
      <div className="p-5 min-h-[calc(100vh-80px)] space-y-5">
        <PharmacyHeader
          title="Appointments"
          subtitle="Manage patient appointments and schedules"
        >
          <div className="flex gap-5">
            <PrimaryButton onClick={() => setOpenCreate(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" /> Schedule
            </PrimaryButton>

            <PrimaryButton onClick={() => setOpenCreate("walk-in")} className="bg-linear-to-br from-indigo-600 to-pink-500">
              Walk-in Appointment
            </PrimaryButton>

          </div>
        </PharmacyHeader>

        <Statistics />

        {/* Filters Row */}
        <Filter
          activeStatuses={activeStatuses}
          query={query}
          setActiveStatuses={setActiveStatuses}
          setQuery={setQuery}
          date={date}
          setDate={setDate}
        />

        {/* Tabs and Status Filter Row */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs
            value={tab}
            onValueChange={(val) => setTab(val as "list" | "calendar")}
            className="flex-1 overflow-visible"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full gap-4">
              {/* Tab Switcher (List/Calendar) */}
              <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1 print:hidden w-fit shadow-sm">
                {[
                  { key: "list", label: "List", icon: CalendarDays },
                  { key: "calendar", label: "Calendar", icon: CalendarDays },
                ].map(({ key, label, icon: Icon }) => {
                  const active = tab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setTab(key as "list" | "calendar")}
                      className={
                        "relative flex items-center gap-2 rounded-full px-5 py-2.5 transition will-change-transform cursor-pointer font-medium " +
                        (active ? "text-white" : "text-gray-600 hover:text-gray-900")
                      }
                      type="button"
                    >
                      {active && (
                        <motion.span
                          layoutId="appointment-tab-indicator"
                          className="absolute inset-0 rounded-full shadow-md bg-linear-to-r from-indigo-600 to-fuchsia-500"

                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon size={16} /> {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Status Filter Toggle */}
              {tab === "list" && <div className="relative inline-flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-full w-fit shadow-sm print:hidden">
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
              </div>}
            </div>

            <TabsContent value="list" className="">
              <List query={query} activeStatuses={activeStatuses} date={date} />
            </TabsContent>
            <TabsContent value="calendar" className="">
              <Calendar date={date} />
            </TabsContent>
          </Tabs>
        </div>

        <Drawer
          open={!!openCreate}
          onClose={() => setOpenCreate(false)}
          title="Create Appointment"
        >
          <CreateAppointmentForm
            onClose={() => setOpenCreate(false)}
            mutate={mutate}
            walkIn={openCreate === "walk-in"}
          />
        </Drawer>
      </div>
    </AppShell>
  );
}


const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...rest }) => (
  <button
    {...rest}
    className={cn(
      "rounded-lg px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 active:scale-[0.99] cursor-pointer flex items-center justify-center",
      className
    )}
  >

    {children}
  </button>
);
