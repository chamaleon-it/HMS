"use client";

import React, { useState, useMemo } from "react";

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
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Users, ShoppingBag, BarChart3, CreditCard, ArrowUpDown } from "lucide-react";

import Drawer from "@/components/ui/drawer";
import { AddSupplier } from "./AddSupplier";
import { Supplier } from "./interface";
import useSWR from "swr";
import api from "@/lib/axios";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

const SuppliersPage: React.FC = () => {
    const router = useRouter();
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

    const { data: suppliers = [], error, isLoading, mutate } = useSWR<Supplier[]>("/suppliers", fetcher);
    const [sortBy, setSortBy] = useState<keyof Supplier | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const sortedSuppliers = useMemo(() => {
        if (!sortBy) return suppliers;
        return [...suppliers].sort((a, b) => {
            const valA = (a[sortBy] as number) || 0;
            const valB = (b[sortBy] as number) || 0;
            return sortOrder === "asc" ? valA - valB : valB - valA;
        });
    }, [suppliers, sortBy, sortOrder]);

    const handleSort = (column: keyof Supplier) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("desc");
        }
    };

    const stats = {
        totalSuppliers: suppliers.length,
        totalPurchase: suppliers.reduce((acc, s) => acc + (s.totalPurchaseValue || 0), 0),
        totalPurchaseCount: suppliers.reduce((acc, s) => acc + (s.totalPurchaseCount || 0), 0),
        totalDue: suppliers.reduce((acc, s) => acc + (s.totalDue || 0), 0),
    };

    if (error) {
        return (
            <AppShell>
                <div className="p-5 flex items-center justify-center min-h-[calc(100vh-80px)]">
                    <div className="text-center">
                        <p className="text-red-500 font-medium">Failed to load suppliers</p>
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
            <div className="p-5 min-h-[calc(100vh-80px)]">
                <main className="flex flex-col gap-6">
                    <PharmacyHeader
                        title="Suppliers"
                        subtitle="Manage your pharmacy suppliers"
                    >
                        <Button
                            className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md font-semibold"
                            onClick={() => setIsAddDrawerOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Supplier
                        </Button>
                    </PharmacyHeader>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm transition-all hover:scale-[1.02]">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4 text-blue-600/70" />
                                    <p className="text-[11px] font-semibold text-blue-800/70 uppercase tracking-widest">Total Suppliers</p>
                                </div>
                                <h3 className="text-3xl font-bold text-blue-900 leading-none">{stats.totalSuppliers}</h3>
                            </div>
                        </div>

                        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 shadow-sm transition-all hover:scale-[1.02]">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShoppingBag className="w-4 h-4 text-emerald-600/70" />
                                    <p className="text-[11px] font-semibold text-emerald-800/70 uppercase tracking-widest">Total Purchase</p>
                                </div>
                                <h3 className="text-3xl font-bold text-emerald-900 leading-none">{formatINR(stats.totalPurchase)}</h3>
                            </div>
                        </div>

                        <div className="bg-sky-50/50 p-6 rounded-2xl border border-sky-100 shadow-sm transition-all hover:scale-[1.02]">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <BarChart3 className="w-4 h-4 text-sky-600/70" />
                                    <p className="text-[11px] font-semibold text-sky-800/70 uppercase tracking-widest">Purchase Count</p>
                                </div>
                                <h3 className="text-3xl font-bold text-sky-900 leading-none">{stats.totalPurchaseCount}</h3>
                            </div>
                        </div>

                        <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 shadow-sm transition-all hover:scale-[1.02]">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="w-4 h-4 text-rose-600/70" />
                                    <p className="text-[11px] font-semibold text-rose-800/70 uppercase tracking-widest">Total Due</p>
                                </div>
                                <h3 className="text-3xl font-bold text-rose-900 leading-none">{formatINR(stats.totalDue)}</h3>
                            </div>
                        </div>
                    </div>




                    <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 overflow-x-auto">
                        <Table className="min-w-[1000px]">
                            <TableHeader className="bg-slate-700 hover:bg-slate-700">
                                <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 px-4 pl-4">Sl No</TableHead>
                                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">Seller Name</TableHead>
                                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">Phone Number</TableHead>
                                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">GSTIN</TableHead>
                                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">DL No</TableHead>

                                    <SortableHeader
                                        label="Total Purchase Count"
                                        column="totalPurchaseCount"
                                        currentSort={sortBy}
                                        sortOrder={sortOrder}
                                        onSort={handleSort}
                                        className="text-right"
                                    />
                                    <SortableHeader
                                        label="Purchase Value"
                                        column="totalPurchaseValue"
                                        currentSort={sortBy}
                                        sortOrder={sortOrder}
                                        onSort={handleSort}
                                        className="text-right pr-4"
                                    />
                                    <SortableHeader
                                        label="Total Due"
                                        column="totalDue"
                                        currentSort={sortBy}
                                        sortOrder={sortOrder}
                                        onSort={handleSort}
                                        className="text-right pr-4"
                                    />
                                </TableRow>
                            </TableHeader>

                            <TableBody className="text-[15px]">
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10">
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
                                                <span className="text-slate-500">Loading suppliers...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedSuppliers.map((supplier, idx) => (
                                        <TableRow
                                            key={supplier._id}
                                            className={`cursor-pointer transition-all duration-150 ease-out ${idx % 2 === 0
                                                ? "bg-white hover:bg-white/60"
                                                : "bg-slate-100 hover:bg-slate-100/60"
                                                } hover:-translate-y-px hover:shadow-sm`}
                                            onClick={() => router.push(`/dashboard/pharmacy/suppliers/single?id=${supplier._id}`)}
                                        >

                                            <TableCell className="py-3 align-middle text-slate-500 pl-4">
                                                {idx + 1}
                                            </TableCell>
                                            <TableCell className="py-3 align-middle font-medium text-slate-900">
                                                {supplier.name}
                                            </TableCell>
                                            <TableCell className="py-3 align-middle text-slate-700">
                                                {supplier.phone}
                                            </TableCell>
                                            <TableCell className="py-3 align-middle text-slate-700">
                                                {supplier.gstin || "-"}
                                            </TableCell>
                                            <TableCell className="py-3 align-middle text-slate-700">
                                                {supplier.dlNo || "-"}
                                            </TableCell>
                                            <TableCell className="py-3 align-middle text-right text-slate-900">
                                                {supplier.totalPurchaseCount || 0}
                                            </TableCell>
                                            <TableCell className="py-3 align-middle text-right font-semibold text-slate-900 pr-4">
                                                {formatINR(supplier.totalPurchaseValue || 0)}
                                            </TableCell>
                                            <TableCell className="py-3 align-middle text-right font-semibold text-slate-900 pr-4">
                                                {formatINR(supplier.totalDue || 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {!isLoading && suppliers.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center text-slate-500 py-6"
                                        >
                                            No suppliers found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </main>
            </div>

            <Drawer
                open={isAddDrawerOpen}
                onClose={() => setIsAddDrawerOpen(false)}
                title="Add New Supplier"
            >
                <AddSupplier
                    onClose={() => setIsAddDrawerOpen(false)}
                    onRefresh={() => mutate()}
                />
            </Drawer>
        </AppShell>
    );
};

const SortableHeader = ({
    label,
    column,
    currentSort,
    sortOrder,
    onSort,
    className = "",
}: {
    label: string;
    column: keyof Supplier;
    currentSort: keyof Supplier | null;
    sortOrder: "asc" | "desc";
    onSort: (column: keyof Supplier) => void;
    className?: string;
}) => {
    const active = currentSort === column;
    return (
        <TableHead
            className={cn(
                "text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 cursor-pointer hover:bg-slate-600 transition-colors select-none",
                className
            )}
            onClick={() => onSort(column)}
        >
            <div className={cn("flex items-center gap-1 group", className.includes("text-right") ? "justify-end" : "justify-start")}>
                {label}
                <ArrowUpDown
                    className={cn(
                        "h-3 w-3 transition-colors",
                        active ? "text-white" : "text-slate-400 group-hover:text-white"
                    )}
                />
            </div>
        </TableHead>
    );
};

export default SuppliersPage;

