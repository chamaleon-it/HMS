import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { to12h } from "@/lib/fDateAndTime";
import React from "react";

interface Props {
  selectedDate: Date | undefined;
  selectedTime: string;
}

export default function WaklInAppoinmentUI({
  selectedDate,
  selectedTime,
}: Props) {
  return (
    <div className="col-span-full mt-2">
      <Label>Date and time (Auto-selected for Walk-in)</Label>
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
    </div>
  );
}
