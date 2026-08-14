"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import LabTable from "./LabTable";
import DoctorHeader from "../../../../app/dashboard/doctor/components/DoctorHeader";

import {
  Beaker,
  Hospital,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronDown,
  Check,
  RotateCcw,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  colorClass: string;
  iconBgClass: string;
  borderClass: string;
  delay: number;
}> = ({ icon, label, value, colorClass, iconBgClass, borderClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    whileHover={{ y: -2, transition: { duration: 0.15 } }}
  >
    <Card
      className={cn(
        "relative overflow-hidden border-zinc-200/70 transition-all duration-200 shadow-2xs hover:shadow-sm rounded-xl",
        borderClass
      )}
    >
      <div className={cn("absolute inset-0 bg-linear-to-br opacity-50", colorClass)} />
      <div className="relative p-2.5 sm:p-3">
        <div className="flex items-center justify-between gap-1 mb-1">
          <div
            className={cn(
              "h-7 w-7 rounded-lg flex items-center justify-center shadow-2xs border border-white/60 shrink-0",
              iconBgClass
            )}
          >
            {icon}
          </div>
          <div className="text-xl font-bold tracking-tight text-zinc-900 leading-none">
            {value}
          </div>
        </div>
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider truncate">
          {label}
        </div>
      </div>
    </Card>
  </motion.div>
);

// ----- Segmented control -----
function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T; color?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="relative inline-flex items-center gap-0.5 p-0.5 bg-zinc-100/80 rounded-xl w-full h-8.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative flex-1 h-full rounded-lg text-xs font-medium transition cursor-pointer overflow-hidden px-2",
              active ? "text-white font-semibold" : "text-zinc-600 hover:text-zinc-900"
            )}
            type="button"
          >
            <AnimatePresence>
              {active && (
                <motion.span
                  layoutId="lab-segmented-bg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn("absolute inset-0 rounded-lg", o.color || "bg-primary")}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                />
              )}
            </AnimatePresence>
            <span className="relative z-10 truncate">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Headless select used for Status
function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
  className = "",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
  placeholder: string;
  searchable?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const visible = useMemo(() => {
    if (!searchable || !q.trim()) return options;
    const s = q.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(s));
  }, [options, q, searchable]);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "h-8.5 px-3 rounded-xl bg-zinc-50/70 border border-zinc-200 hover:border-zinc-300 transition-all inline-flex items-center justify-between gap-2 w-full group text-xs",
          open && "ring-2 ring-zinc-900/5 border-zinc-900 bg-white"
        )}
      >
        <span className={cn(
          "truncate text-xs font-medium",
          current ? "text-zinc-900" : "text-zinc-500"
        )}>
          {current ? (current.label === "All statuses" ? placeholder : current.label) : placeholder}
        </span>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 shrink-0",
          open ? "rotate-180 text-zinc-900" : "group-hover:text-zinc-600"
        )} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 mt-1.5 w-full min-w-45 max-h-60 overflow-hidden bg-white rounded-xl shadow-xl ring-1 ring-zinc-200 p-1.5"
          >
            {searchable && (
              <div className="relative mb-1.5 px-1">
                <Search className="h-3 w-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search…"
                  className="w-full h-8 pl-8 pr-2.5 rounded-lg bg-zinc-50 border border-zinc-100 focus:outline-none focus:border-zinc-300 text-xs transition-all"
                />
              </div>
            )}
            <ul role="listbox" className="max-h-52 overflow-y-auto custom-scrollbar">
              {visible.map((o) => {
                const active = o.value === value;
                return (
                  <li key={String(o.value)}>
                    <button
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors",
                        active
                          ? "bg-zinc-100 text-zinc-900 font-semibold"
                          : "hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900"
                      )}
                    >
                      <span className="truncate">{o.label}</span>
                      {active && <Check className="h-3.5 w-3.5 text-zinc-900" />}
                    </button>
                  </li>
                );
              })}
              {visible.length === 0 && (
                <li className="px-3 py-3 text-center text-xs text-zinc-400 font-medium">
                  No matches found
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----- Main Component -----
export default function LabResultsPage() {
  const { data } = useSWR<{
    message: string;
    data: {
      _id: string;
      patient: {
        _id: string;
        name: string;
        phoneNumber: string;
        email: string;
        gender: string;
        dateOfBirth: Date;
        conditions: string[];
        blood: string;
        allergies: string;
        address: string;
        notes: string;
        createdBy: string;
        status: string;
        mrn: string;
        createdAt: Date;
        updatedAt: Date;
      };
      doctor: {
        _id: string;
        name: string;
        specialization: null | string;
      };
      lab: {
        _id: string;
        name: string;
        specialization: null | string;
      };
      date: Date;
      priority: string;
      test: {
        name: {
          code: string;
          name: string;
          type: string;
          unit?: string;
          range: {
            name: string;
            min: number | null | undefined;
            max: number | null | undefined;
            fromAge: number | null | undefined;
            toAge: number | null | undefined;
            gender: "Both" | "Male" | "Female";
            dateType: "Year" | "Month" | "Day";
          }[];
          note: string;
          _id: string;
          panels: {
            _id: string;
            name: string;
            status: string;
            user: string;
          }[];
        };
        value?: string | number;
        _id: string;
      }[];
      sampleType: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }>("/lab/report");

  const REPORT = data?.data ?? [];

  const [filter, setFilter] = useState<{
    patient: string;
    status: string;
    date: string;
    facility: "Lab" | "Imaging" | "All";
  }>({
    patient: "",
    status: "All",
    date: "All time",
    facility: "All",
  });

  return (
    <div className="min-h-[calc(100vh-67px)] w-full bg-linear-to-b from-white to-slate-50 p-4 sm:p-5 space-y-3">
      <DoctorHeader
        title="Investigations"
        subtitle="Track, filter & review lab and imaging results"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 my-2">
        <StatCard
          icon={<Beaker className="h-4 w-4" />}
          label="Total"
          value={REPORT.length}
          colorClass="from-violet-500/10 to-violet-500/5"
          iconBgClass="bg-violet-100 text-(--color-synapse-light)"
          borderClass="hover:border-violet-200"
          delay={0}
        />
        <StatCard
          icon={<Hospital className="h-4 w-4" />}
          label="Lab"
          value={REPORT.reduce((acc, r) => acc + (r.test.filter((e) => e.name.type === "Lab").length ?? 0), 0)}
          colorClass="from-emerald-500/10 to-emerald-500/5"
          iconBgClass="bg-emerald-100 text-emerald-600"
          borderClass="hover:border-emerald-200"
          delay={0.05}
        />
        <StatCard
          icon={<Scan className="h-4 w-4" />}
          label="Imaging"
          value={REPORT.reduce((acc, r) => acc + (r.test.filter((e) => e.name.type === "Imaging").length ?? 0), 0)}
          colorClass="from-(--color-synapse-light)/10 to-blue-500/5"
          iconBgClass="bg-blue-100 text-(--color-synapse-light)"
          borderClass="hover:border-blue-200"
          delay={0.1}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Completed"
          value={REPORT.filter((r) => r.status === "Completed").length}
          colorClass="from-(--color-synapse-light)/10 to-(--color-synapse-purple)/5"
          iconBgClass="bg-synapse-light/20 text-(--color-synapse-light)"
          borderClass="hover:border-synapse-light/30"
          delay={0.15}
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Flagged"
          value={REPORT.filter((r) => r.status === "Flagged").length}
          colorClass="from-rose-500/10 to-rose-500/5"
          iconBgClass="bg-rose-100 text-rose-600"
          borderClass="hover:border-rose-200"
          delay={0.2}
        />
      </div>

      <div className="rounded-2xl bg-white border border-zinc-200/80 p-3.5 shadow-2xs mb-3">
        <div className="flex flex-col md:flex-row gap-2.5 md:items-center">
          <div className="relative flex-1 group">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-zinc-900" />
            <input
              value={filter.patient}
              onChange={(e) => setFilter({ ...filter, patient: e.target.value })}
              placeholder="Search by patient name or ID…"
              className="w-full h-8.5 pl-9 pr-3 text-xs rounded-xl bg-zinc-50/70 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium placeholder:text-zinc-400"
            />
          </div>
          <button
            type="button"
            onClick={() => setFilter({
              patient: "",
              status: "All",
              date: "All time",
              facility: "All",
            })}
            className="h-8.5 px-3 rounded-xl bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 cursor-pointer transition-all flex items-center gap-1.5 text-xs font-semibold shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset all</span>
          </button>
        </div>

        {/* Row 2: Primary filters */}
        <div className="mt-2.5 grid md:grid-cols-3 gap-2.5 items-end">
          {/* Status */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Status
            </span>
            <FilterSelect
              value={filter.status}
              onChange={(v) => setFilter({ ...filter, status: v })}
              placeholder="All statuses"
              options={(
                [
                  "All",
                  "Upcoming",
                  "Sample Collected",
                  "Waiting For Result",
                  "Completed",
                  "Flagged",
                ] as const
              ).map((s) => ({
                label: s === "All" ? "All statuses" : s,
                value: s,
              }))}
            />
          </div>

          {/* Facility — Lab vs Imaging */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 inline-flex items-center gap-1">
              <Beaker className="h-3 w-3" /> Facility
            </span>
            <Segmented
              options={[
                { label: "All", value: "All" as const },
                { label: "Lab", value: "Lab" as const, color: "bg-(--color-synapse-dark)" },
                { label: "Imaging", value: "Imaging" as const, color: "bg-(--color-synapse-light)" },
              ]}
              value={filter.facility}
              onChange={(v) => setFilter({ ...filter, facility: v })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> Date Range
            </span>
            <Segmented
              options={[
                { label: "All time", value: "All time" as const },
                { label: "7 days", value: "7 days" as const },
                { label: "30 days", value: "30 days" as const },
              ]}
              value={filter.date}
              onChange={(v) => setFilter({ ...filter, date: v })}
            />
          </div>
        </div>
      </div>

      <LabTable
        REPORT={
          REPORT.filter((r) => {
            const patientMatch = r?.patient?.name.toLowerCase().includes(filter.patient.toLowerCase());
            const statusMatch = filter.status === "All" || r.status === filter.status;
            const facilityMatch = filter.facility === "All" || r.test.some((e) => e.name.type === filter.facility);
            const dateMatch = filter.date === "All time" || r.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return patientMatch && statusMatch && facilityMatch && dateMatch;
          })
        }
        status={filter.status}
        facility={filter.facility}
      />
    </div>
  );
}
