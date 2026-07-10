"use client";

import AppShell from "@/components/layout/app-shell";
import AdminHeader from "../components/AdminHeader";
import useSWR from "swr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TechniciansPage() {
    const { data: technicianResponse, isLoading } = useSWR("/technician");
    const technicians = technicianResponse?.data || [];

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <AdminHeader
                    title="Technicians"
                    subtitle="Manage your lab technicians and their qualifications."
                />

                <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 overflow-x-auto">
                    <Table className="min-w-fit">
                        <TableHeader className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark)">
                            <TableRow className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) border-b-0">
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 pl-4">Name</TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Qualification</TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">License No.</TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Designation</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                        {Array.from({ length: 4 }).map((_, j) => (
                                            <TableCell key={j} className="py-3 px-4">
                                                <div className="h-5 w-full animate-pulse bg-slate-100 rounded" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : technicians.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground bg-white">
                                        No technicians found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                technicians.map((p: any, idx: number) => (
                                    <TableRow
                                        key={p._id}
                                        className={cn(
                                            "group transition-colors",
                                            idx % 2 === 0 ? "bg-white hover:bg-white/60" : "bg-slate-50 hover:bg-slate-50/60"
                                        )}
                                    >
                                        <TableCell className="py-3 pl-4 font-medium text-slate-900 flex items-center gap-2">
                                            {p.name} {p.inCharge && <CircleCheck size={14} className="text-green-500 fill-green-500/20" />}
                                        </TableCell>
                                        <TableCell className="py-3 text-slate-600">
                                            {p.qualification || <span className="text-slate-400 italic text-[11px]">Not set</span>}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            {p.licenseNumber ? (
                                                p.licenseNumber
                                            ) : (
                                                <span className="text-slate-400 italic text-[11px]">Not set</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-3 text-slate-600 font-medium text-[13px]">
                                            {p.designation || <span className="text-slate-400 italic text-[11px]">Not set</span>}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppShell>
    );
}
