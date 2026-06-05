"use client";

import React, { JSX, useMemo } from "react";
import { CheckCircle, Eye, Clock, LucideProps, Package, Trash2, FileEdit } from "lucide-react";
import { motion } from "framer-motion";

type statusType = "Pending" | "Filling" | "Ready" | "Completed" | "Deleted" | "Draft";

export default function PharmacyStatus({
  currenctStatus,
  setCurrenctStatus,
}: {
  currenctStatus: statusType;
  setCurrenctStatus: (status: statusType) => void;
}): JSX.Element {
  const tabs: {
    key: statusType;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  }[] = useMemo(
    () => [
      { key: "Pending", icon: Clock },
      { key: "Filling", icon: Eye },
      { key: "Ready", icon: Package },
      { key: "Completed", icon: CheckCircle },
      { key: "Deleted", icon: Trash2 },
      { key: "Draft", icon: FileEdit},
    ],
    []
  );

  return (
    <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1">
      {tabs.map(({ key, icon: Icon }) => {
        const active = currenctStatus === key;
        return (
          <button
            key={key}
            onClick={() =>
              setCurrenctStatus(
                key
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
              <Icon size={16} /> {key}
            </span>
          </button>
        );
      })}
    </div>
  );
}
