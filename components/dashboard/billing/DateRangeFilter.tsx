"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, X, Check } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";

interface DateRangeFilterProps {
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
  setActiveDate: (val: "Today" | "7 days" | "30 days" | "Custom") => void;
  dateRange?: DateRange;
  setDateRange: (val: DateRange | undefined) => void;
  // Optional backwards compatibility:
  date?: Date;
  setDate?: (val: Date) => void;
  isLoading?: boolean;
}

export default function DateRangeFilter({
  activeDate,
  setActiveDate,
  dateRange,
  setDateRange,
  date,
  setDate,
  isLoading = false,
}: DateRangeFilterProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(dateRange);
  const presets: Array<"Today" | "7 days" | "30 days"> = ["Today", "7 days", "30 days"];

  // Synchronize temporary range whenever popover opens
  useEffect(() => {
    if (popoverOpen) {
      setTempRange(
        dateRange || { from: date || new Date(), to: date || new Date() }
      );
    }
  }, [popoverOpen, dateRange, date]);

  // Compute display label for the custom date pill outside
  const getCustomLabel = () => {
    if (activeDate === "Custom") {
      if (dateRange?.from) {
        if (dateRange.to) {
          if (
            format(dateRange.from, "yyyy-MM-dd") ===
            format(dateRange.to, "yyyy-MM-dd")
          ) {
            return format(dateRange.from, "MMM d, yyyy");
          }
          const sameYear =
            dateRange.from.getFullYear() === dateRange.to.getFullYear();
          if (sameYear) {
            return `${format(dateRange.from, "MMM d")} - ${format(
              dateRange.to,
              "MMM d, yyyy"
            )}`;
          }
          return `${format(dateRange.from, "MMM d, yyyy")} - ${format(
            dateRange.to,
            "MMM d, yyyy"
          )}`;
        }
        return `${format(dateRange.from, "MMM d, yyyy")} - ...`;
      }
      if (date) {
        return format(date, "MMM d, yyyy");
      }
    }
    return format(new Date(), "MMM d, yyyy");
  };

  const handleApply = () => {
    if (tempRange?.from) {
      const finalRange: DateRange = {
        from: tempRange.from,
        to: tempRange.to || tempRange.from,
      };
      setDateRange(finalRange);
      setActiveDate("Custom");
      if (setDate) {
        setDate(finalRange.from);
      }
    }
    setPopoverOpen(false);
  };

  const handleClear = () => {
    setTempRange(undefined);
    setDateRange(undefined);
    setActiveDate("Today");
    setPopoverOpen(false);
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-1 text-sm bg-white border border-gray-200 rounded-full p-1 shadow-sm",
        isLoading && "opacity-70"
      )}
    >
      {presets.map((label) => {
        const active = activeDate === label;
        return (
          <button
            key={label}
            onClick={() => setActiveDate(label)}
            className={cn(
              "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer font-medium text-xs md:text-sm",
              active ? "text-white" : "text-slate-600 hover:bg-slate-50"
            )}
            type="button"
          >
            {active && (
              <motion.span
                layoutId="date-filter-indicator"
                className="absolute inset-0 rounded-full bg-(--color-synapse-light)"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {label}
            </span>
          </button>
        );
      })}

      {/* Custom Date Range Pill */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            onClick={() => {
              setPopoverOpen(true);
            }}
            className={cn(
              "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer font-medium text-xs md:text-sm",
              activeDate === "Custom"
                ? "text-white"
                : "text-slate-600 hover:bg-slate-50"
            )}
            type="button"
          >
            {activeDate === "Custom" && (
              <motion.span
                layoutId="date-filter-indicator"
                className="absolute inset-0 rounded-full bg-(--color-synapse-light)"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
              <CalendarIcon className="h-3.5 w-3.5" />
              {getCustomLabel()}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border border-slate-200 shadow-2xl rounded-2xl overflow-hidden bg-white"
          align="end"
        >
          {/* Header Info Banner */}
          <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Date Range
              </p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {tempRange?.from ? (
                  <span>
                    <span className="text-slate-900 font-bold">
                      {format(tempRange.from, "MMM d, yyyy")}
                    </span>
                    {" to "}
                    <span className="text-slate-900 font-bold">
                      {tempRange.to
                        ? format(tempRange.to, "MMM d, yyyy")
                        : "Select end date"}
                    </span>
                  </span>
                ) : (
                  "Click a date to start range"
                )}
              </p>
            </div>
            {tempRange?.from && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                title="Reset to today"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="p-2">
            <Calendar
              mode="range"
              selected={tempRange}
              onSelect={(newRange) => {
                setTempRange(newRange);
              }}
              numberOfMonths={2}
              initialFocus
              defaultMonth={tempRange?.from || new Date()}
            />
          </div>

          {/* Footer controls */}
          <div className="bg-slate-50/70 p-2.5 px-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPopoverOpen(false)}
              className="h-8 text-xs font-semibold rounded-lg cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="h-8 text-xs font-semibold rounded-lg bg-(--color-synapse-light) hover:bg-(--color-synapse-dark) text-white cursor-pointer"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Apply Range
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
