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
    HeartPulse,
    Pill,
    Sparkles,
    Stethoscope,
    UserCheck,
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

    const isAcupuncture =
        selectedRow.consultationType === "acupuncture" ||
        Boolean(selectedRow.acupunctureAssessment) ||
        Boolean(selectedRow.chiefComplaints);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b bg-muted/10 shrink-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <DialogTitle className="text-xl font-bold">Consultation Details</DialogTitle>
                            {isAcupuncture ? (
                                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                                    <Sparkles className="w-3.5 h-3.5 mr-1" /> Acupuncture Consultation
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="font-medium">
                                    Standard Consultation
                                </Badge>
                            )}
                        </div>
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
                                        {selectedRow?.doctor?.name ?? "—"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedRow?.doctor?.specialization ?? "—"}
                                    </p>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-1">
                                            Method
                                        </p>
                                        <p className="font-medium">
                                            {selectedRow?.appointment?.method ?? "In clinic"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-1">
                                            Status
                                        </p>
                                        <Badge variant="secondary" className="font-normal capitalize">
                                            {selectedRow.appointment?.status ?? "Consulted"}
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
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <VitalItem
                                        label="BP"
                                        value={selectedRow.acupunctureExamination?.bp || selectedRow.examinationNote?.bp}
                                        unit="mmHg"
                                    />
                                    <VitalItem
                                        label="Heart Rate / Pulse"
                                        value={selectedRow.acupunctureExamination?.pulse || selectedRow.examinationNote?.hr}
                                        unit="bpm"
                                    />
                                    <VitalItem
                                        label="Weight"
                                        value={selectedRow.acupunctureExamination?.weight}
                                        unit="kg"
                                    />
                                    <VitalItem
                                        label="SpO2"
                                        value={selectedRow.examinationNote?.spo2}
                                        unit="%"
                                    />
                                    <VitalItem
                                        label="Temp"
                                        value={selectedRow.examinationNote?.temp}
                                        unit={selectedRow.examinationNote?.tempUnit || "°C"}
                                    />
                                    {selectedRow.chiefComplaints?.painScore !== undefined && (
                                        <div className="flex flex-col p-2 rounded-md bg-emerald-50 border border-emerald-200">
                                            <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                                                Pain Score
                                            </span>
                                            <span className="font-extrabold text-sm text-emerald-900 mt-1">
                                                {selectedRow.chiefComplaints.painScore} / 10
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Additional Physical Findings */}
                                {(selectedRow.acupunctureExamination?.tenderness ||
                                    selectedRow.acupunctureExamination?.rom ||
                                    selectedRow.acupunctureExamination?.posture ||
                                    selectedRow.acupunctureExamination?.specialFindings ||
                                    selectedRow.examinationNote?.otherNotes) && (
                                        <>
                                            <Separator className="my-3" />
                                            <div className="space-y-2 text-xs">
                                                {selectedRow.acupunctureExamination?.tenderness && (
                                                    <p><span className="font-semibold text-slate-700">Tenderness:</span> {selectedRow.acupunctureExamination.tenderness}</p>
                                                )}
                                                {selectedRow.acupunctureExamination?.rom && (
                                                    <p><span className="font-semibold text-slate-700">Range of Motion:</span> {selectedRow.acupunctureExamination.rom}</p>
                                                )}
                                                {selectedRow.acupunctureExamination?.posture && (
                                                    <p><span className="font-semibold text-slate-700">Posture:</span> {selectedRow.acupunctureExamination.posture}</p>
                                                )}
                                                {selectedRow.acupunctureExamination?.specialFindings && (
                                                    <p><span className="font-semibold text-slate-700">Special Findings:</span> {selectedRow.acupunctureExamination.specialFindings}</p>
                                                )}
                                                {selectedRow.examinationNote?.otherNotes && (
                                                    <p className="bg-muted/30 p-2 rounded-md"><span className="font-semibold text-slate-700">Other Notes:</span> {selectedRow.examinationNote.otherNotes}</p>
                                                )}
                                            </div>
                                        </>
                                    )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chief Complaints (Acupuncture / Specialized) */}
                    {selectedRow.chiefComplaints && (
                        <Card className="shadow-sm border-muted-200">
                            <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                                <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
                                    <HeartPulse className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-base font-semibold">
                                    Chief Complaints
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                                        Complaints
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {selectedRow.chiefComplaints.complaints?.map((c, i) => (
                                            <Badge key={i} variant="secondary" className="font-medium text-xs">
                                                {c}
                                            </Badge>
                                        ))}
                                        {selectedRow.chiefComplaints.other && (
                                            <Badge variant="outline" className="font-medium text-xs">
                                                {selectedRow.chiefComplaints.other}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                                        Duration
                                    </p>
                                    <p className="font-semibold text-foreground">
                                        {selectedRow.chiefComplaints.duration || "—"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Acupuncture Assessment & Treatment Given */}
                    {(selectedRow.acupunctureAssessment || selectedRow.treatmentGiven) && (
                        <Card className="shadow-sm border-emerald-200 bg-emerald-50/20">
                            <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-base font-semibold text-emerald-950">
                                    Acupuncture Assessment & Treatment Given
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                {selectedRow.acupunctureAssessment && (
                                    <div className="space-y-3">
                                        <NoteSection
                                            title="Clinical Diagnosis"
                                            content={selectedRow.acupunctureAssessment.clinicalDiagnosis}
                                            highlight
                                        />
                                        <NoteSection
                                            title="Treatment Principle"
                                            content={selectedRow.acupunctureAssessment.treatmentPrinciple}
                                        />
                                    </div>
                                )}
                                {selectedRow.treatmentGiven && (
                                    <div className="space-y-3 bg-white p-3.5 rounded-lg border border-emerald-200/80">
                                        <div>
                                            <p className="text-xs uppercase tracking-wider font-bold text-emerald-800 mb-1">
                                                Therapies Given
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedRow.treatmentGiven.treatments?.map((t, i) => (
                                                    <Badge key={i} className="bg-emerald-700 text-white font-medium text-xs">
                                                        {t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        {selectedRow.treatmentGiven.acuPoints && (
                                            <div>
                                                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">
                                                    Acu Points
                                                </p>
                                                <p className="font-bold text-slate-900">
                                                    {selectedRow.treatmentGiven.acuPoints}
                                                </p>
                                            </div>
                                        )}
                                        {selectedRow.treatmentGiven.retentionTime && (
                                            <div>
                                                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">
                                                    Needle Retention Time
                                                </p>
                                                <p className="font-bold text-slate-900">
                                                    {selectedRow.treatmentGiven.retentionTime} mins
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Treatment Plan & Home Care */}
                    {selectedRow.treatmentPlan && (
                        <Card className="shadow-sm border-muted-200">
                            <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                                    <ClipboardList className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-base font-semibold">
                                    Treatment Plan & Home Care Advice
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                                        Plan & Frequency
                                    </p>
                                    <p className="font-semibold text-foreground">
                                        {selectedRow.treatmentPlan.sessions || "—"} Sessions ({selectedRow.treatmentPlan.frequency || "—"})
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                                        Home Care Advice
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedRow.treatmentPlan.homeCare?.map((h, i) => (
                                            <Badge key={i} variant="outline" className="font-medium text-xs">
                                                {h}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Medical History Details (Conditions & Current Medications) */}
                    {selectedRow.medicalHistoryDetails && (
                        <Card className="shadow-sm border-muted-200">
                            <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                                    <UserCheck className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-base font-semibold">
                                    Past Medical History & Current Medications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                                        Pre-existing Conditions
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {selectedRow.medicalHistoryDetails.medHistory?.map((m, i) => (
                                            <Badge key={i} variant="secondary" className="font-medium text-xs">
                                                {m}
                                            </Badge>
                                        ))}
                                        {selectedRow.medicalHistoryDetails.otherMedHistory && (
                                            <span className="text-xs text-muted-foreground font-medium">
                                                ({selectedRow.medicalHistoryDetails.otherMedHistory})
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                                        Current Medications
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {selectedRow.medicalHistoryDetails.currentMedications || "None"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Lifestyle Habits */}
                    {selectedRow.lifestyle && (
                        <Card className="shadow-sm border-muted-200">
                            <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                                <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-base font-semibold">
                                    Lifestyle & Habits
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <VitalItem label="Sleep" value={selectedRow.lifestyle.sleep} />
                                <VitalItem label="Bowel" value={selectedRow.lifestyle.bowel} />
                                <VitalItem label="Appetite" value={selectedRow.lifestyle.appetite} />
                                <VitalItem label="Stress" value={selectedRow.lifestyle.stress} />
                                <VitalItem label="Exercise" value={selectedRow.lifestyle.exercise} />
                                <VitalItem label="Smoking" value={selectedRow.lifestyle.smoking} />
                                <VitalItem label="Alcohol" value={selectedRow.lifestyle.alcohol} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Clinical Notes (Standard) */}
                    {(selectedRow.consultationNotes?.presentHistory ||
                        selectedRow.consultationNotes?.pastHistory ||
                        selectedRow.consultationNotes?.diagnosis) && (
                            <Card className="shadow-sm border-muted-200">
                                <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
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
                        )}

                    {selectedRow.therapy && (
                        <Card className="shadow-sm border-muted-200">
                            <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-base font-semibold">
                                    Therapy
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                                    {selectedRow.therapy}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Medicines & Tests Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Medicines */}
                        <Card className="shadow-sm border-muted-200 flex flex-col">
                            <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                    <Pill className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-base font-semibold">
                                    Prescribed Medicines
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
                                                        {typeof m.name === "object" ? m.name?.name : (m.name || "Unknown Medicine")}
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
                                                            {Array.isArray(t.name) ? t.name.map((n) => typeof n === "object" ? n.name : n).join(", ") : "—"}
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
                                    <div className="p-2 bg-violet-100 text-violet-700 rounded-lg">
                                        <ClipboardList className="w-5 h-5" />
                                    </div>
                                    <CardTitle className="text-base font-semibold">
                                        Advice & Follow-Up
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    {selectedRow.advice && (
                                        <p className="whitespace-pre-wrap leading-relaxed text-slate-800">
                                            <span className="font-semibold">Advice:</span> {selectedRow.advice}
                                        </p>
                                    )}
                                    {(selectedRow.followUp || selectedRow.followUpDetails?.nextAppt) && (
                                        <p className="font-semibold text-emerald-800">
                                            Follow-Up Date: {selectedRow.followUp ? fDate(selectedRow.followUp) : selectedRow.followUpDetails?.nextAppt ? fDate(selectedRow.followUpDetails.nextAppt) : "—"}
                                        </p>
                                    )}
                                    {selectedRow.followUpDetails?.feedback && (
                                        <p className="text-xs text-slate-600">
                                            <span className="font-semibold">Feedback:</span> {selectedRow.followUpDetails.feedback}
                                        </p>
                                    )}
                                    {!selectedRow.advice && !selectedRow.followUp && !selectedRow.followUpDetails?.nextAppt && (
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
                className={`p-3 rounded-md text-sm min-h-20 ${highlight ? "bg-primary/5 border border-primary/10" : "bg-muted/30"
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
