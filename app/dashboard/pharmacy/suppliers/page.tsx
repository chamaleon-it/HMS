"use client";

import React, { useState } from "react";
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
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Drawer from "@/components/ui/drawer";
import { AddSupplier } from "./AddSupplier";
import { DUMMY_SUPPLIERS } from "./data";
import { Supplier } from "./interface";

const SuppliersPage: React.FC = () => {
    const router = useRouter();
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [suppliers] = useState<Supplier[]>(DUMMY_SUPPLIERS); // Using Dummy Data

    return (
        <AppShell>
            <div className="p-5 min-h-[calc(100vh-80px)]">
                <main className="flex flex-col gap-6">
                    <PharmacyHeader
                        title="Suppliers"
                        subtitle="Manage your pharmacy suppliers"
                    >
                        <Button
                            className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
                            onClick={() => setIsAddDrawerOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Supplier
                        </Button>
                    </PharmacyHeader>

                    <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 overflow-x-auto">
                        <Table className="min-w-[1000px]">
                            <TableHeader className="bg-slate-700 hover:bg-slate-700">
                                <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 px-4 pl-4">Sl No</TableHead>
                                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Seller Name</TableHead>
                                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Phone Number</TableHead>
                                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">GSTIN</TableHead>
                                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">DL No</TableHead>
                                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 text-right">
                                        Total Purchase Count
                                    </TableHead>
                                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 text-right pr-4">
                                        Purchase Value
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="text-[15px]">
                                {suppliers.map((supplier, idx) => (
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
                                            {supplier.phoneNumber}
                                        </TableCell>
                                        <TableCell className="py-3 align-middle text-slate-700">
                                            {supplier.gstin}
                                        </TableCell>
                                        <TableCell className="py-3 align-middle text-slate-700">
                                            {supplier.dlNumber || "-"}
                                        </TableCell>
                                        <TableCell className="py-3 align-middle text-right text-slate-900">
                                            {supplier.totalPurchaseCount}
                                        </TableCell>
                                        <TableCell className="py-3 align-middle text-right font-semibold text-slate-900 pr-4">
                                            {formatINR(supplier.totalPurchaseValue)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {suppliers.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
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
                <AddSupplier onClose={() => setIsAddDrawerOpen(false)} />
            </Drawer>
        </AppShell>
    );
};

export default SuppliersPage;
