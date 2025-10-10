"use client";

import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import React, { useMemo, useState, useEffect } from "react";
import { RegisterPatient } from "./RegisterPatient";
import PatientTable from "./PatientTable";

// ----- Types -----
type Status = "Active" | "Inactive" | "Critical" | "Discharged";
type Gender = "M" | "F" | "O";
type Patient = {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: Gender;
  lastVisit: string; // ISO date
  doctor: string;
  conditions: string[];
  visits: number;
  status: Status;
};

// ----- Demo Data (replace with API data) -----
const INITIAL: Patient[] = [
  {
    id: "P-0001",
    name: "John Mathew",
    phone: "+91 90000 11111",
    age: 42,
    gender: "M",
    lastVisit: "2025-09-01",
    doctor: "Dr. Nadir Sha",
    conditions: ["Hypertension"],
    visits: 1,
    status: "Active",
  },
  {
    id: "P-0002",
    name: "Aisha Kareem",
    phone: "+91 90000 22222",
    age: 33,
    gender: "F",
    lastVisit: "2025-09-02",
    doctor: "Dr. Nadir Sha",
    conditions: ["Hypothyroid"],
    visits: 1,
    status: "Inactive",
  },
  {
    id: "P-0003",
    name: "Mohammed Iqbal",
    phone: "+91 90000 33333",
    age: 55,
    gender: "M",
    lastVisit: "2025-09-03",
    doctor: "Dr. Nadir Sha",
    conditions: ["Diabetes", "Hyperlipidemia"],
    visits: 1,
    status: "Active",
  },
  {
    id: "P-0004",
    name: "Sara Ali",
    phone: "+91 90000 44444",
    age: 28,
    gender: "F",
    lastVisit: "2025-09-03",
    doctor: "Dr. Nadir Sha",
    conditions: ["High fever"],
    visits: 1,
    status: "Critical",
  },
  {
    id: "P-0005",
    name: "Ravi Kumar",
    phone: "+91 90000 55555",
    age: 47,
    gender: "M",
    lastVisit: "2025-09-04",
    doctor: "Dr. Nadir Sha",
    conditions: ["Back pain"],
    visits: 1,
    status: "Discharged",
  },
];

// ----- Small UI helpers -----
const Chip: React.FC<{
  label: string;
  tone?: "green" | "gray" | "red" | "blue" | "amber";
}> = ({ label, tone = "gray" }) => {
  const tones: Record<string, string> = {
    // refreshed palette
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    gray: "bg-slate-100 text-slate-700 ring-slate-200",
    red: "bg-rose-50 text-rose-700 ring-rose-200",
    blue: "bg-sky-50 text-sky-700 ring-sky-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${tones[tone]}`}
    >
      {label}
    </span>
  );
};

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

// ----- Segmented control -----
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
    <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-3 h-9 rounded-lg text-sm whitespace-nowrap ring-1 transition ${
              active
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

// Nice headless select used for Status / Doctor
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
            {visible.map((o) => {
              const active = o.value === value;
              return (
                <li key={String(o.value)}>
                  <button
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                      active
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

// ----- Sorting helpers -----
type SortKey = keyof Pick<
  Patient,
  "name" | "age" | "lastVisit" | "status" | "doctor" | "visits"
>;
type SortDir = "asc" | "desc";

// ----- Main Component -----
export default function PatientsEnhanced() {
  const [openCreate, setOpenCreate] = useState(false);

  const [rows] = useState<Patient[]>(INITIAL);

  // query
  const [q, setQ] = useState("");

  // filters
  const [status, setStatus] = useState<Status | "All">("All");
  const [gender, setGender] = useState<Gender | "All">("All");
  const [doctor, setDoctor] = useState<string | "All">("All");
  const [conditions, setConditions] = useState<string[]>([]);
  const [ageMin, setAgeMin] = useState<number>(0);
  const [ageMax, setAgeMax] = useState<number>(100);
  const [visitRange, setVisitRange] = useState<{
    from: string | null;
    to: string | null;
  }>({ from: null, to: null });
  const [visitPreset, setVisitPreset] = useState<
    "All time" | "7 days" | "30 days" | "Custom"
  >("All time");

  // sorting
  const [sortKey] = useState<SortKey>("lastVisit");
  const [sortDir] = useState<SortDir>("desc");

  // modals / drawers
  const [preview, setPreview] = useState<Patient | null>(null);
  const [history, setHistory] = useState<Patient | null>(null);
  const [shareFor, setShareFor] = useState<Patient | null>(null);
  const [shareTarget, setShareTarget] = useState<string>("Doctor");
  const [shareVia, setShareVia] = useState<string>("Copy link");
  const [shareDoctor, setShareDoctor] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // pagination (optional)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const doctors = useMemo(
    () => Array.from(new Set(INITIAL.map((r) => r.doctor))),
    []
  );
  const allConditions = useMemo(
    () => Array.from(new Set(INITIAL.flatMap((r) => r.conditions))).sort(),
    []
  );

  const filtered = useMemo(() => {
    let list = [...rows];
    // search
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.id.toLowerCase().includes(s) ||
          r.phone.toLowerCase().includes(s) ||
          r.conditions.some((c) => c.toLowerCase().includes(s))
      );
    }
    // status
    if (status !== "All") list = list.filter((r) => r.status === status);
    // gender
    if (gender !== "All") list = list.filter((r) => r.gender === gender);
    // doctor
    if (doctor !== "All") list = list.filter((r) => r.doctor === doctor);
    // conditions (multi)
    if (conditions.length > 0)
      list = list.filter((r) =>
        conditions.every((c) => r.conditions.includes(c))
      );
    // age
    list = list.filter((r) => r.age >= ageMin && r.age <= ageMax);
    // visit date range
    if (visitRange.from)
      list = list.filter(
        (r) => new Date(r.lastVisit) >= new Date(visitRange.from!)
      );
    if (visitRange.to)
      list = list.filter(
        (r) => new Date(r.lastVisit) <= new Date(visitRange.to!)
      );

    // sort
    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const vA = a[sortKey];
      const vB = b[sortKey];
      if (sortKey === "lastVisit") {
        return (
          (new Date(vA as string).getTime() -
            new Date(vB as string).getTime()) *
          dir
        );
      }
      if (typeof vA === "number" && typeof vB === "number")
        return (vA - vB) * dir;
      return String(vA).localeCompare(String(vB)) * dir;
    });

    return list;
  }, [
    rows,
    q,
    status,
    gender,
    doctor,
    conditions,
    ageMin,
    ageMax,
    visitRange,
    sortKey,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const resetFilters = () => {
    setQ("");
    setStatus("All");
    setGender("All");
    setDoctor("All");
    setConditions([]);
    setAgeMin(0);
    setAgeMax(100);
    setVisitPreset("All time");
    setVisitRange({ from: null, to: null });
  };

  const applyVisitPreset = (
    p: "All time" | "7 days" | "30 days" | "Custom"
  ) => {
    setVisitPreset(p);
    if (p === "All time") {
      setVisitRange({ from: null, to: null });
      return;
    }
    if (p === "Custom") return; // keep current custom range
    const today = new Date();
    const to = today.toISOString().slice(0, 10);
    const days = p === "7 days" ? 6 : 29; // inclusive of today
    const fromDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
    const from = fromDate.toISOString().slice(0, 10);
    setVisitRange({ from, to });
  };

  return (
    <AppShell>
      <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
            <p className="text-sm text-gray-500">
              Search, filter & review patient history
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90 cursor-pointer"
              onClick={() => setOpenCreate(true)}
            >
              New Patient
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<span className="text-xl">👥</span>}
            label="Total"
            value={rows.length}
            tone="bg-violet-100"
          />
          <StatCard
            icon={<span className="text-xl">🩺</span>}
            label="Active"
            value={rows.filter((r) => r.status === "Active").length}
            tone="bg-green-100"
          />
          <StatCard
            icon={<span className="text-xl">🚨</span>}
            label="Critical"
            value={rows.filter((r) => r.status === "Critical").length}
            tone="bg-red-100"
          />
          <StatCard
            icon={<span className="text-xl">🚪</span>}
            label="Discharged"
            value={rows.filter((r) => r.status === "Discharged").length}
            tone="bg-blue-100"
          />
        </div>

        {/* Search & Filters */}
        <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-4 shadow-sm mb-4">
          {/* Top row: Search + Reset */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, ID, phone, condition…"
                className="w-full h-11 px-4 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <button
              onClick={resetFilters}
              className="h-11 px-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
            >
              Reset all
            </button>
          </div>

          {/* Row 2: Primary filters */}
          <div className="mt-3 grid md:grid-cols-3 gap-3">
            {/* Status */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 px-1">Status</span>
              <FilterSelect
                value={status as Status | "All"}
                onChange={(v: Status | "All") => setStatus(v)}
                placeholder="All statuses"
                options={(
                  [
                    "All",
                    "Active",
                    "Inactive",
                    "Critical",
                    "Discharged",
                  ] as const
                ).map((s) => ({
                  label:
                    s === "Active"
                      ? "🟢 Active"
                      : s === "Inactive"
                      ? "⚪ Inactive"
                      : s === "Critical"
                      ? "🔴 Critical"
                      : s === "Discharged"
                      ? "🔵 Discharged"
                      : "All statuses",
                  value: s,
                }))}
              />
            </div>

            {/* Gender — attractive pills */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 px-1">Gender</span>
              <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto">
                {[
                  { label: "All", value: "All" as const, icon: "•" },
                  { label: "Female", value: "F" as const, icon: "♀" },
                  { label: "Male", value: "M" as const, icon: "♂" },
                  { label: "Others", value: "O" as const, icon: "⚧" },
                ].map((opt) => {
                  const active = (gender as Status | "All") === opt.value;
                  const activeClass =
                    opt.value === "F"
                      ? "bg-rose-600 text-white ring-rose-600"
                      : opt.value === "M"
                      ? "bg-sky-600 text-white ring-sky-600"
                      : opt.value === "O"
                      ? "bg-violet-600 text-white ring-violet-600"
                      : "bg-white text-gray-900 ring-gray-300";
                  const idleClass =
                    opt.value === "F"
                      ? "text-rose-600 ring-transparent hover:bg-rose-50"
                      : opt.value === "M"
                      ? "text-sky-600 ring-transparent hover:bg-sky-50"
                      : opt.value === "O"
                      ? "text-violet-600 ring-transparent hover:bg-violet-50"
                      : "text-gray-600 ring-transparent hover:bg-gray-50";
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setGender(opt.value)}
                      aria-pressed={active}
                      aria-label={`Gender: ${opt.label}`}
                      className={`px-3 h-9 rounded-lg text-sm whitespace-nowrap ring-1 transition inline-flex items-center gap-1.5 cursor-pointer ${
                        active ? activeClass : idleClass
                      }`}
                    >
                      {opt.value !== "All" && (
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
                value={doctor}
                onChange={(v) => setDoctor(v)}
                placeholder="All doctors"
                searchable
                options={[
                  { label: "All doctors", value: "All" },
                  ...doctors.map((d) => ({ label: d, value: d })),
                ]}
              />
            </div>
          </div>

          {/* Row 3: Age + Visit range */}
          <div className="mt-3 grid md:grid-cols-3 gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Age</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={ageMin}
                  onChange={(e) => setAgeMin(parseInt(e.target.value || "0"))}
                  className="w-24 h-11 px-2 rounded-xl ring-1 ring-gray-200"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  value={ageMax}
                  onChange={(e) => setAgeMax(parseInt(e.target.value || "0"))}
                  className="w-24 h-11 px-2 rounded-xl ring-1 ring-gray-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Last visit</label>
              <Segmented
                options={[
                  { label: "All time", value: "All time" as const },
                  { label: "7 days", value: "7 days" as const },
                  { label: "30 days", value: "30 days" as const },
                  { label: "Custom", value: "Custom" as const },
                ]}
                value={visitPreset}
                onChange={(v) => applyVisitPreset(v)}
              />
            </div>

            {visitPreset === "Custom" && (
              <div className="flex items-end gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm text-gray-600">From</label>
                  <input
                    type="date"
                    value={visitRange.from ?? ""}
                    onChange={(e) =>
                      setVisitRange((v) => ({
                        ...v,
                        from: e.target.value || null,
                      }))
                    }
                    className="h-11 px-3 rounded-xl ring-1 ring-gray-200"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm text-gray-600">To</label>
                  <input
                    type="date"
                    value={visitRange.to ?? ""}
                    onChange={(e) =>
                      setVisitRange((v) => ({
                        ...v,
                        to: e.target.value || null,
                      }))
                    }
                    className="h-11 px-3 rounded-xl ring-1 ring-gray-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Row 4: Conditions */}
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-1">Conditions</div>
            <div className="flex flex-wrap gap-2">
              {allConditions.map((c) => {
                const active = conditions.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() =>
                      setConditions((prev) =>
                        active ? prev.filter((x) => x !== c) : [...prev, c]
                      )
                    }
                    className={`px-3 py-1 rounded-full text-sm ring-1 transition ${
                      active
                        ? "bg-black text-white ring-black"
                        : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    {active ? "✓ " : ""}
                    {c}
                  </button>
                );
              })}
              {conditions.length > 0 && (
                <button
                  onClick={() => setConditions([])}
                  className="px-3 py-1 rounded-full text-sm text-gray-600 hover:text-black"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bulk selection bar */}
        {selected.size > 0 && (
          <div className="sticky top-2 z-10 mb-2 flex items-center justify-between rounded-xl bg-black text-white px-4 py-2">
            <div className="text-sm">{selected.size} selected</div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(new Set())}
                className="px-3 h-9 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => alert("Bulk share coming soon")}
                className="px-3 h-9 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer"
              >
                Share
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <PatientTable />

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-700">{pageRows.length}</span>{" "}
            of{" "}
            <span className="font-medium text-gray-700">{filtered.length}</span>{" "}
            patients
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 h-10 rounded-xl bg-white ring-1 ring-gray-200 disabled:opacity-50"
              disabled={page === 1}
            >
              Prev
            </button>
            <div className="px-3 h-10 grid place-items-center rounded-xl bg-gray-100 text-sm">
              {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 h-10 rounded-xl bg-white ring-1 ring-gray-200 disabled:opacity-50"
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* Slide-over: View Preview */}
        {preview && (
          <div className="fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setPreview(null)}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Patient Preview</h2>
                <button
                  onClick={() => setPreview(null)}
                  className="text-gray-500 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-medium">{preview.name}</div>
                <div className="text-sm text-gray-600">
                  {preview.id} • {preview.age}/{preview.gender} •{" "}
                  {preview.phone}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Doctor: </span>
                  {preview.doctor}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {preview.conditions.map((c, i) => (
                    <Chip key={i} label={c} />
                  ))}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Last visit: </span>
                  {preview.lastVisit}
                </div>
                <div className="pt-2 text-sm text-gray-500">
                  This is a lightweight preview. Click below to open the full
                  patient page.
                </div>
                <button
                  onClick={() => {
                    window.location.href = `/patients/${preview.id}`;
                  }}
                  className="w-full h-11 rounded-xl bg-black text-white"
                >
                  Open patient page
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Slide-over: History */}
        {history && (
          <div className="fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setHistory(null)}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  History — {history.name}
                </h2>
                <button
                  onClick={() => setHistory(null)}
                  className="text-gray-500 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>
              <ol className="relative border-s border-gray-200 ps-5 space-y-6">
                <li>
                  <div className="absolute -start-1.5 mt-1.5 w-3 h-3 rounded-full bg-gray-300" />
                  <div className="text-sm">
                    <span className="font-medium">{history.lastVisit}</span> —
                    Last visit recorded
                  </div>
                </li>
                <li>
                  <div className="absolute -start-1.5 mt-1.5 w-3 h-3 rounded-full bg-gray-300" />
                  <div className="text-sm">
                    <span className="font-medium">
                      {history.visits} visit(s)
                    </span>{" "}
                    total with {history.doctor}
                  </div>
                </li>
                <li>
                  <div className="absolute -start-1.5 mt-1.5 w-3 h-3 rounded-full bg-gray-300" />
                  <div className="text-sm">
                    Conditions: {history.conditions.join(", ")}
                  </div>
                </li>
              </ol>
              <button
                onClick={() => {
                  window.location.href = `/patients/${history.id}/history`;
                }}
                className="mt-6 w-full h-11 rounded-xl bg-black text-white"
              >
                Open full history
              </button>
            </div>
          </div>
        )}

        {/* Modal: Share */}
        {shareFor && (
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShareFor(null)}
            />
            <div className="relative w-full max-w-md bg-white rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Share patient</h3>
                <button
                  onClick={() => setShareFor(null)}
                  className="text-gray-500 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {shareFor.name} — {shareFor.id}
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Share to</div>
                  <Segmented
                    options={[
                      { label: "Doctor", value: "Doctor" as const },
                      { label: "Nurse", value: "Nurse" as const },
                      { label: "Billing", value: "Billing" as const },
                      { label: "Reception", value: "Reception" as const },
                    ]}
                    value={shareTarget}
                    onChange={(v) => setShareTarget(v)}
                  />
                </div>

                {shareTarget === "Doctor" && (
                  <div>
                    <div className="text-sm font-medium mb-2">
                      Select doctor
                    </div>
                    {/* <select value={shareDoctor} onChange={e=>setShareDoctor(e.target.value)} className="h-11 px-3 rounded-xl ring-1 ring-gray-200 w-full">
                    {doctors.map(d=> (<option key={d} value={d}>{d}</option>))}
                  </select> */}
                    <div className="w-full">
                      <FilterSelect
                        className="w-full"
                        value={shareDoctor}
                        onChange={(v) => setShareDoctor(v)}
                        placeholder="Select doctor"
                        searchable
                        options={[
                          { label: "All doctors", value: "All" },
                          ...doctors.map((c) => ({ label: c, value: c })),
                        ]}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium mb-2">Via</div>
                  <Segmented
                    options={[
                      { label: "Copy link", value: "Copy link" as const },
                      { label: "Email", value: "Email" as const },
                      { label: "WhatsApp", value: "WhatsApp" as const },
                    ]}
                    value={shareVia}
                    onChange={(v) => setShareVia(v)}
                  />
                </div>

                <div className="grid gap-2">
                  {shareVia === "Email" && (
                    <input
                      placeholder="Enter email"
                      className="h-11 px-3 rounded-xl ring-1 ring-gray-200"
                    />
                  )}
                  {shareVia === "WhatsApp" && (
                    <input
                      placeholder="Enter WhatsApp number"
                      className="h-11 px-3 rounded-xl ring-1 ring-gray-200"
                    />
                  )}
                </div>

                <button
                  onClick={() => {
                    // demo action
                    if (shareVia === "Copy link")
                      navigator.clipboard?.writeText(
                        `${window.location.origin}/patients/${shareFor.id}`
                      );
                    setShareFor(null);
                    alert(
                      `Shared with ${shareTarget}${
                        shareTarget === "Doctor" ? " — " + shareDoctor : ""
                      } via ${shareVia}`
                    );
                  }}
                  className="w-full h-11 rounded-xl bg-black text-white"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Drawer
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Patient Register"
      >
        <RegisterPatient onClose={() => setOpenCreate(false)} />
      </Drawer>
    </AppShell>
  );
}

const cx = (...cls: (string | false | null | undefined)[]) =>
  cls.filter(Boolean).join(" ");

function Drawer({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-xl transform transition-transform",
        open ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
        <div className="text-base font-semibold">{title}</div>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">{children}</div>
    </div>
  );
}
