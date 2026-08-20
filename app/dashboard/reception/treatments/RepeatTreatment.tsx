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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Calendar as CalendarIcon,
  CreditCard,
  DollarSign,
  Loader2,
  QrCode,
  RotateCcw,
  UserCheck,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

export default function RepeatTreatment({
  treatment,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [therapistId, setTherapistId] = useState("");
  const [therapistName, setTherapistName] = useState("");
  const [treatmentDate, setTreatmentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [autoProcess, setAutoProcess] = useState(false);
  const [cash, setCash] = useState<number>(0);
  const [card, setCard] = useState<number>(0);
  const [upi, setUpi] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextSessionNumber = (treatment?.sessionNumber || 1) + 1;
  const subtotal = (treatment?.items || []).reduce((sum, it) => sum + it.total, 0);
  const netPayable = Math.max(0, subtotal - discount);

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
      setTreatmentDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setAutoProcess(false);
      setCash(Math.max(0, (treatment.items || []).reduce((s, i) => s + i.total, 0) - (treatment.discount || 0)));
      setCard(0);
      setUpi(0);
    }
  }, [treatment]);

  if (!treatment) return null;

  const handleQuickPay = (method: "cash" | "card" | "upi") => {
    if (method === "cash") {
      setCash(netPayable);
      setCard(0);
      setUpi(0);
    } else if (method === "card") {
      setCash(0);
      setCard(netPayable);
      setUpi(0);
    } else if (method === "upi") {
      setCash(0);
      setCard(0);
      setUpi(netPayable);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!therapistName || therapistName.trim() === "") {
      toast.error("Therapist assignment is mandatory");
      return;
    }

    setIsSubmitting(true);
    try {
      let primaryMethod = "Cash";
      if (card > cash && card > upi) primaryMethod = "Card";
      else if (upi > cash && upi > card) primaryMethod = "UPI";

      const res = await api.post(`/treatment/${treatment._id}/repeat`, {
        therapist: therapistId || null,
        therapistName,
        treatmentDate: new Date(treatmentDate),
        notes,
        discount,
        autoProcess,
        cash: autoProcess ? cash : undefined,
        card: autoProcess ? card : undefined,
        upi: autoProcess ? upi : undefined,
        paymentMethod: autoProcess ? primaryMethod : undefined,
      });

      const billNo = res.data?.bill?.mrn || res.data?.data?.billNo;
      toast.success(
        autoProcess && billNo
          ? `Repeat Session #${nextSessionNumber} created & billed (#${billNo}) successfully!`
          : `Repeat Session #${nextSessionNumber} created successfully!`
      );

      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error("Error repeating treatment:", err);
      toast.error(err.response?.data?.message || "Failed to repeat treatment session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] bg-white rounded-3xl p-0 overflow-hidden flex flex-col shadow-2xl border border-slate-100">
        {/* Header */}
        <DialogHeader className="px-7 py-5 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shadow-2xs">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Repeat Treatment Session
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Create new periodic Session #{nextSessionNumber} for {treatment.patient?.name}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-6 space-y-5 text-xs">
          {/* Information banner */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-sm">
                  {treatment.patient?.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  MRN: {treatment.patient?.mrn || "—"} {treatment.doctorName ? `• Doctor: Dr. ${treatment.doctorName}` : ""}
                </span>
              </div>
              <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-1">
                New Session #{nextSessionNumber}
              </Badge>
            </div>
            <div className="pt-1 text-xs text-slate-600 font-medium">
              <span className="font-semibold text-slate-700">Prescribed Items: </span>
              {(treatment.items || []).map((i) => i.name).join(", ")}
            </div>
          </div>

          {/* Section: Therapist Selection (Retains previous therapist, allows edit) */}
          <div className="space-y-2">
            <TherapistSelection
              value={therapistId || therapistName}
              onChange={(id, name) => {
                setTherapistId(id);
                setTherapistName(name);
              }}
              label="Assigned Therapist for Session"
              required={true}
            />
          </div>

          {/* Section: Date & Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-synapse-light" />
                <span>Treatment Date</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-left hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-synapse-light/20 transition cursor-pointer"
                  >
                    <span className="font-medium text-slate-800">
                      {treatmentDate
                        ? format(new Date(`${treatmentDate}T00:00:00`), "dd/MM/yyyy (EEE)")
                        : "Select date..."}
                    </span>
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <ShadcnCalendar
                    mode="single"
                    selected={treatmentDate ? new Date(`${treatmentDate}T00:00:00`) : new Date()}
                    onSelect={(selectedDate) => {
                      if (selectedDate) {
                        setTreatmentDate(format(selectedDate, "yyyy-MM-dd"));
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Discount (₹)</Label>
              <Input
                type="number"
                min="0"
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="h-11 rounded-xl border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Section: Session Notes */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold text-slate-700">Session Notes / Instructions</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Clinical observation or specific instructions for this repeat session..."
              className="rounded-xl border-slate-200 text-xs p-3"
            />
          </div>

          {/* Auto-Process / Immediate Billing Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-800 text-xs block">
                Process & Create Bill Now
              </span>
              <span className="text-[11px] text-slate-500 block">
                Generate new individual bill for Session #{nextSessionNumber} immediately
              </span>
            </div>
            <Switch
              checked={autoProcess}
              onCheckedChange={setAutoProcess}
            />
          </div>

          {/* Payment breakdown if auto-processing */}
          {autoProcess && (
            <div className="space-y-4 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 border-b border-emerald-200/60 pb-2.5">
                <span>Net Payable for Session #{nextSessionNumber}:</span>
                <span className="text-base font-extrabold">{formatINR(netPayable)}</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickPay("cash")}
                  className="h-10 px-2 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-100 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Full Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPay("card")}
                  className="h-10 px-2 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-100 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                  <span>Full Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPay("upi")}
                  className="h-10 px-2 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-100 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <QrCode className="h-3.5 w-3.5 text-purple-600" />
                  <span>Full UPI</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Cash (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={cash || ""}
                    onChange={(e) => setCash(Number(e.target.value) || 0)}
                    className="h-11 rounded-xl border-slate-200 text-xs bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Card (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={card || ""}
                    onChange={(e) => setCard(Number(e.target.value) || 0)}
                    className="h-11 rounded-xl border-slate-200 text-xs bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">UPI (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={upi || ""}
                    onChange={(e) => setUpi(Number(e.target.value) || 0)}
                    className="h-11 rounded-xl border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>
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
              className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Repeating Session...</span>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="h-4 w-4" />
                  <span>Create Session #{nextSessionNumber}</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
