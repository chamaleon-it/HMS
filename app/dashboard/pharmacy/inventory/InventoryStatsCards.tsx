"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Package,
  Sparkles,
} from "lucide-react";
import { formatINR } from "@/lib/fNumber";
import { FilterType } from "./interface";
import InventoryValueBreakdown from "./InventoryValueBreakdown";

export interface InventoryStats {
  totalValue: number;
  totalItems: number;
  totalQuantity: number;
  lowStockCount: number;
  outOfStockCount: number;
  highestMoving: {
    id: string;
    name: string;
    generic?: string;
    soldQuantity: number;
  } | null;
  lowestMoving: {
    id: string;
    name: string;
    generic?: string;
    soldQuantity: number;
  } | null;
}

interface Props {
  stats?: InventoryStats;
  isLoading?: boolean;
  lowStockThreshold?: number;
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}

export default function InventoryStatsCards({
  stats,
  isLoading,
  lowStockThreshold = 20,
  filter,
  setFilter,
}: Props) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white/80 border border-slate-200/80 p-4 shadow-sm animate-pulse flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-8 w-8 bg-slate-200 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <div className="h-6 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-20 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const isLowStockActive = Boolean(filter.lowStockItemsView);
  const isOutOfStockActive = filter.stock === "Out";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Values (Entire Inventory) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        onClick={() => setBreakdownOpen(true)}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border border-emerald-200/80 p-4 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">

            Total Inventory Value
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
            {formatINR(stats?.totalValue || 0)}
          </div>
          <div className="flex items-center justify-between gap-1.5 text-[11px] text-emerald-700 font-medium">
            <span className="flex items-center gap-1.5">
              <Package className="w-3 h-3" />
              {stats?.totalQuantity ?? 0} units across {stats?.totalItems ?? 0} items
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
              Breakdown
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. Low Stock */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        onClick={() =>
          setFilter((prev) => ({
            ...prev,
            lowStockItemsView: !prev.lowStockItemsView,
            page: 1,
          }))
        }
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group ${isLowStockActive
          ? "border-amber-500 ring-2 ring-amber-400/40"
          : "border-amber-200/80 hover:border-amber-400"
          }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            Low Stock
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {stats?.lowStockCount ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-semibold">items</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-amber-700 font-medium">
            <span>Threshold ≤ {lowStockThreshold}</span>
            <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
              {isLowStockActive ? "Active Filter" : "Click to view"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 3. Out of Stock */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        onClick={() =>
          setFilter((prev) => ({
            ...prev,
            stock: prev.stock === "Out" ? undefined : "Out",
            page: 1,
          }))
        }
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/10 via-red-500/5 to-white border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group ${isOutOfStockActive
          ? "border-rose-500 ring-2 ring-rose-400/40"
          : "border-rose-200/80 hover:border-rose-400"
          }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
            Out of Stock
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {stats?.outOfStockCount ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-semibold">items</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-rose-700 font-medium">
            <span>0 units remaining</span>
            <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
              {isOutOfStockActive ? "Active Filter" : "Click to view"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 4. Highest Moving Product */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-white border border-indigo-200/80 p-4 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">

            Top Moving
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-0.5">
          <div
            className="text-base font-bold text-slate-900 truncate tracking-tight"
            title={stats?.highestMoving?.name || "No sales"}
          >
            {stats?.highestMoving?.name || "No sales yet"}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 font-semibold">
            <span>
              {stats?.highestMoving ? `${stats.highestMoving.soldQuantity} units sold` : "0 sales"}
            </span>
            {stats?.highestMoving?.generic && (
              <span className="text-[10px] text-slate-400 font-normal truncate max-w-[90px]">
                ({stats.highestMoving.generic})
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* 5. Lowest Moving Product */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-500/10 via-sky-500/5 to-white border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">

            Lowest Moving
          </span>
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-0.5">
          <div
            className="text-base font-bold text-slate-900 truncate tracking-tight"
            title={stats?.lowestMoving?.name || "None"}
          >
            {stats?.lowestMoving?.name || "None"}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold">
            <span>
              {stats?.lowestMoving ? `${stats.lowestMoving.soldQuantity} units sold` : "0 sales"}
            </span>
            {stats?.lowestMoving?.generic && (
              <span className="text-[10px] text-slate-400 font-normal truncate max-w-[90px]">
                ({stats.lowestMoving.generic})
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <InventoryValueBreakdown
        open={breakdownOpen}
        onOpenChange={setBreakdownOpen}
      />
    </div>
  );
}
