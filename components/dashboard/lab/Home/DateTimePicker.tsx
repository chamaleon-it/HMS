"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { combineToIST, fDate, fTime } from "@/lib/fDateAndTime";

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
            <TimePicker date={date} setDate={setDate} />
        </div>
    );
}

function TimePicker({ date, setDate }: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i); // Using 15min intervals for better UX, can be adjusted
    const ampm = ["AM", "PM"];

    const selectedHour = date ? (date.getHours() % 12 || 12) : 12;
    const selectedMinute = date ? Math.floor(date.getMinutes() / 15) * 15 : 0;
    const selectedAMPM = date ? (date.getHours() >= 12 ? "PM" : "AM") : "AM";

    const handleTimeSelect = (type: "hour" | "minute" | "ampm", value: string | number) => {
        if (!date) return;
        const newDate = new Date(date);
        let h = newDate.getHours();
        let m = newDate.getMinutes();

        if (type === "hour") {
            const isPM = h >= 12;
            h = Number(value);
            if (isPM && h !== 12) h += 12;
            if (!isPM && h === 12) h = 0;
        } else if (type === "minute") {
            m = Number(value);
        } else if (type === "ampm") {
            if (value === "PM" && h < 12) h += 12;
            if (value === "AM" && h >= 12) h -= 12;
        }

        const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        setDate(combineToIST(new Date(date), timeStr));
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-32 justify-between font-normal"
                >
                    {date ? fTime(date) : "Time"}
                    <Clock className="h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex h-64">
                    <ScrollArea className="w-16 border-r">
                        <div className="flex flex-col p-2">
                            {hours.map((h) => (
                                <Button
                                    key={h}
                                    variant={selectedHour === h ? "default" : "ghost"}
                                    size="sm"
                                    className="w-full shrink-0"
                                    onClick={() => handleTimeSelect("hour", h)}
                                >
                                    {h}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                    <ScrollArea className="w-16 border-r">
                        <div className="flex flex-col p-2">
                            {minutes.map((m) => (
                                <Button
                                    key={m}
                                    variant={selectedMinute === m ? "default" : "ghost"}
                                    size="sm"
                                    className="w-full shrink-0"
                                    onClick={() => handleTimeSelect("minute", m)}
                                >
                                    {m.toString().padStart(2, "0")}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                    <ScrollArea className="w-20">
                        <div className="flex flex-col p-2">
                            {ampm.map((a) => (
                                <Button
                                    key={a}
                                    variant={selectedAMPM === a ? "default" : "ghost"}
                                    size="sm"
                                    className="w-full shrink-0"
                                    onClick={() => handleTimeSelect("ampm", a)}
                                >
                                    {a}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </PopoverContent>
        </Popover>
    );
}
