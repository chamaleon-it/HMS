"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import LabHeader from "@/components/dashboard/lab/LabHeader";
import useSWR from "swr";
import { formatINR, getDecimal } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";
import DateFilter from "../../pharmacy/DateFilter";
import { TableSkeleton } from "../../pharmacy/components/PharmacySkeleton";
import { endOfDay, startOfDay, subDays } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { CheckCircle2, CreditCard, RefreshCcw, RotateCcw, Search, Smartphone, Wallet, BadgePercent, X } from "lucide-react";
import { PaginationBar } from "../../pharmacy/components/PaginationBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export interface FilterType {
  q: null | string;
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
  date: Date;
  page: number;
  limit: number;
}

export default function LabRegisterPage() {
  const [paymentBillId, setPaymentBillId] = useState<string | null>(null);
  const [payment, setPayment] = useState({ cash: "", online: "", card: "", discount: "", refund: "" });
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [filter, setFilter] = useState<FilterType>({
    q: null,
    activeDate: "Today",
    date: new Date(),
    page: 1,
    limit: 10,
  });

  const params = new URLSearchParams();

  if (filter.q) {
    params.set("q", filter.q);
  }

  let sd: Date = startOfDay(new Date());
  let ed: Date = endOfDay(new Date());

  if (filter.activeDate === "Today") {
    sd = startOfDay(new Date());
  } else if (filter.activeDate === "7 days") {
    sd = startOfDay(subDays(new Date(), 7));
  } else if (filter.activeDate === "30 days") {
    sd = startOfDay(subDays(new Date(), 30));
  } else if (filter.activeDate === "Custom" && filter.date) {
    sd = startOfDay(filter.date);
    ed = endOfDay(filter.date);
  }

  params.set("startDate", sd.toISOString());
  params.set("endDate", ed.toISOString());
  params.set("activeDate", filter.activeDate);
  params.set("page", String(filter.page));
  params.set("limit", String(filter.limit));

  const { data: billingData, isLoading, mutate } = useSWR<{
    message: string;
    total: number;
    data: {
      _id: string;
      mrn: string;
      createdAt: Date;
      cash: number;
      online: number;
      card?: number;
      discount: number;
      refund?: number;
      items: {
        total: number;
        quantity: number;
        unitPrice: number;
      }[];
      patient: {
        name: string;
        mrn: string;
      };
      transactionType: "Return" | "Sale";
      doctor: any;
    }[];
  }>(`/billing?${params.toString()}`);

  const billing = billingData?.data ?? [];
  const totalItems = billingData?.total ?? 0;

  const openPayment = (bill: (typeof billing)[number]) => {
    setPaymentBillId(bill._id);
    setPayment({
      cash: bill.cash ? String(bill.cash) : "",
      online: bill.online ? String(bill.online) : "",
      card: bill.card ? String(bill.card) : "",
      discount: bill.discount ? String(bill.discount) : "",
      refund: bill.refund ? String(bill.refund) : "",
    });
  };

  const savePayment = async (billId: string) => {
    setIsSavingPayment(true);
    try {
      await api.patch(`/billing/add_payment/${billId}`, {
        cash: Number(payment.cash) || 0,
        online: Number(payment.online) || 0,
        card: Number(payment.card) || 0,
        discount: Number(payment.discount) || 0,
        refund: Number(payment.refund) || 0,
      });
      toast.success("Payment updated successfully");
      setPaymentBillId(null);
      await mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to update payment");
    } finally {
      setIsSavingPayment(false);
    }
  };

  const activeBill = billing.find((bill) => bill._id === paymentBillId);
  const billSubtotal = activeBill?.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const recordedPaid = (activeBill?.cash || 0) + (activeBill?.online || 0) + (activeBill?.card || 0);
  const recordedNetPaid = recordedPaid - (activeBill?.refund || 0);
  const enteredPaid = (Number(payment.cash) || 0) + (Number(payment.online) || 0) + (Number(payment.card) || 0);
  const enteredRefund = Number(payment.refund) || 0;
  const enteredNetPaid = enteredPaid - enteredRefund;
  const enteredDiscount = Number(payment.discount) || 0;
  const dueBeforeEdit = Math.max(0, billSubtotal - (activeBill?.discount || 0) - recordedNetPaid);
  const remainingDue = Math.max(0, billSubtotal - enteredDiscount - enteredNetPaid);

  const fillPaymentMethod = (field: "cash" | "online" | "card") => {
    const totalToPay = Math.max(0, billSubtotal - enteredDiscount + enteredRefund);
    setPayment({
      cash: field === "cash" ? String(totalToPay) : "0",
      online: field === "online" ? String(totalToPay) : "0",
      card: field === "card" ? String(totalToPay) : "0",
      discount: payment.discount,
      refund: payment.refund,
    });
  };

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-67px)] w-full p-5 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col mb-2 gap-4">
            <LabHeader
              title="Lab Register"
              subtitle="View all registers, customer details, and total amounts"
            />
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-end gap-6">
              {/* Search */}
              <div className="space-y-2 flex-1 min-w-[280px]">
                <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
                  Search
                </label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    value={filter.q ?? ""}
                    onChange={(e) =>
                      setFilter((prev) => ({ ...prev, q: e.target.value, page: 1 }))
                    }
                    placeholder="PID, patient name, phone, or invoice..."
                    className="pl-9 h-10 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div className="space-y-2 min-w-[180px]">
                <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
                  Date Filter
                </label>
                <div className="block">
                  <DateFilter
                    activeDate={filter.activeDate}
                    setActiveDate={(activeDate) => setFilter((prev) => ({ ...prev, activeDate, page: 1 }))}
                    date={filter.date}
                    setDate={(date) => setFilter((prev) => ({ ...prev, date, page: 1 }))}
                  />
                </div>
              </div>

              {/* Reset Button */}
              <div className="ml-auto">
                <Button
                  variant="outline"
                  className="h-10 px-7 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                  onClick={() => setFilter({ q: null, activeDate: "Today", date: new Date(), page: 1, limit: 10 })}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white/90 border rounded-2xl shadow-md shadow-slate-200 overflow-hidden">
            {isLoading ? (
              <TableSkeleton rows={10} columns={12} />
            ) : (
              <Table className="min-w-[1600px] text-sm" containerClassName="max-h-[calc(100vh-300px)] overflow-auto scrollbar-thin scrollbar-thumb-slate-200">
                <TableHeader className="bg-slate-700 sticky top-0 z-20 shadow-sm">
                  <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                    <TableHead className="py-3 text-left pl-4 text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Sl No</TableHead>
                    <TableHead className="py-3 text-left text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Invoice</TableHead>
                    <TableHead className="py-3 text-left text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Date</TableHead>
                    <TableHead className="py-3 text-left text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Patient</TableHead>
                    <TableHead className="py-3 text-right text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Paid Amount</TableHead>
                    <TableHead className="py-3 text-left text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Payment</TableHead>
                    <TableHead className="py-3 text-right pr-4 text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Total Bill</TableHead>
                    <TableHead className="py-3 text-right pr-4 text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Discount</TableHead>
                    <TableHead className="py-3 text-right pr-4 text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Refund</TableHead>
                    <TableHead className="py-3 text-right pr-4 text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Due</TableHead>
                    <TableHead className="py-3 text-center text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Payment Status</TableHead>
                    <TableHead className="py-3 text-center pr-4 text-white font-bold text-[11px] uppercase tracking-wider bg-slate-700">Action</TableHead>
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
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No registers found</p>
                          <p className="text-xs text-slate-400">Try selecting a different date</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    (filter.activeDate === "Today" || filter.activeDate === "Custom"
                      ? billing
                      : billing.slice((filter.page - 1) * filter.limit, filter.page * filter.limit)
                    ).map((b, idx) => (
                      <React.Fragment key={b._id}>
                      {(() => {
                        const billTotal = b.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
                        const cardAmount = b.card ?? 0;
                        const paidTotal = (b.cash || 0) + (b.online || 0) + cardAmount;
                        const netPaid = paidTotal - (b.refund || 0);
                        const due = Math.max(0, billTotal - (b.discount || 0) - netPaid);
                        const paymentStatus = due === 0 ? "Paid" : netPaid <= 0 ? "Unpaid" : "Partially Paid";
                        return (
                      <TableRow
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
                        </TableCell>
                        <TableCell className="py-3 text-slate-600 whitespace-nowrap">{fDateandTime(b.createdAt)}</TableCell>
                        <TableCell className="py-3">
                          <div className="font-medium truncate text-slate-900">{b.patient?.name || "Unknown"}</div>
                          <div className="text-[11px] text-slate-500">
                            {b.patient?.mrn || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right tabular-nums text-emerald-600 font-medium">
                          {formatINR(netPaid)}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {b.cash > 0 && <span className="whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">Cash: {formatINR(b.cash)}</span>}
                            {cardAmount > 0 && <span className="whitespace-nowrap rounded-full border border-teal-200 bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700">Card: {formatINR(cardAmount)}</span>}
                            {b.online > 0 && <span className="whitespace-nowrap rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">UPI: {formatINR(b.online)}</span>}
                            {(b.cash || 0) + cardAmount + (b.online || 0) === 0 && <span className="text-xs text-slate-400">—</span>}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right pr-4 tabular-nums font-medium text-slate-900">
                          {formatINR(billTotal)}
                        </TableCell>
                        <TableCell className="py-3 text-right pr-4 tabular-nums font-medium text-amber-700">
                          {formatINR(b.discount || 0)}
                        </TableCell>
                        <TableCell className="py-3 text-right pr-4 tabular-nums font-medium text-rose-600">
                          {formatINR(b.refund || 0)}
                        </TableCell>
                        <TableCell className="py-3 text-right pr-4 tabular-nums font-semibold text-rose-600">
                          {formatINR(due)}
                        </TableCell>
                        <TableCell className="py-3 text-center">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${paymentStatus === "Paid" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : paymentStatus === "Unpaid" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                            {paymentStatus}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-center pr-4">
                          <Button
                            type="button"
                            size="icon"
                            aria-label="Paid"
                            title="Paid"
                            variant="ghost"
                            className="h-8 w-8 rounded-md border border-transparent text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50"
                            onClick={() => paymentBillId === b._id ? setPaymentBillId(null) : openPayment(b)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                        );
                      })()}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
                {billing.length > 0 && (
                  <TableFooter className="sticky bottom-0 z-10 bg-emerald-50 font-extrabold text-[15px] text-slate-900 border-t-2 border-slate-300 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <TableRow className="hover:bg-emerald-50 bg-emerald-50">
                          <TableCell colSpan={4} className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">Cash: {formatINR(billing.reduce((sum, bill) => sum + (bill.cash || 0), 0))}</span>
                          <span className="whitespace-nowrap rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-bold uppercase text-violet-700">UPI: {formatINR(billing.reduce((sum, bill) => sum + (bill.online || 0), 0))}</span>
                          <span className="whitespace-nowrap rounded-full border border-teal-200 bg-teal-50 px-2 py-1 text-[10px] font-bold uppercase text-teal-700">Card: {formatINR(billing.reduce((sum, bill) => sum + (bill.card || 0), 0))}</span>
                          <span className="whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-700">Discount: {formatINR(billing.reduce((sum, bill) => sum + (bill.discount || 0), 0))}</span>
                          <span className="whitespace-nowrap rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-bold uppercase text-rose-700">Refund: {formatINR(billing.reduce((sum, bill) => sum + (bill.refund || 0), 0))}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right tabular-nums text-emerald-700 font-black">
                        {formatINR(billing.reduce((acc, b) => acc + (b.cash || 0) + (b.online || 0) + (b.card || 0) - (b.refund || 0), 0))}
                      </TableCell>
                      <TableCell />
                      <TableCell className="py-4 text-right pr-4 tabular-nums text-slate-900 font-black">
                        <span className="mr-2 text-xs font-black uppercase">Total</span>
                        {formatINR(billing.reduce((sum, bill) => sum + (bill.items?.reduce((itemsSum, item) => itemsSum + (item.total || 0), 0) || 0), 0))}
                      </TableCell>
                      <TableCell className="py-4 text-right pr-4 font-black text-amber-700">
                        {formatINR(billing.reduce((sum, bill) => sum + (bill.discount || 0), 0))}
                      </TableCell>
                      <TableCell className="py-4 text-right pr-4 font-black text-rose-600">
                        {formatINR(billing.reduce((sum, bill) => sum + (bill.refund || 0), 0))}
                      </TableCell>
                      <TableCell className="py-4 text-right pr-4 font-black text-rose-600">
                        {formatINR(billing.reduce((sum, bill) => {
                          const total = bill.items?.reduce((itemsSum, item) => itemsSum + (item.total || 0), 0) || 0;
                          const paid = (bill.cash || 0) + (bill.online || 0) + (bill.card || 0);
                          return sum + Math.max(0, total - (bill.discount || 0) - paid + (bill.refund || 0));
                        }, 0))}
                      </TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            )}
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
      </div>
      <Dialog open={Boolean(activeBill)} onOpenChange={(open) => { if (!open) setPaymentBillId(null); }}>
        <DialogContent className="max-w-[520px] gap-0 overflow-hidden rounded-2xl border-slate-200 bg-slate-50 p-0 shadow-2xl [&>button]:hidden">
          {activeBill && (
            <>
              <div className="relative border-b border-slate-100 bg-white px-6 pb-4 pt-6">
                <button type="button" aria-label="Close" onClick={() => setPaymentBillId(null)} className="absolute right-5 top-5 rounded p-1 text-slate-500 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm"><CheckCircle2 className="h-6 w-6" /></div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-slate-900">Mark as Paid</DialogTitle>
                    <p className="mt-0.5 flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span>▧ {activeBill.mrn}</span><span>·</span><span>♙ {activeBill.patient?.name || "Unknown"}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 divide-x rounded-2xl border border-slate-200 bg-white py-3 text-center shadow-sm">
                  <div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Total Bill</p><p className="mt-1 font-bold text-slate-900">{formatINR(billSubtotal)}</p></div>
                  <div><p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">Recorded So Far</p><p className="mt-1 font-bold text-emerald-700">{formatINR(recordedNetPaid)}</p></div>
                  <div><p className="text-[10px] font-semibold uppercase tracking-wide text-rose-500">Due Amount</p><p className="mt-1 font-bold text-rose-600">{formatINR(dueBeforeEdit)}</p></div>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Final Payment Breakdown</p>
                  <div className="flex gap-1.5">
                    <Button type="button" variant="outline" className="h-7 rounded-lg border-emerald-200 bg-emerald-50 px-2 text-[10px] text-emerald-700" onClick={() => fillPaymentMethod("cash")}>All Cash</Button>
                    <Button type="button" variant="outline" className="h-7 rounded-lg border-violet-200 bg-violet-50 px-2 text-[10px] text-violet-700" onClick={() => fillPaymentMethod("online")}>All UPI</Button>
                    <Button type="button" variant="outline" className="h-7 rounded-lg border-teal-200 bg-teal-50 px-2 text-[10px] text-teal-700" onClick={() => fillPaymentMethod("card")}>All Card</Button>
                    <Button type="button" variant="outline" className="h-7 rounded-lg border-slate-200 px-2 text-[10px] text-slate-500" onClick={() => setPayment({ cash: "0", online: "0", card: "0", discount: "0", refund: "0" })}><RotateCcw className="mr-1 h-3 w-3" />Clear</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {([
                    { label: "Cash", field: "cash", Icon: Wallet, tone: "emerald" },
                    { label: "UPI", field: "online", Icon: Smartphone, tone: "violet" },
                    { label: "Card", field: "card", Icon: CreditCard, tone: "teal" },
                    { label: "Discount", field: "discount", Icon: BadgePercent, tone: "amber" },
                    { label: "Refund", field: "refund", Icon: RotateCcw, tone: "rose" },
                  ] as const).map(({ label, field, Icon, tone }) => {
                    const colors = {
                      emerald: "border-emerald-200 bg-emerald-50/70 text-emerald-800",
                      violet: "border-violet-200 bg-violet-50/70 text-violet-800",
                      teal: "border-teal-200 bg-teal-50/70 text-teal-800",
                      amber: "border-amber-200 bg-amber-50/70 text-amber-800",
                      rose: "border-rose-200 bg-rose-50/70 text-rose-800",
                    }[tone];
                    return (
                      <label key={field} className={`rounded-2xl border p-3 ${colors}`}>
                        <span className="mb-2 flex items-center gap-2 text-xs font-bold"><Icon className="h-4 w-4" />{label}</span>
                        <span className="flex h-9 items-center rounded-xl border border-slate-200 bg-white px-2 text-slate-400">
                          <span className="text-xs">₹</span>
                          <Input type="number" min="0" step="0.01" value={payment[field]} onChange={(event) => setPayment((current) => ({ ...current, [field]: event.target.value }))} className="h-8 border-0 bg-transparent text-right font-semibold text-slate-800 shadow-none focus-visible:ring-0" placeholder="0" />
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] leading-4 text-slate-500">Enter the amounts collected and any refund given. These values replace what is recorded on the bill.</p>
                <div className="mt-4 space-y-1 rounded-2xl border border-slate-100 bg-white px-3 py-3 text-xs text-slate-600">
                  <div className="flex justify-between"><span>Total Paid (Cash + UPI + Card + Refund)</span><span className="font-semibold text-emerald-700">{formatINR(enteredNetPaid)}</span></div>
                  <div className="flex justify-between"><span>Change from recorded</span><span className={`font-semibold ${enteredNetPaid >= recordedNetPaid ? "text-emerald-700" : "text-rose-600"}`}>{enteredNetPaid >= recordedNetPaid ? "+" : "−"}{formatINR(Math.abs(enteredNetPaid - recordedNetPaid))}</span></div>
                  <div className="flex justify-between border-t border-slate-100 pt-1 font-bold text-slate-800"><span>Remaining Due</span><span className="text-emerald-700">{formatINR(remainingDue)}{remainingDue === 0 ? " (Fully Settled ✓)" : ""}</span></div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setPaymentBillId(null)}>Cancel</Button>
                <Button type="button" disabled={isSavingPayment} className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => savePayment(activeBill._id)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />{isSavingPayment ? "Saving…" : `Save Payment (${formatINR(enteredNetPaid)})`}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
