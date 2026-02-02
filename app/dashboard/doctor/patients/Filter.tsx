"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterType } from "./page";
import { CONDITIONS } from "./data";
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
    <div className="rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm mb-6">
      {/* Top row: Search + Reset */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="relative flex-1 group">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-zinc-900" />
          <input
            value={filter.query}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, query: e.target.value }))
            }
            placeholder="Search by name, ID, phone, condition…"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
          />
        </div>
        <button
          onClick={() =>
            setFilter({
              query: undefined,
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
            })
          }
          className="h-11 px-4 rounded-xl bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 cursor-pointer transition-all flex items-center gap-2 font-medium"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset all</span>
        </button>
      </div>

      {/* Row 2: Primary filters */}
      <div className="mt-3 grid md:grid-cols-3 gap-3">
        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1 inline-flex items-center gap-1.5">
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

        {/* Gender — attractive pills */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1 inline-flex items-center gap-1.5">
            <User className="h-3 w-3" /> Gender
          </span>
          <div className="relative inline-flex items-center gap-1 p-1 bg-zinc-100/80 rounded-xl w-fit">
            {[
              { label: "All", value: undefined, icon: null },
              { label: "Female", value: "Female", color: "bg-rose-600" },
              { label: "Male", value: "Male", color: "bg-blue-600" },
              { label: "Others", value: "Other", color: "bg-violet-600" },
            ].map((opt) => {
              const active = filter.gender === opt.value;
              return (
                <button
                  key={opt.label}
                  onClick={() =>
                    setFilter((prev) => ({ ...prev, gender: opt.value }))
                  }
                  className={cn(
                    "relative px-3.5 h-8.5 rounded-lg text-sm font-medium transition cursor-pointer overflow-hidden",
                    active ? "text-white" : "text-zinc-500 hover:text-zinc-900"
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
                        className={cn("absolute inset-0", opt.color || "bg-zinc-900")}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </AnimatePresence>
                  <span className="relative z-10">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Doctor */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 px-1">Doctor</span>
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
      </div>

      {/* Row 3: Age + Visit range */}
      <div className="mt-3 grid md:grid-cols-3 gap-3 items-end">
        {/* Age */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1 inline-flex items-center gap-1.5">
            <Baby className="h-3 w-3" /> Age Range
          </span>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={filter.age[0] === 0 ? "" : filter.age[0]}
                placeholder="0"
                onChange={(e) => {
                  const age: [number, number] = [
                    Number(e.target.value),
                    filter.age[1],
                  ];
                  setFilter((prev) => ({ ...prev, age }));
                }}
                className="w-full h-11 px-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold">MIN</span>
            </div>
            <span className="text-zinc-300">—</span>
            <div className="relative flex-1">
              <input
                type="number"
                value={filter.age[1]}
                onChange={(e) => {
                  const age: [number, number] = [
                    filter.age[0],
                    Number(e.target.value),
                  ];
                  setFilter((prev) => ({ ...prev, age }));
                }}
                className="w-full h-11 px-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold">MAX</span>
            </div>
          </div>
        </div>

        {/* Last Visit */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1 inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Last Visit
          </span>
          <Segmented
            options={[
              { label: "All time", value: undefined },
              { label: "7 days", value: 7 },
              { label: "30 days", value: 30 as const },
              { label: "Custom", value: "Custom" },
            ]}
            value={filter.lastVisit}
            onChange={(v) => setFilter((prev) => ({ ...prev, lastVisit: v }))}
          />
        </div>

        {filter.lastVisit === "Custom" && (
          <CustomDateFilter filter={filter} setFilter={setFilter} />
        )}

        {/* <div className="min-w-[170px]">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-48 justify-between font-normal flex gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto h-11"
              >
                {filter.date ? fDate(filter.date) : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={filter.date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  setFilter((prev) => ({ ...prev, date }));
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div> */}
      </div>

      <div className="mt-6 border-t border-zinc-100 pt-5">
        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1 mb-2.5">
          Common Conditions
        </div>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.slice(0, 10).map((c) => {
            const active = filter.conditions.includes(c);
            return (
              <button
                key={c}
                onClick={() => {
                  setFilter((prev) => ({
                    ...prev,
                    conditions: active
                      ? prev.conditions.filter((x) => x !== c)
                      : [...prev.conditions, c],
                  }));
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer inline-flex items-center gap-2",
                  active
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                )}
              >
                {active && <Check className="h-3.5 w-3.5" />}
                {c}
              </button>
            );
          })}
          {filter.conditions.length > 0 && (
            <button
              onClick={() => setFilter((prev) => ({ ...prev, conditions: [] }))}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          )}
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
    <div className="flex items-end gap-2">
      <div className="clearflex flex-col gap-1 w-fit">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!filter.dateRange.from}
              className="h-11 px-3 rounded-xl ring-1 ring-gray-200 w-32 text-left flex justify-start"
            >
              <CalendarIcon />
              {filter.dateRange.from ? (
                fDate(filter.dateRange.from)
              ) : (
                <span>From</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
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
      <div className="clearflex flex-col gap-1 w-fit">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!filter.dateRange.to}
              className="h-11 px-3 rounded-xl ring-1 ring-gray-200 w-32 text-left flex justify-start"
            >
              <CalendarIcon />
              {filter.dateRange.to ? (
                fDate(filter.dateRange.to)
              ) : (
                <span>To</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
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
    <div className="relative inline-flex items-center gap-1 p-1 bg-zinc-100/80 rounded-xl w-fit">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.label}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative px-4 h-8.5 rounded-lg text-sm font-medium transition cursor-pointer overflow-hidden",
              active ? "text-white" : "text-zinc-500 hover:text-zinc-900"
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
                  className="absolute inset-0 bg-zinc-900"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
            </AnimatePresence>
            <span className="relative z-10">{o.label}</span>
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
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "h-11 px-4 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all inline-flex items-center justify-between gap-3 min-w-[180px] group",
          open && "ring-2 ring-zinc-900/5 border-zinc-900 bg-white"
        )}
      >
        <span className={cn(
          "truncate text-sm font-medium",
          current ? "text-zinc-900" : "text-zinc-500"
        )}>
          {current ? current.label : placeholder}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-zinc-400 transition-transform duration-200",
          open ? "rotate-180 text-zinc-900" : "group-hover:text-zinc-600"
        )} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 mt-2 w-full min-w-[200px] max-h-72 overflow-hidden bg-white rounded-2xl shadow-xl ring-1 ring-zinc-200 p-2"
          >
            {searchable && (
              <div className="relative mb-2 px-1">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search…"
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-50 border border-zinc-100 focus:outline-none focus:border-zinc-300 text-sm transition-all"
                />
              </div>
            )}
            <ul role="listbox" className="max-h-[240px] overflow-y-auto custom-scrollbar">
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
                        "w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors",
                        active
                          ? "bg-zinc-100 text-zinc-900"
                          : "hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900"
                      )}
                    >
                      <span className="truncate">{o.label}</span>
                      {active && <Check className="h-4 w-4 text-zinc-900" />}
                    </button>
                  </li>
                );
              })}
              {visible.length === 0 && (
                <li className="px-3 py-4 text-center text-sm text-zinc-400 font-medium">
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
