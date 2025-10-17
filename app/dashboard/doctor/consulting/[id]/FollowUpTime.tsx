import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import React, { useEffect, useMemo, useState } from "react";
import { DataType } from "./interface";
import { to12h } from "@/lib/fDateAndTime";


function genHalfHourTimes(start = 8, end = 20): string[] {
  const out: string[] = [];
  for (let hr = start; hr <= end; hr++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = hr.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      out.push(`${hh}:${mm}`);
    }
  }
  return out;
}

export default function FollowUpTime({
  setData,
}: {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
}) {
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followDay, setFollowDay] = useState<Date | undefined>(undefined);
  const [followTime, setFollowTime] = useState<string>("");
  const followTimes = useMemo(() => genHalfHourTimes(8, 20), []);

  useEffect(() => {
    if (followDay && followTime) {
      const [hours, minutes] = followTime.split(":").map(Number);

      const combinedDate = new Date(followDay);
      combinedDate.setHours(hours, minutes, 0, 0);
      setData((prev) => ({ ...prev, followUp: combinedDate }));
    }
  }, [followDay, followTime,setData]);

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
