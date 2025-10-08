import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

import WeeklyCalender from "./WeeklyCalender";
import MonthlyCalender from "./MonthlyCalender";

export default function Calendar() {
  return (
    <div className="flex   overflow-hidden">
      <Tabs defaultValue="week" className="flex-1 overflow-hidden">
        <div className="w-full flex justify-end">
          <TabsList className="">
            <TabsTrigger value="week" className="cursor-pointer">
              Week View
            </TabsTrigger>
            <TabsTrigger value="month" className="cursor-pointer">
              Month View
            </TabsTrigger>
          </TabsList>
        </div>

        <WeeklyCalender />
        <MonthlyCalender />
      </Tabs>
    </div>
  );
}
