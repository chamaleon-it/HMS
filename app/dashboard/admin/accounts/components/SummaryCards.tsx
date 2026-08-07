"use client";

import React from "react";
import { formatINR } from "@/lib/fNumber";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
  Receipt,
  BadgeIndianRupee,
} from "lucide-react";

interface AnalyticsSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  profitMargin: number;
  avgTransactionValue: number;
  totalTransactions: number;
  incomeCount: number;
  expenseCount: number;
}

interface SummaryCardsProps {
  summary?: AnalyticsSummary;
  isLoading?: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const netBalance = summary?.netBalance || 0;
  const profitMargin = summary?.profitMargin || 0;
  const avgTransactionValue = summary?.avgTransactionValue || 0;
  const totalTransactions = summary?.totalTransactions || 0;

  const stats = [
    {
      label: "Total Income",
      value: formatINR(totalIncome),
      subtext: `${summary?.incomeCount || 0} income entries`,
      icon: TrendingUp,
      bg: "bg-emerald-50/50",
      border: "border-emerald-100",
      iconColor: "text-emerald-600/80",
      textColor: "text-emerald-800/80",
      headingColor: "text-emerald-950",
    },
    {
      label: "Total Expenses",
      value: formatINR(totalExpense),
      subtext: `${summary?.expenseCount || 0} expense entries`,
      icon: TrendingDown,
      bg: "bg-rose-50/50",
      border: "border-rose-100",
      iconColor: "text-rose-600/80",
      textColor: "text-rose-800/80",
      headingColor: "text-rose-950",
    },
    {
      label: "Net Balance",
      value: formatINR(netBalance),
      subtext: netBalance >= 0 ? "Net Surplus" : "Net Deficit",
      icon: Wallet,
      bg: "bg-blue-50/50",
      border: "border-blue-100",
      iconColor: "text-blue-600/80",
      textColor: "text-blue-800/80",
      headingColor: netBalance >= 0 ? "text-blue-950" : "text-rose-600",
    },
    {
      label: "Profit Margin",
      value: `${profitMargin}%`,
      subtext: "On total revenue",
      icon: Percent,
      bg: "bg-indigo-50/50",
      border: "border-indigo-100",
      iconColor: "text-indigo-600/80",
      textColor: "text-indigo-800/80",
      headingColor: profitMargin >= 0 ? "text-indigo-950" : "text-rose-600",
    },
    {
      label: "Avg Transaction",
      value: formatINR(avgTransactionValue),
      subtext: "Average per entry",
      icon: BadgeIndianRupee,
      bg: "bg-teal-50/50",
      border: "border-teal-100",
      iconColor: "text-teal-600/80",
      textColor: "text-teal-800/80",
      headingColor: "text-teal-950",
    },
    {
      label: "Total Records",
      value: totalTransactions,
      subtext: "Filtered entries",
      icon: Receipt,
      bg: "bg-slate-50/70",
      border: "border-slate-200/80",
      iconColor: "text-slate-600/80",
      textColor: "text-slate-700/80",
      headingColor: "text-slate-900",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 bg-slate-100/80 rounded-2xl animate-pulse border border-slate-200/60"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bg} p-4 rounded-2xl border ${stat.border} shadow-xs transition-all hover:scale-[1.02] cursor-default`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <IconComponent className={`w-4 h-4 ${stat.iconColor}`} />
                <p
                  className={`text-[10px] font-semibold ${stat.textColor} uppercase tracking-widest truncate`}
                >
                  {stat.label}
                </p>
              </div>
              <h3
                className={`text-xl font-bold ${stat.headingColor} leading-tight truncate`}
              >
                {stat.value}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {stat.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
