"use client";

import AppShell from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";

import AdminHeader from "../components/AdminHeader";

export default function DoctorsPage() {
    const { data, isLoading } = useSWR("/admin/doctors");
    const doctors = data?.data || [];

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <AdminHeader
                    title="Doctors Management"
                    subtitle="Manage doctor profiles, schedules, and departments."
                >
                </AdminHeader>

                <Card>
                    <CardHeader>
                        <CardTitle>All Doctors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div>Loading doctors...</div>
                        ) : (
                            <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 overflow-x-auto">
                                <Table className="print:hidden min-w-fit">
                                    <TableHeader className="bg-[var(--color-cosmo-dark)] hover:bg-[var(--color-cosmo-dark)]">
                                        <TableRow className="bg-[var(--color-cosmo-dark)] hover:bg-[var(--color-cosmo-dark)] border-b-0">
                                            <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 pl-4">Doctor Name</TableHead>
                                            <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Specialization</TableHead>
                                            <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Contact</TableHead>
                                            <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {doctors.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                                                    No doctors found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {doctors.map((doctor: any, idx: number) => (
                                            <TableRow key={doctor._id} className={idx % 2 === 0 ? "bg-white hover:bg-white/60" : "bg-slate-100 hover:bg-slate-100/60"}>
                                                <TableCell className="font-medium py-3 pl-4 text-slate-900">Dr. {doctor.name}</TableCell>
                                                <TableCell className="py-3 text-slate-700">{doctor.specialization || "General"}</TableCell>
                                                <TableCell className="py-3 text-slate-700">{doctor.email}</TableCell>
                                                <TableCell className="py-3">
                                                    <Badge className={doctor.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-none' : 'bg-slate-100 text-slate-700 border-none'}>
                                                        {doctor.status || 'Active'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
