"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import HospitalName from "@/components/print/HospitalName";
import { fDateandTime, fAgeString } from "@/lib/fDateAndTime";
import { AppointmentType, DataType } from "./interface";
import { useAuth } from "@/auth/context/auth-context";

interface PrintConsultationProps {
  appointment: AppointmentType | null;
  data: DataType & Record<string, any>;
}

function resolveDoctorName(doctor: any, fallbackSignature?: string, patientName?: string): string {
  // 1. First priority: Check appointment.doctor object if populated
  if (typeof doctor === "object" && doctor !== null && doctor.name) {
    const name = doctor.name.trim();
    return name.startsWith("Dr.") ? name : `Dr. ${name}`;
  }

  // 2. Second priority: Check appointment.doctor string if it's a real name (not a MongoDB ObjectId)
  if (typeof doctor === "string" && doctor.trim() !== "" && !/^[0-9a-fA-F]{24}$/.test(doctor)) {
    const name = doctor.trim();
    return name.startsWith("Dr.") ? name : `Dr. ${name}`;
  }

  // 3. Third priority: Check fallback signature ONLY IF it is not identical to the patient's name
  if (fallbackSignature && fallbackSignature.trim() !== "") {
    const sig = fallbackSignature.trim();
    const cleanSig = sig.replace(/^Dr\.\s*/i, "").trim().toLowerCase();
    const cleanPatient = (patientName || "").replace(/^Dr\.\s*/i, "").trim().toLowerCase();
    if (cleanSig !== cleanPatient && cleanSig !== "") {
      return sig.startsWith("Dr.") ? sig : `Dr. ${sig}`;
    }
  }

  // Default fallback doctor name
  return "Dr. John Honai";
}

export default function PrintConsultation({ appointment, data }: PrintConsultationProps) {

  const [mounted, setMounted] = useState(false);
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!appointment || !mounted) return null;

  const patient = appointment.patient;
  const isAcupuncture = data.consultationType === "acupuncture";
  const doctorName = resolveDoctorName(
    user?.name,
    data.followUpDetails?.signature,
    patient?.name
  );

  const printDocument = (
    <div className="print-consultation-document hidden print:block bg-white text-slate-900 font-sans leading-relaxed">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                margin: 6mm 10mm;
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
              }
              /* Hide all other DOM elements on body during print */
              body > *:not(.print-consultation-document) {
                display: none !important;
              }
              header, footer, nav, aside, button, .no-print {
                display: none !important;
              }
              .print-consultation-document {
                display: block !important;
                position: static !important;
                width: 100% !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
                background: white !important;
                page-break-after: avoid !important;
                break-after: avoid !important;
              }
              .break-inside-avoid {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
          `,
        }}
      />

      <div className="max-w-[21cm] mx-auto space-y-3">
        {/* LUXURY HEADER */}
        <div className="border-b-2 border-slate-900 pb-2.5 flex justify-between items-start">
          <HospitalName />
          <div className="text-right space-y-1">
            <span className="inline-block bg-slate-900 text-white text-[11px] px-3.5 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm">
              {isAcupuncture ? "Acupuncture Consultation" : "Medical Consultation"}
            </span>
            <div className="text-xs text-slate-600 font-medium">
              <p>Date: <span className="font-semibold text-slate-900">{fDateandTime(new Date()).split(",")[0]}</span></p>
            </div>
          </div>
        </div>

        {/* ELEGANT PATIENT INFO CARD */}
        <div className="rounded-xl border border-slate-300 bg-slate-50/80 p-3 shadow-2xs break-inside-avoid">
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
                OP / MRN No
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
                {patient?.dateOfBirth ? fAgeString(patient.dateOfBirth) : "—"} / {patient?.gender || "—"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                Allergies
              </span>
              <span className={patient?.allergies ? "font-bold text-rose-700" : "font-semibold text-slate-700"}>
                {patient?.allergies || "None"}
              </span>
            </div>
          </div>
        </div>

        {/* CONSULTATION SECTIONS */}
        {!isAcupuncture ? (
          /* Standard Consultation Layout */
          <div className="space-y-3 text-xs">
            {/* PRESENT HISTORY & COMPLAINTS */}
            {data.consultationNotes?.presentHistory && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs border-l-4 border-l-emerald-600 break-inside-avoid">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100 mb-1">
                  Present History & Complaints
                </h4>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {data.consultationNotes.presentHistory}
                </p>
              </div>
            )}

            {/* PAST MEDICAL HISTORY */}
            {data.consultationNotes?.pastHistory && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs border-l-4 border-l-indigo-600 break-inside-avoid">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100 mb-1">
                  Past History
                </h4>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {data.consultationNotes.pastHistory}
                </p>
              </div>
            )}

            {/* DIAGNOSIS */}
            {data.consultationNotes?.diagnosis && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 shadow-2xs border-l-4 border-l-emerald-700 break-inside-avoid">
                <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] pb-1 border-b border-emerald-200/60 mb-1">
                  Diagnosis
                </h4>
                <p className="text-slate-900 font-bold text-sm">
                  {data.consultationNotes.diagnosis}
                </p>
              </div>
            )}

            {/* THERAPY & THERAPY NOTES */}
            {(data.therapy || data.therapyNotes) && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs border-l-4 border-l-cyan-600 break-inside-avoid">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100 mb-1">
                  Therapy & Notes
                </h4>
                {data.therapy && (
                  <p className="text-slate-800 leading-relaxed font-medium">
                    <span className="font-semibold text-slate-900">Therapy:</span>{" "}
                    {Array.isArray(data.therapy)
                      ? data.therapy
                        .map((t: any) => (typeof t === "object" && t?.name ? t.name : String(t)))
                        .join(", ")
                      : data.therapy}
                  </p>
                )}
                {data.therapyNotes && (
                  <p className="text-slate-800 leading-relaxed font-medium mt-1">
                    <span className="font-semibold text-slate-900">Notes:</span> {data.therapyNotes}
                  </p>
                )}
              </div>
            )}

            {/* EXAMINATION & VITALS */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs break-inside-avoid">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1.5 border-b border-slate-100 mb-2">
                Examination & Vitals
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                {data.examinationNote?.bp && (
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">BP</span>
                    <span className="font-bold text-slate-900 text-sm">{data.examinationNote.bp}</span>
                  </div>
                )}
                {data.examinationNote?.hr && (
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Pulse / HR</span>
                    <span className="font-bold text-slate-900 text-sm">{data.examinationNote.hr}</span>
                  </div>
                )}
                {data.examinationNote?.spo2 && (
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">SpO2</span>
                    <span className="font-bold text-slate-900 text-sm">{data.examinationNote.spo2}%</span>
                  </div>
                )}
                {data.examinationNote?.temp && (
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Temp</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {data.examinationNote.temp} {data.examinationNote.tempUnit || "°C"}
                    </span>
                  </div>
                )}
              </div>
              {data.examinationNote?.otherNotes && (
                <p className="mt-2 text-slate-700 font-medium border-t border-slate-100 pt-1.5">
                  <span className="font-semibold text-slate-900">Notes:</span> {data.examinationNote.otherNotes}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Acupuncture Consultation Layout */
          <div className="space-y-3 text-xs">
            {/* CHIEF COMPLAINTS & PAIN SCORE */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs grid grid-cols-2 gap-3 border-l-4 border-l-teal-600 break-inside-avoid">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100 mb-1">
                  Chief Complaints
                </h4>
                <p className="text-slate-900 font-bold">
                  {data.chiefComplaints?.complaints?.join(", ") || "None"}
                  {data.chiefComplaints?.other ? ` (${data.chiefComplaints.other})` : ""}
                </p>
                {data.chiefComplaints?.duration && (
                  <p className="text-slate-500 text-[11px] mt-0.5 font-medium">
                    Duration: {data.chiefComplaints.duration}
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100 mb-1">
                  Pain Score & Vitals
                </h4>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-slate-600 font-medium">Pain Score:</span>
                  <span className="font-black  text-slate-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    {data.chiefComplaints?.painScore ?? "—"} / 10
                  </span>
                </div>
                <p className="text-slate-700 font-medium">
                  BP: <span className="font-bold text-slate-900">{data.acupunctureExamination?.bp || "—"}</span> | Pulse: <span className="font-bold text-slate-900">{data.acupunctureExamination?.pulse || "—"}</span>
                </p>
                {(data.acupunctureExamination?.tenderness || data.acupunctureExamination?.rom || data.acupunctureExamination?.posture) && (
                  <p className="text-slate-700 font-medium mt-1">
                    {data.acupunctureExamination.tenderness && (
                      <span className="mr-2.5"><span className="font-semibold text-slate-900">Tenderness:</span> {data.acupunctureExamination.tenderness}</span>
                    )}
                    {data.acupunctureExamination.rom && (
                      <span className="mr-2.5"><span className="font-semibold text-slate-900">ROM:</span> {data.acupunctureExamination.rom}</span>
                    )}
                    {data.acupunctureExamination.posture && (
                      <span><span className="font-semibold text-slate-900">Posture:</span> {data.acupunctureExamination.posture}</span>
                    )}
                  </p>
                )}
                {data.acupunctureExamination?.specialFindings && (
                  <p className="text-slate-700 font-medium mt-1">
                    <span className="font-semibold text-slate-900">Findings:</span> {data.acupunctureExamination.specialFindings}
                  </p>
                )}
              </div>
            </div>

            {/* PAST HISTORY / MEDICAL HISTORY DETAILS */}
            {(data.medicalHistoryDetails?.medHistory?.length > 0 || data.medicalHistoryDetails?.currentMedications || data.medicalHistoryDetails?.otherMedHistory || data.medicalHistoryDetails?.allergies) && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs border-l-4 border-l-indigo-600 break-inside-avoid">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100 mb-1">
                  Past Medical History
                </h4>
                {data.medicalHistoryDetails?.medHistory?.length > 0 && (
                  <p className="text-slate-800 font-medium">
                    <span className="font-semibold text-slate-900">Conditions:</span> {data.medicalHistoryDetails.medHistory.join(", ")}
                    {data.medicalHistoryDetails.otherMedHistory ? ` (${data.medicalHistoryDetails.otherMedHistory})` : ""}
                  </p>
                )}
                {data.medicalHistoryDetails?.currentMedications && (
                  <p className="text-slate-800 font-medium mt-1">
                    <span className="font-semibold text-slate-900">Current Medications:</span> {data.medicalHistoryDetails.currentMedications}
                  </p>
                )}
                {data.medicalHistoryDetails?.allergies && (
                  <p className="text-slate-800 font-medium mt-1">
                    <span className="font-semibold text-slate-900">Allergies:</span> {data.medicalHistoryDetails.allergies}
                  </p>
                )}
              </div>
            )}

            {/* LIFESTYLE & HABITS */}
            {data.lifestyle && Object.values(data.lifestyle).some(Boolean) && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs border-l-4 border-l-sky-600 break-inside-avoid">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100 mb-1.5">
                  Lifestyle & Habits
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-800 font-medium">
                  {data.lifestyle.sleep && (
                    <p><span className="font-semibold text-slate-900">Sleep:</span> {data.lifestyle.sleep}</p>
                  )}
                  {data.lifestyle.bowel && (
                    <p><span className="font-semibold text-slate-900">Bowel:</span> {data.lifestyle.bowel}</p>
                  )}
                  {data.lifestyle.appetite && (
                    <p><span className="font-semibold text-slate-900">Appetite:</span> {data.lifestyle.appetite}</p>
                  )}
                  {data.lifestyle.stress && (
                    <p><span className="font-semibold text-slate-900">Stress:</span> {data.lifestyle.stress}</p>
                  )}
                  {data.lifestyle.exercise && (
                    <p><span className="font-semibold text-slate-900">Exercise:</span> {data.lifestyle.exercise}</p>
                  )}
                  {data.lifestyle.smoking && (
                    <p><span className="font-semibold text-slate-900">Smoking:</span> {data.lifestyle.smoking}</p>
                  )}
                  {data.lifestyle.alcohol && (
                    <p><span className="font-semibold text-slate-900">Alcohol:</span> {data.lifestyle.alcohol}</p>
                  )}
                  {data.lifestyle.micturition && (
                    <p><span className="font-semibold text-slate-900">Micturition:</span> {data.lifestyle.micturition}</p>
                  )}
                </div>
              </div>
            )}

            {/* ACUPUNCTURE ASSESSMENT & TREATMENT GIVEN */}
            <div className="rounded-xl border border-slate-200 bg-emerald-50/30 p-3 shadow-2xs grid grid-cols-2 gap-3 border-l-4 border-l-emerald-700 break-inside-avoid">
              <div>
                <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] pb-1 border-b border-emerald-200/60 mb-1">
                  Acupuncture Assessment
                </h4>
                <p className="text-slate-800 font-medium">
                  <span className="font-bold text-slate-900">Diagnosis:</span> {data.acupunctureAssessment?.clinicalDiagnosis || "—"}
                </p>
                <p className="text-slate-800 font-medium mt-1">
                  <span className="font-bold text-slate-900">Principle:</span> {data.acupunctureAssessment?.treatmentPrinciple || "—"}
                </p>
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] pb-1 border-b border-emerald-200/60 mb-1">
                  Treatment Given
                </h4>
                <p className="text-slate-800 font-medium">
                  <span className="font-bold text-slate-900">Therapies:</span> {data.treatmentGiven?.treatments?.join(", ") || "—"}
                </p>
                <p className="text-slate-800 font-medium mt-1">
                  <span className="font-bold text-slate-900">Acu Points:</span> {data.treatmentGiven?.acuPoints || "—"}
                </p>
                <p className="text-slate-800 font-medium mt-1">
                  <span className="font-bold text-slate-900">Retention Time:</span> {data.treatmentGiven?.retentionTime || "—"} mins
                </p>
              </div>
            </div>

            {/* TREATMENT PLAN & HOME CARE */}
            {data.treatmentPlan && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs grid grid-cols-2 gap-3 break-inside-avoid">
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100 mb-1">
                    Treatment Plan
                  </h4>
                  <p className="text-slate-800 font-medium">
                    Sessions: <span className="font-bold text-slate-900">{data.treatmentPlan.sessions || "—"}</span> | Frequency: <span className="font-bold text-slate-900">{data.treatmentPlan.frequency || "—"}</span>
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100 mb-1">
                    Home Care Advice
                  </h4>
                  <p className="text-slate-800 font-medium">{data.treatmentPlan.homeCare?.join(", ") || "—"}</p>
                </div>
              </div>
            )}
            {/* THERAPY & THERAPY NOTES */}
            {(data.therapy || data.therapyNotes) && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs border-l-4 border-l-cyan-600 break-inside-avoid">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100 mb-1">
                  Therapy & Notes
                </h4>
                {data.therapy && (
                  <p className="text-slate-800 leading-relaxed font-medium">
                    <span className="font-semibold text-slate-900">Therapy:</span> {data.therapy}
                  </p>
                )}
                {data.therapyNotes && (
                  <p className="text-slate-800 leading-relaxed font-medium mt-1">
                    <span className="font-semibold text-slate-900">Notes:</span> {data.therapyNotes}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* PRESCRIBED MEDICINES TABLE (Rx) */}
        {data.medicines && data.medicines.filter((m) => m.name || m.referralName).length > 0 && (
          <div className="rounded-xl border border-slate-300 overflow-hidden text-xs shadow-2xs break-inside-avoid">
            <div className="bg-slate-900 text-white font-bold px-3 py-2 flex justify-between items-center">
              <span className="uppercase tracking-wider text-[11px]">Prescribed Medicines</span>
              <span className="font-serif italic text-base">Rx</span>
            </div>
            <table className="w-full border-collapse">
              <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 border-b border-slate-300 uppercase tracking-wider">
                <tr>
                  <th className="p-2 text-center w-8">#</th>
                  <th className="p-2 text-left">Medicine / Strength</th>
                  <th className="p-2 text-center">Dosage</th>
                  <th className="p-2 text-center">Frequency</th>
                  <th className="p-2 text-center">Timing / Food</th>
                  <th className="p-2 text-center">Duration</th>
                  <th className="p-2 text-center">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {data.medicines
                  .filter((m) => m.name || m.referralName)
                  .map((m, idx) => (
                    <tr key={idx} className="even:bg-slate-50/50">
                      <td className="p-2 text-center text-slate-500 font-medium">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-900">
                        {m.referralName || (typeof m.name === "object" ? (m.name as any)?.name : m.name)}
                        {m.isCustom && (
                          <span className="ml-2 text-[10px] font-medium text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                            Outside
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center font-medium">{m.dosage || "—"}</td>
                      <td className="p-2 text-center font-semibold text-slate-800">{m.frequency || "—"}</td>
                      <td className="p-2 text-center font-medium">{m.food || "—"}</td>
                      <td className="p-2 text-center font-medium">{m.duration || "—"}</td>
                      <td className="p-2 text-center font-bold text-slate-900">{m.quantity || "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* INVESTIGATION / LAB TESTS TABLE */}
        {data.test && data.test.length > 0 && (
          <div className="rounded-xl border border-slate-300 overflow-hidden text-xs shadow-2xs break-inside-avoid">
            <div className="bg-slate-900 text-white font-bold px-3 py-2 uppercase tracking-wider text-[11px]">
              Ordered Investigations & Tests
            </div>
            <table className="w-full border-collapse">
              <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 border-b border-slate-300 uppercase tracking-wider">
                <tr>
                  <th className="p-2 text-center w-8">#</th>
                  <th className="p-2 text-left">Test Name</th>
                  <th className="p-2 text-center">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {data.test.map((t, idx) => (
                  <tr key={idx}>
                    <td className="p-2 text-center text-slate-500 font-medium">{idx + 1}</td>
                    <td className="p-2 font-bold text-slate-900">
                      {Array.isArray(t.name) ? t.name.join(", ") : t.name}
                    </td>
                    <td className="p-2 text-center capitalize font-semibold">{t.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ADVICE & FOLLOW-UP CARD */}
        {(data.advice || data.followUp || data.followUpDetails?.nextAppt || data.followUpDetails?.additionalNotes || data.followUpDetails?.feedback) && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs space-y-1 break-inside-avoid">
            {data.advice && (
              <p className="text-slate-800">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Advice:</span>{" "}
                <span className="font-medium">{data.advice}</span>
              </p>
            )}
            {(data.followUp || data.followUpDetails?.nextAppt) && (
              <p className="text-slate-800">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Follow-Up Date:</span>{" "}
                <span className="font-bold text-emerald-800">
                  {data.followUp
                    ? fDateandTime(data.followUp).split(",")[0]
                    : data.followUpDetails?.nextAppt
                      ? fDateandTime(data.followUpDetails.nextAppt).split(",")[0]
                      : "—"}
                </span>
              </p>
            )}
            {data.followUpDetails?.feedback && (
              <p className="text-slate-800">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Patient Feedback:</span>{" "}
                <span className="font-medium">{data.followUpDetails.feedback}</span>
              </p>
            )}
            {data.followUpDetails?.additionalNotes && (
              <p className="text-slate-800">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Additional Notes:</span>{" "}
                <span className="font-medium">{data.followUpDetails.additionalNotes}</span>
              </p>
            )}
          </div>
        )}

        {/* LUXURY SIGNATURE FOOTER */}
        <div className="pt-4 flex justify-between items-end text-xs border-t border-slate-200 break-inside-avoid">
          <div>
            <p className="text-slate-500 font-medium">Date: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right space-y-1">
            <div className="border-b-2 border-slate-800 w-48 ml-auto mb-1"></div>
            <p className="font-bold text-slate-900 text-sm">
              {doctorName}
            </p>
            <p className="text-slate-500 text-[11px] font-semibold tracking-wide uppercase">
              Authorized Medical Practitioner
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(printDocument, document.body);
}
