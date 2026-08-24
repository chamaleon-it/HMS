"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  PrintHeader,
  PrintFooter,
  PrintPatientStrip,
  PrintWatermark,
  PrintSignature,
} from "@/components/print/PrintHeader";
import { fDateOnly, fDateandTime, fAgeString } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import { useAuth } from "@/auth/context/auth-context";

interface DischargeSummaryPrintProps {
  ip: any;
  consultations?: any[];
  labReports?: any[];
  orders?: any[];
  billings?: any[];
  totalBilled?: number;
  totalPaid?: number;
  totalDue?: number;
}

interface PageChunk {
  pageIndex: number;
  showSummary: boolean;
  medicines: Array<any & { globalIndex: number }>;
  labs: Array<any & { globalIndex: number }>;
  showBilling: boolean;
  showAdvice: boolean;
  showSignature: boolean;
}

export default function DischargeSummaryPrint({
  ip,
  consultations = [],
  labReports = [],
  orders = [],
  billings = [],
  totalBilled = 0,
  totalPaid = 0,
  totalDue = 0,
}: DischargeSummaryPrintProps) {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!ip || !mounted) return null;

  const patient = ip.patientId;
  const doctor = ip.doctorId;
  const doctorName =
    typeof doctor === "object" && doctor?.name
      ? doctor.name.startsWith("Dr.")
        ? doctor.name
        : `Dr. ${doctor.name}`
      : user?.name
        ? user.name.startsWith("Dr.")
          ? user.name
          : `Dr. ${user.name}`
        : "Dr. Umer Mukhthar";

  const admissionDate = ip.admissionDate ? new Date(ip.admissionDate) : null;
  const dischargeDate = ip.dischargeDate ? new Date(ip.dischargeDate) : new Date();
  const stayDays = admissionDate
    ? Math.max(1, Math.ceil((dischargeDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  const ipNotes: any[] = (ip.ipNotes ?? []).slice().reverse();

  // Consolidate prescribed medicines from pharmacy orders & consultations
  const allMedicines: any[] = [];
  orders.forEach((ord) => {
    (ord.items || []).forEach((it: any) => {
      const medName = typeof it.name === "object" ? it.name?.name : it.name;
      if (medName && !allMedicines.some((x) => x.name === medName)) {
        allMedicines.push({
          name: medName,
          dosage: it.dosage || "As directed",
          frequency: it.frequency || "—",
          food: it.food || "—",
          duration: it.duration || "—",
          quantity: it.quantity || 1,
        });
      }
    });
  });

  consultations.forEach((c) => {
    (c.medicines || []).forEach((m: any) => {
      const medName = typeof m.name === "object" ? m.name?.name : m.name;
      if (medName && !allMedicines.some((x) => x.name === medName)) {
        allMedicines.push({
          name: medName,
          dosage: m.dosage || "As directed",
          frequency: m.frequency || "—",
          food: m.food || "—",
          duration: m.duration || "—",
          quantity: m.quantity || 1,
        });
      }
    });
  });

  // Consolidate lab investigations
  const allLabs: any[] = [];
  labReports.forEach((l: any, idx: number) => {
    allLabs.push({
      name: l.testName || l.title || (l.testId?.name ? l.testId.name : `Lab Report #${l.mrn || idx + 1}`),
      date: l.createdAt ? fDateOnly(l.createdAt) : "—",
      status: l.status || "Completed",
    });
  });

  // Calculate pages
  const PAGE_CAPACITY = 840;
  const titleHeight = 28;
  const admissionGridHeight = 55 + (ip.notes ? 20 : 0);
  const diagnosisHeight = 30 + (patient?.conditions?.length > 0 ? 18 : 0);
  const notesHeight = ipNotes.length > 0 ? 25 + Math.min(ipNotes.length, 3) * 18 : 0;
  const summaryHeight = admissionGridHeight + diagnosisHeight + notesHeight;

  const medsHeaderHeight = 28;
  const medRowHeight = 22;
  const labsHeaderHeight = 28;
  const labRowHeight = 22;
  const billingHeight = 26;
  const adviceHeight = 38;
  const signatureHeight = 65;

  const totalMedsHeight =
    allMedicines.length > 0 ? medsHeaderHeight + allMedicines.length * medRowHeight : 0;
  const totalLabsHeight =
    allLabs.length > 0 ? labsHeaderHeight + allLabs.length * labRowHeight : 0;

  const totalAllHeight =
    titleHeight +
    summaryHeight +
    totalMedsHeight +
    totalLabsHeight +
    billingHeight +
    adviceHeight +
    signatureHeight;

  let pages: PageChunk[] = [];

  if (totalAllHeight <= PAGE_CAPACITY) {
    // Everything fits on 1 page!
    pages = [
      {
        pageIndex: 0,
        showSummary: true,
        medicines: allMedicines.map((m, i) => ({ ...m, globalIndex: i + 1 })),
        labs: allLabs.map((l, i) => ({ ...l, globalIndex: i + 1 })),
        showBilling: true,
        showAdvice: true,
        showSignature: true,
      },
    ];
  } else {
    // Multi-page greedy builder
    let currentMedIdx = 0;
    let currentLabIdx = 0;

    // --- PAGE 1 ---
    let page1Avail = PAGE_CAPACITY - titleHeight - summaryHeight;
    const page1Meds: Array<any & { globalIndex: number }> = [];
    const page1Labs: Array<any & { globalIndex: number }> = [];
    let page1Billing = false;
    let page1Advice = false;
    let page1Signature = false;

    // 1. Fill medicines on Page 1
    if (allMedicines.length > 0 && page1Avail >= medsHeaderHeight + medRowHeight) {
      page1Avail -= medsHeaderHeight;
      while (currentMedIdx < allMedicines.length && page1Avail >= medRowHeight) {
        page1Avail -= medRowHeight;
        page1Meds.push({ ...allMedicines[currentMedIdx], globalIndex: currentMedIdx + 1 });
        currentMedIdx++;
      }
    }

    // 2. If all medicines fit on Page 1, fill labs on Page 1
    if (
      currentMedIdx >= allMedicines.length &&
      allLabs.length > 0 &&
      page1Avail >= labsHeaderHeight + labRowHeight
    ) {
      page1Avail -= labsHeaderHeight;
      while (currentLabIdx < allLabs.length && page1Avail >= labRowHeight) {
        page1Avail -= labRowHeight;
        page1Labs.push({ ...allLabs[currentLabIdx], globalIndex: currentLabIdx + 1 });
        currentLabIdx++;
      }
    }

    // 3. If all labs also fit on Page 1, check billing, advice & signature
    if (currentMedIdx >= allMedicines.length && currentLabIdx >= allLabs.length) {
      if (page1Avail >= billingHeight) {
        page1Avail -= billingHeight;
        page1Billing = true;
      }
      if (page1Avail >= adviceHeight) {
        page1Avail -= adviceHeight;
        page1Advice = true;
      }
      if (page1Avail >= signatureHeight) {
        page1Avail -= signatureHeight;
        page1Signature = true;
      }
    }

    pages.push({
      pageIndex: 0,
      showSummary: true,
      medicines: page1Meds,
      labs: page1Labs,
      showBilling: page1Billing,
      showAdvice: page1Advice,
      showSignature: page1Signature,
    });

    // --- SUBSEQUENT PAGES ---
    while (
      currentMedIdx < allMedicines.length ||
      currentLabIdx < allLabs.length ||
      !pages[pages.length - 1].showSignature
    ) {
      let pageAvail = PAGE_CAPACITY - titleHeight;
      const pageMeds: Array<any & { globalIndex: number }> = [];
      const pageLabs: Array<any & { globalIndex: number }> = [];
      let pageBilling = false;
      let pageAdvice = false;
      let pageSignature = false;

      const needBilling = !pages.some((p) => p.showBilling);
      const needAdvice = !pages.some((p) => p.showAdvice);

      const remMedsCount = allMedicines.length - currentMedIdx;
      const remLabsCount = allLabs.length - currentLabIdx;
      const remMedsH = remMedsCount > 0 ? medsHeaderHeight + remMedsCount * medRowHeight : 0;
      const remLabsH = remLabsCount > 0 ? labsHeaderHeight + remLabsCount * labRowHeight : 0;
      const remBillingH = needBilling ? billingHeight : 0;
      const remAdviceH = needAdvice ? adviceHeight : 0;

      if (remMedsH + remLabsH + remBillingH + remAdviceH + signatureHeight <= pageAvail) {
        while (currentMedIdx < allMedicines.length) {
          pageMeds.push({ ...allMedicines[currentMedIdx], globalIndex: currentMedIdx + 1 });
          currentMedIdx++;
        }
        while (currentLabIdx < allLabs.length) {
          pageLabs.push({ ...allLabs[currentLabIdx], globalIndex: currentLabIdx + 1 });
          currentLabIdx++;
        }
        pages.push({
          pageIndex: pages.length,
          showSummary: false,
          medicines: pageMeds,
          labs: pageLabs,
          showBilling: needBilling,
          showAdvice: needAdvice,
          showSignature: true,
        });
      } else {
        // Fill remaining medicines
        if (currentMedIdx < allMedicines.length && pageAvail >= medsHeaderHeight + medRowHeight) {
          pageAvail -= medsHeaderHeight;
          while (currentMedIdx < allMedicines.length && pageAvail >= medRowHeight) {
            pageAvail -= medRowHeight;
            pageMeds.push({ ...allMedicines[currentMedIdx], globalIndex: currentMedIdx + 1 });
            currentMedIdx++;
          }
        }
        // Fill remaining labs
        if (currentLabIdx < allLabs.length && pageAvail >= labsHeaderHeight + labRowHeight) {
          pageAvail -= labsHeaderHeight;
          while (currentLabIdx < allLabs.length && pageAvail >= labRowHeight) {
            pageAvail -= labRowHeight;
            pageLabs.push({ ...allLabs[currentLabIdx], globalIndex: currentLabIdx + 1 });
            currentLabIdx++;
          }
        }

        if (currentMedIdx >= allMedicines.length && currentLabIdx >= allLabs.length) {
          if (needBilling && pageAvail >= billingHeight) {
            pageAvail -= billingHeight;
            pageBilling = true;
          }
          if (needAdvice && pageAvail >= adviceHeight) {
            pageAvail -= adviceHeight;
            pageAdvice = true;
          }
          if (pageAvail >= signatureHeight) {
            pageAvail -= signatureHeight;
            pageSignature = true;
          }
        }

        pages.push({
          pageIndex: pages.length,
          showSummary: false,
          medicines: pageMeds,
          labs: pageLabs,
          showBilling: pageBilling,
          showAdvice: pageAdvice,
          showSignature: pageSignature,
        });
      }
    }
  }

  const printDocument = (
    <div className="print-discharge-summary-document hidden print:block bg-white text-slate-900 font-montserrat leading-relaxed">
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
                background: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                font-family: 'Montserrat', sans-serif !important;
              }
              body > *:not(.print-discharge-summary-document) {
                display: none !important;
              }
              header, footer, nav, aside, button, .no-print {
                display: none !important;
              }
              .print-discharge-summary-document, .print-discharge-summary-document * {
                font-family: 'Montserrat', sans-serif !important;
              }
              .print-discharge-summary-document {
                visibility: visible !important;
                display: block !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                z-index: 999999999 !important;
              }
              .a4-print-page {
                width: 210mm !important;
                height: 297mm !important;
                max-height: 297mm !important;
                page-break-after: always !important;
                break-after: page !important;
                display: flex !important;
                flex-direction: column !important;
                overflow: hidden !important;
                background: white !important;
                position: relative !important;
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
              }
              .a4-print-page:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
              }
              .break-inside-avoid {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
          `,
        }}
      />

      {pages.map((page, pageIdx) => {
        const totalPages = pages.length;
        const pageNum = pageIdx + 1;

        return (
          <div
            key={pageIdx}
            className="a4-print-page w-[210mm] h-[297mm] max-h-[297mm] mx-auto flex flex-col relative z-20 bg-white border border-slate-200 print:border-none print:w-[210mm] print:h-[297mm] print:max-h-[297mm] print:m-0 print:p-0 overflow-hidden font-montserrat"
          >
            {/* UNIFIED PRINT HEADER ON EVERY PAGE */}
            <PrintHeader />

            {/* PATIENT INFO STRIP ON EVERY PAGE */}
            <PrintPatientStrip
              name={patient?.name || ""}
              age={patient?.dateOfBirth ? `${fAgeString(patient.dateOfBirth)}` : "—"}
              sex={patient?.gender ? patient.gender.charAt(0).toUpperCase() : "—"}
              date={fDateOnly(dischargeDate)}
              opNo={patient?.mrn ? patient.mrn.replace("MRN", "P-") : ""}
            />

            {/* MAIN CONTENT CANVAS */}
            <div className="flex-1 relative flex flex-col px-8 py-3 bg-white overflow-hidden space-y-2 text-xs">
              <PrintWatermark />

              {/* Title Banner */}
              <div className="flex justify-between items-center relative z-10 border-b-2 border-synapse-light pb-1 mb-0.5">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-black text-synapse-light uppercase tracking-wider">
                    {pageIdx === 0
                      ? "In-Patient Discharge Summary"
                      : "In-Patient Discharge Summary (Continued)"}
                  </h2>
                  {totalPages > 1 && (
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Page {pageNum} of {totalPages}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-800">
                    Admission No:{" "}
                    <strong className="text-black font-extrabold">
                      {ip.admissionNumber || "—"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* FIRST PAGE: ADMISSION DETAILS & CLINICAL SUMMARY */}
              {page.showSummary && (
                <>
                  {/* Clean Admission Details Grid */}
                  <div className="relative z-10 grid grid-cols-4 gap-x-4 gap-y-1.5 py-1.5 border-b border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Assigned Doctor
                      </span>
                      <span className="font-bold text-slate-900 text-[12px]">
                        {doctorName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Ward & Room
                      </span>
                      <span className="font-bold text-slate-900 text-[12px]">
                        {ip.ward || "—"} / {ip.room || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Bed Number
                      </span>
                      <span className="font-bold text-slate-900 text-[12px]">
                        {ip.bed || ip.bedNumber || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Length of Stay
                      </span>
                      <span className="font-bold text-emerald-800 text-[12px]">
                        {stayDays} {stayDays === 1 ? "Day" : "Days"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Admission Date
                      </span>
                      <span className="font-semibold text-slate-800 text-[11.5px]">
                        {admissionDate ? fDateandTime(admissionDate) : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Discharge Date
                      </span>
                      <span className="font-semibold text-slate-800 text-[11.5px]">
                        {fDateandTime(dischargeDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Admission Status
                      </span>
                      <span className="font-bold text-slate-900 text-[11.5px]">
                        {ip.status || "Discharged"}
                      </span>
                    </div>
                    {ip.notes && (
                      <div className="col-span-4 pt-0.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Admission Notes
                        </span>
                        <span className="font-medium text-slate-800 text-[11.5px]">
                          {ip.notes}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Clean Diagnosis & Medical History */}
                  <div className="relative z-10 py-1.5 border-b border-slate-200 text-xs space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <span className="font-black text-synapse-light uppercase tracking-wider text-[11px] block">
                          Primary Diagnosis:
                        </span>
                        <span className="font-bold text-slate-900 text-[12px]">
                          {ip.diagnosis || "Under Observation & Medical Management"}
                        </span>
                      </div>
                      {patient?.allergies && (
                        <div className="shrink-0">
                          <span className="text-[10.5px] font-extrabold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 inline-block">
                            Allergies: {patient.allergies}
                          </span>
                        </div>
                      )}
                    </div>
                    {patient?.conditions?.length > 0 && (
                      <p className="text-slate-800 text-[11.5px]">
                        <span className="font-bold text-slate-600 text-[10px] uppercase tracking-wide">
                          Pre-Existing Conditions:{" "}
                        </span>
                        <span className="font-medium text-slate-800">
                          {patient.conditions.join(", ")}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* In-Patient Clinical Notes / Vitals */}
                  {ipNotes.length > 0 && (
                    <div className="relative z-10 py-1 border-b border-slate-200 space-y-1">
                      <h3 className="font-black text-xs text-synapse-light uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-3.5 bg-synapse-light rounded-full inline-block"></span>
                        Clinical Progress Notes
                      </h3>
                      <div className="space-y-1 text-[11.5px]">
                        {ipNotes.slice(0, 3).map((n: any, idx: number) => (
                          <div key={idx} className="flex items-start justify-between py-0.5">
                            <div className="flex-1 pr-2">
                              <span className="font-bold text-slate-900">
                                {fDateandTime(n.createdAt ?? new Date())}:{" "}
                              </span>
                              <span className="text-slate-800">{n.note}</span>
                            </div>
                            {(n.bp || n.hr || n.temp || n.spo2) && (
                              <span className="text-[10.5px] font-semibold text-slate-600 whitespace-nowrap">
                                {[
                                  n.bp && `BP: ${n.bp}`,
                                  n.hr && `HR: ${n.hr}`,
                                  n.temp && `Temp: ${n.temp}°C`,
                                  n.spo2 && `SpO₂: ${n.spo2}%`,
                                ]
                                  .filter(Boolean)
                                  .join(" | ")}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* PRESCRIBED DISCHARGE MEDICATIONS (Rx) */}
              {page.medicines.length > 0 && (
                <div className="break-inside-avoid relative z-10 space-y-1 pt-0.5">
                  <div className="flex justify-between items-center border-b-2 border-synapse-light pb-1">
                    <h3 className="font-black text-xs text-synapse-light uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-synapse-light rounded-full inline-block"></span>
                      {page.showSummary
                        ? "Discharge & Prescribed Medications"
                        : "Discharge Medications (Continued)"}
                    </h3>
                    <span className="font-serif italic text-base font-black text-synapse-light">
                      Rx
                    </span>
                  </div>
                  <table className="w-full border-collapse text-[12px]">
                    <thead>
                      <tr className="border-b border-slate-300 text-[10.5px] font-black text-slate-800 uppercase tracking-wider text-left bg-slate-100/80">
                        <th className="py-1 px-2 text-center w-8">#</th>
                        <th className="py-1 px-2">Medicine Name</th>
                        <th className="py-1 px-2 text-center">Dosage</th>
                        <th className="py-1 px-2 text-center">Frequency</th>
                        <th className="py-1 px-2 text-center">Timing / Food</th>
                        <th className="py-1 px-2 text-center">Duration</th>
                        <th className="py-1 px-2 text-center">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {page.medicines.map((m: any) => (
                        <tr key={m.globalIndex} className="even:bg-slate-50/60">
                          <td className="py-1 px-2 text-center font-bold text-slate-600 text-[11px]">
                            {m.globalIndex}
                          </td>
                          <td className="py-1 px-2 font-black text-slate-900 text-[12px]">
                            {m.name}
                          </td>
                          <td className="py-1 px-2 text-center font-bold text-slate-800 text-[12px]">
                            {m.dosage || "—"}
                          </td>
                          <td className="py-1 px-2 text-center font-black text-synapse-light text-[12px]">
                            {m.frequency || "—"}
                          </td>
                          <td className="py-1 px-2 text-center font-semibold text-slate-700 text-[12px]">
                            {m.food || "—"}
                          </td>
                          <td className="py-1 px-2 text-center font-bold text-slate-800 text-[12px]">
                            {m.duration || "—"}
                          </td>
                          <td className="py-1 px-2 text-center font-black text-slate-900 text-[12px]">
                            {m.quantity || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* LAB INVESTIGATIONS SUMMARY */}
              {page.labs.length > 0 && (
                <div className="break-inside-avoid relative z-10 space-y-1 pt-0.5">
                  <div className="border-b-2 border-synapse-light pb-1">
                    <h3 className="font-black text-xs text-synapse-light uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-synapse-light rounded-full inline-block"></span>
                      Lab Investigations Summary
                    </h3>
                  </div>
                  <table className="w-full border-collapse text-[12px]">
                    <thead>
                      <tr className="border-b border-slate-300 text-[10.5px] font-black text-slate-800 uppercase tracking-wider text-left bg-slate-100/80">
                        <th className="py-1 px-2 text-center w-8">#</th>
                        <th className="py-1 px-2">Report / Investigation</th>
                        <th className="py-1 px-2 text-center">Date</th>
                        <th className="py-1 px-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {page.labs.map((l: any) => (
                        <tr key={l.globalIndex} className="even:bg-slate-50/60">
                          <td className="py-1 px-2 text-center font-bold text-slate-600 text-[11px]">
                            {l.globalIndex}
                          </td>
                          <td className="py-1 px-2 font-black text-slate-900 text-[12px]">
                            {l.name}
                          </td>
                          <td className="py-1 px-2 text-center font-bold text-slate-800 text-[12px]">
                            {l.date}
                          </td>
                          <td className="py-1 px-2 text-center capitalize font-black text-emerald-700 text-[12px]">
                            {l.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* FINANCIAL / BILLING SUMMARY */}
              {page.showBilling && (
                <div className="break-inside-avoid relative z-10 py-1.5 border-t border-b border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-synapse-light uppercase tracking-wider">
                      Financial Summary:
                    </span>
                    <div className="flex items-center gap-6 text-[12px]">
                      <span>
                        Total Billed:{" "}
                        <strong className="font-black text-slate-900">
                          {formatINR(totalBilled)}
                        </strong>
                      </span>
                      <span>
                        Total Paid:{" "}
                        <strong className="font-black text-emerald-800">
                          {formatINR(totalPaid)}
                        </strong>
                      </span>
                      <span>
                        Balance:{" "}
                        <strong
                          className={`font-black ${
                            totalDue > 0 ? "text-rose-700" : "text-slate-800"
                          }`}
                        >
                          {formatINR(totalDue)}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* DISCHARGE ADVICE & FOLLOW-UP */}
              {page.showAdvice && (
                <div className="break-inside-avoid relative z-10 pt-1 space-y-1 text-[12px]">
                  <p className="text-slate-900">
                    <span className="font-black text-synapse-light uppercase tracking-wider text-xs">
                      Discharge Advice:{" "}
                    </span>
                    <span className="font-semibold text-slate-800">
                      Continue prescribed medications strictly as indicated. Maintain
                      adequate hydration, rest, and hygiene. Seek immediate emergency
                      care if high fever, severe pain, or acute symptoms occur.
                    </span>
                  </p>
                  <p className="text-slate-900">
                    <span className="font-black text-synapse-light uppercase tracking-wider text-xs">
                      Follow-Up Date:{" "}
                    </span>
                    <span className="font-black text-emerald-800">
                      7 Days from Discharge (or as advised by attending physician)
                    </span>
                  </p>
                </div>
              )}

              {/* DOCTOR SIGNATURE ON FINAL PAGE */}
              {page.showSignature && (
                <div className="mt-auto pt-2 relative z-10">
                  <PrintSignature
                    doctorName={doctorName}
                    specialization={
                      ip.doctorId?.specialization ||
                      user?.specialization ||
                      "General Medicine"
                    }
                  />
                </div>
              )}
            </div>

            {/* UNIFIED PRINT FOOTER ON EVERY PAGE */}
            <PrintFooter pageNumber={pageNum} totalPages={totalPages} />
          </div>
        );
      })}
    </div>
  );

  return createPortal(printDocument, document.body);
}
