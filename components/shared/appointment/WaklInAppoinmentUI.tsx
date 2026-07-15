import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { to12h } from "@/lib/fDateAndTime";
import React from "react";

interface Props {
  selectedDate: Date | undefined;
  selectedTime: string;
  isAvailable?: boolean;
  isLoading?: boolean;
  doctorName?: string;
}

export default function WaklInAppoinmentUI({
  selectedDate,
  selectedTime,
  isAvailable = true,
  isLoading = false,
  doctorName = "Doctor",
}: Props) {
  return (
    <div className="col-span-full mt-2">
      <Label>Date and time (Auto-selected for Walk-in)</Label>
      {isLoading ? (
        <div className="mt-2 flex items-center justify-center border border-zinc-200/80 rounded-md bg-zinc-50/50 h-[60px] text-zinc-400 font-medium text-sm">
          Loading availability...
        </div>
      ) : !isAvailable ? (
        <div className="mt-2 flex items-center justify-center border border-zinc-200/80 rounded-md bg-zinc-50/50 h-[60px] text-zinc-400 font-medium text-sm text-center px-4">
          {doctorName} is not available
        </div>
      ) : (
        <Card className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-2 px-3 py-2 border border-muted bg-muted/30">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-muted-foreground">Date:</span>
            <span className="text-foreground">
              {selectedDate
                ? selectedDate.toLocaleDateString("en-IN", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "-"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-muted-foreground">Time:</span>
            <span className="text-foreground">
              {selectedTime ? to12h(selectedTime) : "-"}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
