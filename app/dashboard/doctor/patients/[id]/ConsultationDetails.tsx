import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { fDate, fDateandTime } from "@/lib/fDateAndTime";
import {
    Activity,
    Calendar,
    ClipboardList,
    FileText,
    FlaskConical,
    Pill,
    Stethoscope,
} from "lucide-react";
import React from "react";
import { ConsultationType } from "./interface";

interface ConsultationDetailsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedRow: ConsultationType | null;
    onClose: () => void;
}

export default function ConsultationDetails({
    open,
    onOpenChange,
    selectedRow,
    onClose,
}: ConsultationDetailsProps) {
    if (!selectedRow) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b bg-muted/10 shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl">Consultation Details</DialogTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                                {fDateandTime(
                                    selectedRow.appointment?.date ?? selectedRow.createdAt
                                )}
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5">
                    {/* Doctor & Vitals Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Doctor Info */}
                        <Card className="shadow-sm border-muted-200">
                            <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Stethoscope className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-base font-semibold">
                                    Doctor & Appointment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-lg font-medium text-foreground">
                                        {selectedRow.doctor?.name ?? "—"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedRow.doctor?.specialization ?? "—"}
                                    </p>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-1">
                                            Method
                                        </p>
                                        <p className="font-medium">
                                            {selectedRow.appointment?.method ?? "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-1">
                                            Status
                                        </p>
                                        <Badge variant="secondary" className="font-normal">
                                            {selectedRow.appointment?.status ?? "—"}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-1">
                                            Payment
                                        </p>
                                        <p
                                            className={
                                                selectedRow.appointment?.isPaid
                                                    ? "text-green-600 font-medium"
                                                    : "text-muted-foreground"
                                            }
                                        >
                                            {selectedRow.appointment?.isPaid ? "Paid" : "Unpaid"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Examination / Vitals */}
                        <Card className="shadow-sm border-muted-200">
                            <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-base font-semibold">
                                    Examination & Vitals
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <VitalItem
                                        label="BP"
                                        value={selectedRow.examinationNote?.bp}
                                        unit="mmHg"
                                    />
                                    <VitalItem
                                        label="Heart Rate"
                                        value={selectedRow.examinationNote?.hr}
                                        unit="bpm"
                                    />
                                    <VitalItem
                                        label="SpO2"
                                        value={selectedRow.examinationNote?.spo2}
                                        unit="%"
                                    />
                                    <VitalItem
                                        label="Temp"
                                        value={selectedRow.examinationNote?.temp}
                                        unit={selectedRow.examinationNote?.tempUnit}
                                    />
                                    <VitalItem
                                        label="Resp. Rate"
                                        value={selectedRow.examinationNote?.rs}
                                        unit="/min"
                                    />
                                    <VitalItem
                                        label="CVS"
                                        value={selectedRow.examinationNote?.cvs}
                                    />
                                </div>
                                {(selectedRow.examinationNote?.pa ||
                                    selectedRow.examinationNote?.cns ||
                                    selectedRow.examinationNote?.otherNotes) && (
                                        <>
                                            <Separator className="my-4" />
                                            <div className="space-y-3 text-sm">
                                                {selectedRow.examinationNote?.pa && (
                                                    <div>
                                                        <span className="font-medium text-muted-foreground mr-2">
                                                            PA:
                                                        </span>
                                                        {selectedRow.examinationNote.pa}
                                                    </div>
                                                )}
                                                {selectedRow.examinationNote?.cns && (
                                                    <div>
                                                        <span className="font-medium text-muted-foreground mr-2">
                                                            CNS:
                                                        </span>
                                                        {selectedRow.examinationNote.cns}
                                                    </div>
                                                )}
                                                {selectedRow.examinationNote?.otherNotes && (
                                                    <div className="bg-muted/30 p-3 rounded-md mt-2">
                                                        <p className="text-xs font-medium text-muted-foreground mb-1 uppercase">
                                                            Other Notes
                                                        </p>
                                                        <p className="whitespace-pre-wrap">
                                                            {selectedRow.examinationNote.otherNotes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Clinical Notes */}
                    <Card className="shadow-sm border-muted-200">
                        <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <FileText className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-base font-semibold">
                                Clinical Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <NoteSection
                                title="Presenting History"
                                content={selectedRow.consultationNotes?.presentHistory}
                            />
                            <NoteSection
                                title="Past History"
                                content={selectedRow.consultationNotes?.pastHistory}
                            />
                            <NoteSection
                                title="Diagnosis"
                                content={selectedRow.consultationNotes?.diagnosis}
                                highlight
                            />
                        </CardContent>
                    </Card>

                    {/* Medicines & Tests Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Medicines */}
                        <Card className="shadow-sm border-muted-200 flex flex-col">
                            <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                    <Pill className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-base font-semibold">
                                    Medicines
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                {selectedRow.medicines && selectedRow.medicines.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedRow.medicines.map((m, i) => (
                                            <div
                                                key={m._id ?? i}
                                                className="flex flex-col sm:flex-row sm:items-start justify-between p-3 bg-muted/30 rounded-lg border border-transparent hover:border-muted-300 transition-colors"
                                            >
                                                <div>
                                                    <p className="font-semibold text-sm text-foreground">
                                                        {m.name?.name ?? "Unknown Medicine"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {m.frequency ?? "—"} • {m.duration ?? "—"} •{" "}
                                                        {m.food ?? "—"}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="mt-2 sm:mt-0">
                                                    {m.dosage ?? "—"}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState text="No medicines prescribed" />
                                )}
                            </CardContent>
                        </Card>

                        {/* Tests & Advice */}
                        <div className="space-y-6 flex flex-col">
                            <Card className="shadow-sm border-muted-200 flex-1">
                                <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                        <FlaskConical className="w-5 h-5" />
                                    </div>
                                    <CardTitle className="text-base font-semibold">
                                        Lab Tests
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {selectedRow.test && selectedRow.test.length > 0 ? (
                                        <ul className="space-y-3">
                                            {selectedRow.test.map((t, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">
                                                            {t.name?.map((n) => n.name).join(", ") ?? "—"}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                            <span>
                                                                {t.date ? fDate(t.date) : "No date"}
                                                            </span>
                                                            <span>•</span>
                                                            <span className="capitalize">
                                                                {t.priority ?? "Normal"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <EmptyState text="No tests ordered" />
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-muted-200">
                                <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                                    <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                                        <ClipboardList className="w-5 h-5" />
                                    </div>
                                    <CardTitle className="text-base font-semibold">
                                        Advice
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {selectedRow.advice ? (
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                                            {selectedRow.advice}
                                        </p>
                                    ) : (
                                        <EmptyState text="No advice given" />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-muted/10 shrink-0">
                    <div className="flex gap-2 justify-end w-full">
                        <Button variant="ghost" onClick={onClose}>
                            Close
                        </Button>
                        <DialogClose asChild>
                            <Button>Done</Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Helper Components

function VitalItem({
    label,
    value,
    unit,
}: {
    label: string;
    value?: string | number | null;
    unit?: string | null;
}) {
    return (
        <div className="flex flex-col p-2 rounded-md bg-muted/20">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {label}
            </span>
            <span className="font-semibold text-sm mt-1">
                {value ? (
                    <>
                        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
                    </>
                ) : (
                    "—"
                )}
            </span>
        </div>
    );
}

function NoteSection({
    title,
    content,
    highlight,
}: {
    title: string;
    content?: string | null;
    highlight?: boolean;
}) {
    return (
        <div className="flex flex-col gap-2">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
            </h5>
            <div
                className={`p-3 rounded-md text-sm min-h-[80px] ${highlight ? "bg-primary/5 border border-primary/10" : "bg-muted/30"
                    }`}
            >
                {content ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
                ) : (
                    <p className="text-muted-foreground italic">None</p>
                )}
            </div>
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground italic">{text}</p>
        </div>
    );
}

