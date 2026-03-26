"use client";

import AppShell from "@/components/layout/app-shell";
import HospitalName from "@/components/print/HospitalName";
import Watermark from "@/components/print/Watermark";
import { fDateandTime } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import Link from "next/link";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer } from "lucide-react";
import PharmacyHeader from "../components/PharmacyHeader";
import React, { useState } from "react";
import { getDecimal } from "@/lib/fNumber";
import PrintReceipt from "./PrintReceipt";

export default function ViewBill({ id }: { id: string }) {
    const [printBill, setPrintBill] = useState<any>(null);

    const handlePrint = (bill: any) => {
        setPrintBill(bill);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const { data: billingData } = useSWR<{
        message: string;
        data: {
            _id: string;
            user: string;
            patient: {
                _id: string;
                name: string;
                phoneNumber: string;
                email: string;
                gender: string;
                dateOfBirth: Date;
                conditions: string[];
                allergies: string;
                notes: string;
                createdBy: string;
                status: string;
                mrn: string;
                createdAt: string;
                updatedAt: string;
                address?: string;
            };
            items: {
                name: string;
                quantity: number;
                unitPrice: number;
                gst: number;
                discount: number;
                total: number;
            }[];
            roundOff: boolean;
            cash: number;
            online: number;
            insurance: number;
            discount: number;
            mrn: string;
            createdAt: Date;
            updatedAt: Date;
            doctor?: string;
            department?: string;
            note?: string;
        };
    }>(`/billing/${id}`);

    const billing = billingData?.data;

    if (!billing) {
        return (
            <AppShell>
                <div className="flex items-center justify-center min-h-screen">
                    <p>Loading...</p>
                </div>
            </AppShell>
        );
    }

    // Calculations for totals
    const subtotal = billing.items.reduce(
        (sum, item) => sum + (item.quantity * item.unitPrice - item.discount),
        0
    );

    const totalGst = billing.items.reduce(
        (sum, item) =>
            sum + ((item.quantity * item.unitPrice - item.discount) * item.gst) / 100,
        0
    );

    const grandTotal = billing.items.reduce((s, { total }) => s + total, 0);

    const paymentMethod =
        billing.insurance > 0
            ? "Insurance"
            : billing.online > 0
                ? "Online"
                : "Cash";

    return (
        <AppShell>
            <div className="flex flex-col items-center p-5 min-h-screen overflow-auto gap-6 print:p-0 print:bg-white">
                <div className="w-full print:hidden">

                    <PharmacyHeader
                        title="Invoice Details"
                        subtitle={`Viewing invoice ${billing.mrn}`}
                    >
                        <button
                            onClick={() => handlePrint(billing)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-900 hover:bg-slate-50 transition-colors shadow-sm text-xs font-bold"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </button>
                        <Link
                            href="/dashboard/pharmacy/billing"
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-900 hover:bg-slate-50 transition-colors shadow-sm text-xs font-bold"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to bills
                        </Link>
                    </PharmacyHeader>
                </div>

                {/* Receipt Container */}
                <div className="bg-white text-slate-900 font-sans leading-relaxed shadow-xl w-full flex flex-col overflow-hidden rounded-xl print:shadow-none print:rounded-none">
                    {/* HEADER */}
                    <div className="bg-linear-to-r from-indigo-700 to-cyan-600 text-white px-10 py-8">
                        <div className="flex justify-between items-start">
                            <HospitalName />
                            <div className="text-right space-y-2">
                                <Badge className="bg-white text-slate-900 border-none px-3 py-1 font-bold text-xs">CASH RECEIPT</Badge>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium">Invoice No: <span className="font-bold">{billing.mrn}</span></p>
                                    <p className="text-[11px] opacity-80">
                                        {billing.createdAt ? fDateandTime(billing.createdAt) : "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BODY */}
                    <div className="p-5 flex-1 flex flex-col gap-6 text-[13px]">
                        {/* PATIENT STRIP - 4 COL COMPACT */}
                        <div className="border border-slate-200 rounded-lg px-6 py-4 grid grid-cols-4 gap-x-8 gap-y-2 bg-slate-50/50">
                            <Compact label="Patient" value={billing.patient.name} />
                            <Compact label="PID" value={billing.patient.mrn?.replace("MRN", "P-") || "—"} />
                            <Compact label="Age/G" value={`${billing.patient.dateOfBirth ? `${new Date().getFullYear() - new Date(billing.patient.dateOfBirth).getFullYear()}` : "—"} / ${billing.patient.gender || "—"}`} />
                            <Compact label="Phone" value={billing.patient.phoneNumber || "—"} />
                            <Compact label="Doctor" value={billing.doctor || "—"} />
                            <Compact label="Dept" value={billing.department || "—"} />
                            <Compact label="Pay" value={paymentMethod} />
                            <Compact label="Bill" value="OP Pharmacy" />
                        </div>

                        {/* MEDICINES TABLE */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden flex-1 box-border">
                            <table className="w-full border-collapse">
                                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                                    <tr>
                                        <th className="px-3 py-3 text-center w-10">SL</th>
                                        <th className="px-3 py-3 text-left">Medicine Description</th>
                                        <th className="px-3 py-3 text-center w-20">Qty</th>
                                        <th className="px-3 py-3 text-right w-24">Unit Price</th>
                                        <th className="px-3 py-3 text-right w-20">GST</th>
                                        <th className="px-3 py-3 text-right w-28">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billing.items.map((item, index) => (
                                        <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors">
                                            <td className="px-3 py-2.5 text-center font-medium text-slate-400 text-xs">{index + 1}</td>
                                            <td className="px-3 py-2.5">
                                                <p className="font-bold text-slate-900 uppercase text-[12px]">{item.name}</p>
                                                <p className="text-[10px] text-slate-500 font-medium tracking-tight">B‑7721 · 12/26 · HSN 3004</p>
                                            </td>
                                            <td className="px-3 py-2.5 text-center font-bold text-slate-700">{item.quantity}</td>
                                            <td className="px-3 py-2.5 text-right font-medium text-slate-600">{formatINR(item.unitPrice)}</td>
                                            <td className="px-3 py-2.5 text-right font-medium text-slate-500">{item.gst}%</td>
                                            <td className="px-3 py-2.5 text-right font-bold text-slate-900">{formatINR(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* TOTALS AND T&C */}
                        <div className="flex justify-end gap-10 items-start">
                            {/* T&C - Right side next to totals */}
                            <div className="flex-1 max-w-[400px] text-left">
                                <h4 className="text-[11px] font-bold uppercase text-slate-900 mb-2">Terms & Conditions</h4>
                                <ul className="text-[10px] text-slate-600 space-y-1 font-medium italic">
                                    <li>Invoice once generated cannot be cancelled.</li>
                                    <li className="text-slate-900 font-bold not-italic">Check medicines before leaving (Returns within 24H with original invoice).</li>
                                    <li>Refrigerated items will not be accepted for return.</li>
                                </ul>
                                {billing.note && (
                                    <div className="mt-4 text-xs text-slate-500">
                                        <span className="font-bold uppercase text-[9px]">Note:</span> {billing.note}
                                    </div>
                                )}
                            </div>

                            <div className="w-[320px] border border-slate-200 rounded-lg p-5 space-y-2 bg-slate-50">
                                <Line label="Gross Amount" value={formatINR(subtotal)} />
                                <Line label="CGST/SGST Total" value={formatINR(totalGst)} />
                                {billing.discount > 0 && (
                                    <Line label="Discount (Billing level)" value={`-${formatINR(billing.discount)}`} />
                                )}
                                <Separator className="bg-slate-200" />
                                <Line label="NET PAYABLE" value={formatINR(grandTotal - (billing.discount || 0))} bold large />
                            </div>
                        </div>

                        {/* SIGNATURES */}
                        {/* <div className="mt-10 grid grid-cols-3 gap-12 text-xs h-32">
                            <div className="border-t border-slate-300 pt-4 text-center">
                                <p className="font-bold text-slate-900 uppercase tracking-wider">Receiver’s Signature</p>
                            </div>
                            <div className="border-t border-slate-300 pt-4 text-center">
                                <p className="font-bold text-slate-900 uppercase tracking-wider">Authorised Pharmacist</p>
                            </div>
                            <div className="border-t border-slate-300 pt-4 text-center">
                                <p className="font-bold text-slate-900 uppercase tracking-wider">Hospital Seal</p>
                            </div>
                        </div> */}
                    </div>

                    {/* FOOTER */}
                    <div className="bg-[#0a0f1c] px-10 py-6 text-[10px] text-slate-400 flex justify-between items-center">
                        <div className="space-y-1 text-left">
                            <p className="text-slate-300 font-medium">This prescription is valid only if signed by registered medical practitioner</p>
                            <p className="text-slate-500">
                                For Appointments / Booking: <span className="text-slate-400 font-semibold">+91 83019 26155 · 04931 240077 · hospitalmark@gmail.com</span>
                            </p>
                        </div>
                        <p className="text-slate-500">
                            Powered by <span className="font-bold text-slate-300 tracking-tight uppercase">Synapse IT Services LLP</span>
                        </p>
                    </div>
                </div>
            </div>
            {printBill && (
                <PrintReceipt
                    payload={{
                        patient: printBill.patient.name,
                        items: printBill.items.map((i: any) => ({ ...i, name: i.name })),
                        cash: printBill.cash,
                        online: printBill.online,
                        insurance: printBill.insurance,
                        discount: printBill.discount,
                    }}
                    patient={{
                        name: printBill.patient.name,
                        mrn: printBill.patient.mrn,
                    }}
                    invoiceDetails={{
                        prefix: "MINV",
                        roundOffAmount: printBill.roundOff
                            ? getDecimal(printBill.items.reduce((a: any, b: any) => a + b.total, 0))
                            : 0,
                        subtotal: printBill.items.reduce(
                            (a: any, b: any) => a + b.unitPrice * b.quantity,
                            0
                        ),
                        totalGst: printBill.items.reduce(
                            (a: any, b: any) => a + (b.total - b.unitPrice * b.quantity),
                            0
                        ),
                        grandTotal: printBill.items.reduce((a: any, b: any) => a + b.total, 0),
                    }}
                />
            )}
            <Watermark />
        </AppShell>
    );
}

function Compact({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-2 min-h-6 items-start">
            <span className="text-slate-400 font-medium uppercase text-[10px] min-w-[50px] mt-0.5">{label}:</span>
            <span className="font-bold text-slate-900 line-clamp-2 leading-tight">{value}</span>
        </div>
    );
}

function Line({ label, value, bold, large }: { label: string; value: string; bold?: boolean; large?: boolean }) {
    return (
        <div className={`flex justify-between items-center ${large ? "text-base mt-2" : "text-[12px]"}`}>
            <span className={bold ? "font-bold text-slate-900" : "text-slate-500 font-medium"}>{label}</span>
            <span className={bold ? "font-black text-slate-900 text-lg" : "font-bold text-slate-800"}>{value}</span>
        </div>
    );
}
