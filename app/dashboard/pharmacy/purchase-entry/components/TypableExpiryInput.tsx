"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const years = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i);

interface TypableExpiryInputProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    className?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const TypableExpiryInput = ({
    value,
    onChange,
    placeholder = "MM/YY",
    className,
    onKeyDown
}: TypableExpiryInputProps) => {
    const [displayValue, setDisplayValue] = useState("");
    const [open, setOpen] = useState(false);

    // Convert yyyy-MM-dd to MM/YY for display
    useEffect(() => {
        if (value) {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = String(date.getFullYear()).slice(-2);
                    setDisplayValue(`${month}/${year}`);
                }
            } catch (e) {
                setDisplayValue("");
            }
        } else {
            setDisplayValue("");
        }
    }, [value]);

    const isPast = (monthIdx: number, year: number) => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        if (year < currentYear) return true;
        if (year === currentYear && monthIdx < currentMonth) return true;
        return false;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value.replace(/[^0-9]/g, ''); // Remove non-digits

        // Auto-format with slash
        if (input.length >= 2) {
            input = input.slice(0, 2) + '/' + input.slice(2, 4);
        }

        setDisplayValue(input);

        // Parse and validate complete date (MM/YY)
        if (input.length === 5) {
            const parts = input.split('/');
            if (parts.length === 2) {
                const month = parseInt(parts[0], 10);
                const year = parseInt(parts[1], 10) + 2000; // Assume 20xx

                // Basic validation and Future-only check
                if (month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
                    if (!isPast(month - 1, year)) {
                        // Convert to yyyy-MM-dd format (first day of month)
                        const isoDate = `${year}-${String(month).padStart(2, '0')}-01`;
                        onChange(isoDate);
                    } else {
                        toast.error("Expiry date cannot be in the past");
                    }
                }
            }
        }
    };

    // Parse displayValue to get the typed month/year, fall back to value or current date
    const getDisplayDate = () => {
        // First try to parse what the user is typing
        if (displayValue) {
            const parts = displayValue.split('/');
            if (parts.length === 2 && parts[0] && parts[1]) {
                const month = parseInt(parts[0], 10);
                const year = parseInt(parts[1], 10) + 2000;

                // If month and year are valid, use them
                if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
                    return new Date(year, month - 1, 1);
                }
            }
        }

        // Fall back to the value prop or current date
        if (value) {
            return new Date(value);
        }

        return new Date();
    };

    const date = getDisplayDate();

    return (
        <div className="relative flex items-center gap-1">
            <Input
                type="text"
                placeholder={placeholder}
                data-field="expiryDate"
                className={cn(
                    "h-11 bg-white border-slate-200 rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all text-center text-sm pr-10",
                    className
                )}
                value={displayValue}
                onChange={handleChange}
                onKeyDown={onKeyDown}
                maxLength={5}
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 h-9 w-9 hover:bg-indigo-50 rounded-md transition-colors"
                    >
                        <CalendarIcon className="h-4 w-4 text-indigo-500" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="w-64 p-3 bg-white rounded-xl shadow-xl border border-slate-100">
                        <div className="space-y-3">
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1">Select Expiry (MM/YYYY)</div>

                            <div className="grid grid-cols-3 gap-1">
                                {months.map((m: string, idx: number) => {
                                    const selectedYear = date ? date.getFullYear() : new Date().getFullYear();
                                    const disabled = isPast(idx, selectedYear);
                                    const isSelected = date && date.getMonth() === idx && date.getFullYear() === selectedYear;

                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            disabled={disabled}
                                            className={cn(
                                                "px-2 py-2 text-xs rounded-lg transition-all ",
                                                isSelected
                                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                                    : disabled
                                                        ? "text-slate-200 cursor-not-allowed"
                                                        : "hover:bg-slate-50 text-slate-600 hover:text-indigo-600"
                                            )}
                                            onClick={() => {
                                                const currentYear = date ? date.getFullYear() : new Date().getFullYear();
                                                const newDate = new Date(currentYear, idx, 1);
                                                onChange(format(newDate, "yyyy-MM-dd"));
                                            }}
                                        >
                                            {m}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="border-t border-slate-100 pt-3">
                                <Select
                                    value={date ? String(date.getFullYear()) : String(new Date().getFullYear())}
                                    onValueChange={(y) => {
                                        const currentMonth = date ? date.getMonth() : new Date().getMonth();
                                        let targetMonth = currentMonth;
                                        if (isPast(currentMonth, Number(y))) {
                                            targetMonth = new Date().getMonth();
                                        }
                                        const newDate = new Date(Number(y), targetMonth, 1);
                                        onChange(format(newDate, "yyyy-MM-dd"));
                                    }}
                                >
                                    <SelectTrigger className="w-full h-10 text-xs bg-slate-50/50 border-slate-200 rounded-lg">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200">
                                        {years.map((y: number) => (
                                            <SelectItem key={y} value={String(y)} className="text-xs rounded-lg focus:bg-indigo-50">
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="button"
                                className="w-full h-10 text-[10px] font-semibold uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-100 transition-all"
                                onClick={() => setOpen(false)}
                            >
                                Confirm Selection
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default TypableExpiryInput;
