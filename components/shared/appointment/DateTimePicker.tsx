import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { UseFormSetValue } from "react-hook-form";
import useSWR from "swr";
import { Matcher } from "react-day-picker";
import {
  combineToIST,
  dayNameToIndex,
  generateTimeSlots,
  isBeforeDay,
  isSameDay,
  startOfDay,
  to12h,
  toMinutes,
  endOfDay,
  startOfToday,
  formatLocalDate,
} from "@/lib/fDateAndTime";
import { cn } from "@/lib/utils";
import WaklInAppoinmentUI from "./WaklInAppoinmentUI";

const getRoundForTime = (
  time: string,
  rounds?: { label: string; start: string; end: string }[]
) => {
  if (!rounds?.length) return null;
  const tm = toMinutes(time);
  return (
    rounds.find((r) => tm >= toMinutes(r.start) && tm <= toMinutes(r.end)) ||
    null
  );
};

interface Props {
  setValue: UseFormSetValue<{
    patient: string;
    doctor: string;
    method: string;
    date: string;
    isPaid: string;
    notes?: string;
    internalNotes?: string;
    type?: string;
  }>;
  doctor: string;
  walkIn: boolean;
}

export default function DateTimePicker({ setValue, doctor, walkIn }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>("");

  const { data: availabilityData, isLoading: isAvailabilityLoading } = useSWR<{
    message: string;
    data: {
      startDate: Date;
      endDate: Date;
      startTime: string;
      endTime: string;
      days: string[];
      rounds: { label: string; start: string; end: string }[];
    };
  }>(doctor ? `/users/doctor_availability/${doctor}` : null);

  const availability = availabilityData?.data;

  const { data: doctorsData } = useSWR<{
    data: {
      _id: string;
      name: string;
      email: string;
    }[];
    message: string;
  }>("/users/doctors", {
    revalidateIfStale: false
  });

  const doctorName = useMemo(() => {
    if (!doctor) return "Doctor";
    const docObj = doctorsData?.data?.find((d) => d._id === doctor);
    return docObj ? `Dr. ${docObj.name}` : "Doctor";
  }, [doctor, doctorsData]);

  const isDoctorAvailable = useMemo(() => {
    if (!doctor) return false;
    if (!availability) return false;
    if (!selectedDate) return false;

    const dateOnly = startOfDay(selectedDate);

    if (availability.startDate) {
      const start = startOfDay(new Date(availability.startDate));
      if (dateOnly < start) return false;
    }

    if (availability.endDate) {
      const end = endOfDay(new Date(availability.endDate));
      if (dateOnly > end) return false;
    }

    if (availability.days?.length) {
      const dayName = selectedDate.toLocaleDateString("en-US", {
        weekday: "short",
      });
      if (!availability.days.includes(dayName)) return false;
    }

    return true;
  }, [doctor, availability, selectedDate]);

  const handleTimeClick = useCallback((time: string) => {
    setSelectedTime(time);
  }, []);

  useEffect(() => {
    if (selectedDate && selectedTime && isDoctorAvailable) {
      const istDate = combineToIST(selectedDate, selectedTime);
      setValue("date", istDate.toISOString());
    }
  }, [selectedDate, selectedTime, isDoctorAvailable, setValue]);

  useEffect(() => {
    if (doctor && !isAvailabilityLoading && !isDoctorAvailable) {
      setSelectedTime("");
      setValue("date", "");
    }
  }, [doctor, isAvailabilityLoading, isDoctorAvailable, setValue]);

  const bookedSlotParam = new URLSearchParams();
  bookedSlotParam.append("doctor", doctor);
  bookedSlotParam.append(
    "date",
    formatLocalDate(selectedDate || new Date())
  );

  const { data: bookedSlotData } = useSWR<{ message: string; data: Date[] }>(
    doctor ? `/appointments/booked_slot?${bookedSlotParam}` : null
  );

  const bookedSlot: Date[] = bookedSlotData?.data ?? [];

  const disabledMatchers = useMemo<Matcher[]>(() => {
    const today = startOfToday();
    const availStart = availability?.startDate
      ? startOfDay(new Date(availability.startDate))
      : today;
    const min = availStart < today ? today : availStart;
    const matchers: Matcher[] = [{ before: min }];
    if (availability?.endDate)
      matchers.push({ after: endOfDay(new Date(availability.endDate)) });
    if (availability?.days?.length) {
      const allowedIndices = availability.days
        .map((d) => dayNameToIndex[d])
        .filter((i) => i !== undefined);
      matchers.push((date: Date) => !allowedIndices.includes(date.getDay()));
    }
    return matchers;
  }, [availability?.startDate, availability?.endDate, availability?.days]);

  const { data: walkInData, isLoading: isWalkInLoading } = useSWR<{
    message: string;
    data: {
      alreadyBooked: Date[];
      nextAvailableDate: Date;
    };
  }>(walkIn && doctor ? `/appointments/walk-in/${doctor}` : null);



  useEffect(() => {
    if (!walkIn || !doctor || !availability || !walkInData?.data) return;

    const now = new Date();
    const today = startOfDay(now);
    const { alreadyBooked, nextAvailableDate } = walkInData.data;

    const bookedSet = new Set(
      (alreadyBooked ?? []).map((d) => new Date(d).getTime())
    );

    // Initial search date should be the server's nextAvailableDate, but we must ensure it's not in the past
    let searchDate = new Date(nextAvailableDate);
    if (searchDate < today) {
      searchDate = new Date(today);
    }

    let foundTime = "";
    let finalSearchDate = new Date(searchDate);

    // Search up to 14 days ahead for the first available future slot
    for (let i = 0; i < 14; i++) {
      const isSearchDayToday = isSameDay(finalSearchDate, today);

      // Calculate cutoff: if today, cutoff is 'now'. If future, cutoff is start of day (-1).
      let currentMinutes = -1;
      if (isSearchDayToday) {
        currentMinutes = now.getHours() * 60 + now.getMinutes();
      }

      const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][finalSearchDate.getDay()];

      if (availability.days.includes(dayName)) {
        // For today's walk-ins, search until nearly midnight to find "Now" slots.
        // For other days, respect the doctor's standard endTime.
        const dayEndTime = isSearchDayToday ? "23:59" : (availability.endTime ?? "18:00");

        const times = generateTimeSlots(
          availability.startTime ?? "09:00",
          dayEndTime,
          1
        );

        // Filter and find the first available slot
        const firstFree = times.find((time) => {
          const tm = toMinutes(time);

          // Must be strictly in the future if today
          if (isSearchDayToday && tm <= currentMinutes) return false;

          // Check if it's within a break/round
          const round = getRoundForTime(time, availability.rounds);
          if (round) return false;

          // Check booking status (only for days the server knows about or all days to be safe)
          const slotDateStr = combineToIST(finalSearchDate, time).getTime();
          if (bookedSet.has(slotDateStr)) return false;

          return true;
        });

        if (firstFree) {
          foundTime = firstFree;
          break;
        }
      }

      // Move to next day
      finalSearchDate.setDate(finalSearchDate.getDate() + 1);
      finalSearchDate = startOfDay(finalSearchDate);
    }

    if (foundTime) {
      const foundDateTime = startOfDay(finalSearchDate).getTime();
      setSelectedDate((prev) =>
        prev?.getTime() === foundDateTime ? prev : new Date(foundDateTime)
      );
      setSelectedTime((prev) => (prev === foundTime ? prev : foundTime));
    } else {
      // Fallback if no slot found in 14 days (unlikely)
      setSelectedTime("");
    }
  }, [walkIn, doctor, availability, walkInData]);

  if (walkIn && !doctor) {
    return null;
  }

  if (walkIn) {
    const isAvailable = !!(availability && selectedTime);
    const isLoading = isAvailabilityLoading || isWalkInLoading;
    return (
      <WaklInAppoinmentUI
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        isAvailable={isAvailable}
        isLoading={isLoading}
        doctorName={doctorName}
      />
    );
  }

  return (
    <div className="col-span-full">
      <Label>Date and time</Label>
      <div className="flex gap-2.5 mt-2.5">
        <Card className="w-[45%] h-[375px] min-h-[375px] flex flex-col items-center justify-center p-3 shrink-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={disabledMatchers}
            className="w-full p-1 [--cell-size:28px] sm:[--cell-size:29px]"
          />
        </Card>

        <div className={cn(
          "h-[375px] min-h-[375px] w-[55%] pr-1",
          doctor && !isAvailabilityLoading && isDoctorAvailable
            ? "grid grid-cols-3 overflow-y-auto overflow-x-hidden content-start gap-1.5"
            : "flex items-center justify-center border border-zinc-200/80 rounded-md bg-zinc-50/50"
        )}>
          {!doctor ? (
            <span className="text-zinc-400 font-medium text-sm text-center">Please select a doctor</span>
          ) : isAvailabilityLoading ? (
            <span className="text-zinc-400 font-medium text-sm text-center animate-pulse">Loading availability...</span>
          ) : !isDoctorAvailable ? (
            <span className="text-zinc-400 font-medium text-sm text-center px-4">{doctorName} is not available on this date</span>
          ) : (
            generateTimeSlots(
              availability?.startTime ?? "09:00",
              availability?.endTime ?? "18:00",
              15
            ).map((time) => {
              const round = getRoundForTime(time, availability?.rounds);
              const isDisabledByRound = !!round;

              const now = new Date();
              const today = startOfDay(now);
              const sel = selectedDate ?? today;

              const isPastDay = isBeforeDay(sel, today);
              const isToday = isSameDay(sel, today);

              const tm = toMinutes(time);
              const nowMins = now.getHours() * 60 + now.getMinutes();
              const isPastTime = isPastDay || (isToday && tm < nowMins);

              const slotDate = combineToIST(sel, time);
              const isBooked = bookedSlot.some(
                (d) => new Date(d).getTime() === slotDate.getTime()
              );

              const isDisabled = isDisabledByRound || isPastTime || isBooked;

              const reason = isDisabledByRound
                ? round?.label ?? "Unavailable"
                : isBooked
                  ? "Already booked"
                  : isPastTime
                    ? "Past time"
                    : undefined;

              const disabledClasses = isDisabledByRound
                ? "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100 hover:text-amber-800 hover:border-amber-300 cursor-not-allowed"
                : isBooked
                  ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-100 hover:text-red-700 hover:border-red-300 cursor-not-allowed"
                  : isPastTime
                    ? "bg-zinc-100 text-zinc-400 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-400 hover:border-zinc-200 cursor-not-allowed"
                    : "";

              return (
                <motion.div
                  key={time}
                  whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                  className="w-full"
                >
                  <Button
                    onClick={() => {
                      if (!isDisabled) handleTimeClick(time);
                    }}
                    type="button"
                    size="sm"
                    variant={selectedTime === time ? "default" : "outline"}
                    disabled={isDisabled}
                    title={reason}
                    className={cn("w-full", !isDisabled && "cursor-pointer", disabledClasses)}
                  >
                    {to12h(time)}
                  </Button>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
