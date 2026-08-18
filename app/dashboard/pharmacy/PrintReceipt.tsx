import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatINR } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";
import useSWR from "swr";
import configuration from "@/config/configuration";
import {
    PrintHeader,
    PrintPatientStrip,
    PrintWatermark,
    PrintSignature,
    PrintFooter,
} from "@/components/print/PrintHeader";

interface PrintReceiptProps {
    payload?: {
        patient: string;
        items: {
            name: string;
            generic?: string;
            batchNumber?: string;
            expiryDate?: string | Date;
            quantity: number;
            unitPrice: number;
            gst: number;
            total: number;
        }[];
        cash: number;
        card: number;
        upi: number;
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
        invoiceNo?: string;
    };
    invoiceNo?: string;
}

const formatExpiry = (dateStr?: string | Date) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return String(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

export default function PrintReceipt({
    payload,
    patient,
    invoiceDetails,
    invoiceNo: invoiceNoProp,
}: PrintReceiptProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: itemsData } = useSWR<{ data: any[] }>("/pharmacy/items?limit=1000");
    const dbItems = itemsData?.data || [];

    const getBatchInfo = (itemName: string) => {
        const matched = dbItems.find(
            (it) => it.name.trim().toLowerCase() === itemName.trim().toLowerCase()
        );
        if (!matched) return { batchNumber: "", expiryDate: undefined, generic: undefined };

        let batchNumber = matched.batchNumber || "";
        if (batchNumber === "—") batchNumber = "";
        let expiryDate = matched.expiryDate;

        if (matched.batches && matched.batches.length > 0) {
            const sorted = [...matched.batches].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            batchNumber = sorted[0].batchNumber || "";
            if (batchNumber === "—") batchNumber = "";
            expiryDate = sorted[0].expiryDate || matched.expiryDate;
        }

        return {
            batchNumber,
            expiryDate,
            generic: matched.generic,
        };
    };

    if (!patient || !payload || !mounted) return null;

    const computedSubtotal = payload.items.reduce((sum, item) => sum + (item.total ?? ((item.unitPrice || 0) * (item.quantity || 1))), 0);
    const computedGrandTotal = computedSubtotal - (payload.discount || 0);

    const safeInvoiceDetails = invoiceDetails || {
        prefix: "INV",
        roundOffAmount: 0,
        subtotal: computedSubtotal,
        totalGst: 0,
        grandTotal: computedGrandTotal,
        invoiceNo: invoiceNoProp || "INV-001",
    };

    const invoiceNo = invoiceNoProp || safeInvoiceDetails.invoiceNo || `${safeInvoiceDetails.prefix}-${new Date().getTime().toString().slice(-6)}`;

    // Patient info calculations for standard Patient Strip
    let ageStr = "____";
    if (patient?.dateOfBirth) {
        const dob = new Date(patient.dateOfBirth);
        if (!isNaN(dob.getTime())) {
            const ageYears = new Date().getFullYear() - dob.getFullYear();
            ageStr = `${ageYears} Y`;
        }
    }
    const sexStr = patient?.gender ? patient.gender.charAt(0).toUpperCase() : "____";
    const opNumber = patient?.mrn ? patient.mrn.replace("MRN", "P-") : "";
    const formattedDate = fDateandTime(new Date()).split(",")[0];

    const isConsultationOnly = payload.items.every(item => item.name.toLowerCase().includes("consultation"));
    const tableHeader = isConsultationOnly ? "Description" : "Medicine / Item Description";

    const paymentMethod =
        payload.upi > 0
            ? "UPI"
            : payload.card > 0
                ? "CARD"
                : "CASH";

    return createPortal(
        <div className="print-receipt hidden print:block bg-white text-black font-montserrat leading-relaxed">
            <style dangerouslySetInnerHTML={{
                __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          html, body { 
            margin: 0 !important;
            padding: 0 !important;
            height: 297mm !important;
            max-height: 297mm !important;
            overflow: hidden !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Montserrat', sans-serif !important;
          }
          body > *:not(.print-receipt) {
            display: none !important;
          }
          .print-receipt, .print-receipt * { 
            font-family: 'Montserrat', sans-serif !important;
          }
          .print-receipt { 
            visibility: visible !important;
            display: flex !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            flex-direction: column !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
          }
          .no-print, aside, header, footer, nav, button {
            display: none !important;
          }
        }
      `}} />

            <div className="w-[210mm] h-[297mm] max-h-[297mm] mx-auto flex flex-col relative z-20 bg-white border border-slate-200 print:border-none print:w-[210mm] print:h-[297mm] print:max-h-[297mm] print:m-0 print:p-0 overflow-hidden font-montserrat">
                {/* 1. TOP HEADER SECTION */}
                <PrintHeader />

                {/* 2. PATIENT INFO STRIP */}
                <PrintPatientStrip
                    name={patient?.name || ""}
                    age={ageStr}
                    sex={sexStr}
                    date={formattedDate}
                    opNo={opNumber}
                />

                {/* 3. MAIN BODY SECTION */}
                <div className="flex-1 relative flex flex-col p-6 bg-white overflow-hidden space-y-3 text-[13px]">
                    <PrintWatermark />

                    {/* Receipt Title Banner */}
                    <div className="flex justify-between items-center relative z-10 border-b border-slate-300 pb-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-black text-[#5F7350] uppercase tracking-wider">
                                CASH RECEIPT / TAX INVOICE
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                                Invoice: {invoiceNo}
                            </span>
                            {payload.doctor && payload.doctor !== "-" && (
                                <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                    Doctor: {payload.doctor}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <div className="break-inside-avoid relative z-10 space-y-1 flex-1">
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr className="border-b-2 border-[#5F7350] text-[10.5px] font-bold text-slate-700 uppercase tracking-wider text-left bg-slate-50">
                                    <th className="py-2 px-2 text-center w-10">#</th>
                                    <th className="py-2 px-2">{tableHeader}</th>
                                    <th className="py-2 px-2 text-center">Batch No</th>
                                    <th className="py-2 px-2 text-center">Expiry</th>
                                    <th className="py-2 px-2 text-center">Qty</th>
                                    <th className="py-2 px-2 text-right">Unit Price</th>
                                    <th className="py-2 px-2 text-right">GST</th>
                                    <th className="py-2 px-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {payload.items.map((item, index) => {
                                    const dbInfo = getBatchInfo(item.name);
                                    const rawBatch = item.batchNumber && item.batchNumber !== " " && item.batchNumber !== "—" ? item.batchNumber : dbInfo.batchNumber;
                                    const displayBatch = rawBatch === "—" ? "—" : rawBatch || "—";
                                    const displayExpiry = item.expiryDate ? item.expiryDate : dbInfo.expiryDate;
                                    const displayGeneric = item.generic || dbInfo.generic;

                                    return (
                                        <tr key={index} className="even:bg-slate-50/40">
                                            <td className="py-2 px-2 text-center font-bold text-slate-500 text-xs">{index + 1}</td>
                                            <td className="py-2 px-2 font-bold text-slate-900">
                                                <p className="font-bold text-slate-900">{item.name}</p>
                                                {displayGeneric && (
                                                    <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">GEN: {displayGeneric}</p>
                                                )}
                                            </td>
                                            <td className="py-2 px-2 text-center font-medium text-slate-700">{displayBatch}</td>
                                            <td className="py-2 px-2 text-center font-medium text-slate-700">{formatExpiry(displayExpiry) || "—"}</td>
                                            <td className="py-2 px-2 text-center font-bold text-slate-900">{item.quantity}</td>
                                            <td className="py-2 px-2 text-right font-medium text-slate-800">{formatINR(item.unitPrice)}</td>
                                            <td className="py-2 px-2 text-right font-medium text-slate-800">{item.gst}%</td>
                                            <td className="py-2 px-2 text-right font-bold text-slate-900">{formatINR(item.total)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* TOTALS & SIGNATURE SECTION */}
                    <div className="relative z-10 pt-3 border-t border-slate-200 flex justify-between items-end mt-auto">
                        {/* Payment & Validation Info on Left */}
                        <div className="space-y-1 text-xs">
                            <p className="text-slate-600 font-medium">
                                Mode of Payment: <span className="font-bold text-black uppercase">{paymentMethod}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 italic">
                                * This receipt is valid only if signed by authorized personnel.
                            </p>
                        </div>

                        {/* Totals Summary Box */}
                        <div className="w-72 border border-slate-300 rounded-lg overflow-hidden bg-white text-xs shadow-2xs">
                            <div className="p-2 space-y-1">
                                <div className="flex justify-between text-slate-700">
                                    <span>Gross Amount:</span>
                                    <span className="font-semibold text-black">{formatINR(safeInvoiceDetails.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-700">
                                    <span>CGST / SGST Total:</span>
                                    <span className="font-semibold text-black">{formatINR(safeInvoiceDetails.totalGst)}</span>
                                </div>
                                {payload.discount > 0 && (
                                    <div className="flex justify-between text-slate-700">
                                        <span>Discount:</span>
                                        <span className="font-semibold text-black">-{formatINR(payload.discount)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-slate-100 border-t border-slate-300 px-2.5 py-1.5 flex justify-between items-center">
                                <span className="font-extrabold text-black text-[12.5px] uppercase tracking-wide">NET PAYABLE:</span>
                                <span className="font-black text-black text-sm">{formatINR(safeInvoiceDetails.grandTotal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* AUTHORIZED SIGNATURE */}
                    <div className="relative z-10 pt-2 flex justify-end">
                        <PrintSignature
                            label="Authorized Signature"
                            doctorName={payload.doctor && payload.doctor !== "-" ? payload.doctor : undefined}
                            specialization={payload.department}
                        />
                    </div>
                </div>

                {/* 4. BOTTOM FOOTER SECTION */}
                <PrintFooter />
            </div>
        </div>,
        document.body
    );
}
