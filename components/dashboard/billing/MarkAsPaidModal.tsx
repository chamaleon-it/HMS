"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Banknote,
  Smartphone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Receipt,
  User,
  BadgePercent,
  RotateCcw,
} from "lucide-react";
import { formatINR, getDecimal } from "@/lib/fNumber";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

export interface MarkAsPaidBill {
  _id: string;
  mrn: string;
  patient?: {
    name: string;
    mrn?: string;
  };
  items?: {
    name?: string;
    total?: number;
    quantity?: number;
    unitPrice?: number;
    gst?: number;
    discount?: number;
  }[];
  cash?: number;
  card?: number;
  upi?: number;
  discount?: number;
  roundOff?: boolean;
}

interface MarkAsPaidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: MarkAsPaidBill | null;
  onSuccess?: () => void;
}

export default function MarkAsPaidModal({
  open,
  onOpenChange,
  bill,
  onSuccess,
}: MarkAsPaidModalProps) {
  const [payments, setPayments] = useState<{
    cash: string;
    upi: string;
    card: string;
    discount: string;
  }>({
    cash: "",
    upi: "",
    card: "",
    discount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute bill financials
  const itemsTotal = (bill?.items || []).reduce(
    (sum, i) => sum + (i.total ?? 0),
    0
  );
  const roundOffAmount = bill?.roundOff ? getDecimal(itemsTotal) : 0;
  const existingDiscount = bill?.discount ?? 0;
  const totalAmount = Math.max(0, itemsTotal - roundOffAmount - existingDiscount);
  const previouslyPaid =
    (bill?.cash ?? 0) + (bill?.card ?? 0) + (bill?.upi ?? 0);
  const dueAmount = Math.max(0, totalAmount - previouslyPaid);

  // Initialize amount whenever modal opens or bill changes
  useEffect(() => {
    if (open && bill) {
      const defaultDue = dueAmount > 0 ? dueAmount : totalAmount;
      setPayments({
        cash: defaultDue > 0 ? defaultDue.toString() : "",
        upi: "",
        card: "",
        discount: "",
      });
    }
  }, [open, bill, dueAmount, totalAmount]);

  if (!bill) return null;

  const numCash = parseFloat(payments.cash) || 0;
  const numUpi = parseFloat(payments.upi) || 0;
  const numCard = parseFloat(payments.card) || 0;
  const numDiscount = parseFloat(payments.discount) || 0;

  const totalPayingNow = numCash + numUpi + numCard;
  const totalSettlingNow = totalPayingNow + numDiscount;

  // Max allowed is the total bill amount
  const isOverMax = totalSettlingNow > totalAmount + 0.001 || (previouslyPaid + totalSettlingNow > totalAmount + 0.001);
  const isInvalidAmount = totalSettlingNow <= 0 || isOverMax;

  const handleFieldChange = (
    field: "cash" | "upi" | "card" | "discount",
    value: string
  ) => {
    setPayments((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePreset = (method: "cash" | "upi" | "card") => {
    const targetAmount = dueAmount > 0 ? dueAmount : totalAmount;
    setPayments({
      cash: method === "cash" ? targetAmount.toString() : "",
      upi: method === "upi" ? targetAmount.toString() : "",
      card: method === "card" ? targetAmount.toString() : "",
      discount: "",
    });
  };

  const handleClearAll = () => {
    setPayments({
      cash: "",
      upi: "",
      card: "",
      discount: "",
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (totalSettlingNow <= 0) {
      toast.error("Please enter a payment amount");
      return;
    }

    if (isOverMax) {
      toast.error(`Total amount cannot exceed total bill amount of ${formatINR(totalAmount)}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await api.patch(`/billing/mark_as_paid/${bill._id}`, {
        cash: numCash,
        upi: numUpi,
        card: numCard,
        discount: numDiscount,
      });

      toast.success("Payment recorded successfully");
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(
        `Failed to mark as paid: ${error.response?.data?.message || error.message || "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentFields = [
    {
      key: "cash" as const,
      label: "Cash",
      icon: Banknote,
      cardBg: "bg-emerald-50/70 border-emerald-200 text-emerald-900",
      inputFocus: "focus:border-emerald-500 focus:ring-emerald-100",
      iconColor: "text-emerald-700 bg-emerald-100",
    },
    {
      key: "upi" as const,
      label: "UPI",
      icon: Smartphone,
      cardBg: "bg-violet-50/70 border-violet-200 text-violet-900",
      inputFocus: "focus:border-violet-500 focus:ring-violet-100",
      iconColor: "text-violet-700 bg-violet-100",
    },
    {
      key: "card" as const,
      label: "Card",
      icon: CreditCard,
      cardBg: "bg-teal-50/70 border-teal-200 text-teal-900",
      inputFocus: "focus:border-teal-500 focus:ring-teal-100",
      iconColor: "text-teal-700 bg-teal-100",
    },
    {
      key: "discount" as const,
      label: "Discount",
      icon: BadgePercent,
      cardBg: "bg-amber-50/70 border-amber-200 text-amber-900",
      inputFocus: "focus:border-amber-500 focus:ring-amber-100",
      iconColor: "text-amber-700 bg-amber-100",
    },
  ];

  const remainingDueAfter = Math.max(0, dueAmount - totalSettlingNow);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-bold text-slate-900">
                Mark as Paid
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                  <Receipt className="h-3.5 w-3.5 text-slate-400" />
                  {bill.mrn}
                </span>
                {bill.patient?.name && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {bill.patient.name}
                    </span>
                  </>
                )}
              </DialogDescription>
            </div>
          </div>

          {/* Financial summary overview */}
          <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Total Bill
              </p>
              <p className="text-sm font-bold text-slate-900 tabular-nums mt-0.5">
                {formatINR(totalAmount)}
              </p>
            </div>
            <div className="text-center border-x border-slate-100">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                Already Paid
              </p>
              <p className="text-sm font-bold text-emerald-600 tabular-nums mt-0.5">
                {formatINR(previouslyPaid)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                Due Amount
              </p>
              <p className="text-sm font-bold text-rose-600 tabular-nums mt-0.5">
                {formatINR(dueAmount)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Quick preset chips */}
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Payment Breakdown
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handlePreset("cash")}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
              >
                All Cash
              </button>
              <button
                type="button"
                onClick={() => handlePreset("upi")}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 transition-colors cursor-pointer"
              >
                All UPI
              </button>
              <button
                type="button"
                onClick={() => handlePreset("card")}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors cursor-pointer"
              >
                All Card
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer flex items-center gap-1"
                title="Reset all fields"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                Clear
              </button>
            </div>
          </div>

          {/* Split payment 2x2 grid */}
          <div className="grid grid-cols-2 gap-3">
            {paymentFields.map(({ key, label, icon: Icon, cardBg, inputFocus, iconColor }) => {
              const val = payments[key];
              const isFilled = parseFloat(val) > 0;
              return (
                <div
                  key={key}
                  className={cn(
                    "rounded-xl border p-3 transition-all",
                    cardBg,
                    isFilled ? "ring-2 ring-slate-400/20 shadow-xs" : "opacity-95"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <div className={cn("h-6 w-6 rounded-md flex items-center justify-center", iconColor)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span>{label}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max={totalAmount}
                      value={val}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      placeholder="0"
                      className={cn(
                        "block w-full pl-6 pr-2 py-1.5 text-sm font-bold text-right rounded-lg border border-slate-200/90 bg-white text-slate-900 outline-none transition-all tabular-nums",
                        inputFocus
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Max validation warning */}
          {isOverMax && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Total entered ({formatINR(totalSettlingNow)}) cannot exceed total bill amount of {formatINR(totalAmount)}.
              </span>
            </div>
          )}

          {/* Live Calculation Breakdown */}
          {totalSettlingNow > 0 && !isOverMax && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Paying Now (Total)</span>
                <span className="font-bold text-emerald-600 tabular-nums">
                  +{formatINR(totalPayingNow)}
                </span>
              </div>
              {numDiscount > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Additional Discount</span>
                  <span className="font-bold tabular-nums">
                    +{formatINR(numDiscount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>New Total Settled</span>
                <span className="font-medium tabular-nums">
                  {formatINR(previouslyPaid + totalSettlingNow)}
                </span>
              </div>
              <div className="h-px bg-slate-200 my-1" />
              <div className="flex justify-between font-bold text-slate-800">
                <span>Remaining Due</span>
                <span
                  className={cn(
                    "tabular-nums",
                    remainingDueAfter <= 0.01
                      ? "text-emerald-600 font-extrabold"
                      : "text-rose-600 font-bold"
                  )}
                >
                  {remainingDueAfter <= 0.01
                    ? "₹0 (Fully Settled ✓)"
                    : formatINR(remainingDueAfter)}
                </span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-xl font-semibold border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isInvalidAmount || isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recording Payment...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Payment ({formatINR(totalPayingNow)})
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
