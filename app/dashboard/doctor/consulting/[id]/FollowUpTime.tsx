import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
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
import { DataType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";

type Round = { label: string; start: string; end: string };

function getRoundForTime(time: string, rounds?: Round[]) {
  if (!rounds?.length) return null;
  const tm = toMinutes(time);
  return (
    rounds.find((r) => tm >= toMinutes(r.start) && tm <= toMinutes(r.end)) ||
    null
  );
}

interface FollowUpProps {
  doctor?: string;
  patient?: string;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
}

export default function FollowUpTimePro({
  doctor,
  patient,
  setData,
}: FollowUpProps) {
  const [showFollowUp, setShowFollowUp] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleTimeClick = useCallback((time: string) => {
    setSelectedTime(time);
  }, []);

  const { data: availabilityRes, mutate: availabilityMutate } = useSWR<{
    message: string;
    data: {
      startDate: Date;
      endDate: Date;
      startTime: string;
      endTime: string;
      days: string[];
      rounds: Round[];
    };
  }>(doctor ? `/users/doctor_availability/${doctor}` : null);

  const availability = availabilityRes?.data;

  useEffect(() => {
    if (!availability) return;

    const today = startOfToday();
    const availStart = availability.startDate
      ? startOfDay(new Date(availability.startDate))
      : today;
    const min = availStart < today ? today : availStart;
    const max = availability.endDate
      ? endOfDay(new Date(availability.endDate))
      : undefined;
    const allowedIdx = (availability.days ?? [])
      .map((d) => dayNameToIndex[d])
      .filter((i) => i !== undefined) as number[];

    const pickNextAllowed = (seed: Date) => {
      const dt = startOfDay(new Date(seed));
      for (let i = 0; i < 90; i++) {
        const cand = new Date(
          dt.getFullYear(),
          dt.getMonth(),
          dt.getDate() + i
        );
        const candStart = startOfDay(cand);
        if (max && candStart > max) break;
        if (allowedIdx.length && !allowedIdx.includes(candStart.getDay()))
          continue;
        return candStart;
      }
      return undefined;
    };

    const initial = pickNextAllowed(min);
    setSelectedDate((prev) => prev ?? initial ?? today);
  }, [availability]);

  const bookedParams = useMemo(() => {
    if (!doctor) return null;
    const d = selectedDate ?? new Date();
    const qs = new URLSearchParams();
    qs.append("doctor", doctor);
    qs.append("date", d.toISOString());
    return qs.toString();
  }, [doctor, selectedDate]);

  const { data: bookedRes, mutate: bookedMutate } = useSWR<{
    message: string;
    data: Date[];
  }>(
    doctor && bookedParams ? `/appointments/booked_slot?${bookedParams}` : null
  );
  const bookedSlot: number[] = useMemo(
    () => (bookedRes?.data ?? []).map((d) => new Date(d).getTime()),
    [bookedRes?.data]
  );

  const disabledMatchers = useMemo<Matcher[]>(() => {
    if (!availability) return [{ before: startOfToday() }];
    const today = startOfToday();
    const availStart = availability.startDate
      ? startOfDay(new Date(availability.startDate))
      : today;
    const min = availStart < today ? today : availStart;
    const matchers: Matcher[] = [{ before: min }];
    if (availability.endDate)
      matchers.push({ after: endOfDay(new Date(availability.endDate)) });
    if (availability.days?.length) {
      const allowedIndices = availability.days
        .map((d) => dayNameToIndex[d])
        .filter((i) => i !== undefined) as number[];
      matchers.push((date: Date) => !allowedIndices.includes(date.getDay()));
    }
    return matchers;
  }, [availability]);

  const timeSlots = useMemo(() => {
    if (!availability) return generateTimeSlots("09:00", "18:00", 15);
    return generateTimeSlots(
      availability.startTime ?? "09:00",
      availability.endTime ?? "18:00",
      15
    );
  }, [availability]);

  useEffect(() => {
    if (!selectedDate || !availability) return;

    const now = new Date();
    const today = startOfDay(now);
    const isToday = isSameDay(selectedDate, today);
    const nowMins = now.getHours() * 60 + now.getMinutes();

    const firstFree = timeSlots.find((time) => {
      const round = getRoundForTime(time, availability.rounds);
      if (round) return false;

      const tm = toMinutes(time);
      if (isToday && tm < nowMins) return false;

      const slotDate = combineToIST(selectedDate, time);
      if (bookedSlot.includes(slotDate.getTime())) return false;

      return true;
    });

    setSelectedTime((prev) => (prev ? prev : firstFree ?? ""));
  }, [selectedDate, availability, timeSlots, bookedSlot]);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      const ist = combineToIST(selectedDate, selectedTime);
      setData((prev) => ({ ...prev, followUp: ist }));
    }
  }, [selectedDate, selectedTime, setData]);

  const Book = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please selete time and date");
      return;
    }
    await toast.promise(
      api.post("/appointments", {
        patient: patient,
        doctor: doctor,
        method: "In clinic",
        date: combineToIST(
          selectedDate || new Date(),
          selectedTime
        ).toISOString(),
        isPaid: false,
        type: "Follow up",
      }),
      {
        loading: "Please wait, we’re booking the patient’s slot.",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      }
    );
    bookedMutate();
  };

  useEffect(() => {
    availabilityMutate();
    bookedMutate();
  }, [availabilityMutate, bookedMutate]);

  if (!showFollowUp) {
    return (
      <div className="flex justify-start">
        <Button
          onClick={() => setShowFollowUp(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Book Follow Up
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-start">
        <Button
          onClick={() => setShowFollowUp(false)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Hide Follow Up
        </Button>
      </div>

      <div className="grid sm:grid-cols-4 gap-3 mt-3">
        <Card className="p-2 sm:col-span-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => {
              setSelectedDate(d);
              setSelectedTime(""); // reset time so auto-pick can run
            }}
            disabled={disabledMatchers}
            className="rounded-md"
          />
        </Card>

        <Card className="p-3 sm:col-span-2">
          <div className="text-xs text-slate-500 mb-2">Follow-up Time</div>
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-auto pr-1">
            {timeSlots.map((time) => {
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
              const isBooked = bookedSlot.includes(slotDate.getTime());

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
                <div key={time} className="w-full">
                  <Button
                    onClick={() => {
                      if (!isDisabled) handleTimeClick(time);
                    }}
                    type="button"
                    size="sm"
                    variant={selectedTime === time ? "default" : "outline"}
                    title={reason}
                    className={cn("w-full cursor-pointer", disabledClasses)}
                  >
                    {to12h(time)}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-2 text-xs text-slate-600">
            {selectedDate && selectedTime ? (
              <span>
                Selected: <strong>{selectedDate.toDateString()}</strong> at{" "}
                <strong>{to12h(selectedTime)}</strong>
              </span>
            ) : (
              <span>Select a date and time</span>
            )}
          </div>
        </Card>
      </div>
      <div className="flex justify-end">
        <Button onClick={Book}>Book</Button>
      </div>
    </>
  );
}
