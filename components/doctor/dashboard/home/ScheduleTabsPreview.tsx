"use client";

import React, { JSX, useMemo } from "react";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import useSWR from "swr";

export default function ScheduleTabsPreview({
  currenctStatus,
  setCurrenctStatus,
}: {
  currenctStatus: "Upcoming" | "Consulted" | "Not show";
  setCurrenctStatus: React.Dispatch<
    React.SetStateAction<"Upcoming" | "Consulted" | "Not show">
  >;
}): JSX.Element {
  const { data: appointmentStatisticsData } = useSWR<{
    message: string;
    data: {
      consulted: number;
      notShow: number;
      today: number;
      upcoming: number;
    };
  }>("/appointments/statistics");

  const appointmentStatistics = appointmentStatisticsData?.data ?? {
    consulted: 0,
    notShow: 0,
    today: 0,
    upcoming: 0,
  };

  const tabs = useMemo(
    () => [
      { key: "Upcoming", label: "Upcoming", icon: Clock },
      { key: "Consulted", label: "Consulted", icon: CheckCircle },
      { key: "Not show", label: "Not show", icon: AlertTriangle },
    ],
    []
  );

  return (
    <div className="mb-4 relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1">
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = currenctStatus === key;
        return (
          <button
            key={key}
            onClick={() =>
              setCurrenctStatus(
                key as "Upcoming" | "Consulted" | "Not show"
              )
            }
            className={
              "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer " +
              (active ? "text-white" : "text-gray-700")
            }
            type="button"
          >
            {active && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-full"
                style={{ background: "linear-gradient(90deg,#4f46e5,#d946ef)" }}
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
