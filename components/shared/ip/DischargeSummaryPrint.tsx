"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PrintHeader, PrintFooter, PrintPatientStrip, PrintWatermark } from "@/components/print/PrintHeader";
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
      allMedicines.push({
        name: typeof it.name === "object" ? it.name?.name : it.name,
        dosage: it.dosage || "As directed",
        frequency: it.frequency || "—",
        food: it.food || "—",
        quantity: it.quantity || 1,
      });
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

  const printDocument = (
    <div className="print-discharge-summary-document hidden print:block bg-white text-slate-900 font-montserrat leading-relaxed">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
            @media print {
              @page {
                margin: 8mm 10mm;
                size: A4 portrait;
              }
              html, body {
                height: auto !important;
                min-height: 0 !important;
                max-height: none !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
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
                display: block !important;
                position: static !important;
                width: 100% !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
                background: white !important;
              }
              .break-inside-avoid {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
          `,
        }}
      />

      <div className="max-w-[21cm] mx-auto space-y-3.5 text-xs">
        {/* UNIFIED PRINT HEADER */}
        <PrintHeader />

        {/* PATIENT INFO STRIP */}
        <PrintPatientStrip
          name={patient?.name || ""}
          age={patient?.dateOfBirth ? `${fAgeString(patient.dateOfBirth)}` : "—"}
          sex={patient?.gender ? patient.gender.charAt(0).toUpperCase() : "—"}
          date={fDateOnly(dischargeDate)}
          opNo={patient?.mrn ? patient.mrn.replace("MRN", "P-") : ""}
        />

        {/* Document Type Header Banner */}
        <div className="flex justify-between items-center px-6 pt-2 pb-1 border-b border-slate-300">
          <h2 className="text-sm font-black text-synapse-light uppercase tracking-wider">
            IN-PATIENT DISCHARGE SUMMARY
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
              Admission No: {ip.admissionNumber || "—"}
            </span>
          </div>
        </div>

        {/* ELEGANT PATIENT & ADMISSION INFO CARD */}
        <div className="rounded-xl border border-slate-300 bg-slate-50/80 p-3.5 shadow-2xs break-inside-avoid">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="border-r border-slate-200 pr-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                Patient Name
              </span>
              <span className="font-bold text-slate-900 text-sm block truncate">
                {patient?.name || "—"}
              </span>
            </div>
            <div className="border-r border-slate-200 pr-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                MRN / UHID
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm block">
                {patient?.mrn || "—"}
              </span>
            </div>
            <div className="border-r border-slate-200 pr-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                Age / Gender
              </span>
              <span className="font-semibold text-slate-900 block">
                {patient?.dateOfBirth ? fAgeString(patient.dateOfBirth) : "—"} /{" "}
                {patient?.gender || "—"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                Phone Number
              </span>
              <span className="font-semibold text-slate-900 block">
                {patient?.phoneNumber || "—"}
              </span>
            </div>

            <div className="border-r border-slate-200 pr-2 pt-2 border-t">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                Admission Date
              </span>
              <span className="font-semibold text-slate-900 block">
                {admissionDate ? fDateandTime(admissionDate) : "—"}
              </span>
            </div>
            <div className="border-r border-slate-200 pr-2 pt-2 border-t">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                Discharge Date
              </span>
              <span className="font-semibold text-slate-900 block">
                {fDateandTime(dischargeDate)}
              </span>
            </div>
            <div className="border-r border-slate-200 pr-2 pt-2 border-t">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                Length of Stay
              </span>
              <span className="font-bold text-emerald-800 block">
                {stayDays} Day{stayDays === 1 ? "" : "s"}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                Ward / Room / Bed
              </span>
              <span className="font-semibold text-slate-900 block">
                {ip.ward || "TBD"} / {ip.room || "TBD"} (Bed: {ip.bedNumber || "TBD"})
              </span>
            </div>
          </div>
        </div>

        {/* DIAGNOSIS & CLINICAL CONDITION */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 shadow-2xs border-l-4 border-l-emerald-700 break-inside-avoid">
          <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] pb-1 border-b border-emerald-200/60 mb-1">
            Primary Diagnosis & Medical History
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                Diagnosis
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {ip.diagnosis || "Under Observation & Medical Management"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                Allergies
              </span>
              <span className={patient?.allergies ? "font-bold text-rose-700" : "font-semibold text-slate-700"}>
                {patient?.allergies || "None"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                Pre-existing Conditions
              </span>
              <span className="font-semibold text-slate-900">
                {patient?.conditions?.length > 0 ? patient.conditions.join(", ") : "None"}
              </span>
            </div>
          </div>
        </div>

        {/* IN-PATIENT PROGRESS & QUICK NOTES */}
        {ipNotes.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs border-l-4 border-l-indigo-600 break-inside-avoid space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100">
              In-Patient Clinical Progress & Daily Notes
            </h4>
            <div className="space-y-2">
              {ipNotes.map((n: any, idx: number) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900">
                      {fDateandTime(n.createdAt ?? new Date())}
                    </span>
                    {(n.bp || n.hr || n.temp || n.spo2) && (
                      <span className="text-[11px] font-semibold text-slate-700">
                        {n.bp ? `BP: ${n.bp}` : ""} {n.hr ? `| HR: ${n.hr}` : ""} {n.temp ? `| Temp: ${n.temp}°C` : ""} {n.spo2 ? `| SpO2: ${n.spo2}%` : ""}
                      </span>
                    )}
                  </div>
                  {n.note && <p className="text-slate-800 leading-relaxed">{n.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRESCRIBED DISCHARGE MEDICATIONS (Rx) */}
        {allMedicines.length > 0 && (
          <div className="rounded-xl border border-slate-300 overflow-hidden text-xs shadow-2xs break-inside-avoid">
            <div className="bg-slate-900 text-white font-bold px-3 py-2 flex justify-between items-center">
              <span className="uppercase tracking-wider text-[11px]">
                Discharge & Prescribed Medications
              </span>
              <span className="font-serif italic text-base">Rx</span>
            </div>
            <table className="w-full border-collapse">
              <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 border-b border-slate-300 uppercase tracking-wider">
                <tr>
                  <th className="p-2 text-center w-8">#</th>
                  <th className="p-2 text-left">Medicine Name</th>
                  <th className="p-2 text-center">Dosage</th>
                  <th className="p-2 text-center">Frequency</th>
                  <th className="p-2 text-center">Timing / Food</th>
                  <th className="p-2 text-center">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {allMedicines.map((m, idx) => (
                  <tr key={idx} className="even:bg-slate-50/50">
                    <td className="p-2 text-center text-slate-500 font-medium">{idx + 1}</td>
                    <td className="p-2 font-bold text-slate-900">{m.name}</td>
                    <td className="p-2 text-center font-medium">{m.dosage}</td>
                    <td className="p-2 text-center font-semibold text-slate-800">{m.frequency}</td>
                    <td className="p-2 text-center font-medium">{m.food}</td>
                    <td className="p-2 text-center font-bold text-slate-900">{m.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* LAB INVESTIGATIONS SUMMARY */}
        {labReports.length > 0 && (
          <div className="rounded-xl border border-slate-300 overflow-hidden text-xs shadow-2xs break-inside-avoid">
            <div className="bg-slate-900 text-white font-bold px-3 py-2 uppercase tracking-wider text-[11px]">
              Summary of Lab Investigations & Reports
            </div>
            <table className="w-full border-collapse">
              <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 border-b border-slate-300 uppercase tracking-wider">
                <tr>
                  <th className="p-2 text-center w-8">#</th>
                  <th className="p-2 text-left">Report / Test Name</th>
                  <th className="p-2 text-center">Date</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {labReports.map((l, idx) => (
                  <tr key={idx}>
                    <td className="p-2 text-center text-slate-500 font-medium">{idx + 1}</td>
                    <td className="p-2 font-bold text-slate-900">
                      Report #{l.mrn || idx + 1}
                    </td>
                    <td className="p-2 text-center font-medium">
                      {fDateOnly(l.createdAt)}
                    </td>
                    <td className="p-2 text-center capitalize font-semibold text-emerald-700">
                      {l.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FINANCIAL / BILLING SUMMARY */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs break-inside-avoid">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200 mb-1.5">
            Financial & Billing Summary
          </h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white border border-slate-200 p-2 rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Billed
              </span>
              <span className="font-bold text-slate-900 text-sm">{formatINR(totalBilled)}</span>
            </div>
            <div className="bg-white border border-slate-200 p-2 rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Paid
              </span>
              <span className="font-bold text-emerald-700 text-sm">{formatINR(totalPaid)}</span>
            </div>
            <div className="bg-white border border-slate-200 p-2 rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Balance Due
              </span>
              <span className={totalDue > 0 ? "font-bold text-rose-700 text-sm" : "font-bold text-slate-700 text-sm"}>
                {formatINR(totalDue)}
              </span>
            </div>
          </div>
        </div>

        {/* DISCHARGE ADVICE & FOLLOW-UP */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs space-y-1.5 break-inside-avoid">
          <p className="text-slate-800">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
              Discharge Advice:
            </span>{" "}
            <span className="font-medium">
              Continue prescribed medications strictly as indicated. Maintain adequate hydration, rest, and hygiene. Seek immediate emergency care if high fever, severe pain, or unexpected symptoms develop.
            </span>
          </p>
          <p className="text-slate-800">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
              Follow-Up Date:
            </span>{" "}
            <span className="font-bold text-emerald-800">
              7 Days from Discharge (or as advised by primary consultant)
            </span>
          </p>
        </div>

        {/* LUXURY SIGNATURE FOOTER */}
        <div className="pt-6 flex justify-between items-end text-xs border-t border-slate-300 break-inside-avoid">
          <div>
            <p className="text-slate-500 font-medium">
              Date & Time: {new Date().toLocaleString()}
            </p>
          </div>
          <div className="text-right space-y-1">
            <div className="border-b-2 border-slate-800 w-48 ml-auto mb-1"></div>
            <p className="font-bold text-slate-900 text-sm">{doctorName}</p>
            <p className="text-slate-500 text-[11px] font-semibold tracking-wide uppercase">
              Attending Medical Practitioner
            </p>
          </div>
        </div>

        {/* UNIFIED PRINT FOOTER */}
        <PrintFooter />
      </div>
    </div>
  );

  return createPortal(printDocument, document.body);
}
