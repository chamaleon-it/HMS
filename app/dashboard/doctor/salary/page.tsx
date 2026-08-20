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
  IndianRupee,
  CreditCard,
  Banknote,
  Smartphone,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Printer,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Users,
  Edit,
  Building,
  CheckCheck,
  AlertCircle,
  Loader2,
  Sparkles,
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
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { formatINR } from "@/lib/fNumber";
import { fDate } from "@/lib/fDateAndTime";
import PayslipPrintModal, {
  PayslipData,
} from "@/components/dashboard/salary/PayslipPrintModal";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEARS = [2024, 2025, 2026, 2027];

export default function DoctorSalaryPage() {
  const currentDate = new Date();
  const currentMonthName = MONTHS[currentDate.getMonth()];
  const currentYearNum = currentDate.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthName);
  const [selectedYear, setSelectedYear] = useState<number>(currentYearNum);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Modal States
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openPayModal, setOpenPayModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<PayslipData | null>(null);
  const [printSalary, setPrintSalary] = useState<PayslipData | null>(null);
  const [openPrintModal, setOpenPrintModal] = useState(false);

  // Batch Generation State
  const [isGenerating, setIsGenerating] = useState(false);

  // Pay Form State
  const [payMethod, setPayMethod] = useState<string>("Bank Transfer");
  const [payRef, setPayRef] = useState<string>("");
  const [payNote, setPayNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create / Edit Slip State
  const [formEmployee, setFormEmployee] = useState<string>("");
  const [formBasicPay, setFormBasicPay] = useState<string>("0");
  const [formHourlySalary, setFormHourlySalary] = useState<string>("0");
  const [formHoursWorked, setFormHoursWorked] = useState<string>("0");
  const [formCommission, setFormCommission] = useState<string>("0");
  const [formAllowances, setFormAllowances] = useState<string>("0");
  const [formBonus, setFormBonus] = useState<string>("0");
  const [formDeductions, setFormDeductions] = useState<string>("0");
  const [formUnpaidLeaves, setFormUnpaidLeaves] = useState<string>("0");

  // Fetch active employees
  const { data: employeeData } = useSWR<{ data: any[] }>("/employee?status=Active", {
    revalidateOnFocus: false,
  });
  const activeEmployees = employeeData?.data || [];

  // Fetch salaries with SWR
  const queryUrl = `/employee-salary?month=${selectedMonth}&year=${selectedYear}${
    statusFilter !== "all" ? `&status=${statusFilter}` : ""
  }${roleFilter !== "all" ? `&role=${roleFilter}` : ""}${
    search ? `&search=${encodeURIComponent(search)}` : ""
  }`;

  const { data, isLoading, mutate } = useSWR<{
    message: string;
    data: PayslipData[];
  }>(queryUrl, { revalidateOnFocus: false });

  const salaries = data?.data || [];

  // Fetch Stats
  const { data: statsData } = useSWR<{ data: any }>(
    `/employee-salary/stats?month=${selectedMonth}&year=${selectedYear}`,
    { revalidateOnFocus: false }
  );
  const stats = statsData?.data || {
    totalCount: 0,
    totalPayroll: 0,
    totalPaid: 0,
    totalPending: 0,
    paidCount: 0,
    pendingCount: 0,
  };

  // Live calculation for Slip Form
  const calcGross =
    (parseFloat(formBasicPay) || 0) +
    (parseFloat(formHourlySalary) || 0) * (parseFloat(formHoursWorked) || 0) +
    (parseFloat(formCommission) || 0) +
    (parseFloat(formAllowances) || 0) +
    (parseFloat(formBonus) || 0);

  const calcUnpaidDeduction =
    (parseFloat(formUnpaidLeaves) || 0) *
    ((parseFloat(formBasicPay) || 0) > 0
      ? (parseFloat(formBasicPay) || 0) / 30
      : 0);

  const calcNet = Math.max(
    0,
    calcGross - (parseFloat(formDeductions) || 0) - calcUnpaidDeduction
  );

  const handleGenerateBatch = async () => {
    try {
      setIsGenerating(true);
      const res = await api.post("/employee-salary/generate-batch", {
        month: selectedMonth,
        year: selectedYear,
        role: roleFilter !== "all" ? roleFilter : undefined,
      });

      toast.success(res.data?.message || "Payroll generated successfully");
      await mutate();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to generate monthly payroll"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchApprovedUnpaidLeaves = async (
    empId: string,
    month: string,
    year: number
  ) => {
    try {
      const res = await api.get(
        `/employee-salary/unpaid-leaves?employeeId=${empId}&month=${month}&year=${year}`
      );
      return res.data?.data?.unpaidLeaves ?? 0;
    } catch {
      return 0;
    }
  };

  const handleOpenCreate = async () => {
    const firstEmp = activeEmployees[0];
    const empId = firstEmp?._id || "";
    setFormEmployee(empId);
    setFormBasicPay((firstEmp?.basicPay || 0).toString());
    setFormHourlySalary((firstEmp?.hourlySalary || 0).toString());
    setFormHoursWorked("0");
    setFormCommission((firstEmp?.commission || 0).toString());
    setFormAllowances("0");
    setFormBonus("0");
    setFormDeductions("0");
    setOpenCreateModal(true);

    if (empId) {
      const unpaid = await fetchApprovedUnpaidLeaves(
        empId,
        selectedMonth,
        selectedYear
      );
      setFormUnpaidLeaves(unpaid.toString());
    } else {
      setFormUnpaidLeaves("0");
    }
  };

  const handleEmployeeSelectChange = async (empId: string) => {
    setFormEmployee(empId);
    const emp = activeEmployees.find((e) => e._id === empId);
    if (emp) {
      setFormBasicPay((emp.basicPay || 0).toString());
      setFormHourlySalary((emp.hourlySalary || 0).toString());
      setFormCommission((emp.commission || 0).toString());
      const unpaid = await fetchApprovedUnpaidLeaves(
        empId,
        selectedMonth,
        selectedYear
      );
      setFormUnpaidLeaves(unpaid.toString());
    }
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployee) {
      toast.error("Please select an employee");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/employee-salary", {
        employee: formEmployee,
        month: selectedMonth,
        year: selectedYear,
        basicPay: parseFloat(formBasicPay) || 0,
        hourlySalary: parseFloat(formHourlySalary) || 0,
        hoursWorked: parseFloat(formHoursWorked) || 0,
        commission: parseFloat(formCommission) || 0,
        allowances: parseFloat(formAllowances) || 0,
        bonus: parseFloat(formBonus) || 0,
        deductions: parseFloat(formDeductions) || 0,
        unpaidLeaves: parseFloat(formUnpaidLeaves) || 0,
      });

      toast.success("Salary slip created successfully");
      await mutate();
      setOpenCreateModal(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to create salary slip"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = async (item: PayslipData) => {
    setSelectedSalary(item);
    setFormBasicPay((item.basicPay || 0).toString());
    setFormHourlySalary((item.hourlySalary || 0).toString());
    setFormHoursWorked((item.hoursWorked || 0).toString());
    setFormCommission((item.commission || 0).toString());
    setFormAllowances((item.allowances || 0).toString());
    setFormBonus((item.bonus || 0).toString());
    setFormDeductions((item.deductions || 0).toString());
    setOpenEditModal(true);

    if (item.employee?._id) {
      const unpaid = await fetchApprovedUnpaidLeaves(
        item.employee._id,
        item.month,
        item.year
      );
      setFormUnpaidLeaves((unpaid || item.unpaidLeaves || 0).toString());
    } else {
      setFormUnpaidLeaves((item.unpaidLeaves || 0).toString());
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalary) return;

    try {
      setIsSubmitting(true);
      await api.patch(`/employee-salary/${selectedSalary._id}`, {
        basicPay: parseFloat(formBasicPay) || 0,
        hourlySalary: parseFloat(formHourlySalary) || 0,
        hoursWorked: parseFloat(formHoursWorked) || 0,
        commission: parseFloat(formCommission) || 0,
        allowances: parseFloat(formAllowances) || 0,
        bonus: parseFloat(formBonus) || 0,
        deductions: parseFloat(formDeductions) || 0,
        unpaidLeaves: parseFloat(formUnpaidLeaves) || 0,
        unpaidLeaveDeduction: calcUnpaidDeduction,
      });

      toast.success("Salary slip updated successfully");
      await mutate();
      setOpenEditModal(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update salary slip"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPay = (item: PayslipData) => {
    setSelectedSalary(item);
    setPayMethod("Bank Transfer");
    setPayRef("");
    setPayNote("");
    setOpenPayModal(true);
  };

  const handleSubmitPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalary) return;

    try {
      setIsSubmitting(true);
      await api.patch(`/employee-salary/${selectedSalary._id}/pay`, {
        paymentMethod: payMethod,
        transactionReference: payRef.trim(),
        note: payNote.trim(),
      });

      toast.success(
        `Salary payout of ${formatINR(selectedSalary.netSalary)} processed successfully`
      );
      await mutate();
      setOpenPayModal(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to process salary payment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintSlip = (item: PayslipData) => {
    setPrintSalary(item);
    setOpenPrintModal(true);
  };

  const handleDeleteSalary = async (id: string) => {
    if (!confirm("Are you sure you want to delete this salary record?")) return;
    try {
      await api.delete(`/employee-salary/${id}`);
      toast.success("Salary slip deleted");
      await mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete salary slip");
    }
  };

  return (
    <AppShell>
      <TooltipProvider>
        <div className="p-5 flex flex-col gap-5 w-full min-h-[calc(100vh-67px)]">
          {/* Header */}
          <PharmacyHeader
            title="Employee Salary & Payroll Management"
            subtitle="Generate monthly payroll, disburse staff payouts, and print professional payslips."
          >
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="outline"
                onClick={() => mutate()}
                className="flex items-center gap-1.5 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer text-xs h-9"
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
                />
                <span>Refresh</span>
              </Button>

              <Button
                onClick={handleGenerateBatch}
                disabled={isGenerating}
                variant="outline"
                className="flex items-center gap-1.5 rounded-xl border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs h-9 shadow-2xs cursor-pointer"
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                )}
                <span>Generate {selectedMonth} Payroll</span>
              </Button>

              <Button
                onClick={handleOpenCreate}
                className="flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 shadow-md bg-(--color-synapse-light) cursor-pointer h-9"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Add Custom Slip
              </Button>
            </div>
          </PharmacyHeader>

          {/* Month/Year selector & Stats KPI Cards */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            {/* Period Pickers */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mr-1">
                <Calendar className="h-4 w-4 text-(--color-synapse-light)" />
                <span>Period:</span>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-36 h-9 rounded-xl border-slate-200 text-xs font-bold cursor-pointer">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedYear.toString()}
                onValueChange={(y) => setSelectedYear(parseInt(y))}
              >
                <SelectTrigger className="w-24 h-9 rounded-xl border-slate-200 text-xs font-bold cursor-pointer">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 lg:max-w-2xl">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Total Staff
                </p>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">
                  {stats.totalCount}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-center">
                <p className="text-[10px] uppercase font-bold text-blue-700">
                  Total Payroll
                </p>
                <p className="text-base font-extrabold text-blue-900 mt-0.5 tabular-nums">
                  {formatINR(stats.totalPayroll)}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-center">
                <p className="text-[10px] uppercase font-bold text-emerald-700">
                  Disbursed
                </p>
                <p className="text-base font-extrabold text-emerald-800 mt-0.5 tabular-nums">
                  {formatINR(stats.totalPaid)}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-center">
                <p className="text-[10px] uppercase font-bold text-amber-700">
                  Pending ({stats.pendingCount})
                </p>
                <p className="text-base font-extrabold text-amber-800 mt-0.5 tabular-nums">
                  {formatINR(stats.totalPending)}
                </p>
              </div>
            </div>
          </div>

          {/* Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-9 rounded-xl border-slate-200 text-xs font-medium cursor-pointer">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-36 h-9 rounded-xl border-slate-200 text-xs font-medium cursor-pointer">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Pharmacist">Pharmacists</SelectItem>
                  <SelectItem value="Technician">Technicians</SelectItem>
                  <SelectItem value="Therapist">Therapists</SelectItem>
                </SelectContent>
              </Select>

              {(statusFilter !== "all" || roleFilter !== "all" || search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setRoleFilter("all");
                    setSearch("");
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 rounded-xl h-9 px-2.5"
                >
                  Reset
                </Button>
              )}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search staff, ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-(--color-synapse-light) h-9"
              />
            </div>
          </div>

          {/* Salary Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-slate-900 hover:bg-slate-900">
                <TableRow className="bg-slate-900 hover:bg-slate-900 border-b-0">
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 pl-6">
                    Employee
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                    Role
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 text-right">
                    Basic Pay
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 text-right">
                    Hours / Comm.
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 text-right">
                    Gross Salary
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 text-right">
                    Deductions
                  </TableHead>
                  <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 text-right">
                    Net Salary
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
                        <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-20 bg-slate-100 rounded ml-auto animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-20 bg-slate-100 rounded ml-auto animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-20 bg-slate-100 rounded ml-auto animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-20 bg-slate-100 rounded ml-auto animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-24 bg-slate-100 rounded ml-auto animate-pulse" />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="h-6 w-16 bg-slate-100 rounded-full mx-auto animate-pulse" />
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="h-8 w-24 bg-slate-100 rounded ml-auto animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : salaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-56 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 py-6">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                          <IndianRupee className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                          No salary records for {selectedMonth} {selectedYear}
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm mt-0.5 mb-3">
                          Click "Generate {selectedMonth} Payroll" to
                          auto-create monthly slips for all active staff.
                        </p>
                        <Button
                          onClick={handleGenerateBatch}
                          disabled={isGenerating}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Generate Payroll Now</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  salaries.map((s, idx) => {
                    const isPaid = s.paymentStatus === "Paid";
                    const totalDed =
                      (s.deductions || 0) + (s.unpaidLeaveDeduction || 0);

                    return (
                      <TableRow
                        key={s._id}
                        className={cn(
                          "group transition-colors",
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                        )}
                      >
                        {/* Employee */}
                        <TableCell className="py-3.5 pl-6 font-medium text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                              {(s.employee?.name || "E").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">
                                {s.employee?.name || "Staff Member"}
                              </div>
                              {s.employee?.employeeId && (
                                <p className="text-[11px] text-slate-400 font-mono">
                                  ID: {s.employee.employeeId}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Role */}
                        <TableCell className="py-3.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold uppercase px-2 py-0.5"
                          >
                            {s.employee?.role || "Staff"}
                          </Badge>
                        </TableCell>

                        {/* Basic Pay */}
                        <TableCell className="py-3.5 text-right font-medium tabular-nums text-slate-700 text-xs">
                          {formatINR(s.basicPay || 0)}
                        </TableCell>

                        {/* Hours / Comm */}
                        <TableCell className="py-3.5 text-right text-xs">
                          <div className="space-y-0.5">
                            {Boolean(s.hoursWorked > 0) && (
                              <div className="text-[11px] text-blue-700 font-semibold tabular-nums">
                                +{formatINR(s.hourlyPayTotal || 0)}{" "}
                                <span className="text-[10px] font-normal text-slate-400">
                                  ({s.hoursWorked}h)
                                </span>
                              </div>
                            )}
                            {Boolean(s.commissionAmount > 0) && (
                              <div className="text-[11px] text-purple-700 font-semibold tabular-nums">
                                +{formatINR(s.commissionAmount || 0)}{" "}
                                <span className="text-[10px] font-normal text-slate-400">
                                  (Comm)
                                </span>
                              </div>
                            )}
                            {!s.hoursWorked && !s.commissionAmount && (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Gross Salary */}
                        <TableCell className="py-3.5 text-right font-bold tabular-nums text-slate-800 text-xs">
                          {formatINR(s.grossSalary || 0)}
                        </TableCell>

                        {/* Deductions */}
                        <TableCell className="py-3.5 text-right text-xs">
                          <div className="space-y-0.5">
                            <div className="font-semibold tabular-nums text-rose-600">
                              {totalDed > 0 ? `-${formatINR(totalDed)}` : "₹0"}
                            </div>
                            {Boolean(s.unpaidLeaves > 0) && (
                              <div className="text-[10px] text-rose-500 font-medium whitespace-nowrap">
                                ({s.unpaidLeaves}d unpaid: -{formatINR(s.unpaidLeaveDeduction || 0)})
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Net Salary */}
                        <TableCell className="py-3.5 text-right font-black tabular-nums text-emerald-700 text-sm">
                          {formatINR(s.netSalary || 0)}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3.5 text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5",
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            )}
                          >
                            {s.paymentStatus}
                          </Badge>
                          {isPaid && s.paymentMethod && (
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                              via {s.paymentMethod}
                            </p>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3.5 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isPaid ? (
                              <Button
                                size="sm"
                                onClick={() => handleOpenPay(s)}
                                className="h-7 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1 shadow-2xs cursor-pointer"
                              >
                                <Banknote className="h-3.5 w-3.5" />
                                <span>Pay</span>
                              </Button>
                            ) : (
                              <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                                Paid ✓
                              </Badge>
                            )}

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handlePrintSlip(s)}
                                  className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Print Payslip</p>
                              </TooltipContent>
                            </Tooltip>

                            {!isPaid && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenEdit(s)}
                                    className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Adjust Slip</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteSalary(s._id)}
                                  className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Slip</p>
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

        {/* ── Pay Salary Modal ─────────────────────────────────────────── */}
        <Dialog open={openPayModal} onOpenChange={setOpenPayModal}>
          <DialogContent className="max-w-md p-6 rounded-2xl border-slate-100 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Banknote className="h-5 w-5 text-emerald-600" />
                <span>Process Salary Payment</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Disburse salary to {selectedSalary?.employee?.name} for{" "}
                {selectedSalary?.month} {selectedSalary?.year}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitPay} className="space-y-4 pt-2">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-700">
                    Net Payable Amount
                  </p>
                  <p className="text-xl font-black text-emerald-900 tabular-nums">
                    {formatINR(selectedSalary?.netSalary || 0)}
                  </p>
                </div>
                <Badge className="bg-emerald-200 text-emerald-900 border-emerald-300 font-bold">
                  {selectedSalary?.month} {selectedSalary?.year}
                </Badge>
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Payment Method <span className="text-rose-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "Bank Transfer", icon: Building },
                    { key: "UPI", icon: Smartphone },
                    { key: "Cash", icon: Banknote },
                    { key: "Cheque", icon: CreditCard },
                  ].map(({ key, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPayMethod(key)}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer",
                        payMethod === key
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{key}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction Ref */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Transaction / Cheque / UTR Ref Number
                </Label>
                <Input
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. UTR-987654321, CHQ-00123"
                  className="rounded-xl border-slate-200 text-sm h-10 font-mono"
                />
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Remarks / Notes (Optional)
                </Label>
                <Input
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="e.g. Cleared via HDFC Bank"
                  className="rounded-xl border-slate-200 text-sm h-10"
                />
              </div>

              <DialogFooter className="gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenPayModal(false)}
                  disabled={isSubmitting}
                  className="rounded-xl font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        Confirm Payout ({formatINR(selectedSalary?.netSalary || 0)})
                      </span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Create Custom Slip Modal ─────────────────────────────────── */}
        <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border-slate-100 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-(--color-synapse-light)" />
                <span>Create Salary Slip</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Generate a custom salary slip for {selectedMonth} {selectedYear}
                .
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitCreate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Select Staff Member <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formEmployee}
                  onValueChange={handleEmployeeSelectChange}
                >
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

              {/* Earnings Inputs */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Earnings Breakdown
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Basic Pay (₹)
                    </Label>
                    <Input
                      type="number"
                      value={formBasicPay}
                      onChange={(e) => setFormBasicPay(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Hourly Rate (₹)
                    </Label>
                    <Input
                      type="number"
                      value={formHourlySalary}
                      onChange={(e) => setFormHourlySalary(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Hours Worked
                    </Label>
                    <Input
                      type="number"
                      value={formHoursWorked}
                      onChange={(e) => setFormHoursWorked(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Commission (₹)
                    </Label>
                    <Input
                      type="number"
                      value={formCommission}
                      onChange={(e) => setFormCommission(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Allowances (₹)
                    </Label>
                    <Input
                      type="number"
                      value={formAllowances}
                      onChange={(e) => setFormAllowances(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Bonus (₹)
                    </Label>
                    <Input
                      type="number"
                      value={formBonus}
                      onChange={(e) => setFormBonus(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions Inputs */}
              <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 space-y-3">
                <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  Deductions
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Unpaid Leaves (Days)
                    </Label>
                    <Input
                      type="number"
                      value={formUnpaidLeaves}
                      onChange={(e) => setFormUnpaidLeaves(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Other Deductions / Tax (₹)
                    </Label>
                    <Input
                      type="number"
                      value={formDeductions}
                      onChange={(e) => setFormDeductions(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600">Gross: {formatINR(calcGross)}</span>
                  <span className="text-rose-600 ml-2">
                    Ded: -{formatINR((parseFloat(formDeductions) || 0) + calcUnpaidDeduction)}
                  </span>
                </div>
                <div className="font-black text-emerald-800 text-base tabular-nums">
                  Net: {formatINR(calcNet)}
                </div>
              </div>

              <DialogFooter className="gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenCreateModal(false)}
                  disabled={isSubmitting}
                  className="rounded-xl font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-(--color-synapse-light) hover:opacity-90 text-white font-bold px-5"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create Salary Slip"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Edit Salary Slip Modal ───────────────────────────────────── */}
        <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border-slate-100 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit className="h-5 w-5 text-(--color-synapse-light)" />
                <span>Adjust Salary Slip</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {selectedSalary?.employee?.name} • {selectedSalary?.month}{" "}
                {selectedSalary?.year}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitEdit} className="space-y-4 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Earnings
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Basic Pay (₹)
                    </Label>
                    <Input
                      type="number"
                      value={formBasicPay}
                      onChange={(e) => setFormBasicPay(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Hourly Rate (₹)
                    </Label>
                    <Input
                      type="number"
                      value={formHourlySalary}
                      onChange={(e) => setFormHourlySalary(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Hours Worked
                    </Label>
                    <Input
                      type="number"
                      value={formHoursWorked}
                      onChange={(e) => setFormHoursWorked(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Commission (₹)
                    </Label>
                    <Input
                      type="number"
                      value={formCommission}
                      onChange={(e) => setFormCommission(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Allowances (₹)
                    </Label>
                    <Input
                      type="number"
                      value={formAllowances}
                      onChange={(e) => setFormAllowances(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Bonus (₹)
                    </Label>
                    <Input
                      type="number"
                      value={formBonus}
                      onChange={(e) => setFormBonus(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 space-y-3">
                <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  Deductions
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Unpaid Leaves (Days)
                    </Label>
                    <Input
                      type="number"
                      value={formUnpaidLeaves}
                      onChange={(e) => setFormUnpaidLeaves(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Other Deductions (₹)
                    </Label>
                    <Input
                      type="number"
                      value={formDeductions}
                      onChange={(e) => setFormDeductions(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-9 tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600">Gross: {formatINR(calcGross)}</span>
                  <span className="text-rose-600 ml-2">
                    Ded: -{formatINR((parseFloat(formDeductions) || 0) + calcUnpaidDeduction)}
                  </span>
                </div>
                <div className="font-black text-emerald-800 text-base tabular-nums">
                  Updated Net: {formatINR(calcNet)}
                </div>
              </div>

              <DialogFooter className="gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenEditModal(false)}
                  disabled={isSubmitting}
                  className="rounded-xl font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Payslip Print Dialog ─────────────────────────────────────── */}
        <PayslipPrintModal
          open={openPrintModal}
          onOpenChange={setOpenPrintModal}
          data={printSalary}
        />
      </TooltipProvider>
    </AppShell>
  );
}
