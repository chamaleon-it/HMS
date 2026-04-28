"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppShell from "@/components/layout/app-shell";
import { fAge, fDate } from "@/lib/fDateAndTime";
import LabHeader from "@/components/dashboard/lab/LabHeader";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { RegisterPatient } from "../../pharmacy/RegisterPatient";

const Patients: React.FC = () => {
    const router = useRouter();
    const [editPatient, setEditPatient] = useState<any>(null);

    const { data: patientsData, mutate } = useSWR<{
        message: string;
        data: {
            lastVisit: Date;
            visits: number;
            _id: string;
            name: string;
            phoneNumber: string;
            gender: string;
            dateOfBirth: Date;
            address: string;
            mrn: string;
        }[];
    }>("/lab/report/patients");

    const patients = patientsData?.data ?? [];

    return (
        <AppShell>
            <TooltipProvider>
                <div className="bg-slate-50 p-5 min-h-[calc(100vh-80px)]">
                    <main className="space-y-6">
                        <div className="flex items-center justify-between gap-3 w-full">
                            <LabHeader
                                title="Customers"
                                subtitle="Click a row to open full lab history for that Customers."
                            >
                            </LabHeader>
                            <div className="text-sm text-slate-500 bg-white/70 border rounded-full px-4 py-1 shadow-sm">
                                Showing <span className="font-semibold">{patients.length}</span>{" "}
                                of <span className="font-semibold">{patients.length}</span>{" "}
                                patients
                            </div>
                        </div>

                        <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200">
                            <Table>
                                <TableHeader className="">
                                    <TableRow className="bg-slate-700 hover:bg-slate-700 text-white uppercase">
                                        <TableHead className="text-white py-3">Sl</TableHead>
                                        <TableHead className="text-white py-3">Customer</TableHead>
                                        <TableHead className="text-white py-3">PID</TableHead>
                                        <TableHead className="text-white py-3">
                                            Age / Gender
                                        </TableHead>
                                        <TableHead className="text-white py-3">Phone</TableHead>
                                        <TableHead className="text-white py-3 text-right">
                                            Visits
                                        </TableHead>
                                        <TableHead className="text-white py-3 text-right">
                                            Last Visit
                                        </TableHead>
                                        <TableHead className="text-white py-3 text-right pr-4">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="text-[15px]">
                                    {patients.map((p, idx) => {
                                        const hasHistory = p.visits > 0;
                                        const isRepeat = p.visits > 1;

                                        return (
                                            <TableRow
                                                key={p._id}
                                                className={`cursor-pointer transition-all duration-150 ease-out ${idx % 2
                                                    ? "bg-white hover:bg-white/60"
                                                    : "bg-slate-100 hover:bg-slate-100/60"
                                                    } hover:-translate-y-px hover:shadow-sm`}
                                                onClick={() =>
                                                    router.push(
                                                        `/dashboard/lab/patients/single?id=${p._id}`
                                                    )
                                                }
                                            >
                                                <TableCell className="py-3 align-middle text-slate-500">
                                                    {idx + 1}
                                                </TableCell>
                                                <TableCell className="py-3 align-middle font-medium">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[15px] text-slate-900">
                                                            {p.name}
                                                        </span>
                                                        <span className="text-[12px] text-slate-500 truncate max-w-65">
                                                            {p.address}
                                                        </span>
                                                        <div className="flex flex-wrap gap-1 mt-0.5">
                                                            {!hasHistory && (
                                                                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-medium">
                                                                    New
                                                                </Badge>
                                                            )}
                                                            {isRepeat && (
                                                                <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-medium">
                                                                    Repeat
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 align-middle text-slate-700">
                                                    {p.mrn}
                                                </TableCell>
                                                <TableCell className="py-3 align-middle text-slate-700">
                                                    {fAge(p.dateOfBirth).years}y {fAge(p.dateOfBirth).months}m / {p.gender}
                                                </TableCell>
                                                <TableCell className="py-3 align-middle text-slate-700">
                                                    {p.phoneNumber}
                                                </TableCell>
                                                <TableCell className="py-3 align-middle text-right text-slate-900">
                                                    {p.visits}
                                                </TableCell>
                                                <TableCell className="py-3 align-middle text-right text-slate-700">
                                                    {fDate(p.lastVisit)}
                                                </TableCell>
                                                <TableCell className="py-3 align-middle text-right pr-4">
                                                    <div className="flex justify-end items-center gap-1">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.stopPropagation();
                                                                        router.push(
                                                                            `/dashboard/lab/patients/single?id=${p._id}`
                                                                        );
                                                                    }}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>View History</p>
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.stopPropagation();
                                                                        setEditPatient(p);
                                                                    }}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Edit Patient</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}

                                    {patients.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="text-center text-slate-500 py-6"
                                            >
                                                No patients found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </main>
                </div>
            </TooltipProvider>

            <Dialog
                open={Boolean(editPatient)}
                onOpenChange={(v) => !v && setEditPatient(null)}
            >
                <DialogContent className="max-w-3xl!">
                    <DialogHeader>
                        <DialogTitle>Edit Patient</DialogTitle>
                    </DialogHeader>
                    <RegisterPatient
                        onClose={() => setEditPatient(null)}
                        mutate={mutate}
                        patient={editPatient}
                    />
                </DialogContent>
            </Dialog>
        </AppShell>
    );
};

export default Patients;
