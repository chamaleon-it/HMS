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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit3, Loader2, UserCheck, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import TherapistSelection from "./TherapistSelection";
import { TreatmentOrderType } from "./interface";
import { formatINR } from "@/lib/fNumber";

interface Props {
  treatment: TreatmentOrderType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditTreatment({
  treatment,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [therapistId, setTherapistId] = useState("");
  const [therapistName, setTherapistName] = useState("");
  const [treatmentDate, setTreatmentDate] = useState("");
  const [status, setStatus] = useState<string>("Pending");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setTreatmentDate(
        treatment.treatmentDate
          ? new Date(treatment.treatmentDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setStatus(treatment.status || "Pending");
      setNotes(treatment.notes || "");
      setDiscount(treatment.discount || 0);
    }
  }, [treatment]);

  if (!treatment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!therapistName || therapistName.trim() === "") {
      toast.error("Therapist assignment is mandatory");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch(`/treatment/${treatment._id}`, {
        therapist: therapistId || null,
        therapistName,
        treatmentDate: new Date(treatmentDate),
        status,
        notes,
        discount,
      });

      toast.success("Treatment updated successfully!");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error("Error updating treatment:", err);
      toast.error(err.response?.data?.message || "Failed to update treatment");
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
            <div className="h-10 w-10 rounded-2xl bg-synapse-light/10 text-synapse-light flex items-center justify-center font-bold shadow-2xs">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Edit Treatment Details
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Update therapist assignment, status, and session notes for {treatment.mrn}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-6 space-y-5 text-xs">
          {/* Patient info strip */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm">
                {treatment.patient?.name}
              </span>
              <span className="text-slate-500 text-[11px]">
                MRN: {treatment.patient?.mrn || "—"} • Doctor: {treatment.doctorName || "Self"}
              </span>
            </div>
            <span className="text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              Total: {formatINR(
                (treatment.items || []).reduce((s, i) => s + i.total, 0) - discount
              )}
            </span>
          </div>

          {/* Mandatory Therapist Change */}
          <div className="space-y-2">
            <TherapistSelection
              value={therapistId || therapistName}
              onChange={(id, name) => {
                setTherapistId(id);
                setTherapistName(name);
              }}
              label="Change Assigned Therapist"
              required={true}
            />
          </div>

          {/* Status & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full h-11 bg-white rounded-xl border-slate-200 text-xs px-3.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                  <SelectItem value="In-Progress" className="text-xs">In-Progress</SelectItem>
                  <SelectItem value="Completed" className="text-xs">Completed</SelectItem>
                  <SelectItem value="Cancelled" className="text-xs">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
          </div>

          {/* Discount */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold text-slate-700">Discount (₹)</Label>
            <Input
              type="number"
              min="0"
              value={discount || ""}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              placeholder="0"
              className="h-11 rounded-xl border-slate-200 text-xs"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold text-slate-700">
              Treatment Notes / Instructions
            </Label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Session notes or clinical instructions..."
              className="rounded-xl border-slate-200 text-xs p-3"
            />
          </div>

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
              className="h-11 px-6 rounded-xl bg-(--color-synapse-light) hover:bg-(--color-synapse-light)/90 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
