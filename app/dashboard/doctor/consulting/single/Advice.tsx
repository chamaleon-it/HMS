import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarClock } from "lucide-react";
import React from "react";
import { DataType } from "./interface";

export default function Advice({
  data,
  setData,
}: {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
}) {
  return (
    <>
      <Label className="flex items-center gap-2">
        <CalendarClock className="w-4 h-4" /> Advice & Follow-up
      </Label>
      <Textarea
        value={data.advice || ""}
        onChange={(e) =>
          setData((prev) => ({ ...prev, advice: e.target.value }))
        }
        className="mt-2"
      />
    </>
  );
}
