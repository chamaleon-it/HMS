"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Filter } from "lucide-react";

interface VisitTrendItem {
  date: string;
  label: string;
  totalVisits: number;
  newPatients: number;
  followUps: number;
}

interface VisitTrendsChartProps {
  data?: VisitTrendItem[];
  isLoading?: boolean;
}

export function VisitTrendsChart({ data = [], isLoading }: VisitTrendsChartProps) {
  const [chartType, setChartType] = useState<"all" | "new" | "followup">("all");

  const totalVisitsCount = data.reduce((acc, curr) => acc + (curr.totalVisits || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center ring-1 ring-blue-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Patient Visit Trends
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {totalVisitsCount.toLocaleString()} Total visits recorded in period
            </p>
          </div>
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => setChartType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              chartType === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All Visits
          </button>
          <button
            onClick={() => setChartType("new")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              chartType === "new"
                ? "bg-emerald-500 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            New Patients
          </button>
          <button
            onClick={() => setChartType("followup")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              chartType === "followup"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Follow-ups
          </button>
        </div>
      </div>

      <div className="h-72 w-full mt-2">
        {isLoading ? (
          <div className="w-full h-full bg-slate-100/60 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-xs font-medium">
            Loading visit trend data...
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-full bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center text-slate-400">
            <Calendar className="w-8 h-8 mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-600">No visit data available</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Select a different date range filter</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorFollow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "16px",
                  color: "#fff",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                }}
                itemSorter={(item: any) => {
                  const name = item?.name || item?.dataKey;
                  if (name === "Total Visits" || name === "totalVisits") return 1;
                  if (name === "New Patients" || name === "newPatients") return 2;
                  if (name === "Follow-ups" || name === "followUps") return 3;
                  return 4;
                }}
                formatter={(value: any, name: any) => [
                  value,
                  name === "totalVisits" || name === "Total Visits"
                    ? "Total Visits"
                    : name === "newPatients" || name === "New Patients"
                    ? "New Patients"
                    : "Follow-ups",
                ]}
                labelStyle={{ fontWeight: "bold", color: "#94a3b8", marginBottom: "4px" }}
              />

              {chartType === "all" && (
                <Area
                  type="monotone"
                  dataKey="totalVisits"
                  name="Total Visits"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                />
              )}
              {(chartType === "all" || chartType === "new") && (
                <Area
                  type="monotone"
                  dataKey="newPatients"
                  name="New Patients"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorNew)"
                />
              )}
              {(chartType === "all" || chartType === "followup") && (
                <Area
                  type="monotone"
                  dataKey="followUps"
                  name="Follow-ups"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorFollow)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
