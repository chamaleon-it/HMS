"use client";

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import { Plus, RefreshCw } from "lucide-react";
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
import api from "@/lib/axios";
import { formatINR } from "@/lib/fNumber";
import { fDate, fTime } from "@/lib/fDateAndTime";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

type ReturnItem = {
    quantity?: number;
    unitPrice?: number;
    reason?: string;
    name?: { name?: string } | string | null;
};

type ReturnBill = {
    _id: string;
    billNo?: string;
    saleBillNo?: string;
    createdAt?: string;
    refundMode?: string;
    returnedBy?: string;
    remarks?: string;
    patient?: {
        name?: string;
        phoneNumber?: string;
    } | null;
    order?: {
        mrn?: string;
    } | null;
    items?: ReturnItem[];
};

function medicineName(item: ReturnItem) {
    if (item.name && typeof item.name === "object") return item.name.name || "—";
    return "—";
}

function refundAmount(bill: ReturnBill) {
    return (bill.items ?? []).reduce(
        (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
        0,
    );
}

export default function ReturnBillsPage() {
    const { data: bills = [], error, isLoading, mutate } = useSWR<ReturnBill[]>(
        "/pharmacy/return",
        fetcher,
    );

    return (
        <AppShell>
            <div className="p-5 min-h-[calc(100vh-67px)]">
                <main className="flex flex-col gap-6">
                    <PharmacyHeader
                        title="Pharmacy Return"
                        subtitle="Return bills"
                    >
                        <Button
                            asChild
                            className="bg-(--color-synapse-light) text-white shadow-md font-semibold"
                        >
                            <Link href="/dashboard/pharmacy/return/new/">
                                <Plus className="w-4 h-4 mr-2" />
                                New Return
                            </Link>
                        </Button>
                    </PharmacyHeader>

                    <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 overflow-x-auto">
                        <Table className="min-w-[1100px]">
                            <TableHeader className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark)">
                                <TableRow className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) border-b-0">
                                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 px-4">Sl No</TableHead>
                                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">Return Bill</TableHead>
                                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">Date</TableHead>
                                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">Patient</TableHead>
                                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">Sale Bill</TableHead>
                                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">Refund Mode</TableHead>
                                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">Returned By</TableHead>
                                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">Medicines</TableHead>
                                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 text-right">Amount</TableHead>
                                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 pr-4">Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="text-[15px]">
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-10 text-slate-500">
                                            Loading return bills...
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-10">
                                            <p className="text-red-500 font-medium">Failed to load return bills</p>
                                            <Button variant="outline" className="mt-4" onClick={() => mutate()}>
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Retry
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ) : bills.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center text-slate-500 py-6" data-testid="return-bills-empty">
                                            No return bills found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bills.map((bill, index) => (
                                        <TableRow
                                            key={bill._id}
                                            data-testid="return-bill-row"
                                            className={index % 2 === 0 ? "bg-white" : "bg-slate-100"}
                                        >
                                            <TableCell className="py-3 pl-4 text-slate-500">{index + 1}</TableCell>
                                            <TableCell className="py-3 font-medium text-slate-900">{bill.billNo || "—"}</TableCell>
                                            <TableCell className="py-3 text-slate-700">
                                                {bill.createdAt ? `${fDate(bill.createdAt)}, ${fTime(bill.createdAt)}` : "—"}
                                            </TableCell>
                                            <TableCell className="py-3 text-slate-900">
                                                <div>{bill.patient?.name || "—"}</div>
                                                <div className="text-xs text-slate-500">{bill.patient?.phoneNumber || ""}</div>
                                            </TableCell>
                                            <TableCell className="py-3 text-slate-700">{bill.saleBillNo || "—"}</TableCell>
                                            <TableCell className="py-3 text-slate-700">{bill.refundMode || "—"}</TableCell>
                                            <TableCell className="py-3 text-slate-700">{bill.returnedBy || "—"}</TableCell>
                                            <TableCell className="py-3 text-slate-700">
                                                {(bill.items ?? []).length === 0
                                                    ? "—"
                                                    : (bill.items ?? []).map((item, itemIndex) => (
                                                        <div key={`${bill._id}-${itemIndex}`}>
                                                            {medicineName(item)} × {item.quantity ?? 0}
                                                        </div>
                                                    ))}
                                            </TableCell>
                                            <TableCell className="py-3 text-right font-semibold text-slate-900">
                                                {formatINR(refundAmount(bill))}
                                            </TableCell>
                                            <TableCell className="py-3 pr-4 text-slate-600">{bill.remarks || "—"}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </main>
            </div>
        </AppShell>
    );
}
