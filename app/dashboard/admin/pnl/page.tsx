"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  Banknote,
  Building2,
  FlaskConical,
  Info,
  Package,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import AppShell from "@/components/layout/app-shell";
import PharmacyHeader from "@/app/dashboard/pharmacy/components/PharmacyHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/auth/context/auth-context";
import { formatINR } from "@/lib/fNumber";
import { cn } from "@/lib/utils";

interface PnlResponse {
  period: { startDate: string; endDate: string };
  revenue: {
    cash: number;
    online: number;
    discount: number;
    pharmacy: number;
    lab: number;
    total: number;
    billCount: number;
  };
  costs: {
    cogs: number;
    unitsSold: number;
    pharmacySalesValue: number;
    consumables: number;
    consumableUnits: number;
    note: string;
  };
  profit: {
    grossProfit: number;
    netProfit: number;
    grossMarginPct: number;
    netMarginPct: number;
  };
}

const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

export default function AdminPnlPage() {
  const { user, loading } = useAuth();

  const now = new Date();
  const [startDate, setStartDate] = useState(
    toInputDate(new Date(now.getFullYear(), now.getMonth(), 1))
  );
  const [endDate, setEndDate] = useState(toInputDate(now));

  const canView = user?.role === "Admin" || user?.role === "Super Admin";

  const { data, isLoading, mutate } = useSWR<{ data: PnlResponse }>(
    canView ? `/admin/pnl?startDate=${startDate}&endDate=${endDate}` : null
  );
  const pnl = data?.data;

  if (!loading && !canView) {
    return (
      <AppShell>
        <div className="p-5 flex min-h-[calc(100vh-67px)] items-center justify-center">
          <div className="max-w-sm rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-center">
            <ShieldAlert className="mx-auto mb-3 h-6 w-6 text-amber-600" />
            <p className="font-semibold text-amber-900">Restricted report</p>
            <p className="mt-1 text-sm text-amber-800/80">
              Profit &amp; Loss is available to Admin and Super Admin accounts only.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-5 min-h-[calc(100vh-67px)]">
        <main className="flex flex-col gap-6">
          <PharmacyHeader
            title="Profit & Loss"
            subtitle="Revenue, cost of goods sold and consumable expense for the selected period"
          >
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1 text-left">
                <Label className="text-[11px] uppercase tracking-widest text-slate-400">
                  From
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 w-[150px]"
                />
              </div>
              <div className="space-y-1 text-left">
                <Label className="text-[11px] uppercase tracking-widest text-slate-400">
                  To
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 w-[150px]"
                />
              </div>
              <Button
                variant="outline"
                className="h-9"
                onClick={() => mutate()}
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")}
                />
                Refresh
              </Button>
            </div>
          </PharmacyHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              tone="emerald"
              icon={<Banknote className="h-4 w-4" />}
              label="Total Revenue"
              value={formatINR(pnl?.revenue.total ?? 0)}
              hint={`${pnl?.revenue.billCount ?? 0} sale bills`}
            />
            <StatCard
              tone="amber"
              icon={<Package className="h-4 w-4" />}
              label="Cost of Goods Sold"
              value={formatINR(pnl?.costs.cogs ?? 0)}
              hint={`${pnl?.costs.unitsSold ?? 0} units sold`}
            />
            <StatCard
              tone="sky"
              icon={<TrendingUp className="h-4 w-4" />}
              label="Gross Profit"
              value={formatINR(pnl?.profit.grossProfit ?? 0)}
              hint={`${pnl?.profit.grossMarginPct ?? 0}% margin`}
            />
            <StatCard
              tone={(pnl?.profit.netProfit ?? 0) < 0 ? "rose" : "indigo"}
              icon={
                (pnl?.profit.netProfit ?? 0) < 0 ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )
              }
              label="Net Profit"
              value={formatINR(pnl?.profit.netProfit ?? 0)}
              hint={`${pnl?.profit.netMarginPct ?? 0}% margin`}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="overflow-hidden rounded-2xl border bg-white/90 shadow-md shadow-slate-200">
              <div className="flex items-center gap-2 border-b bg-slate-50/70 px-4 py-3">
                <Banknote className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-semibold text-slate-800">Revenue</h2>
              </div>
              <Table>
                <TableHeader className="sr-only">
                  <TableRow>
                    <TableHead>Head</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-[15px]">
                  <Row label="Cash collected" value={pnl?.revenue.cash} />
                  <Row label="Online collected" value={pnl?.revenue.online} />
                  <Row
                    label="Pharmacy / counter billing"
                    value={pnl?.revenue.pharmacy}
                    icon={<Building2 className="h-3.5 w-3.5 text-slate-400" />}
                  />
                  <Row
                    label="Lab billing"
                    value={pnl?.revenue.lab}
                    icon={<FlaskConical className="h-3.5 w-3.5 text-slate-400" />}
                  />
                  <Row
                    label="Discounts given"
                    value={pnl?.revenue.discount}
                    muted
                  />
                  <Row label="Total revenue" value={pnl?.revenue.total} strong />
                </TableBody>
              </Table>
            </section>

            <section className="overflow-hidden rounded-2xl border bg-white/90 shadow-md shadow-slate-200">
              <div className="flex items-center gap-2 border-b bg-slate-50/70 px-4 py-3">
                <Package className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-slate-800">
                  Costs &amp; Profit
                </h2>
              </div>
              <Table>
                <TableHeader className="sr-only">
                  <TableRow>
                    <TableHead>Head</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-[15px]">
                  <Row label="Cost of goods sold" value={pnl?.costs.cogs} />
                  <Row
                    label="Pharmacy sales value (at MRP/sale rate)"
                    value={pnl?.costs.pharmacySalesValue}
                    muted
                  />
                  <Row
                    label={`Consumables issued (${pnl?.costs.consumableUnits ?? 0} units)`}
                    value={pnl?.costs.consumables}
                  />
                  <Row label="Gross profit" value={pnl?.profit.grossProfit} strong />
                  <Row label="Net profit" value={pnl?.profit.netProfit} strong />
                </TableBody>
              </Table>
              <div className="flex items-start gap-2 border-t bg-slate-50/60 px-4 py-3 text-xs text-slate-500">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <p>
                  {pnl?.costs.note ??
                    "No other operating expenses are recorded in the system."}{" "}
                  Salaries, rent and utilities are not tracked here, so net profit
                  reflects trading margin only.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </AppShell>
  );
}

const toneStyles = {
  emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-900",
  amber: "bg-amber-50/50 border-amber-100 text-amber-900",
  sky: "bg-sky-50/50 border-sky-100 text-sky-900",
  indigo: "bg-indigo-50/50 border-indigo-100 text-indigo-900",
  rose: "bg-rose-50/50 border-rose-100 text-rose-900",
} as const;

function StatCard({
  tone,
  icon,
  label,
  value,
  hint,
}: {
  tone: keyof typeof toneStyles;
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6 shadow-xs transition-all hover:scale-[1.01]",
        toneStyles[tone]
      )}
    >
      <div className="mb-2 flex items-center gap-2 opacity-70">
        {icon}
        <p className="text-[11px] font-semibold uppercase tracking-widest">
          {label}
        </p>
      </div>
      <h3 className="text-xl font-bold leading-none">{value}</h3>
      {hint && <p className="mt-2 text-[11px] opacity-70">{hint}</p>}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  muted,
  icon,
}: {
  label: string;
  value?: number;
  strong?: boolean;
  muted?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <TableRow className={cn(strong && "bg-slate-50/80")}>
      <TableCell
        className={cn(
          "py-3 pl-4 align-middle",
          strong ? "font-semibold text-slate-900" : "text-slate-600",
          muted && "text-slate-400"
        )}
      >
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
      </TableCell>
      <TableCell
        className={cn(
          "py-3 pr-4 text-right align-middle tabular-nums",
          strong ? "font-bold text-slate-900" : "text-slate-700",
          muted && "text-slate-400"
        )}
      >
        {formatINR(value ?? 0)}
      </TableCell>
    </TableRow>
  );
}
