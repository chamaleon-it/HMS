import React from "react";
import { formatINR } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";
import useSWR from "swr";

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
}: PrintReceiptProps) {

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

    if (!patient || !payload || !invoiceDetails) return null;

    const invoiceNo = `${invoiceDetails.prefix}-${new Date().getTime().toString().slice(-6)}`;

    // Total rows for fixed height table padding
    const totalRowsNeeded = 21;
    const itemsCount = payload.items.length;
    const emptyRowsCount = Math.max(0, totalRowsNeeded - itemsCount);

    return (
        <div className="print-receipt hidden print:block bg-white text-black font-sans leading-tight overflow-visible relative">
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          @page {
            size: A4;
            margin: 4mm;
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
            width: 202mm !important;
            height: 289mm !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            box-sizing: border-box !important;
            display: block !important;
          }
          .no-print, aside, header, footer, nav, button {
            display: none !important;
          }
        }
      `}} />

            <div className="w-full h-full relative flex flex-col">
                {/* 1. Header Layout */}
                <div className="flex justify-between items-start pb-3 py-2">
                    {/* Left: Logo & Hospital Info */}
                    <div className="flex gap-3 items-center">
                        <div className="shrink-0 flex items-center justify-center">
                            <img src="/print/logo.png" alt="Logo" className="w-[90px] h-auto object-contain" />
                        </div>
                        <div className="flex flex-col gap-0 select-none">
                            <h1 className="text-[32px] font-bold text-black leading-none tracking-tight uppercase">MARK HOSPITAL</h1>
                            <p className="text-[12px] font-medium text-black mt-1">Pothukallu P.O, Nilambur, Malappuram</p>
                            <p className="text-[12px] font-medium text-black">Kerala, India - 679334</p>
                            <p className="text-[12px] font-bold text-black uppercase mt-1">DIGIPIN: MC9-955-6F2F</p>
                        </div>
                    </div>

                    {/* Right: Cash Receipt Title & Invoice Info */}
                    <div className="text-right flex flex-col items-end gap-2 pt-1">
                        <div className="border border-black rounded-[8px] px-6 py-1.5 text-center select-none">
                            <span className="text-[16px] font-bold text-black uppercase tracking-wider">CASH RECEIPT</span>
                        </div>
                        <div className="text-[12px] text-gray-500 font-medium space-y-0.5 mt-2 italic">
                            <p>Invoice No: <span className="font-bold text-black">{invoiceNo}</span></p>
                            <p>Date : <span className="font-bold text-black">{fDateandTime(new Date())}</span></p>
                        </div>
                    </div>
                </div>

                {/* 2. Patient Information Strip */}
                <div className="grid grid-cols-4 bg-[#eaeaea] text-black select-none py-2 px-6">
                    <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-gray-500 font-medium leading-none">Patient</span>
                        <span className="text-[14px] font-bold text-black mt-1.5 truncate leading-none">{patient.name}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-gray-500 font-medium leading-none">PID</span>
                        <span className="text-[14px] font-bold text-black mt-1.5 truncate leading-none">{patient.mrn?.replace("MRN", "P-") || " "}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-gray-500 font-medium leading-none">Phone</span>
                        <span className="text-[14px] font-bold text-black mt-1.5 truncate leading-none">{patient.phoneNumber || " "}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-gray-500 font-medium leading-none">Doctor</span>
                        <span className="text-[14px] font-bold text-black mt-1.5 truncate leading-none">{payload.doctor || " "}</span>
                    </div>
                </div>

                {/* 3. Medicine Table with Watermark & Fixed Height */}
                <div className="relative border border-[#c5c9cf] rounded-tr-2xl rounded-tl-2xl overflow-hidden w-full mt-3 mb-3">
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-0 select-none">
                        <img src="/print/logo.png" alt="watermark" className="w-[70%] object-contain" />
                    </div>

                    <table className="w-full border-collapse relative z-10 table-layout-fixed">
                        <thead className="bg-[#d9d9d9] border-b border-[#c5c9cf] text-[11px] font-semibold text-black">
                            <tr>
                                <th style={{ width: "5%" }} className="px-2 py-2 text-center border-r border-[#c5c9cf]">SL</th>
                                <th style={{ width: "28%" }} className="px-3 py-2 text-left border-r border-[#c5c9cf]">Medicine Description</th>
                                <th style={{ width: "12%" }} className="px-2 py-2 text-center border-r border-[#c5c9cf]">Batch No</th>
                                <th style={{ width: "12%" }} className="px-2 py-2 text-center border-r border-[#c5c9cf]">Expiry Date</th>
                                <th style={{ width: "6%" }} className="px-2 py-2 text-center border-r border-[#c5c9cf]">Qty</th>
                                <th style={{ width: "10%" }} className="px-2 py-2 text-right border-r border-[#c5c9cf]">Unit Price</th>
                                <th style={{ width: "5%" }} className="px-2 py-2 text-right border-r border-[#c5c9cf]">GST</th>
                                <th style={{ width: "12%" }} className="px-3 py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payload.items.map((item, index) => {
                                const dbInfo = getBatchInfo(item.name);
                                const rawBatch = item.batchNumber && item.batchNumber !== " " && item.batchNumber !== "—" ? item.batchNumber : dbInfo.batchNumber;
                                const displayBatch = rawBatch === "—" ? "" : rawBatch;
                                const displayExpiry = item.expiryDate ? item.expiryDate : dbInfo.expiryDate;
                                const displayGeneric = item.generic || dbInfo.generic;

                                return (
                                    <tr key={index} className="h-[38px] bg-transparent">
                                        <td className="px-2 py-0.5 text-center text-black text-[12px] font-medium border-r border-[#c5c9cf]">{index + 1}</td>
                                        <td className="px-3 py-0.5 border-r border-[#c5c9cf] leading-snug">
                                            <p className="font-bold text-black text-[12px]">{item.name}</p>
                                            {displayGeneric && <p className="text-[10px] text-gray-500 font-medium leading-none mt-0.5">{displayGeneric}</p>}
                                        </td>
                                        <td className="px-2 py-0.5 text-center text-black text-[12px] border-r border-[#c5c9cf]">{displayBatch}</td>
                                        <td className="px-2 py-0.5 text-center text-black text-[12px] border-r border-[#c5c9cf]">{formatExpiry(displayExpiry)}</td>
                                        <td className="px-2 py-0.5 text-center font-bold text-black text-[12px] border-r border-[#c5c9cf]">{item.quantity}</td>
                                        <td className="px-2 py-0.5 text-right font-medium text-black text-[12px] border-r border-[#c5c9cf]">{formatINR(item.unitPrice)}</td>
                                        <td className="px-2 py-0.5 text-right font-medium text-black text-[12px] border-r border-[#c5c9cf]">{item.gst}%</td>
                                        <td className="px-3 py-0.5 text-right font-bold text-black text-[12px]">{formatINR(item.total)}</td>
                                    </tr>
                                );
                            })}
                            {Array.from({ length: emptyRowsCount }).map((_, idx) => (
                                <tr key={`empty-${idx}`} className="h-[38px] bg-transparent select-none">
                                    <td className="border-r border-[#c5c9cf] px-2 py-0.5">&nbsp;</td>
                                    <td className="border-r border-[#c5c9cf] px-3 py-0.5">&nbsp;</td>
                                    <td className="border-r border-[#c5c9cf] px-2 py-0.5">&nbsp;</td>
                                    <td className="border-r border-[#c5c9cf] px-2 py-0.5">&nbsp;</td>
                                    <td className="border-r border-[#c5c9cf] px-2 py-0.5">&nbsp;</td>
                                    <td className="border-r border-[#c5c9cf] px-2 py-0.5">&nbsp;</td>
                                    <td className="border-r border-[#c5c9cf] px-2 py-0.5">&nbsp;</td>
                                    <td className="px-3 py-0.5">&nbsp;</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 4. Bottom Section */}
                <div className="flex justify-between items-stretch gap-1 select-none mt-auto mb-6">
                    {/* Left: Appointments & Legal validation */}
                    <div className="w-[64%] flex flex-col gap-1.5">
                        <div className="bg-[#c6c8cc] border border-[#8f949c] rounded-none px-2 py-1 flex items-center font-bold text-[13px] italic uppercase text-black">
                            FOR APPOINTMENTS / BOOKING :
                        </div>
                        <div className="flex-1 border border-[#9ca3af] rounded-bl-2xl rounded-br-2xl px-4 py-2 flex text-[12px] text-black font-bold justify-between items-center bg-white">
                            <div className="flex items-center gap-2">
                                <div className="w-[22px] h-[22px] rounded-full border border-black flex items-center justify-center shrink-0">
                                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <span>+91 8301 926 155, 04931 240 077</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-[22px] h-[22px] rounded-full border border-black flex items-center justify-center shrink-0">
                                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span>hospitalmark@gmail.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Consolidated Billing Summary Box */}
                    <div className="w-[36%] border border-[#9ca3af] rounded-br-2xl rounded-bl-2xl overflow-hidden bg-white flex flex-col justify-between">
                        {/* Top: Gross Amount & GST */}
                        <div className="px-4 py-1.5 flex flex-col justify-center text-[12px] bg-white gap-0.5 flex-1">
                            <div className="grid grid-cols-[115px_10px_1fr] items-center text-black">
                                <span className="font-semibold text-gray-700">Gross Amount</span>
                                <span className="font-bold">:</span>
                                <span className="font-bold text-right">{formatINR(invoiceDetails.subtotal)}</span>
                            </div>
                            <div className="grid grid-cols-[115px_10px_1fr] items-center text-black">
                                <span className="font-semibold text-gray-700">CGST/SGST Total</span>
                                <span className="font-bold">:</span>
                                <span className="font-bold text-right">{formatINR(invoiceDetails.totalGst)}</span>
                            </div>
                            {payload.discount > 0 && (
                                <div className="grid grid-cols-[115px_10px_1fr] items-center text-black">
                                    <span className="font-semibold text-gray-700">Discount</span>
                                    <span className="font-bold">:</span>
                                    <span className="font-bold text-right">-{formatINR(payload.discount)}</span>
                                </div>
                            )}
                        </div>

                        {/* Divider Line */}
                        <div className="border-t border-[#9ca3af]"></div>

                        {/* Bottom: Net Payable */}
                        <div className="bg-[#eaeaea] px-4 py-2 flex items-center">
                            <div className="grid grid-cols-[115px_10px_1fr] items-center w-full">
                                <span className="font-extrabold text-black text-[13px] uppercase">NET PAYABLE</span>
                                <span className="font-black text-black text-[14px]">:</span>
                                <span className="font-black text-black text-[14px] text-right">{formatINR(invoiceDetails.grandTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prescription validation disclaimer */}
                <div className="w-[64%] select-none mt-1">
                    <p className="text-[10px] text-gray-500 font-semibold leading-tight">
                        * This prescription is valid only if signed by registered medical practitioner.
                    </p>
                </div>

                {/* 5. Powered by Footer */}
                <div className="absolute bottom-0 right-0 text-right select-none leading-tight">
                    <p className="text-[9px] text-gray-500 font-medium">Powered by</p>
                    <p className="text-[10px] text-gray-800 font-bold tracking-tight uppercase">CARESOFT INNOVATIONS LLP</p>
                </div>
            </div>
        </div>
    );
}
