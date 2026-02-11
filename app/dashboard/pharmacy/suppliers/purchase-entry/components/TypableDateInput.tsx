"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TypableDateInputProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    className?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const TypableDateInput = ({
    value,
    onChange,
    placeholder = "DD/MM/YY",
    className,
    onKeyDown
}: TypableDateInputProps) => {
    const [displayValue, setDisplayValue] = useState("");
    const [open, setOpen] = useState(false);

    // Convert yyyy-MM-dd to DD/MM/YY for display
    useEffect(() => {
        if (value) {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = String(date.getFullYear()).slice(-2);
                    setDisplayValue(`${day}/${month}/${year}`);
                }
            } catch (e) {
                setDisplayValue("");
            }
        } else {
            setDisplayValue("");
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value.replace(/[^0-9]/g, ''); // Remove non-digits

        // Auto-format with slashes
        if (input.length >= 2) {
            input = input.slice(0, 2) + '/' + input.slice(2);
        }
        if (input.length >= 5) {
            input = input.slice(0, 5) + '/' + input.slice(5, 7);
        }

        setDisplayValue(input);

        // Parse and validate complete date (DD/MM/YY)
        if (input.length === 8) {
            const parts = input.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10) + 2000; // Assume 20xx

                // Basic validation
                if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
                    // Convert to yyyy-MM-dd format
                    const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    onChange(isoDate);
                }
            }
        }
    };

    // Parse displayValue to get the typed date, fall back to value or undefined
    const getDisplayDate = () => {
        // First try to parse what the user is typing (DD/MM/YY)
        if (displayValue) {
            const parts = displayValue.split('/');
            if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10) + 2000;

                // If day, month and year are valid, use them
                if (!isNaN(day) && !isNaN(month) && !isNaN(year) &&
                    day >= 1 && day <= 31 && month >= 1 && month <= 12 &&
                    year >= 2000 && year <= 2100) {
                    return new Date(year, month - 1, day);
                }
            }
        }

        // Fall back to the value prop
        if (value) {
            return new Date(value);
        }

        return undefined;
    };

    const date = getDisplayDate();

    return (
        <div className="relative flex items-center gap-1">
            <Input
                type="text"
                placeholder={placeholder}
                className={cn(
                    "h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all text-center pr-10",
                    className
                )}
                value={displayValue}
                onChange={handleChange}
                onKeyDown={onKeyDown}
                maxLength={8}
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
                    <Calendar
                        mode="single"
                        selected={date}
                        defaultMonth={date}
                        onSelect={(d) => {
                            if (d) {
                                onChange(format(d, "yyyy-MM-dd"));
                                setOpen(false);
                            }
                        }}
                        initialFocus
                        className="rounded-xl border-none shadow-none"
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default TypableDateInput;
