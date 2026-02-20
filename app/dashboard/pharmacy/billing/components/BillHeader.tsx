import React from "react";
import { User2, UserPlus, FileText, CalendarDays } from "lucide-react";
import { fDate } from "@/lib/fDateAndTime";
import PatientSelection from "../PatientSelection";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { RegisterPatient } from "../../RegisterPatient";

interface BillHeaderProps {
    theme: { from: string; to: string };
    payload: any;
    setPayload: React.Dispatch<React.SetStateAction<any>>;
    orderPatient: any;
    setSelectedPatient: (p: any) => void;
    openCreate: boolean;
    setOpenCreate: (open: boolean) => void;
}

export const BillHeader: React.FC<BillHeaderProps> = ({
    theme,
    payload,
    setPayload,
    orderPatient,
    setSelectedPatient,
    openCreate,
    setOpenCreate,
}) => {
    return (
        <div className="bg-white p-7 rounded-xl shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Patient</label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <PatientSelection
                                orderPatient={orderPatient}
                                onSelectPatient={(p) => setSelectedPatient(p)}
                                value={payload.patient}
                                setValue={(value) =>
                                    setPayload((prev: any) => ({ ...prev, patient: value }))
                                }
                            />
                        </div>
                        <button
                            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50 hover:text-indigo-600 transition-colors shrink-0"
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
                    <div className="h-11 flex items-center px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-700">
                        <CalendarDays className="h-4 w-4 mr-2 text-slate-400" />
                        {fDate(new Date())}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Doctor Name</label>
                    <input
                        type="text"
                        placeholder="Referrer / Doctor"
                        value={payload.doctor}
                        onChange={(e) =>
                            setPayload((prev: any) => ({
                                ...prev,
                                doctor: e.target.value,
                            }))
                        }
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    />
                </div>

                <Sheet open={openCreate} onOpenChange={setOpenCreate}>
                    <SheetContent className="w-full max-w-lg! overflow-y-auto [&>button]:hidden">
                        <SheetHeader className="flex-row items-center justify-between border-b pb-4">
                            <SheetTitle>Customer Register</SheetTitle>
                            <button
                                className="text-sm font-medium text-slate-500 hover:text-slate-700"
                                onClick={() => setOpenCreate(false)}
                            >
                                Close
                            </button>
                        </SheetHeader>
                        <div className="p-3">
                            <RegisterPatient
                                onClose={(id?: string, name?: string) => {
                                    setOpenCreate(false);
                                    if (id) {
                                        setPayload((prev: any) => ({ ...prev, patient: id }));
                                        setSelectedPatient({ _id: id, name: name || "", mrn: "" });
                                    }
                                }}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
};
