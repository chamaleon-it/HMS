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
        <div className="rounded-2xl border border-slate-200 p-4 shadow-sm supports-backdrop-filter:bg-white/80 supports-backdrop-filter:backdrop-blur dark:border-slate-800 dark:supports-backdrop-filter:bg-slate-900/70 bg-white dark:bg-slate-900 relative z-10">
            <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="md:w-2/5">
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <span
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-white"
                            style={{
                                backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                            }}
                        >
                            <User2 className="h-4 w-4" />
                        </span>
                        Patient
                    </div>
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
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 shrink-0"
                            onClick={() => setOpenCreate(true)}
                        >
                            <UserPlus className="mr-2 inline h-4 w-4" />
                            New
                        </button>
                    </div>
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

            <div className="">
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-white"
                        style={{
                            backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                        }}
                    >
                        <FileText className="h-4 w-4" />
                    </span>
                    Invoice
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                        <div className="text-xs text-slate-500">Date</div>
                        <div className="flex items-center gap-1 font-medium">
                            <CalendarDays className="h-4 w-4" />
                            {fDate(new Date())}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <div className="text-xs text-slate-500">Doctor Name</div>
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
                                className="h-8 w-full rounded-lg border border-slate-200 bg-white/70 px-2 text-xs outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-slate-500">Department</div>
                            <input
                                type="text"
                                placeholder="e.g. Cardiology"
                                value={payload.department}
                                onChange={(e) =>
                                    setPayload((prev: any) => ({
                                        ...prev,
                                        department: e.target.value,
                                    }))
                                }
                                className="h-8 w-full rounded-lg border border-slate-200 bg-white/70 px-2 text-xs outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
