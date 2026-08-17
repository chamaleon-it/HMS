import { Button } from "@/components/ui/button";
import { Trash, TestTubeDiagonal } from "lucide-react";
import React from "react";
import { DataType } from "./interface";
import { fDate, fTime } from "@/lib/fDateAndTime";
import useGetTest from "@/data/useGetTest";
import useGetPanels from "@/data/useGetPanels";
import { getFormattedInvestigationNames } from "@/lib/investigationUtils";

export default function OrderLab({
  booked,
  setData,
  Labs,
  panels,
}: {
  booked: {
    name: string[];
    date: Date;
    lab: string;
    priority: string;
    panels: string[];
  }[];
  setData: React.Dispatch<React.SetStateAction<DataType>>;
  Labs: {
    _id: string;
    name: string;
  }[];
  panels: string[];
}) {
  const { tests } = useGetTest();
  const { panels: panelsCatalog } = useGetPanels();

  if (!booked.length) return null;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mt-3">
      <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TestTubeDiagonal className="w-4 h-4 text-(--color-synapse-light)" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Prescribed Investigations ({booked.length})
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/40">
          <div className="col-span-5">Test / Panel</div>
          <div className="col-span-3">Date & Time</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {booked.map((e, idx) => (
          <div
            className="grid grid-cols-12 gap-2 px-4 py-2.5 text-xs items-center hover:bg-slate-50/50 transition-colors"
            key={idx}
          >
            <div className="col-span-5">
              <div className="flex flex-wrap gap-1">
                {getFormattedInvestigationNames(e, tests, panelsCatalog).map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-synapse-light/10 text-(--color-synapse-light) font-semibold text-xs border border-synapse-light/20"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="col-span-3 text-slate-600 font-medium">
              {fDate(e.date)} <span className="text-slate-400">• {fTime(e.date)}</span>
            </div>
            <div className="col-span-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                {e.priority || "Normal"}
              </span>
            </div>
            <div className="col-span-2 text-right flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const newBooked = booked.filter((_, i) => i !== idx);
                  setData((prev) => ({ ...prev, test: newBooked }));
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Remove Test"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
