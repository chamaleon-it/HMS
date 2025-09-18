"use client";

import React, { JSX, useMemo, useState } from "react";
import { CheckCircle, Eye, Clock } from "lucide-react";
import { motion } from "framer-motion";

// -------------------- Types --------------------
type TabKey = "upcoming" | "consulted" | "observation";

type TabMeta = {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};

// -------------------- Seed --------------------

// -------------------- Component --------------------
export default function ScheduleTabsPreview(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");

  const tabs = useMemo<TabMeta[]>(
    () => [
      { key: "upcoming", label: "Upcoming", icon: Clock },
      { key: "consulted", label: "Consulted", icon: CheckCircle },
      { key: "observation", label: "Observation", icon: Eye },
    ],
    []
  );

  return (
    <div className="mb-4 relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1">
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
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
