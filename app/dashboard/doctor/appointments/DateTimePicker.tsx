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
  const [selectedTime, setSelectedTime] = useState<string>("09:00");

  const handleTimeClick = useCallback((time: string) => {
  setSelectedTime(time);
}, []);


  useEffect(() => {
    if (selectedDate && selectedTime) {
      const istDate = combineToIST(selectedDate, selectedTime);
      setValue("date", istDate.toISOString());
    }
  }, [selectedDate, selectedTime, setValue]);

  const { data: availabilityData } = useSWR<{
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

  const bookedSlotParam = new URLSearchParams();
  bookedSlotParam.append("doctor", doctor);
  bookedSlotParam.append(
    "date",
    selectedDate ? selectedDate.toISOString() : new Date().toISOString()
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

  const { data: walkInData } = useSWR<{
    message: string;
    data: {
      alreadyBooked: Date[];
      nextAvailableDate: Date;
    };
  }>(walkIn && doctor ? `/appointments/walk-in/${doctor}` : null);

  

  useEffect(() => {
    if (!walkIn || !doctor || !availability || !walkInData?.data) return;

    const { alreadyBooked, nextAvailableDate } = walkInData.data;

    const nextDate = new Date(nextAvailableDate);
    const today = startOfDay(new Date());
    const isNextDayToday = isSameDay(nextDate, today);

    const now = new Date();
    const cutoffMins = isNextDayToday
      ? now.getHours() * 60 + now.getMinutes()
      : -1;

    const bookedSet = new Set(
      (alreadyBooked ?? []).map((d) => new Date(d).getTime())
    );

    const nextDateTime = nextDate.getTime();
    setSelectedDate((prev) =>
      prev?.getTime() === nextDateTime ? prev : nextDate
    );

    const times = generateTimeSlots(
      availability.startTime ?? "09:00",
      availability.endTime ?? "18:00",
      15
    );

    const firstFree = times.find((time) => {
      const round = getRoundForTime(time, availability.rounds);
      if (round) return false;

      const tm = toMinutes(time);
      if (isNextDayToday && tm < cutoffMins) return false;

      const slotDate = combineToIST(nextDate, time);
      if (bookedSet.has(slotDate.getTime())) return false;

      return true;
    });

    setSelectedTime((prev) =>
      prev === (firstFree ?? "09:00") ? prev : firstFree ?? "09:00"
    );
  }, [walkIn, doctor, availability, walkInData]);

  if (walkIn && !doctor) {
    return null;
  }

  if (walkIn) {
    return (
      <WaklInAppoinmentUI
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />
    );
  }

  return (
    <div className="col-span-full">
      <Label>Date and time</Label>
      <div className="flex gap-2.5 mt-2.5">
        <Card className="w-[45%]">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={disabledMatchers}
            className="w-full"
          />
        </Card>

        <div className="grid grid-cols-3 h-80 overflow-y-scroll overflow-hidden gap-1.5 w-[55%]">
          {generateTimeSlots(
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
                  // disabled={isDisabled}
                  title={reason}
                  className={cn("w-full cursor-pointer", disabledClasses)}
                >
                  {to12h(time)}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
