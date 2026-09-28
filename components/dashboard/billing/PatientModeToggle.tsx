"use client";

import { UserPlus, UserRound, Users } from "lucide-react";
import { AnimatedTabs } from "@/components/ui/animated-tabs";

/** All Bills table filter: first-time vs repeat visitors. */
export type PatientVisitorFilter = "all" | "new" | "existing";

const STORAGE_KEY = "billing-patient-visitor-filter";

/** Read last selection for this browser tab/session (defaults to all). */
export function getStoredPatientVisitorFilter(): PatientVisitorFilter {
  if (typeof window === "undefined") return "all";
  const stored = sessionStorage.getItem(STORAGE_KEY);
  return stored === "new" || stored === "existing" || stored === "all"
    ? stored
    : "all";
}

export function persistPatientVisitorFilter(mode: PatientVisitorFilter) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, mode);
}

interface PatientVisitorToggleProps {
  value: PatientVisitorFilter;
  onChange: (mode: PatientVisitorFilter) => void;
  /** Unique framer-motion layoutId when multiple toggles could coexist. */
  layoutId?: string;
  className?: string;
}

/**
 * Pill/segmented control matching All Bills | Create Bill styling.
 * Filters the All Bills table — not create-bill register/search mode.
 *
 * Definition (backend):
 * - New Patient: bill is the patient's first Sale bill (no earlier Sale).
 * - Existing Patient: patient already had at least one earlier Sale bill.
 */
export function PatientVisitorToggle({
  value,
  onChange,
  layoutId = "billing-patient-visitor",
  className,
}: PatientVisitorToggleProps) {
  return (
    <AnimatedTabs
      options={[
        { label: "All", value: "all", icon: Users },
        { label: "New Patient", value: "new", icon: UserPlus },
        { label: "Existing Patient", value: "existing", icon: UserRound },
      ]}
      value={value}
      onChange={(v) => {
        const mode = v as PatientVisitorFilter;
        persistPatientVisitorFilter(mode);
        onChange(mode);
      }}
      layoutId={layoutId}
      className={className}
    />
  );
}

/** @deprecated Use PatientVisitorToggle — kept alias for any stray imports */
export type PatientMode = PatientVisitorFilter;
export const PatientModeToggle = PatientVisitorToggle;
export const getStoredPatientMode = getStoredPatientVisitorFilter;
export const persistPatientMode = persistPatientVisitorFilter;
