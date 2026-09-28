"use client";

import { UserPlus, UserRound } from "lucide-react";
import { AnimatedTabs } from "@/components/ui/animated-tabs";

export type PatientMode = "new" | "existing";

const STORAGE_KEY = "billing-patient-mode";

/** Read last selection for this browser tab/session (defaults to existing). */
export function getStoredPatientMode(): PatientMode {
  if (typeof window === "undefined") return "existing";
  const stored = sessionStorage.getItem(STORAGE_KEY);
  return stored === "new" || stored === "existing" ? stored : "existing";
}

export function persistPatientMode(mode: PatientMode) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, mode);
}

interface PatientModeToggleProps {
  value: PatientMode;
  onChange: (mode: PatientMode) => void;
  /** Unique framer-motion layoutId when multiple toggles could coexist. */
  layoutId?: string;
  className?: string;
}

/**
 * Pill/segmented control matching All Bills | Create Bill styling.
 * New Patient = first-time visitor (register). Existing = search/select.
 */
export function PatientModeToggle({
  value,
  onChange,
  layoutId = "billing-patient-mode",
  className,
}: PatientModeToggleProps) {
  return (
    <AnimatedTabs
      options={[
        { label: "New Patient", value: "new", icon: UserPlus },
        { label: "Existing Patient", value: "existing", icon: UserRound },
      ]}
      value={value}
      onChange={(v) => {
        const mode = v as PatientMode;
        persistPatientMode(mode);
        onChange(mode);
      }}
      layoutId={layoutId}
      className={className}
    />
  );
}
