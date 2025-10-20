import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import React from "react";
import { DataType } from "./interface";

export default function OrderLab({
  booked,
  setData,
}: {
  booked: {
    name: string[];
    date: Date;
    lab: string;
    slot: string;
    priority: string;
  }[];
  setData: (value: React.SetStateAction<DataType>) => void;
}) {
  return (
    <div className="border rounded-xl p-4">
      {/* Dynamic rows */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wide text-black mt-2 font-medium">
          <div className="col-span-3">Tests</div>
          <div className="col-span-2">Lab</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Time</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {booked.map((e, idx) => (
          <div
            className="grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wide text-slate-500 mt-2"
            key={idx}
          >
            <div className="col-span-3">
              {e.name?.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </div>
            <div className="col-span-2">{e.lab}</div>
            <div className="col-span-2">{e.date.toDateString()}</div>
            <div className="col-span-2">
              {e.lab === "In house" ? "-" : e.slot}
            </div>
            <div className="col-span-1">{e.priority}</div>
            <div className="col-span-2 text-right flex justify-end gap-2">
              {/* <Button
                className="!bg-green-600 hover:!bg-green-700 text-white !border-green-600"
                title="Edit Test"
              >
                <Pencil  className="w-4 h-4"/>
              </Button> */}

              <Button
                onClick={() => {
                  const newBooked = booked.filter((_, i) => i !== idx);
                  setData((prev) => ({ ...prev, test: newBooked }));
                }}
                className="!bg-red-600 hover:!bg-red-700 text-white !border-red-600 cursor-pointer"
                title="Remove Test"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
