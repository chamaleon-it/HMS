"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import {
  CalendarDays,
  CreditCard,
  FlaskConical,
  Package,
  RefreshCw,
  ShoppingCart,
  Stethoscope,
  TrendingUp,
  Truck,
} from "lucide-react";

import AppShell from "@/components/layout/app-shell";
import PharmacyHeader from "@/app/dashboard/pharmacy/components/PharmacyHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/fNumber";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/context/auth-context";

type ReportSummary = {
  mode: string;
  period: { startDate: string; endDate: string };
  filters: {
    billingType: string;
    paymentStatus: string;
    department: string;
  };
  sales: {
    billCount: number;
    cash: number;
    online: number;
    discount: number;
    revenue: number;
    byType: Record<string, { billCount: number; revenue: number }>;
  };
  purchases: { count: number; total: number; paidOnInvoices: number };
  supplierPayments: { note: string; count: number; paidAmount: number };
  outstanding: { note: string; total: number };
  profit: {
    grossProfit: number;
    netProfit: number;
    grossMarginPct: number;
    netMarginPct: number;
  };
};

function monthInputValue(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function dayInputValue(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"daily" | "monthly">("daily");
  const [date, setDate] = useState(dayInputValue());
  const [month, setMonth] = useState(monthInputValue());
  const [billingType, setBillingType] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [department, setDepartment] = useState("All");

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set("mode", mode);
    if (mode === "daily") p.set("date", date);
    else p.set("month", month);
    if (billingType !== "all") p.set("billingType", billingType);
    if (paymentStatus !== "all") p.set("paymentStatus", paymentStatus);
    if (department !== "All") p.set("department", department);
    return p.toString();
  }, [mode, date, month, billingType, paymentStatus, department]);

  const { data, error, isLoading, mutate } = useSWR<{ data: ReportSummary }>(
    user ? `/admin/reports/summary?${qs}` : null,
  );

  const report = data?.data;

  const cards = [
    {
      label: "Sales revenue",
      value: formatINR(report?.sales.revenue || 0),
      sub: `${report?.sales.billCount || 0} bills`,
      icon: CreditCard,
    },
    {
      label: "Purchases",
      value: formatINR(report?.purchases.total || 0),
      sub: `${report?.purchases.count || 0} invoices`,
      icon: ShoppingCart,
    },
    {
      label: "Supplier payments",
      value: formatINR(report?.supplierPayments.paidAmount || 0),
      sub: `${report?.supplierPayments.count || 0} entries`,
      icon: Truck,
    },
    {
      label: "Outstanding (point-in-time)",
      value: formatINR(report?.outstanding.total || 0),
      sub: "Open supplier dues",
      icon: Package,
    },
    {
      label: "Gross profit",
      value: formatINR(report?.profit.grossProfit || 0),
      sub: `${report?.profit.grossMarginPct ?? 0}% margin`,
      icon: TrendingUp,
    },
    {
      label: "Net profit",
      value: formatINR(report?.profit.netProfit || 0),
      sub: `${report?.profit.netMarginPct ?? 0}% margin`,
      icon: Stethoscope,
    },
  ];

  const typeRows = Object.entries(report?.sales.byType || {});

  return (
    <AppShell>
      <div className="p-5 min-h-[calc(100vh-67px)] flex flex-col gap-6">
        <PharmacyHeader
          title="Daily & Monthly Reports"
          subtitle="Aggregated from existing billing, purchases, supplier payments, and P&L — no invented finance lines."
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label>Mode</Label>
              <div className="mt-1 flex rounded-lg border overflow-hidden">
                <button
                  type="button"
                  className={cn(
                    "px-3 py-2 text-sm",
                    mode === "daily" ? "bg-slate-900 text-white" : "bg-white",
                  )}
                  onClick={() => setMode("daily")}
                >
                  Daily
                </button>
                <button
                  type="button"
                  className={cn(
                    "px-3 py-2 text-sm",
                    mode === "monthly" ? "bg-slate-900 text-white" : "bg-white",
                  )}
                  onClick={() => setMode("monthly")}
                >
                  Monthly
                </button>
              </div>
            </div>
            {mode === "daily" ? (
              <div>
                <Label htmlFor="reportDate">Date</Label>
                <Input
                  id="reportDate"
                  type="date"
                  className="mt-1"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="reportMonth">Month</Label>
                <Input
                  id="reportMonth"
                  type="month"
                  className="mt-1"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
            )}
            <div>
              <Label>Billing type</Label>
              <Select value={billingType} onValueChange={setBillingType}>
                <SelectTrigger className="mt-1 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "all",
                    "Consultation",
                    "Clinical",
                    "Dressing",
                    "Pharmacy",
                    "Lab",
                    "Sale",
                    "Return",
                  ].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === "all" ? "All types" : t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bill status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="mt-1 w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="mt-1 w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="Lab">Lab</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => mutate()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          {report && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              Period {new Date(report.period.startDate).toLocaleString()} →{" "}
              {new Date(report.period.endDate).toLocaleString()}
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Failed to load report summary.
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading report…
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {c.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {c.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{c.sub}</p>
                </div>
                <c.icon className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-slate-50 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-800">
              Sales by billing type
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Bills</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typeRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                    No billing activity in this period.
                  </TableCell>
                </TableRow>
              ) : (
                typeRows.map(([type, row]) => (
                  <TableRow key={type}>
                    <TableCell className="font-medium">{type}</TableCell>
                    <TableCell className="text-right">{row.billCount || 0}</TableCell>
                    <TableCell className="text-right">
                      {formatINR(row.revenue || 0)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {report?.supplierPayments.note && (
            <p className="px-4 py-3 text-[11px] text-slate-500 border-t">
              {report.supplierPayments.note} {report.outstanding.note}
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
