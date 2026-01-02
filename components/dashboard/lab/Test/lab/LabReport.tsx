"use client";

import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import LabTable from "./LabTable";

export default function Lab() {


  const { data, mutate } = useSWR<{
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
          min?: number;
          max?: number;
          womenMin?: number;
          womenMax?: number;
          childMin?: number;
          childMax?: number;
          nbMin?: number;
          nbMax?: number;
          _id: string;
          panels: {
            _id: string;
            name: string;
            status: string;
            user: string;
          }[]
        }
        value?: string | number
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
  }>({
    patient: "",
    status: "All",
    date: "All time",
  })

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-gradient-to-b from-white to-slate-50 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Lab
          </h1>
          <p className="text-sm text-gray-500">
            Track, filter & review lab results
          </p>
        </div>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<span className="text-xl">🧪</span>}
          label="Total"
          value={REPORT.length}
          tone="bg-violet-100"
        />
        <StatCard
          icon={<span className="text-xl">🏥</span>}
          label="Lab"
          value={REPORT.reduce((acc, r) => acc + (r.test.filter((e) => e.name.type === "Lab").length ?? 0), 0)}
          tone="bg-slate-100"
        />

        <StatCard
          icon={<span className="text-xl">✅</span>}
          label="Completed"
          value={REPORT.filter((r) => r.status === "Completed").length}
          tone="bg-green-100"
        />
        <StatCard
          icon={<span className="text-xl">🚩</span>}
          label="Flagged"
          value={REPORT.filter((r) => r.status === "Flagged").length}
          tone="bg-amber-100"
        />
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-4 shadow-sm mb-4">
        {/* Top row: Search + Reset */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex-1">
            <input
              value={filter.patient}
              onChange={(e) => setFilter({ ...filter, patient: e.target.value })}

              placeholder="Search by patient"
              className="w-full h-11 px-4 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <button

            className="h-11 px-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Reset all
          </button>
        </div>

        {/* Row 2: Primary filters */}
        <div className="mt-3 grid md:grid-cols-4 gap-3">
          {/* Status */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 px-1">Status</span>
            <FilterSelect
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e })}
              placeholder="All statuses"
              options={(
                [
                  "All",
                  "Pending",
                  "In Progress",
                  "Completed",
                  "Flagged",
                ] as const
              )?.map((s) => ({
                label:
                  s === "Pending"
                    ? "⏳ Pending"
                    : s === "In Progress"
                      ? "🔧 In Progress"
                      : s === "Completed"
                        ? "✅ Completed"
                        : s === "Flagged"
                          ? "🚩 Flagged"
                          : "All statuses",
                value: s,
              }))}
            />
          </div>





          {/* Doctor */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 px-1">Doctor</span>
            <FilterSelect
              value={""}
              onChange={() => { }}
              placeholder="All doctors"
              searchable
              options={[
                { label: "All doctors", value: "All" },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 px-1">Date range</span>
            <Segmented
              options={[
                { label: "All time", value: "All time" as const },
                { label: "7 days", value: "7 days" as const },
                { label: "30 days", value: "30 days" as const },
              ]}
              value={filter.date}
              onChange={(e) => setFilter({ ...filter, date: e })}
            />
          </div>
        </div>



      </div>



      {/* Table */}
      <LabTable
        REPORT={REPORT.filter((r) => {
          const patientMatch = r.patient?.name.toLowerCase().includes(filter.patient.toLowerCase())
          const statusMatch = filter.status === "All" || r.status === filter.status
          const dateMatch = filter.date === "All time" || r.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return patientMatch && statusMatch && dateMatch
        })}
        status={filter.status} mutate={mutate} />

    </div>
  );
}



const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}> = ({ icon, label, value, tone }) => (
  <div
    className={`flex items-center gap-3 p-4 rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm hover:shadow-md transition-shadow`}
  >
    <div className={`w-10 h-10 rounded-xl grid place-items-center ${tone}`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  </div>
);


function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto w-fit">
      {options?.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-3 h-9 rounded-lg text-sm whitespace-nowrap ring-1 transition ${active
              ? "bg-white ring-gray-300 shadow-sm text-gray-900"
              : "bg-transparent ring-transparent text-gray-600 hover:text-gray-900"
              }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}


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
            {visible?.map((o) => {
              const active = o.value === value;
              return (
                <li key={String(o.value)}>
                  <button
                    onClick={() => {
                      onChange(o.value);
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