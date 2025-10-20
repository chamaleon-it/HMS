import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { UseFormSetValue } from "react-hook-form";
import useSWR from "swr";
import { Matcher } from "react-day-picker";
import { to12h } from "@/lib/fDateAndTime";

function generateTimeSlots(
  start: string,
  end: string,
  intervalMinutes: number
) {
  const times: string[] = [];
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  const current = new Date();
  current.setHours(startH, startM, 0, 0);

  const endDate = new Date();
  endDate.setHours(endH, endM, 0, 0);

  while (current <= endDate) {
    const hh = current.getHours().toString().padStart(2, "0");
    const mm = current.getMinutes().toString().padStart(2, "0");
    times.push(`${hh}:${mm}`);
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return times;
}

function combineToIST(date: Date, time: string) {
  const [h, m] = time.split(":").map(Number);
  const istDate = new Date(date);
  istDate.setHours(h, m, 0, 0);
  return istDate;
}

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};
const startOfToday = () => startOfDay(new Date());

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

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

const isSameDay = (a: Date, b: Date) =>
  startOfDay(a).getTime() === startOfDay(b).getTime();
const isBeforeDay = (a: Date, b: Date) =>
  startOfDay(a).getTime() < startOfDay(b).getTime();

const dayNameToIndex: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export default function DateTimePicker({
  setValue,
  doctor,
}: {
  setValue: UseFormSetValue<{
    patient: string;
    doctor: string;
    method: string;
    date: string;
    isPaid: string;
    notes?: string | undefined;
    internalNotes?: string | undefined;
    type?: string | undefined;
  }>;
  doctor: string;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
  };

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
      rounds: {
        label: string;
        start: string;
        end: string;
      }[];
    };
  }>(doctor ? `/users/doctor_availability/${doctor}` : null);

  const availability = availabilityData?.data;

  const disabledMatchers = useMemo<Matcher[]>(() => {
    const today = startOfToday();

    const availStart = availability?.startDate
      ? startOfDay(new Date(availability.startDate))
      : today;

    const min = availStart < today ? today : availStart;

    const matchers: Matcher[] = [{ before: min }];

    if (availability?.endDate) {
      matchers.push({ after: endOfDay(new Date(availability.endDate)) });
    }

    if (availability?.days?.length) {
      const allowedIndices = availability.days
        .map((d) => dayNameToIndex[d])
        .filter((i) => i !== undefined);
      matchers.push((date: Date) => !allowedIndices.includes(date.getDay()));
    }

    return matchers;
  }, [availability?.startDate, availability?.endDate, availability?.days]);

  return (
    <div className="col-span-full ">
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

            const isDisabled = isDisabledByRound || isPastTime;
            const reason = isDisabledByRound
              ? round?.label ?? "Unavailable"
              : isPastTime
              ? "Past time"
              : undefined;

            const disabledClasses = isDisabledByRound
              ? "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100 hover:text-amber-800 hover:border-amber-300 cursor-not-allowed"
              : isPastTime
              ? "bg-zinc-100 text-zinc-400 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-400 hover:border-zinc-200 cursor-not-allowed"
              : "";

            return (
              <motion.div
                key={time}
                whileTap={{ scale: isDisabledByRound ? 1 : 0.95 }}
                className="w-full"
                onClick={() => {
                  if (!isDisabled) handleTimeClick(time);
                }}
              >
                <Button
                  type="button"
                  size="sm"
                  variant={selectedTime === time ? "default" : "outline"}
                  disabled={isDisabled}
                  title={reason}
                  className={["w-full", disabledClasses]
                    .filter(Boolean)
                    .join(" ")}
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
