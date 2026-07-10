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
import { fAge, fDate , fAgeString} from "@/lib/fDateAndTime";
import LabHeader from "@/components/dashboard/lab/LabHeader";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, ClipboardPlus, CalendarPlus } from "lucide-react";
import { AppointmentDialog } from "@/components/shared/appointment/AppointmentDialog";
import { useAuth } from "@/auth/context/auth-context";
import { useLabDrafts } from "../LabDraftContext";
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
import { PatientForm } from "@/components/shared/patient/PatientForm";
import Filter, { FilterType } from "./Filter";
import { PaginationBar } from "../../pharmacy/components/PaginationBar";
import { TableSkeleton } from "../../pharmacy/components/PharmacySkeleton";

const Patients: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { addDraft } = useLabDrafts();
    const [editPatient, setEditPatient] = useState<any>(null);
    const [appointmentPatient, setAppointmentPatient] = useState<any>(null);
    const [openCreate, setOpenCreate] = useState(false);

    const [filter, setFilter] = useState<FilterType>({
        query: undefined,
        address: undefined,
        gender: undefined,
        doctor: undefined,
        age: [0, 100],
        lastVisit: undefined,
        alreadyPurchase: false,
        page: 1,
        limit: 20,
        dateRange: { from: undefined, to: undefined },
    });

    const params = new URLSearchParams();

    params.set("alreadyPurchase", filter.alreadyPurchase ? "true" : "false");
    params.set("page", String(filter.page));
    params.set("limit", String(filter.limit));
    if (filter.query) params.set("query", filter.query);
    if (filter.address) params.set("address", filter.address);
    if (filter.city) params.set("city", filter.city);
    if (filter.district) params.set("district", filter.district);
    if (filter.state) params.set("state", filter.state);
    if (filter.pincode) params.set("pincode", filter.pincode);
    if (filter.gender) params.set("gender", filter.gender);
    if (filter.doctor) params.set("doctor", filter.doctor);
    if (filter.dateRange.from) params.set("from", filter.dateRange.from);
    if (filter.dateRange.to) params.set("to", filter.dateRange.to);
    if (filter.age[0] !== 0 || filter.age[1] !== 100) {
        params.set("minAge", filter.age[0].toString());
        params.set("maxAge", filter.age[1].toString());
    }
    if (filter.lastVisit) params.set("lastVisit", String(filter.lastVisit));

    const { data: patientsData, mutate, isLoading } = useSWR<{
        message: string;
        total: number;
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
    }>(`/lab/report/patients?${params.toString()}`);

    const patients = patientsData?.data ?? [];
    const total = patientsData?.total ?? 0;

    return (
        <AppShell>
            <TooltipProvider>
                <div className="bg-slate-50 p-5 min-h-[calc(100vh-67px)]">
                    <main className="space-y-6">
                        <div className="flex items-center justify-between gap-3 w-full">
                            <LabHeader
                                title="Patients"
                                subtitle="Click a row to open full lab history for that patient."
                            />
                            <div className="text-sm text-slate-500 bg-white/70 border rounded-full px-4 py-1 shadow-sm">
                                Showing <span className="font-semibold">{patients.length}</span>{" "}
                                of <span className="font-semibold">{total}</span>{" "}
                                patients
                            </div>
                        </div>

                        <Filter filter={filter} setFilter={setFilter} />

                        {isLoading ? (
                            <TableSkeleton rows={10} columns={8} />
                        ) : (
                        <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200">
                            <Table>
                                <TableHeader className="">
                                    <TableRow className="bg-[var(--color-synapse-dark)] hover:bg-[var(--color-synapse-dark)] text-white uppercase">
                                        <TableHead className="text-white py-3">Sl</TableHead>
                                        <TableHead className="text-white py-3">Customer</TableHead>
                                        <TableHead className="text-white py-3">OP NO</TableHead>
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
                                                    {(filter.page - 1) * filter.limit + idx + 1}
                                                </TableCell>
                                                <TableCell className="py-3 align-middle font-medium">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[15px] text-slate-900">
                                                            <HighlightText text={p.name} highlight={filter.query || ""} />
                                                        </span>
                                                        <span className="text-[12px] text-slate-500 truncate max-w-65">
                                                            <HighlightText text={p.address} highlight={filter.query || ""} />
                                                        </span>
                                                        <div className="flex flex-wrap gap-1 mt-0.5">
                                                            {!hasHistory && (
                                                                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-medium">
                                                                    New
                                                                </Badge>
                                                            )}
                                                            {isRepeat && (
                                                                <Badge className="bg-[var(--color-synapse-light)]/10 text-[var(--color-synapse-light)] border border-[var(--color-synapse-light)]/20 text-[10px] font-medium">
                                                                    Repeat
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 align-middle text-slate-700">
                                                    <HighlightText text={p.mrn} highlight={filter.query || ""} />
                                                </TableCell>
                                                <TableCell className="py-3 align-middle text-slate-700">
                                                    {fAgeString(p.dateOfBirth)} / {p.gender}
                                                </TableCell>
                                                <TableCell className="py-3 align-middle text-slate-700">
                                                    <HighlightText text={p.phoneNumber.length < 5 ? "-" : p.phoneNumber} highlight={filter.query || ""} />
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
                                                                    className="h-8 w-8 text-[var(--color-synapse-light)] hover:text-[var(--color-synapse-light)] hover:bg-blue-50"
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
                                                        
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.stopPropagation();
                                                                        addDraft({ patient: p._id }, "Book Now", p.mrn ? `${p.name} - (${p.mrn})` : p.name);
                                                                    }}
                                                                >
                                                                    <ClipboardPlus className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Book Now</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.stopPropagation();
                                                                        setAppointmentPatient(p);
                                                                    }}
                                                                >
                                                                    <CalendarPlus className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>New Appointment</p>
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
                            {total > filter.limit && (
                                <div className="px-2 py-0 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
                                    <PaginationBar
                                        page={filter.page}
                                        limit={filter.limit}
                                        total={total}
                                        setFilter={setFilter}
                                        disabled={isLoading}
                                    />
                                </div>
                            )}
                        </div>
                        )}
                    </main>
                </div>

                {appointmentPatient && (
                    <AppointmentDialog
                        open={!!appointmentPatient}
                        onOpenChange={(open) => !open && setAppointmentPatient(null)}
                        appointment={{ patient: appointmentPatient }}
                        mutate={mutate}
                    />
                )}

            </TooltipProvider>

            <Dialog
                open={Boolean(editPatient)}
                onOpenChange={(v) => !v && setEditPatient(null)}
            >
                <DialogContent className="max-w-3xl!">
                    <DialogHeader>
                        <DialogTitle>Edit Patient</DialogTitle>
                    </DialogHeader>
                    <PatientForm
                        onClose={() => setEditPatient(null)}
                        mutate={mutate}
                        patient={editPatient}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={openCreate} onOpenChange={(v) => !v && setOpenCreate(false)}>
                <DialogContent className="max-w-3xl! max-h-[90dvh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Patient Register</DialogTitle>
                    </DialogHeader>
                    <PatientForm
                        onClose={() => setOpenCreate(false)}
                        mutate={mutate}
                    />
                </DialogContent>
            </Dialog>
        </AppShell>
    );
};

const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!text) return null;
    if (!highlight || !highlight.trim()) {
        return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <span key={i} className="bg-yellow-200 text-slate-900 rounded-[1px] px-0.5">
                        {part}
                    </span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
};

export default Patients;
