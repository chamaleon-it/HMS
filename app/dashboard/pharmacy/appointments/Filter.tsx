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

export const STATUSES = [
  "Upcoming",
  "Consulted",
  "Observation",
  "Completed",
  "Not show",
  "All",
] as const;


export default function Filter({
  query,
  setQuery,
  activeStatuses,
  setActiveStatuses,
  date,
  setDate,
}: {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  activeStatuses: string[];
  setActiveStatuses: React.Dispatch<React.SetStateAction<string[]>>;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}) {
  const [open, setOpen] = useState(false);


  return (
    <Card className="border-zinc-200/60 shadow-sm">
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

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 px-4 justify-between font-medium border-zinc-200 bg-zinc-50/50 hover:bg-white hover:border-indigo-200 transition-all rounded-xl min-w-[160px]"
                >
                  <span className="flex items-center gap-2">
                    <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
                    {date ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Select date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-zinc-200 shadow-xl" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => {
                    setDate(date || new Date());
                    setOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
