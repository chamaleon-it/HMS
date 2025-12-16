"use client";

import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Upload } from "lucide-react";
import SendToLabDialog from "./SendToLabDialog";
import { fAge, fDateandTime } from "@/lib/fDateAndTime";

// Reusing types roughly matching LabTable
interface Report {
    id: string;
    patientName: string;
    patientMrn?: string;
    patientDob?: Date;
    patientGender?: string;
    testName: string; // This might need to be an array if we want exact matching, but string is okay for now if formatted
    status: string;
    createdAt: string | Date;
    sampleCollectedAt?: string | Date;
    labName?: string;
    sentAt?: string | Date;
}

interface Props {
    data: Report[];
    mode: "send" | "report" | "overview";
}

export default function ExternalLabTable({ data, mode }: Props) {
    return (
        <div className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
            <Table className="w-full whitespace-nowrap">
                <TableHeader className="bg-slate-700 hover:bg-slate-700">
                    <TableRow className="bg-slate-700 hover:bg-slate-700 border-b border-gray-200 text-xs uppercase tracking-wider text-white font-medium">
                        <TableHead className="w-10 text-left px-3 py-2 text-white font-medium">No.</TableHead>
                        <TableHead className="text-white font-medium">Patient</TableHead>
                        <TableHead className="text-white font-medium">Test</TableHead>
                        <TableHead className="text-white font-medium">Created At</TableHead>
                        <TableHead className="text-white font-medium">Status</TableHead>
                        {(mode === "report" || mode === "overview") && <TableHead className="text-white font-medium">External Lab</TableHead>}
                        <TableHead className="text-right text-white font-medium">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row, idx) => (
                        <TableRow key={row.id} className="group border-b border-gray-100 transition-colors duration-200 last:border-0 hover:bg-slate-50/50">
                            <TableCell className="px-3 py-2 text-sm text-gray-500">
                                {String(idx + 1).padStart(2, "0")}
                            </TableCell>
                            <TableCell className="px-3 py-2">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-900 text-sm">
                                        {row.patientName}
                                    </span>
                                    {row.patientMrn && (
                                        <span className="text-xs text-gray-500 mt-0.5">
                                            <span className="font-medium text-gray-600">
                                                {row.patientMrn}
                                            </span>{" "}
                                            • {row.patientDob ? `${fAge(new Date(row.patientDob))} yrs` : "-"} • {row.patientGender || "-"}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="px-3 py-2 text-sm text-gray-700">
                                <div className="flex flex-col gap-2">
                                    {/* Assuming testName is comma separated or single string, mimicking the list look */}
                                    <div className="flex items-center gap-1 h-5 font-medium text-sm">
                                        {row.testName}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="px-3 py-2 text-sm text-gray-500">
                                {fDateandTime(new Date(row.createdAt))}
                            </TableCell>
                            <TableCell className="px-3 py-2">
                                <Chip label={row.status} tone={statusTone(row.status)} />
                            </TableCell>
                            {(mode === "report" || mode === "overview") && (
                                <TableCell className="px-3 py-2 text-sm text-gray-500">
                                    {row.labName || "-"}
                                </TableCell>
                            )}
                            <TableCell className="px-3 py-2 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {mode === "send" && row.status === "Pending" && (
                                        <SendToLabDialog testName={row.testName} patientName={row.patientName} />
                                    )}

                                    {mode === "report" && row.status === "In Progress" && (
                                        <Button size="sm" variant="outline" className="h-8 gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                                            <Upload className="h-3 w-3" />
                                            Upload Result
                                        </Button>
                                    )}

                                    {(mode === "report" || mode === "overview") && row.status === "Completed" && (
                                        <Button size="sm" variant="outline" className="h-8 gap-2 bg-white text-gray-600 hover:bg-gray-100">
                                            <Eye className="h-3 w-3" />
                                            View
                                        </Button>
                                    )}

                                    {mode === "overview" && row.status !== "Completed" && (
                                        <span className="text-xs text-muted-foreground italic">Manage in {row.status === "Pending" ? "Send" : "Reports"}</span>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={(mode === "report" || mode === "overview") ? 7 : 6} className="h-24 text-center text-muted-foreground">
                                No tests found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

const statusTone = (s: string): "green" | "gray" | "red" | "blue" | "amber" =>
    s === "Completed"
        ? "green"
        : s === "Pending"
            ? "gray"
            : s === "In Progress"
                ? "amber"
                : "red";

const Chip: React.FC<{
    label: string;
    tone?: "green" | "gray" | "red" | "blue" | "amber";
}> = ({ label, tone = "gray" }) => {
    const tones: Record<string, string> = {
        green: "bg-emerald-50 text-emerald-700 ring-emerald-200/50",
        gray: "bg-slate-50 text-slate-600 ring-slate-200/50",
        red: "bg-rose-50 text-rose-700 ring-rose-200/50",
        blue: "bg-sky-50 text-sky-700 ring-sky-200/50",
        amber: "bg-amber-50 text-amber-700 ring-amber-200/50",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
        >
            <span
                className={`mr-1.5 h-1.5 w-1.5 rounded-full ${tone === "gray"
                    ? "bg-slate-400"
                    : tone === "green"
                        ? "bg-emerald-500"
                        : tone === "amber"
                            ? "bg-amber-500"
                            : tone === "blue"
                                ? "bg-sky-500"
                                : "bg-rose-500"
                    }`}
            ></span>
            {label}
        </span>
    );
};
