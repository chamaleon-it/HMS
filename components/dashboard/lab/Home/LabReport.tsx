"use client";

import React, { useState } from "react";
import useSWR from "swr";
import LabStatus from "./LabStatus";
import NewTest from "./NewTest";
import LabTable from "./LabTable";
import DateFilter from "./DateFilter";
import LabHeader from "../LabHeader";
import { Clock, CheckCircle2, FlaskConical, UserRound } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { useLabDrafts } from "@/app/dashboard/lab/LabDraftContext";
import useGetTest from "@/data/useGetTest";

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  iconBgClass: string;
  borderClass: string;
  delay: number;
}> = ({ icon, label, value, iconBgClass, borderClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
  >
    <Card className={cn("border-zinc-200/70 shadow-none transition-colors", borderClass)}>
      <div className="p-2 flex items-center gap-2">
        <div className={cn(
          "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
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
  const { drafts } = useLabDrafts();
  const { tests } = useGetTest();

  const [status, setStatus] = useState<
    "Upcoming" | "Sample Collected" | "Waiting For Result" | "Completed" | "Deleted" | "Draft"
  >("Upcoming");

  // NEW ONES FOR DATE FILTER
  const [activeDate, setActiveDate] = useState<string>("Today");
  const [date, setDate] = useState<Date>();
  const [showSampleId, setShowSampleId] = useState<boolean>(true);

  const { data: labResponse } = useSWR<{ data: { _id: string; name: string; inCharge: boolean }[]; message: string }>("/technician");
  const inChargeTechnician = labResponse?.data?.find((p) => p.inCharge);

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
  }>(status === "Draft" ? null : `/lab/report?${dateQuery}`);


  const { data: statsResponse, mutate: statsMutate } = useSWR<{ message: string, data: { total: number, upcoming: number, sampleCollected: number, waitingForResult: number, completed: number } }>("/lab/report/statistics")

  const statsData = statsResponse?.data ?? {
    total: 0,
    upcoming: 0,
    sampleCollected: 0,
    waitingForResult: 0,
    completed: 0
  };

  const REPORT = status === "Draft"
    ? drafts.filter(d => !d.isOpen).map(d => ({
      _id: d.id,
      mrn: 0,
      patient: { 
        name: d.patientName || "Unknown Patient", 
        // mrn: "-",
        //_id: d.payload.patient || "",
        //phoneNumber: "-",
        //email: "-",
        // gender: "Other",
        //dateOfBirth: new Date(),
        // address: "-",
      },
      test: d.payload.test.map(t => {
        const testObj = tests.find(test => test._id === t.name);
        return {
          name: { 
            _id: t.name, 
            name: testObj?.name || "Unknown Test", 
            code: testObj?.code || "-", 
            type: testObj?.type || "-" 
          },
          _id: Math.random().toString()
        };
      }),
      panels: d.payload.panels || [],
      status: "Draft",
      priority: d.payload.priority,
      doctor: { _id: d.payload.doctor || "" },
      date: d.payload.date || new Date(),
      createdAt: new Date(parseInt(d.id)).toISOString(),
      sampleId: "-",
    }))
    : data?.data ?? [];

  return (
    <div className="min-h-[calc(100vh-67px)] w-full bg-linear-to-b from-white to-zinc-50/50 p-6 space-y-6">
      <div className="flex flex-col gap-6">
        <LabHeader
          title="Lab Investigations"
          subtitle="Manage and track laboratory and imaging results"
        >



          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <UserRound className="h-4 w-4 text-slate-400" />
              <span className="text-slate-400">Lab in-charge</span>
              <span className="font-semibold text-slate-700">{inChargeTechnician?.name ?? "—"}</span>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-500">
              <Switch
                checked={showSampleId}
                onCheckedChange={setShowSampleId}
              />
              Auto sample ID
            </label>
          </div>

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <StatCard
          delay={0.1}
          icon={<FlaskConical className="h-5 w-5" />}
          label="Total Reports"
          value={statsData.total}
          iconBgClass="bg-zinc-100 text-zinc-600"
          borderClass="hover:border-zinc-200"
        />
        <StatCard
          delay={0.2}
          icon={<Clock className="h-5 w-5" />}
          label="Upcoming"
          value={statsData.upcoming}
          iconBgClass="bg-amber-100 text-amber-600"
          borderClass="hover:border-amber-200"
        />
        <StatCard
          delay={0.3}
          icon={<FlaskConical className="h-5 w-5" />}
          label="Waiting For Result"
          value={statsData.waitingForResult}
          iconBgClass="bg-indigo-100 text-indigo-600"
          borderClass="hover:border-indigo-200"
        />
        <StatCard
          delay={0.4}
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Completed"
          value={statsData.completed}
          iconBgClass="bg-emerald-100 text-emerald-600"
          borderClass="hover:border-emerald-200"
        />
      </div>

      <div className="flex justify-end">
        <LabStatus currenctStatus={status} setCurrenctStatus={setStatus} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="print:hidden"
      >
        <LabTable REPORT={REPORT} status={status} mutate={() => { mutate(); statsMutate(); }} autoGenerateSampleId={showSampleId} onStatusChange={setStatus} />
      </motion.div>
    </div>
  );
}
