import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

const theme = {
    from: "#4f46e5",
    to: "#ec4899",
};

interface DateFilterProps {
    activeDate: "Today" | "7 days" | "30 days" | "Custom";
    setActiveDate: (val: "Today" | "7 days" | "30 days" | "Custom") => void;
    date: Date;
    setDate: (val: Date) => void;
    isLoading?: boolean;
}

export default function DateFilter({ activeDate, setActiveDate, date, setDate, isLoading = false }: DateFilterProps) {
    const dates = ["Today", "7 days", "30 days", "Custom"];

    return (
        <div className={cn("relative inline-flex items-center gap-1 text-sm bg-white border border-gray-200 rounded-full p-1 shadow-sm", isLoading && "opacity-70")}>
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
                                        "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer font-medium",
                                        active ? "text-white" : "text-slate-600 hover:bg-slate-50"
                                    )}
                                    type="button"
                                >
                                    {active && (
                                        <motion.span
                                            layoutId="date-filter-indicator"
                                            className="absolute inset-0 rounded-full"
                                            style={{ background: `linear-gradient(90deg, ${theme.from}, ${theme.to})` }}
                                            transition={{ type: "spring", stiffness: 500, damping: 40 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
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
                            "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer font-medium",
                            active ? "text-white" : "text-slate-600 hover:bg-slate-50"
                        )}
                        type="button"
                    >
                        {active && (
                            <motion.span
                                layoutId="date-filter-indicator"
                                className="absolute inset-0 rounded-full"
                                style={{ background: `linear-gradient(90deg, ${theme.from}, ${theme.to})` }}
                                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
