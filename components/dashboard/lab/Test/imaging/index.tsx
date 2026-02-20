"use client";

import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import LabTable from "./LabTable";
import LabHeader from "@/components/dashboard/lab/LabHeader";
import { Camera, Search, RefreshCcw, CheckCircle2, AlertCircle, Layout } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { AnimatedTabs } from "@/components/ui/animated-tabs";

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

export default function Imagine() {
  const { data, mutate } = useSWR<{
    message: string;
    data: any[];
  }>("/lab/report");

  const REPORT = data?.data ?? [];

  const [filter, setFilter] = useState<{
    patient: string;
    status: string;
    date: string;
  }>({
    patient: "",
    status: "All",
    date: "All time",
  });

  const stats = {
    total: REPORT.length,
    imaging: REPORT.reduce((acc, r) => acc + (r.test?.filter((e: any) => e.name?.type === "Imaging").length ?? 0), 0),
    completed: REPORT.filter((r) => r.status === "Completed").length,
    flagged: REPORT.filter((r) => r.status === "Flagged").length,
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-linear-to-b from-white to-zinc-50/50 p-6 space-y-6">
      <LabHeader
        title="Imaging Management"
        subtitle="Track and review all medical imaging results and scans"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          delay={0.1}
          icon={<Layout className="h-6 w-6" />}
          label="Total Orders"
          value={stats.total}
          colorClass="from-zinc-500/10 to-zinc-500/5"
          iconBgClass="bg-zinc-100 text-zinc-600"
          borderClass="hover:border-zinc-200"
        />
        <StatCard
          delay={0.2}
          icon={<Camera className="h-6 w-6" />}
          label="Scans"
          value={stats.imaging}
          colorClass="from-blue-500/10 to-blue-500/5"
          iconBgClass="bg-blue-100 text-blue-600"
          borderClass="hover:border-blue-200"
        />
        <StatCard
          delay={0.3}
          icon={<CheckCircle2 className="h-6 w-6" />}
          label="Completed"
          value={stats.completed}
          colorClass="from-emerald-500/10 to-emerald-500/5"
          iconBgClass="bg-emerald-100 text-emerald-600"
          borderClass="hover:border-emerald-200"
        />
        <StatCard
          delay={0.4}
          icon={<AlertCircle className="h-6 w-6" />}
          label="Flagged"
          value={stats.flagged}
          colorClass="from-rose-500/10 to-rose-500/5"
          iconBgClass="bg-rose-100 text-rose-600"
          borderClass="hover:border-rose-200"
        />
      </div>

      <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[300px] relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <input
              value={filter.patient}
              onChange={(e) => setFilter({ ...filter, patient: e.target.value })}
              placeholder="Search by patient name or MRN..."
              className="h-11 w-full pl-10 pr-4 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm outline-none focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all font-medium"
            />
          </div>

          <AnimatedTabs
            options={[
              { label: "All time", value: "All time" },
              { label: "7 days", value: "7 days" },
              { label: "30 days", value: "30 days" },
            ]}
            value={filter.date}
            onChange={(e) => setFilter({ ...filter, date: e })}
            layoutId="imaging-date"
          />

          <button
            onClick={() => setFilter({ patient: "", status: "All", date: "All time" })}
            className="h-11 w-11 rounded-xl flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 hover:border-rose-100 transition-all shadow-xs"
            title="Reset Filters"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>

        <AnimatedTabs
          options={["All", "Pending", "In Progress", "Completed", "Flagged"].map(s => ({ label: s, value: s }))}
          value={filter.status}
          onChange={(s) => setFilter({ ...filter, status: s })}
          layoutId="imaging-status"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <LabTable
          REPORT={REPORT.filter((r) => {
            const patientMatch = r?.patient?.name.toLowerCase().includes(filter.patient.toLowerCase()) || r?.patient?.mrn.toLowerCase().includes(filter.patient.toLowerCase());
            const statusMatch = filter.status === "All" || r.status === filter.status;
            const dateMatch = filter.date === "All time" || r.createdAt >= new Date(Date.now() - (filter.date === "7 days" ? 7 : 30) * 24 * 60 * 60 * 1000);
            return patientMatch && statusMatch && dateMatch;
          })}
          status={filter.status}
          mutate={mutate}
        />
      </motion.div>
    </div>
  );
}
