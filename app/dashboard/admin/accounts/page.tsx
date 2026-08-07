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
import {
  FilterX,
  RefreshCw,
  XCircle,
  CalendarDays,
} from "lucide-react";
import {
  TransactionType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/app/dashboard/pharmacy/accounts/types";
import { SummaryCards } from "./components/SummaryCards";
import { TrendChart } from "./components/TrendChart";
import { CategoryPieChart } from "./components/CategoryPieChart";
import { MonthlyBarChart } from "./components/MonthlyBarChart";
import { AnalyticsTable } from "./components/AnalyticsTable";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

type DatePreset =
  | "ALL"
  | "TODAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "THIS_QUARTER"
  | "THIS_YEAR"
  | "CUSTOM";

export default function AdminAccountsAnalyticsPage() {
  // Date Preset & Custom Range State
  const [datePreset, setDatePreset] = useState<DatePreset>("THIS_MONTH");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Filters State
  const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">("monthly");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Table State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("transactionDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Helper to format local Date into YYYY-MM-DD string
  const formatLocalYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const date = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${date}`;
  };

  // Compute effective start/end dates based on datePreset
  const computedDateRange = useMemo(() => {
    if (datePreset === "CUSTOM") {
      return { start: startDate, end: endDate };
    }

    const now = new Date();

    if (datePreset === "TODAY") {
      const todayStr = formatLocalYMD(now);
      return { start: todayStr, end: todayStr };
    }

    if (datePreset === "THIS_WEEK") {
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return {
        start: formatLocalYMD(startOfWeek),
        end: formatLocalYMD(endOfWeek),
      };
    }

    if (datePreset === "THIS_MONTH") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        start: formatLocalYMD(startOfMonth),
        end: formatLocalYMD(endOfMonth),
      };
    }

    if (datePreset === "LAST_MONTH") {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        start: formatLocalYMD(startOfLastMonth),
        end: formatLocalYMD(endOfLastMonth),
      };
    }

    if (datePreset === "THIS_QUARTER") {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
      const endOfQuarter = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
      return {
        start: formatLocalYMD(startOfQuarter),
        end: formatLocalYMD(endOfQuarter),
      };
    }

    if (datePreset === "THIS_YEAR") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      return {
        start: formatLocalYMD(startOfYear),
        end: formatLocalYMD(endOfYear),
      };
    }

    // "ALL"
    return { start: "", end: "" };
  }, [datePreset, startDate, endDate]);

  // Available Category Filter options
  const availableCategories = useMemo(() => {
    if (selectedType === TransactionType.Expense) return EXPENSE_CATEGORIES;
    if (selectedType === TransactionType.Income) return INCOME_CATEGORIES;
    return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  }, [selectedType]);

  // Query strings for analytics endpoint
  const analyticsQueryParams = new URLSearchParams();
  if (computedDateRange.start)
    analyticsQueryParams.set("startDate", computedDateRange.start);
  if (computedDateRange.end)
    analyticsQueryParams.set("endDate", computedDateRange.end);
  if (selectedType !== "ALL")
    analyticsQueryParams.set("type", selectedType);
  if (selectedCategory !== "ALL")
    analyticsQueryParams.set("category", selectedCategory);
  analyticsQueryParams.set("period", period);

  const {
    data: analyticsRes,
    error: analyticsError,
    isLoading: isAnalyticsLoading,
    mutate: mutateAnalytics,
  } = useSWR(`/accounts/analytics?${analyticsQueryParams.toString()}`, fetcher);

  const analyticsData = analyticsRes?.data || {};

  // Query strings for transactions table endpoint
  const tableQueryParams = new URLSearchParams();
  tableQueryParams.set("page", String(page));
  tableQueryParams.set("limit", String(limit));
  if (searchTerm.trim()) tableQueryParams.set("q", searchTerm.trim());
  if (computedDateRange.start)
    tableQueryParams.set("startDate", computedDateRange.start);
  if (computedDateRange.end)
    tableQueryParams.set("endDate", computedDateRange.end);
  if (selectedType !== "ALL") tableQueryParams.set("type", selectedType);
  if (selectedCategory !== "ALL") tableQueryParams.set("category", selectedCategory);
  if (sortBy) tableQueryParams.set("sortBy", sortBy);
  if (sortOrder) tableQueryParams.set("sortOrder", sortOrder);

  const {
    data: tableRes,
    isLoading: isTableLoading,
    mutate: mutateTable,
  } = useSWR(`/accounts?${tableQueryParams.toString()}`, fetcher);

  const transactions = tableRes?.data || [];
  const totalTransactions = tableRes?.total || 0;

  const handleResetFilters = () => {
    setDatePreset("THIS_MONTH");
    setStartDate("");
    setEndDate("");
    setPeriod("monthly");
    setSelectedType("ALL");
    setSelectedCategory("ALL");
    setSearchTerm("");
    setPage(1);
  };

  const handleRefresh = () => {
    mutateAnalytics();
    mutateTable();
  };

  if (analyticsError) {
    return (
      <AppShell>
        <div className="p-5 flex items-center justify-center min-h-[calc(100vh-67px)]">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">
              Failed to load analytics
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              An error occurred while computing financial statistics.
            </p>
            <Button
              variant="outline"
              className="rounded-xl border-slate-200"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-5 min-h-[calc(100vh-67px)] space-y-5">
        {/* Standard Admin Header */}
        <AdminHeader
          title="Accounts Analytics"
          subtitle="Comprehensive read-only financial reporting, category insights, and trend analysis"
        >
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              Read Only
            </span>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              Refresh Data
            </Button>
          </div>
        </AdminHeader>

        {/* Dynamic Date & Filter Control Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-slate-500" /> Date & Filter Controls
            </span>
            {(datePreset !== "ALL" ||
              selectedType !== "ALL" ||
              selectedCategory !== "ALL" ||
              startDate ||
              endDate) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7 rounded-lg font-medium"
                onClick={handleResetFilters}
              >
                <FilterX className="w-3.5 h-3.5 mr-1" /> Clear All Filters
              </Button>
            )}
          </div>

          {/* Date Range Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">
              Date Preset:
            </span>
            {(
              [
                { id: "ALL", label: "All Time" },
                { id: "TODAY", label: "Today" },
                { id: "THIS_WEEK", label: "This Week" },
                { id: "THIS_MONTH", label: "This Month" },
                { id: "LAST_MONTH", label: "Last Month" },
                { id: "THIS_QUARTER", label: "This Quarter" },
                { id: "THIS_YEAR", label: "This Year" },
                { id: "CUSTOM", label: "Custom Range" },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setDatePreset(preset.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  datePreset === preset.id
                    ? "bg-(--color-synapse-light) text-white border-(--color-synapse-light) shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Secondary Controls (Custom Dates, Type, Category, Period) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            {/* Start Date */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Start Date
              </label>
              <Input
                type="date"
                disabled={datePreset !== "CUSTOM"}
                className="h-10 rounded-xl border-slate-200 bg-white text-xs"
                value={computedDateRange.start}
                onChange={(e) => {
                  setDatePreset("CUSTOM");
                  setStartDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                End Date
              </label>
              <Input
                type="date"
                disabled={datePreset !== "CUSTOM"}
                className="h-10 rounded-xl border-slate-200 bg-white text-xs"
                value={computedDateRange.end}
                onChange={(e) => {
                  setDatePreset("CUSTOM");
                  setEndDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Period Grouping */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Trend Grouping
              </label>
              <Select
                value={period}
                onValueChange={(val: any) => setPeriod(val)}
              >
                <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="daily">Daily Breakdown</SelectItem>
                  <SelectItem value="monthly">Monthly Breakdown</SelectItem>
                  <SelectItem value="yearly">Yearly Breakdown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Transaction Type
              </label>
              <Select
                value={selectedType}
                onValueChange={(val) => {
                  setSelectedType(val);
                  setSelectedCategory("ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-xs">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value={TransactionType.Income}>Income</SelectItem>
                  <SelectItem value={TransactionType.Expense}>Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Category Filter
              </label>
              <Select
                value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50 max-h-56">
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 1. Summary Cards */}
        <SummaryCards
          summary={analyticsData.summary}
          isLoading={isAnalyticsLoading}
        />

        {/* 2. Interactive Charts (Trend Area & Category Pie/Donut) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <TrendChart
              data={analyticsData.trend}
              isLoading={isAnalyticsLoading}
            />
          </div>
          <div className="lg:col-span-1">
            <MonthlyBarChart
              data={analyticsData.trend}
              isLoading={isAnalyticsLoading}
            />
          </div>
        </div>

        {/* 3. Category Distribution Charts */}
        <CategoryPieChart
          expenseCategories={analyticsData.categoryBreakdown?.expenseCategories}
          incomeCategories={analyticsData.categoryBreakdown?.incomeCategories}
          isLoading={isAnalyticsLoading}
        />

        {/* 4. Read-Only Transaction Audit Table */}
        <AnalyticsTable
          transactions={transactions}
          total={totalTransactions}
          page={page}
          limit={limit}
          isLoading={isTableLoading}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          searchTerm={searchTerm}
          onSearchChange={(st) => {
            setSearchTerm(st);
            setPage(1);
          }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(col) => {
            if (sortBy === col) {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            } else {
              setSortBy(col);
              setSortOrder("desc");
            }
          }}
        />
      </div>
    </AppShell>
  );
}
