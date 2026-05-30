import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fDateandTime } from "@/lib/fDateAndTime";
import useGetTest from "@/data/useGetTest";
import { formatINR } from "@/lib/fNumber";
import configuration from "@/config/configuration";

interface LabBillReceiptProps {
    report?: any | null;
    bill?: any | null;
    panels?: { name: string; price: number; tests?: any[] }[];
}

export default function LabBillReceipt({ report, bill, panels }: LabBillReceiptProps) {
    const [mounted, setMounted] = useState(false);
    const { tests } = useGetTest();

    useEffect(() => {
        setMounted(true);
        const name = bill?.patient?.name || report?.patient?.name;
        const mrn = bill?.patient?.mrn || report?.patient?.mrn;
        if (name && mrn) {
            const originalTitle = document.title;
            const pid = mrn.replace("MRN", "P-");
            const timestamp = fDateandTime(new Date());
            document.title = `${name}_${pid}_${timestamp}_Bill`;
            return () => {
                document.title = originalTitle;
            };
        }
    }, [report, bill]);

    if ((!report && !bill) || !mounted) return null;

    // Determine values
    const patient = bill?.patient || report?.patient;
    const doctorVal = bill?.doctor || report?.doctor;
    const doctorName = typeof doctorVal === 'object' ? doctorVal?.name : doctorVal;
    const invoiceNo = bill?.mrn || `LAB-${report?.sampleId || report?.mrn || report?._id.substring(0, 6).toUpperCase()}`;
    const billDate = bill?.createdAt ? new Date(bill.createdAt) : new Date();

    // Calculate items
    let items: { name: string; total: number; gst?: number }[] = [];
    let subtotal = 0;
    let totalGst = 0;
    let grandTotal = 0;

    if (bill) {
        items = bill.items.map((it: any) => ({
            name: it.name,
            total: it.total,
            gst: it.gst
        }));
        subtotal = bill.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice - item.discount), 0);
        totalGst = bill.items.reduce((sum: number, item: any) => sum + ((item.quantity * item.unitPrice - item.discount) * item.gst) / 100, 0);
        grandTotal = bill.items.reduce((sum: number, item: any) => sum + item.total, 0);
    } else {
        // Group tests by panels if they belong to a panel
        const selectedPanels = panels?.filter(p => report.panels?.includes(p.name)) || [];
        selectedPanels.forEach(p => {
            items.push({ name: p.name, total: p.price || 0, gst: 0 });
        });

        const panelTests = selectedPanels.flatMap((e: any) => e.tests || []).map((e: any) => e._id);

        // Standalone tests
        report.test?.filter((t: any) => !panelTests.includes(t.name?._id)).forEach((t: any) => {
            const testDetails = tests.find((test) => test._id === t.name?._id);
            items.push({ name: t.name?.name || "Test", total: testDetails?.price || 0, gst: 0 });
        });

        subtotal = items.reduce((a, b) => a + b.total, 0);
        totalGst = 0;
        grandTotal = subtotal + totalGst;
    }

    const totalRowsNeeded = 21;
    const itemsCount = items.length;
    const emptyRowsCount = Math.max(0, totalRowsNeeded - itemsCount);

    const content = (
        <div className="print-receipt hidden print:flex bg-white text-black font-sans leading-tight overflow-visible relative flex-col">
            <style dangerouslySetInnerHTML={{
                __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');
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
          .font-cinzel {
            font-family: 'Cinzel Decorative', serif !important;
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
            display: flex !important;
            flex-direction: column !important;
            z-index: 999999999 !important;
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
                            <img src="/print/image.png" alt="Logo" className="w-[90px] h-auto object-contain" />
                        </div>
                        <div className="flex flex-col gap-0 select-none">
                            <h1 className="text-[26px] font-bold text-black leading-none tracking-tight uppercase font-cinzel">{configuration().hospitalName}</h1>
                            <p className="text-[12px] font-medium text-black mt-1">Kunduthode, Edavanna, Malappuram</p>
                            <p className="text-[12px] font-medium text-black">Kerala, India - 676541</p>
                        </div>
                    </div>

                    {/* Right: Cash Receipt Title & Invoice Info */}
                    <div className="text-right flex flex-col items-end gap-2 pt-1">
                        <div className="border border-black rounded-[8px] px-6 py-1.5 text-center select-none">
                            <span className="text-[16px] font-bold text-black uppercase tracking-wider">CASH RECEIPT</span>
                        </div>
                        <div className="text-[12px] text-gray-500 font-medium space-y-0.5 mt-2 italic">
                            <p>Invoice No: <span className="font-bold text-black">{invoiceNo}</span></p>
                            <p>Date : <span className="font-bold text-black">{fDateandTime(billDate)}</span></p>
                        </div>
                    </div>
                </div>

                {/* 2. Patient Information Strip */}
                <div className="grid grid-cols-4 bg-[#eaeaea] text-black select-none py-2 px-6">
                    <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-gray-500 font-medium leading-none">Patient</span>
                        <span className="text-[14px] font-bold text-black mt-1.5 truncate leading-none">{patient?.name || "—"}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-gray-500 font-medium leading-none">PID</span>
                        <span className="text-[14px] font-bold text-black mt-1.5 truncate leading-none">{patient?.mrn?.replace("MRN", "P-") || " "}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-gray-500 font-medium leading-none">Phone</span>
                        <span className="text-[14px] font-bold text-black mt-1.5 truncate leading-none">{patient?.phoneNumber || " "}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-gray-500 font-medium leading-none">Doctor</span>
                        <span className="text-[14px] font-bold text-black mt-1.5 truncate leading-none">{doctorName ? `Dr. ${doctorName}` : "Self"}</span>
                    </div>
                </div>

                {/* 3. Medicine Table with Watermark & Fixed Height */}
                <div className="relative border border-[#c5c9cf] rounded-tr-2xl rounded-tl-2xl overflow-hidden w-full mt-3 mb-3 flex-1 flex flex-col">
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-0 select-none">
                        <img src="/print/image.png" alt="watermark" className="w-[70%] object-contain" />
                    </div>

                    <table className="w-full border-collapse relative z-10 table-layout-fixed">
                        <thead className="bg-[#d9d9d9] border-b border-[#c5c9cf] text-[11px] font-semibold text-black">
                            <tr>
                                <th style={{ width: "10%" }} className="px-2 py-2 text-center border-r border-[#c5c9cf]">SL</th>
                                <th style={{ width: "60%" }} className="px-3 py-2 text-left border-r border-[#c5c9cf]">Test</th>
                                <th style={{ width: "10%" }} className="px-2 py-2 text-center border-r border-[#c5c9cf]">GST %</th>
                                <th style={{ width: "20%" }} className="px-3 py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => {
                                return (
                                    <tr key={index} className="h-[38px] bg-transparent">
                                        <td className="px-2 py-0.5 text-center text-black text-[12px] font-medium border-r border-[#c5c9cf]">{index + 1}</td>
                                        <td className="px-3 py-0.5 border-r border-[#c5c9cf] leading-snug">
                                            <p className="font-bold text-black text-[12px]">{item.name}</p>
                                        </td>
                                        <td className="px-2 py-0.5 text-center text-black text-[12px] font-medium border-r border-[#c5c9cf]">{item.gst ?? 0}%</td>
                                        <td className="px-3 py-0.5 text-right font-bold text-black text-[12px]">{formatINR(item.total)}</td>
                                    </tr>
                                );
                            })}
                            {Array.from({ length: emptyRowsCount }).map((_, idx) => (
                                <tr key={`empty-${idx}`} className="h-[38px] bg-transparent select-none">
                                    <td className="border-r border-[#c5c9cf] px-2 py-0.5">&nbsp;</td>
                                    <td className="border-r border-[#c5c9cf] px-3 py-0.5">&nbsp;</td>
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
                                <span>+91 8075016480</span>
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
                                <span className="font-bold text-right">{formatINR(subtotal)}</span>
                            </div>
                            <div className="grid grid-cols-[115px_10px_1fr] items-center text-black">
                                <span className="font-semibold text-gray-700">CGST/SGST Total</span>
                                <span className="font-bold">:</span>
                                <span className="font-bold text-right">{formatINR(totalGst)}</span>
                            </div>
                        </div>

                        {/* Divider Line */}
                        <div className="border-t border-[#9ca3af]"></div>

                        {/* Bottom: Net Payable */}
                        <div className="bg-[#eaeaea] px-4 py-2 flex items-center">
                            <div className="grid grid-cols-[115px_10px_1fr] items-center w-full">
                                <span className="font-extrabold text-black text-[13px] uppercase">NET PAYABLE</span>
                                <span className="font-black text-black text-[14px]">:</span>
                                <span className="font-black text-black text-[14px] text-right">{formatINR(grandTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prescription validation disclaimer */}
                <div className="w-[64%] select-none mt-1">
                    {/* <p className="text-[10px] text-gray-500 font-semibold leading-tight">
                        * This receipt is valid only if signed by registered medical practitioner.
                    </p> */}
                </div>

                {/* 5. Powered by Footer */}
                <div className="absolute bottom-0 right-0 text-right select-none leading-tight">
                    <p className="text-[9px] text-gray-500 font-medium">Powered by</p>
                    <p className="text-[10px] text-gray-800 font-bold tracking-tight uppercase">CARESOFT INNOVATIONS LLP</p>
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
