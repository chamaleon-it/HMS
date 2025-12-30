import { Eye } from "lucide-react";
import React from "react";
import Link from "next/link";
import Filters from "./Filter";
import { formatINR, getDecimal } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";
import { FilterType } from "./page";
import { Button } from "@/components/ui/button";

interface BillRow {
  status: "Paid" | "Partial" | "Unpaid";
  method: "cash" | "online" | "insurance" | "mixed";
}

interface PropsType {
  billingMutate: () => void;
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  billing: {
    roundOff: boolean;
    mrn: string;
    _id: string;
    createdAt: Date;
    cash: number;
    online: number;
    insurance: number;
    discount: number;
    items: {
      total: number;
      quantity: number;
      unitPrice: number;
      gst: number;
    }[];
    patient: {
      name: string;
      mrn: string;
    };
  }[];
}
import AddPaymentDialog from "./AddPaymentDialog";

export default function AllBill({ billing, filter, setFilter, billingMutate }: PropsType) {
  const [selectedBill, setSelectedBill] = React.useState<PropsType["billing"][number] | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);


  return (
    <div className="space-y-4 print:hidden">
      <Filters filter={filter} setFilter={setFilter} />

      <div
        className={
          "rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900"
        }
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold">Bills</div>
          <div className="text-xs text-slate-500">{billing.length} results</div>
        </div>
        <div className="overflow-x-auto rounded-xl ">
          <table className="w-full  text-sm">
            <thead className=" bg-slate-700 backdrop-blur">
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-white ">
                <th className="py-2 text-left pl-2">Invoice</th>
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-left">Patient</th>
                <th className="py-2 text-right">Items</th>
                <th className="py-2 text-right">Total</th>
                <th className="py-2 text-right">Round off</th>
                <th className="py-2 text-right">Discount</th>
                <th className="py-2 text-right">Paid</th>
                <th className="py-2 text-right">Due</th>
                <th className="py-2 text-center ">Status</th>
                <th className="py-2 text-center ">Action</th>
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
                  <td className="py-2 px-2">
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
                    {(b.roundOff ? getDecimal(b.items.reduce((a, b) => a + b.total, 0)) : 0)}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {formatINR(b.discount)}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {formatINR(b.insurance + b.cash + b.online)}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {formatINR(
                      b.items.reduce((a, b) => a + b.total, 0) -
                      (b.roundOff ? getDecimal(b.items.reduce((a, b) => a + b.total, 0)) : 0) -
                      (b.insurance + b.cash + b.online + (b.discount ?? 0))
                    )}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <StatusPill
                      s={(() => {
                        const total = b.items.reduce(
                          (sum, i) => sum + i.total,
                          0
                        ) - (b.roundOff ? getDecimal(b.items.reduce((a, b) => a + b.total, 0)) : 0);
                        const paid = b.cash + b.online + b.insurance + (b.discount ?? 0);
                        return total <= paid
                          ? "Paid"
                          : paid === 0
                            ? "Unpaid"
                            : "Partial";
                      })()}
                    />
                  </td>
                  <td className="">
                    <div className="flex justify-start items-center gap-2">
                      <Button variant={"outline"} size={"sm"} asChild>
                        <Link
                          href={`/dashboard/pharmacy/billing/${b._id}`}
                        >
                          <Eye className=" h-3.5 w-3.5" /> View
                        </Link>
                      </Button>
                      {b.items.reduce(
                        (sum, i) => sum + i.total,
                        0
                      ) > b.cash + b.online + b.insurance + (b.discount ?? 0) + (b.roundOff ? getDecimal(b.items.reduce((a, b) => a + b.total, 0)) : 0) && <Button
                        variant={"outline"}
                        size={"sm"}
                        onClick={() => {
                          setSelectedBill(b);
                          setIsPaymentOpen(true);
                        }}
                      >
                          Add Payment
                        </Button>}
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
      <AddPaymentDialog
        open={isPaymentOpen}
        setOpen={setIsPaymentOpen}
        bill={selectedBill as any} // temporary cast until types align perfectly
        billingMutate={billingMutate}
      />
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
