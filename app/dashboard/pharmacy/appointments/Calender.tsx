import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

import WeeklyCalender from "./WeeklyCalender";
import MonthlyCalender from "./MonthlyCalender";

export default function Calendar({ date, doctorId, doctorName, onSelectAppointment, isPanelOpen = false }: {
  date: Date,
  doctorId?: string,
  doctorName?: string,
  onSelectAppointment?: (apt: any) => void,
  isPanelOpen?: boolean
}) {
  return (
    <div className="flex w-full h-full overflow-hidden">
      <Tabs defaultValue="week" className="flex-1 overflow-hidden h-full flex flex-col">
        <div className="w-full flex justify-end mb-2 shrink-0">
          <TabsList className="">
            <TabsTrigger value="week" className="cursor-pointer">
              Week View
            </TabsTrigger>
            <TabsTrigger value="month" className="cursor-pointer">
              Month View
            </TabsTrigger>
          </TabsList>
        </div>

        <WeeklyCalender
          selectedDate={date}
          doctorId={doctorId}
          doctorName={doctorName}
          onSelectAppointment={onSelectAppointment}
          isPanelOpen={isPanelOpen}
        />
        <MonthlyCalender selectedDate={date} />
      </Tabs>
    </div>
  );
}
