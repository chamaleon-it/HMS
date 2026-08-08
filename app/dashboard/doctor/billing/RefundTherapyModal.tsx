"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/fNumber";
import { RotateCcw, AlertCircle, CheckCircle2, IndianRupee, Sparkles, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/axios";

export interface BillingItemType {
  name: string;
  quantity: number;
  unitPrice: number;
  gst: number;
  discount: number;
  total: number;
}

export interface BillType {
  _id: string;
  mrn: string;
  createdAt: Date;
  cash: number;
  card: number;
  upi: number;
  roundOff: boolean;
  transactionType?: "Sale" | "Return" | "Refund";
  patient: {
    _id?: string;
    name: string;
    mrn: string;
  };
  doctor?: string;
  items: BillingItemType[];
}

interface RefundTherapyModalProps {
  bill: BillType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function RefundTherapyModal({
  bill,
  open,
  onOpenChange,
  onSuccess,
}: RefundTherapyModalProps) {
  const [selectedItemIndexes, setSelectedItemIndexes] = useState<number[]>([]);
  const [refundMethod, setRefundMethod] = useState<"Cash" | "Card" | "UPI">("Cash");
  const [refundReason, setRefundReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize all items selected by default when bill opens
  React.useEffect(() => {
    if (bill && bill.items) {
      setSelectedItemIndexes(bill.items.map((_, idx) => idx));
      setRefundReason("");
    }
  }, [bill]);

  const items = bill?.items || [];

  const toggleItem = (idx: number) => {
    setSelectedItemIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const selectedItems = useMemo(() => {
    return selectedItemIndexes.map((idx) => items[idx]).filter(Boolean);
  }, [items, selectedItemIndexes]);

  const refundTotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (item.total || 0), 0);
  }, [selectedItems]);

  const handleProcessRefund = async () => {
    if (!bill) return;
    if (selectedItems.length === 0) {
      toast.error("Please select at least one therapy package to refund.");
      return;
    }

    try {
      setIsSubmitting(true);

      const refundItems = selectedItems.map((it) => ({
        name: it.name.toLowerCase().includes("refund") ? it.name : `Refund - ${it.name}`,
        quantity: it.quantity || 1,
        unitPrice: it.unitPrice || it.total,
        gst: it.gst || 0,
        discount: it.discount || 0,
        total: it.total,
      }));

      const payload = {
        patient: bill.patient._id || bill.patient.mrn,
        doctor: bill.doctor || "Self",
        items: refundItems,
        cash: refundMethod === "Cash" ? refundTotal : 0,
        card: refundMethod === "Card" ? refundTotal : 0,
        upi: refundMethod === "UPI" ? refundTotal : 0,
        transactionType: "Refund",
        note: `Therapy Package Refund for Invoice ${bill.mrn}${refundReason ? `: ${refundReason}` : ""}`,
      };

      await toast.promise(api.post("/billing", payload), {
        loading: "Processing therapy package refund...",
        success: "Therapy refund processed successfully!",
        error: ({ response }) => response?.data?.message || "Failed to process refund",
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Refund error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Refund Therapy Package
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Invoice #{bill.mrn} • Patient: <span className="font-semibold text-slate-700 dark:text-slate-300">{bill.patient.name}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Therapy Package Selection Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {items.length > 1
                  ? "Select which therapy package(s) to refund:"
                  : "Therapy Items in Package:"}
              </Label>
              <span className="text-xs font-semibold text-rose-600">
                {selectedItemIndexes.length} of {items.length} selected
              </span>
            </div>

            {items.length > 1 && (
              <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Multiple therapy packages detected. Uncheck any therapy that should not be refunded.</span>
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const isChecked = selectedItemIndexes.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleItem(idx)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? "bg-rose-50/60 border-rose-200 text-slate-900 dark:bg-rose-950/20 dark:border-rose-900"
                        : "bg-slate-50/50 border-slate-200 text-slate-400 opacity-60 dark:bg-slate-800/40 dark:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleItem(idx)}
                        className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                      />
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Qty: {item.quantity || 1} • Unit: {formatINR(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                        {formatINR(item.total)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Refund Payment Method */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Refund Method</Label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {(["Cash", "Card", "UPI"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setRefundMethod(m)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      refundMethod === m
                        ? "bg-rose-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Refund Note / Reason</Label>
              <Input
                placeholder="Reason for refund (optional)"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="h-9 text-xs border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Total Refund Banner */}
          <div className="flex items-center justify-between p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                Total Amount To Refund
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                {selectedItemIndexes.length} item(s) selected
              </p>
            </div>
            <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
              {formatINR(refundTotal)}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-slate-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleProcessRefund}
            disabled={isSubmitting || selectedItems.length === 0}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md shadow-rose-200 dark:shadow-none"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            {isSubmitting ? "Processing..." : `Confirm & Refund ${formatINR(refundTotal)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
