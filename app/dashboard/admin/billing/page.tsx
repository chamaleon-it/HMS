"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import useSWR from "swr";
import { formatINR } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";
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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  DollarSign,
  CreditCard,
  Building2,
  Calendar,
  Eye,
  RefreshCw,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { startOfDay, endOfDay, subDays } from "date-fns";

export default function AdminBillingPage() {
  const [department, setDepartment] = useState<"All" | "Pharmacy" | "Lab">("All");
  const [status, setStatus] = useState<string>("all");
  const [method, setMethod] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [activeDate, setActiveDate] = useState<"Today" | "7 days" | "30 days" | "All Time">("30 days");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(15);

  const [selectedBill, setSelectedBill] = useState<any | null>(null);

  // Calculate dates
  let startDate: string | undefined;
  let endDate: string | undefined;

  if (activeDate === "Today") {
    startDate = startOfDay(new Date()).toISOString();
    endDate = endOfDay(new Date()).toISOString();
  } else if (activeDate === "7 days") {
    startDate = startOfDay(subDays(new Date(), 7)).toISOString();
    endDate = endOfDay(new Date()).toISOString();
  } else if (activeDate === "30 days") {
    startDate = startOfDay(subDays(new Date(), 30)).toISOString();
    endDate = endOfDay(new Date()).toISOString();
  }

  const queryParams = new URLSearchParams();
  queryParams.set("page", String(page));
  queryParams.set("limit", String(limit));
  if (department !== "All") queryParams.set("department", department);
  if (status !== "all") queryParams.set("status", status);
  if (method !== "all") queryParams.set("method", method);
  if (search.trim()) queryParams.set("q", search.trim());
  if (startDate && endDate) {
    queryParams.set("startDate", startDate);
    queryParams.set("endDate", endDate);
  }

  const { data: response, isLoading, mutate } = useSWR<{
    message: string;
    data: {
      data: any[];
      total: number;
      page: number;
      limit: number;
      totals: {
        totalRevenue: number;
        totalCash: number;
        totalOnline: number;
        totalInsurance: number;
      };
    };
  }>(`/admin/billing?${queryParams.toString()}`);

  const bills = response?.data?.data || [];
  const total = response?.data?.total || 0;
  const totals = response?.data?.totals || {
    totalRevenue: 0,
    totalCash: 0,
    totalOnline: 0,
    totalInsurance: 0,
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <AppShell>
      <div className="p-5 min-h-[calc(100vh-67px)] flex flex-col gap-6">
        {/* Header banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h1 className="text-2xl font-bold text-slate-900">
                Hospital Billing Registry
              </h1>
            </div>
            <p className="text-sm text-slate-500">
              Consolidated financial registry across Pharmacy, Pathology & Diagnostics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutate()}
              className="gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 rounded-2xl border bg-emerald-50/60 border-emerald-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800/80">
                Total Billed
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-emerald-950">
              {formatINR(totals.totalRevenue)}
            </h3>
            <p className="text-xs text-emerald-700/80 mt-1">
              Across {total} recorded invoices
            </p>
          </Card>

          <Card className="p-5 rounded-2xl border bg-blue-50/60 border-blue-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-800/80">
                Cash Collections
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-blue-950">
              {formatINR(totals.totalCash)}
            </h3>
            <p className="text-xs text-blue-700/80 mt-1">Direct cash payments</p>
          </Card>

          <Card className="p-5 rounded-2xl border bg-purple-50/60 border-purple-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-800/80">
                Online / UPI / Card
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-purple-950">
              {formatINR(totals.totalOnline)}
            </h3>
            <p className="text-xs text-purple-700/80 mt-1">Digital gateway transactions</p>
          </Card>

          <Card className="p-5 rounded-2xl border bg-amber-50/60 border-amber-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800/80">
                Insurance / TPA
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-amber-950">
              {formatINR(totals.totalInsurance)}
            </h3>
            <p className="text-xs text-amber-700/80 mt-1">Covered & claimed claims</p>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Department Filter Tabs */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/70">
              {(["All", "Pharmacy", "Lab"] as const).map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    setDepartment(dept);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    department === dept
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {dept === "All" ? "All Departments" : dept}
                </button>
              ))}
            </div>

            {/* Date Filters */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/70">
              {(["Today", "7 days", "30 days", "All Time"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setActiveDate(d);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeDate === d
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Status Select */}
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] text-xs h-9 bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Method Select */}
            <Select
              value={method}
              onValueChange={(v) => {
                setMethod(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] text-xs h-9 bg-white">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              placeholder="Search by Bill #, Patient, Phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs rounded-xl bg-slate-50/50"
            />
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader className="bg-slate-700 hover:bg-slate-700">
              <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 px-4 pl-4">
                  Sl No
                </TableHead>
                <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">
                  Invoice #
                </TableHead>
                <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">
                  Date & Time
                </TableHead>
                <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">
                  Patient
                </TableHead>
                <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">
                  Department
                </TableHead>
                <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">
                  Doctor / Billed By
                </TableHead>
                <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 text-right">
                  Cash
                </TableHead>
                <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 text-right">
                  Online
                </TableHead>
                <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 text-right">
                  Insurance
                </TableHead>
                <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 text-right font-bold pr-4">
                  Net Total
                </TableHead>
                <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 text-center">
                  Status
                </TableHead>
                <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 text-right pr-4">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-[14px]">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                      Loading bills...
                    </div>
                  </TableCell>
                </TableRow>
              ) : bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-12 text-slate-400">
                    No billing records found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                bills.map((bill: any, idx: number) => {
                  const netTotal =
                    (bill.cash || 0) + (bill.online || 0) + (bill.insurance || 0);
                  const isLab = bill.user?.role === "Lab" || !!bill.reportId;

                  return (
                    <TableRow
                      key={bill._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }`}
                    >
                      <TableCell className="py-2.5 pl-4 text-slate-500 font-mono text-xs">
                        {(page - 1) * limit + idx + 1}
                      </TableCell>
                      <TableCell className="py-2.5 font-mono font-semibold text-slate-900">
                        {bill.mrn}
                      </TableCell>
                      <TableCell className="py-2.5 text-xs text-slate-500">
                        {fDateandTime(bill.createdAt)}
                      </TableCell>
                      <TableCell className="py-2.5 font-medium text-slate-900">
                        <div>
                          <p>{bill.patient?.name || "Walk-in"}</p>
                          <p className="text-[11px] font-mono text-slate-400">
                            {bill.patient?.mrn || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Badge
                          className={`text-[11px] font-semibold ${
                            isLab
                              ? "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200"
                              : "bg-indigo-100 text-indigo-700 border-indigo-200"
                          }`}
                        >
                          {isLab ? "Lab" : "Pharmacy"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5 text-slate-600 text-xs">
                        <p className="font-medium text-slate-800">
                          {bill.doctor || "Self"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          by {bill.user?.name || "Staff"}
                        </p>
                      </TableCell>
                      <TableCell className="py-2.5 text-right font-medium text-slate-700">
                        {bill.cash ? formatINR(bill.cash) : "-"}
                      </TableCell>
                      <TableCell className="py-2.5 text-right font-medium text-slate-700">
                        {bill.online ? formatINR(bill.online) : "-"}
                      </TableCell>
                      <TableCell className="py-2.5 text-right font-medium text-slate-700">
                        {bill.insurance ? formatINR(bill.insurance) : "-"}
                      </TableCell>
                      <TableCell className="py-2.5 text-right font-bold text-slate-900 pr-4">
                        {formatINR(netTotal)}
                      </TableCell>
                      <TableCell className="py-2.5 text-center">
                        <Badge
                          className={`text-[11px] ${
                            bill.status === "Completed"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-amber-100 text-amber-700 border-amber-200"
                          }`}
                        >
                          {bill.status || "Completed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5 text-right pr-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                          onClick={() => setSelectedBill(bill)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <p>
            Showing {bills.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
            {Math.min(page * limit, total)} of {total} bills
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs cursor-pointer"
            >
              Previous
            </Button>
            <span className="font-semibold px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Bill Details Modal */}
        <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <DialogTitle className="text-xl font-bold">
                  Invoice #{selectedBill?.mrn}
                </DialogTitle>
                <Badge
                  className={
                    selectedBill?.user?.role === "Lab"
                      ? "bg-fuchsia-100 text-fuchsia-700"
                      : "bg-indigo-100 text-indigo-700"
                  }
                >
                  {selectedBill?.user?.role === "Lab" ? "Lab Billing" : "Pharmacy Billing"}
                </Badge>
              </div>
            </DialogHeader>

            {selectedBill && (
              <div className="space-y-5 py-2 text-sm text-slate-700">
                {/* Patient & Staff Details */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Patient</p>
                    <p className="font-bold text-slate-900">{selectedBill.patient?.name || "Walk-in"}</p>
                    <p className="text-xs text-slate-500 font-mono">MRN: {selectedBill.patient?.mrn || "N/A"}</p>
                    <p className="text-xs text-slate-500">{selectedBill.patient?.phone || ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-semibold uppercase">Date & Time</p>
                    <p className="font-semibold text-slate-900">{fDateandTime(selectedBill.createdAt)}</p>
                    <p className="text-xs text-slate-500 mt-1">Doctor: {selectedBill.doctor || "Self"}</p>
                    <p className="text-xs text-slate-500">Billed by: {selectedBill.user?.name || "Staff"}</p>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Billed Items</h4>
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Item / Service</th>
                          <th className="py-2.5 px-3 text-right">Qty</th>
                          <th className="py-2.5 px-3 text-right">Unit Price</th>
                          <th className="py-2.5 px-3 text-right">GST</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selectedBill.items || []).map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-2 px-3 font-medium text-slate-900">{item.name}</td>
                            <td className="py-2 px-3 text-right">{item.quantity || 1}</td>
                            <td className="py-2 px-3 text-right">{formatINR(item.unitPrice || 0)}</td>
                            <td className="py-2 px-3 text-right">{item.gst ? `${item.gst}%` : "-"}</td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900">
                              {formatINR(item.total || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200/70">
                  <div className="flex justify-between text-xs">
                    <span>Cash Payment:</span>
                    <span className="font-medium">{formatINR(selectedBill.cash || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Online / Digital:</span>
                    <span className="font-medium">{formatINR(selectedBill.online || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Insurance / TPA:</span>
                    <span className="font-medium">{formatINR(selectedBill.insurance || 0)}</span>
                  </div>
                  {selectedBill.discount > 0 && (
                    <div className="flex justify-between text-xs text-rose-600">
                      <span>Discount:</span>
                      <span>-{formatINR(selectedBill.discount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-base text-slate-900">
                    <span>Grand Total:</span>
                    <span>
                      {formatINR(
                        (selectedBill.cash || 0) +
                          (selectedBill.online || 0) +
                          (selectedBill.insurance || 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
