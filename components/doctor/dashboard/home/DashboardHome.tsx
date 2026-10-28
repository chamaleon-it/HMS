"use client";
import { useState } from "react";

import DailyViewTimeline from "./DayView";
import Summery from "./Summery";
import { AppointmentDialog } from "@/components/shared/appointment/AppointmentDialog";
import Statistics from "./Statistics";

export default function Dashboard() {
  const [openAppointment, setOpenAppointment] = useState<"walk-in" | boolean>(
    false
  );

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="min-h-[calc(100vh-67px)] w-full bg-linear-to-b from-white to-slate-50 flex flex-col">
      <Statistics />

      <div className="flex flex-1 gap-6 px-6 pb-6 overflow-hidden">
        <div className="flex-1 overflow-hidden w-fit">
          <div className="flex-1 overflow-hidden min-h-[50vh]">
            <DailyViewTimeline
              setOpenAppointment={setOpenAppointment}
              selectedDate={selectedDate}
            />
          </div>
        </div>

        <Summery
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </div>

      <AppointmentDialog
        open={!!openAppointment}
        onOpenChange={(v) => !v && setOpenAppointment(false)}
        walkIn={openAppointment === "walk-in"}
      />
    </div>
  );
}
