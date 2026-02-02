"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon, Search, Calendar as CalendarIcon } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STATUSES = [
  "Upcoming",
  "Consulted",
  "Observation",
  "Completed",
  "Not show",
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
    <Card className="border-zinc-200/60 shadow-sm overflow-hidden">
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 min-w-[260px] group">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-indigo-500" />
              <Input
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.target.value)
                }
                placeholder="Search by patient, doctor, or #ID"
                className="pl-9 h-11 bg-zinc-50/50 border-zinc-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
              />
            </div>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 justify-start gap-2 bg-zinc-50/50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300 transition-all font-medium sm:w-48"
                >
                  <CalendarIcon className="h-4 w-4 text-zinc-500" />
                  <span className="flex-1 text-left">
                    {date ? date.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "Select date"}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0"
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
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-1 hidden sm:inline">Filter:</span>
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
                  className={cn(
                    "relative px-4 h-9 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer overflow-hidden border",
                    active
                      ? "text-white border-transparent shadow-sm"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                  )}
                >
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        layoutId={`filter-bg-${s}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 bg-zinc-900"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                      />
                    )}
                  </AnimatePresence>
                  <span className="relative z-10">{s}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
