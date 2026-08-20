"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Plus,
  Trash2,
  User,
  Loader2,
  Check,
  ChevronsUpDown,
  X,
  Layers,
  Sparkles,
  Stethoscope,
  Calendar as CalendarIcon,
  CalendarDays,
  Tag,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { formatINR } from "@/lib/fNumber";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import TherapistSelection from "./TherapistSelection";
import TreatmentSchedulePicker from "@/components/shared/treatment/TreatmentSchedulePicker";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function NewTreatment({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [treatmentType, setTreatmentType] = useState<"Therapy" | "Procedure">("Therapy");
  const [selectedItems, setSelectedItems] = useState<
    {
      name: string;
      therapyId?: string;
      subTherapyId?: string;
      procedureId?: string;
      subProcedureId?: string;
      parentName?: string;
      code?: string;
      unitPrice: number;
      quantity: number;
      total: number;
    }[]
  >([]);
  const [therapistId, setTherapistId] = useState("");
  const [therapistName, setTherapistName] = useState("");

  // Multi-session dates list
  const [treatmentDates, setTreatmentDates] = useState<string[]>([
    new Date().toISOString().split("T")[0],
  ]);

  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Catalog popover state
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [patientOpen, setPatientOpen] = useState(false);

  // Fetch Patients with search across name, mrn, phone, and address
  const { data: patientsData } = useSWR<{
    data: {
      _id: string;
      name: string;
      mrn: string;
      phoneNumber?: string;
      address?: string;
      addressLine1?: string;
      city?: string;
      district?: string;
    }[];
  }>(
    patientSearch.trim()
      ? `/patients?query=${encodeURIComponent(patientSearch.trim())}&limit=25`
      : "/patients?limit=25"
  );

  // Fetch Doctors
  const { data: doctorsData } = useSWR<{
    data: { _id: string; name: string; specialization?: string }[];
  }>("/users/doctors");

  // Fetch Therapy Master Catalog
  const { data: therapyMaster } = useSWR<{
    data: any[];
  }>(treatmentType === "Therapy" ? "/therapy" : null);

  // Fetch Procedure Master Catalog
  const { data: procedureMaster } = useSWR<{
    data: any[];
  }>(treatmentType === "Procedure" ? "/procedure" : null);

  // Multi-date management handlers
  const handleAddDate = () => {
    const lastDate = treatmentDates[treatmentDates.length - 1] || new Date().toISOString().split("T")[0];
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setTreatmentDates([...treatmentDates, nextDate.toISOString().split("T")[0]]);
  };

  const handleRemoveDate = (index: number) => {
    if (treatmentDates.length <= 1) return;
    setTreatmentDates(treatmentDates.filter((_, idx) => idx !== index));
  };

  const handleUpdateDate = (index: number, newDate: string) => {
    const updated = [...treatmentDates];
    updated[index] = newDate;
    setTreatmentDates(updated);
  };

  const handleQuickPreset = (count: number) => {
    const startDate = new Date(treatmentDates[0] || new Date());
    const generated: string[] = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      generated.push(d.toISOString().split("T")[0]);
    }
    setTreatmentDates(generated);
  };

  // Flatten active items for selection
  const flatCatalogOptions = useMemo(() => {
    const list: any[] = [];
    if (treatmentType === "Therapy") {
      (therapyMaster?.data || []).forEach((t: any) => {
        if (t.status !== "Active" || t.isDeleted) return;
        if (t.hasSubTherapies && t.subTherapies?.length > 0) {
          t.subTherapies.forEach((st: any) => {
            if (st.status === "Active" && !st.isDeleted) {
              list.push({
                id: st._id,
                name: st.name,
                displayName: `${t.name} → ${st.name}`,
                parentName: t.name,
                therapyId: t._id,
                subTherapyId: st._id,
                price: Number(st.price) || 0,
                code: st.code || t.code || null,
              });
            }
          });
        } else {
          list.push({
            id: t._id,
            name: t.name,
            displayName: t.name,
            parentName: null,
            therapyId: t._id,
            subTherapyId: null,
            price: Number(t.price) || 0,
            code: t.code || null,
          });
        }
      });
    } else {
      (procedureMaster?.data || []).forEach((p: any) => {
        if (p.status !== "Active" || p.isDeleted) return;
        if (p.hasSubProcedures && p.subProcedures?.length > 0) {
          p.subProcedures.forEach((sp: any) => {
            if (sp.status === "Active" && !sp.isDeleted) {
              list.push({
                id: sp._id,
                name: sp.name,
                displayName: `${p.name} → ${sp.name}`,
                parentName: p.name,
                procedureId: p._id,
                subProcedureId: sp._id,
                price: Number(sp.price) || 0,
                code: sp.code || p.code || null,
              });
            }
          });
        } else {
          list.push({
            id: p._id,
            name: p.name,
            displayName: p.name,
            parentName: null,
            procedureId: p._id,
            subProcedureId: null,
            price: Number(p.price) || 0,
            code: p.code || null,
          });
        }
      });
    }
    return list;
  }, [treatmentType, therapyMaster, procedureMaster]);

  const handleToggleItem = (opt: any) => {
    const exists = selectedItems.find((i) =>
      treatmentType === "Therapy"
        ? (i.subTherapyId && i.subTherapyId === opt.id) || (i.therapyId && i.therapyId === opt.id)
        : (i.subProcedureId && i.subProcedureId === opt.id) || (i.procedureId && i.procedureId === opt.id)
    );

    if (exists) {
      setSelectedItems((prev) =>
        prev.filter((i) =>
          treatmentType === "Therapy"
            ? (i.subTherapyId || i.therapyId) !== opt.id
            : (i.subProcedureId || i.procedureId) !== opt.id
        )
      );
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          name: opt.parentName ? `${opt.parentName} - ${opt.name}` : opt.name,
          parentName: opt.parentName || undefined,
          therapyId: opt.therapyId,
          subTherapyId: opt.subTherapyId || undefined,
          procedureId: opt.procedureId,
          subProcedureId: opt.subProcedureId || undefined,
          code: opt.code || undefined,
          unitPrice: opt.price || 0,
          quantity: 1,
          total: opt.price || 0,
        },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const perSessionTotal = useMemo(() => {
    const subtotal = selectedItems.reduce((sum, it) => sum + it.total, 0);
    return Math.max(0, subtotal - discount);
  }, [selectedItems, discount]);

  const totalCoursePrice = perSessionTotal * treatmentDates.length;

  const selectedPatient = (patientsData?.data || []).find((p) => p._id === patientId);
  const selectedDoctor = (doctorsData?.data || []).find((d) => d._id === doctorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientId) {
      toast.error("Please select a patient");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Please select at least one therapy or procedure item");
      return;
    }

    if (!therapistName || therapistName.trim() === "") {
      toast.error("Therapist assignment is mandatory");
      return;
    }

    if (treatmentDates.length === 0) {
      toast.error("Please select at least one treatment date");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/treatment", {
        patient: patientId,
        doctor: doctorId || null,
        doctorName: selectedDoctor ? `Dr. ${selectedDoctor.name}` : "Self",
        type: treatmentType,
        category: treatmentType,
        items: selectedItems,
        therapist: therapistId || null,
        therapistName,
        treatmentDate: new Date(treatmentDates[0]),
        treatmentDates: treatmentDates.map((d) => new Date(d)),
        notes,
        discount,
      });

      toast.success(
        treatmentDates.length > 1
          ? `Treatment course created with ${treatmentDates.length} scheduled sessions!`
          : "Treatment order created successfully!"
      );
      onOpenChange(false);
      // Reset form
      setPatientId("");
      setDoctorId("");
      setSelectedItems([]);
      setTreatmentDates([new Date().toISOString().split("T")[0]]);
      setNotes("");
      setDiscount(0);
      onSuccess?.();
    } catch (err: any) {
      console.error("Error creating treatment:", err);
      toast.error(err.response?.data?.message || "Failed to create treatment order");
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
            <div className="h-10 w-10 rounded-2xl bg-synapse-light/10 text-synapse-light flex items-center justify-center font-bold shadow-2xs">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                New Treatment Order
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Create a walk-in or doctor prescribed procedure / therapy treatment order with single or multiple sessions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
          {/* Section 1: Patient & Doctor Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Patient Picker */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-synapse-light" />
                <span>Patient</span>
                <span className="text-rose-500">*</span>
              </Label>
              <Popover open={patientOpen} onOpenChange={setPatientOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-left hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-synapse-light/20 transition cursor-pointer"
                  >
                    <span className="truncate font-medium text-slate-800">
                      {selectedPatient
                        ? `${selectedPatient.name} (${selectedPatient.mrn})`
                        : "Select patient..."}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search by name, MRN, phone, address..."
                      value={patientSearch}
                      onValueChange={setPatientSearch}
                      className="text-xs"
                    />
                    <CommandList className="max-h-64 overflow-y-auto">
                      <CommandEmpty className="p-4 text-xs text-slate-400 text-center">
                        No matching patients found.
                      </CommandEmpty>
                      <CommandGroup>
                        {(patientsData?.data || []).map((p) => {
                          const addressSnippet = [
                            p.addressLine1 || p.address,
                            p.city,
                            p.district,
                          ]
                            .filter(Boolean)
                            .join(", ");

                          return (
                            <CommandItem
                              key={p._id}
                              value={`${p.name} ${p.mrn} ${p.phoneNumber || ""} ${p.address || ""} ${p.city || ""}`}
                              onSelect={() => {
                                setPatientId(p._id);
                                setPatientOpen(false);
                              }}
                              className="cursor-pointer py-2.5 px-3 border-b border-slate-100/60 last:border-0"
                            >
                              <div className="flex flex-col gap-0.5 w-full">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-slate-900 text-xs">{p.name}</span>
                                  <span className="text-[10px] font-mono font-bold text-synapse-light bg-synapse-light/10 px-1.5 py-0.5 rounded">
                                    {p.mrn}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                  {p.phoneNumber && (
                                    <span>📞 {p.phoneNumber}</span>
                                  )}
                                  {addressSnippet && (
                                    <span className="truncate max-w-[200px]">📍 {addressSnippet}</span>
                                  )}
                                </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Prescribing Doctor */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-synapse-light" />
                <span>Prescribing Doctor (Optional)</span>
              </Label>
              <Select value={doctorId} onValueChange={setDoctorId}>
                <SelectTrigger className="w-full h-11 bg-white rounded-xl border-slate-200 text-xs px-3.5">
                  <SelectValue placeholder="Self / Walk-in" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self" className="text-xs">Self / Walk-in</SelectItem>
                  {(doctorsData?.data || []).map((doc) => (
                    <SelectItem key={doc._id} value={doc._id} className="text-xs py-2">
                      Dr. {doc.name} {doc.specialization ? `(${doc.specialization})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section 2: Treatment Category & Therapist Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            {/* Category Toggle */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-synapse-light" />
                <span>Treatment Category</span>
              </Label>
              <div className="flex h-11 rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setTreatmentType("Therapy");
                    setSelectedItems([]);
                  }}
                  className={cn(
                    "flex-1 h-full rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center",
                    treatmentType === "Therapy"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Therapy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTreatmentType("Procedure");
                    setSelectedItems([]);
                  }}
                  className={cn(
                    "flex-1 h-full rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center",
                    treatmentType === "Procedure"
                      ? "bg-white text-indigo-800 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Procedure
                </button>
              </div>
            </div>

            {/* Mandatory Therapist Selection */}
            <div className="space-y-2">
              <TherapistSelection
                value={therapistId}
                onChange={(id, name) => {
                  setTherapistId(id);
                  setTherapistName(name);
                }}
                required={true}
              />
            </div>
          </div>

          {/* Section 3: Treatment Items Multi-Select from Master Catalog */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-synapse-light" />
                <span>Select {treatmentType} Items</span>
                <span className="text-rose-500">*</span>
              </Label>
              {selectedItems.length > 0 && (
                <span className="text-xs font-bold text-emerald-700">
                  Per-Session Price: {formatINR(selectedItems.reduce((s, i) => s + i.total, 0))}
                </span>
              )}
            </div>

            <Popover open={catalogOpen} onOpenChange={setCatalogOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex w-full h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-left hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-synapse-light/20 transition cursor-pointer"
                >
                  <span className="truncate text-slate-600 font-medium">
                    {selectedItems.length > 0
                      ? `${selectedItems.length} items selected (${selectedItems.map((i) => i.name).join(", ")})`
                      : `Search & select ${treatmentType.toLowerCase()} catalog items...`}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder={`Search ${treatmentType.toLowerCase()}s...`}
                    value={catalogSearch}
                    onValueChange={setCatalogSearch}
                    className="text-xs"
                  />
                  <CommandList className="max-h-60 overflow-y-auto">
                    <CommandEmpty className="p-3 text-xs text-slate-400 text-center">
                      No active items found.
                    </CommandEmpty>
                    <CommandGroup>
                      {flatCatalogOptions.map((opt) => {
                        const isSelected = selectedItems.some((i) =>
                          treatmentType === "Therapy"
                            ? (i.subTherapyId && i.subTherapyId === opt.id) ||
                            (i.therapyId && i.therapyId === opt.id)
                            : (i.subProcedureId && i.subProcedureId === opt.id) ||
                            (i.procedureId && i.procedureId === opt.id)
                        );

                        return (
                          <CommandItem
                            key={opt.id}
                            value={`${opt.displayName} ${opt.code || ""}`}
                            onSelect={() => handleToggleItem(opt)}
                            className="cursor-pointer flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                                  isSelected
                                    ? "border-synapse-light bg-synapse-light text-white"
                                    : "border-slate-300 bg-white"
                                )}
                              >
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>
                              <span className="text-xs font-medium text-slate-800 truncate">
                                {opt.displayName}
                              </span>
                            </div>
                            <span className="font-bold text-xs text-emerald-700 shrink-0">
                              {formatINR(opt.price)}
                            </span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected Items List */}
            {selectedItems.length > 0 && (
              <div className="space-y-2 mt-2">
                {selectedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="font-semibold text-slate-800 text-xs">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-slate-700 text-xs">
                        {formatINR(item.total)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-1 rounded-md hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Treatment Multi-Session Dates Selection */}
          <TreatmentSchedulePicker
            label="Treatment Schedule"
            dates={treatmentDates}
            onChange={setTreatmentDates}
          />

          {/* Section 5: Discount & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Per-Session Discount (₹)</Label>
              <Input
                type="number"
                min="0"
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                placeholder="0"
                className="h-11 rounded-xl border-slate-200 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Treatment Notes / Instructions
              </Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add clinical instructions or session notes..."
                className="h-11 rounded-xl border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Grand Total Course Summary */}
          {selectedItems.length > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="font-semibold text-emerald-950 text-xs">Total Treatment Course</span>
                <span className="text-[10.5px] text-emerald-700">
                  {treatmentDates.length} {treatmentDates.length === 1 ? "Session" : "Sessions"} • {formatINR(perSessionTotal)} per session
                </span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-emerald-900 text-lg block">
                  {formatINR(totalCoursePrice)}
                </span>
                <span className="text-[10px] text-emerald-600">Billed per session when completed</span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
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
                  <span>Creating Schedule...</span>
                </>
              ) : (
                <span>
                  Create {treatmentDates.length > 1 ? `${treatmentDates.length} Sessions Course` : "Treatment Order"}
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
