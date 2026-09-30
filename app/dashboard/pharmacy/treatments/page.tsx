"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import useSWR from "swr";
import { startOfDay, endOfDay, subDays } from "date-fns";
import PharmacyHeader from "@/app/dashboard/pharmacy/components/PharmacyHeader";
import DateFilter from "../DateFilter";
import { TableSkeleton } from "@/app/dashboard/pharmacy/components/PharmacySkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Receipt,
  Layers,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import TreatmentStatusFilter from "./TreatmentStatusFilter";
import TreatmentTable from "./TreatmentTable";
import NewTreatment from "./NewTreatment";
import EditTreatment from "./EditTreatment";
import ProcessTreatment from "./ProcessTreatment";
import RepeatTreatment from "./RepeatTreatment";
import TreatmentTimelineModal from "./TreatmentTimelineModal";
import { TreatmentOrderType } from "./interface";

export default function TreatmentsPage() {
  const [activeDate, setActiveDate] = useState<"Today" | "7 days" | "30 days" | "Custom">("Today");
  const [date, setDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [filter, setFilter] = useState<{ page: number; limit: number }>({
    page: 1,
    limit: 20,
  });

  // Modal dialog states
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [repeatModalOpen, setRepeatModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);

  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentOrderType | null>(null);

  // Fetch In-Charge Therapist
  const { data: therapistResponse } = useSWR<{
    data: { _id: string; name: string; inCharge: boolean }[];
    message: string;
  }>("/employee?role=Therapist&status=active");

  const inChargeTherapist = therapistResponse?.data?.find((t) => t.inCharge);

  // Calculate Date Filters
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

  const params = new URLSearchParams();
  params.set("page", String(filter.page));
  params.set("limit", String(filter.limit));
  if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
  if (typeFilter && typeFilter !== "all") params.set("type", typeFilter);
  if (searchQuery.trim()) params.set("q", searchQuery.trim());
  params.set("startDate", sd.toISOString());
  params.set("endDate", ed.toISOString());

  const { data: treatmentsData, mutate: mutateTreatments, isLoading } = useSWR<{
    data: TreatmentOrderType[];
    total: number;
    message: string;
  }>(`/treatment?${params.toString()}`);

  const treatments = treatmentsData?.data ?? [];
  const total = treatmentsData?.total ?? 0;

  // Handlers for modal triggers
  const handleProcess = (treatment: TreatmentOrderType) => {
    setSelectedTreatment(treatment);
    setProcessModalOpen(true);
  };

  const handleEdit = (treatment: TreatmentOrderType) => {
    setSelectedTreatment(treatment);
    setEditModalOpen(true);
  };

  const handleRepeat = (treatment: TreatmentOrderType) => {
    setSelectedTreatment(treatment);
    setRepeatModalOpen(true);
  };

  const handleViewTimeline = (treatment: TreatmentOrderType) => {
    setSelectedTreatment(treatment);
    setTimelineModalOpen(true);
  };

  return (
    <AppShell>
      <TooltipProvider>
        <div className="p-0 sm:p-5 min-h-[calc(100vh-67px)] overflow-hidden flex flex-col">
          {/* Header Row */}
          <div className="shrink-0 mb-4 px-4 sm:px-0 print:hidden">
            <PharmacyHeader
              title="Treatments"
              subtitle="Manage procedure and therapy treatment requests, session execution, and billing"
            >
              <div className="flex gap-3 items-center">
                <Button
                  onClick={() => setNewModalOpen(true)}
                  className="bg-(--color-synapse-light) hover:bg-(--color-synapse-light)/90 text-white rounded-xl gap-2 font-semibold shadow-xs cursor-pointer text-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Treatment Order</span>
                </Button>
              </div>
            </PharmacyHeader>
          </div>

          {/* Full Width Search & Date Filter Card */}
          <div className="shrink-0 mb-4 px-4 sm:px-0 print:hidden">
            <Card className="border-zinc-200/60 shadow-sm py-2.5!">
              <CardContent className="p-3">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 min-w-60">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setFilter((prev) => ({ ...prev, page: 1 }));
                        }}
                        placeholder="Search patient, doctor, therapist, MRN..."
                        className="pl-9 h-11 bg-zinc-50/50 border-zinc-200 focus:bg-white transition-all rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <DateFilter
                      activeDate={activeDate}
                      setActiveDate={setActiveDate}
                      date={date}
                      setDate={setDate}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls Bar: Therapist In-Charge & Category on Left, Status Filter Pills on Right */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shrink-0 px-4 sm:px-0 print:hidden">
            {/* Left Controls: In-Charge Therapist & Category Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative inline-flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm text-sm hover:border-gray-300 transition-colors">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                <span className="text-xs text-gray-500 font-medium mr-1.5">Therapist In-Charge:</span>
                <span className="text-xs font-bold text-gray-900">{inChargeTherapist?.name ?? "—"}</span>
              </div>

              {/* Category Filter Pills */}
              <div className="relative inline-flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-full shadow-sm">
                {[
                  { label: "All Types", value: "all" },
                  { label: "Therapy", value: "Therapy" },
                  { label: "Procedure", value: "Procedure" },
                ].map((t) => {
                  const active = typeFilter === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => {
                        setTypeFilter(t.value);
                        setFilter((prev) => ({ ...prev, page: 1 }));
                      }}
                      className={cn(
                        "relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
                        active ? "text-white" : "text-gray-500 hover:text-gray-800"
                      )}
                      type="button"
                    >
                      {active && (
                        <motion.span
                          layoutId="treatment-type-indicator"
                          className="absolute inset-0 rounded-full shadow-md bg-(--color-synapse-light)"
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Controls: Status Filter Pills */}
            <TreatmentStatusFilter
              currentStatus={statusFilter}
              setCurrentStatus={(st) => {
                setStatusFilter(st);
                setFilter((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-hidden px-4 sm:px-0">
            {isLoading ? (
              <TableSkeleton rows={8} columns={9} />
            ) : (
              <TreatmentTable
                treatments={treatments}
                total={total}
                filter={filter}
                setFilter={setFilter}
                onProcess={handleProcess}
                onEdit={handleEdit}
                onRepeat={handleRepeat}
                onViewTimeline={handleViewTimeline}
                onMutate={mutateTreatments}
              />
            )}
          </div>

          {/* Dialogs */}
          <NewTreatment
            open={newModalOpen}
            onOpenChange={setNewModalOpen}
            onSuccess={mutateTreatments}
          />

          <EditTreatment
            treatment={selectedTreatment}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onSuccess={mutateTreatments}
          />

          <ProcessTreatment
            treatment={selectedTreatment}
            open={processModalOpen}
            onOpenChange={setProcessModalOpen}
            onSuccess={mutateTreatments}
          />

          <RepeatTreatment
            treatment={selectedTreatment}
            open={repeatModalOpen}
            onOpenChange={setRepeatModalOpen}
            onSuccess={mutateTreatments}
          />

          <TreatmentTimelineModal
            treatmentId={selectedTreatment?._id || null}
            open={timelineModalOpen}
            onOpenChange={setTimelineModalOpen}
            onRepeatClick={(t) => {
              setTimelineModalOpen(false);
              handleRepeat(t);
            }}
          />
        </div>
      </TooltipProvider>
    </AppShell>
  );
}
