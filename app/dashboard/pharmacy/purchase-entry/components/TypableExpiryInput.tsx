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

const parseIsoDate = (isoStr: string): Date | null => {
    if (!isoStr) return null;
    const parts = isoStr.split('-');
    if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            return new Date(y, m - 1, d);
        }
    }
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? null : d;
};

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

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 15 }, (_, i) => currentYear + i);

    // Convert yyyy-MM-dd to MM/YY for display
    useEffect(() => {
        if (value) {
            try {
                const date = parseIsoDate(value);
                if (date && !isNaN(date.getTime())) {
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = String(date.getFullYear()).slice(-2);
                    setDisplayValue(`${month}/${year}`);
                } else {
                    setDisplayValue("");
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
        const curYear = today.getFullYear();
        const curMonth = today.getMonth();
        if (year < curYear) return true;
        if (year === curYear && monthIdx < curMonth) return true;
        return false;
    };

    /**
     * Format and constrain raw digit input:
     * - Month (MM): 01 to 12.
     *   - If first digit is 2-9, auto-formats to 02/..09/
     *   - If first digit is 0, second digit must be 1-9 (00 blocked)
     *   - If first digit is 1, second digit must be 0-2 (13-19 blocked)
     * - Year (YY): between minYearShort (e.g. 26) and maxYearShort (e.g. 40)
     */
    const formatAndValidateInput = (raw: string) => {
        const minYear = currentYear;
        const maxYear = currentYear + 14;
        const minYearShort = minYear % 100;
        const maxYearShort = (maxYear) % 100;
        const minTens = Math.floor(minYearShort / 10);
        const maxTens = Math.floor(maxYearShort / 10);

        const digits = raw.replace(/\D/g, '');
        if (!digits) return { formatted: "", isComplete: false, month: 0, year: 0 };

        let monthStr = "";
        let yearStr = "";

        const firstDigit = parseInt(digits[0], 10);
        if (firstDigit > 1) {
            // Digits 2-9 -> auto format as month 02..09
            monthStr = "0" + digits[0];
            const remaining = digits.slice(1);
            if (remaining.length > 0) {
                const y1 = parseInt(remaining[0], 10);
                if (y1 >= minTens && y1 <= maxTens) {
                    yearStr += remaining[0];
                    if (remaining.length > 1) {
                        const y2 = parseInt(remaining[1], 10);
                        const yrShort = y1 * 10 + y2;
                        if (yrShort >= minYearShort && yrShort <= maxYearShort) {
                            yearStr += remaining[1];
                        }
                    }
                }
            }
        } else if (firstDigit === 0) {
            monthStr = "0";
            if (digits.length > 1) {
                const secondDigit = parseInt(digits[1], 10);
                if (secondDigit >= 1 && secondDigit <= 9) {
                    monthStr = "0" + digits[1];
                    const remaining = digits.slice(2);
                    if (remaining.length > 0) {
                        const y1 = parseInt(remaining[0], 10);
                        if (y1 >= minTens && y1 <= maxTens) {
                            yearStr += remaining[0];
                            if (remaining.length > 1) {
                                const y2 = parseInt(remaining[1], 10);
                                const yrShort = y1 * 10 + y2;
                                if (yrShort >= minYearShort && yrShort <= maxYearShort) {
                                    yearStr += remaining[1];
                                }
                            }
                        }
                    }
                }
                // If secondDigit is 0 (i.e. '00'), reject second digit, monthStr remains '0'
            }
        } else if (firstDigit === 1) {
            monthStr = "1";
            if (digits.length > 1) {
                const secondDigit = parseInt(digits[1], 10);
                if (secondDigit >= 0 && secondDigit <= 2) {
                    monthStr = "1" + digits[1];
                    const remaining = digits.slice(2);
                    if (remaining.length > 0) {
                        const y1 = parseInt(remaining[0], 10);
                        if (y1 >= minTens && y1 <= maxTens) {
                            yearStr += remaining[0];
                            if (remaining.length > 1) {
                                const y2 = parseInt(remaining[1], 10);
                                const yrShort = y1 * 10 + y2;
                                if (yrShort >= minYearShort && yrShort <= maxYearShort) {
                                    yearStr += remaining[1];
                                }
                            }
                        }
                    }
                }
                // If secondDigit is > 2, reject it, monthStr remains '1'
            }
        }

        let formatted = monthStr;
        if (monthStr.length === 2) {
            formatted += "/" + yearStr;
        }

        const isComplete = monthStr.length === 2 && yearStr.length === 2;
        const month = parseInt(monthStr, 10);
        const year = 2000 + parseInt(yearStr, 10);

        return { formatted, isComplete, month, year };
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        // Handle backspace when deleting slash
        if (val.length < displayValue.length) {
            if (displayValue.endsWith('/') && val === displayValue.slice(0, -1)) {
                const trimmed = val.slice(0, -1);
                setDisplayValue(trimmed);
                onChange("");
                return;
            }
            setDisplayValue(val);
            if (val.length < 5) {
                onChange("");
            }
            return;
        }

        const { formatted, isComplete, month, year } = formatAndValidateInput(val);
        setDisplayValue(formatted);

        if (isComplete) {
            if (!isPast(month - 1, year)) {
                const isoDate = `${year}-${String(month).padStart(2, '0')}-01`;
                onChange(isoDate);
            } else {
                toast.error("Expiry date cannot be in the past");
                onChange("");
            }
        } else {
            onChange("");
        }
    };

    const handleBlur = () => {
        if (displayValue.length > 0 && displayValue.length < 5) {
            if (value) {
                const date = parseIsoDate(value);
                if (date) {
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const y = String(date.getFullYear()).slice(-2);
                    setDisplayValue(`${m}/${y}`);
                    return;
                }
            }
            setDisplayValue("");
            onChange("");
        }
    };

    // Parse displayValue to get the typed month/year, fall back to value or current date
    const getDisplayDate = () => {
        if (displayValue && displayValue.length === 5) {
            const parts = displayValue.split('/');
            if (parts.length === 2 && parts[0] && parts[1]) {
                const month = parseInt(parts[0], 10);
                const year = parseInt(parts[1], 10) + 2000;

                if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
                    return new Date(year, month - 1, 1);
                }
            }
        }

        if (value) {
            const parsed = parseIsoDate(value);
            if (parsed) return parsed;
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
                    "h-11 bg-white border-slate-200 rounded-lg focus:bg-white focus:border-[var(--color-synapse-light)] focus:ring-4 focus:ring-(--color-synapse-light)/5 transition-all text-center text-sm pr-10",
                    className
                )}
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={onKeyDown}
                maxLength={5}
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 h-9 w-9 hover:bg-synapse-light/10 rounded-md transition-colors"
                    >
                        <CalendarIcon className="h-4 w-4 text-(--color-synapse-light)" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="w-64 p-3 bg-white rounded-xl shadow-xl border border-slate-100">
                        <div className="space-y-3">
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1">Select Expiry (MM/YYYY)</div>

                            <div className="grid grid-cols-3 gap-1">
                                {months.map((m: string, idx: number) => {
                                    const selectedYear = date ? date.getFullYear() : currentYear;
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
                                                    ? "bg-(--color-synapse-light) text-white shadow-md  "
                                                    : disabled
                                                        ? "text-slate-200 cursor-not-allowed"
                                                        : "hover:bg-slate-50 text-slate-600 hover:text-(--color-synapse-light)"
                                            )}
                                            onClick={() => {
                                                const selectedYr = date ? date.getFullYear() : currentYear;
                                                const newDate = new Date(selectedYr, idx, 1);
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
                                    value={date ? String(date.getFullYear()) : String(currentYear)}
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
                                            <SelectItem key={y} value={String(y)} className="text-xs rounded-lg focus:bg-synapse-light/10">
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="button"
                                className="w-full h-10 text-[10px] font-semibold uppercase tracking-widest bg-(--color-synapse-light) hover:bg-(--color-synapse-light) text-white rounded-lg shadow-lg shadow-indigo-100 transition-all"
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
