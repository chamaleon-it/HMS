"use client";

import React, { JSX, useEffect, useMemo } from "react";
import {
  CheckCircle,
  Eye,
  Clock,
  AlertTriangle,
  FlaskConical,
  Bed,
} from "lucide-react";
import { motion } from "framer-motion";
import useSWR from "swr";

export default function ScheduleTabsPreview({
  currenctStatus,
  setCurrenctStatus,
}: {
  currenctStatus: "Upcoming" | "Consulted" | "Observation" | "Not show";
  setCurrenctStatus: React.Dispatch<
    React.SetStateAction<"Upcoming" | "Consulted" | "Observation" | "Not show">
  >;
}): JSX.Element {
  const { data: appointmentStatisticsData, mutate } = useSWR<{
    message: string;
    data: {
      completed: number;
      consulted: number;
      notShow: number;
      observation: number;
      today: number;
      upcoming: number;
      test: number;
      admit: number;
    };
  }>("/appointments/statistics");

  const appointmentStatistics = appointmentStatisticsData?.data ?? {
    completed: 0,
    consulted: 0,
    notShow: 0,
    observation: 0,
    today: 0,
    upcoming: 0,
    test: 0,
    admit: 0,
  };

  useEffect(() => {
    mutate();
  }, [mutate]);

  const tabs = useMemo(
    () => [
      { key: "Upcoming", label: "Upcoming", icon: Clock },
      {
        key: "Test",
        label: `Test Report (${appointmentStatistics.test})`,
        icon: FlaskConical,
      },
      { key: "Consulted", label: "Consulted", icon: CheckCircle },
      { key: "Observation", label: "Observation", icon: Eye },
      { key: "Admit", label: "Admit", icon: Bed },
      { key: "Not show", label: "Not show", icon: AlertTriangle },
    ],
    [appointmentStatistics.test]
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
                key as "Upcoming" | "Consulted" | "Observation" | "Not show"
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
