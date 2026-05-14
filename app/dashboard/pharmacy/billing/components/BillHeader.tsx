import React from "react";
import { User2, UserPlus, FileText, CalendarDays } from "lucide-react";
import { fDate } from "@/lib/fDateAndTime";
import PatientSelection from "../PatientSelection";
import DoctorSelection from "../DoctorSelection";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RegisterPatient } from "../../RegisterPatient";

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
    return (
        <div className="mb-2 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Patient</label>
                    <div className="flex items-center gap-2">
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
                        <button
                            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50 hover:text-indigo-600 transition-colors shrink-0"
                            onClick={() => setOpenCreate(true)}
                            title="New Patient"
                        >
                            <UserPlus className="h-4 w-4 md:mr-2 inline" />
                            <span className="hidden md:inline">New</span>
                        </button>
                    </div>
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
                        onSelect={(name) =>
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
                        <RegisterPatient
                            onClose={(id?: string, name?: string) => {
                                setOpenCreate(false);
                                if (id) {
                                    setPayload((prev: any) => ({ ...prev, patient: id }));
                                    setSelectedPatient({ _id: id, name: name || "", mrn: "" });
                                }
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
