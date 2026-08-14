"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterType } from "./page";
import { CONDITIONS } from "@/components/shared/patient/data/index";
import useSWR from "swr";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Search,
  RotateCcw,
  User,
  Baby,
  Clock,
  Activity,
  Check,
  ChevronDown
} from "lucide-react";
import { fDate } from "@/lib/fDateAndTime";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ServerAutocomplete } from "@/components/shared/ServerAutocomplete";

export default function Filter({
  filter,
  setFilter,
}: {
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}) {
  const { data } = useSWR<{
    data: {
      _id: string;
      name: string;
      email: string;
    }[];
    message: string;
  }>("/users/doctors");

  return (
    <div className="rounded-2xl bg-white border border-zinc-200/80 p-3.5 shadow-2xs mb-3">
      {/* Search & Reset Row */}
      <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center">
        {/* Global Search */}
        <div className="relative flex-1 lg:flex-5 group">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-zinc-900" />
          <input
            value={filter.query || ""}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, query: e.target.value }))
            }
            placeholder="Search by name, ID, phone, condition…"
            className="w-full h-8.5 pl-9 pr-3 text-xs rounded-xl bg-zinc-50/70 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium placeholder:text-zinc-400"
          />
        </div>
        {/* Address Search */}
        <div className="relative flex-1 lg:flex-4 group">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-zinc-900" />
          <input
            value={filter.address || ""}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder="Search Address"
            autoComplete="off"
            className="w-full h-8.5 pl-9 pr-3 text-xs rounded-xl bg-zinc-50/70 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium placeholder:text-zinc-400"
          />
        </div>
        {/* Reset All */}
        <button
          type="button"
          onClick={() =>
            setFilter({
              query: "",
              address: "",
              city: "",
              district: "",
              state: "",
              pincode: "",
              gender: undefined,
              doctor: undefined,
              age: [0, 100],
              lastVisit: undefined,
              conditions: [],
              date: undefined,
              status: undefined,
              dateRange: {
                from: undefined,
                to: undefined,
              },
              consultedOnly: false,
            })
          }
          className="h-8.5 px-3 rounded-xl bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 cursor-pointer transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset all</span>
        </button>
      </div>

      {/* Location row */}
      <div className="mt-2.5 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <ServerAutocomplete
          field="city"
          placeholder="City…"
          value={filter.city}
          onChange={(v) => setFilter((prev) => ({ ...prev, city: v }))}
          inputClassName="h-8.5! text-xs! rounded-xl! bg-zinc-50/70!"
        />
        <ServerAutocomplete
          field="district"
          placeholder="District…"
          value={filter.district}
          onChange={(v) => setFilter((prev) => ({ ...prev, district: v }))}
          inputClassName="h-8.5! text-xs! rounded-xl! bg-zinc-50/70!"
        />
        <ServerAutocomplete
          field="state"
          placeholder="State…"
          value={filter.state}
          onChange={(v) => setFilter((prev) => ({ ...prev, state: v }))}
          inputClassName="h-8.5! text-xs! rounded-xl! bg-zinc-50/70!"
        />
        <ServerAutocomplete
          field="pinCode"
          placeholder="Pincode…"
          value={filter.pincode}
          onChange={(v) => setFilter((prev) => ({ ...prev, pincode: v }))}
          inputClassName="h-8.5! text-xs! rounded-xl! bg-zinc-50/70!"
        />
      </div>

      {/* Primary Filters Row */}
      <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {/* Status */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 inline-flex items-center gap-1">
            <Activity className="h-3 w-3" /> Status
          </span>
          <FilterSelect
            value={filter.status}
            onChange={(v: string) => {
              setFilter((prev) => ({ ...prev, status: v }));
            }}
            placeholder="All statuses"
            options={[
              undefined,
              "Active",
              "Inactive",
              "Critical",
              "Discharged",
              "Deleted",
            ].map((s) => ({
              label: s || "All statuses",
              value: s,
            }))}
          />
        </div>

        {/* Doctor */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 inline-flex items-center gap-1">
            <User className="h-3 w-3" /> Doctor
          </span>
          <FilterSelect
            value={filter.doctor || ""}
            onChange={(v) => setFilter((prev) => ({ ...prev, doctor: v }))}
            placeholder="All doctors"
            options={[
              { label: "All Doctors", value: null },
              ...(data?.data?.map(({ name, _id }) => ({
                label: name,
                value: _id,
              })) ?? []),
            ]}
          />
        </div>

        {/* Patient Status Toggle */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 inline-flex items-center gap-1">
            <User className="h-3 w-3" /> Patient Status
          </span>
          <div className="relative inline-flex items-center gap-0.5 p-0.5 bg-zinc-100/80 rounded-xl w-full h-8.5">
            {[
              { label: "All Patients", value: false },
              { label: "Consulted Only", value: true },
            ].map((opt) => {
              const active = filter.consultedOnly === opt.value;
              return (
                <button
                  key={opt.label}
                  onClick={() =>
                    setFilter((prev) => ({ ...prev, consultedOnly: opt.value }))
                  }
                  className={cn(
                    "relative flex-1 h-full rounded-lg text-xs font-medium transition cursor-pointer overflow-hidden px-1.5",
                    active ? "text-white font-semibold" : "text-zinc-600 hover:text-zinc-900"
                  )}
                  type="button"
                >
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        layoutId="consulted-bg"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 bg-primary rounded-lg"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                      />
                    )}
                  </AnimatePresence>
                  <span className="relative z-10 truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gender Toggle */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 inline-flex items-center gap-1">
            <User className="h-3 w-3" /> Gender
          </span>
          <div className="relative inline-flex items-center gap-0.5 p-0.5 bg-zinc-100/80 rounded-xl w-full h-8.5">
            {[
              { label: "All", value: undefined, color: "" },
              { label: "Female", value: "Female", color: "bg-rose-600" },
              { label: "Male", value: "Male", color: "bg-(--color-synapse-light)" },
            ].map((opt) => {
              const active = filter.gender === opt.value;
              return (
                <button
                  key={opt.label}
                  onClick={() =>
                    setFilter((prev) => ({ ...prev, gender: opt.value }))
                  }
                  className={cn(
                    "relative flex-1 h-full rounded-lg text-xs font-medium transition cursor-pointer overflow-hidden px-1",
                    active ? "text-white font-semibold" : "text-zinc-600 hover:text-zinc-900"
                  )}
                  type="button"
                >
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        layoutId="gender-bg"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn("absolute inset-0 rounded-lg", opt.color || "bg-primary")}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                      />
                    )}
                  </AnimatePresence>
                  <span className="relative z-10 truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Age Range */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 inline-flex items-center gap-1">
            <Baby className="h-3 w-3" /> Age Range
          </span>
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                type="number"
                value={filter.age[0] === 0 ? "" : filter.age[0]}
                placeholder="0"
                min={0}
                onChange={(e) => {
                  const val = e.target.value === "" ? 0 : Number(e.target.value);
                  const age: [number, number] = [
                    isNaN(val) ? 0 : val,
                    filter.age[1],
                  ];
                  setFilter((prev) => ({ ...prev, age }));
                }}
                className="w-full h-8.5 pl-2.5 pr-8 text-xs rounded-xl bg-zinc-50/70 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 font-bold pointer-events-none">MIN</span>
            </div>
            <span className="text-zinc-300 text-xs">—</span>
            <div className="relative flex-1">
              <input
                type="number"
                value={filter.age[1] === 100 ? "" : filter.age[1]}
                placeholder="100"
                min={0}
                onChange={(e) => {
                  const val = e.target.value === "" ? 100 : Number(e.target.value);
                  const age: [number, number] = [
                    filter.age[0],
                    isNaN(val) ? 100 : val,
                  ];
                  setFilter((prev) => ({ ...prev, age }));
                }}
                className="w-full h-8.5 pl-2.5 pr-8 text-xs rounded-xl bg-zinc-50/70 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 font-bold pointer-events-none">MAX</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visit & Conditions Row */}
      <div className="mt-2.5 grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-end">
        {/* Last Visit */}
        <div className={cn(
          "flex flex-col gap-1 col-span-12",
          filter.lastVisit === "Custom" ? "lg:col-span-4" : "lg:col-span-5"
        )}>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> Last Visit
          </span>
          <Segmented
            options={[
              { label: "Today", value: 0 },
              { label: "7 days", value: 7 },
              { label: "30 days", value: 30 as const },
              { label: "All time", value: undefined },
              { label: "Custom", value: "Custom" },
            ]}
            value={filter.lastVisit}
            onChange={(v) => setFilter((prev) => ({ ...prev, lastVisit: v }))}
          />
        </div>

        {/* Custom Range Datepicker */}
        {filter.lastVisit === "Custom" && (
          <div className="flex flex-col gap-1 col-span-12 lg:col-span-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 inline-flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" /> Custom Range
            </span>
            <CustomDateFilter filter={filter} setFilter={setFilter} />
          </div>
        )}

        {/* Common Conditions */}
        <div className={cn(
          "flex flex-col gap-1 col-span-12",
          filter.lastVisit === "Custom" ? "lg:col-span-4" : "lg:col-span-7"
        )}>
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
            Common Conditions
          </div>
          <div className="flex flex-wrap gap-1">
            {CONDITIONS.slice(0, 10).map((c) => {
              const active = filter.conditions.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setFilter((prev) => ({
                      ...prev,
                      conditions: active
                        ? prev.conditions.filter((x) => x !== c)
                        : [...prev.conditions, c],
                    }));
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 border cursor-pointer inline-flex items-center gap-1",
                    active
                      ? "bg-primary text-white border-primary shadow-2xs font-semibold"
                      : "bg-zinc-50/70 text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900"
                  )}
                >
                  {active && <Check className="h-3 w-3" />}
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const CustomDateFilter = ({
  filter,
  setFilter,
}: {
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}) => {
  return (
    <div className="flex items-center gap-1.5 w-full">
      <div className="relative flex-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!filter.dateRange.from}
              className="h-8.5 px-2.5 rounded-xl ring-1 ring-zinc-200 w-full text-left flex justify-start items-center gap-1.5 text-xs font-medium"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-zinc-400" />
              {filter.dateRange.from ? (
                fDate(filter.dateRange.from)
              ) : (
                <span className="text-zinc-400">From</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={
                filter.dateRange.from
                  ? new Date(filter.dateRange.from)
                  : new Date()
              }
              onSelect={(date) => {
                setFilter((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, from: date?.toISOString() },
                }));
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <span className="text-zinc-300 text-xs">—</span>
      <div className="relative flex-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!filter.dateRange.to}
              className="h-8.5 px-2.5 rounded-xl ring-1 ring-zinc-200 w-full text-left flex justify-start items-center gap-1.5 text-xs font-medium"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-zinc-400" />
              {filter.dateRange.to ? (
                fDate(filter.dateRange.to)
              ) : (
                <span className="text-zinc-400">To</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={
                filter.dateRange.to ? new Date(filter.dateRange.to) : new Date()
              }
              onSelect={(date) => {
                setFilter((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, to: date?.toISOString() },
                }));
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: number | undefined | string }[];
  value: number | undefined | string;
  onChange: (v: number | undefined | string) => void;
}) {
  return (
    <div className="relative inline-flex items-center gap-0.5 p-0.5 bg-zinc-100/80 rounded-xl w-full h-8.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.label}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative flex-1 h-full rounded-lg text-xs font-medium transition cursor-pointer overflow-hidden px-1.5",
              active ? "text-white font-semibold" : "text-zinc-600 hover:text-zinc-900"
            )}
            type="button"
          >
            <AnimatePresence>
              {active && (
                <motion.span
                  layoutId="segmented-bg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 bg-primary rounded-lg"
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

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
  className = "",
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  options: { label: string; value: string | undefined | null }[];
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
          {current ? current.label : placeholder}
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
                        onChange(o.value as string);
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
