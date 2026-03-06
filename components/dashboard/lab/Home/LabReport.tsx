"use client";

import React, { useState } from "react";
import useSWR from "swr";
import LabStatus from "./LabStatus";
import NewTest from "./NewTest";
import LabTable from "./LabTable";
import DateFilter from "./DateFilter";
import LabHeader from "../LabHeader";
import { Clock, CheckCircle2, FlaskConical, AlertTriangle, TestTube2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { startOfDay, endOfDay, subDays } from "date-fns";

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
      <div className="relative p-2 flex items-center gap-2">
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border border-white/50 shrink-0",
          iconBgClass
        )}>{icon}</div>
        <div>
          <div className="text-xl font-bold tracking-tight text-zinc-900">{value}</div>
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default function LabResultsPage() {

  const [status, setStatus] = useState<
    "Upcoming" | "Sample Collected" | "Waiting For Result" | "Completed" | "Flagged" | "Deleted"
  >("Upcoming");

  // NEW ONES FOR DATE FILTER
  const [activeDate, setActiveDate] = useState<string>("Today");
  const [date, setDate] = useState<Date>();

  // Calculate dates for the query
  let startDateStr = "";
  let endDateStr = "";

  try {
    let sd: Date = startOfDay(new Date());
    let ed: Date = endOfDay(new Date());

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
  } catch (e) {
    console.error("Error formatting dates", e);
  }

  const dateQuery = `startDate=${startDateStr}&endDate=${endDateStr}&status=${status}`;

  // Updated SWR to point to our new backend endpoint and pass the date variables alongside status
  const { data, mutate, isLoading } = useSWR<{
    message: string;
    data: any[];
  }>(`/lab/report?${dateQuery}`);


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
    <div className="min-h-[calc(100vh-80px)] w-full bg-linear-to-b from-white to-zinc-50/50 p-6 space-y-6">
      <div className="flex flex-col gap-6">
        <LabHeader
          title="Lab Investigations"
          subtitle="Manage and track laboratory and imaging results"
        >
          <DateFilter
            activeDate={activeDate}
            setActiveDate={setActiveDate}
            date={date}
            setDate={setDate}
            isLoading={isLoading}
          />
          <NewTest mutate={() => { mutate(); statsMutate(); }} />
        </LabHeader>
      </div>

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

      <div className="flex justify-end">
        <LabStatus currenctStatus={status} setCurrenctStatus={setStatus} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <LabTable REPORT={REPORT} status={status} mutate={() => { mutate(); statsMutate(); }} />
      </motion.div>
    </div>
  );
}
