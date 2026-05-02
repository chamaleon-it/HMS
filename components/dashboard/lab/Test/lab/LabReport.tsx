"use client";

import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import LabTable from "./LabTable";
import LabHeader from "@/components/dashboard/lab/LabHeader";
import { FlaskConical, Beaker, CheckCircle2, AlertCircle, Search, RefreshCcw, Clock, TestTube2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { startOfDay, endOfDay, subDays } from "date-fns";
import DateFilter from "../../Home/DateFilter";
import LabStatus from "../../Home/LabStatus";

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  colorClass: string;
  iconBgClass: string;
  borderClass: string;
  delay: number;
}> = ({ icon, label, value, colorClass, iconBgClass, borderClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
  >
    <Card className={cn(
      "relative overflow-hidden border-zinc-200/60 shadow-sm transition-all duration-300",
      borderClass
    )}>
      <div className={cn("absolute inset-0 bg-linear-to-br opacity-50", colorClass)} />
      <div className="relative p-5 flex items-center gap-4">
        <div className={cn(
          "h-12 w-12 rounded-2xl flex items-center justify-center shadow-xs border border-white/50 shrink-0",
          iconBgClass
        )}>{icon}</div>
        <div>
          <div className="text-2xl font-black tracking-tight text-zinc-900">{value}</div>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default function Lab() {
  const [status, setStatus] = useState<
    "Upcoming" | "Sample Collected" | "Waiting For Result" | "Completed" | "Flagged" | "Deleted"
  >("Upcoming");

  const [activeDate, setActiveDate] = useState<string>("Today");
  const [date, setDate] = useState<Date>();
  const [search, setSearch] = useState("");

  let startDateStr = "";
  let endDateStr = "";

  try {
    let sd = startOfDay(new Date());
    let ed = endOfDay(new Date());

    if (activeDate === "Today") {
      sd = startOfDay(new Date());
    } else if (activeDate === "7 days") {
      sd = startOfDay(subDays(new Date(), 7));
    } else if (activeDate === "30 days") {
      sd = startOfDay(subDays(new Date(), 30));
    } else if (activeDate === "Custom" && date) {
      sd = startOfDay(date);
      ed = endOfDay(date);
    }

    startDateStr = sd.toISOString();
    endDateStr = ed.toISOString();
  } catch (error) {
    console.error(error);
  }

  const queryParams = new URLSearchParams({
    startDate: startDateStr,
    endDate: endDateStr,
    status: status,
    q: search
  });

  const { data, mutate, isLoading } = useSWR<{
    message: string;
    data: any[];
  }>(`/lab/report?${queryParams.toString()}`);

  const { data: statsResponse, mutate: statsMutate } = useSWR<{ message: string, data: { total: number, upcoming: number, sampleCollected: number, waitingForResult: number, completed: number, flagged: number } }>("/lab/report/statistics")

  const statsData = statsResponse?.data ?? {
    total: 0,
    upcoming: 0,
    sampleCollected: 0,
    waitingForResult: 0,
    completed: 0,
    flagged: 0
  };

  const REPORT = data?.data ?? [];

  return (
    <div className="min-h-[calc(100vh-67px)] w-full bg-linear-to-b from-white to-zinc-50/50 p-6 space-y-6">
      <LabHeader
        title="Test Management"
        subtitle="Comprehensive view of all laboratory results and records"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          delay={0.1}
          icon={<FlaskConical className="h-6 w-6" />}
          label="Total Reports"
          value={statsData.total}
          colorClass="from-zinc-500/10 to-zinc-500/5"
          iconBgClass="bg-zinc-100 text-zinc-600"
          borderClass="hover:border-zinc-200"
        />
        <StatCard
          delay={0.2}
          icon={<Clock className="h-6 w-6" />}
          label="Upcoming"
          value={statsData.upcoming}
          colorClass="from-amber-500/10 to-amber-500/5"
          iconBgClass="bg-amber-100 text-amber-600"
          borderClass="hover:border-amber-200"
        />
        <StatCard
          delay={0.3}
          icon={<TestTube2 className="h-6 w-6" />}
          label="Sample Collected"
          value={statsData.sampleCollected}
          colorClass="from-indigo-500/10 to-indigo-500/5"
          iconBgClass="bg-indigo-100 text-indigo-600"
          borderClass="hover:border-indigo-200"
        />
        <StatCard
          delay={0.4}
          icon={<CheckCircle2 className="h-6 w-6" />}
          label="Completed"
          value={statsData.completed}
          colorClass="from-emerald-500/10 to-emerald-500/5"
          iconBgClass="bg-emerald-100 text-emerald-600"
          borderClass="hover:border-emerald-200"
        />
        <StatCard
          delay={0.5}
          icon={<AlertTriangle className="h-6 w-6" />}
          label="Flagged"
          value={statsData.flagged}
          colorClass="from-rose-500/10 to-rose-500/5"
          iconBgClass="bg-rose-100 text-rose-600"
          borderClass="hover:border-rose-200"
        />
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[300px] relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name or MRN..."
              className="h-11 w-full pl-10 pr-4 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm outline-none focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all font-medium"
            />
          </div>

          <DateFilter
            activeDate={activeDate}
            setActiveDate={setActiveDate}
            date={date}
            setDate={setDate}
            isLoading={isLoading}
          />

          <button
            onClick={() => {
              setSearch("");
              setStatus("Upcoming");
              setActiveDate("Today");
              setDate(undefined);
            }}
            className="h-11 w-11 rounded-xl flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 hover:border-rose-100 transition-all shadow-xs"
            title="Reset Filters"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <LabStatus currenctStatus={status} setCurrenctStatus={setStatus} />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <LabTable
          REPORT={REPORT}
          status={status}
          mutate={() => { mutate(); statsMutate(); }}
        />
      </motion.div>
    </div>
  );
}



