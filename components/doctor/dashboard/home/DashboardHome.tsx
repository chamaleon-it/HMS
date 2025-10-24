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

export default function Dashboard() {
  const [openAppointment, setOpenAppointment] = useState<"walk-in" | boolean>(
    false
  );

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    () => new Date()
  );

  const { mutate } = useAppointmentList({ date: selectedDate });

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <Statistics />

      <div className="flex flex-1 gap-6 px-6 pb-6 overflow-hidden">
        <Tabs defaultValue="day" className="flex-1 overflow-hidden">
          <TabsList className="mb-4">
            <TabsTrigger value="day" className="cursor-pointer">
              Day View
            </TabsTrigger>
            <TabsTrigger value="week" className="cursor-pointer">
              Week View
            </TabsTrigger>
            <TabsTrigger value="month" className="cursor-pointer">
              Month View
            </TabsTrigger>
          </TabsList>

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
          mutate={mutate}
          onClose={() => {
            setOpenAppointment(false);
          }}
          walkIn={openAppointment === "walk-in"}
        />
      </Drawer>
    </div>
  );
}
