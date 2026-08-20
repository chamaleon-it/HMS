"use client";

import React from "react";
import { formatINR } from "@/lib/fNumber";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
  Receipt,
  BadgeIndianRupee,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  Smartphone,
  CreditCard,
} from "lucide-react";
import { PaymentMethodItem } from "./PaymentMethodChart";

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
  paymentMethods?: PaymentMethodItem[];
  isLoading?: boolean;
}

export function SummaryCards({
  summary,
  paymentMethods = [],
  isLoading,
}: SummaryCardsProps) {
  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const netBalance = summary?.netBalance || 0;
  const profitMargin = summary?.profitMargin || 0;
  const avgTransactionValue = summary?.avgTransactionValue || 0;
  const totalTransactions = summary?.totalTransactions || 0;

  // Extract Cash, Card, UPI items
  const cashItem = paymentMethods.find(
    (m) => m.name.toLowerCase() === "cash"
  ) || {
    name: "Cash",
    totalAmount: 0,
    incomeAmount: 0,
    expenseAmount: 0,
    count: 0,
    percentage: 0,
  };

  const upiItem = paymentMethods.find(
    (m) => m.name.toLowerCase() === "upi"
  ) || {
    name: "UPI",
    totalAmount: 0,
    incomeAmount: 0,
    expenseAmount: 0,
    count: 0,
    percentage: 0,
  };

  const cardItem = paymentMethods.find(
    (m) => m.name.toLowerCase() === "card"
  ) || {
    name: "Card",
    totalAmount: 0,
    incomeAmount: 0,
    expenseAmount: 0,
    count: 0,
    percentage: 0,
  };

  const stats = [
    // --- ROW 1: PRIMARY FINANCIAL TOTALS ---
    {
      label: "Total Income",
      value: formatINR(totalIncome),
      subtext: `${summary?.incomeCount || 0} income entries`,
      icon: TrendingUp,
      badgeIcon: ArrowDownLeft,
      badgeText: "Revenue",
      badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-200/80",
      gradient:
        "from-emerald-50/90 via-white to-emerald-50/30 border-emerald-200/70",
      iconBg: "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/20",
      headingColor: "text-slate-900",
    },
    {
      label: "Total Expenses",
      value: formatINR(totalExpense),
      subtext: `${summary?.expenseCount || 0} expense entries`,
      icon: TrendingDown,
      badgeIcon: ArrowUpRight,
      badgeText: "Outflow",
      badgeColor: "bg-rose-500/10 text-rose-700 border-rose-200/80",
      gradient: "from-rose-50/90 via-white to-rose-50/30 border-rose-200/70",
      iconBg: "bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/20",
      headingColor: "text-slate-900",
    },
    {
      label: "Net Balance",
      value: formatINR(netBalance),
      subtext: netBalance >= 0 ? "Net Profit Surplus" : "Net Deficit",
      icon: Wallet,
      badgeIcon: netBalance >= 0 ? ArrowDownLeft : ArrowUpRight,
      badgeText: netBalance >= 0 ? "Positive" : "Negative",
      badgeColor:
        netBalance >= 0
          ? "bg-blue-500/10 text-blue-700 border-blue-200/80"
          : "bg-rose-500/10 text-rose-700 border-rose-200/80",
      gradient: "from-blue-50/90 via-white to-indigo-50/30 border-blue-200/70",
      iconBg: "bg-blue-500/15 text-blue-600 ring-1 ring-blue-500/20",
      headingColor: netBalance >= 0 ? "text-slate-900" : "text-rose-600",
    },

    // --- ROW 2: PAYMENT METHOD CARDS (CASH, UPI, CARD) ---
    {
      label: "Cash Settlement",
      value: formatINR(cashItem.totalAmount),
      subtext: `${cashItem.count} txns • In: ${formatINR(cashItem.incomeAmount)}`,
      icon: Banknote,
      badgeIcon: Banknote,
      badgeText: `${cashItem.percentage}% Cash`,
      badgeColor: "bg-emerald-500/10 text-emerald-800 border-emerald-300/80",
      gradient:
        "from-emerald-50/80 via-white to-teal-50/40 border-emerald-200/80",
      iconBg: "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/20",
      headingColor: "text-slate-900",
    },
    {
      label: "UPI Settlement",
      value: formatINR(upiItem.totalAmount),
      subtext: `${upiItem.count} txns • In: ${formatINR(upiItem.incomeAmount)}`,
      icon: Smartphone,
      badgeIcon: Smartphone,
      badgeText: `${upiItem.percentage}% UPI`,
      badgeColor: "bg-purple-500/10 text-purple-800 border-purple-300/80",
      gradient:
        "from-purple-50/80 via-white to-indigo-50/40 border-purple-200/80",
      iconBg: "bg-purple-500/15 text-purple-700 ring-1 ring-purple-500/20",
      headingColor: "text-slate-900",
    },
    {
      label: "Card Settlement",
      value: formatINR(cardItem.totalAmount),
      subtext: `${cardItem.count} txns • In: ${formatINR(cardItem.incomeAmount)}`,
      icon: CreditCard,
      badgeIcon: CreditCard,
      badgeText: `${cardItem.percentage}% Card`,
      badgeColor: "bg-sky-500/10 text-sky-800 border-sky-300/80",
      gradient: "from-sky-50/80 via-white to-blue-50/40 border-sky-200/80",
      iconBg: "bg-sky-500/15 text-sky-700 ring-1 ring-sky-500/20",
      headingColor: "text-slate-900",
    },

    // --- ROW 3: OPERATIONAL & PERFORMANCE METRICS ---
    {
      label: "Profit Margin",
      value: `${profitMargin}%`,
      subtext: "Efficiency ratio",
      icon: Percent,
      badgeIcon: TrendingUp,
      badgeText: "Margin",
      badgeColor: "bg-purple-500/10 text-purple-700 border-purple-200/80",
      gradient:
        "from-purple-50/90 via-white to-indigo-50/30 border-purple-200/70",
      iconBg: "bg-purple-500/15 text-purple-600 ring-1 ring-purple-500/20",
      headingColor: profitMargin >= 0 ? "text-slate-900" : "text-rose-600",
    },
    {
      label: "Avg Transaction",
      value: formatINR(avgTransactionValue),
      subtext: "Average per entry",
      icon: BadgeIndianRupee,
      badgeIcon: Receipt,
      badgeText: "Average",
      badgeColor: "bg-teal-500/10 text-teal-700 border-teal-200/80",
      gradient: "from-teal-50/90 via-white to-cyan-50/30 border-teal-200/70",
      iconBg: "bg-teal-500/15 text-teal-600 ring-1 ring-teal-500/20",
      headingColor: "text-slate-900",
    },
    {
      label: "Total Records",
      value: totalTransactions,
      subtext: "Filtered entries",
      icon: Receipt,
      badgeIcon: Receipt,
      badgeText: "Audit",
      badgeColor: "bg-slate-500/10 text-slate-700 border-slate-200",
      gradient:
        "from-slate-50/90 via-white to-slate-100/40 border-slate-200/80",
      iconBg: "bg-slate-500/15 text-slate-700 ring-1 ring-slate-400/20",
      headingColor: "text-slate-900",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-32 bg-slate-100/70 rounded-3xl animate-pulse border border-slate-200/60"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        const BadgeIcon = stat.badgeIcon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            className={`bg-gradient-to-br ${stat.gradient} p-4 sm:p-5 rounded-3xl border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden`}
          >
            {/* Soft Ambient Corner Glow */}
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/40 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

            <div className="flex flex-col justify-between h-full space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                  {stat.label}
                </span>
                <div
                  className={`w-9 h-9 rounded-2xl ${stat.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs`}
                >
                  <IconComponent className="w-4.5 h-4.5" />
                </div>
              </div>

              <div>
                <h3
                  className={`text-2xl font-black ${stat.headingColor} tracking-tight leading-none font-mono`}
                >
                  {stat.value}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 text-[11px]">
                <span className="text-slate-500 font-medium truncate">
                  {stat.subtext}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-0.5 shrink-0 ${stat.badgeColor}`}
                >
                  <BadgeIcon className="w-2.5 h-2.5" />
                  {stat.badgeText}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
