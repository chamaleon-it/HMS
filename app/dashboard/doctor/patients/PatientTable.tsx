import { fAge, fDateandTime } from "@/lib/fDateAndTime";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import History from "./History";
import Share from "./Share";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Drawer from "@/components/ui/drawer";
import { RegisterPatient } from "./RegisterPatient";

export interface Data {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: Date;
  conditions: string[];
  blood?: string;
  allergies?: string;
  address?: string;
  notes?: string;
  mrn: string;
  emergencyContactNumber?: string;
  insurance?: string;
  insuranceValidity?: Date;
  uhid?: string;
  doctor: {
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
  tableMutate,
}: {
  tableMutate: () => void;
  data:
  | {
    message: string;
    data: Data[];
  }
  | undefined;
}) {
  const [history, setHistory] = useState<Data | null>(null);
  const [share, setShare] = useState<Data | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [edit, setEdit] = useState<Data | null>(null);
  const [open, setOpen] = useState(false);

  const deleteBulkPatient = useCallback(async () => {
    try {
      await toast.promise(
        api.delete("/patients", {
          data: {
            ids: selectedIds,
          },
        }),
        {
          loading: "Patient is deleting...",
          success: ({ data }) => data.message,
          error: ({ response }) => response.data.message,
        }
      );
      tableMutate();
      setSelectedIds([]);
      setOpen(false);
    } catch (error) {
      console.log(error);
    }
  }, [selectedIds, tableMutate]);

  return (
    <>
      {Boolean(selectedIds.length) && (
        <div className=" z-10 mb-2 flex items-center justify-between rounded-xl bg-black text-white px-4 py-2">
          <div className="text-sm">{selectedIds.length} selected</div>
          <div className="flex gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  className="font-semibold cursor-pointer"
                  variant={"destructive"}
                >
                  <Trash className="h-4 w-4" strokeWidth={3} />
                  Delete {selectedIds.length === data?.data.length && "All"}
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                  <DialogTitle>Delete patients</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">
                      {selectedIds.length} patients
                    </span>
                    ? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="cursor-pointer">
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button onClick={deleteBulkPatient}>Delete patient</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <button
              className="px-3 h-9 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer"
              onClick={() => setSelectedIds([])}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 mt-6">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700 hover:bg-slate-700 border-b-0">
              <th className="w-14  px-4 py-2.5">
                <Checkbox
                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-slate-700"
                  checked={selectedIds.length === data?.data.length}
                  onCheckedChange={(checked: boolean) =>
                    checked
                      ? setSelectedIds(data?.data.map((e) => e._id) ?? [])
                      : setSelectedIds([])
                  }
                />
              </th>
              <th className="w-14 text-left px-4 py-2.5 text-white font-bold text-[11px] uppercase tracking-wider">No.</th>
              {headerCell("Patient")}
              {headerCell("Phone Number")}
              {headerCell("Age / Gender")}
              {headerCell("Created At")}
              {headerCell("Doctor")}
              <th className="text-left px-4 py-2.5 text-white font-bold text-[11px] uppercase tracking-wider">Conditions</th>
              {headerCell("Blood")}
              {headerCell("Allergies")}

              <th className="w-40 text-right px-4 py-2.5 pr-4 text-white font-bold text-[11px] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((r, idx) => {
              const serial = (0 - 1) * 0 + idx + 1; // serial number after filters & sort
              return (
                <tr
                  key={r._id}
                  className={`border-t border-gray-100 ${idx % 2 === 0
                    ? "bg-white hover:bg-white/60"
                    : "bg-slate-100 hover:bg-slate-100/60"
                    }`}
                >
                  <td align="center">
                    <Checkbox
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds((prev) => [...prev, r._id]);
                        } else {
                          setSelectedIds((prev) =>
                            prev.filter((e) => e !== r._id)
                          );
                        }
                      }}
                      checked={selectedIds.includes(r._id)}
                    />
                  </td>
                  <td
                    className="px-2 py-3 text-sm text-gray-500"
                    align="center"
                  >
                    {serial}
                  </td>
                  <td className="px-2 py-3">
                    <Link href={`/dashboard/doctor/patients/single?id=${r._id}`}>
                      <div className="font-medium text-gray-900">
                        {r.name}{" "}
                        <span className="text-sm text-gray-500">
                          ({r?.mrn})
                        </span>
                      </div>
                    </Link>
                    <div className="text-xs text-gray-500">{r.email}</div>
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700">
                    {r.phoneNumber}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700">
                    {fAge(r.dateOfBirth).years}y {fAge(r.dateOfBirth).months}m{" "}
                    <span className="text-gray-400">/</span> {r.gender}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700">
                    {fDateandTime(r.createdAt)}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700">
                    {r?.doctor?.name}
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
                                  : condition
                                    ?.toLowerCase()
                                    .includes("diabetes")
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
                      <button
                        className="px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setEdit(r)}
                      >
                        Edit
                      </button>
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

      {edit?._id && (
        <Drawer
          open={Boolean(edit)}
          onClose={() => setEdit(null)}
          title="Patient Edit"
        >
          <RegisterPatient
            onClose={() => setEdit(null)}
            mutate={tableMutate}
            patient={edit}
          />
        </Drawer>
      )}
    </>
  );
}

function headerCell(label: string) {
  return (
    <th className="text-left px-2 py-3 select-none">
      <button
        className={`inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold text-white hover:text-white/80`}
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

export function Segmented<T extends string>({
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

export function FilterSelect<T extends string>({
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
