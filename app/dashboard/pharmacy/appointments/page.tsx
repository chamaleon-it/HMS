"use client";

import React, { useState } from "react";

import { Plus, CalendarDays } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import Calendar from "./Calender";
import List from "./List";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateAppointmentForm } from "./CreateAppointmentForm";
import Statistics from "./Statistics";
import Filter from "./Filter";
import Drawer from "@/components/ui/drawer";
import useAppointmentList from "./data/useAppointmentList";
import PharmacyHeader from "../components/PharmacyHeader";
import { motion } from "framer-motion";

export default function AppointmentPage() {
  const [query, setQuery] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);
  const [openCreate, setOpenCreate] = useState<"walk-in" | boolean>(false);
  const [date, setDate] = useState(new Date());

  const { mutate } = useAppointmentList({ query, activeStatuses, date });
  const [tab, setTab] = useState<"list" | "calendar">("list");



  return (
    <AppShell>
      <div className="p-5 min-h-[calc(100vh-80px)] space-y-5">
        <PharmacyHeader
          title="Appointments"
          subtitle="Manage patient appointments and schedules"
        >
          <div className="flex gap-5">
            <PrimaryButton onClick={() => setOpenCreate(true)}>
              <Plus className="h-4 w-4 mr-2" /> Schedule
            </PrimaryButton>

            <PrimaryButton onClick={() => setOpenCreate("walk-in")}>
              Walk-in Appointment
            </PrimaryButton>

          </div>
        </PharmacyHeader>

        {/* Filters Row */}
        <Filter
          activeStatuses={activeStatuses}
          query={query}
          setActiveStatuses={setActiveStatuses}
          setQuery={setQuery}
          date={date}
          setDate={setDate}
        />

        {/* Stats Row */}
        <Statistics />

        {/* Tabs: List / Calendar */}
        <div className="mt-6">
          <Tabs
            value={tab}
            onValueChange={(val) => setTab(val as "list" | "calendar")}
            className="flex-1 overflow-hidden"
          >
            <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1 print:hidden w-fit">
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
                      "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer " +
                      (active ? "text-white" : "text-gray-700")
                    }
                    type="button"
                  >
                    {active && (
                      <motion.span
                        layoutId="appointment-tab-indicator"
                        className="absolute inset-0 rounded-full"
                        style={{ background: "linear-gradient(90deg,#4f46e5,#d946ef)" }}
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

            <TabsContent value="list">
              <List query={query} activeStatuses={activeStatuses} date={date} />
            </TabsContent>
            <TabsContent value="calendar">
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

const theme = {
  from: "#4f46e5",
  to: "#ec4899",
};

const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...rest }) => (
  <button
    {...rest}
    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 active:scale-[0.99] ${className} cursor-pointer flex items-center justify-center`}
    style={{
      backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
    }}
  >
    {children}
  </button>
);
