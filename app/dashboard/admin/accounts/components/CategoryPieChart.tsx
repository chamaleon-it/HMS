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
  "#fb7185",
  "#f43f5e",
  "#e11d48",
  "#be123c",
  "#f59e0b",
  "#d97706",
  "#8b5cf6",
  "#6366f1",
  "#64748b",
];

const INCOME_COLORS = [
  "#10b981",
  "#34d399",
  "#059669",
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Expense Categories Donut */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <PieIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Expense Distribution
            </h3>
            <p className="text-xs text-slate-500">Breakdown by expense category</p>
          </div>
        </div>

        {expenseCategories.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-slate-400">
            No expense categories recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {expenseCategories.map((_, index) => (
                      <Cell
                        key={`expense-cell-${index}`}
                        fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatINR(Number(value)), "Amount"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {expenseCategories.map((cat, idx) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          EXPENSE_COLORS[idx % EXPENSE_COLORS.length],
                      }}
                    />
                    <span className="font-medium text-slate-700 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <div className="text-right font-semibold text-slate-900 ml-2">
                    {formatINR(cat.amount)}{" "}
                    <span className="text-slate-400 font-normal text-[11px]">
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Income Categories Donut */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Tag className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Income Breakdown
            </h3>
            <p className="text-xs text-slate-500">Revenue share by category</p>
          </div>
        </div>

        {incomeCategories.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-slate-400">
            No income categories recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {incomeCategories.map((_, index) => (
                      <Cell
                        key={`income-cell-${index}`}
                        fill={INCOME_COLORS[index % INCOME_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatINR(Number(value)), "Amount"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {incomeCategories.map((cat, idx) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          INCOME_COLORS[idx % INCOME_COLORS.length],
                      }}
                    />
                    <span className="font-medium text-slate-700 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <div className="text-right font-semibold text-slate-900 ml-2">
                    {formatINR(cat.amount)}{" "}
                    <span className="text-slate-400 font-normal text-[11px]">
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
