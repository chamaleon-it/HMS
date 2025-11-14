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
export default function AllBill({ billing,filter,setFilter }: PropsType) {
  return (
    <div className="space-y-4">
      <Filters filter={filter} setFilter={setFilter}/>

      <div
        className={
          "rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900"
        }
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold">Bills</div>
          <div className="text-xs text-slate-500">{billing.length} results</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm">
            <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur">
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                <th className="py-2 text-left">Invoice</th>
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-left">Patient</th>
                <th className="py-2 text-right">Items</th>
                <th className="py-2 text-right">Total</th>
                <th className="py-2 text-right">Paid</th>
                <th className="py-2 text-right">Due</th>
                <th className="py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {billing.map((b) => (
                <tr
                  key={b._id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
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
                  <td className="py-2 px-2 text-center">
                    <div className="flex justify-between items-center gap-5">
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
                        className="ml-2 inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> View
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
