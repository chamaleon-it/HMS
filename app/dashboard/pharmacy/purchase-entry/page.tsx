"use client";

import React, { useState, useEffect, useMemo } from "react";
import AppShell from "@/components/layout/app-shell";
import PharmacyHeader from "../components/PharmacyHeader";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/fNumber";
import { fDate } from "@/lib/fDateAndTime";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
    Plus,
    RefreshCw,
    Receipt,
    CreditCard,
    ArrowUpDown,
    Eye,
    Search,
    IndianRupee,
    AlertCircle,
    CheckCircle2,
    Clock,
    X,
    Boxes,
    RotateCcw,
    FileText,
    Loader2,
} from "lucide-react";
import DateRangeFilter from "@/components/dashboard/billing/DateRangeFilter";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { generatePurchaseReportPdf } from "@/lib/generatePurchaseReportPdf";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import useSWR from "swr";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { PaginationBar } from "../components/PaginationBar";

export interface PurchaseEntryItem {
    _id: string;
    item?: {
        _id: string;
        name: string;
        generic?: string;
        hsnCode?: string;
        sku?: string;
        unitPrice: number;
    };
    batch: string;
    quantity: number;
    pack: number;
    unitPrice: number;
    expiryDate: string | Date;
    purchasePrice: number;
    gst: number;
    discount: number;
    free: number;
}

export interface PurchaseEntry {
    _id: string;
    supplier?: {
        _id: string;
        name: string;
        phone?: string;
        email?: string;
        contactPerson?: string;
        gstin?: string;
        address?: any;
        paymentTerms?: number;
        balance?: number;
    };
    invoiceNumber: string;
    invoiceDate: string | Date;
    gstEnabled?: boolean;
    tscEnabled?: boolean;
    items: PurchaseEntryItem[];
    subTotal: number;
    discount: number;
    gst: number;
    transportCharge: number;
    total: number;
    paidAmount: number;
    description?: string;
    paymentStatus: "Pending" | "Partially Paid" | "Paid" | string;
    createdAt: string | Date;
    updatedAt?: string | Date;
}

interface FilterState {
    page: number;
    limit: number;
    status: string;
    search: string;
    activeDate: "Today" | "7 days" | "30 days" | "Custom";
    dateRange?: DateRange;
    date?: Date;
}

export default function PurchaseEntriesListPage() {
    const router = useRouter();

    // Server-side filter state
    const [filter, setFilter] = useState<FilterState>({
        page: 1,
        limit: 10,
        status: "all",
        search: "",
        activeDate: "Today",
        dateRange: { from: new Date(), to: new Date() },
        date: new Date(),
    });

    // Local search input for debouncing
    const [searchInput, setSearchInput] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilter((prev) => {
                if (prev.search === searchInput) return prev;
                return { ...prev, search: searchInput, page: 1 };
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Construct query string for server-side pagination
    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", filter.page.toString());
        params.set("limit", filter.limit.toString());
        if (filter.status !== "all") params.set("status", filter.status);
        if (filter.search.trim()) params.set("search", filter.search.trim());

        let sd: Date = startOfDay(new Date());
        let ed: Date = endOfDay(new Date());

        if (filter.activeDate === "Today") {
            sd = startOfDay(new Date());
            ed = endOfDay(new Date());
        } else if (filter.activeDate === "7 days") {
            sd = startOfDay(subDays(new Date(), 7));
            ed = endOfDay(new Date());
        } else if (filter.activeDate === "30 days") {
            sd = startOfDay(subDays(new Date(), 30));
            ed = endOfDay(new Date());
        } else if (filter.activeDate === "Custom") {
            const from = filter.dateRange?.from || filter.date || new Date();
            const to = filter.dateRange?.to || from;
            sd = startOfDay(from);
            ed = endOfDay(to);
        }

        params.set("startDate", sd.toISOString());
        params.set("endDate", ed.toISOString());
        params.set("activeDate", filter.activeDate);

        return params.toString();
    }, [filter]);

    // Data fetching with server-side pagination
    const { data: response, error, isLoading, mutate } = useSWR<{
        data: PurchaseEntry[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        stats?: {
            totalEntries: number;
            totalValue: number;
            totalPaid: number;
            totalDue: number;
        };
    }>(`/purchase_entry?${queryString}`, (url: string) =>
        api.get(url).then((res) => res.data)
    );

    const entries = response?.data || [];
    const total = response?.total || 0;
    const stats = response?.stats || {
        totalEntries: total,
        totalValue: 0,
        totalPaid: 0,
        totalDue: 0,
    };

    // Client-side sorting for current page view
    const [sortBy, setSortBy] = useState<keyof PurchaseEntry>("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Payment Modal State
    const [paymentModalEntry, setPaymentModalEntry] = useState<PurchaseEntry | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    const sortedEntries = useMemo(() => {
        const list = [...entries];
        list.sort((a, b) => {
            let valA: any = a[sortBy];
            let valB: any = b[sortBy];

            if (sortBy === "createdAt" || sortBy === "invoiceDate") {
                valA = new Date(valA || 0).getTime();
                valB = new Date(valB || 0).getTime();
            } else if (typeof valA === "number" && typeof valB === "number") {
                // numeric comparison
            } else {
                valA = String(valA || "").toLowerCase();
                valB = String(valB || "").toLowerCase();
            }

            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
        return list;
    }, [entries, sortBy, sortOrder]);

    const handleSort = (column: keyof PurchaseEntry) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("desc");
        }
    };

    const handleStatusChange = (status: string) => {
        setFilter((prev) => ({ ...prev, status, page: 1 }));
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setFilter((prev) => ({ ...prev, search: "", page: 1 }));
    };

    const handleReset = () => {
        setSearchInput("");
        setFilter({
            page: 1,
            limit: 10,
            status: "all",
            search: "",
            activeDate: "Today",
            dateRange: { from: new Date(), to: new Date() },
            date: new Date(),
        });
    };

    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    const handleDownloadReport = async () => {
        try {
            setIsDownloadingPdf(true);

            let sd: Date = startOfDay(new Date());
            let ed: Date = endOfDay(new Date());

            if (filter.activeDate === "Today") {
                sd = startOfDay(new Date());
                ed = endOfDay(new Date());
            } else if (filter.activeDate === "7 days") {
                sd = startOfDay(subDays(new Date(), 7));
                ed = endOfDay(new Date());
            } else if (filter.activeDate === "30 days") {
                sd = startOfDay(subDays(new Date(), 30));
                ed = endOfDay(new Date());
            } else if (filter.activeDate === "Custom") {
                const from = filter.dateRange?.from || filter.date || new Date();
                const to = filter.dateRange?.to || from;
                sd = startOfDay(from);
                ed = endOfDay(to);
            }

            const params = new URLSearchParams();
            params.set("page", "1");
            params.set("limit", "100000");
            if (filter.status !== "all") params.set("status", filter.status);
            if (filter.search.trim()) params.set("search", filter.search.trim());
            params.set("startDate", sd.toISOString());
            params.set("endDate", ed.toISOString());

            const res = await api.get(`/purchase_entry?${params.toString()}`);
            const reportData = res.data?.data || [];

            if (!reportData || reportData.length === 0) {
                toast.error("No purchase entries available to generate report for selected filters.");
                return;
            }

            await generatePurchaseReportPdf({
                entries: reportData,
                datePresetLabel: filter.activeDate,
                startDate: sd.toISOString(),
                endDate: ed.toISOString(),
                statusFilter: filter.status === "all" ? "ALL" : filter.status,
                searchQuery: filter.search,
            });

            toast.success("Pharmacy purchase report downloaded successfully!");
        } catch (err: any) {
            console.error("Failed to generate purchase report:", err);
            toast.error("Failed to generate purchase report. Please try again.");
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const handleOpenPaymentModal = (entry: PurchaseEntry) => {
        setPaymentModalEntry(entry);
        const remainingDue = Math.max(0, (entry.total || 0) - (entry.paidAmount || 0));
        setPaymentAmount(remainingDue > 0 ? remainingDue.toString() : "");
    };

    const handleAddPaymentSubmit = async () => {
        if (!paymentModalEntry) return;
        const amountNum = parseFloat(paymentAmount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error("Please enter a valid payment amount");
            return;
        }

        const remainingDue = Math.max(0, paymentModalEntry.total - paymentModalEntry.paidAmount);
        if (amountNum > remainingDue) {
            toast.error(`Amount exceeds balance due (${formatINR(remainingDue)})`);
            return;
        }

        setIsSubmittingPayment(true);
        try {
            await api.patch(`/purchase_entry/add_payment/${paymentModalEntry._id}`, {
                paidAmount: amountNum,
            });
            toast.success("Payment recorded successfully");
            setPaymentModalEntry(null);
            setPaymentAmount("");
            mutate();
        } catch (err: any) {
            console.error("Payment error:", err);
            toast.error(err.response?.data?.message || "Failed to record payment");
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Paid":
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 inline-flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Paid
                    </Badge>
                );
            case "Partially Paid":
                return (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 inline-flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Partially Paid
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 inline-flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        Pending
                    </Badge>
                );
        }
    };

    if (error) {
        return (
            <AppShell>
                <div className="p-5 flex items-center justify-center min-h-[calc(100vh-67px)]">
                    <div className="text-center">
                        <p className="text-red-500 font-medium text-base">Failed to load purchase entries</p>
                        <Button variant="outline" className="mt-4" onClick={() => mutate()}>
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
            <div className="p-5 min-h-[calc(100vh-67px)] w-full">
                <main className="flex flex-col gap-6">
                    {/* Header */}
                    <PharmacyHeader
                        title="Purchase Entries"
                        subtitle="Manage, track, and record supplier purchase invoices and inventory records"
                    >
                        <Button
                            className="bg-(--color-synapse-light) text-white shadow-md font-semibold hover:opacity-95"
                            onClick={() => router.push("/dashboard/pharmacy/purchase-entry/new")}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Purchase Entry
                        </Button>
                    </PharmacyHeader>

                    {/* Summary Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 shadow-xs transition-all hover:scale-[1.01]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                                    Total Invoices
                                </span>
                                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-700">
                                    <Receipt className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">
                                {stats.totalEntries}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Recorded purchase bills</p>
                        </div>

                        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 shadow-xs transition-all hover:scale-[1.01]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">
                                    Total Value
                                </span>
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-700">
                                    <IndianRupee className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">
                                {formatINR(stats.totalValue)}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Gross purchase expenditure</p>
                        </div>

                        <div className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-100 shadow-xs transition-all hover:scale-[1.01]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wider">
                                    Paid Amount
                                </span>
                                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-700">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">
                                {formatINR(stats.totalPaid)}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Settled payments to suppliers</p>
                        </div>

                        <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-100 shadow-xs transition-all hover:scale-[1.01]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-rose-700 uppercase tracking-wider">
                                    Outstanding Due
                                </span>
                                <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-700">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-rose-600">
                                {formatINR(stats.totalDue)}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Pending payments to clear</p>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-4">
                        {/* Search */}
                        <div className="space-y-1.5 flex-1 max-w-sm">
                            <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search by invoice number..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-9 pr-8 bg-slate-50 border-slate-200 focus:bg-white text-sm h-10 rounded-lg"
                                />
                                {searchInput && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-full hover:bg-slate-100"
                                        title="Clear search"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right-aligned filters group: Date Filter, Status, Reset */}
                        <div className="flex flex-wrap items-end gap-3 justify-end">
                            {/* Date Filter */}
                            <div className="space-y-1.5 min-w-45">
                                <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
                                    Date Filter
                                </label>
                                <div className="block">
                                    <DateRangeFilter
                                        activeDate={filter.activeDate}
                                        setActiveDate={(activeDate) =>
                                            setFilter((prev) => ({ ...prev, activeDate, page: 1 }))
                                        }
                                        dateRange={filter.dateRange}
                                        setDateRange={(dateRange) =>
                                            setFilter((prev) => ({
                                                ...prev,
                                                dateRange,
                                                date: dateRange?.from,
                                                page: 1,
                                            }))
                                        }
                                        date={filter.date}
                                        setDate={(date) =>
                                            setFilter((prev) => ({ ...prev, date, page: 1 }))
                                        }
                                        isLoading={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Status Filter Tabs */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
                                    Status
                                </label>
                                <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-lg h-10">
                                    {[
                                        { key: "all", label: "All" },
                                        { key: "Paid", label: "Paid" },
                                        { key: "Partially Paid", label: "Partially Paid" },
                                        { key: "Pending", label: "Pending" },
                                    ].map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => handleStatusChange(tab.key)}
                                            className={cn(
                                                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer",
                                                filter.status === tab.key
                                                    ? "bg-white text-slate-800 shadow-xs"
                                                    : "text-slate-600 hover:text-slate-900"
                                            )}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reset Button */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] text-transparent select-none uppercase tracking-widest font-semibold ml-1 hidden sm:block">
                                    Reset
                                </label>
                                <Button
                                    variant="outline"
                                    className="h-10 px-4 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                                    onClick={handleReset}
                                    title="Reset all filters"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span className="text-xs">Reset</span>
                                </Button>
                            </div>

                            {/* Download Report Button */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] text-transparent select-none uppercase tracking-widest font-semibold ml-1 hidden sm:block">
                                    Report
                                </label>
                                <Button
                                    variant="outline"
                                    disabled={isDownloadingPdf}
                                    className="h-10 px-4 border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer disabled:opacity-50"
                                    onClick={handleDownloadReport}
                                    title="Download PDF Report"
                                >
                                    {isDownloadingPdf ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                                    ) : (
                                        <FileText className="h-4 w-4 text-rose-600" />
                                    )}
                                    <span className="text-xs">Download Report</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50 border-b border-slate-200">
                                <TableRow>
                                    <TableHead
                                        className="font-bold text-slate-700 cursor-pointer select-none"
                                        onClick={() => handleSort("invoiceNumber")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Invoice No
                                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="font-bold text-slate-700 cursor-pointer select-none"
                                        onClick={() => handleSort("invoiceDate")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Invoice Date
                                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-700">
                                        Supplier
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-700 text-center">
                                        Items
                                    </TableHead>
                                    <TableHead
                                        className="font-bold text-slate-700 text-right cursor-pointer select-none"
                                        onClick={() => handleSort("total")}
                                    >
                                        <div className="flex items-center justify-end gap-1.5">
                                            Total Amount
                                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="font-bold text-slate-700 text-right cursor-pointer select-none"
                                        onClick={() => handleSort("paidAmount")}
                                    >
                                        <div className="flex items-center justify-end gap-1.5">
                                            Paid
                                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-700 text-right">
                                        <div className="flex items-center justify-end">Due Balance</div>
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-700 text-right">
                                        <div className="flex items-center justify-end">Status</div>
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-700 text-right pr-6">
                                        <div className="flex items-center justify-end">Actions</div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 6 }).map((_, idx) => (
                                        <TableRow key={idx} className="animate-pulse">
                                            <TableCell><div className="h-4 w-24 bg-slate-200 rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-20 bg-slate-200 rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-36 bg-slate-200 rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-12 bg-slate-200 rounded mx-auto" /></TableCell>
                                            <TableCell><div className="h-4 w-20 bg-slate-200 rounded ml-auto" /></TableCell>
                                            <TableCell><div className="h-4 w-16 bg-slate-200 rounded ml-auto" /></TableCell>
                                            <TableCell><div className="h-4 w-16 bg-slate-200 rounded ml-auto" /></TableCell>
                                            <TableCell><div className="h-6 w-20 bg-slate-200 rounded ml-auto" /></TableCell>
                                            <TableCell><div className="h-8 w-16 bg-slate-200 rounded ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : sortedEntries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Receipt className="w-12 h-12 text-slate-300" />
                                                <p className="text-slate-600 font-semibold text-base">No purchase entries found</p>
                                                <p className="text-slate-400 text-sm max-w-sm">
                                                    {filter.search || filter.status !== "all" || filter.activeDate !== "Today"
                                                        ? "Try changing your search terms, status, or date range."
                                                        : "No purchase entries recorded for Today. Try selecting '7 days' or '30 days'."}
                                                </p>
                                                {filter.activeDate === "Today" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2 text-xs border-slate-300"
                                                        onClick={() => setFilter((prev) => ({ ...prev, activeDate: "7 days", page: 1 }))}
                                                    >
                                                        View Last 7 Days
                                                    </Button>
                                                )}
                                                {!filter.search && filter.status === "all" && (
                                                    <Button
                                                        className="mt-3 bg-(--color-synapse-light) text-white font-semibold shadow-xs"
                                                        onClick={() => router.push("/dashboard/pharmacy/purchase-entry/new")}
                                                    >
                                                        <Plus className="w-4 h-4 mr-1.5" />
                                                        Create Purchase Entry
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedEntries.map((entry) => {
                                        const due = Math.max(0, (entry.total || 0) - (entry.paidAmount || 0));
                                        const itemsCount = entry.items?.length || 0;

                                        return (
                                            <TableRow
                                                key={entry._id}
                                                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                                                onClick={() => router.push(`/dashboard/pharmacy/purchase-entry/single?id=${entry._id}`)}
                                            >
                                                {/* Invoice No */}
                                                <TableCell className="font-semibold text-slate-800">
                                                    <div className="flex items-center gap-1.5 text-blue-600 group-hover:underline">
                                                        <Receipt className="w-3.5 h-3.5 text-blue-500" />
                                                        {entry.invoiceNumber || "—"}
                                                    </div>
                                                </TableCell>

                                                {/* Invoice Date */}
                                                <TableCell className="text-slate-600 text-sm">
                                                    {entry.invoiceDate ? fDate(entry.invoiceDate) : "—"}
                                                </TableCell>

                                                {/* Supplier */}
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-800 text-sm">
                                                            {entry.supplier?.name || "Unknown Supplier"}
                                                        </span>
                                                        {entry.supplier?.phone && (
                                                            <span className="text-xs text-slate-400">
                                                                {entry.supplier.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Items */}
                                                <TableCell className="text-center">
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                                        <Boxes className="w-3 h-3 text-slate-500" />
                                                        {itemsCount}
                                                    </span>
                                                </TableCell>

                                                {/* Total */}
                                                <TableCell className="text-right font-bold text-slate-800 tabular-nums">
                                                    {formatINR(entry.total || 0)}
                                                </TableCell>

                                                {/* Paid */}
                                                <TableCell className="text-right text-emerald-700 font-semibold tabular-nums text-sm">
                                                    {formatINR(entry.paidAmount || 0)}
                                                </TableCell>

                                                {/* Due */}
                                                <TableCell className={cn(
                                                    "text-right font-semibold tabular-nums text-sm",
                                                    due > 0 ? "text-rose-600" : "text-slate-400"
                                                )}>
                                                    {formatINR(due)}
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end">
                                                        {getStatusBadge(entry.paymentStatus)}
                                                    </div>
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {due > 0 && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 px-2.5 text-xs font-semibold text-emerald-700 border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100"
                                                                onClick={() => handleOpenPaymentModal(entry)}
                                                            >
                                                                <CreditCard className="w-3.5 h-3.5 mr-1" />
                                                                Pay
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                                            onClick={() => router.push(`/dashboard/pharmacy/purchase-entry/single?id=${entry._id}`)}
                                                            title="View Purchase Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>

                        {/* Server-side Pagination Bar */}
                        <PaginationBar
                            page={filter.page}
                            limit={filter.limit}
                            total={total}
                            setFilter={setFilter}
                            disabled={isLoading}
                        />
                    </div>
                </main>
            </div>

            {/* Quick Add Payment Modal */}
            <Dialog
                open={Boolean(paymentModalEntry)}
                onOpenChange={(open) => !open && setPaymentModalEntry(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-800">
                            <CreditCard className="w-5 h-5 text-emerald-600" />
                            Record Supplier Payment
                        </DialogTitle>
                        <DialogDescription>
                            Add a payment towards Invoice #{paymentModalEntry?.invoiceNumber || ""}
                        </DialogDescription>
                    </DialogHeader>

                    {paymentModalEntry && (
                        <div className="space-y-4 py-2">
                            {/* Invoice Summary Box */}
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Supplier:</span>
                                    <span className="font-bold text-slate-800">
                                        {paymentModalEntry.supplier?.name || "—"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Invoice Amount:</span>
                                    <span className="font-semibold text-slate-800">
                                        {formatINR(paymentModalEntry.total)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Already Paid:</span>
                                    <span className="font-semibold text-emerald-600">
                                        {formatINR(paymentModalEntry.paidAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-slate-200">
                                    <span className="font-bold text-slate-700">Remaining Balance Due:</span>
                                    <span className="font-bold text-rose-600">
                                        {formatINR(Math.max(0, paymentModalEntry.total - paymentModalEntry.paidAmount))}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Input */}
                            <div className="space-y-1.5">
                                <Label htmlFor="paymentAmount" className="text-xs font-bold text-slate-700">
                                    Payment Amount (INR)
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                                        ₹
                                    </span>
                                    <Input
                                        id="paymentAmount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={Math.max(0, paymentModalEntry.total - paymentModalEntry.paidAmount)}
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="pl-7 text-base font-bold text-slate-800"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setPaymentModalEntry(null)}
                            disabled={isSubmittingPayment}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            onClick={handleAddPaymentSubmit}
                            disabled={isSubmittingPayment}
                        >
                            {isSubmittingPayment ? "Recording..." : "Confirm Payment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}
