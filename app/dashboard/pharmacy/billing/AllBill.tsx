import { Eye, Printer, Search } from "lucide-react";
import React from "react";
import Link from "next/link";
import Filters from "./Filter";
import { formatINR, getDecimal } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";
import { FilterType } from "./page";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BillRow {
  status: "Paid" | "Partial" | "Unpaid";
  method: "cash" | "online" | "insurance" | "mixed";
}

interface PropsType {
  billingMutate: () => void;
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  total: number;
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
      name: string;
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
import toast from "react-hot-toast";
import api from "@/lib/axios";
import PrintReceipt from "./PrintReceipt";
import { PaginationBar } from "../components/PaginationBar";

export default function AllBill({ billing, filter, setFilter, total, billingMutate }: PropsType) {
  const [selectedBill, setSelectedBill] = React.useState<PropsType["billing"][number] | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [printBill, setPrintBill] = React.useState<PropsType["billing"][number] | null>(null);

  const handlePrint = (bill: PropsType["billing"][number]) => {
    setPrintBill(bill);
    setTimeout(() => {
      window.print();
    }, 100);
  };


  return (
    <>
      <div className="flex flex-col gap-6 print:hidden">
        <Filters filter={filter} setFilter={setFilter} />

        <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 overflow-x-auto">
          <Table className="print:hidden min-w-[1200px] text-sm">
            <TableHeader className="bg-slate-700 hover:bg-slate-700">
              <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                <TableHead className="py-2.5 text-left pl-4 w-16 text-white font-bold text-[11px] uppercase tracking-wider">Sl No</TableHead>
                <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider">Invoice</TableHead>
                <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider">Date</TableHead>
                <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider">Patient</TableHead>
                <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">Items</TableHead>
                <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">Total</TableHead>
                <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">Round off</TableHead>
                <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">Discount</TableHead>
                <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">Paid</TableHead>
                <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">Due</TableHead>
                <TableHead className="py-2.5 text-center text-white font-bold text-[11px] uppercase tracking-wider">Status</TableHead>
                <TableHead className="py-2.5 text-right pr-4 text-white font-bold text-[11px] uppercase tracking-wider">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billing.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center dark:bg-slate-800">
                        <Search className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No bills found</p>
                      <p className="text-xs text-slate-400">Try adjusting your filters or search terms</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                billing.map((b, idx) => (
                  <TableRow
                    key={b._id}
                    className={idx % 2 === 0
                      ? "bg-white hover:bg-white/60"
                      : "bg-slate-100 hover:bg-slate-100/60"
                    }
                  >
                    <TableCell className="py-3 pl-4 text-slate-500">
                      {(filter.page - 1) * filter.limit + idx + 1}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="font-medium text-slate-900">{b.mrn}</div>
                      <div className="text-[11px] text-slate-500 space-x-1 mt-1">
                        {Boolean(b.cash) && <MethodPill m="cash" />}
                        {Boolean(b.online) && <MethodPill m="online" />}
                        {Boolean(b.insurance) && <MethodPill m="insurance" />}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-slate-600 whitespace-nowrap">{fDateandTime(b.createdAt)}</TableCell>
                    <TableCell className="py-3">
                      <div className="font-medium truncate text-slate-900">{b.patient.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {b.patient.mrn}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right tabular-nums text-slate-700">
                      {b.items.length}
                    </TableCell>
                    <TableCell className="py-3 text-right tabular-nums font-medium text-slate-900">
                      {formatINR(b.items.reduce((a, b) => a + b.total, 0))}
                    </TableCell>
                    <TableCell className="py-3 text-right tabular-nums text-slate-600">
                      {(b.roundOff ? getDecimal(b.items.reduce((a, b) => a + b.total, 0)) : 0)}
                    </TableCell>
                    <TableCell className="py-3 text-right tabular-nums text-slate-600">
                      {formatINR(b.discount)}
                    </TableCell>
                    <TableCell className="py-3 text-right tabular-nums text-emerald-600 font-medium">
                      {formatINR(b.insurance + b.cash + b.online)}
                    </TableCell>
                    <TableCell className="py-3 text-right tabular-nums text-rose-600 font-medium">
                      {formatINR(
                        b.items.reduce((a, b) => a + b.total, 0) -
                        (b.roundOff ? getDecimal(b.items.reduce((a, b) => a + b.total, 0)) : 0) -
                        (b.insurance + b.cash + b.online + (b.discount ?? 0))
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-center">
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
                    </TableCell>
                    <TableCell className="py-3 pr-4">
                      <div className="flex justify-end items-center gap-2">
                        <Button variant={"outline"} size={"sm"} asChild className="h-8 text-xs gap-1.5">
                          <Link
                            href={`/dashboard/pharmacy/billing/single?id=${b._id}`}
                          >
                            <Eye className=" h-3.5 w-3.5 text-slate-500" /> View
                          </Link>
                        </Button>

                        <Button variant={"outline"} size={"sm"} onClick={() => handlePrint(b)} className="h-8 text-xs gap-1.5">
                          <Printer className="h-3.5 w-3.5 text-slate-500" /> Print
                        </Button>
                        {b.items.reduce(
                          (sum, i) => sum + i.total,
                          0
                        ) > b.cash + b.online + b.insurance + (b.discount ?? 0) + (b.roundOff ? getDecimal(b.items.reduce((a, b) => a + b.total, 0)) : 0) && <Button
                          variant={"outline"}
                          size={"sm"}
                          className="h-8 text-xs bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white border-none shadow-sm shadow-emerald-200"
                          onClick={async () => {
                            const due = b.items.reduce((a, b) => a + b.total, 0) -
                              (b.roundOff ? getDecimal(b.items.reduce((a, b) => a + b.total, 0)) : 0) -
                              (b.insurance + b.cash + b.online + (b.discount ?? 0))
                            await toast.promise(api.patch(`/billing/mark_as_paid/${b._id}`, { amount: due }), {
                              loading: "Marking as paid",
                              success: "Marked as paid",
                              error: "Failed to mark as paid"
                            })
                            billingMutate()
                          }}
                        >
                            Mark as Paid
                          </Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {total > filter.limit && (
          <div className="px-4 py-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
            <PaginationBar
              page={filter.page}
              limit={filter.limit}
              total={total}
              setFilter={setFilter}
            />
          </div>
        )}
      </div>
      <AddPaymentDialog
        open={isPaymentOpen}
        setOpen={setIsPaymentOpen}
        bill={selectedBill as any} // temporary cast until types align perfectly
        billingMutate={billingMutate}
      />

      {printBill && (
        <PrintReceipt
          payload={{
            patient: printBill.patient.name,
            items: printBill.items.map((i) => ({ ...i, name: i.name })),
            cash: printBill.cash,
            online: printBill.online,
            insurance: printBill.insurance,
            discount: printBill.discount,
          }}
          patient={{
            name: printBill.patient.name,
            mrn: printBill.patient.mrn,
          }}
          invoiceDetails={{
            prefix: "MINV",
            roundOffAmount: printBill.roundOff
              ? getDecimal(printBill.items.reduce((a, b) => a + b.total, 0))
              : 0,
            subtotal: printBill.items.reduce(
              (a, b) => a + b.unitPrice * b.quantity,
              0
            ),
            totalGst: printBill.items.reduce(
              (a, b) => a + (b.total - b.unitPrice * b.quantity),
              0
            ),
            grandTotal: printBill.items.reduce((a, b) => a + b.total, 0),
          }}
        />
      )}
    </>
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
