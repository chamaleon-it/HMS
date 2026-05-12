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
            manufacturer?: string;
            batchNumber?: string;
            quantity: number;
            generic?: string;
            hsnCode?: string;
            expiryDate?: string | Date;
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
          .break-after-page {
            page-break-after: always;
          }
          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            z-index: 999;
          }
        }
      `}} />

            <div className="max-w-[21cm] mx-auto min-h-screen flex flex-col">
                {/* HEADER */}
                <div className="bg-white text-black border-b border-slate-300 px-10 py-8">
                    <div className="flex justify-between items-start">
                        <HospitalName />
                        <div className="text-right space-y-2">
                            <div className="bg-[#679E59] text-white px-3 py-1 rounded-md font-bold text-xs tracking-wide shadow-sm inline-block uppercase">
                                CASH RECEIPT
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">Invoice No: <span className="font-bold">{invoiceNo}</span></p>
                                <p className="text-[11px] text-black">{fDateandTime(new Date())}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="p-5 flex-1 flex flex-col gap-6 text-[13px]">
                    {/* PATIENT STRIP - IMAGE MATCH */}
                    <div className="bg-[#f2f4f0] rounded-lg px-6 py-3 flex justify-between items-center text-[12px] border border-slate-200">
                        <div className="flex gap-2">
                            <span className="text-slate-500">Sold to</span>
                            <span className="text-slate-500">:</span>
                            <span className="font-bold text-slate-900">{patient.name}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-slate-500">PID</span>
                            <span className="text-slate-500">:</span>
                            <span className="font-bold text-slate-900">{patient.mrn?.replace("MRN", "") || "—"}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-slate-500">Prescribed by</span>
                            <span className="text-slate-500">:</span>
                            <span className="font-bold text-slate-900">{payload.doctor || "N/A"}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-slate-500">Date</span>
                            <span className="text-slate-500">:</span>
                            <span className="font-bold text-slate-900">{new Date().toLocaleDateString('en-GB')}</span>
                        </div>
                    </div>

                    {/* MEDICINES TABLE - IMAGE MATCH WITH VERTICAL BORDERS */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden flex-1 box-border">
                        <table className="w-full border-collapse">
                            <thead className="bg-[#f2f4f0] text-[11px] font-bold text-slate-700 border-b border-slate-200">
                                <tr>
                                    <th className="px-3 py-1.5 text-center w-12 border-r border-slate-200">SL</th>
                                    <th className="px-4 py-1.5 text-left border-r border-slate-200">Medicine Description</th>
                                    <th className="px-4 py-1.5 text-left border-r border-slate-200">Mfgr</th>
                                    <th className="px-4 py-1.5 text-left border-r border-slate-200">Batch</th>
                                    <th className="px-4 py-1.5 text-left border-r border-slate-200">Expiry Date</th>
                                    <th className="px-3 py-1.5 text-center w-16 border-r border-slate-200">Qty</th>
                                    <th className="px-3 py-1.5 text-right w-24 border-r border-slate-200">Unit Price</th>
                                    <th className="px-3 py-1.5 text-center w-16 border-r border-slate-200">GST</th>
                                    <th className="px-4 py-1.5 text-right w-32">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payload.items.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors">
                                        <td className="px-3 py-1 text-center text-slate-600 border-r border-slate-100">{index + 1}</td>
                                        <td className="w-[250px] px-4 py-1 border-r border-slate-100">
                                            <p className="font-bold text-slate-900 uppercase text-[12px]">{item.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium tracking-tight">
                                                {item.generic || ""} {item.generic ? "· " : ""}HSN {item.hsnCode || "3004"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-1 text-slate-600 border-r border-slate-100 text-xs">{item.manufacturer || "—"}</td>
                                        <td className="px-4 py-1 text-slate-600 border-r border-slate-100 text-xs font-bold uppercase">{item.batchNumber || "—"}</td>
                                        <td className="px-4 py-1 text-slate-600 border-r border-slate-100 text-xs">
                                            {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }) : "—"}
                                        </td>
                                        <td className="px-3 py-1 text-center font-medium text-slate-700 border-r border-slate-100">{item.quantity}</td>
                                        <td className="px-3 py-1 text-right font-medium text-slate-700 border-r border-slate-100">{formatINR(item.unitPrice)}</td>
                                        <td className="px-3 py-1 text-center font-medium text-slate-700 border-r border-slate-100">{item.gst}%</td>
                                        <td className="px-4 py-1 text-right font-bold text-slate-900">{formatINR(item.total)}</td>
                                    </tr>
                                ))}
                                {/* REDUCED FILLER ROWS TO SAVE SPACE */}
                                {[...Array(Math.max(0, 5 - payload.items.length))].map((_, i) => (
                                    <tr key={`filler-${i}`} className="border-b border-slate-50 last:border-0 h-6">
                                        <td className="border-r border-slate-100"></td>
                                        <td className="border-r border-slate-100"></td>
                                        <td className="border-r border-slate-100"></td>
                                        <td className="border-r border-slate-100"></td>
                                        <td className="border-r border-slate-100"></td>
                                        <td className="border-r border-slate-100"></td>
                                        <td className="border-r border-slate-100"></td>
                                        <td className="border-r border-slate-100"></td>
                                        <td></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-auto flex justify-end gap-10 items-start break-inside-avoid">
                        {/* T&C - Right aligned next to totals as requested */}
                        <div className="flex-1 max-w-[400px] text-left">
                            <h4 className="text-[11px] font-bold uppercase text-slate-700 mb-2">Terms & Conditions</h4>
                            <ul className="text-[10px] text-slate-600 space-y-1 font-medium italic">
                                <li>Invoice once generated cannot be cancelled.</li>
                                <li className="text-slate-900 font-bold not-italic">Check medicines before leaving (Returns within 24H with original invoice).</li>
                                <li>Refrigerated items will not be accepted for return.</li>
                            </ul>
                            {payload.note && (
                                <div className="mt-4 text-xs text-slate-800">
                                    <span className="font-bold uppercase text-[9px] text-slate-500">Note:</span> {payload.note}
                                </div>
                            )}
                        </div>

                        <div className="w-[360px] mb-32 rounded-lg border border-slate-200 overflow-hidden shadow-sm bg-white break-inside-avoid">
                            <div className="p-5 space-y-3 text-[13px]">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 font-bold">Gross Amount</span>
                                    <div className="flex gap-4 items-center">
                                        <span className="text-slate-600 font-bold">:</span>
                                        <span className="text-slate-900 font-bold w-24 text-right">{formatINR(invoiceDetails.subtotal)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 font-bold">CGST/SGST Total</span>
                                    <div className="flex gap-4 items-center">
                                        <span className="text-slate-600 font-bold">:</span>
                                        <span className="text-slate-900 font-bold w-24 text-right">{formatINR(invoiceDetails.totalGst)}</span>
                                    </div>
                                </div>
                                {payload.discount > 0 && (
                                    <div className="flex justify-between items-center text-red-600">
                                        <span className="font-bold">Discount</span>
                                        <div className="flex gap-4 items-center">
                                            <span className="font-bold">:</span>
                                            <span className="font-bold w-24 text-right">-{formatINR(payload.discount)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="bg-[#67a35b] text-white py-3 px-5 flex justify-center items-center font-bold text-[16px] uppercase tracking-wide">
                                NET PAYABLE : {formatINR(invoiceDetails.grandTotal)}
                            </div>
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
                <div className="print-footer bg-slate-50 border-t border-slate-300 px-10 py-6 text-[10px] text-black flex justify-between items-center">
                    <div className="space-y-1">
                        <p className="text-black font-medium">This prescription is valid only if signed by registered medical practitioner</p>
                        <p className="text-black">
                            For Appointments / Booking: <span className="text-black font-semibold">+91 83019 26155 · 04931 240077 · hospitalmark@gmail.com</span>
                        </p>
                    </div>
                    <p className="text-black">
                        Powered by <span className="font-bold text-black tracking-tight uppercase">Caresoft Innovations LLP</span>
                    </p>
                </div>
            </div>
            <Watermark />
        </div>
    );
}

function Compact({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-2 min-h-6 items-center">
            <span className="text-slate-500 font-medium text-[11px] uppercase tracking-tight">{label} :</span>
            <span className="font-bold text-slate-900 text-[12px]">{value}</span>
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
