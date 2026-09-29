"use client";

import React, { JSX } from "react";
import {
  CheckCircle,
  Clock,
  Bed,
} from "lucide-react";
import { motion } from "framer-motion";

type ScheduleStatus = "Upcoming" | "Consulted" | "Admit";

const tabs: { key: ScheduleStatus; label: string; icon: typeof Clock }[] = [
  { key: "Upcoming", label: "Upcoming", icon: Clock },
  { key: "Consulted", label: "Consulted", icon: CheckCircle },
  { key: "Admit", label: "Admit", icon: Bed },
];

export default function ScheduleTabsPreview({
  currenctStatus,
  setCurrenctStatus,
}: {
  currenctStatus: ScheduleStatus;
  setCurrenctStatus: React.Dispatch<React.SetStateAction<ScheduleStatus>>;
}): JSX.Element {

  return (
    <div className="mb-4 relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1">
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = currenctStatus === key;
        return (
          <button
            key={key}
            onClick={() => setCurrenctStatus(key)}
            className={
              "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer " +
              (active ? "text-white" : "text-gray-700")
            }
            type="button"
          >
            {active && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-full bg-(--color-synapse-light)"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon size={16} /> {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
