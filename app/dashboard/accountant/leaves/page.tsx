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
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  User,
  Users,
  XCircle,
  AlertCircle,
  FileText,
  Loader2,
  HeartHandshake,
  Pill,
  FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { fDate } from "@/lib/fDateAndTime";

const LEAVE_TYPES = [
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Maternity / Paternity Leave",
  "Unpaid Leave",
  "Other",
] as const;

export interface LeaveItem {
  _id: string;
  employee: {
    _id: string;
    name: string;
    role: string;
    employeeId?: string;
    phone?: string;
    email?: string;
    designation?: string;
    inCharge?: boolean;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  appliedDate: string;
  approvedBy?: string;
  approvalNote?: string;
  createdAt?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; color: string }
> = {
  Pending: {
    label: "Pending Review",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    color: "text-amber-600",
  },
  Approved: {
    label: "Approved",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    color: "text-emerald-600",
  },
  Rejected: {
    label: "Rejected",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    color: "text-rose-600",
  },
  Cancelled: {
    label: "Cancelled",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    color: "text-slate-500",
  },
};

export default function ReceptionLeavesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");

  // Modal states
  const [openApplyModal, setOpenApplyModal] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveItem | null>(null);
  const [statusDecision, setStatusDecision] = useState<"Approved" | "Rejected">(
    "Approved"
  );
  const [decisionNote, setDecisionNote] = useState("");

  // Apply Form State
  const [formEmployee, setFormEmployee] = useState("");
  const [formLeaveType, setFormLeaveType] = useState<string>("Casual Leave");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formDays, setFormDays] = useState("1");
  const [formReason, setFormReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch active employees for selection dropdown
  const { data: employeeData } = useSWR<{ data: any[] }>("/employee?status=Active", {
    revalidateOnFocus: false,
  });
  const activeEmployees = employeeData?.data || [];

  // Fetch leaves
  const queryUrl = `/employee-leave?search=${encodeURIComponent(search)}${
    statusFilter !== "all" ? `&status=${encodeURIComponent(statusFilter)}` : ""
  }${roleFilter !== "all" ? `&role=${encodeURIComponent(roleFilter)}` : ""}${
    employeeFilter !== "all"
      ? `&employeeId=${encodeURIComponent(employeeFilter)}`
      : ""
  }`;

  const { data, isLoading, mutate } = useSWR<{
    message: string;
    data: LeaveItem[];
  }>(queryUrl, { revalidateOnFocus: false });

  const leaves = data?.data || [];

  // Fetch Stats
  const { data: statsData } = useSWR<{ data: any }>(
    "/employee-leave/stats",
    { revalidateOnFocus: false }
  );
  const stats = statsData?.data || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalDaysApproved: 0,
  };

  // Helper to calculate days automatically when dates change
  const handleDateChange = (start: string, end: string) => {
    setFormStartDate(start);
    setFormEndDate(end);
    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      if (d2 >= d1) {
        const diffDays =
          Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setFormDays(diffDays.toString());
      }
    }
  };

  const handleOpenApply = () => {
    setFormEmployee(activeEmployees[0]?._id || "");
    setFormLeaveType("Casual Leave");
    const today = new Date().toISOString().split("T")[0];
    setFormStartDate(today);
    setFormEndDate(today);
    setFormDays("1");
    setFormReason("");
    setOpenApplyModal(true);
  };

  const handleSubmitApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployee) {
      toast.error("Please select an employee");
      return;
    }
    if (!formStartDate || !formEndDate) {
      toast.error("Please select start and end dates");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/employee-leave", {
        employee: formEmployee,
        leaveType: formLeaveType,
        startDate: formStartDate,
        endDate: formEndDate,
        daysCount: parseFloat(formDays) || 1,
        reason: formReason.trim(),
      });

      toast.success("Leave application submitted successfully");
      await mutate();
      setOpenApplyModal(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to submit leave application"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenStatusModal = (
    leave: LeaveItem,
    decision: "Approved" | "Rejected"
  ) => {
    setSelectedLeave(leave);
    setStatusDecision(decision);
    setDecisionNote("");
    setOpenStatusModal(true);
  };

  const handleConfirmStatus = async () => {
    if (!selectedLeave) return;
    try {
      setIsSubmitting(true);
      await api.patch(`/employee-leave/${selectedLeave._id}/status`, {
        status: statusDecision,
        approvalNote: decisionNote.trim(),
      });

      toast.success(`Leave request marked as ${statusDecision}`);
      await mutate();
      setOpenStatusModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update leave status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLeave = async (id: string) => {
    if (!confirm("Are you sure you want to cancel and delete this leave record?"))
      return;
    try {
      await api.delete(`/employee-leave/${id}`);
      toast.success("Leave record removed");
      await mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete leave");
    }
  };

  const statusTabs = [
    { key: "all", label: "All Requests", count: stats.total },
    { key: "Pending", label: "Pending", count: stats.pending },
    { key: "Approved", label: "Approved", count: stats.approved },
    { key: "Rejected", label: "Rejected", count: stats.rejected },
  ];

  return (
    <AppShell>
      <TooltipProvider>
        <div className="p-5 flex flex-col gap-5 w-full min-h-[calc(100vh-67px)]">
          {/* Header */}
          <PharmacyHeader
            title="Employee Leave Management"
            subtitle="Review, approve, and track staff leaves, casual time-off, and sick leaves."
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
                onClick={handleOpenApply}
                className="flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shadow-md bg-(--color-synapse-light) cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" /> Apply Leave
              </Button>
            </div>
          </PharmacyHeader>

          {/* Stats KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total Applications
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-0.5">
                    {stats.total}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-(--color-synapse-light) flex items-center justify-center">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Pending Approvals
                  </p>
                  <h3 className="text-2xl font-bold text-amber-600 mt-0.5">
                    {stats.pending}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Approved Leaves
                  </p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">
                    {stats.approved}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total Days Approved
                  </p>
                  <h3 className="text-2xl font-bold text-blue-600 mt-0.5">
                    {stats.totalDaysApproved} days
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            {/* Status tabs */}
            <div className="relative inline-flex items-center gap-1 text-xs bg-slate-100 border border-slate-200 rounded-xl p-1 overflow-x-auto">
              {statusTabs.map((tab) => {
                const active = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
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
                        layoutId="reception-leave-status-pill"
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
                          : "bg-slate-200 text-slate-600"
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Staff Filter */}
            <div className="flex items-center gap-2.5 flex-wrap md:flex-nowrap">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search staff, reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-(--color-synapse-light) h-9"
                />
              </div>

              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="w-36 h-9 rounded-xl border-slate-200 text-xs cursor-pointer">
                  <SelectValue placeholder="All Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {activeEmployees.map((emp) => (
                    <SelectItem key={emp._id} value={emp._id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(search || statusFilter !== "all" || employeeFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setEmployeeFilter("all");
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 rounded-xl h-9 px-2.5"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Leaves Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-slate-900 hover:bg-slate-900">
                <TableRow className="bg-slate-900 hover:bg-slate-900 border-b-0">
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 pl-6">
                    Staff Member
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                    Leave Type
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                    Dates & Duration
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                    Reason
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
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                    >
                      <TableCell className="py-4 pl-6">
                        <div className="h-5 w-36 bg-slate-100 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-24 bg-slate-100 rounded-full animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="h-6 w-20 bg-slate-100 rounded-full mx-auto animate-pulse" />
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="h-8 w-20 bg-slate-100 rounded ml-auto animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : leaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-56 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 py-6">
                        <div className="h-12 w-12 rounded-2xl bg-purple-50 text-(--color-synapse-light) flex items-center justify-center mb-2">
                          <CalendarDays className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                          No leave applications found
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm mt-0.5 mb-3">
                          {search || statusFilter !== "all"
                            ? "Try adjusting your search criteria or status filter."
                            : "Click 'Apply Leave' above to record a new staff leave request."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leaves.map((leave, idx) => {
                    const statusCfg =
                      STATUS_CONFIG[leave.status] || STATUS_CONFIG.Pending;
                    return (
                      <TableRow
                        key={leave._id}
                        className={cn(
                          "group transition-colors",
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                        )}
                      >
                        {/* Employee */}
                        <TableCell className="py-3.5 pl-6 font-medium text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                              {(leave.employee?.name || "E").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                <span>{leave.employee?.name || "Unknown"}</span>
                                {leave.employee?.role && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 font-medium text-slate-500 bg-slate-50"
                                  >
                                    {leave.employee.role}
                                  </Badge>
                                )}
                              </div>
                              {leave.employee?.employeeId && (
                                <p className="text-[11px] text-slate-400 font-mono">
                                  ID: {leave.employee.employeeId}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Leave Type */}
                        <TableCell className="py-3.5">
                          <Badge
                            variant="secondary"
                            className="text-xs font-semibold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/80"
                          >
                            {leave.leaveType}
                          </Badge>
                        </TableCell>

                        {/* Dates & Duration */}
                        <TableCell className="py-3.5 text-xs text-slate-700">
                          <div className="flex items-center gap-2 font-medium">
                            <span>{fDate(leave.startDate)}</span>
                            <span className="text-slate-400">→</span>
                            <span>{fDate(leave.endDate)}</span>
                            <span className="px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                              {leave.daysCount} {leave.daysCount === 1 ? "day" : "days"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Applied: {fDate(leave.appliedDate || leave.createdAt)}
                          </p>
                        </TableCell>

                        {/* Reason */}
                        <TableCell className="py-3.5 text-xs text-slate-600 max-w-xs">
                          <p className="line-clamp-2">{leave.reason || "—"}</p>
                          {leave.approvalNote && (
                            <p className="text-[11px] text-amber-700 bg-amber-50/80 px-1.5 py-0.5 rounded mt-1 border border-amber-200/60">
                              Note: {leave.approvalNote}
                            </p>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3.5 text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 shadow-2xs",
                              statusCfg.badge
                            )}
                          >
                            {leave.status}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3.5 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {leave.status === "Pending" && (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleOpenStatusModal(leave, "Approved")
                                      }
                                      className="h-7 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1 shadow-2xs cursor-pointer"
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      <span>Approve</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Approve Leave</p>
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleOpenStatusModal(leave, "Rejected")
                                      }
                                      className="h-7 px-2.5 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-lg gap-1 cursor-pointer"
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                      <span>Reject</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Reject Leave</p>
                                  </TooltipContent>
                                </Tooltip>
                              </>
                            )}

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteLeave(leave._id)}
                                  className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Record</p>
                              </TooltipContent>
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

        {/* ── Apply Leave Dialog ────────────────────────────────────────── */}
        <Dialog open={openApplyModal} onOpenChange={setOpenApplyModal}>
          <DialogContent className="max-w-md p-6 rounded-2xl border-slate-100 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-(--color-synapse-light)" />
                <span>Apply for Staff Leave</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Submit an employee leave request with date duration and reason.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitApply} className="space-y-4 pt-2">
              {/* Employee Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Select Staff Member <span className="text-rose-500">*</span>
                </Label>
                <Select value={formEmployee} onValueChange={setFormEmployee}>
                  <SelectTrigger className="rounded-xl border-slate-200 text-sm h-10 cursor-pointer">
                    <SelectValue placeholder="Choose employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeEmployees.map((emp) => (
                      <SelectItem key={emp._id} value={emp._id}>
                        {emp.name} ({emp.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Leave Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Leave Type <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formLeaveType}
                  onValueChange={setFormLeaveType}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 text-sm h-10 cursor-pointer">
                    <SelectValue placeholder="Leave Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAVE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Start Date <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formStartDate}
                    onChange={(e) =>
                      handleDateChange(e.target.value, formEndDate)
                    }
                    required
                    className="rounded-xl border-slate-200 text-sm h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    End Date <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formEndDate}
                    onChange={(e) =>
                      handleDateChange(formStartDate, e.target.value)
                    }
                    required
                    className="rounded-xl border-slate-200 text-sm h-10"
                  />
                </div>
              </div>

              {/* Days count */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Total Days Count (e.g. 1, 2, 0.5 for half day)
                </Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={formDays}
                  onChange={(e) => setFormDays(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 text-sm h-10 tabular-nums font-bold"
                />
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Reason for Leave
                </Label>
                <Textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="e.g. Personal emergency, fever, family function..."
                  rows={2}
                  className="rounded-xl border-slate-200 text-sm resize-none"
                />
              </div>

              <DialogFooter className="gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenApplyModal(false)}
                  disabled={isSubmitting}
                  className="rounded-xl border-slate-200 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-(--color-synapse-light) hover:opacity-90 text-white font-bold px-5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Status Decision Dialog ────────────────────────────────────── */}
        <Dialog open={openStatusModal} onOpenChange={setOpenStatusModal}>
          <DialogContent className="max-w-md p-6 rounded-2xl border-slate-100 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {statusDecision === "Approved" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-600" />
                )}
                <span>
                  {statusDecision === "Approved" ? "Approve Leave" : "Reject Leave"}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {selectedLeave?.employee?.name} • {selectedLeave?.leaveType} (
                {selectedLeave?.daysCount} days)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Decision Note / Remarks (Optional)
                </Label>
                <Textarea
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  placeholder={
                    statusDecision === "Approved"
                      ? "e.g. Approved by management, duty covered by staff"
                      : "e.g. Critical shift coverage required"
                  }
                  rows={3}
                  className="rounded-xl border-slate-200 text-sm resize-none"
                />
              </div>

              <DialogFooter className="gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenStatusModal(false)}
                  disabled={isSubmitting}
                  className="rounded-xl border-slate-200 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmStatus}
                  disabled={isSubmitting}
                  className={cn(
                    "rounded-xl font-bold px-5 text-white shadow-xs",
                    statusDecision === "Approved"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Confirm ${statusDecision}`
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </AppShell>
  );
}
