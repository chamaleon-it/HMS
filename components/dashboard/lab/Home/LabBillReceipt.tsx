import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fDateandTime } from "@/lib/fDateAndTime";
import useGetTest from "@/data/useGetTest";
import { formatINR } from "@/lib/fNumber";
import configuration from "@/config/configuration";
import {
    PrintHeader,
    PrintPatientStrip,
    PrintWatermark,
    PrintSignature,
    PrintFooter,
} from "@/components/print/PrintHeader";

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
    const formattedDate = fDateandTime(billDate).split(",")[0];

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
        grandTotal = Math.max(0, bill.items.reduce((sum: number, item: any) => sum + item.total, 0) - (bill.discount || 0));
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

    const content = (
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
                            <h2 className="text-sm font-black text-synapse-light uppercase tracking-wider">
                                LABORATORY CASH RECEIPT
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                                Invoice: {invoiceNo}
                            </span>
                            {doctorName && doctorName !== "Self" && (
                                <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                    Doctor: Dr. {doctorName}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <div className="break-inside-avoid relative z-10 space-y-1 flex-1">
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr className="border-b-2 border-synapse-light text-[10.5px] font-bold text-slate-700 uppercase tracking-wider text-left bg-slate-50">
                                    <th className="py-2 px-2 text-center w-12">#</th>
                                    <th className="py-2 px-2">Investigation / Test Name</th>
                                    <th className="py-2 px-2 text-center w-24">GST %</th>
                                    <th className="py-2 px-2 text-right w-36">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {items.map((item, index) => (
                                    <tr key={index} className="even:bg-slate-50/40">
                                        <td className="py-2 px-2 text-center font-bold text-slate-500 text-xs">{index + 1}</td>
                                        <td className="py-2 px-2 font-bold text-slate-900">{item.name}</td>
                                        <td className="py-2 px-2 text-center font-medium text-slate-700">{item.gst ?? 0}%</td>
                                        <td className="py-2 px-2 text-right font-bold text-slate-900">{formatINR(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* TOTALS & SIGNATURE SECTION */}
                    <div className="relative z-10 pt-3 border-t border-slate-200 flex justify-between items-end mt-auto">
                        {/* Validation Info on Left */}
                        <div className="space-y-1 text-xs">
                            <p className="text-[10px] text-slate-500 italic">
                                * This receipt is valid only if signed by authorized personnel.
                            </p>
                        </div>

                        {/* Totals Summary Box */}
                        <div className="w-72 border border-slate-300 rounded-lg overflow-hidden bg-white text-xs shadow-2xs">
                            <div className="p-2 space-y-1">
                                <div className="flex justify-between text-slate-700">
                                    <span>Gross Amount:</span>
                                    <span className="font-semibold text-black">{formatINR(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-700">
                                    <span>CGST / SGST Total:</span>
                                    <span className="font-semibold text-black">{formatINR(totalGst)}</span>
                                </div>
                                {Boolean(bill?.discount) && (
                                    <div className="flex justify-between text-slate-700">
                                        <span>Discount:</span>
                                        <span className="font-semibold text-black">-{formatINR(bill.discount)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-slate-100 border-t border-slate-300 px-2.5 py-1.5 flex justify-between items-center">
                                <span className="font-extrabold text-black text-[12.5px] uppercase tracking-wide">NET PAYABLE:</span>
                                <span className="font-black text-black text-sm">{formatINR(grandTotal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* AUTHORIZED SIGNATURE */}
                    <div className="relative z-10 pt-2 flex justify-end">
                        <PrintSignature label="Authorized Signature" />
                    </div>
                </div>

                {/* 4. BOTTOM FOOTER SECTION */}
                <PrintFooter />
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
