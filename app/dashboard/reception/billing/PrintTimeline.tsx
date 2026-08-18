import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fDateandTime, fDate } from "@/lib/fDateAndTime";
import {
    PrintHeader,
    PrintPatientStrip,
    PrintWatermark,
    PrintFooter,
} from "@/components/print/PrintHeader";
import { getBillType } from "@/lib/billTypeUtils";

export interface TimelineBillProps {
    _id?: string;
    mrn?: string;
    createdAt?: Date | string;
    doctor?: string | { _id?: string; name: string; specialization?: string };
    department?: string;
    note?: string;
    transactionType?: string;
    items?: {
        name: string;
        quantity?: number;
        unitPrice?: number;
        total?: number;
        gst?: number;
    }[];
    cash?: number;
    card?: number;
    upi?: number;
    discount?: number;
    roundOff?: boolean;
    patient?: {
        _id?: string;
        name: string;
        mrn?: string;
        phoneNumber?: string;
        gender?: string;
        dateOfBirth?: Date | string;
        address?: string;
    } | null;
}

interface PrintTimelineProps {
    bill: TimelineBillProps | null;
}

export default function PrintTimeline({ bill }: PrintTimelineProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!bill || !mounted) return null;

    const patient = bill.patient;
    const billType = getBillType(bill);
    const isProcedure = billType === "procedure";

    // Doctor information
    const rawDoctor = bill.doctor;
    const doctorName =
        typeof rawDoctor === "object" && rawDoctor !== null
            ? rawDoctor.name
            : typeof rawDoctor === "string" && rawDoctor !== "Self" && rawDoctor !== "-"
                ? rawDoctor
                : "";
    const doctorSpec =
        typeof rawDoctor === "object" && rawDoctor !== null
            ? rawDoctor.specialization
            : bill.department || "Consultant";

    // Patient info calculations
    let ageStr = "____";
    if (patient?.dateOfBirth) {
        const dob = new Date(patient.dateOfBirth);
        if (!isNaN(dob.getTime())) {
            const ageYears = new Date().getFullYear() - dob.getFullYear();
            ageStr = `${ageYears} Y`;
        }
    }

    const sexStr = patient?.gender ? patient.gender.charAt(0).toUpperCase() : "____";
    const patientName = patient?.name || "—";
    const opNumber = patient?.mrn ? patient.mrn.replace("MRN", "P-") : "—";
    const formattedBillDate = bill.createdAt ? fDate(bill.createdAt) : fDate(new Date());

    const sheetTitle = isProcedure
        ? "PROCEDURE TIMELINE & SESSION SHEET"
        : "THERAPY TIMELINE & SESSION SHEET";
    const columnTherapyHeader = isProcedure ? "Procedure" : "Therapy";

    // Total rows to fill the entire A4 page vertically
    const TOTAL_BLANK_ROWS = 18;

    return createPortal(
        <div className="print-timeline hidden print:block bg-white text-black font-montserrat leading-relaxed overflow-hidden">
            <style
                dangerouslySetInnerHTML={{
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
          body > *:not(.print-timeline) {
            display: none !important;
          }
          .print-timeline, .print-timeline * {
            font-family: 'Montserrat', sans-serif !important;
          }
          .print-timeline { 
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
      `,
                }}
            />

            <div className="w-[210mm] h-[297mm] max-h-[297mm] mx-auto flex flex-col relative z-20 bg-white border border-slate-200 print:border-none print:w-[210mm] print:h-[297mm] print:max-h-[297mm] print:m-0 print:p-0 overflow-hidden">
                {/* 1. TOP HEADER SECTION */}
                <PrintHeader />

                {/* 2. PATIENT INFO STRIP */}
                <PrintPatientStrip
                    name={patientName}
                    age={ageStr}
                    sex={sexStr}
                    date={formattedBillDate}
                    opNo={opNumber}
                />

                {/* 3. MAIN BODY SECTION */}
                <div className="flex-1 relative flex flex-col px-7 py-3 bg-white overflow-hidden space-y-2.5 text-[12px]">
                    <PrintWatermark />

                    {/* Timeline Sheet Title Banner */}
                    <div className="relative z-10 flex justify-between items-center border-b-2 border-[#5F7350] pb-1.5">
                        <div className="space-y-0.5">
                            <h2 className="text-sm font-black text-[#5F7350] tracking-wider uppercase">
                                {sheetTitle}
                            </h2>
                            <p className="text-[10.5px] text-slate-700 font-semibold">
                                {doctorName ? `Prescribed By: Dr. ${doctorName.toUpperCase()} (${doctorSpec})` : "General Outpatient Service"}
                            </p>
                        </div>
                        <div className="text-right space-y-0.5">
                            <div className="inline-flex items-center gap-1.5 bg-[#5F7350] text-white px-3 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase">
                                <span>Bill No:</span>
                                <span>{bill.mrn || "—"}</span>
                            </div>
                            <p className="text-[10px] text-slate-600 font-medium">
                                Bill Date: {bill.createdAt ? fDateandTime(bill.createdAt) : formattedBillDate}
                            </p>
                        </div>
                    </div>

                    {/* FULL PAGE TIMELINE TABLE (No prefilled data, full height, no summary) */}
                    <div className="relative z-10 border-2 border-[#5F7350] rounded-lg overflow-hidden flex-1 flex flex-col">
                        <table className="w-full h-full border-collapse table-fixed">
                            <thead>
                                <tr className="bg-[#5F7350] text-white text-[11.5px] font-bold uppercase tracking-wider h-10">
                                    <th className="px-3 text-center border-r border-slate-600 w-[20%]">
                                        Date
                                    </th>
                                    <th className="px-4 text-left border-r border-slate-600 w-[25%]">
                                        {columnTherapyHeader}
                                    </th>
                                    <th className="px-3 text-center border-r border-slate-600 w-[20%]">
                                        Therapist
                                    </th>
                                    <th className="px-3 text-center border-r border-slate-600 w-[15%]">
                                        Amount
                                    </th>
                                    <th className="px-3 text-center border-slate-600 w-[20%]">
                                        Signature / Seal
                                    </th>

                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: TOTAL_BLANK_ROWS }).map((_, idx) => (
                                    <tr
                                        key={idx}
                                        className={`border-b border-slate-300 last:border-0`}
                                        style={{ height: "10.8mm" }}
                                    >
                                        {/* Date Column */}
                                        <td className="border-r border-slate-300 px-3 text-center">

                                        </td>

                                        {/* Therapy / Procedure Column */}
                                        <td className="border-r border-slate-300 px-4 text-left"></td>

                                        {/* Amount Column */}
                                        <td className="border-r border-slate-300 px-3 text-center"></td>

                                        {/* Therapist Column */}
                                        <td className="border-r px-3 text-center"></td>
                                        <td className="px-3 text-center"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. BOTTOM FOOTER SECTION */}
                <PrintFooter />
            </div>
        </div>,
        document.body
    );
}
