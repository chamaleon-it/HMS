import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import React, { Dispatch, SetStateAction, useState } from "react";

function to12h(time24: string): string {
  // expects HH:MM
  const [h, m] = time24.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = ((h + 11) % 12) + 1; // 0->12, 13->1 etc
  return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export default function FollowUpTime({
  followDay,
  setFollowDay,
  followTimes,
  followTime,
  setFollowTime,
}: 
{
    followDay:Date | undefined,
    setFollowDay:Dispatch<SetStateAction<Date | undefined>>,
    followTimes:string[],
    followTime:string,
    setFollowTime: Dispatch<SetStateAction<string>>
}) {
  const [showFollowUp, setShowFollowUp] = useState(false);

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
            selected={followDay}
            onSelect={setFollowDay}
            className="rounded-md"
          />
        </Card>
        <Card className="p-3 sm:col-span-2">
          <div className="text-xs text-slate-500 mb-2">Follow‑up Time</div>
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-auto pr-1">
            {followTimes.map((t: string) => (
              <Button
                key={t}
                size="sm"
                variant={followTime === t ? "default" : "outline"}
                onClick={() => setFollowTime(t)}
              >
                {to12h(t)}
              </Button>
            ))}
          </div>
          <div className="mt-2 text-xs text-slate-600">
            {followDay && followTime ? (
              <span>
                Selected: <strong>{followDay.toDateString()}</strong>
                at <strong>{to12h(followTime)}</strong>
              </span>
            ) : (
              <span>Select a date and time</span>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
