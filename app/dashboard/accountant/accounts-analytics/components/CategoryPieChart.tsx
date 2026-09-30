"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { formatINR } from "@/lib/fNumber";
import { PieChart as PieIcon, Tag } from "lucide-react";
import { motion } from "framer-motion";

interface CategoryItem {
  name: string;
  amount: number;
  count: number;
  percentage: number;
}

interface CategoryPieChartProps {
  expenseCategories?: CategoryItem[];
  incomeCategories?: CategoryItem[];
  isLoading?: boolean;
}

const EXPENSE_COLORS = [
  "#f43f5e",
  "#e11d48",
  "#fb7185",
  "#be123c",
  "#881337",
  "#f59e0b",
  "#d97706",
  "#8b5cf6",
  "#6366f1",
  "#64748b",
];

const INCOME_COLORS = [
  "#10b981",
  "#059669",
  "#34d399",
  "#047857",
  "#065f46",
  "#0284c7",
];

export function CategoryPieChart({
  expenseCategories = [],
  incomeCategories = [],
  isLoading,
}: CategoryPieChartProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 h-80 animate-pulse" />
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 h-80 animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Expense Categories Donut & Progress Bars */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Expense Category Breakdown
            </h3>
            <p className="text-xs text-slate-500 font-medium">Distribution by category</p>
          </div>
        </div>

        {expenseCategories.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-slate-400 font-medium">
            No expense category entries recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            <div className="sm:col-span-5 h-60 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="amount"
                  >
                    {expenseCategories.map((_, index) => (
                      <Cell
                        key={`expense-cell-${index}`}
                        fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-2xl text-xs shadow-xl border border-slate-700 space-y-1">
                            <p className="font-bold">{data.name}</p>
                            <p className="text-slate-300">{formatINR(data.amount)} ({data.percentage}%)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total</span>
                <span className="text-sm font-extrabold text-rose-600">
                  {formatINR(expenseCategories.reduce((acc, curr) => acc + curr.amount, 0))}
                </span>
              </div>
            </div>

            {/* Custom Progress Bars */}
            <div className="sm:col-span-7 space-y-3 max-h-60 overflow-y-auto pr-1">
              {expenseCategories.map((cat, idx) => {
                const color = EXPENSE_COLORS[idx % EXPENSE_COLORS.length];
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 truncate flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        {cat.name}
                      </span>
                      <span className="text-slate-900 font-bold ml-2">
                        {formatINR(cat.amount)}{" "}
                        <span className="text-slate-400 font-normal text-[11px]">
                          ({cat.percentage}%)
                        </span>
                      </span>
                    </div>
                    {/* Animated Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(cat.percentage, 100)}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Income Categories Donut & Progress Bars */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Income Category Distribution
            </h3>
            <p className="text-xs text-slate-500 font-medium">Revenue share by category</p>
          </div>
        </div>

        {incomeCategories.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-slate-400 font-medium">
            No income category entries recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            <div className="sm:col-span-5 h-60 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="amount"
                  >
                    {incomeCategories.map((_, index) => (
                      <Cell
                        key={`income-cell-${index}`}
                        fill={INCOME_COLORS[index % INCOME_COLORS.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-2xl text-xs shadow-xl border border-slate-700 space-y-1">
                            <p className="font-bold">{data.name}</p>
                            <p className="text-slate-300">{formatINR(data.amount)} ({data.percentage}%)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total</span>
                <span className="text-sm font-extrabold text-emerald-600">
                  {formatINR(incomeCategories.reduce((acc, curr) => acc + curr.amount, 0))}
                </span>
              </div>
            </div>

            {/* Custom Progress Bars */}
            <div className="sm:col-span-7 space-y-3 max-h-60 overflow-y-auto pr-1">
              {incomeCategories.map((cat, idx) => {
                const color = INCOME_COLORS[idx % INCOME_COLORS.length];
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 truncate flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        {cat.name}
                      </span>
                      <span className="text-slate-900 font-bold ml-2">
                        {formatINR(cat.amount)}{" "}
                        <span className="text-slate-400 font-normal text-[11px]">
                          ({cat.percentage}%)
                        </span>
                      </span>
                    </div>
                    {/* Animated Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(cat.percentage, 100)}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
