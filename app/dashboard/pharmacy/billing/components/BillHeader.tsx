"use client";

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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            <button
                                type="button"
                                onClick={() => {
                                    setPayload((prev: any) => ({ ...prev, isWalkIn: false }));
                                    setSelectedPatient(null);
                                }}
                                className={`px-2.5 py-0.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                    !payload.isWalkIn
                                        ? "bg-white text-slate-800 shadow-xs"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                Registered Patient
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setPayload((prev: any) => ({
                                        ...prev,
                                        isWalkIn: true,
                                        patient: "",
                                        customer: prev.customer || { name: "" },
                                    }));
                                    setSelectedPatient({
                                        name: payload.customer?.name || "-",
                                        isWalkIn: true,
                                    });
                                }}
                                className={`px-2.5 py-0.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                                    payload.isWalkIn
                                        ? "bg-amber-500 text-white shadow-xs"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                <span>Walk-In Customer</span>
                                <span className={`text-[9px] px-1 rounded font-bold uppercase ${
                                    payload.isWalkIn ? "bg-amber-600/70 text-white" : "bg-amber-100 text-amber-700"
                                }`}>No Reg</span>
                            </button>
                        </div>
                    </div>

                    {payload.isWalkIn ? (
                        <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-amber-900">Walk-In Customer Details</span>
                                <span className="text-[10px] text-amber-700 italic bg-amber-100/70 px-1.5 py-0.5 rounded">All fields optional</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    placeholder="Customer Name"
                                    value={payload.customer?.name || ""}
                                    onChange={(e) => {
                                        const name = e.target.value.replace(/\b\w/g, (char) => char.toUpperCase());
                                        setPayload((prev: any) => ({
                                            ...prev,
                                            customer: { ...prev.customer, name }
                                        }));
                                        setSelectedPatient({
                                            name: name || "-",
                                            age: payload.customer?.age,
                                            phoneNumber: payload.customer?.phoneNumber,
                                            address: payload.customer?.address,
                                            isWalkIn: true,
                                        });
                                    }}
                                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-amber-400"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="130"
                                    placeholder="Age (years)"
                                    value={payload.customer?.age ?? ""}
                                    onChange={(e) => {
                                        const age = e.target.value === "" ? undefined : Number(e.target.value);
                                        setPayload((prev: any) => ({
                                            ...prev,
                                            customer: { ...prev.customer, age }
                                        }));
                                        setSelectedPatient((prev: any) => ({
                                            ...prev,
                                            age,
                                            isWalkIn: true,
                                        }));
                                    }}
                                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-amber-400"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <select
                                    value={payload.customer?.gender || ""}
                                    onChange={(e) => {
                                        const gender = e.target.value;
                                        setPayload((prev: any) => ({
                                            ...prev,
                                            customer: { ...prev.customer, gender }
                                        }));
                                    }}
                                    className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-amber-400"
                                >
                                    <option value="">Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                <input
                                    placeholder="Phone Number"
                                    value={payload.customer?.phoneNumber || ""}
                                    onChange={(e) => {
                                        const phoneNumber = e.target.value;
                                        setPayload((prev: any) => ({
                                            ...prev,
                                            customer: { ...prev.customer, phoneNumber }
                                        }));
                                        setSelectedPatient((prev: any) => ({
                                            ...prev,
                                            phoneNumber,
                                            isWalkIn: true,
                                        }));
                                    }}
                                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-amber-400"
                                />
                                <input
                                    placeholder="Address"
                                    value={payload.customer?.address || ""}
                                    onChange={(e) => {
                                        const address = e.target.value;
                                        setPayload((prev: any) => ({
                                            ...prev,
                                            customer: { ...prev.customer, address }
                                        }));
                                        setSelectedPatient((prev: any) => ({
                                            ...prev,
                                            address,
                                            isWalkIn: true,
                                        }));
                                    }}
                                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-amber-400"
                                />
                            </div>
                        </div>
                    ) : (
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
                                className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
                                onClick={() => setOpenCreate(true)}
                                title="New Patient"
                            >
                                <UserPlus className="h-4 w-4 md:mr-2 inline" />
                                <span className="hidden md:inline">New</span>
                            </button>
                        </div>
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
                            onClose={(id?: string, name?: string, allergies?: string, mrn?: string) => {
                                setOpenCreate(false);
                                if (id) {
                                    setPayload((prev: any) => ({ ...prev, patient: id }));
                                    setSelectedPatient({ _id: id, name: name || "", mrn: mrn || "" });
                                }
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
