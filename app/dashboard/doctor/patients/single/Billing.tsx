import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { formatINR, getDecimal } from "@/lib/fNumber";
import { fDate, fDateandTime } from "@/lib/fDateAndTime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Banknote,
  CreditCard,
  Eye,
  FileSpreadsheet,
  Receipt,
  Search,
  Smartphone,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

export interface BillItem {
  _id?: string;
  name?: string;
  item?: string;
  quantity?: number;
  unitPrice?: number;
  price?: number;
  gst?: number;
  discount?: number;
  total?: number;
}

export interface SingleBill {
  _id: string;
  mrn: string;
  user?: any;
  patient?: any;
  doctor?: any;
  items: BillItem[];
  roundOff?: boolean;
  cash?: number;
  card?: number;
  upi?: number;
  discount?: number;
  status?: string;
  paymentStatus?: string;
  transactionType?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export default function Billing() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id");

  const { data: billingResponse, isLoading } = useSWR<{
    data: SingleBill[];
    message: string;
  }>(patientId ? `/billing/single?q=${patientId}` : null);

  const bills = billingResponse?.data || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedBill, setSelectedBill] = useState<SingleBill | null>(null);

  // Financial Computations
  let totalBilled = 0;
  let totalPaid = 0;

  bills.forEach((b) => {
    const itemsTotal = (b.items || []).reduce(
      (acc, it) => acc + (it.total ?? (it.quantity ?? 1) * (it.unitPrice ?? it.price ?? 0)),
      0
    );
    const rOff = b.roundOff ? getDecimal(itemsTotal) : 0;
    const paid = (b.cash || 0) + (b.card || 0) + (b.upi || 0);

    if (b.transactionType === "Return" || b.transactionType === "Refund") {
      totalBilled -= itemsTotal;
      totalPaid -= paid;
    } else {
      totalBilled += itemsTotal - rOff - (b.discount || 0);
      totalPaid += paid;
    }
  });

  const totalDue = Math.max(0, totalBilled - totalPaid);

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      !searchQuery.trim() ||
      bill.mrn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.items?.some((i) =>
        (i.name || i.item || "").toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      (typeof bill.doctor === "object"
        ? bill.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        : false);

    if (!matchesSearch) return false;

    if (statusFilter === "Paid") {
      const itemsTotal = (bill.items || []).reduce(
        (acc, it) => acc + (it.total ?? (it.quantity ?? 1) * (it.unitPrice ?? it.price ?? 0)),
        0
      );
      const paid = (bill.cash || 0) + (bill.card || 0) + (bill.upi || 0) + (bill.discount || 0);
      return paid >= itemsTotal || bill.status === "Completed" || bill.paymentStatus === "Paid";
    }

    if (statusFilter === "Pending") {
      const itemsTotal = (bill.items || []).reduce(
        (acc, it) => acc + (it.total ?? (it.quantity ?? 1) * (it.unitPrice ?? it.price ?? 0)),
        0
      );
      const paid = (bill.cash || 0) + (bill.card || 0) + (bill.upi || 0) + (bill.discount || 0);
      return paid < itemsTotal && bill.status !== "Completed";
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border p-3.5 bg-linear-to-br from-indigo-50 to-indigo-100/50 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-(--color-synapse-light) uppercase tracking-wider">
            Total Billed
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatINR(totalBilled)}
          </div>
          <span className="text-[11px] text-slate-500">Gross patient spend</span>
        </div>

        <div className="rounded-xl border p-3.5 bg-linear-to-br from-emerald-50 to-emerald-100/50 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Total Paid
          </span>
          <div className="text-2xl font-bold text-emerald-900 mt-1">
            {formatINR(totalPaid)}
          </div>
          <span className="text-[11px] text-emerald-600">Settled receipts</span>
        </div>

        <div className="rounded-xl border p-3.5 bg-linear-to-br from-rose-50 to-rose-100/50 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
            Balance Due
          </span>
          <div className="text-2xl font-bold text-rose-900 mt-1">
            {formatINR(totalDue)}
          </div>
          <span className="text-[11px] text-rose-600">
            {totalDue > 0 ? "Pending collection" : "All cleared"}
          </span>
        </div>

        <div className="rounded-xl border p-3.5 bg-linear-to-br from-sky-50 to-sky-100/50 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">
            Total Invoices
          </span>
          <div className="text-2xl font-bold text-sky-900 mt-1">
            {bills.length}
          </div>
          <span className="text-[11px] text-sky-600">Generated bills</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 border rounded-xl shadow-2xs">
        <div className="relative flex-1 min-w-55 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Bill No, item, or doctor..."
            className="pl-9 h-9 text-xs rounded-lg border-slate-200"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
          {["All", "Paid", "Pending"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === filter
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Bills Table */}
      <div className="rounded-xl border bg-white overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-900 hover:bg-slate-900">
              <TableHead className="text-white text-xs font-semibold">Bill No</TableHead>
              <TableHead className="text-white text-xs font-semibold">Date & Time</TableHead>
              <TableHead className="text-white text-xs font-semibold">Doctor / Prescriber</TableHead>
              <TableHead className="text-white text-xs font-semibold">Services & Items</TableHead>
              <TableHead className="text-white text-xs font-semibold">Payment Mode</TableHead>
              <TableHead className="text-white text-xs font-semibold">Status</TableHead>
              <TableHead className="text-white text-xs font-semibold text-right">Amount</TableHead>
              <TableHead className="text-white text-xs font-semibold text-right pr-4">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredBills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
                    <Receipt className="h-8 w-8 text-slate-300 stroke-[1.5] mb-1" />
                    <p className="font-semibold text-sm text-slate-700">No billing records found</p>
                    <p className="text-xs text-slate-400">
                      {searchQuery
                        ? "Try clearing your search query"
                        : "No bills or invoices have been created for this patient"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBills.map((bill) => {
                const itemsTotal = (bill.items || []).reduce(
                  (acc, it) => acc + (it.total ?? (it.quantity ?? 1) * (it.unitPrice ?? it.price ?? 0)),
                  0
                );
                const rOff = bill.roundOff ? getDecimal(itemsTotal) : 0;
                const netTotal = itemsTotal - rOff - (bill.discount || 0);
                const paidAmount = (bill.cash || 0) + (bill.card || 0) + (bill.upi || 0);
                const isFullyPaid =
                  paidAmount >= netTotal ||
                  bill.status === "Completed" ||
                  bill.paymentStatus === "Paid";

                const doctorName =
                  typeof bill.doctor === "object" && bill.doctor?.name
                    ? `Dr. ${bill.doctor.name.replace(/^dr\.\s*/i, "")}`
                    : typeof bill.doctor === "string" && bill.doctor !== "Self"
                    ? bill.doctor
                    : "General / OP";

                return (
                  <TableRow key={bill._id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-bold text-xs text-slate-900">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-mono">
                        {bill.mrn || bill._id.slice(-6).toUpperCase()}
                      </span>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-slate-900">
                          {fDate(bill.createdAt)}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {fDateandTime(bill.createdAt).split(" ")[1] || ""}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-slate-800">
                        {doctorName}
                      </span>
                    </TableCell>

                    <TableCell className="max-w-48">
                      <div className="flex flex-wrap gap-1">
                        {bill.items?.slice(0, 2).map((item, i) => (
                          <span
                            key={i}
                            className="inline-block text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md truncate max-w-36"
                            title={item.name || item.item}
                          >
                            {item.name || item.item}
                          </span>
                        ))}
                        {bill.items && bill.items.length > 2 && (
                          <span className="text-[10px] text-slate-500 font-semibold self-center">
                            +{bill.items.length - 2} more
                          </span>
                        )}
                        {(!bill.items || bill.items.length === 0) && (
                          <span className="text-xs text-slate-400">General Billing</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        {(bill.cash ?? 0) > 0 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                            <Banknote className="h-3 w-3" /> Cash
                          </Badge>
                        )}
                        {(bill.upi ?? 0) > 0 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-sky-50 text-sky-700 border-sky-200 gap-1">
                            <Smartphone className="h-3 w-3" /> UPI
                          </Badge>
                        )}
                        {(bill.card ?? 0) > 0 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-200 gap-1">
                            <CreditCard className="h-3 w-3" /> Card
                          </Badge>
                        )}
                        {paidAmount === 0 && (
                          <span className="text-xs text-slate-400">Unpaid</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {isFullyPaid ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 text-[11px] font-semibold gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </Badge>
                      ) : paidAmount > 0 ? (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 text-[11px] font-semibold gap-1">
                          <Clock className="h-3 w-3" /> Partial
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200 text-[11px] font-semibold gap-1">
                          <AlertCircle className="h-3 w-3" /> Pending
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-xs text-slate-900">
                          {formatINR(netTotal)}
                        </span>
                        {paidAmount < netTotal && (
                          <span className="text-[10px] text-rose-600 font-medium">
                            Due: {formatINR(netTotal - paidAmount)}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right pr-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedBill(bill)}
                        className="h-7 px-2.5 text-xs font-semibold rounded-lg hover:bg-slate-100"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Itemized Bill View Dialog */}
      <Dialog open={Boolean(selectedBill)} onOpenChange={(open) => !open && setSelectedBill(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-slate-700" />
                <span>Invoice #{selectedBill?.mrn}</span>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {selectedBill?.createdAt ? fDate(selectedBill.createdAt) : ""}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedBill && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs border">
                <div>
                  <span className="text-slate-500 block">Doctor / Attendant</span>
                  <span className="font-semibold text-slate-900">
                    {typeof selectedBill.doctor === "object" && selectedBill.doctor?.name
                      ? `Dr. ${selectedBill.doctor.name}`
                      : "General / Hospital"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Transaction Type</span>
                  <span className="font-semibold text-slate-900">
                    {selectedBill.transactionType || "Sale"}
                  </span>
                </div>
              </div>

              {/* Line Items */}
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100">
                      <TableHead className="text-xs font-semibold">Item / Service</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Qty</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Price</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBill.items?.map((it, idx) => {
                      const itemPrice = it.unitPrice ?? it.price ?? 0;
                      const itemQty = it.quantity ?? 1;
                      const lineTotal = it.total ?? itemPrice * itemQty;
                      return (
                        <TableRow key={idx}>
                          <TableCell className="text-xs font-medium text-slate-900">
                            {it.name || it.item || `Item #${idx + 1}`}
                          </TableCell>
                          <TableCell className="text-xs text-center text-slate-600">
                            {itemQty}
                          </TableCell>
                          <TableCell className="text-xs text-right text-slate-600">
                            {formatINR(itemPrice)}
                          </TableCell>
                          <TableCell className="text-xs text-right font-semibold text-slate-900">
                            {formatINR(lineTotal)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Payment Breakdown */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs border">
                {(() => {
                  const itemsSum = (selectedBill.items || []).reduce(
                    (acc, it) => acc + (it.total ?? (it.quantity ?? 1) * (it.unitPrice ?? it.price ?? 0)),
                    0
                  );
                  const discount = selectedBill.discount || 0;
                  const roundOff = selectedBill.roundOff ? getDecimal(itemsSum) : 0;
                  const grandTotal = itemsSum - roundOff - discount;
                  const cash = selectedBill.cash || 0;
                  const card = selectedBill.card || 0;
                  const upi = selectedBill.upi || 0;
                  const totalPaidAmount = cash + card + upi;
                  const due = Math.max(0, grandTotal - totalPaidAmount);

                  return (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>Items Subtotal:</span>
                        <span>{formatINR(itemsSum)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount:</span>
                          <span>- {formatINR(discount)}</span>
                        </div>
                      )}
                      {roundOff > 0 && (
                        <div className="flex justify-between text-slate-500">
                          <span>Round Off:</span>
                          <span>- {formatINR(roundOff)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t">
                        <span>Net Total:</span>
                        <span>{formatINR(grandTotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700 pt-1">
                        <span>Paid (Cash: {formatINR(cash)}, UPI: {formatINR(upi)}, Card: {formatINR(card)}):</span>
                        <span className="font-semibold text-emerald-700">{formatINR(totalPaidAmount)}</span>
                      </div>
                      {due > 0 && (
                        <div className="flex justify-between font-bold text-rose-700 pt-1">
                          <span>Balance Due:</span>
                          <span>{formatINR(due)}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
