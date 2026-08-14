"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import DateFilter from "./DateFilter";

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
  activeDate,
  setActiveDate,
}: {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  activeStatuses: string[];
  setActiveStatuses: React.Dispatch<React.SetStateAction<string[]>>;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
  setActiveDate: React.Dispatch<React.SetStateAction<"Today" | "7 days" | "30 days" | "Custom">>;
}) {
  return (
    <Card className="border-zinc-200/70 shadow-2xs overflow-hidden rounded-2xl py-2!" >
      <CardContent className="p-2.5 sm:p-3">
        <div className="flex flex-col lg:flex-row gap-2.5 lg:items-center lg:justify-between">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 min-w-55 group">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-(--color-synapse-light)" />
              <Input
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.target.value)
                }
                placeholder="Search by patient, doctor, or #ID"
                className="pl-8.5 h-8.5 text-xs bg-zinc-50/70 border-zinc-200 rounded-xl focus-visible:ring-synapse-light/20 focus-visible:border-(--color-synapse-light) transition-all"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DateFilter
              activeDate={activeDate}
              setActiveDate={setActiveDate}
              date={date}
              setDate={setDate}
            />

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1 mr-0.5 hidden sm:inline">
                Filter:
              </span>
              {STATUSES.map((s) => {
                const active = activeStatuses.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setActiveStatuses((prev) =>
                        active ? prev.filter((x) => x !== s) : [...prev, s]
                      )
                    }
                    className={cn(
                      "relative px-3 h-8 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer overflow-hidden border",
                      active
                        ? "bg-primary text-white border-primary shadow-2xs font-semibold"
                        : "bg-slate-50 text-slate-600 border-slate-200/90 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <span className="relative z-10">{s}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
