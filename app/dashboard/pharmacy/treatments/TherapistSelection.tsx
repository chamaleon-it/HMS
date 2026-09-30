"use client";

import React, { useEffect, useMemo } from "react";
import useSWR from "swr";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserCheck } from "lucide-react";
import {
  isDoctorAssignee,
  mergeTherapyAssignees,
  TherapyAssignee,
} from "@/lib/therapyAssignees";

export interface TherapistEmployee extends TherapyAssignee {
  role: string;
}

interface Props {
  value?: string; // therapist ID or Name
  onChange: (therapistId: string, therapistName: string) => void;
  hideLabel?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  allowEmptyDefault?: boolean;
}

export default function TherapistSelection({
  value,
  onChange,
  hideLabel = false,
  className,
  label = "Assigned Therapist",
  required = true,
  allowEmptyDefault = false,
}: Props) {
  const { data: therapistResponse, isLoading: loadingTherapists } = useSWR<{
    data: TherapistEmployee[];
    message: string;
  }>("/employee?role=Therapist&status=active");
  const { data: doctorResponse, isLoading: loadingDoctors } = useSWR<{
    data: TherapistEmployee[];
    message: string;
  }>("/employee?role=Doctor&status=active");

  const therapists = useMemo(
    () =>
      mergeTherapyAssignees(
        therapistResponse?.data ?? [],
        doctorResponse?.data ?? [],
      ),
    [therapistResponse, doctorResponse],
  );

  const isLoading = (loadingTherapists || loadingDoctors) && therapists.length === 0;

  const inChargeTherapist = therapists.find(
    (t) => !isDoctorAssignee(t) && t.inCharge,
  );

  // Default stays the therapist in charge. Doctors are selectable, not the default.
  useEffect(() => {
    if (allowEmptyDefault || value || therapists.length === 0) return;
    const pick =
      inChargeTherapist || therapists.find((t) => !isDoctorAssignee(t));
    if (pick) onChange(pick._id, pick.name);
  }, [therapists, inChargeTherapist, value, allowEmptyDefault]);

  // Match selected therapist or doctor employee by ID or name
  const currentTherapist = therapists.find(
    (t) => t._id === value || t.name === value
  );

  return (
    <div className={cn("relative w-full space-y-1.5", className)}>
      {!hideLabel && (
        <div className="flex items-center justify-between min-h-5">
          <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-synapse-light" />
            <span>{label}</span>
            {required && <span className="text-rose-500">*</span>}
          </Label>
        </div>
      )}

      <Select
        value={currentTherapist?._id || value || ""}
        onValueChange={(selectedId) => {
          const selectedObj = therapists.find((t) => t._id === selectedId);
          if (selectedObj) {
            onChange(selectedObj._id, selectedObj.name);
          } else {
            onChange(selectedId, selectedId);
          }
        }}
      >
        <SelectTrigger className="w-full h-11 bg-white rounded-xl border-slate-200 focus:ring-2 focus:ring-synapse-light/20 text-xs px-3">
          <SelectValue placeholder={isLoading ? "Loading therapists..." : "Select therapist or doctor"} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="p-3 text-xs text-slate-400 text-center">Loading therapists...</div>
          ) : therapists.length === 0 ? (
            <div className="p-3 text-xs text-slate-400 text-center">
              No active therapists or doctors found
            </div>
          ) : (
            therapists.map((t) => (
              <SelectItem key={t._id} value={t._id} className="cursor-pointer py-2">
                <div className="flex items-center justify-between w-full gap-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800 text-xs">{t.name}</span>
                    {(t.qualification || t.designation) && (
                      <span className="text-[10.5px] text-slate-400">
                        {[t.designation, t.qualification].filter(Boolean).join(" • ")}
                      </span>
                    )}
                  </div>
                  {t.inCharge && !isDoctorAssignee(t) && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[9.5px] font-bold px-1.5 py-0 uppercase shrink-0">
                      In-Charge
                    </Badge>
                  )}
                  {isDoctorAssignee(t) && (
                    <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-[9.5px] font-bold px-1.5 py-0 uppercase shrink-0">
                      Doctor
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
