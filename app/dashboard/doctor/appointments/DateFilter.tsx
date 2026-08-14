import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface DateFilterProps {
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
  setActiveDate: (val: "Today" | "7 days" | "30 days" | "Custom") => void;
  date: Date;
  setDate: (val: Date) => void;
  isLoading?: boolean;
}

export default function DateFilter({
  activeDate,
  setActiveDate,
  date,
  setDate,
  isLoading = false,
}: DateFilterProps) {
  const dates = ["Today", "7 days", "30 days", "Custom"];

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-0.5 text-xs bg-white border border-gray-200/90 rounded-xl p-0.5 shadow-2xs shrink-0",
        isLoading && "opacity-70"
      )}
    >
      {dates.map((label) => {
        const active = activeDate === label;
        const isCustom = label === "Custom";

        if (isCustom) {
          return (
            <Popover key={label}>
              <PopoverTrigger asChild>
                <button
                  onClick={() => setActiveDate(label)}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition will-change-transform cursor-pointer font-medium text-xs",
                    active ? "text-white font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  type="button"
                >
                  {active && (
                    <motion.span
                      layoutId="date-filter-indicator"
                      className="absolute inset-0 rounded-lg bg-(--color-synapse-light)"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {date ? format(date, "MMM d, yyyy") : "Custom"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    if (selectedDate) {
                      setDate(selectedDate);
                      setActiveDate("Custom");
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          );
        }

        return (
          <button
            key={label}
            onClick={() => setActiveDate(label as "Today" | "7 days" | "30 days" | "Custom")}
            className={cn(
              "relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition will-change-transform cursor-pointer font-medium text-xs",
              active ? "text-white font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
            type="button"
          >
            {active && (
              <motion.span
                layoutId="date-filter-indicator"
                className="absolute inset-0 rounded-lg bg-(--color-synapse-light)"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
