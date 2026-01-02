import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import React from "react";
import { DataType } from "./interface";
import { fDate, fTime } from "@/lib/fDateAndTime";
import useGetTest from "@/data/useGetTest";

export default function OrderLab({
  booked,
  setData,
  Labs,
  panels
}: {
  booked: {
    name: string[];
    date: Date;
    lab: string;
    priority: string;
    panels: string[];
  }[];
  setData: (value: React.SetStateAction<DataType>) => void;
  Labs: {
    _id: string;
    name: string;
  }[]
  panels: string[]

}) {

  const { tests } = useGetTest();

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

        {booked?.map((e, idx) => (
          <div
            className="grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wide text-slate-500 mt-2"
            key={idx}
          >
            <div className="col-span-3">
              {
                e.panels?.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))
              }

              {
                !e.panels.find(p => e.panels.includes(p)) && e.name?.map((t, idx) => (
                  <p key={idx}>{tests.find(test => test._id == t)?.name}</p>
                ))
              }
            </div>
            <div className="col-span-2">{Labs.find(l => l._id == e.lab)?.name ?? "Inhouse"}</div>
            <div className="col-span-2">{fDate(e.date)}</div>
            <div className="col-span-2">{fTime(e.date)}</div>
            <div className="col-span-1">{e.priority}</div>
            <div className="col-span-2 text-right flex justify-end gap-2">


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
