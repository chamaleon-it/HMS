"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import DailyViewTimeline from "./DayView";
import Summery from "./Summery";
import MonthlyCalender from "./MonthlyCalender";
import { CreateAppointmentForm } from "@/app/dashboard/doctor/appointments/CreateAppointmentForm";
import Statistics from "./Statistics";
import WeeklyCalender from "./WeeklyCalender";
import Drawer from "@/components/ui/drawer";
import useAppointmentList from "@/app/dashboard/doctor/appointments/data/useAppointmentList";
import { motion } from "framer-motion";
import { LayoutGrid, Calendar, CalendarRange } from "lucide-react";

export default function Dashboard() {
  const [openAppointment, setOpenAppointment] = useState<"walk-in" | boolean>(
    false
  );

  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date()
  );

  const { mutate } = useAppointmentList({ date: selectedDate, activeDate: "Custom" });

  const [activeTab, setActiveTab] = useState("day");

  const tabs = [
    { key: "day", label: "Day View", icon: LayoutGrid },
    { key: "week", label: "Week View", icon: CalendarRange },
    { key: "month", label: "Month View", icon: Calendar },
  ];

  return (
    <div className="min-h-[calc(100vh-67px)]">
      <Statistics />

      <div className="flex flex-1 gap-6 px-6 pb-6 overflow-hidden">
        <Tabs
          defaultValue="day"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden w-fit"
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
                      layoutId="tab-indicator-days"
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

          <TabsContent
            value="day"
            className="flex-1 overflow-hidden min-h-[50vh]"
          >
            <DailyViewTimeline
              setOpenAppointment={setOpenAppointment}
              selectedDate={selectedDate}
            />
          </TabsContent>

          <WeeklyCalender
            setOpenAppointment={setOpenAppointment}
            selectedDate={selectedDate}
          />

          <MonthlyCalender selectedDate={selectedDate} />
        </Tabs>

        <Summery
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </div>

      <Drawer
        open={!!openAppointment}
        onClose={() => {
          setOpenAppointment(false);
        }}
        title="Create Appointment"
      >
        <CreateAppointmentForm
          onClose={() => {
            setOpenAppointment(false);
          }}
          walkIn={openAppointment === "walk-in"}
        />
      </Drawer>
    </div>
  );
}
