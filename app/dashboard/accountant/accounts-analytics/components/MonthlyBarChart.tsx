"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatINR } from "@/lib/fNumber";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface TrendDataItem {
  label: string;
  income: number;
  expense: number;
  net: number;
}

interface MonthlyBarChartProps {
  data?: TrendDataItem[];
  isLoading?: boolean;
}

export function MonthlyBarChart({ data = [], isLoading }: MonthlyBarChartProps) {
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
      transition={{ duration: 0.4, delay: 0.18 }}
      className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 h-full flex flex-col justify-between"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Monthly Comparison
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Side-by-side financial comparison
            </p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-sm text-slate-400 font-medium">
          No comparison data available.
        </div>
      ) : (
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 15, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                      <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-xs space-y-1.5 min-w-40">
                        <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">
                          {label}
                        </p>
                        {payload.map((entry: any, index: number) => (
                          <div
                            key={`bar-item-${index}`}
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
              <Bar
                dataKey="income"
                name="income"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="expense"
                name="expense"
                fill="#f43f5e"
                radius={[8, 8, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
