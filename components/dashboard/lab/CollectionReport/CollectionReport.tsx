"use client";

import React, { useState, useMemo } from "react";
import LabHeader from "../LabHeader";
import {
    CheckCircle,
    Clock,
    Printer,
    Search,
    TestTube2,
    FlaskConical,
    FileText,
    AlertTriangle,
    Eye,
    Trash,
    Pencil,
    Calendar,
    Plus,
    Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import LabViewOrder from "../LabViewOrder";
import NewTest from "../Home/NewTest";

// Mock Data
const theme = {
    from: "#4f46e5",
    to: "#ec4899",
    accent: "#06b6d4",
};

const SAMPLES: { id: string; patient: string; mrn: string; test: string; sampleType: string; time: string; status: string; waitTime: string; priority: string }[] = [

];

type StatusType = "Pending" | "Sample Collected" | "Waiting for Result" | "Completed";

function SampleCollectionStatus({
    currentStatus,
    setCurrentStatus,
}: {
    currentStatus: StatusType;
    setCurrentStatus: (status: StatusType) => void;
}) {
    const tabs = useMemo<{ key: StatusType; icon: React.ElementType }[]>(
        () => [
            { key: "Pending", icon: Clock },
            { key: "Sample Collected", icon: TestTube2 },
            { key: "Waiting for Result", icon: FlaskConical },
            { key: "Completed", icon: CheckCircle },
        ],
        []
    );

    return (
        <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1 shadow-sm">
            {tabs.map(({ key, icon: Icon }) => {
                const active = currentStatus === key;
                return (
                    <button
                        key={key}
                        onClick={() => setCurrentStatus(key)}
                        className={
                            "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer font-medium " +
                            (active ? "text-white" : "text-slate-600 hover:bg-slate-50")
                        }
                        type="button"
                    >
                        {active && (
                            <motion.span
                                layoutId="tab-indicator"
                                className="absolute inset-0 rounded-full"
                                style={{ background: "linear-gradient(90deg, #4f46e5, #ec4899)" }}
                                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Icon size={16} /> {key}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    const map: Record<string, string> = {
        STAT: "bg-rose-100 text-rose-700 border-rose-200",
        VIP: "bg-purple-100 text-purple-700 border-purple-200",
        Routine: "bg-sky-100 text-sky-700 border-sky-200",
    };
    return (
        <Badge variant="outline" className={map[priority] || "bg-slate-100 text-slate-700 border-slate-200"}>
            {priority}
        </Badge>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        "Pending": "bg-amber-100 text-amber-700 border-amber-200",
        "Sample Collected": "bg-blue-100 text-blue-700 border-blue-200",
        "Waiting for Result": "bg-indigo-100 text-indigo-700 border-indigo-200",
        "Completed": "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return (
        <Badge variant="outline" className={map[status] || "bg-slate-100 text-slate-700 border-slate-200"}>
            {status}
        </Badge>
    );
}



export default function CollectionReport() {
    const [samples, setSamples] = useState(SAMPLES);
    const [status, setStatus] = useState<StatusType>("Pending");
    const [search, setSearch] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSample, setSelectedSample] = useState<string | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingSample, setEditingSample] = useState<typeof SAMPLES[0] | null>(null);
    const [viewOrderOpen, setViewOrderOpen] = useState(false);
    const [viewingSample, setViewingSample] = useState<typeof SAMPLES[0] | null>(null);

    const [newTestOpen, setNewTestOpen] = useState(false);
    const [bookingType, setBookingType] = useState<"Book Now" | "Schedule">("Book Now");

    const filteredSamples = samples.filter(sample =>
        (status === "Pending" ? true : sample.status === status) &&
        (sample.status === status) &&
        (sample.patient.toLowerCase().includes(search.toLowerCase()) ||
            sample.mrn.toLowerCase().includes(search.toLowerCase()) ||
            sample.test.toLowerCase().includes(search.toLowerCase()))
    );

    const confirmDelete = (id: string) => {
        setSelectedSample(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (selectedSample) {
            setSamples(prev => prev.filter(s => s.id !== selectedSample));
            setDeleteDialogOpen(false);
            setSelectedSample(null);
        }
    };

    const handleEdit = (sample: typeof SAMPLES[0]) => {
        setEditingSample(sample);
        setEditDialogOpen(true);
    };

    const saveEdit = () => {
        if (editingSample) {
            setSamples(prev => prev.map(s => s.id === editingSample.id ? editingSample : s));
            setEditDialogOpen(false);
            setEditingSample(null);
        }
    };

    const handleViewOrder = (sample: typeof SAMPLES[0]) => {
        setViewingSample(sample);
        setViewOrderOpen(true);
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col gap-6 w-full bg-linear-to-b from-white to-zinc-50/50 p-6 min-h-[calc(100vh-80px)]">
                <LabHeader
                    title="Sample Collection"
                    subtitle="Manage and track patient sample collection workflow"
                >
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input
                                placeholder="Search..."
                                className="pl-9 h-10 w-64 bg-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <SampleCollectionStatus currentStatus={status} setCurrentStatus={setStatus} />
                        <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1 shadow-sm">
                            {[
                                { key: "Book Now", label: "Book now", icon: Zap },
                                { key: "Schedule", label: "Schedule", icon: Calendar },
                            ].map(({ key, label, icon: Icon }) => {
                                const active = bookingType === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setBookingType(key as "Book Now" | "Schedule");
                                            setNewTestOpen(true);
                                        }}
                                        className={
                                            "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer font-medium " +
                                            (active ? "text-white" : "text-slate-600 hover:bg-slate-50")
                                        }
                                        type="button"
                                    >
                                        {active && (
                                            <motion.span
                                                layoutId="booking-tab-indicator"
                                                className="absolute inset-0 rounded-full"
                                                style={{ background: `linear-gradient(90deg, ${theme.from}, ${theme.to})` }}
                                                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            <Icon size={16} /> {label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </LabHeader>

                <div className="bg-white/90 border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                    <Table className="min-w-fit">
                        <TableHeader className="bg-slate-700">
                            <TableRow className="hover:bg-slate-700 border-b-0">
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 pl-4 w-16">Sl No</TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3">Sample ID</TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3">Patient</TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 text-center">Test Info</TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 text-center">Priority</TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 text-center">Status</TableHead>
                                <TableHead className="text-left text-white font-bold text-[11px] uppercase tracking-wider py-3">Collection Time</TableHead>
                                <TableHead className="text-right text-white font-bold text-[11px] uppercase tracking-wider py-3 pr-4">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSamples.map((sample, idx) => (
                                <TableRow
                                    key={sample.id}
                                    className={idx % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50 hover:bg-slate-100"}
                                >
                                    <TableCell className="py-3 pl-4 text-slate-500 font-medium">
                                        {idx + 1}
                                    </TableCell>
                                    <TableCell className="py-3 font-medium text-slate-900">
                                        {sample.id}
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <div className="font-medium text-slate-900">{sample.patient}</div>
                                                <div className="text-[11px] text-slate-500">({sample.mrn})</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-medium text-slate-700">{sample.test}</span>
                                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full mt-1 border border-slate-200">
                                                {sample.sampleType}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 text-center">
                                        <PriorityBadge priority={sample.priority} />
                                    </TableCell>
                                    <TableCell className="py-3 text-center">
                                        <StatusBadge status={sample.status} />
                                    </TableCell>
                                    <TableCell className="py-3 text-sm text-slate-600">
                                        {new Date(sample.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        <div className="text-[10px] text-slate-400">Wait: {sample.waitTime}</div>
                                    </TableCell>
                                    <TableCell className="py-3 text-right pr-4">
                                        <div className="flex justify-end items-center gap-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                                        onClick={() => handleViewOrder(sample)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>View Details</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            {sample.status !== "Sample Collected" && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={() => handleEdit(sample)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Edit Sample</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => confirmDelete(sample.id)}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Delete Sample</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            {sample.status !== "Pending" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2 h-8 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800 ml-1"
                                                    onClick={() => window.print()}
                                                >
                                                    <Printer className="h-3.5 w-3.5" />
                                                    Print Result
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredSamples.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-zinc-500">
                                        No samples found for status "{status}".
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the sample record.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Sample Status</DialogTitle>
                            <DialogDescription>
                                Update the status of the sample.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                    Status
                                </Label>
                                <Select
                                    value={editingSample?.status}
                                    onValueChange={(value) =>
                                        setEditingSample(prev => prev ? { ...prev, status: value as string } : null)
                                    }
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Sample Collected">Sample Collected</SelectItem>
                                        <SelectItem value="Waiting for Result">Waiting for Result</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={saveEdit}>Save changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <LabViewOrder
                    open={viewOrderOpen}
                    setOpen={setViewOrderOpen}
                    sample={viewingSample}
                    onUpdateStatus={(newStatus) => {
                        if (viewingSample) {
                            const updated = { ...viewingSample, status: newStatus as StatusType };
                            setSamples(prev => prev.map(s => s.id === viewingSample.id ? updated : s));
                            setViewingSample(updated);
                        }
                    }}
                />

                <NewTest
                    open={newTestOpen}
                    onOpenChange={setNewTestOpen}
                    defaultBookingType={bookingType}
                    mutate={() => {
                        // In a real app, we would reload data here.
                        // For now, since CollectionReport uses mock data, we just close the dialog.
                        setNewTestOpen(false);
                    }}
                />
            </div>
        </TooltipProvider>
    );
}
