"use client";

import React, { useState, useEffect, useMemo } from "react";
import api from "@/lib/axios";
import configuration from "@/config/configuration";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { fDate, to12h } from "@/lib/fDateAndTime";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Clock,
  CalendarIcon,
  Upload,
  User,
  CalendarDays,
  FileSignature,
} from "lucide-react";

export interface RoundItem {
  id?: number | string;
  label: string;
  start: string;
  end: string;
}

export interface DoctorAvailability {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  days?: string[];
  rounds?: RoundItem[];
}

export interface Doctor {
  _id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  hospital?: string;
  specialization?: string;
  department?: string;
  designation?: string;
  qualification?: string;
  licenseNo?: string;
  consultationFee?: number;
  profilePic?: string | null;
  signature?: string | null;
  availability?: DoctorAvailability | null;
  status?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const COMMON_SPECIALIZATIONS = [
  "General Medicine",
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Gynecology & Obstetrics",
  "Neurology",
  "Ophthalmology",
  "ENT (Otolaryngology)",
  "Psychiatry",
  "Pulmonology",
  "Gastroenterology",
  "Endocrinology",
  "Ayurveda",
  "Physiotherapy",
];

export const COMMON_DEPARTMENTS = [
  "General OPD",
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Gynecology",
  "Neurology",
  "Ophthalmology",
  "ENT",
  "Physiotherapy",
  "Emergency",
];

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const h = String(Math.floor(i / 4)).padStart(2, "0");
  const m = String((i % 4) * 15).padStart(2, "0");
  return `${h}:${m}`;
});

function ComboTime({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full justify-between rounded-xl border-slate-200 text-xs font-normal"
        >
          <span className="truncate">{to12h(value) || "--:--"}</span>
          <Clock className="ml-2 h-3.5 w-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width] max-h-60" align="start">
        <Command>
          <CommandInput placeholder="Type or pick time…" />
          <CommandEmpty>No times</CommandEmpty>
          <CommandGroup className="h-48 overflow-y-auto">
            {TIME_OPTIONS.map((t) => (
              <CommandItem
                key={t}
                value={t}
                onSelect={(v) => {
                  onChange(v);
                  setOpen(false);
                }}
                className="text-xs cursor-pointer"
              >
                {to12h(t)}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ==========================================
// ADD DOCTOR MODAL
// ==========================================
interface AddDoctorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddDoctorModal({
  open,
  onOpenChange,
  onSuccess,
}: AddDoctorModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // General details
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [specialization, setSpecialization] = useState("General Medicine");
  const [customSpecialization, setCustomSpecialization] = useState("");
  const [department, setDepartment] = useState("General OPD");
  const [customDepartment, setCustomDepartment] = useState("");
  const [designation, setDesignation] = useState("Consultant");
  const [qualification, setQualification] = useState("MBBS");
  const [licenseNo, setLicenseNo] = useState("");
  const [consultationFee, setConsultationFee] = useState("500");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("Active");

  // Media
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  // Schedule & Availability
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [days, setDays] = useState<string[]>([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);
  const [rounds, setRounds] = useState<
    Array<{ id: number | string; label: string; start: string; end: string }>
  >([
    { id: 1, label: "Morning Round", start: "09:00", end: "10:00" },
    { id: 2, label: "Evening Round", start: "17:00", end: "18:00" },
  ]);

  const toggleDay = (d: string) => {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const addRound = () => {
    setRounds((prev) => [
      ...prev,
      {
        id: Date.now(),
        label: "Round",
        start: startTime,
        end: endTime,
      },
    ]);
  };

  const updateRound = (
    id: number | string,
    field: "label" | "start" | "end",
    val: string
  ) => {
    setRounds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const removeRound = (id: number | string) => {
    setRounds((prev) => prev.filter((r) => r.id !== id));
  };

  // Auto-suggest username from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!username || username === name.toLowerCase().replace(/[^a-z0-9]/g, "")) {
      const suggested = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
      setUsername(suggested);
    }
  };

  const resetForm = () => {
    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhoneNumber("");
    setSpecialization("General Medicine");
    setCustomSpecialization("");
    setDepartment("General OPD");
    setCustomDepartment("");
    setDesignation("Consultant");
    setQualification("MBBS");
    setLicenseNo("");
    setConsultationFee("500");
    setAddress("");
    setStatus("Active");
    setProfilePic(null);
    setSignature(null);
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime("09:00");
    setEndTime("17:00");
    setDays(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    setRounds([
      { id: 1, label: "Morning Round", start: "09:00", end: "10:00" },
      { id: 2, label: "Evening Round", start: "17:00", end: "18:00" },
    ]);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Doctor name is required.");
      return;
    }
    if (!username.trim()) {
      setErrorMsg("Username is required.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Email address is required.");
      return;
    }
    if (!password) {
      setErrorMsg("Password is required.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    const finalSpecialization =
      specialization === "Other" ? customSpecialization : specialization;
    const finalDepartment =
      department === "Other" ? customDepartment : department;

    setLoading(true);
    try {
      await api.post("/users", {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        role: "Doctor",
        status,
        phoneNumber: phoneNumber.trim() || undefined,
        specialization: finalSpecialization || undefined,
        department: finalDepartment || undefined,
        designation: designation.trim() || undefined,
        qualification: qualification.trim() || undefined,
        licenseNo: licenseNo.trim() || undefined,
        consultationFee: consultationFee ? Number(consultationFee) : 0,
        address: address.trim() || undefined,
        profilePic: profilePic || undefined,
        signature: signature || undefined,
        availability: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          startTime,
          endTime,
          days,
          rounds: rounds.map(({ label, start, end }) => ({
            label,
            start,
            end,
          })),
        },
      });

      const displayName = name.trim().toLowerCase().startsWith("dr")
        ? name.trim()
        : `Dr. ${name.trim()}`;
      toast.success(`${displayName} registered successfully!`);
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to register doctor.";
      const displayMsg = Array.isArray(msg) ? msg.join(", ") : msg;
      setErrorMsg(displayMsg);
      toast.error(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Add New Doctor
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Configure doctor credentials, OPD duty hours, appointment schedule, and signature.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-3 w-full rounded-xl bg-slate-100 p-1 mb-4">
              <TabsTrigger
                value="general"
                className="rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <User className="h-3.5 w-3.5" />
                General Details
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Schedule & Availability
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FileSignature className="h-3.5 w-3.5" />
                Photo & Signature
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: General Details */}
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Doctor Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Username <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. john_doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    required
                    className="rounded-xl border-slate-200 text-sm h-9 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Phone Number
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Confirm Password <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Specialization
                  </Label>
                  <Select
                    value={specialization}
                    onValueChange={(val) => setSpecialization(val)}
                  >
                    <SelectTrigger className="w-full rounded-xl border-slate-200 text-sm h-9 cursor-pointer">
                      <SelectValue placeholder="Select Specialization" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {COMMON_SPECIALIZATIONS.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">Other / Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {specialization === "Other" && (
                    <Input
                      placeholder="Custom specialization"
                      value={customSpecialization}
                      onChange={(e) => setCustomSpecialization(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-8 mt-1"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Department
                  </Label>
                  <Select
                    value={department}
                    onValueChange={(val) => setDepartment(val)}
                  >
                    <SelectTrigger className="w-full rounded-xl border-slate-200 text-sm h-9 cursor-pointer">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {COMMON_DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">Other / Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {department === "Other" && (
                    <Input
                      placeholder="Custom department"
                      value={customDepartment}
                      onChange={(e) => setCustomDepartment(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-8 mt-1"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Qualifications
                  </Label>
                  <Input
                    placeholder="e.g. MBBS, MD"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Designation
                  </Label>
                  <Input
                    placeholder="e.g. Senior Consultant"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    License / Reg. No.
                  </Label>
                  <Input
                    placeholder="e.g. KMC-104829"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Consultation Fee (₹)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="50"
                    placeholder="500"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm h-9 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    OPD Room / Location
                  </Label>
                  <Input
                    placeholder="e.g. Room #104, Block A"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Status
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full rounded-xl border-slate-200 text-sm h-9 cursor-pointer">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Schedule & Availability */}
            <TabsContent value="schedule" className="space-y-4">
              {/* Date range */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Date range
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 w-full justify-between rounded-xl border-slate-200 text-xs font-normal"
                    >
                      <span className="truncate">
                        {startDate && endDate
                          ? `${fDate(startDate)} → ${fDate(endDate)}`
                          : startDate
                          ? `${fDate(startDate)}`
                          : "Select dates"}
                      </span>
                      <CalendarIcon className="h-4 w-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-2 w-auto" align="start">
                    <Calendar
                      startMonth={new Date(new Date().getFullYear(), 0)}
                      endMonth={new Date(new Date().getFullYear() + 10, 11)}
                      mode="range"
                      numberOfMonths={2}
                      disabled={{ before: new Date() }}
                      captionLayout="dropdown"
                      selected={{
                        from: startDate ? new Date(startDate) : undefined,
                        to: endDate ? new Date(endDate) : undefined,
                      }}
                      onSelect={(range) => {
                        if (!range?.from) return;
                        setStartDate(range.from.toISOString());
                        setEndDate(range.to ? range.to.toISOString() : undefined);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Days Checkboxes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Days</Label>
                <div className="flex flex-wrap gap-4 pt-0.5">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <label
                      key={d}
                      className="inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={days.includes(d)}
                        onCheckedChange={() => toggleDay(d)}
                      />
                      <span className="text-xs text-slate-700 font-medium">
                        {d}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Appointments from & to */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Appointments from
                  </Label>
                  <ComboTime value={startTime} onChange={setStartTime} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Appointments to
                  </Label>
                  <ComboTime value={endTime} onChange={setEndTime} />
                </div>
              </div>

              {/* Rounds (excluded from appointments) */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">
                    Rounds (excluded from appointments)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs rounded-lg border-slate-200 cursor-pointer"
                    onClick={addRound}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {rounds.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No excluded rounds defined.
                    </p>
                  ) : (
                    rounds.map((r) => (
                      <div key={r.id} className="flex items-center gap-2">
                        <Input
                          value={r.label}
                          onChange={(e) =>
                            updateRound(r.id, "label", e.target.value)
                          }
                          className="h-9 text-xs rounded-xl border-slate-200 flex-1"
                          placeholder="Round Label"
                        />
                        <div className="w-32">
                          <ComboTime
                            value={r.start}
                            onChange={(v) => updateRound(r.id, "start", v)}
                          />
                        </div>
                        <div className="w-32">
                          <ComboTime
                            value={r.end}
                            onChange={(v) => updateRound(r.id, "end", v)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer"
                          onClick={() => removeRound(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <p className="text-[11px] text-slate-500">
                  Appointments are available between the window above{" "}
                  <span className="font-semibold text-slate-700">minus</span> any rounds.
                </p>
              </div>
            </TabsContent>

            {/* TAB 3: Photo & Signature */}
            <TabsContent value="media" className="space-y-4">
              {/* Profile Photo */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border border-slate-200 shrink-0">
                    {profilePic ? (
                      <AvatarImage
                        src={
                          profilePic.startsWith("http")
                            ? profilePic
                            : configuration().backendUrl + profilePic
                        }
                        alt="Profile photo"
                      />
                    ) : null}
                    <AvatarFallback className="text-base font-bold bg-slate-100 text-slate-600">
                      {name.trim() ? name.trim().charAt(0).toUpperCase() : "A"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1.5 flex-1">
                    <Label className="text-xs font-semibold text-slate-700">
                      Profile photo
                    </Label>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="add-doctor-avatar"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-50"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload</span>
                      </label>
                      <input
                        id="add-doctor-avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files?.length) {
                            const file = e.target.files[0];
                            const formData = new FormData();
                            formData.append("file", file);
                            try {
                              const { data } = await toast.promise(
                                api.post("/uploads", formData),
                                {
                                  loading: "Uploading profile photo...",
                                  success: "Photo uploaded successfully",
                                  error: ({ response }) =>
                                    response?.data?.message || "Upload failed",
                                }
                              );
                              setProfilePic(data?.data?.url);
                            } catch (err) {}
                          }
                        }}
                      />
                      {profilePic && (
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="h-8 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                          onClick={() => setProfilePic(null)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      PNG/JPG up to 2MB. Square images look best.
                    </p>
                  </div>
                </div>
              </div>

              {/* Doctor Signature */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Doctor signature
                </Label>
                <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-center min-h-24 bg-slate-50/50">
                  {signature ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        signature.startsWith("http")
                          ? signature
                          : configuration().backendUrl + signature
                      }
                      alt="Doctor signature preview"
                      className="max-h-20 object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">
                      No signature uploaded
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label
                    htmlFor="add-doctor-signature"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-50"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload signature</span>
                  </label>
                  <input
                    id="add-doctor-signature"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files?.length) {
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append("file", file);
                        try {
                          const { data } = await toast.promise(
                            api.post("/uploads", formData),
                            {
                              loading: "Uploading signature...",
                              success: "Signature uploaded successfully",
                              error: ({ response }) =>
                                response?.data?.message || "Upload failed",
                            }
                          );
                          setSignature(data?.data?.url);
                        } catch (err) {}
                      }
                    }}
                  />
                  {signature && (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      className="h-8 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                      onClick={() => setSignature(null)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Tip: Use a transparent PNG on white background for best results.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-(--color-synapse-light) hover:bg-(--color-synapse-dark) text-white text-xs font-bold px-5 cursor-pointer flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Register Doctor
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// EDIT / UPDATE DOCTOR MODAL
// ==========================================
interface EditDoctorModalProps {
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditDoctorModal({
  doctor,
  open,
  onOpenChange,
  onSuccess,
}: EditDoctorModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // General details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [customSpecialization, setCustomSpecialization] = useState("");
  const [department, setDepartment] = useState("");
  const [customDepartment, setCustomDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [qualification, setQualification] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("Active");

  // Media
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  // Schedule & Availability
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [days, setDays] = useState<string[]>([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);
  const [rounds, setRounds] = useState<
    Array<{ id: number | string; label: string; start: string; end: string }>
  >([]);

  useEffect(() => {
    if (doctor) {
      setName(doctor.name || "");
      setEmail(doctor.email || "");
      setPhoneNumber(doctor.phoneNumber || "");

      const spec = doctor.specialization || "General Medicine";
      if (COMMON_SPECIALIZATIONS.includes(spec)) {
        setSpecialization(spec);
        setCustomSpecialization("");
      } else {
        setSpecialization("Other");
        setCustomSpecialization(spec);
      }

      const dept = doctor.department || "General OPD";
      if (COMMON_DEPARTMENTS.includes(dept)) {
        setDepartment(dept);
        setCustomDepartment("");
      } else {
        setDepartment("Other");
        setCustomDepartment(dept);
      }

      setDesignation(doctor.designation || "");
      setQualification(doctor.qualification || "");
      setLicenseNo(doctor.licenseNo || "");
      setConsultationFee(
        doctor.consultationFee !== undefined ? String(doctor.consultationFee) : "500"
      );
      setAddress(doctor.address || "");
      setStatus(doctor.status || "Active");
      setProfilePic(doctor.profilePic || null);
      setSignature(doctor.signature || null);

      const avail = doctor.availability;
      setStartDate(avail?.startDate ? String(avail.startDate) : undefined);
      setEndDate(avail?.endDate ? String(avail.endDate) : undefined);
      setStartTime(avail?.startTime || "09:00");
      setEndTime(avail?.endTime || "17:00");
      setDays(avail?.days || ["Mon", "Tue", "Wed", "Thu", "Fri"]);
      setRounds(
        avail?.rounds?.map((r, i) => ({
          id: r.id || i + 1,
          label: r.label,
          start: r.start,
          end: r.end,
        })) || [
          { id: 1, label: "Morning Round", start: "09:00", end: "10:00" },
          { id: 2, label: "Evening Round", start: "17:00", end: "18:00" },
        ]
      );

      setErrorMsg(null);
    }
  }, [doctor]);

  const toggleDay = (d: string) => {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const addRound = () => {
    setRounds((prev) => [
      ...prev,
      {
        id: Date.now(),
        label: "Round",
        start: startTime,
        end: endTime,
      },
    ]);
  };

  const updateRound = (
    id: number | string,
    field: "label" | "start" | "end",
    val: string
  ) => {
    setRounds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const removeRound = (id: number | string) => {
    setRounds((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Doctor name is required.");
      return;
    }

    const finalSpecialization =
      specialization === "Other" ? customSpecialization : specialization;
    const finalDepartment =
      department === "Other" ? customDepartment : department;

    setLoading(true);
    try {
      await api.patch(`/users/${doctor._id}`, {
        name: name.trim(),
        email: email.trim().toLowerCase() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        specialization: finalSpecialization || undefined,
        department: finalDepartment || undefined,
        designation: designation.trim() || undefined,
        qualification: qualification.trim() || undefined,
        licenseNo: licenseNo.trim() || undefined,
        consultationFee: consultationFee ? Number(consultationFee) : 0,
        address: address.trim() || undefined,
        status,
        profilePic,
        signature,
        availability: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          startTime,
          endTime,
          days,
          rounds: rounds.map(({ label, start, end }) => ({
            label,
            start,
            end,
          })),
        },
      });

      const displayName = name.trim().toLowerCase().startsWith("dr")
        ? name.trim()
        : `Dr. ${name.trim()}`;
      toast.success(`${displayName} updated successfully!`);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update doctor profile.";
      const displayMsg = Array.isArray(msg) ? msg.join(", ") : msg;
      setErrorMsg(displayMsg);
      toast.error(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Edit Doctor Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Modify doctor credentials, OPD consultation hours, appointment availability, and signature.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-3 w-full rounded-xl bg-slate-100 p-1 mb-4">
              <TabsTrigger
                value="general"
                className="rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <User className="h-3.5 w-3.5" />
                General Details
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Schedule & Availability
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FileSignature className="h-3.5 w-3.5" />
                Photo & Signature
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: General Details */}
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Doctor Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Username
                  </Label>
                  <Input
                    value={doctor?.username || ""}
                    disabled
                    className="rounded-xl border-slate-200 text-sm h-9 font-mono bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Phone Number
                  </Label>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Specialization
                  </Label>
                  <Select
                    value={specialization}
                    onValueChange={(val) => setSpecialization(val)}
                  >
                    <SelectTrigger className="w-full rounded-xl border-slate-200 text-sm h-9 cursor-pointer">
                      <SelectValue placeholder="Select Specialization" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {COMMON_SPECIALIZATIONS.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">Other / Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {specialization === "Other" && (
                    <Input
                      placeholder="Custom specialization"
                      value={customSpecialization}
                      onChange={(e) => setCustomSpecialization(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-8 mt-1"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Department
                  </Label>
                  <Select
                    value={department}
                    onValueChange={(val) => setDepartment(val)}
                  >
                    <SelectTrigger className="w-full rounded-xl border-slate-200 text-sm h-9 cursor-pointer">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {COMMON_DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">Other / Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {department === "Other" && (
                    <Input
                      placeholder="Custom department"
                      value={customDepartment}
                      onChange={(e) => setCustomDepartment(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-8 mt-1"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Qualifications
                  </Label>
                  <Input
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Designation
                  </Label>
                  <Input
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    License / Reg. No.
                  </Label>
                  <Input
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Consultation Fee (₹)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="50"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm h-9 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    OPD Room / Location
                  </Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Status
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full rounded-xl border-slate-200 text-sm h-9 cursor-pointer">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Schedule & Availability */}
            <TabsContent value="schedule" className="space-y-4">
              {/* Date range */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Date range
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 w-full justify-between rounded-xl border-slate-200 text-xs font-normal"
                    >
                      <span className="truncate">
                        {startDate && endDate
                          ? `${fDate(startDate)} → ${fDate(endDate)}`
                          : startDate
                          ? `${fDate(startDate)}`
                          : "Select dates"}
                      </span>
                      <CalendarIcon className="h-4 w-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-2 w-auto" align="start">
                    <Calendar
                      startMonth={new Date(new Date().getFullYear(), 0)}
                      endMonth={new Date(new Date().getFullYear() + 10, 11)}
                      mode="range"
                      numberOfMonths={2}
                      disabled={{ before: new Date() }}
                      captionLayout="dropdown"
                      selected={{
                        from: startDate ? new Date(startDate) : undefined,
                        to: endDate ? new Date(endDate) : undefined,
                      }}
                      onSelect={(range) => {
                        if (!range?.from) return;
                        setStartDate(range.from.toISOString());
                        setEndDate(range.to ? range.to.toISOString() : undefined);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Days Checkboxes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Days</Label>
                <div className="flex flex-wrap gap-4 pt-0.5">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <label
                      key={d}
                      className="inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={days.includes(d)}
                        onCheckedChange={() => toggleDay(d)}
                      />
                      <span className="text-xs text-slate-700 font-medium">
                        {d}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Appointments from & to */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Appointments from
                  </Label>
                  <ComboTime value={startTime} onChange={setStartTime} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Appointments to
                  </Label>
                  <ComboTime value={endTime} onChange={setEndTime} />
                </div>
              </div>

              {/* Rounds (excluded from appointments) */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">
                    Rounds (excluded from appointments)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs rounded-lg border-slate-200 cursor-pointer"
                    onClick={addRound}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {rounds.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No excluded rounds defined.
                    </p>
                  ) : (
                    rounds.map((r) => (
                      <div key={r.id} className="flex items-center gap-2">
                        <Input
                          value={r.label}
                          onChange={(e) =>
                            updateRound(r.id, "label", e.target.value)
                          }
                          className="h-9 text-xs rounded-xl border-slate-200 flex-1"
                          placeholder="Round Label"
                        />
                        <div className="w-32">
                          <ComboTime
                            value={r.start}
                            onChange={(v) => updateRound(r.id, "start", v)}
                          />
                        </div>
                        <div className="w-32">
                          <ComboTime
                            value={r.end}
                            onChange={(v) => updateRound(r.id, "end", v)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer"
                          onClick={() => removeRound(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <p className="text-[11px] text-slate-500">
                  Appointments are available between the window above{" "}
                  <span className="font-semibold text-slate-700">minus</span> any rounds.
                </p>
              </div>
            </TabsContent>

            {/* TAB 3: Photo & Signature */}
            <TabsContent value="media" className="space-y-4">
              {/* Profile Photo */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border border-slate-200 shrink-0">
                    {profilePic ? (
                      <AvatarImage
                        src={
                          profilePic.startsWith("http")
                            ? profilePic
                            : configuration().backendUrl + profilePic
                        }
                        alt="Profile photo"
                      />
                    ) : null}
                    <AvatarFallback className="text-base font-bold bg-slate-100 text-slate-600">
                      {name.trim() ? name.trim().charAt(0).toUpperCase() : "A"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1.5 flex-1">
                    <Label className="text-xs font-semibold text-slate-700">
                      Profile photo
                    </Label>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="edit-doctor-avatar"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-50"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload</span>
                      </label>
                      <input
                        id="edit-doctor-avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files?.length) {
                            const file = e.target.files[0];
                            const formData = new FormData();
                            formData.append("file", file);
                            try {
                              const { data } = await toast.promise(
                                api.post("/uploads", formData),
                                {
                                  loading: "Uploading profile photo...",
                                  success: "Photo uploaded successfully",
                                  error: ({ response }) =>
                                    response?.data?.message || "Upload failed",
                                }
                              );
                              setProfilePic(data?.data?.url);
                            } catch (err) {}
                          }
                        }}
                      />
                      {profilePic && (
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="h-8 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                          onClick={() => setProfilePic(null)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      PNG/JPG up to 2MB. Square images look best.
                    </p>
                  </div>
                </div>
              </div>

              {/* Doctor Signature */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Doctor signature
                </Label>
                <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-center min-h-24 bg-slate-50/50">
                  {signature ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        signature.startsWith("http")
                          ? signature
                          : configuration().backendUrl + signature
                      }
                      alt="Doctor signature preview"
                      className="max-h-20 object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">
                      No signature uploaded
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label
                    htmlFor="edit-doctor-signature"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-50"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload signature</span>
                  </label>
                  <input
                    id="edit-doctor-signature"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files?.length) {
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append("file", file);
                        try {
                          const { data } = await toast.promise(
                            api.post("/uploads", formData),
                            {
                              loading: "Uploading signature...",
                              success: "Signature uploaded successfully",
                              error: ({ response }) =>
                                response?.data?.message || "Upload failed",
                            }
                          );
                          setSignature(data?.data?.url);
                        } catch (err) {}
                      }
                    }}
                  />
                  {signature && (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      className="h-8 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                      onClick={() => setSignature(null)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Tip: Use a transparent PNG on white background for best results.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-(--color-synapse-light) hover:bg-(--color-synapse-dark) text-white text-xs font-bold px-5 cursor-pointer flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// SOFT DELETE ALERT BOX (ALERT DIALOG)
// ==========================================
interface DeleteDoctorDialogProps {
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteDoctorDialog({
  doctor,
  open,
  onOpenChange,
  onSuccess,
}: DeleteDoctorDialogProps) {
  const [loading, setLoading] = useState(false);

  const doctorDisplayName = doctor?.name
    ? doctor.name.toLowerCase().startsWith("dr")
      ? doctor.name
      : `Dr. ${doctor.name}`
    : "Doctor";

  const handleConfirmDelete = async () => {
    if (!doctor) return;

    setLoading(true);
    try {
      await api.delete(`/users/${doctor._id}`);
      toast.success(`${doctorDisplayName} has been soft-deleted.`);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete doctor.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-2xl p-6 border-slate-200 shadow-xl">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="text-base font-bold text-slate-900">
            Delete Doctor Record?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-slate-700">{doctorDisplayName}</span>? This action will mark the doctor as inactive and remove them from active consultation selections.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 flex items-center justify-end gap-2">
          <AlertDialogCancel
            disabled={loading}
            className="rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirmDelete();
            }}
            disabled={loading}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 cursor-pointer flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Delete Doctor
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
