import React, { useEffect, useState } from "react";
import { UserPlus, CalendarDays } from "lucide-react";
import { fDate } from "@/lib/fDateAndTime";
import PatientSelection from "../PatientSelection";
import DoctorSelection from "../DoctorSelection";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PatientForm } from "@/components/shared/patient/PatientForm";
import {
    PatientModeToggle,
    getStoredPatientMode,
    persistPatientMode,
    type PatientMode,
} from "@/components/dashboard/billing/PatientModeToggle";

import api from "@/lib/axios";

interface BillHeaderProps {
    theme: { from: string; to: string };
    payload: any;
    setPayload: React.Dispatch<React.SetStateAction<any>>;
    orderPatient: any;
    selectedPatient: any;
    setSelectedPatient: (p: any) => void;
    openCreate: boolean;
    setOpenCreate: (open: boolean) => void;
}

export const BillHeader: React.FC<BillHeaderProps> = ({
    theme,
    payload,
    setPayload,
    orderPatient,
    selectedPatient,
    setSelectedPatient,
    openCreate,
    setOpenCreate,
}) => {
    const [patientMode, setPatientMode] = useState<PatientMode>("existing");

    useEffect(() => {
        // Prefill from order/URL wins over stored mode so repeat visitors stay searchable
        if (orderPatient || selectedPatient || payload.patient) {
            setPatientMode("existing");
            persistPatientMode("existing");
            return;
        }
        setPatientMode(getStoredPatientMode());
        // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once on mount
    }, []);

    const handleModeChange = (mode: PatientMode) => {
        setPatientMode(mode);
        if (mode === "new") {
            setPayload((prev: any) => ({ ...prev, patient: "" }));
            setSelectedPatient(null);
            setOpenCreate(true);
        } else {
            setOpenCreate(false);
        }
    };

    return (
        <div className="mb-2 relative z-10 space-y-4">
            <PatientModeToggle
                value={patientMode}
                onChange={handleModeChange}
                layoutId="reception-billing-patient-mode"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Patient</label>
                    {patientMode === "existing" ? (
                        <div className="flex-1">
                            <PatientSelection
                                orderPatient={selectedPatient || orderPatient}
                                onSelectPatient={(p) => setSelectedPatient(p)}
                                value={payload.patient}
                                setValue={(value) =>
                                    setPayload((prev: any) => ({ ...prev, patient: value }))
                                }
                            />
                        </div>
                    ) : (
                        <button
                            type="button"
                            className="h-8 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50 hover:text-(--color-synapse-light) transition-colors inline-flex items-center justify-center gap-2"
                            onClick={() => setOpenCreate(true)}
                        >
                            <UserPlus className="h-4 w-4" />
                            Register New Patient
                        </button>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Invoice Date</label>
                    <div className="h-8 flex items-center px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-700">
                        <CalendarDays className="h-4 w-4 mr-2 text-slate-400" />
                        {fDate(new Date())}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Doctor Name</label>
                    <DoctorSelection
                        value={payload.doctor}
                        onSelect={(name, id) =>
                            setPayload((prev: any) => ({
                                ...prev,
                                doctor: name,
                            }))
                        }
                    />
                </div>

                <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                    <DialogContent className="max-w-3xl!">
                        <DialogHeader>
                            <DialogTitle>Customer Register</DialogTitle>
                        </DialogHeader>
                        <PatientForm
                            onClose={(id?: string, name?: string, _token?: any, mrn?: string) => {
                                setOpenCreate(false);
                                if (id) {
                                    setPayload((prev: any) => ({ ...prev, patient: id }));
                                    api.get(`/patients/${id}`).then((res) => {
                                        if (res.data?.data) {
                                            setSelectedPatient(res.data.data);
                                        } else {
                                            setSelectedPatient({ _id: id, name: name || "", mrn: mrn || "" });
                                        }
                                    }).catch(() => {
                                        setSelectedPatient({ _id: id, name: name || "", mrn: mrn || "" });
                                    });
                                    // After register, treat as selected existing patient for the rest of the bill
                                    persistPatientMode("existing");
                                    setPatientMode("existing");
                                }
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
