"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, User2, UserCheck } from "lucide-react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import BillingStatusFilter from "@/app/dashboard/pharmacy/billing/BillingStatusFilter";
import { PatientVisitorToggle } from "@/components/dashboard/billing/PatientModeToggle";
import {
  isActiveAssignee,
  isDoctorAssignee,
  mergeTherapyAssignees,
  TherapyAssignee,
} from "@/lib/therapyAssignees";
import { FilterType } from "../page";
import { doctorFilterOptions } from "../doctorFilter";
import { billTherapistName } from "../accountantBilling";

interface Props {
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  billing: { doctor?: unknown; therapistName?: string }[];
}

const TYPE_PILLS = [
  { key: "all", label: "All Type" },
  { key: "pharmacy", label: "Pharmacy" },
  { key: "procedure", label: "Procedure" },
  { key: "reception", label: "Reception" },
];

export default function BillingToolbar({ filter, setFilter, billing }: Props) {
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);
  const [isTherapistOpen, setIsTherapistOpen] = useState(false);
  const doctorRef = useRef<HTMLDivElement>(null);
  const therapistRef = useRef<HTMLDivElement>(null);

  const { data: doctorsResponse } = useSWR<{ data: { _id: string; name: string }[] }>("/admin/doctors");
  const { data: therapistResponse } = useSWR<{ data: TherapyAssignee[] }>("/employee?role=Therapist&status=active");
  const { data: doctorEmployeeResponse } = useSWR<{ data: TherapyAssignee[] }>("/employee?role=Doctor&status=active");

  const doctors = doctorFilterOptions(doctorsResponse?.data, billing);

  const therapists = useMemo(() => {
    const people = mergeTherapyAssignees(
      therapistResponse?.data ?? [],
      (doctorEmployeeResponse?.data ?? []).filter((person) => isActiveAssignee(person)),
    );
    const byName = new Map<string, TherapyAssignee>();
    for (const person of people) {
      const key = person.name.toLowerCase();
      if (!byName.has(key)) byName.set(key, person);
    }
    for (const bill of billing) {
      const name = billTherapistName(bill);
      if (!name) continue;
      const key = name.toLowerCase();
      if (!byName.has(key)) byName.set(key, { _id: key, name });
    }
    return [...byName.values()].sort((a, b) => {
      const roleOrder = Number(isDoctorAssignee(a)) - Number(isDoctorAssignee(b));
      if (roleOrder !== 0) return roleOrder;
      return a.name.localeCompare(b.name);
    });
  }, [therapistResponse, doctorEmployeeResponse, billing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (doctorRef.current && !doctorRef.current.contains(event.target as Node)) {
        setIsDoctorOpen(false);
      }
      if (therapistRef.current && !therapistRef.current.contains(event.target as Node)) {
        setIsTherapistOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDoctor = (doctor: string) => {
    setFilter((prev) => {
      const current = prev.doctor || [];
      const selected = current.some((name) => name.toLowerCase() === doctor.toLowerCase());
      return {
        ...prev,
        page: 1,
        doctor: selected
          ? current.filter((name) => name.toLowerCase() !== doctor.toLowerCase())
          : [...current, doctor],
      };
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative" ref={doctorRef}>
        <button
          onClick={() => setIsDoctorOpen(!isDoctorOpen)}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all border cursor-pointer font-medium",
            filter.doctor.length > 0
              ? "bg-synapse-light/10 border-synapse-light/30 text-(--color-synapse-light) shadow-sm"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          )}
          type="button"
        >
          <User2 size={14} className={cn(filter.doctor.length > 0 ? "text-(--color-synapse-light)" : "text-slate-400")} />
          <span>
            {filter.doctor.length === 0
              ? "All Doctors"
              : filter.doctor.length === 1
                ? filter.doctor[0]
                : `${filter.doctor.length} Doctors Selected`}
          </span>
          <ChevronDown size={14} className={cn("transition-transform duration-200", isDoctorOpen && "rotate-180")} />
        </button>
        <AnimatePresence>
          {isDoctorOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
            >
              <button
                type="button"
                onClick={() => {
                  setFilter((prev) => ({ ...prev, doctor: [], page: 1 }));
                  setIsDoctorOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium">All Doctors</span>
                {filter.doctor.length === 0 && <Check size={16} className="text-(--color-synapse-light)" />}
              </button>
              <div className="my-1.5 h-px bg-slate-100" />
              <div className="max-h-60 overflow-y-auto">
                {doctors.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-slate-400">No doctors found</div>
                ) : (
                  doctors.map((doctor) => (
                    <button
                      key={doctor}
                      type="button"
                      onClick={() => toggleDoctor(doctor)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <span className="truncate">{doctor}</span>
                      {filter.doctor.some((name) => name.toLowerCase() === doctor.toLowerCase()) && (
                        <Check size={16} className="text-(--color-synapse-light)" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative" ref={therapistRef}>
        <button
          onClick={() => setIsTherapistOpen(!isTherapistOpen)}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all border cursor-pointer font-medium",
            filter.therapist
              ? "bg-synapse-light/10 border-synapse-light/30 text-(--color-synapse-light) shadow-sm"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          )}
          type="button"
        >
          <UserCheck size={14} className={cn(filter.therapist ? "text-(--color-synapse-light)" : "text-slate-400")} />
          <span>{filter.therapist || "All Therapists"}</span>
          <ChevronDown size={14} className={cn("transition-transform duration-200", isTherapistOpen && "rotate-180")} />
        </button>
        <AnimatePresence>
          {isTherapistOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
            >
              <button
                type="button"
                onClick={() => {
                  setFilter((prev) => ({ ...prev, therapist: "", page: 1 }));
                  setIsTherapistOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium">All Therapists</span>
                {!filter.therapist && <Check size={16} className="text-(--color-synapse-light)" />}
              </button>
              <div className="my-1.5 h-px bg-slate-100" />
              <div className="max-h-60 overflow-y-auto">
                {therapists.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-slate-400">No therapists found</div>
                ) : (
                  therapists.map((therapist) => (
                    <button
                      key={therapist._id || therapist.name}
                      type="button"
                      onClick={() => {
                        setFilter((prev) => ({ ...prev, therapist: therapist.name, page: 1 }));
                        setIsTherapistOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <span className="truncate">{therapist.name}</span>
                      {filter.therapist.toLowerCase() === therapist.name.toLowerCase() && (
                        <Check size={16} className="text-(--color-synapse-light)" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative inline-flex items-center gap-1 text-sm bg-slate-50 border border-slate-200 rounded-full p-1">
        {TYPE_PILLS.map(({ key, label }) => {
          const active = (filter.billType || "all") === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter((prev) => ({ ...prev, billType: key, page: 1 }))}
              className={cn(
                "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all duration-300 ease-in-out cursor-pointer font-bold tracking-tight",
                active ? "bg-(--color-synapse-light) text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <BillingStatusFilter
        currentStatus={filter.status || "all"}
        setStatus={(status) => setFilter((prev) => ({ ...prev, status, page: 1 }))}
      />

      <PatientVisitorToggle
        value={filter.patientVisitor || "all"}
        onChange={(patientVisitor) =>
          setFilter((prev) => ({ ...prev, patientVisitor, page: 1 }))
        }
        layoutId="accountant-billing-patient-visitor"
      />
    </div>
  );
}
