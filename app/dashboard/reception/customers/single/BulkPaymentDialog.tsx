"use client";

import {
  Banknote,
  Smartphone,
  CreditCard,
  BadgePercent,
  IndianRupee,
  Wallet2,
  Receipt,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatINR } from "@/lib/fNumber";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import api from "@/lib/axios";

interface DueBill {
  _id: string;
  mrn: string;
  cash?: number;
  card?: number;
  upi?: number;
  discount?: number;
  items: { total: number }[];
  roundOff?: boolean;
  createdAt: string;
}

interface BulkPaymentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  customerName: string;
  dueBills: DueBill[];
  billingMutate: () => void;
}

export default function BulkPaymentDialog({
  open,
  setOpen,
  customerName,
  dueBills,
  billingMutate,
}: BulkPaymentDialogProps) {
  const [payment, setPayment] = useState({
    cash: 0,
    card: 0,
    upi: 0,
    discount: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPayment({ cash: 0, card: 0, upi: 0, discount: 0 });
    }
  }, [open]);

  // Calculate total due across all due bills
  const totalCreditDue = dueBills.reduce((sum, bill) => {
    const itemsTotal = bill.items.reduce((a, b) => a + (b.total || 0), 0);
    const rOff = bill.roundOff ? itemsTotal % 1 : 0;
    const paid = (bill.cash || 0) + (bill.card || 0) + (bill.upi || 0);
    const netTotal = itemsTotal - rOff - (bill.discount || 0);
    return sum + Math.max(0, netTotal - paid);
  }, 0);

  const totalPaying =
    (payment.cash || 0) +
    (payment.card || 0) +
    (payment.upi || 0) +
    (payment.discount || 0);

  const remainingCreditDue = Math.max(0, totalCreditDue - totalPaying);

  const handleSubmit = async () => {
    if (totalPaying <= 0) {
      toast.error("Please enter a payment or discount amount");
      return;
    }

    try {
      setSubmitting(true);

      // Sort due bills chronologically (oldest bill first)
      const sortedBills = [...dueBills].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      let poolCash = payment.cash || 0;
      let poolCard = payment.card || 0;
      let poolUpi = payment.upi || 0;
      let poolDiscount = payment.discount || 0;

      for (const bill of sortedBills) {
        if (poolCash <= 0 && poolCard <= 0 && poolUpi <= 0 && poolDiscount <= 0) {
          break;
        }

        const itemsTotal = bill.items.reduce((a, b) => a + (b.total || 0), 0);
        const rOff = bill.roundOff ? itemsTotal % 1 : 0;
        const currentPaid = (bill.cash || 0) + (bill.card || 0) + (bill.upi || 0);
        const netTotal = itemsTotal - rOff - (bill.discount || 0);
        const billDue = Math.max(0, netTotal - currentPaid);

        if (billDue <= 0) continue;

        let needed = billDue;
        let addCash = 0;
        let addCard = 0;
        let addUpi = 0;
        let addDiscount = 0;

        // Allocate Cash
        if (needed > 0 && poolCash > 0) {
          addCash = Math.min(needed, poolCash);
          poolCash -= addCash;
          needed -= addCash;
        }

        // Allocate Card
        if (needed > 0 && poolCard > 0) {
          addCard = Math.min(needed, poolCard);
          poolCard -= addCard;
          needed -= addCard;
        }

        // Allocate UPI
        if (needed > 0 && poolUpi > 0) {
          addUpi = Math.min(needed, poolUpi);
          poolUpi -= addUpi;
          needed -= addUpi;
        }

        // Allocate Discount
        if (needed > 0 && poolDiscount > 0) {
          addDiscount = Math.min(needed, poolDiscount);
          poolDiscount -= addDiscount;
          needed -= addDiscount;
        }

        if (addCash > 0 || addCard > 0 || addUpi > 0 || addDiscount > 0) {
          const payload = {
            cash: (bill.cash || 0) + addCash,
            card: (bill.card || 0) + addCard,
            upi: (bill.upi || 0) + addUpi,
            discount: (bill.discount || 0) + addDiscount,
          };

          await api.patch(`/billing/add_payment/${bill._id}`, payload);
        }
      }

      toast.success("Payments updated successfully");
      await billingMutate();
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Wallet2 className="h-5 w-5 text-rose-600" />
            Update Customer Payment — {customerName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-6 mt-2">
          {/* Left Column: Inputs */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-slate-200 p-4 shadow-xs bg-white">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Payment Breakdown</span>
                <span className="text-xs text-slate-500">{dueBills.length} Due Bills</span>
              </div>
              <div className="grid grid-cols-12 gap-3">
                {[
                  {
                    key: "cash",
                    label: "Cash",
                    icon: Banknote,
                    tint: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  },
                  {
                    key: "card",
                    label: "Card",
                    icon: CreditCard,
                    tint: "bg-sky-50 text-sky-700 border-sky-200",
                  },
                  {
                    key: "upi",
                    label: "UPI",
                    icon: Smartphone,
                    tint: "bg-violet-50 text-violet-700 border-violet-200",
                  },
                  {
                    key: "discount",
                    label: "Discount",
                    icon: BadgePercent,
                    tint: "bg-amber-50 text-amber-700 border-amber-200",
                  },
                ].map(({ key, label, icon: Icon, tint }) => {
                  const val = payment[key as "cash" | "card" | "upi" | "discount"];
                  return (
                    <div key={key} className="col-span-12 md:col-span-6">
                      <div className={`rounded-xl border px-3 py-2.5 ${tint}`}>
                        <div className="mb-1 flex items-center gap-2 text-xs font-semibold">
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </div>
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4" />
                          <input
                            type="number"
                            min={0}
                            placeholder="0"
                            onFocus={(e) => (e.target.placeholder = "")}
                            onBlur={(e) => (e.target.placeholder = "0")}
                            value={!val ? "" : String(val)}
                            onChange={(e) =>
                              setPayment((prev) => ({
                                ...prev,
                                [key as "cash" | "card" | "upi" | "discount"]: Number(
                                  e.target.value
                                ),
                              }))
                            }
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white/80 px-3 text-sm outline-none focus:border-slate-400 text-right font-bold text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Invoice & Due Summary */}
          <div className="col-span-12 lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 p-4 shadow-xs bg-slate-50 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Receipt className="h-4 w-4 text-slate-600" />
                Customer Due Summary
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Credit Due</span>
                  <span className="font-bold text-rose-600 text-base">
                    {formatINR(totalCreditDue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Paying Now</span>
                  <span className="font-bold text-emerald-600">
                    {formatINR(totalPaying)}
                  </span>
                </div>
                <div className="my-2 h-px bg-slate-200" />
                <div className="flex items-center justify-between text-base font-extrabold text-slate-900">
                  <span>Remaining Due</span>
                  <span className="text-rose-700">{formatINR(remainingCreditDue)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 rounded-xl shadow-xs cursor-pointer"
                  disabled={submitting || totalPaying <= 0}
                  onClick={handleSubmit}
                >
                  {submitting ? "Updating Payments..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
