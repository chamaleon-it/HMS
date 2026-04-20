"use client";

import React, { useState } from "react";

import { CalendarDays, Plus, LayoutList, CalendarSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import DoctorHeader from "../components/DoctorHeader";
import { motion } from "framer-motion";

import AppShell from "@/components/layout/app-shell";
import Calendar from "./Calender";
import List from "./List";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateAppointmentForm } from "./CreateAppointmentForm";
import Statistics from "./Statistics";
import Filter from "./Filter";
import Drawer from "@/components/ui/drawer";
import useAppointmentList from "./data/useAppointmentList";

export default function AppointmentPage() {
  const [query, setQuery] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [date, setDate] = useState(new Date());
  const [activeDate, setActiveDate] = useState<"Today" | "7 days" | "30 days" | "Custom">("Today");
  const [activeTab, setActiveTab] = useState("list");

  const { mutate } = useAppointmentList({ query, activeStatuses, date, activeDate });

  const tabs = [
    { key: "list", label: "List", icon: LayoutList },
    { key: "calendar", label: "Calendar", icon: CalendarSearch },
  ];



  return (
    <AppShell>
      <div className="p-5 min-h-[calc(100vh-80px)] space-y-5">
        <DoctorHeader
          title="Appointments"
          subtitle="Manage patient appointments and schedules"
        >
          <div className="flex items-center gap-2">
            <PrimaryButton onClick={() => setOpenCreate(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create
            </PrimaryButton>
          </div>
        </DoctorHeader>

        <Statistics />
        {/* Filters Row */}
        <Filter
          activeStatuses={activeStatuses}
          query={query}
          setActiveStatuses={setActiveStatuses}
          setQuery={setQuery}
          date={date}
          setDate={setDate}
          activeDate={activeDate}
          setActiveDate={setActiveDate}
        />

        {/* Tabs: List / Calendar */}
        <div className="mt-2">
          <Tabs
            defaultValue="list"
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 overflow-hidden"
          >
            <div className="mb-4 relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1 w-fit">
              {tabs.map(({ key, label, icon: Icon }) => {
                const active = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={
                      "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer " +
                      (active ? "text-white" : "text-gray-700")
                    }
                    type="button"
                  >
                    {active && (
                      <motion.span
                        layoutId="tab-indicator"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "linear-gradient(90deg,#4f46e5,#d946ef)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
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
              <List query={query} activeStatuses={activeStatuses} date={date} activeDate={activeDate} />
            </TabsContent>
            <TabsContent value="calendar">
              <Calendar date={date} />
            </TabsContent>
          </Tabs>
        </div>

        <Drawer
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          title="Create Appointment"
        >
          <CreateAppointmentForm onClose={() => setOpenCreate(false)} />
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
