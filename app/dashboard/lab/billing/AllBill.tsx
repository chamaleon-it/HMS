import { Eye, Search, Edit, Printer, CheckCircle2 } from "lucide-react";
import React from "react";
import Link from "next/link";
import Filters from "./Filter";
import { formatINR } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";
import { FilterType } from "./page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AddPaymentDialog from "./AddPaymentDialog";
import MarkAsPaidModal from "@/components/dashboard/billing/MarkAsPaidModal";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import LabBillReceipt from "@/components/dashboard/lab/Home/LabBillReceipt";

interface BillRow {
  status: "Paid" | "Partial" | "Unpaid";
  method: "cash" | "card" | "upi" | "mixed";
}

interface PropsType {
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  billing: {
    mrn: string;
    _id: string;
    createdAt: Date;
    cash: number;
    card: number;
    upi: number;
    discount: number;
    items: {
      total: number;
    }[];
    patient: {
      name: string;
      mrn: string;
    };
  }[];
  billingMutate: () => void;
}

export default function AllBill({ billing, filter, setFilter, billingMutate }: PropsType) {
  const [paymentModelOpen, setPaymentModelOpen] = React.useState(false);
  const [selectedBill, setSelectedBill] = React.useState<any>(null);
  const [markAsPaidModalOpen, setMarkAsPaidModalOpen] = React.useState(false);
  const [selectedMarkAsPaidBill, setSelectedMarkAsPaidBill] = React.useState<any>(null);
  const [printBill, setPrintBill] = React.useState<any | null>(null);

  const handlePrint = (bill: any) => {
    setPrintBill(bill);
    setTimeout(() => {
      window.print();
      setPrintBill(null);
    }, 100);
  };

  return (
    <div className="flex flex-col gap-6">
      <Filters filter={filter} setFilter={setFilter} />

      <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 overflow-x-auto">
        <Table className="min-w-300 text-sm">
          <TableHeader className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark)">
            <TableRow className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) border-b-0">
              <TableHead className="py-2.5 text-left pl-4 w-16 text-white font-bold text-[11px] uppercase tracking-wider">
                Sl No
              </TableHead>
              <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider">
                Invoice
              </TableHead>
              <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider">
                Date
              </TableHead>
              <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider">
                Patient
              </TableHead>
              <TableHead className="py-2.5 text-center text-white font-bold text-[11px] uppercase tracking-wider">
                Payment Method
              </TableHead>
              <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">
                Total
              </TableHead>
              <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">
                Discount
              </TableHead>
              <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">
                Paid
              </TableHead>
              <TableHead className="py-2.5 text-right text-white font-bold text-[11px] uppercase tracking-wider">
                Due
              </TableHead>
              <TableHead className="py-2.5 text-center text-white font-bold text-[11px] uppercase tracking-wider">
                State
              </TableHead>
              <TableHead className="py-2.5 text-center text-white font-bold text-[11px] uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="py-2.5 text-right pr-4 text-white font-bold text-[11px] uppercase tracking-wider">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billing.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center dark:bg-slate-800">
                      <Search className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      No bills found
                    </p>
                    <p className="text-xs text-slate-400">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              billing.map((b, idx) => (
                <TableRow
                  key={b._id}
                  className={
                    idx % 2 === 0
                      ? "bg-white hover:bg-white/60"
                      : "bg-slate-100 hover:bg-slate-100/60"
                  }
                >
                  <TableCell className="py-3 pl-4 text-slate-500">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-medium text-slate-900">{b.mrn}</div>
                  </TableCell>
                  <TableCell className="py-3 text-slate-600 whitespace-nowrap">
                    {fDateandTime(b.createdAt)}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-medium truncate text-slate-900">
                      {b.patient.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {b.patient.mrn}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {Boolean(b.cash) && (
                        <MethodPill
                          m="cash"
                          label={Boolean(b.card || b.upi) ? `Cash: ${formatINR(b.cash)}` : undefined}
                        />
                      )}
                      {Boolean(b.card) && (
                        <MethodPill
                          m="card"
                          label={Boolean(b.cash || b.upi) ? `Card: ${formatINR(b.card)}` : undefined}
                        />
                      )}
                      {Boolean(b.upi) && (
                        <MethodPill
                          m="upi"
                          label={Boolean(b.cash || b.card) ? `UPI: ${formatINR(b.upi)}` : undefined}
                        />
                      )}
                      {!b.cash && !b.card && !b.upi && (
                        <span className="text-slate-400 text-xs italic">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums font-medium text-slate-900">
                    {formatINR(b.items.reduce((a, b) => a + b.total, 0))}
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums text-slate-600 font-medium">
                    {formatINR(b.discount || 0)}
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums text-emerald-600 font-medium">
                    <div>{formatINR((b.cash ?? 0) + (b.card ?? 0) + (b.upi ?? 0))}</div>
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums text-rose-600 font-medium">
                    {formatINR(
                      Math.max(
                        0,
                        b.items.reduce((a, i) => a + (i.total ?? 0), 0) -
                        (b.discount || 0) -
                        ((b.cash ?? 0) + (b.card ?? 0) + (b.upi ?? 0))
                      )
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${(b as any).status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'} border`}>
                      {(b as any).status || 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <StatusPill
                      s={(() => {
                        const subtotal = b.items.reduce(
                          (sum, i) => sum + (i.total ?? 0),
                          0
                        );
                        const total = subtotal - (b.discount || 0);
                        const paid = (b.cash ?? 0) + (b.card ?? 0) + (b.upi ?? 0);
                        if (total - paid <= 0.01) return "Paid";
                        if (paid <= 0.01) return "Unpaid";
                        return "Partial";
                      })()}
                    />
                  </TableCell>
                  <TableCell className="py-3 pr-4">
                    <div className="flex justify-end items-center gap-1">
                      {(() => {
                        const subtotal = b.items.reduce((sum, i) => sum + (i.total ?? 0), 0);
                        const total = subtotal - (b.discount || 0);
                        const paid = (b.cash ?? 0) + (b.card ?? 0) + (b.upi ?? 0);
                        const due = total - paid;

                        return (
                          <>
                            {due > 0 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedMarkAsPaidBill(b);
                                      setMarkAsPaidModalOpen(true);
                                    }}
                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Mark as Paid</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </>
                        );
                      })()}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrint(b)}
                            className="h-8 w-8 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Print Bill</p>
                        </TooltipContent>
                      </Tooltip>
                      {(b as any).status !== 'Completed' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedBill(b);
                                setPaymentModelOpen(true);
                              }}
                              className="h-8 w-8 text-(--color-synapse-light) hover:text-(--color-synapse-light) hover:bg-synapse-light/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Bill</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8 text-(--color-synapse-light) hover:text-(--color-synapse-light) hover:bg-blue-50"
                          >
                            <Link href={`/dashboard/lab/billing/single?id=${b._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Bill</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {billing.length > 0 && (() => {
            const totalCash = billing.reduce((acc, b) => acc + (b.cash ?? 0), 0);
            const totalUpi = billing.reduce((acc, b) => acc + (b.upi ?? 0), 0);
            const totalCard = billing.reduce((acc, b) => acc + (b.card ?? 0), 0);
            const totalPaid = totalCash + totalUpi + totalCard;
            const totalAmount = billing.reduce((acc, b) => acc + b.items.reduce((a, i) => a + (i.total ?? 0), 0), 0);
            const totalDiscount = billing.reduce((acc, b) => acc + (b.discount || 0), 0);
            const totalDue = billing.reduce((acc, b) =>
              acc + Math.max(0, b.items.reduce((a, i) => a + (i.total ?? 0), 0) - (b.discount || 0) - ((b.cash ?? 0) + (b.card ?? 0) + (b.upi ?? 0))), 0);

            return (
              <TableFooter className="sticky bottom-0 z-10 bg-emerald-50/95 font-extrabold text-[15px] text-slate-900 border-t-2 border-slate-300 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] backdrop-blur-xs">
                <TableRow className="hover:bg-emerald-50/95 bg-emerald-50/95">
                  <TableCell colSpan={5} className="py-3 px-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300/80 text-xs font-bold shadow-xs">
                          <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-extrabold">Cash:</span>
                          <span className="tabular-nums font-black">{formatINR(totalCash)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-100 text-violet-800 border border-violet-300/80 text-xs font-bold shadow-xs">
                          <span className="text-[10px] uppercase tracking-wider text-violet-700 font-extrabold">UPI:</span>
                          <span className="tabular-nums font-black">{formatINR(totalUpi)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 border border-teal-300/80 text-xs font-bold shadow-xs">
                          <span className="text-[10px] uppercase tracking-wider text-teal-700 font-extrabold">Card:</span>
                          <span className="tabular-nums font-black">{formatINR(totalCard)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-300/80 text-xs font-bold shadow-xs">
                          <span className="text-[10px] uppercase tracking-wider text-amber-700 font-extrabold">Discount:</span>
                          <span className="tabular-nums font-black">{formatINR(totalDiscount)}</span>
                        </span>
                      </div>
                      <span className="uppercase tracking-wider text-sm font-black text-slate-800 shrink-0">
                        Total
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums">
                    {formatINR(totalAmount)}
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums">
                    {formatINR(totalDiscount)}
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums">
                    <div className="flex flex-col items-end">
                      <span className="text-emerald-700 font-black text-[15px]">{formatINR(totalPaid)}</span>

                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums text-rose-700 font-black">
                    {formatINR(totalDue)}
                  </TableCell>
                  <TableCell colSpan={3} />
                </TableRow>
              </TableFooter>
            );
          })()}
        </Table>
      </div>

      <div className="px-4 py-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm rounded-xl">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-medium text-slate-900">{Math.min(10, billing.length)}</span> of{" "}
            <span className="font-medium text-slate-900">{billing.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-white"
              disabled
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-white"
              disabled
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      <AddPaymentDialog
        open={paymentModelOpen}
        setOpen={setPaymentModelOpen}
        bill={selectedBill}
        billingMutate={billingMutate}
      />
      <MarkAsPaidModal
        open={markAsPaidModalOpen}
        onOpenChange={setMarkAsPaidModalOpen}
        bill={selectedMarkAsPaidBill}
        onSuccess={billingMutate}
      />
      <LabBillReceipt bill={printBill} />
    </div>
  );
}

const MethodPill: React.FC<{ m: BillRow["method"]; label?: string }> = ({ m, label }) => {
  const map: Record<BillRow["method"], string> = {
    cash: "bg-emerald-50 text-emerald-700 border-emerald-200",
    card: "bg-teal-50 text-teal-700 border-teal-200",
    upi: "bg-violet-50 text-violet-700 border-violet-200",
    mixed: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize shadow-2xs ${map[m]}`}
    >
      {label || m}
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
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}
    >
      {s}
    </span>
  );
};
