"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const TREATMENT_STATUSES = [
  { label: "All", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "In-Progress", value: "In-Progress" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
];

interface Props {
  currentStatus: string;
  setCurrentStatus: (status: string) => void;
  counts?: Record<string, number>;
}

export default function TreatmentStatusFilter({
  currentStatus,
  setCurrentStatus,
  counts,
}: Props) {
  return (
    <div className="relative inline-flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-full w-fit shadow-sm overflow-x-auto">
      {TREATMENT_STATUSES.map((item) => {
        const isActive = currentStatus === item.value;
        const count = counts ? counts[item.value] : undefined;

        return (
          <button
            key={item.value}
            onClick={() => setCurrentStatus(item.value)}
            className={cn(
              "relative px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5",
              isActive
                ? "text-white"
                : "text-gray-500 hover:text-gray-800"
            )}
            type="button"
          >
            {isActive && (
              <motion.span
                layoutId="treatment-status-filter-indicator"
                className="absolute inset-0 rounded-full shadow-md bg-(--color-synapse-light)"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
            {count !== undefined && (
              <span
                className={cn(
                  "relative z-10 px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-slate-200 text-slate-700"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
