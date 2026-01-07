import React, { useEffect, useMemo, useState } from "react";
import { CONDITIONS } from "./data";
import useSWR from "swr";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { fDate } from "@/lib/fDateAndTime";
import { Calendar } from "@/components/ui/calendar";


export interface FilterType {
  query?: string;
  gender?: string;
  doctor?: string;
  age: [number, number];
  lastVisit?: number | string;

  dateRange: {
    from?: string;
    to?: string;
  };
}


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
    <div className="bg-white border rounded-2xl p-4 shadow-sm shadow-slate-100">
      {/* Top row: Search + Reset */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1">
          <input
            value={filter?.query || ""}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, query: e.target.value }))
            }
            placeholder="Search by name, ID, phone"
            className="w-full h-11 px-4 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
              dateRange: {
                from: undefined,
                to: undefined,
              },
            })
          }
          className="h-11 px-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
        >
          Reset all
        </button>
      </div>

      {/* Row 2: Primary filters */}
      <div className="mt-3 grid md:grid-cols-3 gap-3">


        {/* Gender — attractive pills */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 px-1">Gender</span>
          <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto w-fit">
            {[
              { label: "All", value: undefined, icon: "•" },
              { label: "Female", value: "Female", icon: "♀" },
              { label: "Male", value: "Male", icon: "♂" },
              { label: "Others", value: "Other", icon: "⚧" },
            ].map((opt) => {
              const active = filter.gender === opt.value;
              const activeClass =
                opt.value === "Female"
                  ? "bg-rose-600 text-white ring-rose-600"
                  : opt.value === "Male"
                    ? "bg-sky-600 text-white ring-sky-600"
                    : opt.value === "Other"
                      ? "bg-violet-600 text-white ring-violet-600"
                      : "bg-white text-gray-900 ring-gray-300";
              const idleClass =
                opt.value === "Female"
                  ? "text-rose-600 ring-transparent hover:bg-rose-50"
                  : opt.value === "Male"
                    ? "text-sky-600 ring-transparent hover:bg-sky-50"
                    : opt.value === "Other"
                      ? "text-violet-600 ring-transparent hover:bg-violet-50"
                      : "text-gray-600 ring-transparent hover:bg-gray-50";
              return (
                <button
                  key={opt.label}
                  onClick={() =>
                    setFilter((prev) => ({ ...prev, gender: opt.value }))
                  }
                  aria-pressed={active}
                  aria-label={`Gender: ${opt.label}`}
                  className={`px-3 h-9 rounded-lg text-sm whitespace-nowrap ring-1 transition inline-flex items-center gap-1.5 cursor-pointer ${active ? activeClass : idleClass
                    }`}
                >
                  {opt.value !== undefined && (
                    <span aria-hidden>{opt.icon}</span>
                  )}
                  <span className="truncate">{opt.label}</span>
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
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Age</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filter.age[0] === 0 ? "" : filter.age[0]}
              placeholder="0"
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "0")}
              onChange={(e) => {
                const age: [number, number] = [
                  Number(e.target.value),
                  filter.age[1],
                ];
                setFilter((prev) => ({ ...prev, age }));
              }}
              className="w-24 h-11 px-2 rounded-xl ring-1 ring-gray-200 placeholder:text-black"
            />
            <span className="text-gray-400">–</span>
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
              className="w-24 h-11 px-2 rounded-xl ring-1 ring-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Row 3: Age + Visit range */}
      <div className="mt-3 grid md:grid-cols-3 gap-3 items-end">


        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Last visit</label>
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
    <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto w-fit">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.label}
            onClick={() => onChange(o.value)}
            className={`px-3 h-9 rounded-lg text-sm whitespace-nowrap ring-1 transition ${active
              ? "bg-white ring-gray-300 shadow-sm text-gray-900"
              : "bg-transparent ring-transparent text-gray-600 hover:text-gray-900"
              } cursor-pointer`}
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
        className={`h-11 px-3 rounded-xl bg-white ring-1 ring-gray-200 hover:bg-gray-50 inline-flex items-center gap-2 min-w-[150px]`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${placeholder}: ${current ? current.label : "Any"}`}
        title={`${placeholder}: ${current ? current.label : "Any"}`}
      >
        <span className="truncate text-sm text-gray-700">
          {current ? current.label : placeholder}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          className={`transition ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-[min(240px,calc(100vw-2rem))] max-h-72 overflow-auto bg-white rounded-xl shadow-xl ring-1 ring-gray-200 p-2">
          {searchable && (
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="mb-2 w-full h-9 px-3 rounded-lg bg-gray-50 ring-1 ring-gray-200 focus:ring-gray-300"
            />
          )}
          <ul role="listbox" className="grid gap-1">
            {visible.map((o) => {
              const active = o.value === value;
              return (
                <li key={String(o.value)}>
                  <button
                    onClick={() => {
                      onChange(o.value as string);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${active
                      ? "bg-gray-100 text-gray-900"
                      : "hover:bg-gray-50 text-gray-700"
                      }`}
                  >
                    <span className="truncate">{o.label}</span>
                    {active && <span>✓</span>}
                  </button>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
