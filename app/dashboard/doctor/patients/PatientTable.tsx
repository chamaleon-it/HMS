import { fAge, fDateandTime } from "@/lib/fDateAndTime";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

interface Data {
  _id: string;
  name: string;
  phoneNumber: string;
  email: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: Date;
  conditions: string[];
  blood: string;
  allergies: string;
  address: string;
  notes: string;
  mrn: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
    phoneNumber: string;
  };
  createdAt: Date;
}

export default function PatientTable({
  data,
}: {
  data:
    | {
        message: string;
        data: Data[];
      }
    | undefined;
}) {
  const [history, setHistory] = useState<Data | null>(null);
  const [share, setShare] = useState<Data | null>(null);

  return (
    <div className="rounded-2xl overflow-hidden bg-white ring-1 ring-gray-200 shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-600">
            <th className="w-14 text-left px-4 py-3">No.</th>
            {headerCell("Patient")}
            {headerCell("Phone Number")}
            <th className="w-24 text-left px-4 py-3">Patient ID</th>
            {headerCell("Age / Gender")}
            {headerCell("Created At")}
            {headerCell("Created By")}
            <th className="text-left px-4 py-3">Conditions</th>
            {headerCell("Blood")}
            {headerCell("Allergies")}

            <th className="w-40 text-right px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((r, idx) => {
            const serial = (0 - 1) * 0 + idx + 1; // serial number after filters & sort
            return (
              <tr
                key={r._id}
                className="border-t border-gray-100 hover:bg-gray-50/60"
              >
                <td className="px-2 py-3 text-sm text-gray-500" align="center">
                  {serial}
                </td>
                <td className="px-2 py-3">
                  <Link href={`/dashboard/doctor/patients/${r._id}`}>
                    <div className="font-medium text-gray-900">{r.name}</div>
                  </Link>
                  <div className="text-xs text-gray-500">{r.email}</div>
                </td>
                <td className="px-2 py-3 text-sm text-gray-700">
                  {r.phoneNumber}
                </td>
                <td className="px-2 py-3 text-sm text-gray-600">{r?.mrn}</td>
                <td className="px-2 py-3 text-sm text-gray-700">
                  {fAge(r.dateOfBirth)} <span className="text-gray-400">/</span>{" "}
                  {r.gender}
                </td>
                <td className="px-2 py-3 text-sm text-gray-700">
                  {fDateandTime(r.createdAt)}
                </td>
                <td className="px-2 py-3 text-sm text-gray-700">
                  {r.createdBy.name} - {r.createdBy.role}
                </td>
                <td className="px-2 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {r?.conditions &&
                      r.conditions
                        .slice(0, 3)
                        .map((condition) => (
                          <Chip
                            key={condition}
                            label={condition}
                            tone={
                              condition?.toLowerCase().includes("fever")
                                ? "amber"
                                : condition?.toLowerCase().includes("diabetes")
                                ? "amber"
                                : "gray"
                            }
                          />
                        ))}
                  </div>
                </td>
                <td className="px-2 py-3 text-sm text-gray-700">{r.blood}</td>
                <td className="px-2 py-3 text-sm text-gray-700">
                  {r.allergies}
                </td>
                <td className="px-2 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <Link
                      href={`/dashboard/doctor/patients/${r._id}`}
                      className="px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      View
                    </Link>
                    <button
                      className="px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setHistory(r)}
                    >
                      History
                    </button>
                    <button
                      className="px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setShare(r)}
                    >
                      Share
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {data?.data.length === 0 && (
            <tr>
              <td
                colSpan={11}
                className="px-4 py-12 text-center text-sm text-gray-500"
              >
                No patients match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {history && <History setHistory={setHistory} history={history} />}
      {share && <Share setShare={setShare} share={share} />}
    </div>
  );
}

const History = ({
  setHistory,
  history,
}: {
  setHistory: (v: null | Data) => void;
  history?: Data;
}) => {
  const router = useRouter();
  const { data } = useSWR<{
    message: string;
    data: {
      _id: string;
      patient: Data;
      doctor: {
        _id: string;
        name: string;
        specialization: string;
      };
      method: string;
      date: Date;
    }[];
  }>(history?._id ? `/appointments/patient/${history._id}` : null);
  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => setHistory(null)}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">History — {history?.name}</h2>
          <button
            onClick={() => setHistory(null)}
            className="text-gray-500 hover:text-gray-900"
          >
            ✕
          </button>
        </div>
        <ol className="relative border-s border-gray-200 ps-5 space-y-6">
          {/* <li>
                  <div className="absolute -start-1.5 mt-1.5 w-3 h-3 rounded-full bg-gray-300" />
                  <div className="text-sm">
                    <span className="font-medium">{fDate(data?.data[0].date)}</span> —
                    Last visit recorded
                  </div>
                </li> */}

          <li>
            <div className="absolute -start-1.5 mt-1.5 w-3 h-3 rounded-full bg-gray-300" />
            <div className="text-sm">
              <span className="font-medium">{data?.data.length} visit(s)</span>
            </div>
          </li>

          {data?.data.map((e) => {
            return (
              <li key={e._id} className="">
                <div className="absolute -start-1.5 mt-1.5 w-3 h-3 rounded-full bg-gray-300" />

                <div className=" grid gap-1">
                  <div className="flex items-start gap-2 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900">
                        {fDateandTime(e.date)}
                      </div>
                      <div className="text-gray-600">
                        <span className="truncate">
                          {e.doctor.name}
                          {e.doctor.specialization
                            ? ` — ${e.doctor.specialization}`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  {e.method ? (
                    <div className="">
                      <span className="rounded-full border px-2 py-0.5 text-xs text-gray-700">
                        {e.method}
                      </span>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
        <button
          onClick={() => {
            router.push(`/dashboard/doctor/patients/${history?._id}`);
          }}
          className="mt-6 w-full h-11 rounded-xl bg-black text-white"
        >
          Open full history
        </button>
      </div>
    </div>
  );
};

const Share = ({
  setShare,
  share,
}: {
  setShare: (v: null | Data) => void;
  share: Data | null;
}) => {
  const [shareTarget, setShareTarget] = useState("");
  const [shareVia, setShareVia] = useState("");
  const [shareDoctor, setShareDoctor] = useState<string>("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setShare(null)}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Share patient</h3>
          <button
            onClick={() => setShare(null)}
            className="text-gray-500 hover:text-gray-900"
          >
            ✕
          </button>
        </div>
        <div className="text-sm text-gray-500">{share?.name}</div>

        <div className="mt-4 space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Share to</div>
            <Segmented
              options={[
                { label: "Doctor", value: "Doctor" as const },
                { label: "Pharmacy", value: "Pharmacy" as const },
                { label: "Lab", value: "Lab" as const },
              ]}
              value={shareTarget}
              onChange={(v) => setShareTarget(v)}
            />
          </div>

          {shareTarget === "Doctor" && (
            <div>
              <div className="text-sm font-medium mb-2">Select doctor</div>

              <div className="w-full">
                <FilterSelect
                  className="w-full"
                  value={shareDoctor}
                  onChange={(v) => setShareDoctor(v)}
                  placeholder="Select doctor"
                  searchable
                  options={[{ label: "All doctors", value: "All" }]}
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
            onClick={() => {}}
            className="w-full h-11 rounded-xl bg-black text-white"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

function headerCell(label: string) {
  return (
    <th className="text-left px-2 py-3 select-none">
      <button
        className={`inline-flex items-center gap-1 text-xs font-medium ${"text-gray-600"} hover:text-gray-900`}
      >
        {label}
      </button>
    </th>
  );
}

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
    <div
      className={`grid grid-cols-${options.length} gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto`}
    >
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
