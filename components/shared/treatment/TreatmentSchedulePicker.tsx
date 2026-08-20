"use client";

import React from "react";
import { format } from "date-fns";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  dates: string[];
  onChange: (dates: string[]) => void;
  label?: string;
  className?: string;
}

export default function TreatmentSchedulePicker({
  dates = [],
  onChange,
  label = "Treatment Schedule",
  className,
}: Props) {
  const currentDates =
    dates && dates.length > 0
      ? dates
      : [new Date().toISOString().split("T")[0]];

  const handleUpdateDate = (index: number, newDate: string) => {
    const updated = [...currentDates];
    updated[index] = newDate;
    onChange(updated);
  };

  const handleRemoveDate = (index: number) => {
    if (currentDates.length <= 1) return;
    onChange(currentDates.filter((_, idx) => idx !== index));
  };

  const handleAddSpecificDate = (dateStr: string) => {
    if (!currentDates.includes(dateStr)) {
      const updated = [...currentDates, dateStr].sort();
      onChange(updated);
    }
  };

  const handleQuickPreset = (count: number) => {
    const startDate = new Date(currentDates[0] || new Date());
    const generated: string[] = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      generated.push(d.toISOString().split("T")[0]);
    }
    onChange(generated);
  };

  return (
    <div
      className={cn(
        "space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs",
        className
      )}
    >
      {/* Header with Session Counter & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarDays className="h-4 w-4 text-synapse-light shrink-0" />
          <span className="text-xs font-bold text-slate-800">
            {label} ({currentDates.length} {currentDates.length === 1 ? "Session" : "Sessions"})
          </span>
          <Badge className="bg-synapse-light/10 text-synapse-light border-synapse-light/30 text-[10.5px] font-bold">
            {currentDates.length} {currentDates.length === 1 ? "Session Scheduled" : "Sessions Course"}
          </Badge>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10.5px] font-semibold text-slate-400 mr-1">
            Quick Presets:
          </span>
          {[
            { label: "1 Day", count: 1 },
            { label: "3 Days", count: 3 },
            { label: "5 Days", count: 5 },
            { label: "7 Days", count: 7 },
            { label: "10 Days", count: 10 },
            { label: "14 Days", count: 14 },
          ].map((preset) => (
            <button
              key={preset.count}
              type="button"
              onClick={() => handleQuickPreset(preset.count)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border cursor-pointer",
                currentDates.length === preset.count
                  ? "bg-synapse-light text-white border-synapse-light shadow-2xs"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Session Dates with Shadcn Calendar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
        {currentDates.map((dStr, idx) => {
          const parsedDate = dStr ? new Date(`${dStr}T00:00:00`) : new Date();

          return (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs"
            >
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 min-w-0 flex-1 text-left hover:opacity-80 transition cursor-pointer p-1 rounded-lg"
                  >
                    <span className="text-[10px] font-bold bg-synapse-light/10 text-synapse-light px-1.5 py-0.5 rounded shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                      <CalendarIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {format(parsedDate, "dd/MM/yyyy (EEE)")}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <ShadcnCalendar
                    mode="single"
                    selected={parsedDate}
                    onSelect={(selectedDate) => {
                      if (selectedDate) {
                        handleUpdateDate(
                          idx,
                          format(selectedDate, "yyyy-MM-dd")
                        );
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {currentDates.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveDate(idx)}
                  className="text-slate-300 hover:text-rose-600 transition cursor-pointer p-1 shrink-0 rounded-md hover:bg-rose-50"
                  title="Remove session date"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Date Action via Shadcn Calendar */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs font-semibold text-synapse-light hover:text-synapse-light hover:bg-synapse-light/10 h-8 gap-1.5 rounded-lg cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Custom Session Date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <ShadcnCalendar
              mode="single"
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  handleAddSpecificDate(format(selectedDate, "yyyy-MM-dd"));
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <span className="text-[10.5px] text-slate-400">
          Click any session date to edit using calendar
        </span>
      </div>
    </div>
  );
}
