"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarClock, Clock, CheckCircle2, Plus, X } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { DataType } from "./interface";
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
  fDate,
  fTime,
} from "@/lib/fDateAndTime";
import { cn } from "@/lib/utils";
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

interface AdviceProps {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
  doctor?: any;
  patient?: string;
}

export default function Advice({
  data,
  setData,
  doctor,
  patient,
}: AdviceProps) {
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const docId = useMemo(() => {
    if (!doctor) return null;
    if (typeof doctor === "object") return (doctor as any)._id || (doctor as any).id || null;
    return String(doctor);
  }, [doctor]);

  const handleTimeClick = useCallback((time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const ist = combineToIST(selectedDate, time);
      setData((prev) => ({ ...prev, followUp: ist }));
    }
  }, [selectedDate, setData]);

  const { data: availabilityRes } = useSWR<{
    message: string;
    data: {
      startDate: Date;
      endDate: Date;
      startTime: string;
      endTime: string;
      days: string[];
      rounds: Round[];
    };
  }>(docId ? `/users/doctor_availability/${docId}` : null);

  const availability = availabilityRes?.data;

  const bookedParams = useMemo(() => {
    if (!docId || !selectedDate) return null;
    const d = selectedDate;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const qs = new URLSearchParams();
    qs.append("doctor", docId);
    qs.append("date", dateStr);
    return qs.toString();
  }, [docId, selectedDate]);

  const { data: bookedRes, mutate: bookedMutate } = useSWR<{
    message: string;
    data: Date[];
  }>(
    docId && bookedParams ? `/appointments/booked_slot?${bookedParams}` : null
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
    if (!availability) return generateTimeSlots("09:00", "18:00", 10);
    return generateTimeSlots(
      availability.startTime ?? "09:00",
      availability.endTime ?? "18:00",
      10
    );
  }, [availability]);

  const handleDateSelect = (d: Date | undefined) => {
    setSelectedDate(d);
    setSelectedTime("");
    if (!d) {
      setData((prev) => ({ ...prev, followUp: null }));
    }
  };

  const Book = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select time and date");
      return;
    }
    const slotDate = combineToIST(selectedDate, selectedTime);
    if (bookedSlot.includes(slotDate.getTime())) {
      toast.error("This slot is already booked. Please select another time.");
      return;
    }
    if (!docId) {
      toast.error("Doctor information is missing.");
      return;
    }
    await toast.promise(
      api.post("/appointments", {
        patient: patient,
        doctor: docId,
        method: "In clinic",
        date: slotDate.toISOString(),
        isPaid: false,
        type: "Follow up",
      }),
      {
        loading: "Please wait, we’re booking the patient’s slot.",
        success: ({ data }) => data.message,
        error: ({ response }) => response?.data?.message || "Failed to book appointment",
      }
    );
    setData((prev) => ({ ...prev, followUp: slotDate }));
    bookedMutate();
    setShowFollowUp(false);
  };

  return (
    <Card className="mt-4 border-slate-200 shadow-xs">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-(--color-synapse-light)" />
              Advice & Follow-up
            </h2>
            {data.followUp && (
              <div className="inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-1.5 py-0.5 text-xs font-semibold bg-synapse-light/10 text-(--color-synapse-light) border border-synapse-light/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Follow-up: {fDate(data.followUp)} ({fTime(data.followUp)})
                <button
                  type="button"
                  onClick={() => {
                    setData((prev) => ({ ...prev, followUp: null }));
                    setSelectedDate(undefined);
                    setSelectedTime("");
                    toast.success("Follow-up removed");
                  }}
                  className="ml-1 p-0.5 rounded-full hover:bg-synapse-light/20 text-(--color-synapse-light) cursor-pointer"
                  title="Remove follow-up"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant={showFollowUp ? "outline" : "default"}
            onClick={() => {
              const nextState = !showFollowUp;
              setShowFollowUp(nextState);
              if (nextState && !selectedDate) {
                setSelectedDate(startOfToday());
              }
            }}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold shadow-xs cursor-pointer transition-all",
              showFollowUp
                ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                : "bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) text-white"
            )}
          >
            {showFollowUp ? (
              <>
                <X className="w-3.5 h-3.5 mr-1" /> Close Booking
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 mr-1" /> Book Follow Up
              </>
            )}
          </Button>
        </div>

        {/* Advice Textarea */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">
            Clinical Advice & Patient Instructions
          </Label>
          <Textarea
            value={data.advice || ""}
            onChange={(e) =>
              setData((prev) => ({ ...prev, advice: e.target.value }))
            }
            placeholder="Write lifestyle recommendations, dietary advice, precautions, or special instructions for the patient..."
            className="rounded-xl border-slate-200 bg-zinc-50/70 text-xs min-h-22.5 focus-visible:ring-synapse-light/20 focus-visible:border-(--color-synapse-light) transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Embedded Follow-up Booking Section */}
        {showFollowUp && (
          <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4 space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
              <Clock className="w-4 h-4 text-(--color-synapse-light)" />
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-700">
                Select Follow-up Appointment Slot (Optional)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Calendar */}
              <div className="md:col-span-6 bg-white rounded-xl border border-slate-200 p-2 shadow-2xs">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={disabledMatchers}
                  className="rounded-md mx-auto"
                />
              </div>

              {/* Time Slots */}
              <div className="md:col-span-6 bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Available Slots
                    </span>
                    {selectedDate && (
                      <span className="text-xs font-semibold text-slate-700">
                        {fDate(selectedDate)}
                      </span>
                    )}
                  </div>

                  {!selectedDate ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Please pick a date from the calendar first
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
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

                        const active = selectedTime === time;

                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              if (!isDisabled) handleTimeClick(time);
                            }}
                            title={reason}
                            className={cn(
                              "py-1.5 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer text-center",
                              active
                                ? "bg-(--color-synapse-light) text-white border-(--color-synapse-light) font-semibold shadow-2xs"
                                : isDisabled
                                  ? "bg-slate-100/70 text-slate-300 border-slate-100 cursor-not-allowed line-through"
                                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            {to12h(time)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">
                    {selectedDate && selectedTime ? (
                      <span>
                        Slot: <strong className="text-slate-900">{fDate(selectedDate)}</strong> at{" "}
                        <strong className="text-slate-900">{to12h(selectedTime)}</strong>
                      </span>
                    ) : (
                      <span className="text-slate-400">Choose date & slot</span>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={Book}
                    disabled={!selectedDate || !selectedTime}
                    className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) text-white rounded-xl text-xs font-semibold px-4 py-2 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    Confirm Follow-Up
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
