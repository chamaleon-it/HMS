"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLabDrafts } from "@/app/dashboard/lab/LabDraftContext";

interface NewTestProps {
  mutate?: () => void;
  defaultBookingType?: "Book Now" | "Schedule";
}

const theme = {
  from: "#4f46e5",
  to: "#ec4899",
};

export default function NewTest({
  mutate,
  defaultBookingType = "Book Now"
}: NewTestProps) {
  const { addDraft } = useLabDrafts();
  const [activeTab, setActiveTab] = useState<"Book Now" | "Schedule">(defaultBookingType);

  useEffect(() => {
    const handleRefresh = () => mutate?.();
    window.addEventListener('lab-test-created', handleRefresh);
    return () => window.removeEventListener('lab-test-created', handleRefresh);
  }, [mutate]);

  return (
    <div className="flex items-center gap-4">
      <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1 shadow-sm">
        {[
          { key: "Book Now", label: "Book now", icon: Zap },
          { key: "Schedule", label: "Schedule", icon: CalendarIcon },
        ].map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key as "Book Now" | "Schedule");
                addDraft({}, key as "Book Now" | "Schedule");
              }}
              className={
                "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer font-medium " +
                (active ? "text-white" : "text-slate-600 hover:bg-slate-50")
              }
              type="button"
            >
              {active && (
                <motion.span
                  layoutId="external-booking-indicator"
                  className="absolute inset-0 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${theme.from}, ${theme.to})` }}
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
    </div>
  );
}
