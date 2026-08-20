"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fDateandTime, fDate } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import {
  PrintHeader,
  PrintPatientStrip,
  PrintWatermark,
  PrintFooter,
} from "@/components/print/PrintHeader";
import { TimelineDataType, TreatmentOrderType } from "./interface";

interface Props {
  timelineData: TimelineDataType | null;
  onClose?: () => void;
}

export default function PrintTreatmentTimeline({ timelineData }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!timelineData || !mounted) return null;

  const { rootTreatment, sessions = [], patient, doctor } = timelineData;

  const isProcedure =
    rootTreatment?.type === "Procedure" ||
    rootTreatment?.category?.toLowerCase() === "procedure";

  const sheetTitle = isProcedure
    ? "PROCEDURE TIMELINE & SESSION SHEET"
    : "THERAPY TIMELINE & SESSION SHEET";

  const columnHeader = isProcedure ? "Procedure Details" : "Therapy Details";

  // Doctor information
  const doctorName =
    typeof doctor === "object" && doctor !== null
      ? doctor.name
      : typeof rootTreatment?.doctorName === "string" &&
        rootTreatment.doctorName !== "Self" &&
        rootTreatment.doctorName !== "-"
        ? rootTreatment.doctorName
        : "";

  const doctorSpec =
    typeof doctor === "object" && doctor !== null
      ? (doctor as any).specialization
      : "Consultant";

  // Patient calculations
  let ageStr = "____";
  if (patient?.dateOfBirth) {
    const dob = new Date(patient.dateOfBirth);
    if (!isNaN(dob.getTime())) {
      const ageYears = new Date().getFullYear() - dob.getFullYear();
      ageStr = `${ageYears} Y`;
    }
  }

  const sexStr = patient?.gender
    ? patient.gender.charAt(0).toUpperCase()
    : "____";
  const patientName = patient?.name || "—";
  const opNumber = patient?.mrn ? patient.mrn.replace("MRN", "P-") : "—";
  const formattedPrescriptionDate = rootTreatment?.prescriptionDate
    ? fDate(rootTreatment.prescriptionDate)
    : fDate(new Date());

  const TOTAL_ROWS = 16;
  const blankRowsCount = Math.max(0, TOTAL_ROWS - sessions.length);

  return createPortal(
    <div
      id="treatment-timeline-print-container"
      className="print-treatment-timeline hidden print:block bg-white text-black font-montserrat leading-relaxed overflow-hidden"
    >
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
          body > *:not(.print-treatment-timeline) {
            display: none !important;
          }
          .print-treatment-timeline, .print-treatment-timeline * {
            font-family: 'Montserrat', sans-serif !important;
          }
          .print-treatment-timeline { 
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
          date={formattedPrescriptionDate}
          opNo={opNumber}
        />

        {/* 3. MAIN BODY SECTION */}
        <div className="flex-1 relative flex flex-col px-7 py-2.5 bg-white overflow-hidden space-y-2 text-[12px]">
          <PrintWatermark />

          {/* Timeline Title Banner */}
          <div className="relative z-10 flex justify-between items-center border-b-2 border-synapse-light pb-1.5">
            <div className="space-y-0.5">
              <h2 className="text-sm font-black text-synapse-light tracking-wider uppercase">
                {sheetTitle}
              </h2>
              <p className="text-[10.5px] text-slate-700 font-semibold">
                {doctorName
                  ? `Prescribed By: Dr. ${doctorName.toUpperCase()} (${doctorSpec})`
                  : "Prescribed Outpatient Service"}
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <div className="inline-flex items-center gap-1.5 bg-synapse-light text-white px-3 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase">
                <span>Treatment ID:</span>
                <span>{rootTreatment?.mrn || "—"}</span>
              </div>
              <p className="text-[10px] text-slate-600 font-medium">
                Prescription Date: {formattedPrescriptionDate}
              </p>
            </div>
          </div>

          {/* SESSIONS TIMELINE TABLE */}
          <div className="relative z-10 border-2 border-synapse-light rounded-lg overflow-hidden flex-1 flex flex-col">
            <table className="w-full h-full border-collapse table-fixed">
              <thead>
                <tr className="bg-synapse-light text-white text-[11px] font-bold uppercase tracking-wider h-8">
                  <th className="px-2 text-center border-r border-slate-600 w-[14%]">
                    Session & Date
                  </th>
                  <th className="px-3 text-left border-r border-slate-600 w-[30%]">
                    {columnHeader}
                  </th>
                  <th className="px-2 text-center border-r border-slate-600 w-[20%]">
                    Therapist
                  </th>
                  <th className="px-2 text-center border-r border-slate-600 w-[18%]">
                    Bill Ref / Amount
                  </th>
                  <th className="px-2 text-center border-slate-600 w-[18%]">
                    Sign / Seal
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* 16 Clean Blank Rows for Handwritten Pen Recording */}
                {Array.from({ length: TOTAL_ROWS }).map((_, idx) => (
                  <tr
                    key={`blank-row-${idx}`}
                    className="border-b border-slate-300 last:border-0 bg-white"
                    style={{ height: "10.8mm" }}
                  >
                    <td className="border-r border-slate-300 px-2 text-center text-slate-400 font-semibold text-[10.5px]">

                    </td>
                    <td className="border-r border-slate-300 px-3 text-left"></td>
                    <td className="border-r border-slate-300 px-2 text-center"></td>
                    <td className="border-r border-slate-300 px-2 text-center"></td>
                    <td className="px-2 text-center"></td>
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
