"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatINR } from "@/lib/fNumber";
import { TrendingUp, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface TrendDataItem {
  label: string;
  income: number;
  expense: number;
  net: number;
}

interface TrendChartProps {
  data?: TrendDataItem[];
  isLoading?: boolean;
}

export function TrendChart({ data = [], isLoading }: TrendChartProps) {
  const { maxIncome, maxExpense } = useMemo(() => {
    let maxInc = 0;
    let maxExp = 0;
    data.forEach((item) => {
      if (item.income > maxInc) maxInc = item.income;
      if (item.expense > maxExp) maxExp = item.expense;
    });
    return { maxIncome: maxInc, maxExpense: maxExp };
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm h-96 animate-pulse flex items-center justify-center">
        <div className="h-64 bg-slate-100/70 rounded-2xl w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Financial Performance Trend
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Income & Expense progression timeline
            </p>
          </div>
        </div>

        {/* Peak stats badges */}
        {data.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/60 font-semibold flex items-center gap-1.5">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>Peak Income: {formatINR(maxIncome)}</span>
            </div>
            <div className="px-3 py-1 bg-rose-50 text-rose-700 rounded-xl border border-rose-200/60 font-semibold flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
              <span>Peak Expense: {formatINR(maxExpense)}</span>
            </div>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-sm text-slate-400 font-medium">
          No timeline trend data available for selected filters.
        </div>
      ) : (
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="expenseAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
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
                          {label}
                        </p>
                        {payload.map((entry: any, index: number) => (
                          <div
                            key={`item-${index}`}
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
                              {entry.name === "income" ? "Income" : "Expense"}
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
                wrapperStyle={{ paddingBottom: "12px", fontSize: "12px", fontWeight: 600 }}
              />

              <Area
                type="monotone"
                dataKey="income"
                name="income"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#incomeAreaGradient)"
                activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="expense"
                stroke="#f43f5e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#expenseAreaGradient)"
                activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
