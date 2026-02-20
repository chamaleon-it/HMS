"use client";

import React, { useState } from "react";
import useSWR from "swr";
import LabStatus from "./LabStatus";
import NewTest from "./NewTest";
import LabTable from "./LabTable";
import LabHeader from "../LabHeader";
import { Beaker, Clock, CheckCircle2, FlaskConical, Filter, Plus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

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
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
  >
    <Card className={cn(
      "relative overflow-hidden border-zinc-200/60 transition-all duration-300 shadow-sm hover:shadow-md",
      borderClass
    )}>
      <div className={cn("absolute inset-0 bg-linear-to-br opacity-50", colorClass)} />
      <div className="relative p-4 flex items-center gap-4">
        <div className={cn(
          "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border border-white/50 shrink-0",
          iconBgClass
        )}>{icon}</div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900">{value}</div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default function LabResultsPage() {
  const { data, mutate } = useSWR<{
    message: string;
    data: any[]; // Truncated for brevity but remains same in original
  }>("/lab/report");

  const REPORT = data?.data ?? [];

  const stats = {
    total: REPORT.length,
    pending: REPORT.filter(r => r.status === "Pending").length,
    inProgress: REPORT.filter(r => r.status === "In Progress").length,
    completed: REPORT.filter(r => r.status === "Completed").length,
    flagged: REPORT.filter(r => r.status === "Flagged").length
  };

  const [status, setStatus] = useState<
    "Pending" | "In Progress" | "Completed" | "Flagged"
  >("Pending");

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-linear-to-b from-white to-zinc-50/50 p-6 space-y-6">
      <LabHeader
        title="Lab Investigations"
        subtitle="Manage and track laboratory and imaging results"
      >
        <LabStatus currenctStatus={status} setCurrenctStatus={setStatus} />
        <NewTest mutate={mutate} />
      </LabHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          delay={0.1}
          icon={<FlaskConical className="h-6 w-6" />}
          label="Total Reports"
          value={stats.total}
          colorClass="from-zinc-500/10 to-zinc-500/5"
          iconBgClass="bg-zinc-100 text-zinc-600"
          borderClass="hover:border-zinc-200"
        />
        <StatCard
          delay={0.2}
          icon={<Clock className="h-6 w-6" />}
          label="Upcoming"
          value={stats.pending}
          colorClass="from-amber-500/10 to-amber-500/5"
          iconBgClass="bg-amber-100 text-amber-600"
          borderClass="hover:border-amber-200"
        />
        <StatCard
          delay={0.3}
          icon={<Beaker className="h-6 w-6" />}
          label="In Progress"
          value={stats.inProgress}
          colorClass="from-indigo-500/10 to-indigo-500/5"
          iconBgClass="bg-indigo-100 text-indigo-600"
          borderClass="hover:border-indigo-200"
        />
        <StatCard
          delay={0.4}
          icon={<CheckCircle2 className="h-6 w-6" />}
          label="Completed"
          value={stats.completed}
          colorClass="from-emerald-500/10 to-emerald-500/5"
          iconBgClass="bg-emerald-100 text-emerald-600"
          borderClass="hover:border-emerald-200"
        />
        <StatCard
          delay={0.5}
          icon={<AlertTriangle className="h-6 w-6" />}
          label="Flagged"
          value={stats.flagged}
          colorClass="from-rose-500/10 to-rose-500/5"
          iconBgClass="bg-rose-100 text-rose-600"
          borderClass="hover:border-rose-200"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <LabTable REPORT={REPORT} status={status} mutate={mutate} />
      </motion.div>
    </div>
  );
}
