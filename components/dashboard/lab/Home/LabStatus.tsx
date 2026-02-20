"use client";

import React, { JSX, useMemo } from "react";
import { CheckCircle, Eye, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
export default function LabStatus({
  currenctStatus,
  setCurrenctStatus,
}: {
  currenctStatus: "Pending" | "In Progress" | "Completed" | "Flagged";
  setCurrenctStatus: React.Dispatch<
    React.SetStateAction<
      "Pending" | "In Progress" | "Completed" | "Flagged"
    >
  >;
}): JSX.Element {
  const tabs = useMemo(
    () => [

      { key: "Pending", label: "Upcoming", icon: Clock },

      { key: "In Progress", label: "In Progress", icon: Eye },
      { key: "Completed", label: "Completed", icon: CheckCircle },
      { key: "Flagged", label: "Flagged", icon: AlertTriangle },
    ],
    []
  );

  return (
    <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1">
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = currenctStatus === key;
        return (
          <button
            key={key}
            onClick={() =>
              setCurrenctStatus(
                key as "Pending" | "In Progress" | "Completed" | "Flagged"
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
