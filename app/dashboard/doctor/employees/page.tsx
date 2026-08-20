"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import useSWR from "swr";
import api from "@/lib/axios";
import PharmacyHeader from "@/app/dashboard/pharmacy/components/PharmacyHeader";
import { TableSkeleton } from "@/app/dashboard/pharmacy/components/PharmacySkeleton";
import {
  Users,
  UserCheck,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  Sparkles,
  FlaskConical,
  Pill,
  Star,
  SlidersHorizontal,
  IdCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import { formatINR } from "@/lib/fNumber";

const EMPLOYEE_ROLES = ["Pharmacist", "Technician", "Therapist"] as const;
type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

const ROLE_CONFIG: Record<
  EmployeeRole,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    badge: string;
    border: string;
  }
> = {
  Pharmacist: {
    icon: Pill,
    color: "text-blue-600",
    bg: "bg-blue-50",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    border: "border-blue-100",
  },
  Technician: {
    icon: FlaskConical,
    color: "text-amber-600",
    bg: "bg-amber-50",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    border: "border-amber-100",
  },
  Therapist: {
    icon: HeartHandshake,
    color: "text-purple-600",
    bg: "bg-purple-50",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    border: "border-purple-100",
  },
};

export interface EmployeeItem {
  _id: string;
  name: string;
  role: EmployeeRole;
  phone?: string;
  email?: string;
  gender?: string;
  employeeId?: string;
  qualification?: string;
  designation?: string;
  specialization?: string;
  licenseNumber?: string;
  address?: string;
  basicPay?: number;
  hourlySalary?: number;
  commission?: number;
  status: string;
  isDeleted?: boolean;
  inCharge?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modal states
  const [openFormModal, setOpenFormModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeItem | null>(
    null
  );
  const [deleteEmployee, setDeleteEmployee] = useState<EmployeeItem | null>(
    null
  );

  // Form Field States
  const [name, setName] = useState("");
  const [role, setRole] = useState<EmployeeRole>("Pharmacist");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Male");
  const [employeeId, setEmployeeId] = useState("");
  const [qualification, setQualification] = useState("");
  const [designation, setDesignation] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [address, setAddress] = useState("");
  const [basicPay, setBasicPay] = useState("0");
  const [hourlySalary, setHourlySalary] = useState("0");
  const [commission, setCommission] = useState("0");
  const [status, setStatus] = useState("Active");

  // Operation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Employees with SWR
  const queryUrl = `/employee?search=${encodeURIComponent(search)}${
    statusFilter !== "all" ? `&status=${encodeURIComponent(statusFilter)}` : ""
  }${roleFilter !== "all" ? `&role=${encodeURIComponent(roleFilter)}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<{
    message: string;
    data: EmployeeItem[];
  }>(queryUrl, { revalidateOnFocus: false });

  const employees = data?.data || [];

  // Stats calculation
  const totalCount = employees.length;
  const activeCount = employees.filter(
    (e) => e.status?.toLowerCase() === "active"
  ).length;
  const roleCounts = EMPLOYEE_ROLES.reduce(
    (acc, r) => ({
      ...acc,
      [r]: employees.filter((e) => e.role === r).length,
    }),
    {} as Record<EmployeeRole, number>
  );

  // ── Modal handlers ─────────────────────────────────────────────────

  const resetForm = () => {
    setName("");
    setRole("Pharmacist");
    setPhone("");
    setEmail("");
    setGender("Male");
    setEmployeeId("");
    setQualification("");
    setDesignation("");
    setSpecialization("");
    setLicenseNumber("");
    setAddress("");
    setBasicPay("0");
    setHourlySalary("0");
    setCommission("0");
    setStatus("Active");
    setErrorMsg(null);
  };

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    resetForm();
    setOpenFormModal(true);
  };

  const handleOpenEdit = (item: EmployeeItem) => {
    setEditingEmployee(item);
    setName(item.name || "");
    setRole(item.role || "Pharmacist");
    setPhone(item.phone || "");
    setEmail(item.email || "");
    setGender(item.gender || "Male");
    setEmployeeId(item.employeeId || "");
    setQualification(item.qualification || "");
    setDesignation(item.designation || "");
    setSpecialization(item.specialization || "");
    setLicenseNumber(item.licenseNumber || "");
    setAddress(item.address || "");
    setBasicPay((item.basicPay ?? 0).toString());
    setHourlySalary((item.hourlySalary ?? 0).toString());
    setCommission((item.commission ?? 0).toString());
    setStatus(item.status || "Active");
    setErrorMsg(null);
    setOpenFormModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Employee name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: name.trim(),
      role,
      phone: phone.trim(),
      email: email.trim(),
      gender,
      employeeId: employeeId.trim(),
      qualification: qualification.trim(),
      designation: designation.trim(),
      specialization: specialization.trim(),
      licenseNumber: licenseNumber.trim(),
      address: address.trim(),
      basicPay: parseFloat(basicPay) || 0,
      hourlySalary: parseFloat(hourlySalary) || 0,
      commission: parseFloat(commission) || 0,
      status,
    };

    try {
      if (editingEmployee) {
        await api.patch(`/employee/${editingEmployee._id}`, payload);
        setSuccessMsg(`Employee "${payload.name}" updated successfully.`);
      } else {
        await api.post("/employee", payload);
        setSuccessMsg(`Employee "${payload.name}" added successfully.`);
      }
      await mutate();
      setOpenFormModal(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to save employee. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: EmployeeItem) => {
    const nextStatus = item.status === "Active" ? "Inactive" : "Active";
    setTogglingId(item._id);
    try {
      await api.patch(`/employee/${item._id}`, { status: nextStatus });
      await mutate();
    } catch (err: any) {
      console.error("Failed to toggle status", err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteEmployee) return;
    setIsDeleting(true);
    try {
      await api.delete(`/employee/${deleteEmployee._id}`);
      setSuccessMsg(`Employee "${deleteEmployee.name}" deleted.`);
      await mutate();
      setDeleteEmployee(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to delete employee.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkInCharge = async (item: EmployeeItem) => {
    try {
      await api.patch(`/employee/incharge/${item._id}`);
      setSuccessMsg(
        `"${item.name}" is now designated Person In-Charge for ${item.role}s.`
      );
      await mutate();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
    }
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const roleFilterTabs = [
    { key: "all", label: "All Staff", count: totalCount },
    ...EMPLOYEE_ROLES.map((r) => ({
      key: r,
      label: `${r}s`,
      count: roleCounts[r] || 0,
    })),
  ];

  return (
    <AppShell>
      <TooltipProvider>
        <div className="p-5 flex flex-col gap-5 w-full min-h-[calc(100vh-67px)]">
          {/* Banner Alert Messages */}
          {successMsg && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-medium">{successMsg}</span>
            </div>
          )}
          {errorMsg && !openFormModal && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 shadow-sm animate-in fade-in slide-in-from-top-2">
              <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span className="text-sm font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Header */}
          <PharmacyHeader
            title="Employee Management"
            subtitle="Manage hospital staff roster across Pharmacists, Technicians, and Therapists"
          >
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => mutate()}
                className="flex items-center gap-2 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn("h-4 w-4", isLoading && "animate-spin")}
                />
                <span>Refresh</span>
              </Button>
              <Button
                onClick={handleOpenCreate}
                className="flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shadow-md bg-(--color-synapse-light) cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Employee
              </Button>
            </div>
          </PharmacyHeader>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total Staff
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-0.5">
                    {totalCount}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-(--color-synapse-light) flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Active Staff
                  </p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">
                    {activeCount}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            {EMPLOYEE_ROLES.map((r) => {
              const cfg = ROLE_CONFIG[r];
              const Icon = cfg.icon;
              return (
                <Card
                  key={r}
                  className="rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {r}s
                      </p>
                      <h3 className={cn("text-2xl font-bold mt-0.5", cfg.color)}>
                        {roleCounts[r]}
                      </h3>
                    </div>
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center",
                        cfg.bg,
                        cfg.color
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Role Tabs + Filter & Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            {/* Role Filter Tabs */}
            <div className="relative inline-flex items-center gap-1 text-xs bg-slate-100/80 border border-slate-200 rounded-xl p-1 overflow-x-auto">
              {roleFilterTabs.map((tab) => {
                const active = roleFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setRoleFilter(tab.key)}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition cursor-pointer font-medium shrink-0",
                      active
                        ? "text-white"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    )}
                    type="button"
                  >
                    {active && (
                      <motion.span
                        layoutId="doctor-employee-role-pill"
                        className="absolute inset-0 rounded-lg bg-(--color-synapse-light)"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                    <span
                      className={cn(
                        "relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                        active
                          ? "bg-white/25 text-white"
                          : "bg-slate-200/80 text-slate-600"
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Status Filter */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search name, phone, code, license..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-(--color-synapse-light) h-9"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0 hidden sm:inline" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-28 sm:w-32 h-9 rounded-xl border-slate-200 text-xs cursor-pointer">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(search || statusFilter !== "all" || roleFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setRoleFilter("all");
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 rounded-xl h-9 px-2.5"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Employees Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-900 hover:bg-slate-900">
                <TableRow className="bg-slate-900 hover:bg-slate-900 border-b-0">
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 pl-6">
                    Employee
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                    Role
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                    ID / License
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                    Designation & Specialization
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                    Compensation
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                    Contact
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 text-center">
                    Status
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 pr-6 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                    >
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
                          <div className="space-y-1.5">
                            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                            <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="h-6 w-16 bg-slate-100 rounded-full mx-auto animate-pulse" />
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="h-8 w-20 bg-slate-100 rounded ml-auto animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 py-6">
                        <div className="h-14 w-14 rounded-2xl bg-purple-50 text-(--color-synapse-light) flex items-center justify-center mb-3">
                          <Users className="h-7 w-7" />
                        </div>
                        <p className="text-base font-semibold text-slate-800">
                          {search ||
                          statusFilter !== "all" ||
                          roleFilter !== "all"
                            ? "No matching employees found"
                            : "No employees added yet"}
                        </p>
                        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                          {search ||
                          statusFilter !== "all" ||
                          roleFilter !== "all"
                            ? "Try adjusting your search query or status filters."
                            : "Start adding Pharmacists, Technicians, and Therapists to build your clinical team roster."}
                        </p>
                        {!search &&
                          statusFilter === "all" &&
                          roleFilter === "all" && (
                            <Button
                              onClick={handleOpenCreate}
                              size="sm"
                              className="gap-2 rounded-xl bg-(--color-synapse-light) hover:opacity-90 text-white font-bold px-4"
                            >
                              <Plus className="h-4 w-4" /> Add First Employee
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((emp, idx) => {
                    const cfg =
                      ROLE_CONFIG[emp.role] || ROLE_CONFIG.Pharmacist;
                    const RoleIcon = cfg.icon;
                    return (
                      <TableRow
                        key={emp._id}
                        className={cn(
                          "group transition-colors",
                          idx % 2 === 0
                            ? "bg-white hover:bg-purple-50/25"
                            : "bg-slate-50/40 hover:bg-purple-50/35"
                        )}
                      >
                        {/* Name & Avatar */}
                        <TableCell className="py-3.5 pl-6 font-medium text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-linear-to-tr from-(--color-synapse-dark) to-(--color-synapse-light) text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {getInitials(emp.name)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                <span>{emp.name}</span>
                                {emp.inCharge && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-50 border border-amber-200 text-[10px] text-amber-700 font-bold">
                                        <Star className="h-3 w-3 text-amber-500 fill-amber-400" />
                                        In-Charge
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Designated Person In-Charge
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                {emp.gender && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0 font-normal text-slate-500 bg-slate-100 border-slate-200"
                                  >
                                    {emp.gender}
                                  </Badge>
                                )}
                              </div>
                              {emp.qualification && (
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-normal">
                                  <GraduationCap className="h-3 w-3 shrink-0" />
                                  <span>{emp.qualification}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Role Badge */}
                        <TableCell className="py-3.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 gap-1.5",
                              cfg.badge
                            )}
                          >
                            <RoleIcon className="h-3 w-3" />
                            <span>{emp.role}</span>
                          </Badge>
                        </TableCell>

                        {/* Employee ID / License */}
                        <TableCell className="py-3.5 text-xs text-slate-700">
                          <div className="space-y-0.5">
                            {emp.employeeId && (
                              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded w-fit">
                                <IdCard className="h-3 w-3 text-slate-400" />
                                <span>{emp.employeeId}</span>
                              </div>
                            )}
                            {emp.licenseNumber && (
                              <div className="text-[11px] text-slate-500 font-mono">
                                Lic: {emp.licenseNumber}
                              </div>
                            )}
                            {!emp.employeeId && !emp.licenseNumber && (
                              <span className="text-slate-400 italic text-[11px]">
                                —
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Designation & Specialization */}
                        <TableCell className="py-3.5">
                          <div className="text-xs font-medium text-slate-800 flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{emp.designation || emp.role}</span>
                          </div>
                          {emp.specialization && (
                            <div className="text-[11px] text-(--color-synapse-light) font-medium mt-0.5 flex items-center gap-1">
                              <Sparkles className="h-3 w-3 shrink-0" />
                              <span>{emp.specialization}</span>
                            </div>
                          )}
                        </TableCell>

                        {/* Compensation */}
                        <TableCell className="py-3.5 text-xs">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-800 tabular-nums flex items-center gap-1">
                              <span className="text-[10px] uppercase text-slate-400 font-bold">Basic:</span>
                              <span className="text-emerald-700 font-bold">{emp.basicPay ? formatINR(emp.basicPay) : '—'}</span>
                            </div>
                            {(Boolean(emp.hourlySalary) || Boolean(emp.commission)) && (
                              <div className="flex items-center gap-1.5 text-[10px] font-medium flex-wrap mt-0.5">
                                {Boolean(emp.hourlySalary) && (
                                  <span className="text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                    {formatINR(emp.hourlySalary || 0)}/hr
                                  </span>
                                )}
                                {Boolean(emp.commission) && (
                                  <span className="text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                                    Comm: {formatINR(emp.commission || 0)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Contact */}
                        <TableCell className="py-3.5">
                          <div className="space-y-0.5">
                            {emp.phone && (
                              <div className="text-xs text-slate-700 flex items-center gap-1.5 font-mono">
                                <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                                <span>{emp.phone}</span>
                              </div>
                            )}
                            {emp.email && (
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                                <span>{emp.email}</span>
                              </div>
                            )}
                            {!emp.phone && !emp.email && (
                              <span className="text-slate-400 italic text-[11px]">
                                —
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Status Toggle */}
                        <TableCell className="py-3.5 text-center">
                          <div className="inline-flex items-center gap-2">
                            <Switch
                              checked={emp.status === "Active"}
                              disabled={togglingId === emp._id}
                              onCheckedChange={() => handleToggleStatus(emp)}
                              className="scale-85 data-[state=checked]:bg-emerald-500"
                            />
                            <Badge
                              className={cn(
                                "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5",
                                emp.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              )}
                              variant="outline"
                            >
                              {emp.status}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3.5 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMarkInCharge(emp)}
                                  className={cn(
                                    "h-8 w-8 rounded-lg cursor-pointer transition-colors",
                                    emp.inCharge
                                      ? "text-amber-500 hover:bg-amber-50"
                                      : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                  )}
                                >
                                  <Star
                                    className={cn(
                                      "h-3.5 w-3.5",
                                      emp.inCharge && "fill-amber-400"
                                    )}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {emp.inCharge
                                  ? "Currently In-Charge"
                                  : "Mark as In-Charge"}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEdit(emp)}
                                  className="h-8 w-8 text-slate-600 hover:text-(--color-synapse-light) hover:bg-purple-50 rounded-lg cursor-pointer"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Employee</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteEmployee(emp)}
                                  className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Employee</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ── Add / Edit Dialog ──────────────────────────────────────── */}
        <Dialog open={openFormModal} onOpenChange={setOpenFormModal}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border-slate-100 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {editingEmployee ? (
                  <>
                    <Pencil className="h-5 w-5 text-(--color-synapse-light)" />
                    <span>Edit Employee Details</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 text-(--color-synapse-light)" />
                    <span>Add New Employee</span>
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {editingEmployee
                  ? "Update employee information, designation, role, and active status."
                  : "Fill in the details below to add a staff member to the roster."}
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <XCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 pt-2">
              {/* Role Selection Tabs */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Staff Role <span className="text-rose-500">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {EMPLOYEE_ROLES.map((r) => {
                    const cfg = ROLE_CONFIG[r];
                    const Icon = cfg.icon;
                    const isSelected = role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={cn(
                          "flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer",
                          isSelected
                            ? cn("bg-slate-900 text-white border-slate-900 shadow-sm")
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            isSelected ? "text-white" : cfg.color
                          )}
                        />
                        <span>{r}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="emp-name"
                  className="text-xs font-semibold text-slate-700"
                >
                  Full Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="emp-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  required
                  className="rounded-xl border-slate-200 text-sm h-10"
                />
              </div>

              {/* Gender & Employee ID & License */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="emp-gender"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Gender
                  </Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger
                      id="emp-gender"
                      className="rounded-xl border-slate-200 text-xs sm:text-sm h-10"
                    >
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="emp-empId"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Employee ID
                  </Label>
                  <Input
                    id="emp-empId"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. EMP-001"
                    className="rounded-xl border-slate-200 text-sm h-10 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="emp-license"
                    className="text-xs font-semibold text-slate-700"
                  >
                    License No.
                  </Label>
                  <Input
                    id="emp-license"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. PH-12345"
                    className="rounded-xl border-slate-200 text-sm h-10 font-mono"
                  />
                </div>
              </div>

              {/* Designation & Specialization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="emp-designation"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Designation
                  </Label>
                  <Input
                    id="emp-designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Pharmacist, Lab Incharge"
                    className="rounded-xl border-slate-200 text-sm h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="emp-specialization"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Specialization
                  </Label>
                  <Input
                    id="emp-specialization"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Clinical Pharmacy, Hematology"
                    className="rounded-xl border-slate-200 text-sm h-10"
                  />
                </div>
              </div>

              {/* Qualification */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="emp-qualification"
                  className="text-xs font-semibold text-slate-700"
                >
                  Qualification
                </Label>
                <Input
                  id="emp-qualification"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. B.Pharm, M.Pharm, DMLT, BPT"
                  className="rounded-xl border-slate-200 text-sm h-10"
                />
              </div>

              {/* Salary & Compensation Section */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Salary & Compensation Structure
                  </p>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                    Payroll Fields
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="emp-basicPay" className="text-xs font-semibold text-slate-700">
                      Basic Pay (₹/mo)
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                        ₹
                      </span>
                      <Input
                        id="emp-basicPay"
                        type="number"
                        min="0"
                        step="any"
                        value={basicPay}
                        onChange={(e) => setBasicPay(e.target.value)}
                        placeholder="0"
                        className="pl-7 rounded-xl border-slate-200 text-sm h-10 font-bold tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="emp-hourlySalary" className="text-xs font-semibold text-slate-700">
                      Hourly Salary (₹/hr)
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                        ₹
                      </span>
                      <Input
                        id="emp-hourlySalary"
                        type="number"
                        min="0"
                        step="any"
                        value={hourlySalary}
                        onChange={(e) => setHourlySalary(e.target.value)}
                        placeholder="0"
                        className="pl-7 rounded-xl border-slate-200 text-sm h-10 font-bold tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="emp-commission" className="text-xs font-semibold text-slate-700">
                      Commission (₹ or %)
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                        ₹
                      </span>
                      <Input
                        id="emp-commission"
                        type="number"
                        min="0"
                        step="any"
                        value={commission}
                        onChange={(e) => setCommission(e.target.value)}
                        placeholder="0"
                        className="pl-7 rounded-xl border-slate-200 text-sm h-10 font-bold tabular-nums"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="emp-phone"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="emp-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="rounded-xl border-slate-200 text-sm h-10 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="emp-email"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="emp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. staff@hospital.com"
                    className="rounded-xl border-slate-200 text-sm h-10"
                  />
                </div>
              </div>

              {/* Address / Notes */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="emp-address"
                  className="text-xs font-semibold text-slate-700"
                >
                  Address / Notes
                </Label>
                <Textarea
                  id="emp-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter residential address, notes or department details..."
                  rows={2}
                  className="rounded-xl border-slate-200 text-sm resize-none"
                />
              </div>

              {/* Duty Status */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Active Duty Status
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Inactive employees are hidden from everyday operational
                    dropdowns.
                  </p>
                </div>
                <Switch
                  checked={status === "Active"}
                  onCheckedChange={(c) =>
                    setStatus(c ? "Active" : "Inactive")
                  }
                  className="data-[state=checked]:bg-emerald-500 cursor-pointer"
                />
              </div>

              <DialogFooter className="gap-2 pt-3 sm:pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenFormModal(false)}
                  disabled={isSubmitting}
                  className="rounded-xl border-slate-200 text-slate-600 font-semibold px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2 rounded-xl bg-(--color-synapse-light) hover:opacity-90 text-white font-bold px-5 shadow-sm cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : editingEmployee ? (
                    "Update Employee"
                  ) : (
                    "Save Employee"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirmation ─────────────────────────────────────── */}
        <AlertDialog
          open={Boolean(deleteEmployee)}
          onOpenChange={(open) => !open && setDeleteEmployee(null)}
        >
          <AlertDialogContent className="rounded-2xl border-slate-100 shadow-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-rose-500" />
                <span>Delete Employee</span>
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-600">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-slate-900">
                  {deleteEmployee?.name}
                </span>{" "}
                ({deleteEmployee?.role})? They will be soft-deleted and no
                longer appear in operational lists.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel
                disabled={isDeleting}
                className="rounded-xl border-slate-200 font-semibold cursor-pointer"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TooltipProvider>
    </AppShell>
  );
}
