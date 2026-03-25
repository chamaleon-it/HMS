import React from "react";
import { formatINR } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";
import Watermark from "@/components/print/Watermark";
import HospitalName from "@/components/print/HospitalName";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PrintReceiptProps {
    payload?: {
        patient: string;
        items: {
            name: string;
            quantity: number;
            unitPrice: number;
            gst: number;
            total: number;
        }[];
        cash: number;
        online: number;
        insurance: number;
        discount: number;
        doctor?: string;
        department?: string;
        note?: string;
    };
    patient?: {
        name: string;
        mrn?: string;
        phoneNumber?: string;
        gender?: string;
        dateOfBirth?: string | Date;
        address?: string;
    } | null;
    invoiceDetails?: {
        prefix: string;
        roundOffAmount: number;
        subtotal: number;
        totalGst: number;
        grandTotal: number;
    };
}

export default function PrintReceipt({
    payload,
    patient,
    invoiceDetails,
}: PrintReceiptProps) {

    if (!patient || !payload || !invoiceDetails) return null;

    const invoiceNo = `${invoiceDetails.prefix}-${new Date().getTime().toString().slice(-6)}`;
    const paymentMethod = payload.insurance ? "Insurance" : payload.online ? "Online" : "Cash";

    return (
        <div className="print-receipt hidden print:block bg-white text-black font-sans leading-relaxed overflow-visible">
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          body { 
            visibility: hidden !important; 
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-receipt { 
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
            padding: 0 !important;
          }
          .no-print, aside, header, footer, nav, button {
            display: none !important;
          }
        }
      `}} />

            <div className="max-w-[21cm] mx-auto min-h-screen flex flex-col">
                {/* HEADER */}
                <div className="bg-white text-black border-b border-slate-200 px-10 py-8">
                    <div className="flex justify-between items-start">
                        <HospitalName />
                        <div className="text-right space-y-2">
                            <Badge className="bg-black text-white border-none px-3 py-1 font-bold text-xs hover:bg-slate-800">CASH RECEIPT</Badge>
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">Invoice No: <span className="font-bold">{invoiceNo}</span></p>
                                <p className="text-[11px] text-black">{fDateandTime(new Date())}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="p-5 flex-1 flex flex-col gap-6 text-[13px]">
                    {/* PATIENT STRIP - 4 COL COMPACT */}
                    <div className="border border-slate-200 rounded-lg px-6 py-4 grid grid-cols-4 gap-x-8 gap-y-2 bg-slate-50/50">
                        <Compact label="Patient" value={patient.name} />
                        <Compact label="PID" value={patient.mrn?.replace("MRN", "P-") || "—"} />
                        <Compact label="Age/G" value={`${patient.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}` : "—"} / ${patient.gender || "—"}`} />
                        <Compact label="Phone" value={patient.phoneNumber || "—"} />
                        <Compact label="Doctor" value={payload.doctor || "—"} />
                        <Compact label="Dept" value={payload.department || "—"} />
                        <Compact label="Pay" value={paymentMethod} />
                        <Compact label="Bill" value="OP Pharmacy" />
                    </div>

                    {/* MEDICINES TABLE */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden flex-1 box-border">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-50 text-[11px] font-bold text-black border-b border-slate-200">
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
                                {payload.items.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors">
                                        <td className="px-3 py-2.5 text-center font-medium text-black text-xs">{index + 1}</td>
                                        <td className="px-3 py-2.5">
                                            <p className="font-bold text-black uppercase text-[12px]">{item.name}</p>
                                            <p className="text-[10px] text-black font-medium tracking-tight">B‑7721 · 12/26 · HSN 3004</p>
                                        </td>
                                        <td className="px-3 py-2.5 text-center font-bold text-black">{item.quantity}</td>
                                        <td className="px-3 py-2.5 text-right font-medium text-black">{formatINR(item.unitPrice)}</td>
                                        <td className="px-3 py-2.5 text-right font-medium text-black">{item.gst}%</td>
                                        <td className="px-3 py-2.5 text-right font-bold text-black">{formatINR(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* TOTALS AND T&C */}
                    <div className="flex justify-end gap-10 items-start">
                        {/* T&C - Right aligned next to totals as requested */}
                        <div className="flex-1 max-w-[400px] text-left">
                            <h4 className="text-[11px] font-bold uppercase text-black mb-2">Terms & Conditions</h4>
                            <ul className="text-[10px] text-black space-y-1 font-medium italic">
                                <li>Invoice once generated cannot be cancelled.</li>
                                <li className="text-black font-bold not-italic">Check medicines before leaving (Returns within 24H with original invoice).</li>
                                <li>Refrigerated items will not be accepted for return.</li>
                            </ul>
                            {payload.note && (
                                <div className="mt-4 text-xs text-black">
                                    <span className="font-bold uppercase text-[9px]">Note:</span> {payload.note}
                                </div>
                            )}
                        </div>

                        <div className="w-[320px] border border-slate-200 rounded-lg p-5 space-y-2 bg-slate-50">
                            <Line label="Gross Amount" value={formatINR(invoiceDetails.subtotal)} />
                            <Line label="CGST/SGST Total" value={formatINR(invoiceDetails.totalGst)} />
                            {payload.discount > 0 && (
                                <Line label="Discount (Billing level)" value={`-${formatINR(payload.discount)}`} />
                            )}
                            <Separator className="bg-slate-200" />
                            <Line label="NET PAYABLE" value={formatINR(invoiceDetails.grandTotal)} bold large />
                        </div>
                    </div>

                    {/* SIGNATURES */}
                    {/* <div className="mt-10 grid grid-cols-3 gap-12 text-xs">
                        <div className="border-t border-slate-300 pt-4 text-center">
                            <p className="font-bold text-slate-900 uppercase tracking-wider">Receiver’s Signature</p>
                        </div>
                        <div className="border-t border-slate-300 pt-4 text-center">
                            <p className="font-bold text-slate-900 uppercase tracking-wider">Authorised Pharmacist</p>
                        </div>
                        <div className="border-t border-slate-300 pt-4 text-center h-24">
                            <p className="font-bold text-slate-900 uppercase tracking-wider">Hospital Seal</p>
                        </div>
                    </div> */}
                </div>

                {/* FOOTER */}
                <div className="bg-slate-50 border-t border-slate-200 px-10 py-6 text-[10px] text-black flex justify-between items-center">
                    <div className="space-y-1">
                        <p className="text-black font-medium">This prescription is valid only if signed by registered medical practitioner</p>
                        <p className="text-black">
                            For Appointments / Booking: <span className="text-black font-semibold">+91 83019 26155 · 04931 240077 · hospitalmark@gmail.com</span>
                        </p>
                    </div>
                    <p className="text-black">
                        Powered by <span className="font-bold text-black tracking-tight uppercase">Synapse IT Services LLP</span>
                    </p>
                </div>
            </div>
            <Watermark />
        </div>
    );
}

function Compact({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-2 min-h-6 items-start">
            <span className="text-black font-medium uppercase text-[10px] min-w-[50px] mt-0.5">{label}:</span>
            <span className="font-bold text-black line-clamp-2 leading-tight">{value}</span>
        </div>
    );
}

function Line({ label, value, bold, large }: { label: string; value: string; bold?: boolean; large?: boolean }) {
    return (
        <div className={`flex justify-between items-center ${large ? "text-base mt-2" : "text-[12px]"}`}>
            <span className={bold ? "font-bold text-black" : "text-black font-medium"}>{label}</span>
            <span className={bold ? "font-black text-black text-lg" : "font-bold text-black"}>{value}</span>
        </div>
    );
}
