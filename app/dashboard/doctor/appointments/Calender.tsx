import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

import WeeklyCalender from "./WeeklyCalender";
import MonthlyCalender from "./MonthlyCalender";

export default function Calendar({ date }: { date: Date }) {
  return (
    <div className="flex   overflow-hidden">
      <Tabs defaultValue="week" className="flex-1 overflow-hidden">
        <div className="w-full flex justify-end">
          <TabsList className="bg-slate-100/80 border border-slate-200 rounded-2xl p-1 h-10">
            <TabsTrigger value="day" className="cursor-pointer rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">
              Day View
            </TabsTrigger>
            <TabsTrigger value="week" className="cursor-pointer rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">
              Week View
            </TabsTrigger>
            <TabsTrigger value="month" className="cursor-pointer rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">
              Month View
            </TabsTrigger>
          </TabsList>
        </div>

        <WeeklyCalender selectedDate={date} />
        <MonthlyCalender selectedDate={date} />
      </Tabs>
    </div>
  );
}
