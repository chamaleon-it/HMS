"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import AppShell from "@/components/layout/app-shell";
import AdminHeader from "../components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  CalendarDays,
  RefreshCw,
  FilterX,
  Users,
  Activity,
  Calendar,
  Layers,
} from "lucide-react";

import { ClinicalSummaryCards } from "./components/ClinicalSummaryCards";
import { VisitTrendsChart } from "./components/VisitTrendsChart";
import { DemographicsCharts } from "./components/DemographicsCharts";
import { ClinicalBreakdowns } from "./components/ClinicalBreakdowns";
import { PatientDirectoryTable } from "./components/PatientDirectoryTable";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function AdminClinicalPatientsPage() {
  // Date Range state
  const [dateRange, setDateRange] = useState<
    "today" | "weekly" | "monthly" | "yearly" | "custom"
  >("monthly");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Patient Directory Table state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Construct query parameter string for Clinical Analytics API
  const analyticsQueryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("range", dateRange);
    if (dateRange === "custom" && customStartDate) {
      params.set("startDate", customStartDate);
      if (customEndDate) params.set("endDate", customEndDate);
    }
    return params.toString();
  }, [dateRange, customStartDate, customEndDate]);

  // Construct query parameter string for Patients List API
  const patientsQueryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (searchTerm) params.set("search", searchTerm);
    if (genderFilter !== "ALL") params.set("gender", genderFilter);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    return params.toString();
  }, [page, limit, searchTerm, genderFilter, statusFilter]);

  // Fetch data with SWR
  const {
    data: analyticsRes,
    error: analyticsError,
    mutate: mutateAnalytics,
    isValidating: isValidatingAnalytics,
  } = useSWR(
    `/admin/clinical/analytics?${analyticsQueryString}`,
    fetcher,
    { refreshInterval: 60000 }
  );

  const {
    data: patientsRes,
    error: patientsError,
    mutate: mutatePatients,
    isValidating: isValidatingPatients,
  } = useSWR(
    `/admin/patients?${patientsQueryString}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const clinicalData = analyticsRes?.data;
  const patientsData = patientsRes?.data || [];
  const patientsTotal = patientsRes?.total || 0;

  const handleResetFilters = () => {
    setDateRange("monthly");
    setCustomStartDate("");
    setCustomEndDate("");
    setSearchTerm("");
    setGenderFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
    toast.success("Filters reset to default");
  };

  const handleRefresh = () => {
    mutateAnalytics();
    mutatePatients();
    toast.success("Clinical data refreshed");
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50/50 pb-12 space-y-6">
        <AdminHeader
          title="Clinical Statistics & Patients"
          subtitle="Hospital patient demographics, visit trends, diseases & treatment analytics"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header Title & Date Range Controls */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center ring-1 ring-blue-500/20 shadow-xs">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Clinical Statistics & Patient Analytics
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Diseases treated, patient demographics, visit trends, top medicines, therapies & tests
                </p>
              </div>
            </div>

            {/* Date Preset Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
                <button
                  onClick={() => {
                    setDateRange("today");
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dateRange === "today"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    setDateRange("weekly");
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dateRange === "weekly"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Weekly (7d)
                </button>
                <button
                  onClick={() => {
                    setDateRange("monthly");
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dateRange === "monthly"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Monthly (30d)
                </button>
                <button
                  onClick={() => {
                    setDateRange("yearly");
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dateRange === "yearly"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Yearly
                </button>
                <button
                  onClick={() => {
                    setDateRange("custom");
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dateRange === "custom"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Custom Range
                </button>
              </div>

              {/* Custom Date Range Picker */}
              {dateRange === "custom" && (
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                  <Input
                    type="date"
                    className="h-8 w-32 text-xs bg-white border-slate-200 rounded-xl"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                  <span className="text-xs text-slate-400 font-bold">to</span>
                  <Input
                    type="date"
                    className="h-8 w-32 text-xs bg-white border-slate-200 rounded-xl"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              )}

              {/* Reset & Refresh Buttons */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleResetFilters}
                className="h-9 w-9 rounded-2xl border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                title="Reset Filters"
              >
                <FilterX className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                className={`h-9 w-9 rounded-2xl border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 ${
                  isValidatingAnalytics ? "animate-spin" : ""
                }`}
                title="Refresh Analytics"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* 1. Summary Cards */}
          <ClinicalSummaryCards
            summary={clinicalData?.summary}
            isLoading={!analyticsRes && !analyticsError}
          />

          {/* 2. Visit Trends Chart */}
          <VisitTrendsChart
            data={clinicalData?.visitTrends}
            isLoading={!analyticsRes && !analyticsError}
          />

          {/* 3. Demographics Charts (Gender & Age Groups) */}
          <DemographicsCharts
            genderDistribution={clinicalData?.demographics?.genderDistribution}
            ageDistribution={clinicalData?.demographics?.ageDistribution}
            isLoading={!analyticsRes && !analyticsError}
          />

          {/* 4. Clinical Breakdowns (Top Cases, Medicines, Therapies, Lab Tests, Doctors, Departments) */}
          <ClinicalBreakdowns
            topComplaints={clinicalData?.topComplaints}
            topMedicines={clinicalData?.topMedicines}
            topTherapies={clinicalData?.topTherapies}
            topLabTests={clinicalData?.topLabTests}
            doctorStats={clinicalData?.doctorStats}
            departmentStats={clinicalData?.departmentStats}
            isLoading={!analyticsRes && !analyticsError}
          />

          {/* 5. Patient Directory Master Table */}
          <PatientDirectoryTable
            patients={patientsData}
            total={patientsTotal}
            page={page}
            limit={limit}
            isLoading={!patientsRes && !patientsError}
            onPageChange={(p) => setPage(p)}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
            searchTerm={searchTerm}
            onSearchChange={(t) => {
              setSearchTerm(t);
              setPage(1);
            }}
            genderFilter={genderFilter}
            onGenderChange={(g) => {
              setGenderFilter(g);
              setPage(1);
            }}
            statusFilter={statusFilter}
            onStatusChange={(s) => {
              setStatusFilter(s);
              setPage(1);
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
