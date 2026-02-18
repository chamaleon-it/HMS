import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ShoppingBag, Users, RotateCcw, Search } from "lucide-react";
import { fDate } from "@/lib/fDateAndTime";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";

export interface FilterType {
  query?: string;
  gender?: string;
  doctor?: string;
  age: [number, number];
  lastVisit?: number | string;
  alreadyPurchase?: boolean;
  dateRange: {
    from?: string;
    to?: string;
  };
  page: number;
  limit: number;
}

export default function Filter({
  filter,
  setFilter,
}: {
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}) {
  const { data: doctorsData } = useSWR<{
    data: {
      _id: string;
      name: string;
      email: string;
    }[];
    message: string;
  }>("/users/doctors");

  const doctors = doctorsData?.data || [];

  const handleReset = () => {
    setFilter({
      query: undefined,
      gender: undefined,
      doctor: undefined,
      age: [0, 100],
      lastVisit: undefined,
      alreadyPurchase: false,
      page: 1,
      limit: 10,
      dateRange: {
        from: undefined,
        to: undefined,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-7 rounded-xl shadow-sm border border-slate-200 space-y-6"
    >
      <div className="flex flex-wrap items-end gap-6">
        {/* Search */}
        <div className="space-y-2 flex-1 min-w-[280px]">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Search Customers
          </label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              value={filter?.query || ""}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, query: e.target.value, page: 1 }))
              }
              placeholder="Name, ID, phone..."
              className="pl-9 h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Gender
          </label>
          <div className="flex gap-1.5 p-1 bg-slate-50 border border-slate-100 rounded-xl w-fit">
            {[
              { label: "All", value: undefined, icon: "•" },
              { label: "Female", value: "Female", icon: "♀" },
              { label: "Male", value: "Male", icon: "♂" },
              { label: "Other", value: "Other", icon: "⚧" },
            ].map((opt) => {
              const active = filter.gender === opt.value;
              const activeClass =
                opt.value === "Female"
                  ? "bg-rose-500 text-white shadow-sm"
                  : opt.value === "Male"
                    ? "bg-sky-500 text-white shadow-sm"
                    : opt.value === "Other"
                      ? "bg-violet-500 text-white shadow-sm"
                      : "bg-white text-slate-800 border-slate-200 shadow-sm";

              const baseClass = "px-3 h-9 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap";
              const idleClass = "text-slate-500 hover:text-slate-800 hover:bg-white/80";

              return (
                <button
                  key={opt.label}
                  onClick={() =>
                    setFilter((prev) => ({ ...prev, gender: opt.value, page: 1 }))
                  }
                  className={`${baseClass} ${active ? activeClass : idleClass}`}
                >
                  {opt.value !== undefined && <span>{opt.icon}</span>}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Doctor */}
        <div className="space-y-2 min-w-[180px]">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Doctor
          </label>
          <FilterSelect
            value={filter.doctor || ""}
            onChange={(v) => setFilter((prev) => ({ ...prev, doctor: v, page: 1 }))}
            placeholder="All Doctors"
            options={[
              { label: "All Doctors", value: null },
              ...doctors.map(({ name, _id }) => ({
                label: name,
                value: _id,
              })),
            ]}
          />
        </div>

        {/* Age Range */}
        <div className="space-y-2">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Age Range
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={filter.age[0] === 0 ? "" : filter.age[0]}
              placeholder="Min"
              onChange={(e) => {
                const age: [number, number] = [
                  Number(e.target.value),
                  filter.age[1],
                ];
                setFilter((prev) => ({ ...prev, age, page: 1 }));
              }}
              className="w-20 h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all text-center"
            />
            <span className="text-slate-300 font-bold">–</span>
            <Input
              type="number"
              value={filter.age[1] === 100 ? "" : filter.age[1]}
              placeholder="Max"
              onChange={(e) => {
                const age: [number, number] = [
                  filter.age[0],
                  Number(e.target.value),
                ];
                setFilter((prev) => ({ ...prev, age, page: 1 }));
              }}
              className="w-20 h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all text-center"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-6 pt-2 border-t border-slate-50">
        {/* Last Visit */}
        <div className="space-y-2">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Last Visit
          </label>
          <Segmented
            options={[
              { label: "All Time", value: undefined },
              { label: "7 Days", value: 7 },
              { label: "30 Days", value: 30 },
              { label: "Custom", value: "Custom" },
            ]}
            value={filter.lastVisit}
            onChange={(v) => setFilter((prev) => ({ ...prev, lastVisit: v, page: 1 }))}
          />
        </div>

        {filter.lastVisit === "Custom" && (
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
              Custom Range
            </label>
            <CustomDateFilter filter={filter} setFilter={setFilter} />
          </div>
        )}

        {/* Purchase Status */}
        <div className="space-y-2">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Purchase Status
          </label>
          <div className="flex gap-1.5 p-1 bg-slate-50 border border-slate-100 rounded-xl w-fit">
            {[
              { label: "All Customers", value: false, icon: Users },
              { label: "Purchased Only", value: true, icon: ShoppingBag },
            ].map((opt) => {
              const active = filter.alreadyPurchase === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() =>
                    setFilter((prev) => ({ ...prev, alreadyPurchase: opt.value, page: 1 }))
                  }
                  className={`px-4 h-9 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${active ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-500 hover:text-slate-800 hover:bg-white/80"
                    }`}
                >
                  <Icon size={14} className={active ? "text-white" : "text-slate-400"} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reset Button */}
        <div className="ml-auto">
          <Button
            onClick={handleReset}
            variant="outline"
            className="h-11 px-6 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All
          </Button>
        </div>
      </div>
    </motion.div>
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
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-11 px-3 bg-slate-50/50 border-slate-200 rounded-lg w-32 justify-start text-xs font-semibold"
          >
            <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
            {filter.dateRange.from ? fDate(filter.dateRange.from) : <span className="text-slate-400">From</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={filter.dateRange.from ? new Date(filter.dateRange.from) : undefined}
            onSelect={(date) => {
              setFilter((prev) => ({
                ...prev,
                dateRange: { ...prev.dateRange, from: date?.toISOString() },
              }));
            }}
          />
        </PopoverContent>
      </Popover>

      <span className="text-slate-300 font-bold">to</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-11 px-3 bg-slate-50/50 border-slate-200 rounded-lg w-32 justify-start text-xs font-semibold"
          >
            <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
            {filter.dateRange.to ? fDate(filter.dateRange.to) : <span className="text-slate-400">To</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={filter.dateRange.to ? new Date(filter.dateRange.to) : undefined}
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
    <div className="flex gap-1.5 p-1 bg-slate-50 border border-slate-100 rounded-xl w-fit">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.label}
            onClick={() => onChange(o.value)}
            className={`px-4 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${active
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/80"
              }`}
          >
            {o.label}
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
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all flex items-center justify-between gap-2 min-w-[180px]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-xs font-semibold text-slate-700">
          {current ? current.label : placeholder}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 20 20"
          className={`transition-transform duration-200 text-slate-400 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full min-w-[200px] bg-white rounded-xl shadow-2xl border border-slate-200 p-2 overflow-hidden">
          {searchable && (
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="mb-2 w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-xs"
            />
          )}
          <ul role="listbox" className="max-h-60 overflow-auto space-y-1">
            {visible.map((o) => {
              const active = o.value === value;
              return (
                <li key={String(o.value)}>
                  <button
                    onClick={() => {
                      onChange(o.value as string);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${active
                        ? "bg-indigo-50 text-indigo-700"
                        : "hover:bg-slate-50 text-slate-600"
                      }`}
                  >
                    {o.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
