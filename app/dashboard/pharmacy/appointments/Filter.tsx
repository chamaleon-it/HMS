import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon, Search } from "lucide-react";
import React, { useState } from "react";
import DateFilter from "../DateFilter";

export const STATUSES = [
  "Upcoming",
  "Consulted",
  "Observation",
  "Completed",
  "Not show",
  "Admit",
  "Test",
  "All",
  "Deleted"
] as const;


export default function Filter({
  query,
  setQuery,
  date,
  setDate,
  activeDate,
  setActiveDate,
}: {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
  setActiveDate: React.Dispatch<React.SetStateAction<"Today" | "7 days" | "30 days" | "Custom">>;
}) {


  return (
    <Card className="border-zinc-200/60 shadow-sm py-2.5!">
      <CardContent className="p-3">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.target.value)
                }
                placeholder="Search patient, doctor, or #ID..."
                className="pl-9 h-11 bg-zinc-50/50 border-zinc-200 focus:bg-white transition-all rounded-xl"
              />
            </div>


          </div>

          <div className="flex items-center gap-3">
            <DateFilter
              activeDate={activeDate}
              setActiveDate={setActiveDate}
              date={date}
              setDate={setDate}
              isLoading={false}
            />
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
