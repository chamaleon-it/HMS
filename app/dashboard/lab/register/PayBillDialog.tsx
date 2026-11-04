"use client";

import { useState, type FormEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";
import api from "@/lib/axios";
import { formatINR } from "@/lib/fNumber";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface RegisterBill {
  _id: string;
  mrn: string;
  cash: number;
  online: number;
  insurance: number;
  discount: number;
  items: { total: number }[];
}

interface PayBillDialogProps {
  bill: RegisterBill;
  onClose: () => void;
  onPaid: () => Promise<unknown>;
}

export function billDue(bill: RegisterBill) {
  const total = bill.items.reduce((sum, item) => sum + (item.total || 0), 0);
  return Math.max(0, Math.round((total - (bill.cash || 0) - (bill.online || 0) - (bill.insurance || 0) - (bill.discount || 0)) * 100));
}

export default function PayBillDialog({ bill, onClose, onPaid }: PayBillDialogProps) {
  const [amounts, setAmounts] = useState({ cash: "", online: "", discount: "" });
  const [saving, setSaving] = useState(false);
  const dueCents = billDue(bill);
  const entries = Object.values(amounts).map((amount) => Number(amount || 0));
  const validAmounts = entries.every((amount) => Number.isFinite(amount) && amount >= 0 && Math.abs(amount * 100 - Math.round(amount * 100)) < 0.000001);
  const enteredCents = validAmounts ? entries.reduce((sum, amount) => sum + Math.round(amount * 100), 0) : 0;
  const canPay = validAmounts && dueCents > 0 && enteredCents === dueCents && !saving;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canPay) return;

    setSaving(true);
    try {
      await api.patch(`/billing/settle/${bill._id}`, {
        cash: entries[0],
        online: entries[1],
        discount: entries[2],
      });
      await onPaid();
      toast.success(`${bill.mrn} marked as paid`);
      onClose();
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : null;
      toast.error(typeof message === "string" ? message : "Could not save payment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Mark {bill.mrn} as Paid
          </DialogTitle>
          <DialogDescription>
            Enter how the remaining {formatINR(dueCents / 100)} is being settled.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-3">
            {([
              ["cash", "Cash"],
              ["online", "UPI/Card"],
              ["discount", "Discount"],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center gap-4">
                <label htmlFor={`payment-${key}`} className="w-24 shrink-0 text-sm font-medium text-slate-700">{label}</label>
                <Input
                  id={`payment-${key}`}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amounts[key]}
                  onChange={(event) => setAmounts((current) => ({ ...current, [key]: event.target.value }))}
                  className="text-right tabular-nums"
                  disabled={saving}
                />
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Amount due</span><span className="font-semibold tabular-nums">{formatINR(dueCents / 100)}</span>
            </div>
            <div className="mt-2 flex justify-between font-semibold tabular-nums text-slate-900">
              <span>{enteredCents > dueCents ? "Over by" : "Remaining"}</span>
              <span className={enteredCents > dueCents ? "text-rose-600" : "text-emerald-700"}>
                {formatINR(Math.abs(dueCents - enteredCents) / 100)}
              </span>
            </div>
            {!validAmounts && <p className="mt-2 text-xs text-rose-600">Enter nonnegative amounts with at most two decimal places.</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={!canPay} className="bg-emerald-600 text-white hover:bg-emerald-700">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Confirm Paid"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
