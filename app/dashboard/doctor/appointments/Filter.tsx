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

const STATUSES = [
  "Upcoming",
  "Consulted",
  "Observation",
  "Completed",
  "Not show",
] as const;

const cx = (...cls: (string | false | null | undefined)[]) =>
  cls.filter(Boolean).join(" ");

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
    <Card>
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.target.value)
                }
                placeholder="Search by patient, doctor, or #ID"
                className="pl-9"
              />
            </div>
            <div className="min-w-[170px]">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-48 justify-between font-normal"
                  >
                    {date ? date.toISOString().slice(0, 10) : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setDate(date || new Date());
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>

              {/* <Input type="date"  aria-label="Filter by date"  value={date.toISOString().slice(0,10)} onChange={e=>setDate(new Date(e.target.value))}/> */}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => {
              const active = activeStatuses.includes(s);
              return (
                <button
                  key={s}
                  onClick={() =>
                    setActiveStatuses((prev) =>
                      active ? prev.filter((x) => x !== s) : [...prev, s]
                    )
                  }
                  className={cx(
                    "px-3 h-9 rounded-full border text-sm flex items-center gap-2",
                    active
                      ? "bg-black text-white border-black"
                      : "bg-white hover:bg-zinc-50 border-zinc-200"
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
