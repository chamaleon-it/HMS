"use client";

import React, { useState, useMemo } from "react";
import AppShell from "@/components/layout/app-shell";
import useSWR from "swr";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { formatINR } from "@/lib/fNumber";
import configuration from "@/config/configuration";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PharmacyHeader from "@/app/dashboard/pharmacy/components/PharmacyHeader";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  RefreshCw,
  SlidersHorizontal,
  Users,
  CheckCircle2,
  XCircle,
  Award,
  Phone,
  Mail,
  RotateCcw,
} from "lucide-react";
import {
  Doctor,
  AddDoctorModal,
  EditDoctorModal,
  DeleteDoctorDialog,
  COMMON_SPECIALIZATIONS,
} from "./DoctorDialogs";

export default function ReceptionDoctorsPage() {
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);
  const [restoringDoctorId, setRestoringDoctorId] = useState<string | null>(null);

  // Fetch doctors
  const { data, isLoading, isValidating, mutate } = useSWR<{
    data: Doctor[];
    message: string;
  }>(`/users/doctors?includeDeleted=${includeDeleted}`);

  const doctors = data?.data || [];

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchName = doc.name?.toLowerCase().includes(query);
        const matchUsername = doc.username?.toLowerCase().includes(query);
        const matchEmail = doc.email?.toLowerCase().includes(query);
        const matchPhone = doc.phoneNumber?.toLowerCase().includes(query);
        const matchSpec = doc.specialization?.toLowerCase().includes(query);
        const matchDept = doc.department?.toLowerCase().includes(query);
        const matchLicense = doc.licenseNo?.toLowerCase().includes(query);

        if (
          !matchName &&
          !matchUsername &&
          !matchEmail &&
          !matchPhone &&
          !matchSpec &&
          !matchDept &&
          !matchLicense
        ) {
          return false;
        }
      }

      // Specialty filter
      if (specialtyFilter !== "all") {
        if (doc.specialization !== specialtyFilter) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all") {
        if (doc.status !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [doctors, search, specialtyFilter, statusFilter]);

  // Statistics
  const totalCount = doctors.length;
  const activeCount = doctors.filter((d) => d.status === "Active" && !d.isDeleted).length;
  const inactiveCount = doctors.filter(
    (d) => d.status === "Inactive" || d.isDeleted
  ).length;
  const uniqueSpecialties = useMemo(() => {
    const specs = new Set(
      doctors.map((d) => d.specialization).filter(Boolean)
    );
    return specs.size;
  }, [doctors]);

  // Quick restore doctor if soft deleted / inactive
  const handleRestoreDoctor = async (doc: Doctor) => {
    setRestoringDoctorId(doc._id);
    try {
      await api.patch(`/users/${doc._id}`, {
        isDeleted: false,
        status: "Active",
      });
      toast.success(`Dr. ${doc.name} restored to Active duty.`);
      mutate();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to restore doctor status."
      );
    } finally {
      setRestoringDoctorId(null);
    }
  };

  return (
    <AppShell>
      <TooltipProvider>
        <div className="p-6 space-y-6 w-full">
          {/* Header */}
          <PharmacyHeader
            title="Doctors"
            subtitle="Manage hospital physicians, clinical specialties, consultation fees, and duty status."
          >
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => mutate()}
                disabled={isLoading || isValidating}
                className="flex items-center gap-1.5 h-9 rounded-xl border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isValidating ? "animate-spin text-emerald-600" : ""}`}
                />
                <span>Refresh</span>
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shadow-md bg-(--color-synapse-light) cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Doctor
              </Button>
            </div>
          </PharmacyHeader>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total Doctors
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-0.5">
                    {isLoading ? "—" : totalCount}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Active Doctors
                  </p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">
                    {isLoading ? "—" : activeCount}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Inactive / Off-Duty
                  </p>
                  <h3 className="text-2xl font-bold text-slate-600 mt-0.5">
                    {isLoading ? "—" : inactiveCount}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                  <XCircle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Specialties
                  </p>
                  <h3 className="text-2xl font-bold text-teal-600 mt-0.5">
                    {isLoading ? "—" : uniqueSpecialties}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by doctor name, specialty, contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9.5 rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-emerald-100 h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
              
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-full sm:w-44 h-9 rounded-xl border-slate-200 text-xs cursor-pointer">
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Specialties</SelectItem>
                  {COMMON_SPECIALIZATIONS.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 h-9 rounded-xl border-slate-200 text-xs cursor-pointer">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={includeDeleted ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setIncludeDeleted((prev) => !prev)}
                className={`h-9 text-xs rounded-xl cursor-pointer ${
                  includeDeleted
                    ? "bg-slate-200 text-slate-800 font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {includeDeleted ? "Showing Inactive / Deleted" : "Show Inactive / Deleted"}
              </Button>
            </div>
          </div>

          {/* Doctors Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex-1">
            <Table>
              <TableHeader className="bg-slate-50/75 border-b border-slate-200">
                <TableRow className="bg-slate-50/75 hover:bg-slate-50/75">
                  <TableHead className="w-12 text-xs font-bold text-slate-600 uppercase tracking-wider pl-4">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Doctor Name
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Specialization & Dept
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Contact
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Qualifications
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Fee
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="w-28 text-xs font-bold text-slate-600 uppercase tracking-wider text-center pr-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell className="pl-4 py-4">
                        <div className="h-4 w-4 bg-slate-200 rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-32 bg-slate-200 rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-28 bg-slate-200 rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 bg-slate-200 rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-slate-200 rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-16 bg-slate-200 rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-16 bg-slate-200 rounded-full" />
                      </TableCell>
                      <TableCell className="pr-4 text-center">
                        <div className="h-8 w-16 bg-slate-200 rounded mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Stethoscope className="h-8 w-8 text-slate-300" />
                        <span className="font-semibold text-slate-700">No doctors found</span>
                        <span className="text-xs text-slate-400">
                          {search || specialtyFilter !== "all" || statusFilter !== "all"
                            ? "Try adjusting your search query or filters."
                            : "Click '+ Add Doctor' above to register the first doctor."}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doc, idx) => (
                    <TableRow
                      key={doc._id}
                      className={`hover:bg-slate-50/60 transition-colors border-b border-slate-100 ${
                        doc.isDeleted ? "opacity-75 bg-rose-50/20" : ""
                      }`}
                    >
                      <TableCell className="py-3 pl-4 text-xs text-slate-400 font-medium">
                        {idx + 1}
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-200 shrink-0">
                            {doc.profilePic ? (
                              <AvatarImage
                                src={
                                  doc.profilePic.startsWith("http")
                                    ? doc.profilePic
                                    : configuration().backendUrl + doc.profilePic
                                }
                                alt={doc.name}
                              />
                            ) : null}
                            <AvatarFallback className="bg-emerald-50 text-emerald-700 font-bold text-xs">
                              {doc.name.replace(/^dr\.?\s*/i, "").charAt(0).toUpperCase() || "D"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 text-sm">
                              {doc.name.toLowerCase().startsWith("dr")
                                ? doc.name
                                : `Dr. ${doc.name}`}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              @{doc.username || "n/a"}
                              {doc.designation && ` • ${doc.designation}`}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-slate-700">
                            {doc.specialization || "General Medicine"}
                          </span>
                          {doc.department && (
                            <span className="text-[11px] text-slate-400">
                              {doc.department}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                          {doc.phoneNumber ? (
                            <div className="flex items-center gap-1 text-slate-700">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{doc.phoneNumber}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              No phone
                            </span>
                          )}
                          {doc.email && (
                            <div className="flex items-center gap-1 text-slate-500 text-[11px] truncate max-w-48">
                              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">{doc.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="font-medium text-slate-700">
                            {doc.qualification || "MBBS"}
                          </span>
                          {doc.licenseNo ? (
                            <span className="text-[11px] text-slate-400 font-mono">
                              Lic: {doc.licenseNo}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              No license
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3 font-semibold text-slate-800 text-sm">
                        {formatINR(doc.consultationFee || 0)}
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={
                            doc.status === "Active" && !doc.isDeleted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-2.5 py-0.5"
                              : "bg-slate-100 text-slate-600 border-slate-200 font-semibold px-2.5 py-0.5"
                          }
                        >
                          {doc.isDeleted ? "Soft Deleted" : doc.status || "Active"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 pr-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {doc.isDeleted ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRestoreDoctor(doc)}
                                  disabled={restoringDoctorId === doc._id}
                                  className="h-8 px-2 text-xs text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg cursor-pointer flex items-center gap-1"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  <span>Restore</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reactivate doctor</TooltipContent>
                            </Tooltip>
                          ) : (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingDoctor(doc)}
                                    className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Doctor</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeletingDoctor(doc)}
                                    className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete Doctor</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Modals & Dialogs */}
        <AddDoctorModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSuccess={() => mutate()}
        />

        <EditDoctorModal
          doctor={editingDoctor}
          open={!!editingDoctor}
          onOpenChange={(open) => !open && setEditingDoctor(null)}
          onSuccess={() => mutate()}
        />

        <DeleteDoctorDialog
          doctor={deletingDoctor}
          open={!!deletingDoctor}
          onOpenChange={(open) => !open && setDeletingDoctor(null)}
          onSuccess={() => mutate()}
        />
      </TooltipProvider>
    </AppShell>
  );
}
