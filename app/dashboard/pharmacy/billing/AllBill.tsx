import { Eye, Printer, Search, CheckCircle } from "lucide-react";
import React from "react";
import Link from "next/link";
import Filters from "./Filter";
import { formatINR, getDecimal } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";
import { FilterType } from "./page";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

interface BillRow {
  status: "Paid" | "Partial" | "Unpaid" | "Return";
  method: "cash" | "online" | "insurance" | "mixed";
}

interface PropsType {
  billingMutate: () => void;
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  total: number;
  billing: {
    transactionType: "Return" | "Sale"
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
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [printBill, setPrintBill] = React.useState<PropsType["billing"][number] | null>(null);

  const handlePrint = (bill: PropsType["billing"][number]) => {
    setPrintBill(bill);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  console.log(billing)
  return (
    <>
      <div className="flex flex-col gap-6 print:hidden mt-6">


        <div className="bg-white/90 border rounded-2xl shadow-md shadow-slate-200 overflow-hidden">
          <Table className="print:hidden min-w-[1200px] text-sm" containerClassName="max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            <TableHeader className="bg-slate-700 sticky top-0 z-20 shadow-sm">
              <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                <TableHead className="py-2.5 text-left pl-4 w-16 text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Sl No</TableHead>
                <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Invoice</TableHead>
                <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Date</TableHead>
                <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Patient</TableHead>
                <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Items</TableHead>
                <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Total</TableHead>
                <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Round off</TableHead>
                <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Discount</TableHead>
                <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Paid</TableHead>
                <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Due</TableHead>
                <TableHead className="py-2.5 text-center text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Status</TableHead>
                <TableHead className="py-2.5 text-right pr-4 text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Action</TableHead>
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
                (filter.activeDate === "Today" || filter.activeDate === "Custom"
                  ? billing
                  : billing.slice((filter.page - 1) * filter.limit, filter.page * filter.limit)
                ).map((b, idx) => (
                  <TableRow
                    key={b._id}
                    className={idx % 2 === 0
                      ? "bg-white hover:bg-white/60"
                      : "bg-slate-100 hover:bg-slate-100/60"
                    }
                  >
                    <TableCell className="py-3 pl-4 text-slate-500">
                      {(filter.activeDate === "Today" || filter.activeDate === "Custom")
                        ? idx + 1
                        : (filter.page - 1) * filter.limit + idx + 1}
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
                          return b.transactionType === "Return" ? "Return" : total <= paid
                            ? "Paid"
                            : paid === 0
                              ? "Unpaid"
                              : "Partial";
                        })()}
                      />
                    </TableCell>
                    <TableCell className="py-3 pr-4">
                      <div className="flex justify-end items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              <Link href={`/dashboard/pharmacy/billing/single?id=${b._id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Bill</p>
                          </TooltipContent>
                        </Tooltip>

                        <Button variant="outline" size="sm" onClick={() => handlePrint(b)} className="h-8 text-xs gap-1.5 text-purple-700 border-purple-200 hover:bg-purple-50 hover:text-purple-800">
                          <Printer className="h-3.5 w-3.5" /> Print
                        </Button>

                        {b.items.reduce(
                          (sum, i) => sum + i.total,
                          0
                        ) > b.cash + b.online + b.insurance + (b.discount ?? 0) + (b.roundOff ? getDecimal(b.items.reduce((a, b) => a + b.total, 0)) : 0) ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
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
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Mark as Paid</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <div className="w-8 h-8" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {billing.length > 0 && (
              <TableFooter className="sticky bottom-0 z-10 bg-emerald-50 font-extrabold text-[15px] text-slate-900 border-t-2 border-slate-300 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <TableRow className="hover:bg-emerald-50 bg-emerald-50">
                  <TableCell colSpan={5} className="py-4 px-4 text-right uppercase tracking-wider text-sm font-black text-slate-800">
                    Total
                  </TableCell>
                  <TableCell className="py-4 text-right tabular-nums">
                    {formatINR(billing.reduce((acc, b) => acc + (b.transactionType === "Return" ? 0 : b.items.reduce((a, x) => a + x.total, 0)), 0) - billing.reduce((acc, b) => acc + (b.transactionType === "Sale" ? 0 : b.items.reduce((a, x) => a + x.total, 0)), 0))}
                  </TableCell>
                  <TableCell className="py-4 text-right tabular-nums text-slate-700">
                    {billing.reduce((acc, b) => acc + (b.transactionType === "Return" ? 0 : b.roundOff ? getDecimal(b.items.reduce((a, x) => a + x.total, 0)) : 0), 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="py-4 text-right tabular-nums">
                    {formatINR(billing.reduce((acc, b) => acc + (b.discount ?? 0), 0))}
                  </TableCell>
                  <TableCell className="py-4 text-right tabular-nums text-emerald-700 font-black">
                    {formatINR(billing.reduce((acc, b) => b.transactionType === "Return" ? acc - b.cash : acc + b.insurance + b.cash + b.online, 0))}
                  </TableCell>
                  <TableCell className="py-4 text-right tabular-nums text-rose-700 font-black">
                    {formatINR(billing.reduce((acc, b) =>
                      acc + (b.transactionType === "Return" ? 0 : b.items.reduce((a, x) => a + x.total, 0) -
                        (b.roundOff ? getDecimal(b.items.reduce((a, x) => a + x.total, 0)) : 0) -
                        (b.insurance + b.cash + b.online + (b.discount ?? 0))), 0
                    )
                    )}
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
        {(filter.activeDate !== "Today" && filter.activeDate !== "Custom") && billing.length > filter.limit && (
          <div className="px-4 py-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
            <PaginationBar
              page={filter.page}
              limit={filter.limit}
              total={billing.length}
              setFilter={setFilter}
            />
          </div>
        )}
      </div>
      <AddPaymentDialog
        open={isPaymentOpen}
        setOpen={setIsPaymentOpen}
        bill={null} // temporary cast until types align perfectly
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
      : s === "Partial" || s === "Unpaid"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : s === "Return"
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
