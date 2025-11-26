import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { fDate, fDateandTime, fTime } from "@/lib/fDateAndTime";
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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl w-full max-h-[90vh] overflow-scroll">
                <DialogHeader>
                    <DialogTitle>Consultation Details</DialogTitle>
                </DialogHeader>

                <DialogDescription>
                    {selectedRow ? (
                        <div className="space-y-4">
                            {/* Top meta */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">
                                        Consultation ID:{" "}
                                        <span className="font-mono">{selectedRow._id}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Created: {fDateandTime(selectedRow.createdAt)}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm font-medium">Sheduled Date:</p>
                                    <p className="font-mono">
                                        {fDateandTime(
                                            selectedRow.appointment?.date ?? selectedRow.createdAt
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Grid sections */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Patient */}
                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="font-medium mb-2">Patient</h4>
                                        <p className="font-medium">
                                            {selectedRow.patient?.name ?? "—"}
                                        </p>
                                        <p className="font-mono text-sm text-muted-foreground">
                                            {selectedRow.patient?.mrn ?? "—"}
                                        </p>
                                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                            <p>Phone: {selectedRow.patient?.phoneNumber ?? "—"}</p>
                                            <p>Email: {selectedRow.patient?.email ?? "—"}</p>
                                            <p>
                                                Gender / DOB: {selectedRow.patient?.gender ?? "—"} /{" "}
                                                {selectedRow.patient?.dateOfBirth
                                                    ? fDateandTime(selectedRow.patient.dateOfBirth)
                                                    : "—"}
                                            </p>
                                            <p>Blood: {selectedRow.patient?.blood ?? "—"}</p>
                                            <p>Allergies: {selectedRow.patient?.allergies ?? "—"}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Doctor & Appointment */}
                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="font-medium mb-2">Doctor & Appointment</h4>
                                        <p className="font-medium">
                                            {selectedRow.doctor?.name ?? "—"}
                                        </p>
                                        <p className="font-mono text-sm text-muted-foreground">
                                            {selectedRow.doctor?.specialization ?? "—"}
                                        </p>

                                        <div className="mt-2 text-sm space-y-1 text-muted-foreground">
                                            <p>Method: {selectedRow.appointment?.method ?? "—"}</p>
                                            <p>Status: {selectedRow.appointment?.status ?? "—"}</p>
                                            <p>
                                                Paid: {selectedRow.appointment?.isPaid ? "Yes" : "No"}
                                            </p>
                                            <p>Notes: {selectedRow.appointment?.notes ?? "—"}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Consultation notes & Examination */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="font-medium mb-2">Consultation Notes</h4>
                                        <div className="space-y-3 text-sm">
                                            <div>
                                                <strong className="block text-muted-foreground">
                                                    Presenting History:
                                                </strong>
                                                <p className="whitespace-pre-wrap">
                                                    {selectedRow.consultationNotes?.presentHistory ?? "—"}
                                                </p>
                                            </div>

                                            <div>
                                                <strong className="block text-muted-foreground">
                                                    Past History:
                                                </strong>
                                                <p className="whitespace-pre-wrap">
                                                    {selectedRow.consultationNotes?.pastHistory ?? "—"}
                                                </p>
                                            </div>

                                            <div>
                                                <strong className="block text-muted-foreground">
                                                    Diagnosis:
                                                </strong>
                                                <p className="whitespace-pre-wrap">
                                                    {selectedRow.consultationNotes?.diagnosis ?? "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="font-medium mb-2">Examination</h4>
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-sm">
                                            <div>
                                                <strong className="text-muted-foreground">HR:</strong>{" "}
                                                {selectedRow.examinationNote?.hr ?? "—"}
                                            </div>
                                            <div>
                                                <strong className="text-muted-foreground">BP:</strong>{" "}
                                                {selectedRow.examinationNote?.bp ?? "—"}
                                            </div>
                                            <div>
                                                <strong className="text-muted-foreground">SpO2:</strong>{" "}
                                                {selectedRow.examinationNote?.spo2 ?? "—"}
                                            </div>
                                            <div>
                                                <strong className="text-muted-foreground">Temp:</strong>{" "}
                                                {selectedRow.examinationNote?.temp
                                                    ? `${selectedRow.examinationNote.temp} ${selectedRow.examinationNote.tempUnit ?? ""
                                                    }`
                                                    : "—"}
                                            </div>
                                            <div>
                                                <strong className="text-muted-foreground">RS:</strong>{" "}
                                                {selectedRow.examinationNote?.rs ?? "—"}
                                            </div>
                                            <div>
                                                <strong className="text-muted-foreground">CVS:</strong>{" "}
                                                {selectedRow.examinationNote?.cvs ?? "—"}
                                            </div>
                                            <div className="col-span-2">
                                                <strong className="text-muted-foreground">PA:</strong>{" "}
                                                {selectedRow.examinationNote?.pa ?? "—"}
                                            </div>
                                            <div className="col-span-2">
                                                <strong className="text-muted-foreground">CNS:</strong>{" "}
                                                {selectedRow.examinationNote?.cns ?? "—"}
                                            </div>
                                            <div className="col-span-2">
                                                <strong className="block text-muted-foreground">
                                                    Other Notes:
                                                </strong>
                                                <div className="whitespace-pre-wrap">
                                                    {selectedRow.examinationNote?.otherNotes ?? "—"}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Medicines */}
                            <Card>
                                <CardContent className="pt-6">
                                    <h4 className="font-medium mb-2">Medicines</h4>
                                    {selectedRow.medicines && selectedRow.medicines.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedRow.medicines.map((m) => (
                                                <div
                                                    key={m._id ?? `${m.name?._id ?? Math.random()}`}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-muted/30 rounded-md text-sm"
                                                >
                                                    <span className="font-medium">
                                                        {m.name?.name ?? "—"}
                                                    </span>
                                                    <div className="text-muted-foreground text-xs sm:text-sm mt-1 sm:mt-0">
                                                        {m.dosage ?? "—"} • {m.frequency ?? "—"} •{" "}
                                                        {m.food ?? "—"} • {m.duration ?? "—"}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No medicines prescribed.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Tests & Advice */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="font-medium mb-2">Tests</h4>
                                        {selectedRow.test && selectedRow.test.length > 0 ? (
                                            <ul className="list-disc pl-5 text-sm space-y-2">
                                                {selectedRow.test.map((t) => (
                                                    <li
                                                        key={
                                                            t._id ??
                                                            `${t.name.join(",")}-${t.date?.toString() ?? Math.random()
                                                            }`
                                                        }
                                                    >
                                                        <div className="font-medium">
                                                            {t.name && t.name.length
                                                                ? t.name.map((e) => e.name).join(", ")
                                                                : "—"}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Date: {t.date ? fDate(t.date) : "—"} •  Slot: {fTime(t.date) ?? "—"} •
                                                            Priority: {t.priority ?? "—"}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No tests ordered.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="font-medium mb-2">Advice</h4>
                                        <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                            {selectedRow.advice ?? "—"}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No consultation selected.
                        </div>
                    )}
                </DialogDescription>

                <DialogFooter>
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
