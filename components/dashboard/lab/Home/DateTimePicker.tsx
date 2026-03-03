"use client";

import { useRef, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Clock, ChevronDownIcon } from "lucide-react";
import { combineToIST, fDate, fTime } from "@/lib/fDateAndTime";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DateTimePickerProps {
    date: Date | undefined;
    setDate: (date: Date) => void;
}

export default function DateTimePicker({ date, setDate }: DateTimePickerProps) {
    const formatToDDMMYY = (d: Date | undefined) => {
        if (!d) return "";
        return format(d, "dd/MM/yy");
    };

    const [openDate, setOpenDate] = useState(false);
    const [inputValue, setInputValue] = useState(formatToDDMMYY(date));

    useEffect(() => {
        setInputValue(formatToDDMMYY(date));
    }, [date]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, ""); // Remove non-digits
        if (val.length > 6) val = val.slice(0, 6); // Max 6 digits

        let formatted = val;
        if (val.length > 2 && val.length <= 4) {
            formatted = `${val.slice(0, 2)}/${val.slice(2)}`;
        } else if (val.length > 4) {
            formatted = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
        }
        setInputValue(formatted);
    };

    const handleInputBlur = () => {
        if (!inputValue) return;

        // Parse DD/MM/YY
        const match = inputValue.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);

        let isValidDate = false;
        let parsedDate = new Date();

        if (match) {
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1; // 0-indexed
            const year = parseInt(match[3], 10) + 2000;

            parsedDate = new Date(year, month, day);

            // Validate that Date object didn't wrap around (e.g., 32/01/2026 -> 01/02/2026)
            if (parsedDate.getDate() === day && parsedDate.getMonth() === month && parsedDate.getFullYear() === year) {
                // Ensure date is greater than or equal to today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (parsedDate >= today) {
                    isValidDate = true;
                }
            }
        }

        if (isValidDate) {
            const timeStr = date
                ? `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
                : `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`;
            setDate(combineToIST(parsedDate, timeStr));
        } else {
            setInputValue(formatToDDMMYY(date));
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Popover open={openDate} onOpenChange={setOpenDate}>
                <PopoverTrigger asChild>
                    <div className="relative w-48">
                        <Input
                            className="pr-8"
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleInputBlur();
                                    setOpenDate(false);
                                }
                            }}
                            placeholder="DD/MM/YY"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full w-8 hover:bg-transparent"
                            onClick={() => setOpenDate(!openDate)}
                        >
                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                        </Button>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
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
    const [timeInputValue, setTimeInputValue] = useState(date ? fTime(date) : "");

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    const ampm = ["AM", "PM"];

    const scrollRefH = useRef<HTMLDivElement>(null);
    const scrollRefM = useRef<HTMLDivElement>(null);
    const scrollRefA = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startY = useRef(0);
    const startScrollTop = useRef(0);

    const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
        isDragging.current = false;
        const ele = e.currentTarget;
        ele.dataset.isDown = "true";
        startY.current = e.pageY - ele.offsetTop;
        startScrollTop.current = ele.scrollTop;
    };

    const handleDragEnd = (e: React.MouseEvent<HTMLDivElement>) => {
        const ele = e.currentTarget;
        ele.dataset.isDown = "false";
        setTimeout(() => {
            isDragging.current = false;
        }, 50);
    };

    const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const ele = e.currentTarget;
        if (ele.dataset.isDown !== "true") return;

        const y = e.pageY - ele.offsetTop;
        const walk = y - startY.current;

        if (Math.abs(walk) > 5) {
            isDragging.current = true;
        }

        if (isDragging.current) {
            e.preventDefault();
            ele.scrollTop = startScrollTop.current - walk;
        }
    };

    const selectedHour = date ? (date.getHours() % 12 || 12) : 12;
    const selectedMinute = date ? date.getMinutes() : 0;
    const selectedAMPM = date ? (date.getHours() >= 12 ? "PM" : "AM") : "AM";

    useEffect(() => {
        setTimeInputValue(date ? fTime(date) : "");
    }, [date]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                const hScroll = scrollRefH.current?.querySelector(`[data-selected="true"]`);
                const mScroll = scrollRefM.current?.querySelector(`[data-selected="true"]`);
                const aScroll = scrollRefA.current?.querySelector(`[data-selected="true"]`);

                if (hScroll) hScroll.scrollIntoView({ block: "center", behavior: "smooth" });
                if (mScroll) mScroll.scrollIntoView({ block: "center", behavior: "smooth" });
                if (aScroll) aScroll.scrollIntoView({ block: "center", behavior: "smooth" });
            }, 10);
        }
    }, [isOpen]);

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

    const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.toUpperCase().replace(/[^0-9APM]/g, "");

        // Extract numbers and letters separately
        const numbers = val.replace(/\D/g, "").slice(0, 4);
        const letters = val.replace(/[^APM]/g, "").slice(0, 2);

        let formatted = numbers;

        // Auto colon formatting
        if (numbers.length > 2) {
            formatted = `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
        }

        // Auto append A/P as AM/PM
        if (letters.includes('A')) {
            formatted += " AM"
        } else if (letters.includes('P')) {
            formatted += " PM"
        }

        setTimeInputValue(formatted);
    };

    const handleTimeInputBlur = () => {
        if (!timeInputValue || !date) {
            setTimeInputValue(date ? fTime(date) : "");
            return;
        }

        // Simple regex to parse time strings like "10:30 AM", "10:30", "10 AM"
        const match = timeInputValue.match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)?$/i);
        if (match) {
            let [, hStr, mStr, ampmStr] = match;
            let h = parseInt(hStr);
            let m = parseInt(mStr || "0");
            const isPM = ampmStr?.toUpperCase() === "PM";
            const isAM = ampmStr?.toUpperCase() === "AM";

            if (isPM && h < 12) h += 12;
            if (isAM && h === 12) h = 0;
            if (h >= 0 && h < 24 && m >= 0 && m < 60) {
                const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
                setDate(combineToIST(new Date(date), timeStr));
                return;
            }
        }
        setTimeInputValue(date ? fTime(date) : "");
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div className="relative w-32 group flex items-center">
                    <Input
                        className="pr-8 transition-all duration-200 focus:border-primary/50 focus:ring-primary/20"
                        value={timeInputValue}
                        onChange={handleTimeInputChange}
                        onBlur={handleTimeInputBlur}
                        onKeyDown={(e) => e.key === "Enter" && handleTimeInputBlur()}
                        placeholder="HH:MM AM"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-8 hover:bg-transparent text-muted-foreground group-hover:text-primary transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <Clock className="h-4 w-4" />
                    </Button>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 shadow-xl border-primary/10 rounded-xl overflow-hidden" align="start">
                <div className="bg-muted/30 border-b px-3 py-2 flex justify-between items-center">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Time</span>
                    <Clock className="h-3.5 w-3.5 text-muted-foreground/50" />
                </div>
                <div className="flex h-72">
                    {/* Hours Column */}
                    <div className="flex-1 flex flex-col border-r border-border/50">
                        <div className="text-[10px] uppercase font-bold text-center py-1.5 text-muted-foreground bg-muted/20 border-b">Hrs</div>
                        <div
                            ref={scrollRefH}
                            className="flex-1 overflow-y-auto overscroll-contain py-1 cursor-grab active:cursor-grabbing scrollbar-hide select-none scroll-smooth"
                            onMouseDown={handleDragStart}
                            onMouseUp={handleDragEnd}
                            onMouseLeave={handleDragEnd}
                            onMouseMove={handleDragMove}
                            onWheel={(e) => {
                                if (scrollRefH.current) {
                                    scrollRefH.current.scrollBy({
                                        top: e.deltaY,
                                        behavior: "smooth"
                                    });
                                }
                            }}
                        >
                            <div className="flex flex-col px-1.5 gap-0.5 pointer-events-none *:pointer-events-auto">
                                {hours.map((h) => (
                                    <Button
                                        key={h}
                                        variant={selectedHour === h ? "default" : "ghost"}
                                        size="sm"
                                        data-selected={selectedHour === h}
                                        className={cn(
                                            "w-full h-8 px-0 text-sm font-medium transition-all duration-200",
                                            selectedHour === h
                                                ? "bg-primary shadow-sm scale-105 rounded-md"
                                                : "hover:bg-primary/10 rounded-md"
                                        )}
                                        onClick={(e) => {
                                            if (isDragging.current) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                return;
                                            }
                                            handleTimeSelect("hour", h);
                                        }}
                                    >
                                        {h}
                                    </Button>
                                ))}
                                <div className="h-24 shrink-0" /> {/* Bottom Padding for centering */}
                            </div>
                        </div>
                    </div>

                    {/* Minutes Column */}
                    <div className="flex-1 flex flex-col border-r border-border/50">
                        <div className="text-[10px] uppercase font-bold text-center py-1.5 text-muted-foreground bg-muted/20 border-b">Min</div>
                        <div
                            ref={scrollRefM}
                            className="flex-1 overflow-y-auto scrollbar-hide py-1 cursor-grab active:cursor-grabbing select-none scroll-smooth"
                            onMouseDown={handleDragStart}
                            onMouseUp={handleDragEnd}
                            onMouseLeave={handleDragEnd}
                            onMouseMove={handleDragMove}
                            onWheel={(e) => {
                                if (scrollRefM.current) {
                                    scrollRefM.current.scrollBy({
                                        top: e.deltaY,
                                        behavior: "smooth"
                                    });
                                }
                            }}
                        >
                            <div className="flex flex-col px-1.5 gap-0.5 pointer-events-none *:pointer-events-auto">
                                {minutes.map((m) => (
                                    <Button
                                        key={m}
                                        variant={selectedMinute === m ? "default" : "ghost"}
                                        size="sm"
                                        data-selected={selectedMinute === m}
                                        className={cn(
                                            "w-full h-8 px-0 text-sm font-medium transition-all duration-200",
                                            selectedMinute === m
                                                ? "bg-primary shadow-sm scale-105 rounded-md"
                                                : "hover:bg-primary/10 rounded-md"
                                        )}
                                        onClick={(e) => {
                                            if (isDragging.current) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                return;
                                            }
                                            handleTimeSelect("minute", m);
                                        }}
                                    >
                                        {m.toString().padStart(2, "0")}
                                    </Button>
                                ))}
                                <div className="h-24 shrink-0" /> {/* Bottom Padding for centering */}
                            </div>
                        </div>
                    </div>

                    {/* AM/PM Column */}
                    <div className="w-20 flex flex-col bg-muted/5">
                        <div className="text-[10px] uppercase font-bold text-center py-1.5 text-muted-foreground bg-muted/20 border-b">AM/PM</div>
                        <div ref={scrollRefA} className="flex-1 flex flex-col justify-center gap-1.5 p-2">
                            {ampm.map((a) => (
                                <Button
                                    key={a}
                                    variant={selectedAMPM === a ? "default" : "ghost"}
                                    size="sm"
                                    data-selected={selectedAMPM === a}
                                    className={cn(
                                        "w-full h-10 text-sm font-bold transition-all duration-200",
                                        selectedAMPM === a
                                            ? "bg-primary shadow-md scale-105 rounded-md"
                                            : "hover:bg-primary/10 border border-transparent rounded-md"
                                    )}
                                    onClick={() => handleTimeSelect("ampm", a)}
                                >
                                    {a}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-2 border-t bg-muted/10 flex justify-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] uppercase font-bold text-primary hover:bg-primary/10"
                        onClick={() => setIsOpen(false)}
                    >
                        Done
                    </Button>
                </div>
            </PopoverContent >
        </Popover >
    );
}
