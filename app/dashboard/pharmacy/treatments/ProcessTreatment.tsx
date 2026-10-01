"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CreditCard, DollarSign, Loader2, QrCode, Receipt, UserCheck, ShieldCheck } from "lucide-react";
import { formatINR } from "@/lib/fNumber";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import TherapistSelection from "./TherapistSelection";
import { TreatmentOrderType } from "./interface";

interface Props {
  treatment: TreatmentOrderType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ProcessTreatment({
  treatment,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [cash, setCash] = useState<number>(0);
  const [card, setCard] = useState<number>(0);
  const [upi, setUpi] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [amountInput, setAmountInput] = useState("");
  const [payMode, setPayMode] = useState<"cash" | "card" | "upi" | "custom">("cash");
  const [therapistId, setTherapistId] = useState("");
  const [therapistName, setTherapistName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedAmount = amountInput.trim() === "" ? NaN : Number(amountInput);
  const subtotal = Number.isFinite(parsedAmount) ? Math.max(0, parsedAmount) : 0;
  const netPayable = Math.max(0, subtotal - discount);
  const roundRupee = (value: number) => Math.round((Number(value) || 0) * 100) / 100;
  const splitTotal = roundRupee((cash || 0) + (card || 0) + (upi || 0));
  const splitMatches = splitTotal === roundRupee(netPayable);
  const amountEntered = amountInput.trim() !== "" && Number.isFinite(parsedAmount);

  const applySplit = (
    net: number,
    mode: "cash" | "card" | "upi" | "custom",
  ) => {
    if (mode === "card") {
      setCash(0);
      setCard(net);
      setUpi(0);
    } else if (mode === "upi") {
      setCash(0);
      setCard(0);
      setUpi(net);
    } else if (mode === "cash") {
      setCash(net);
      setCard(0);
      setUpi(0);
    }
  };

  useEffect(() => {
    if (treatment) {
      const tId =
        typeof treatment.therapist === "object" && treatment.therapist !== null
          ? treatment.therapist._id
          : typeof treatment.therapist === "string"
          ? treatment.therapist
          : "";
      setTherapistId(tId);
      setTherapistName(treatment.therapistName || "");
      setDiscount(treatment.discount || 0);
      setAmountInput("");
      setPayMode("cash");
      setCash(0);
      setCard(0);
      setUpi(0);
    }
  }, [treatment]);

  if (!treatment) return null;

  const handleQuickPay = (method: "cash" | "card" | "upi") => {
    setPayMode(method);
    applySplit(netPayable, method);
  };

  const handleAmountChange = (raw: string) => {
    setAmountInput(raw);
    const next = raw.trim() === "" ? 0 : Math.max(0, Number(raw) || 0);
    const net = Math.max(0, next - discount);
    if (payMode !== "custom") applySplit(net, payMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!therapistName || therapistName.trim() === "") {
      toast.error("Therapist assignment is mandatory");
      return;
    }

    if (amountInput.trim() === "" || !Number.isFinite(parsedAmount) || parsedAmount < 0) {
      toast.error("Enter the session amount");
      return;
    }

    if (!splitMatches) {
      toast.error("Cash, Card, and UPI must equal the session amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      let primaryMethod = "Cash";
      if (card > cash && card > upi) primaryMethod = "Card";
      else if (upi > cash && upi > card) primaryMethod = "UPI";

      const res = await api.post(`/treatment/${treatment._id}/process`, {
        amount: subtotal,
        cash,
        card,
        upi,
        discount,
        paymentMethod: primaryMethod,
        therapist: therapistId || null,
        therapistName,
      });

      const billNo = res.data?.bill?.mrn || res.data?.data?.billNo;
      toast.success(
        billNo
          ? `Session processed! Bill #${billNo} generated successfully.`
          : "Treatment session processed successfully!"
      );

      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error("Error processing treatment session:", err);
      toast.error(err.response?.data?.message || "Failed to process treatment session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl sm:max-w-2xl max-h-[90vh] bg-white rounded-3xl p-0 overflow-hidden flex flex-col shadow-2xl border border-slate-100">
        {/* Header */}
        <DialogHeader className="px-7 py-5 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Process Treatment Session
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Complete Session #{treatment.sessionNumber} for {treatment.patient?.name} and generate billing invoice.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-6 space-y-5 text-xs">
          {/* Summary Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-sm">
                  {treatment.patient?.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  MRN: {treatment.patient?.mrn || "—"} {treatment.doctorName ? `• Prescribed by Dr. ${treatment.doctorName}` : ""}
                </span>
              </div>
              <Badge className="bg-synapse-light/10 text-synapse-light border-synapse-light/30 px-2.5 py-1 text-xs font-bold">
                Session #{treatment.sessionNumber}
              </Badge>
            </div>
            <div className="pt-1 text-xs text-slate-600 font-medium">
              {(treatment.items || []).map((i) => i.name).join(", ")}
            </div>
          </div>

          {/* Therapist Selection (Pre-filled / editable) */}
          <div className="space-y-2">
            <TherapistSelection
              value={therapistId || therapistName}
              onChange={(id, name) => {
                setTherapistId(id);
                setTherapistName(name);
              }}
              label="Assigned Therapist for this Session"
              required={true}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Session amount (₹) <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="Enter amount for this session"
              value={amountInput}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="h-11 rounded-xl border-slate-200 text-sm"
            />
            <p className="text-[11px] text-slate-500">
              Charge depends on the duration and the procedure. Cash, card, and UPI split against this amount.
            </p>
          </div>

          {/* Financial Breakdown Cards */}
          <div className="grid grid-cols-3 gap-3 text-center pt-1">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Subtotal</span>
              <span className="font-bold text-slate-800 text-sm">{formatINR(subtotal)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <span className="text-[10px] uppercase font-bold text-amber-700 block mb-1">Discount</span>
              <span className="font-bold text-amber-800 text-sm">{formatINR(discount)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">Net Payable</span>
              <span className="font-extrabold text-emerald-900 text-base">{formatINR(netPayable)}</span>
            </div>
          </div>

          {/* Quick Pay Buttons */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold text-slate-700">Quick Pay Method</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleQuickPay("cash")}
                className="h-11 px-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span>Full Cash</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPay("card")}
                className="h-11 px-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span>Full Card</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPay("upi")}
                className="h-11 px-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <QrCode className="h-4 w-4 text-purple-600" />
                <span>Full UPI</span>
              </button>
            </div>
          </div>

          {/* Payment Split Input Fields */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600">Cash (₹)</Label>
              <Input
                type="number"
                min="0"
                value={cash || ""}
                onChange={(e) => {
                  setPayMode("custom");
                  setCash(Number(e.target.value) || 0);
                }}
                className="h-11 rounded-xl border-slate-200 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600">Card (₹)</Label>
              <Input
                type="number"
                min="0"
                value={card || ""}
                onChange={(e) => {
                  setPayMode("custom");
                  setCard(Number(e.target.value) || 0);
                }}
                className="h-11 rounded-xl border-slate-200 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600">UPI (₹)</Label>
              <Input
                type="number"
                min="0"
                value={upi || ""}
                onChange={(e) => {
                  setPayMode("custom");
                  setUpi(Number(e.target.value) || 0);
                }}
                className="h-11 rounded-xl border-slate-200 text-xs"
              />
            </div>
          </div>

          {amountEntered && !splitMatches && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              Cash, Card, and UPI must equal the session amount ({formatINR(netPayable)}).
              The current split is {formatINR(splitTotal)}.
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 px-5 rounded-xl text-xs font-medium cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Processing & Billing...</span>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm & Generate Bill</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
