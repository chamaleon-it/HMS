"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { formatINR } from "@/lib/fNumber";
import {
  Banknote,
  CreditCard,
  Smartphone,
  PieChart as PieIcon,
  TrendingUp,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PaymentMethodItem {
  name: string; // 'Cash' | 'Card' | 'UPI'
  totalAmount: number;
  incomeAmount: number;
  expenseAmount: number;
  count: number;
  percentage: number;
}

export interface PaymentTrendItem {
  label: string;
  Cash: number;
  Card: number;
  UPI: number;
  total: number;
}

interface PaymentMethodChartProps {
  paymentMethods?: PaymentMethodItem[];
  paymentMethodTrend?: PaymentTrendItem[];
  isLoading?: boolean;
}

const METHOD_CONFIG: Record<
  string,
  {
    label: string;
    icon: any;
    color: string;
    bgSoft: string;
    border: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  Cash: {
    label: "Cash",
    icon: Banknote,
    color: "#10b981", // Emerald
    bgSoft: "bg-emerald-50/70",
    border: "border-emerald-200/80",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
  },
  Card: {
    label: "Card",
    icon: CreditCard,
    color: "#0284c7", // Sky Blue
    bgSoft: "bg-sky-50/70",
    border: "border-sky-200/80",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-800",
  },
  UPI: {
    label: "UPI",
    icon: Smartphone,
    color: "#8b5cf6", // Purple / Violet
    bgSoft: "bg-purple-50/70",
    border: "border-purple-200/80",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-800",
  },
};

type ViewMode = "donut" | "trend" | "flow";

export function PaymentMethodChart({
  paymentMethods = [],
  paymentMethodTrend = [],
  isLoading,
}: PaymentMethodChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("donut");

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 animate-pulse">
        <div className="h-8 bg-slate-100 rounded-xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
        </div>
        <div className="h-72 bg-slate-100 rounded-2xl w-full" />
      </div>
    );
  }

  // Ensure Cash, Card, UPI items exist
  const methodsWithDefaults: PaymentMethodItem[] = ["Cash", "Card", "UPI"].map(
    (name) => {
      const found = paymentMethods.find(
        (m) => m.name.toLowerCase() === name.toLowerCase()
      );
      return (
        found || {
          name,
          totalAmount: 0,
          incomeAmount: 0,
          expenseAmount: 0,
          count: 0,
          percentage: 0,
        }
      );
    }
  );

  const totalVolume = methodsWithDefaults.reduce(
    (sum, m) => sum + m.totalAmount,
    0
  );
  const totalIncome = methodsWithDefaults.reduce(
    (sum, m) => sum + m.incomeAmount,
    0
  );
  const totalExpense = methodsWithDefaults.reduce(
    (sum, m) => sum + m.expenseAmount,
    0
  );

  // Grouped comparison data for Flow view (Income vs Expense per Method)
  const flowData = methodsWithDefaults.map((m) => ({
    name: m.name,
    Income: m.incomeAmount,
    Expense: m.expenseAmount,
    Total: m.totalAmount,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 space-y-6"
    >
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Payment Channel Distribution
              </h3>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Cash • Card • UPI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Real-time settlement volume and multi-channel transaction insights
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("donut")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              viewMode === "donut"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Share & Split</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("flow")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              viewMode === "flow"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>In / Out Flow</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("trend")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              viewMode === "trend"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards for Cash, Card, UPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {methodsWithDefaults.map((m) => {
          const cfg = METHOD_CONFIG[m.name] || METHOD_CONFIG.Cash;
          const Icon = cfg.icon;

          return (
            <div
              key={m.name}
              className={cn(
                "p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden",
                cfg.bgSoft,
                cfg.border
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {m.count} {m.count === 1 ? "transaction" : "transactions"}
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    "text-xs font-extrabold px-2.5 py-0.5 rounded-full border",
                    cfg.badgeBg,
                    cfg.badgeText,
                    cfg.border
                  )}
                >
                  {m.percentage}%
                </span>
              </div>

              <div className="mt-3">
                <div className="text-lg font-black text-slate-900 font-mono tracking-tight">
                  {formatINR(m.totalAmount)}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold font-mono">
                    <ArrowUpRight className="w-3 h-3" />
                    {formatINR(m.incomeAmount)}
                  </span>
                  <span className="flex items-center gap-1 text-rose-600 font-semibold font-mono">
                    <ArrowDownRight className="w-3 h-3" />
                    {formatINR(m.expenseAmount)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Visual Section based on Tab */}
      <AnimatePresence mode="wait">
        {viewMode === "donut" && (
          <motion.div
            key="donut-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2"
          >
            {/* Left: Donut Chart */}
            <div className="lg:col-span-5 h-72 w-full relative flex items-center justify-center">
              {totalVolume === 0 ? (
                <div className="text-xs text-slate-400 font-medium">
                  No payment data in selected range
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={methodsWithDefaults}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="totalAmount"
                      >
                        {methodsWithDefaults.map((entry) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={
                              METHOD_CONFIG[entry.name]?.color || "#64748b"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as PaymentMethodItem;
                            const cfg =
                              METHOD_CONFIG[data.name] || METHOD_CONFIG.Cash;
                            return (
                              <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-xs space-y-1.5 min-w-44">
                                <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: cfg.color }}
                                  />
                                  <span className="font-bold">{data.name}</span>
                                  <span className="text-[10px] text-slate-400 ml-auto font-mono">
                                    {data.percentage}%
                                  </span>
                                </div>
                                <div className="space-y-1 pt-0.5">
                                  <div className="flex justify-between text-slate-300">
                                    <span>Total Volume:</span>
                                    <span className="font-bold text-white font-mono">
                                      {formatINR(data.totalAmount)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-emerald-400">
                                    <span>Income In:</span>
                                    <span className="font-bold font-mono">
                                      {formatINR(data.incomeAmount)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-rose-400">
                                    <span>Expense Out:</span>
                                    <span className="font-bold font-mono">
                                      {formatINR(data.expenseAmount)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Metric */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Volume
                    </span>
                    <span className="text-lg font-black text-slate-900 font-mono tracking-tight">
                      {formatINR(totalVolume)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {methodsWithDefaults.reduce((s, m) => s + m.count, 0)} txns
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Right: Detailed Breakdown Bars */}
            <div className="lg:col-span-7 space-y-4">
              {methodsWithDefaults.map((m) => {
                const cfg = METHOD_CONFIG[m.name] || METHOD_CONFIG.Cash;
                const Icon = cfg.icon;

                return (
                  <div
                    key={`bar-row-${m.name}`}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${cfg.color}20`,
                            color: cfg.color,
                          }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-slate-900">{m.name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {m.count} txns
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatINR(m.totalAmount)}
                        </span>
                        <span
                          className="text-[11px] font-extrabold px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: `${cfg.color}15`,
                            color: cfg.color,
                          }}
                        >
                          {m.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Multi-tier Progress Bar (Income vs Expense) */}
                    <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className="h-full transition-all duration-500 rounded-l-full"
                        style={{
                          width: `${totalVolume > 0 ? (m.incomeAmount / totalVolume) * 100 : 0}%`,
                          backgroundColor: cfg.color,
                        }}
                        title={`Income: ${formatINR(m.incomeAmount)}`}
                      />
                      <div
                        className="h-full transition-all duration-500 rounded-r-full opacity-60"
                        style={{
                          width: `${totalVolume > 0 ? (m.expenseAmount / totalVolume) * 100 : 0}%`,
                          backgroundColor: "#f43f5e",
                        }}
                        title={`Expense: ${formatINR(m.expenseAmount)}`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>
                        Income:{" "}
                        <strong className="text-emerald-700 font-mono">
                          {formatINR(m.incomeAmount)}
                        </strong>
                      </span>
                      <span>
                        Expense:{" "}
                        <strong className="text-rose-600 font-mono">
                          {formatINR(m.expenseAmount)}
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {viewMode === "flow" && (
          <motion.div
            key="flow-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="h-72 w-full pt-2"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={flowData}
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  tickFormatter={(value) =>
                    `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`
                  }
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-xs space-y-1.5 min-w-40">
                          <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">
                            {label} Flow
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <div
                              key={`flow-item-${index}`}
                              className="flex items-center justify-between gap-3"
                            >
                              <span
                                className="font-medium flex items-center gap-1.5"
                                style={{ color: entry.fill }}
                              >
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: entry.fill }}
                                />
                                {entry.name}
                              </span>
                              <span className="font-bold font-mono">
                                {formatINR(Number(entry.value))}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{
                    paddingBottom: "12px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey="Income"
                  name="Income Collection"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="Expense"
                  name="Expense Payout"
                  fill="#f43f5e"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {viewMode === "trend" && (
          <motion.div
            key="trend-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="h-72 w-full pt-2"
          >
            {paymentMethodTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                No timeline data available for the selected date range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={paymentMethodTrend}
                  margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorCard" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorUpi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                    tickFormatter={(value) =>
                      `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`
                    }
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-xs space-y-1.5 min-w-44">
                            <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">
                              {label} Channels
                            </p>
                            {payload.map((entry: any, index: number) => (
                              <div
                                key={`trend-item-${index}`}
                                className="flex items-center justify-between gap-3"
                              >
                                <span
                                  className="font-medium flex items-center gap-1.5"
                                  style={{ color: entry.color }}
                                >
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  {entry.name}
                                </span>
                                <span className="font-bold font-mono">
                                  {formatINR(Number(entry.value))}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{
                      paddingBottom: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Cash"
                    name="Cash"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCash)"
                  />
                  <Area
                    type="monotone"
                    dataKey="UPI"
                    name="UPI"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorUpi)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Card"
                    name="Card"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCard)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
