"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { combineToIST, fDate } from "@/lib/fDateAndTime";

interface DateTimePickerProps {
    date: Date | undefined;
    setDate: (date: Date) => void;
}

export default function DateTimePicker({ date, setDate }: DateTimePickerProps) {
    const [openDate, setOpenDate] = useState(false);

    return (
        <div className="flex gap-2">
            <Popover open={openDate} onOpenChange={setOpenDate}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date"
                        className="w-48 justify-between font-normal"
                    >
                        {date ? fDate(date) : "Select date"}
                        <ChevronDownIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        startMonth={new Date(2025, 0)}
                        endMonth={new Date(2027, 0)}
                        onSelect={(selectedDate) => {
                            if (!selectedDate) return;
                            const timeStr = date
                                ? `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
                                : `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`;
                            setDate(combineToIST(selectedDate, timeStr));
                            setOpenDate(false);
                        }}
                        disabled={(d) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return d < today;
                        }}
                    />
                </PopoverContent>
            </Popover>
            <Input
                type="time"
                id="time-picker"
                step="1800"
                value={
                    date
                        ? `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
                        : ""
                }
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                onChange={(e) => {
                    const timeStr = e.target.value;
                    if (!timeStr) return;
                    const baseDate = date || new Date();
                    setDate(combineToIST(baseDate, timeStr));
                }}
            />
        </div>
    );
}
