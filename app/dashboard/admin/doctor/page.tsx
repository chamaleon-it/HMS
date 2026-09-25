"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import useSWR from "swr";
import api from "@/lib/axios";
import { formatINR } from "@/lib/fNumber";
import { fDate } from "@/lib/fDateAndTime";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Stethoscope,
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  ShieldAlert,
  Upload,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Building2,
  GraduationCap,
  FileSignature,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";

interface Round {
  label: string;
  start: string;
  end: string;
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  hospital?: string;
  qualification?: string;
  specialization?: string;
  designation?: string;
  signature?: string;
  profilePic?: string;
  status: string;
  availability?: {
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    days?: string[];
    rounds?: Round[];
    slotIntervalMinutes?: number;
  };
  createdAt?: string;
}

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AdminDoctorPage() {
  const { data: response, isLoading, mutate } = useSWR<{
    data: Doctor[];
    message: string;
  }>("/admin/doctors");

  const doctors = response?.data || [];

  const [search, setSearch] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [openModal, setOpenModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formHospital, setFormHospital] = useState("");
  const [formQualification, setFormQualification] = useState("");
  const [formSpecialization, setFormSpecialization] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formSlotInterval, setFormSlotInterval] = useState(15);
  const [formStatus, setFormStatus] = useState("Active");
  const [formProfilePic, setFormProfilePic] = useState("");
  const [formSignature, setFormSignature] = useState("");

  // Availability states
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formEndTime, setFormEndTime] = useState("17:00");
  const [formDays, setFormDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]);
  const [formRounds, setFormRounds] = useState<Round[]>([]);

  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset form
  const resetForm = () => {
    setEditingDoctor(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormPhone("");
    setFormHospital("");
    setFormQualification("");
    setFormSpecialization("");
    setFormDesignation("");
    setFormSlotInterval(15);
    setFormStatus("Active"); // Default active on creation
    setFormProfilePic("");
    setFormSignature("");
    setFormStartDate("");
    setFormEndDate("");
    setFormStartTime("09:00");
    setFormEndTime("17:00");
    setFormDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    setFormRounds([]);
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpenModal(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setFormName(doc.name || "");
    setFormEmail(doc.email || "");
    setFormPassword("");
    setFormPhone(doc.phoneNumber || "");
    setFormHospital(doc.hospital || "");
    setFormQualification(doc.qualification || "");
    setFormSpecialization(doc.specialization || "");
    setFormDesignation(doc.designation || "");
    setFormSlotInterval(doc.availability?.slotIntervalMinutes || 15);
    setFormStatus(doc.status || "Active");
    setFormProfilePic(doc.profilePic || "");
    setFormSignature(doc.signature || "");

    const avail = doc.availability;
    setFormStartDate(avail?.startDate ? avail.startDate.slice(0, 10) : "");
    setFormEndDate(avail?.endDate ? avail.endDate.slice(0, 10) : "");
    setFormStartTime(avail?.startTime || "09:00");
    setFormEndTime(avail?.endTime || "17:00");
    setFormDays(avail?.days && avail.days.length ? avail.days : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    setFormRounds(avail?.rounds || []);

    setOpenModal(true);
  };

  // Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "pic" | "sig") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    if (type === "pic") setUploadingPic(true);
    else setUploadingSig(true);

    try {
      const res = await api.post("/uploads", formData);
      const url = res.data?.data?.url;
      if (url) {
        if (type === "pic") setFormProfilePic(url);
        else setFormSignature(url);
        toast.success(`${type === "pic" ? "Photo" : "Signature"} uploaded`);
      }
    } catch (err: any) {
      toast.error("File upload failed");
    } finally {
      if (type === "pic") setUploadingPic(false);
      else setUploadingSig(false);
    }
  };

  // Toggle days
  const toggleDay = (day: string) => {
    if (formDays.includes(day)) {
      setFormDays(formDays.filter((d) => d !== day));
    } else {
      setFormDays([...formDays, day]);
    }
  };

  // Add round
  const addRound = () => {
    setFormRounds([...formRounds, { label: "Ward Rounds", start: "11:00", end: "12:00" }]);
  };

  const removeRound = (index: number) => {
    if (!confirm("Remove this round/session from the consultation schedule?")) return;
    setFormRounds(formRounds.filter((_, i) => i !== index));
  };

  const clearSchedule = async () => {
    if (!editingDoctor) {
      if (!confirm("Clear consultation hours and rounds on this form?")) return;
      setFormStartDate("");
      setFormEndDate("");
      setFormStartTime("09:00");
      setFormEndTime("17:00");
      setFormDays([]);
      setFormRounds([]);
      return;
    }
    if (!confirm("Delete this doctor's consultation schedule? Existing appointments are not removed.")) return;
    try {
      await api.delete(`/admin/doctors/${editingDoctor._id}/availability`);
      toast.success("Consultation schedule cleared");
      setFormStartDate("");
      setFormEndDate("");
      setFormDays([]);
      setFormRounds([]);
      mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to clear schedule");
    }
  };

  const updateRound = (index: number, field: keyof Round, value: string) => {
    const updated = [...formRounds];
    updated[index][field] = value;
    setFormRounds(updated);
  };

  // Save handler
  const handleSave = async () => {
    if (!formName.trim() || !formEmail.trim()) {
      toast.error("Doctor name and email are required");
      return;
    }

    if (!editingDoctor && !formPassword.trim()) {
      toast.error("Password is required for new doctor account");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        name: formName.trim(),
        email: formEmail.trim(),
        phoneNumber: formPhone.trim() || undefined,
        hospital: formHospital.trim() || undefined,
        qualification: formQualification.trim() || undefined,
        specialization: formSpecialization.trim() || undefined,
        designation: formDesignation.trim() || undefined,
        status: formStatus,
        profilePic: formProfilePic || undefined,
        signature: formSignature || undefined,
        availability: {
          startDate: formStartDate || undefined,
          endDate: formEndDate || undefined,
          startTime: formStartTime,
          endTime: formEndTime,
          days: formDays,
          rounds: formRounds,
          slotIntervalMinutes: formSlotInterval,
        },
      };

      if (formPassword.trim()) {
        payload.password = formPassword.trim();
      }

      if (editingDoctor) {
        await api.patch(`/admin/doctors/${editingDoctor._id}`, payload);
        toast.success("Doctor details updated successfully");
      } else {
        await api.post("/admin/doctors", payload);
        toast.success("Doctor created successfully");
      }

      setOpenModal(false);
      resetForm();
      mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save doctor");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete doctor
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove Dr. ${name}?`)) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      toast.success("Doctor removed");
      mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete doctor");
    }
  };

  // Filtered doctors
  const filteredDoctors = doctors.filter((doc) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      doc.name?.toLowerCase().includes(q) ||
      doc.email?.toLowerCase().includes(q) ||
      doc.qualification?.toLowerCase().includes(q) ||
      doc.specialization?.toLowerCase().includes(q) ||
      doc.phoneNumber?.includes(q);

    const matchesSpec =
      filterSpecialization === "all" || doc.specialization === filterSpecialization;

    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;

    return matchesSearch && matchesSpec && matchesStatus;
  });

  const specializations = Array.from(
    new Set(doctors.map((d) => d.specialization).filter(Boolean))
  );

  return (
    <AppShell>
      <div className="p-5 min-h-[calc(100vh-67px)] flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <h1 className="text-2xl font-bold text-slate-900">Doctor Management</h1>
            </div>
            <p className="text-sm text-slate-500">
              Manage doctor profiles, qualifications, specializations, clinical hours, and rounds
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer font-medium"
          >
            <Plus className="w-4 h-4 mr-2" /> Add New Doctor
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 rounded-2xl border bg-blue-50/60 border-blue-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                Total Doctors
              </p>
              <h3 className="text-2xl font-bold text-blue-950">{doctors.length}</h3>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl border bg-emerald-50/60 border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Active Staff
              </p>
              <h3 className="text-2xl font-bold text-emerald-950">
                {doctors.filter((d) => d.status === "Active").length}
              </h3>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl border bg-purple-50/60 border-purple-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-800 uppercase tracking-wider">
                Specialties Available
              </p>
              <h3 className="text-2xl font-bold text-purple-950">{specializations.length}</h3>
            </div>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] text-xs h-9 bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>

            {/* Specialization Filter */}
            <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
              <SelectTrigger className="w-[180px] text-xs h-9 bg-white">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec!}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              placeholder="Search by name, qualification, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-slate-50/50"
            />
          </div>
        </div>

        {/* Doctors Grid / Cards */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">Loading doctor profiles...</div>
        ) : filteredDoctors.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white border rounded-2xl">
            No doctors found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => {
              const avail = doc.availability;
              const hasRounds = avail?.rounds && avail.rounds.length > 0;

              return (
                <Card
                  key={doc._id}
                  className="rounded-2xl border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between bg-white"
                >
                  {/* Top Bar with Status */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-14 h-14 rounded-2xl border-2 border-indigo-100 shadow-xs">
                          <AvatarImage src={doc.profilePic || ""} alt={doc.name} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg rounded-2xl">
                            {doc.name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                            Dr. {doc.name}
                          </h3>
                          <p className="text-xs font-semibold text-indigo-600">
                            {doc.qualification || "MBBS"} • {doc.specialization || "General Medicine"}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {doc.hospital || "Main Hospital"}
                          </p>
                        </div>
                      </div>

                      <Badge
                        className={`text-[11px] font-semibold ${
                          doc.status === "Active"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : doc.status === "Pending"
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {doc.status || "Active"}
                      </Badge>
                    </div>

                    {/* Contact Details */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.email}</span>
                      </span>
                      <span className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{doc.phoneNumber || "No phone"}</span>
                      </span>
                    </div>

                    {/* Schedule & Rounds */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          Hours:
                        </span>
                        <span className="font-mono text-[11px]">
                          {avail?.startTime || "09:00"} - {avail?.endTime || "17:00"}
                        </span>
                      </div>

                      {avail?.days && avail.days.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Days:
                          </span>
                          <span className="text-[11px] font-medium text-slate-700 truncate max-w-[160px]">
                            {avail.days.map((d) => d.slice(0, 3)).join(", ")}
                          </span>
                        </div>
                      )}

                      {hasRounds && (
                        <div className="pt-1 border-t border-slate-200/60">
                          <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Rounds ({avail.rounds!.length}):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {avail.rounds!.map((r, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-100"
                              >
                                {r.label}: {r.start}-{r.end}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {doc.signature && (
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <FileSignature className="w-3 h-3 text-emerald-500" />
                          Signature on file
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(doc)}
                        className="h-8 gap-1 text-xs cursor-pointer hover:bg-slate-100"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc._id, doc.name)}
                        className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add / Edit Doctor Dialog */}
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-indigo-600" />
                {editingDoctor ? `Edit Dr. ${editingDoctor.name}` : "Add New Doctor Profile"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-3 text-sm">
              {/* Personal Details */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-1.5 border-b pb-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-500" /> 1. Basic Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="docName">Full Name *</Label>
                    <Input
                      id="docName"
                      placeholder="e.g. Alexander Fleming"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="docEmail">Email Address *</Label>
                    <Input
                      id="docEmail"
                      type="email"
                      placeholder="doctor@hospital.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="docPass">
                      {editingDoctor ? "New Password (leave blank to keep)" : "Password *"}
                    </Label>
                    <Input
                      id="docPass"
                      type="password"
                      placeholder="Min 6 characters"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="docPhone">Phone Number</Label>
                    <Input
                      id="docPhone"
                      placeholder="+91 9876543210"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="docHospital">Hospital / Department</Label>
                    <Input
                      id="docHospital"
                      placeholder="e.g. City General Hospital"
                      value={formHospital}
                      onChange={(e) => setFormHospital(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="docStatus">Account Status *</Label>
                    <Select value={formStatus} onValueChange={setFormStatus}>
                      <SelectTrigger id="docStatus" className="mt-1">
                        <SelectValue placeholder="Choose status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active (Default)</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Qualifications & Specializations */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-1.5 border-b pb-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-500" /> 2. Professional Qualifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="docQual">Qualifications *</Label>
                    <Input
                      id="docQual"
                      placeholder="e.g. MBBS, MD, MS, FRCS"
                      value={formQualification}
                      onChange={(e) => setFormQualification(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="docSpec">Specialization *</Label>
                    <Input
                      id="docSpec"
                      placeholder="e.g. Cardiology, Orthopedics, Pediatrics"
                      value={formSpecialization}
                      onChange={(e) => setFormSpecialization(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="docDesig">Designation</Label>
                    <Input
                      id="docDesig"
                      placeholder="e.g. Consultant, Senior Resident"
                      value={formDesignation}
                      onChange={(e) => setFormDesignation(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Media Uploads */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-1.5 border-b pb-1.5">
                  <Upload className="w-4 h-4 text-indigo-500" /> 3. Photo & Digital Signature
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo Upload */}
                  <div className="p-3 border rounded-xl bg-slate-50 space-y-2">
                    <Label className="font-medium">Doctor Photo</Label>
                    <div className="flex items-center gap-3">
                      {formProfilePic ? (
                        <img
                          src={formProfilePic}
                          alt="preview"
                          className="w-12 h-12 rounded-xl object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "pic")}
                        className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      />
                    </div>
                    {uploadingPic && <p className="text-xs text-indigo-600">Uploading photo...</p>}
                  </div>

                  {/* Signature Upload */}
                  <div className="p-3 border rounded-xl bg-slate-50 space-y-2">
                    <Label className="font-medium">Digital Signature</Label>
                    <div className="flex items-center gap-3">
                      {formSignature ? (
                        <img
                          src={formSignature}
                          alt="sig"
                          className="h-10 w-24 object-contain border bg-white rounded p-1"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
                          <FileSignature className="w-5 h-5" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "sig")}
                        className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      />
                    </div>
                    {uploadingSig && <p className="text-xs text-indigo-600">Uploading signature...</p>}
                  </div>
                </div>
              </div>

              {/* Availability & Scheduling */}
              <div>
                <div className="flex items-center justify-between border-b pb-1.5 mb-3">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-500" /> 4. Availability & Working Hours
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearSchedule}
                    className="text-xs h-7 text-red-600"
                  >
                    Clear Schedule
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="slotInterval">Slot Duration (minutes)</Label>
                    <Input
                      id="slotInterval"
                      type="number"
                      min={5}
                      max={120}
                      value={formSlotInterval}
                      onChange={(e) => setFormSlotInterval(Number(e.target.value) || 15)}
                      className="mt-1 max-w-[160px]"
                    />
                  </div>
                  {/* Date Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sDate">Contract Start Date</Label>
                      <Input
                        id="sDate"
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eDate">Contract End Date</Label>
                      <Input
                        id="eDate"
                        type="date"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Appointment Timings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sTime">Appointment Start Time</Label>
                      <Input
                        id="sTime"
                        type="time"
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eTime">Appointment End Time</Label>
                      <Input
                        id="eTime"
                        type="time"
                        value={formEndTime}
                        onChange={(e) => setFormEndTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Working Days */}
                  <div>
                    <Label className="block mb-1.5">Consultation Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_DAYS.map((day) => {
                        const isSelected = formDays.includes(day);
                        return (
                          <button
                            type="button"
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rounds Management */}
              <div>
                <div className="flex items-center justify-between border-b pb-1.5 mb-3">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-500" /> 5. Rounds & Excluded Intervals
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRound}
                    className="text-xs h-7 gap-1 text-indigo-600"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Round
                  </Button>
                </div>

                {formRounds.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No rounds added. (e.g. Ward Rounds, Lunch Break, OT time excluded from booking)
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formRounds.map((round, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 rounded-xl border bg-slate-50"
                      >
                        <div className="flex-1">
                          <Input
                            placeholder="Label (e.g. Ward Rounds)"
                            value={round.label}
                            onChange={(e) => updateRound(idx, "label", e.target.value)}
                            className="h-8 text-xs bg-white"
                          />
                        </div>
                        <div className="w-28">
                          <Input
                            type="time"
                            value={round.start}
                            onChange={(e) => updateRound(idx, "start", e.target.value)}
                            className="h-8 text-xs bg-white"
                          />
                        </div>
                        <span className="text-xs text-slate-400">to</span>
                        <div className="w-28">
                          <Input
                            type="time"
                            value={round.end}
                            onChange={(e) => updateRound(idx, "end", e.target.value)}
                            className="h-8 text-xs bg-white"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRound(idx)}
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {submitting
                  ? "Saving..."
                  : editingDoctor
                  ? "Save Changes"
                  : "Create Doctor Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
