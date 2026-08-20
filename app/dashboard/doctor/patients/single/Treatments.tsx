"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  FlaskConical,
  HeartHandshake,
  Loader2,
  Receipt,
  RefreshCw,
  Search,
  Stethoscope,
  UserCheck,
  XCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatINR } from "@/lib/fNumber";
import { fDate, fDateandTime } from "@/lib/fDateAndTime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ConsultationType, PatientType } from "./interface";
import { TreatmentOrderType } from "@/app/dashboard/reception/treatments/interface";
import useGetTherapy from "@/data/useGetTherapy";
import useGetProcedure from "@/data/useGetProcedure";
import { getFormattedTherapyNames, getFormattedProcedureNames } from "@/lib/investigationUtils";

interface TreatmentsProps {
  patientId: string;
  consult?: ConsultationType[];
  patient?: PatientType;
}

export default function Treatments({
  patientId,
  consult = [],
}: TreatmentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [billingFilter, setBillingFilter] = useState<string>("all");
  const [showConsultPlans, setShowConsultPlans] = useState(false);

  const { therapies } = useGetTherapy();
  const { procedures } = useGetProcedure();

  // Fetch Treatment orders for this patient
  const { data: treatmentsData, isLoading, mutate } = useSWR<{
    data: TreatmentOrderType[];
    total: number;
    message: string;
  }>(patientId ? `/treatment?patient=${patientId}&limit=200` : null, {
    revalidateOnFocus: false,
  });

  const treatments = treatmentsData?.data || [];

  // Metrics
  const metrics = useMemo(() => {
    const total = treatments.length;
    const pendingTherapies = treatments.filter(
      (t) => (t.type === "Therapy" || t.category === "Therapy") && (t.status === "Pending" || t.status === "In-Progress")
    ).length;
    const pendingProcedures = treatments.filter(
      (t) => (t.type === "Procedure" || t.category === "Procedure") && (t.status === "Pending" || t.status === "In-Progress")
    ).length;
    const completed = treatments.filter((t) => t.status === "Completed").length;
    const totalTherapies = treatments.filter((t) => t.type === "Therapy" || t.category === "Therapy").length;
    const totalProcedures = treatments.filter((t) => t.type === "Procedure" || t.category === "Procedure").length;

    const totalSpend = treatments.reduce((acc, t) => {
      const itemsSum = (t.items || []).reduce((s, it) => s + (it.total || it.unitPrice * (it.quantity || 1) || 0), 0);
      return acc + (t.paidAmount || itemsSum);
    }, 0);

    return {
      total,
      pendingTherapies,
      pendingProcedures,
      completed,
      totalTherapies,
      totalProcedures,
      totalSpend,
    };
  }, [treatments]);

  // Prescribed consultation treatments
  const consultTreatments = useMemo(() => {
    return consult.filter(
      (c) =>
        (c.therapy && c.therapy.length > 0) ||
        (c.procedure && c.procedure.length > 0) ||
        c.therapyNotes ||
        c.procedureNotes
    );
  }, [consult]);

  // Filtered Treatments for Table
  const filteredTreatments = useMemo(() => {
    return treatments.filter((t) => {
      // Type Filter
      if (typeFilter === "Therapy") {
        if (!(t.type === "Therapy" || t.category === "Therapy")) return false;
      } else if (typeFilter === "Procedure") {
        if (!(t.type === "Procedure" || t.category === "Procedure")) return false;
      }

      // Status Filter
      if (statusFilter !== "all") {
        if (statusFilter === "Pending-All") {
          if (!(t.status === "Pending" || t.status === "In-Progress")) return false;
        } else if (t.status !== statusFilter) {
          return false;
        }
      }

      // Billing Filter
      if (billingFilter !== "all" && t.billingStatus !== billingFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mrnMatch = t.mrn?.toLowerCase().includes(q);
        const billNoMatch = t.billNo?.toLowerCase().includes(q);
        const doctorMatch = t.doctorName?.toLowerCase().includes(q) || (t.doctor as any)?.name?.toLowerCase().includes(q);
        const therapistMatch = t.therapistName?.toLowerCase().includes(q);
        const notesMatch = t.notes?.toLowerCase().includes(q);
        const itemsMatch = (t.items || []).some(
          (it) => it.name?.toLowerCase().includes(q) || it.parentName?.toLowerCase().includes(q) || it.code?.toLowerCase().includes(q)
        );

        if (!mrnMatch && !billNoMatch && !doctorMatch && !therapistMatch && !notesMatch && !itemsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [treatments, typeFilter, statusFilter, billingFilter, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 font-semibold gap-1 text-[11px] px-2 py-0.5">
            <Clock className="w-3 h-3 text-amber-600" /> Pending
          </Badge>
        );
      case "In-Progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 font-semibold gap-1 text-[11px] px-2 py-0.5">
            <Activity className="w-3 h-3 text-blue-600 animate-pulse" /> In-Progress
          </Badge>
        );
      case "Completed":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold gap-1 text-[11px] px-2 py-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-300 font-semibold gap-1 text-[11px] px-2 py-0.5">
            <XCircle className="w-3 h-3 text-rose-600" /> Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-600 border-slate-300 text-[11px] px-2 py-0.5">
            {status}
          </Badge>
        );
    }
  };

  const getBillingBadge = (status?: string, billNo?: string) => {
    if (status === "Paid") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[10px] px-2 py-0.5">
          Paid {billNo ? `(${billNo})` : ""}
        </Badge>
      );
    }
    if (status === "Billed") {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold text-[10px] px-2 py-0.5">
          Billed {billNo ? `(${billNo})` : ""}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 font-medium text-[10px] px-2 py-0.5">
        Unbilled
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* ── 1. Compact 4-Card Summary Strip ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Treatments */}
        <div
          onClick={() => {
            setTypeFilter("all");
            setStatusFilter("all");
          }}
          className={cn(
            "rounded-xl border p-3.5 bg-linear-to-br from-slate-50 to-slate-100/60 flex flex-col justify-between cursor-pointer transition-all hover:border-slate-400 shadow-2xs",
            typeFilter === "all" && statusFilter === "all" ? "ring-2 ring-slate-800 border-slate-700" : ""
          )}
        >
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Total Treatments
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics.total}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {metrics.totalTherapies} Therapies • {metrics.totalProcedures} Procedures
          </span>
        </div>

        {/* Pending Procedures */}
        <div
          onClick={() => {
            setTypeFilter("Procedure");
            setStatusFilter("Pending-All");
          }}
          className={cn(
            "rounded-xl border p-3.5 bg-linear-to-br from-amber-50/80 to-amber-100/50 flex flex-col justify-between cursor-pointer transition-all hover:border-amber-400 shadow-2xs",
            typeFilter === "Procedure" && statusFilter === "Pending-All" ? "ring-2 ring-amber-400 border-amber-300" : ""
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Pending Procedures
            </span>
            {metrics.pendingProcedures > 0 && (
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">
            {metrics.pendingProcedures}
          </div>
          <span className="text-[11px] text-amber-700 font-medium">
            Requires clinical session
          </span>
        </div>

        {/* Pending Therapies */}
        <div
          onClick={() => {
            setTypeFilter("Therapy");
            setStatusFilter("Pending-All");
          }}
          className={cn(
            "rounded-xl border p-3.5 bg-linear-to-br from-indigo-50/80 to-indigo-100/50 flex flex-col justify-between cursor-pointer transition-all hover:border-indigo-400 shadow-2xs",
            typeFilter === "Therapy" && statusFilter === "Pending-All" ? "ring-2 ring-indigo-400 border-indigo-300" : ""
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
              Pending Therapies
            </span>
            {metrics.pendingTherapies > 0 && (
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </div>
          <div className="text-2xl font-black text-indigo-900 mt-1">
            {metrics.pendingTherapies}
          </div>
          <span className="text-[11px] text-indigo-700 font-medium">
            Scheduled therapies
          </span>
        </div>

        {/* Completed Sessions */}
        <div
          onClick={() => {
            setTypeFilter("all");
            setStatusFilter("Completed");
          }}
          className={cn(
            "rounded-xl border p-3.5 bg-linear-to-br from-emerald-50/80 to-emerald-100/50 flex flex-col justify-between cursor-pointer transition-all hover:border-emerald-400 shadow-2xs",
            statusFilter === "Completed" ? "ring-2 ring-emerald-500 border-emerald-400" : ""
          )}
        >
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Completed Sessions
          </span>
          <div className="text-2xl font-black text-emerald-900 mt-1">
            {metrics.completed}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            Total Value: {formatINR(metrics.totalSpend)}
          </span>
        </div>
      </div>

      {/* ── 2. Filter Toolbar ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder="Search treatment, code, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8.5 h-8.5 text-xs bg-white rounded-lg border-slate-200"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32 h-8.5 text-xs rounded-lg border-slate-200 font-medium cursor-pointer">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Therapy">Therapy</SelectItem>
              <SelectItem value="Procedure">Procedure</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8.5 text-xs rounded-lg border-slate-200 font-medium cursor-pointer">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending-All">Pending & Active</SelectItem>
              <SelectItem value="Pending">Pending Only</SelectItem>
              <SelectItem value="In-Progress">In-Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={billingFilter} onValueChange={setBillingFilter}>
            <SelectTrigger className="w-28 h-8.5 text-xs rounded-lg border-slate-200 font-medium cursor-pointer">
              <SelectValue placeholder="All Billing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Billing</SelectItem>
              <SelectItem value="Unbilled">Unbilled</SelectItem>
              <SelectItem value="Billed">Billed</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            disabled={isLoading}
            className="h-8.5 px-2.5 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            title="Refresh Treatments"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </Button>

          {(searchQuery || typeFilter !== "all" || statusFilter !== "all" || billingFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
                setStatusFilter("all");
                setBillingFilter("all");
              }}
              className="text-xs text-slate-500 hover:text-slate-900 rounded-lg h-8.5 px-2"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* ── 3. High Readability Clean Treatments Table ─────────────────────── */}
      <div className="rounded-xl border bg-white overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-900 hover:bg-slate-900">
              <TableHead className="text-white text-xs font-semibold w-10">#</TableHead>
              <TableHead className="text-white text-xs font-semibold w-24">Type</TableHead>
              <TableHead className="text-white text-xs font-semibold">Treatment / Item Name</TableHead>
              <TableHead className="text-white text-xs font-semibold">Session</TableHead>
              <TableHead className="text-white text-xs font-semibold">Date</TableHead>
              <TableHead className="text-white text-xs font-semibold">Care Team</TableHead>
              <TableHead className="text-white text-xs font-semibold text-right">Cost</TableHead>
              <TableHead className="text-white text-xs font-semibold text-center">Status</TableHead>
              <TableHead className="text-white text-xs font-semibold text-center pr-4">Billing</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-(--color-synapse-light)" />
                    <span className="text-xs font-medium">Loading treatments...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTreatments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
                    <HeartHandshake className="h-8 w-8 text-slate-300 stroke-[1.5] mb-1" />
                    <p className="font-semibold text-sm text-slate-700">No treatment sessions found</p>
                    <p className="text-xs text-slate-400">
                      {searchQuery || typeFilter !== "all" || statusFilter !== "all" || billingFilter !== "all"
                        ? "Try clearing your search query or status filter to see all sessions"
                        : "No recorded treatments for this patient yet"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTreatments.map((treatment, idx) => {
                const isProcedure = treatment.type === "Procedure" || treatment.category === "Procedure";
                const isPendingOrActive = treatment.status === "Pending" || treatment.status === "In-Progress";

                const itemsTotal = (treatment.items || []).reduce(
                  (acc, it) => acc + (it.total || it.unitPrice * (it.quantity || 1) || 0),
                  0
                );

                const primaryItem = treatment.items?.[0];
                const otherItemsCount = (treatment.items?.length || 1) - 1;

                return (
                  <TableRow
                    key={treatment._id || idx}
                    className={cn(
                      "hover:bg-slate-50/80 transition-colors",
                      isPendingOrActive ? (isProcedure ? "bg-amber-50/20" : "bg-purple-50/20") : ""
                    )}
                  >
                    {/* Index */}
                    <TableCell className="font-semibold text-slate-500 text-xs">
                      {idx + 1}
                    </TableCell>

                    {/* Type Badge */}
                    <TableCell>
                      {isProcedure ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-semibold text-[10px] px-2 py-0.5 gap-1">
                          <FlaskConical className="w-3 h-3 text-amber-700" />
                          <span>Procedure</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-semibold text-[10px] px-2 py-0.5 gap-1">
                          <HeartHandshake className="w-3 h-3 text-purple-700" />
                          <span>Therapy</span>
                        </Badge>
                      )}
                    </TableCell>

                    {/* Treatment Items */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-slate-900">
                          {primaryItem?.name || treatment.category || "Treatment Session"}
                          {otherItemsCount > 0 && (
                            <span className="text-[10px] text-slate-500 font-normal ml-1">
                              (+{otherItemsCount} more)
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono">{treatment.mrn}</span>
                          {primaryItem?.parentName && (
                            <>
                              <span>•</span>
                              <span>{primaryItem.parentName}</span>
                            </>
                          )}
                        </div>
                        {treatment.notes && (
                          <span className="text-[10px] text-slate-600 italic line-clamp-1 mt-0.5">
                            "{treatment.notes}"
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Session */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-slate-800">
                          Session #{treatment.sessionNumber || 1}
                        </span>
                        {treatment.isRepeated && (
                          <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-700 px-1 py-0 border-blue-200">
                            Repeat
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-slate-800">
                          {fDate(treatment.treatmentDate || treatment.createdAt)}
                        </span>
                        {treatment.completedAt && (
                          <span className="text-[10px] text-emerald-600">
                            Done {fDate(treatment.completedAt)}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Practitioner / Doctor */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col text-xs">
                        <span className="text-slate-800 font-medium">
                          {treatment.therapistName && treatment.therapistName !== "-"
                            ? treatment.therapistName
                            : (treatment.therapist as any)?.name || "Unassigned"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Dr. {treatment.doctorName && treatment.doctorName !== "Self"
                            ? treatment.doctorName
                            : (treatment.doctor as any)?.name || "Doctor"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Cost */}
                    <TableCell className="text-right font-bold text-xs text-slate-900 whitespace-nowrap">
                      {formatINR(treatment.paidAmount || itemsTotal)}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center whitespace-nowrap">
                      {getStatusBadge(treatment.status)}
                    </TableCell>

                    {/* Billing */}
                    <TableCell className="text-center pr-4 whitespace-nowrap">
                      {getBillingBadge(treatment.billingStatus, treatment.billNo)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── 4. Collapsible Consultation Prescriptions Section ────────────── */}
      {consultTreatments.length > 0 && (
        <div className="rounded-xl border border-purple-100 bg-purple-50/20 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowConsultPlans(!showConsultPlans)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-purple-900 hover:bg-purple-50/60 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>
                Prescribed Treatment Plans in Consultations ({consultTreatments.length})
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-purple-700 font-medium">
              <span>{showConsultPlans ? "Hide details" : "View prescribed plans"}</span>
              {showConsultPlans ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showConsultPlans && (
            <div className="p-4 pt-1 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-purple-100">
              {consultTreatments.map((c, idx) => {
                const therapyNames = getFormattedTherapyNames(c.therapy, therapies);
                const procedureNames = getFormattedProcedureNames(c.procedure, procedures);
                const therapyNameList = therapyNames ? therapyNames.split(", ").filter(Boolean) : [];
                const procedureNameList = procedureNames ? procedureNames.split(", ").filter(Boolean) : [];
                const consultDate = fDate(c.appointment?.date || c.createdAt);

                return (
                  <div
                    key={c._id || idx}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>Visit: {consultDate}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Dr. {c.doctor?.name || "Doctor"}
                      </span>
                    </div>

                    {/* Therapies */}
                    {therapyNameList.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-[10px] font-bold uppercase text-purple-700 mr-1">Therapies:</span>
                        {therapyNameList.map((name: string, i: number) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-purple-50 text-purple-800 border-purple-200 text-[10px] px-1.5 py-0"
                          >
                            {name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Procedures */}
                    {procedureNameList.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-[10px] font-bold uppercase text-amber-700 mr-1">Procedures:</span>
                        {procedureNameList.map((name: string, i: number) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] px-1.5 py-0"
                          >
                            {name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Plan Details */}
                    {c.treatmentPlan && (c.treatmentPlan.sessions || c.treatmentPlan.frequency) && (
                      <p className="text-[11px] text-slate-600">
                        Plan: <b>{c.treatmentPlan.sessions || "—"} sessions</b> • {c.treatmentPlan.frequency || "Daily"}
                      </p>
                    )}

                    {/* Notes */}
                    {(c.therapyNotes || c.procedureNotes) && (
                      <p className="text-[11px] text-slate-500 italic">
                        "{c.therapyNotes || c.procedureNotes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
