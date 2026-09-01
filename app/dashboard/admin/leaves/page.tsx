"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import AdminHeader from "../components/AdminHeader";
import useSWR from "swr";
import api from "@/lib/axios";
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  XCircle,
  Pill,
  HeartHandshake,
  FlaskConical,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { fDate } from "@/lib/fDateAndTime";
import { useSearchParams } from "next/navigation";

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

function AdminLeavesContent() {
  const searchParams = useSearchParams();
  const initialEmployeeId = searchParams.get("employeeId") || "all";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState(initialEmployeeId);

  // Status Dialog State
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveItem | null>(null);
  const [statusDecision, setStatusDecision] = useState<"Approved" | "Rejected">(
    "Approved"
  );
  const [decisionNote, setDecisionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch active employees
  const { data: employeeData } = useSWR<{ data: any[] }>("/employee", {
    revalidateOnFocus: false,
  });
  const allEmployees = employeeData?.data || [];

  // Fetch leaves
  const queryUrl = `/employee-leave?search=${encodeURIComponent(search)}${statusFilter !== "all" ? `&status=${encodeURIComponent(statusFilter)}` : ""
    }${roleFilter !== "all" ? `&role=${encodeURIComponent(roleFilter)}` : ""}${employeeFilter !== "all"
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
        approvedBy: "Admin",
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
    if (!confirm("Are you sure you want to delete this leave record?")) return;
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
      <div className="p-6 space-y-6">
        <AdminHeader
          title="Staff Leave Management"
          subtitle="Hospital-wide leave requests, absence tracking, and management approvals."
        >
          <Button
            variant="outline"
            onClick={() => mutate()}
            className="rounded-xl border-slate-200 text-xs font-semibold gap-1.5"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>
        </AdminHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Leaves
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
                  Pending Review
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
                  Approved
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
                  Total Approved Days
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative inline-flex items-center gap-1 text-xs bg-slate-100 border border-slate-200 rounded-xl p-1 overflow-x-auto">
            {statusTabs.map((tab) => {
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition cursor-pointer font-medium shrink-0",
                    active ? "text-white" : "text-slate-600 hover:text-slate-900"
                  )}
                  type="button"
                >
                  {active && (
                    <motion.span
                      layoutId="admin-leave-status-pill"
                      className="absolute inset-0 rounded-lg bg-(--color-synapse-light)"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  <span
                    className={cn(
                      "relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                      active ? "bg-white/25 text-white" : "bg-slate-200 text-slate-600"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="relative w-full sm:w-64">
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
                {allEmployees.map((emp) => (
                  <SelectItem key={emp._id} value={emp._id}>
                    {emp.name} ({emp.role})
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

        {/* Table */}
        <div className="bg-white border rounded-2xl overflow-hidden shadow-md shadow-slate-200/50 overflow-x-auto">
          <Table className="min-w-fit">
            <TableHeader className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark)">
              <TableRow className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) border-b-0">
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 pl-6">
                  Staff Member
                </TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                  Role
                </TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                  Leave Type
                </TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                  Dates & Duration
                </TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                  Reason / Notes
                </TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 text-center">
                  Status
                </TableHead>
                {/* <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 pr-6 text-right">
                  Actions
                </TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                  >
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j} className="py-3.5 px-4">
                        <div className="h-5 w-full animate-pulse bg-slate-100 rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : leaves.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-36 text-center text-slate-400 bg-white"
                  >
                    No leave requests found.
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
                        idx % 2 === 0
                          ? "bg-white hover:bg-slate-50/80"
                          : "bg-slate-50/50 hover:bg-slate-100/70"
                      )}
                    >
                      <TableCell className="py-3.5 pl-6 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                            {(leave.employee?.name || "E").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {leave.employee?.name || "Unknown"}
                            </div>
                            {leave.employee?.employeeId && (
                              <p className="text-[11px] text-slate-400 font-mono">
                                ID: {leave.employee.employeeId}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold uppercase px-2 py-0.5"
                        >
                          {leave.employee?.role || "Staff"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <Badge
                          variant="secondary"
                          className="text-xs font-semibold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/80"
                        >
                          {leave.leaveType}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5 text-xs text-slate-700">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span>{fDate(leave.startDate)}</span>
                          <span className="text-slate-400">→</span>
                          <span>{fDate(leave.endDate)}</span>
                          <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                            {leave.daysCount}d
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 text-xs text-slate-600 max-w-xs">
                        <p className="line-clamp-2">{leave.reason || "—"}</p>
                        {leave.approvalNote && (
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            Note: {leave.approvalNote}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5",
                            statusCfg.badge
                          )}
                        >
                          {leave.status}
                        </Badge>
                      </TableCell>

                      {/* <TableCell className="py-3.5 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {leave.status === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleOpenStatusModal(leave, "Approved")
                                }
                                className="h-7 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Approve</span>
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleOpenStatusModal(leave, "Rejected")
                                }
                                className="h-7 px-2.5 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-lg gap-1"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </Button>
                            </>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteLeave(leave._id)}
                            className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell> */}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Status Decision Dialog */}
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
                  placeholder="e.g. Approved by Admin"
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
                  {isSubmitting ? "Updating..." : `Confirm ${statusDecision}`}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

export default function AdminLeavesPage() {
  return (
    <React.Suspense fallback={null}>
      <AdminLeavesContent />
    </React.Suspense>
  );
}
