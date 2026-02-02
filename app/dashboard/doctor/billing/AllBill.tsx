import { Eye } from "lucide-react";
import React from "react";
import Link from "next/link";
import Filters from "./Filter";
import { formatINR } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";
import { FilterType } from "./page";

interface BillRow {
  status: "Paid" | "Partial" | "Unpaid";
  method: "cash" | "online" | "insurance" | "mixed";
}

interface PropsType {
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  billing: {
    roundOff: boolean
    mrn: string;
    _id: string;
    createdAt: Date;
    cash: number;
    online: number;
    insurance: number;
    items: {
      total: number;
    }[];
    patient: {
      name: string;
      mrn: string;
    };
  }[];
}
export default function AllBill({ billing, filter, setFilter }: PropsType) {
  return (
    <div className="space-y-4">
      <Filters filter={filter} setFilter={setFilter} />

      <div
        className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 mt-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 hover:bg-slate-700">
              <tr className="bg-slate-700 hover:bg-slate-700 border-b-0">
                <th className="py-2.5 text-left pl-4 text-white font-bold text-[11px] uppercase tracking-wider">Invoice</th>
                <th className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider">Date</th>
                <th className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider">Patient</th>
                <th className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">Items</th>
                <th className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">Total</th>
                <th className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">Paid</th>
                <th className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">Due</th>
                <th className="py-2.5 text-right pr-4 text-white font-bold text-[11px] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {billing.map((b, idx) => (
                <tr
                  key={b._id}
                  className={`border-b border-slate-100 last:border-0 ${idx % 2 === 0
                    ? "bg-white hover:bg-white/60"
                    : "bg-slate-100 hover:bg-slate-100/60"
                    }`}
                >
                  <td className="py-2 pr-2">
                    <div className="font-medium">{b.mrn}</div>
                    <div className="text-[11px] text-slate-500 space-x-1">
                      {Boolean(b.cash) && <MethodPill m="cash" />}
                      {Boolean(b.online) && <MethodPill m="online" />}
                      {Boolean(b.insurance) && <MethodPill m="insurance" />}
                    </div>
                  </td>
                  <td className="py-2 pr-2">{fDateandTime(b.createdAt)}</td>
                  <td className="py-2 pr-2">
                    <div className="font-medium truncate">{b.patient.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {b.patient.mrn}
                    </div>
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {b.items.length}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {formatINR(b.items.reduce((a, b) => a + b.total, 0))}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {formatINR(b.insurance + b.cash + b.online)}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {formatINR(
                      b.items.reduce((a, b) => a + b.total, 0) -
                      (b.insurance + b.cash + b.online)
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <StatusPill
                        s={(() => {
                          const total = b.items.reduce(
                            (sum, i) => sum + i.total,
                            0
                          );
                          const paid = b.cash + b.online + b.insurance;
                          return total <= paid
                            ? "Paid"
                            : paid === 0
                              ? "Unpaid"
                              : "Partial";
                        })()}
                      />
                      <Link
                        href={`/dashboard/doctor/billing/${b._id}`}
                        className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-sm"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {Math.min(10, billing.length)} of {billing.length}
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
              Prev
            </button>
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const MethodPill: React.FC<{ m: BillRow["method"] }> = ({ m }) => {
  const map: Record<BillRow["method"], string> = {
    cash: "bg-slate-100 text-slate-700 border-slate-200",
    online: "bg-indigo-50 text-indigo-700 border-indigo-200",
    insurance: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    mixed: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${map[m]} capitalize`}
    >
      {m}
    </span>
  );
};

const StatusPill: React.FC<{ s: BillRow["status"] }> = ({ s }) => {
  const cls =
    s === "Paid"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : s === "Partial"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-rose-50 text-rose-700 border-rose-200";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {s}
    </span>
  );
};
