"use client";

import React, { JSX, useState } from "react";
import {
  CheckCircle,
  Clock,
  Bed,
  RefreshCw,
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
  onRefresh,
}: {
  currenctStatus: ScheduleStatus;
  setCurrenctStatus: React.Dispatch<React.SetStateAction<ScheduleStatus>>;
  onRefresh?: () => void | Promise<unknown>;
}): JSX.Element {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mb-4 flex w-full items-center justify-between gap-3">
      <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1">
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
      {onRefresh && (
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          aria-label="Refresh appointments"
          title="Refresh appointments"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-slate-50 hover:text-gray-900 disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      )}
    </div>
  );
}
