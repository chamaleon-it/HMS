"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import HospitalName from "@/components/print/HospitalName";
import { fDateandTime, fAgeString } from "@/lib/fDateAndTime";
import { AppointmentType, DataType } from "./interface";
import { useAuth } from "@/auth/context/auth-context";
import useGetTest from "@/data/useGetTest";
import useGetPanels from "@/data/useGetPanels";
import useGetTherapy from "@/data/useGetTherapy";
import { getFormattedInvestigationNames, getFormattedTherapyNames } from "@/lib/investigationUtils";

import {
  PrescriptionHeader,
  PrescriptionPatientStrip,
  PrescriptionWatermark,
  PrescriptionSignature,
  PrescriptionFooter,
} from "@/components/print/PrescriptionHeader";

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
  const { tests } = useGetTest();
  const { panels } = useGetPanels();
  const { therapies } = useGetTherapy();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

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

  const rawDate = appointment?.date || appointment?.createdAt || new Date();
  const dObj = new Date(rawDate);
  const formattedDate = !isNaN(dObj.getTime())
    ? `${dObj.getDate().toString().padStart(2, "0")}/${(dObj.getMonth() + 1).toString().padStart(2, "0")}/${dObj.getFullYear()}`
    : "__________";

  let ageStr = "____";
  if (patient?.dateOfBirth) {
    const dob = new Date(patient.dateOfBirth);
    const ageYears = new Date().getFullYear() - dob.getFullYear();
    ageStr = `${ageYears} Y`;
  }
  const sexStr = patient?.gender ? patient.gender.charAt(0).toUpperCase() : "____";
  const opNumber = patient?.mrn ? patient.mrn.replace("MRN", "P-") : "";

  const printDocument = (
    <div className="print-consultation-document hidden print:block bg-white text-black font-sans leading-relaxed overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
              }
              body > *:not(.print-consultation-document) {
                display: none !important;
              }
              .print-consultation-document {
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
              .break-inside-avoid {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
          `,
        }}
      />

      <div className="w-[210mm] h-[297mm] max-h-[297mm] mx-auto flex flex-col relative z-20 bg-white border border-slate-200 print:border-none print:w-[210mm] print:h-[297mm] print:max-h-[297mm] print:m-0 print:p-0 overflow-hidden">
        {/* TOP HEADER SECTION */}
        <PrescriptionHeader />

        {/* PATIENT INFO STRIP */}
        <PrescriptionPatientStrip
          name={patient?.name || ""}
          age={ageStr}
          sex={sexStr}
          date={formattedDate}
          opNo={opNumber}
        />

        {/* FULL-WIDTH MAIN CONSULTATION CANVAS */}
        <div className="flex-1 relative flex flex-col px-8 py-5 bg-white overflow-hidden space-y-4">
          <PrescriptionWatermark />

          {/* Consultation Type Header Line */}
          <div className="flex justify-between items-center relative z-10 border-b-2 border-[#2d3e36] pb-1.5 mb-1">
            <h2 className="text-sm font-black text-[#2d3e36] uppercase tracking-wider">
              {isAcupuncture ? "Acupuncture Consultation" : "Medical Consultation"}
            </h2>
            {patient?.allergies && (
              <span className="text-[11px] font-extrabold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                Allergies: {patient.allergies}
              </span>
            )}
          </div>

          {/* CONSULTATION SECTIONS */}
          {!isAcupuncture ? (
            /* Standard Consultation Layout - Clean & Spaced */
            <div className="space-y-4 text-[13px] relative z-10">
              {/* PRESENT HISTORY & COMPLAINTS */}
              {data.consultationNotes?.presentHistory && (
                <div className="break-inside-avoid space-y-1">
                  <h3 className="font-extrabold text-[12.5px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                    Present History & Complaints
                  </h3>
                  <p className="text-slate-900 leading-relaxed font-semibold pl-4 text-[13px]">
                    {data.consultationNotes.presentHistory}
                  </p>
                </div>
              )}

              {/* PAST MEDICAL HISTORY */}
              {data.consultationNotes?.pastHistory && (
                <div className="break-inside-avoid space-y-1">
                  <h3 className="font-extrabold text-[12.5px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                    Past History
                  </h3>
                  <p className="text-slate-900 leading-relaxed font-semibold pl-4 text-[13px]">
                    {data.consultationNotes.pastHistory}
                  </p>
                </div>
              )}

              {/* DIAGNOSIS */}
              {data.consultationNotes?.diagnosis && (
                <div className="break-inside-avoid space-y-1">
                  <h3 className="font-extrabold text-[12.5px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                    Diagnosis
                  </h3>
                  <p className="text-slate-900 font-extrabold text-[13.5px] pl-4">
                    {data.consultationNotes.diagnosis}
                  </p>
                </div>
              )}

              {/* THERAPY & THERAPY NOTES */}
              {(data.therapy || data.therapyNotes) && (
                <div className="break-inside-avoid space-y-1">
                  <h3 className="font-extrabold text-[12.5px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                    Therapy & Notes
                  </h3>
                  <div className="pl-4 space-y-1 text-slate-900 font-semibold text-[13px]">
                    {Boolean(getFormattedTherapyNames(data.therapy, therapies)) && (
                      <p>
                        <span className="font-bold text-slate-700">Therapy:</span>{" "}
                        {getFormattedTherapyNames(data.therapy, therapies)}
                      </p>
                    )}
                    {data.therapyNotes && (
                      <p>
                        <span className="font-bold text-slate-700">Notes:</span> {data.therapyNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* EXAMINATION & VITALS */}
              {(data.examinationNote?.bp || data.examinationNote?.hr || data.examinationNote?.spo2 || data.examinationNote?.temp || data.examinationNote?.otherNotes) && (
                <div className="break-inside-avoid space-y-1">
                  <h3 className="font-extrabold text-[12.5px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                    Examination & Vitals
                  </h3>
                  <div className="pl-4 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-1.5 text-xs md:text-[12.5px] text-slate-900 bg-slate-50/90 px-4 py-2 rounded-lg border border-slate-300">
                      {data.examinationNote?.bp && (
                        <span><span className="text-slate-600 uppercase text-[11px] font-bold mr-1.5">BP:</span><span className="font-black text-black">{data.examinationNote.bp}</span></span>
                      )}
                      {data.examinationNote?.hr && (
                        <span><span className="text-slate-600 uppercase text-[11px] font-bold mr-1.5">Pulse / HR:</span><span className="font-black text-black">{data.examinationNote.hr}</span></span>
                      )}
                      {data.examinationNote?.spo2 && (
                        <span><span className="text-slate-600 uppercase text-[11px] font-bold mr-1.5">SpO2:</span><span className="font-black text-black">{data.examinationNote.spo2}%</span></span>
                      )}
                      {data.examinationNote?.temp && (
                        <span><span className="text-slate-600 uppercase text-[11px] font-bold mr-1.5">Temp:</span><span className="font-black text-black">{data.examinationNote.temp} {data.examinationNote.tempUnit || "°C"}</span></span>
                      )}
                    </div>
                    {data.examinationNote?.otherNotes && (
                      <p className="text-slate-800 font-semibold text-[13px]">
                        <span className="font-bold text-slate-700">Notes:</span> {data.examinationNote.otherNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Acupuncture Consultation Layout - Clean & Spaced */
            <div className="space-y-4 text-[13px] relative z-10">
              {/* CHIEF COMPLAINTS & PAIN SCORE */}
              <div className="break-inside-avoid grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-extrabold text-[12.5px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                    Chief Complaints
                  </h3>
                  <p className="text-slate-900 font-extrabold pl-4 text-[13px] leading-snug">
                    {data.chiefComplaints?.complaints?.join(", ") || "None"}
                    {data.chiefComplaints?.other ? ` (${data.chiefComplaints.other})` : ""}
                  </p>
                  {data.chiefComplaints?.duration && (
                    <p className="text-slate-600 text-[12px] pl-4 mt-1 font-semibold">
                      Duration: {data.chiefComplaints.duration}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-[12.5px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                    Pain Score & Vitals
                  </h3>
                  <div className="pl-4 space-y-1 text-slate-900 font-semibold text-[13px]">
                    <p>
                      <span className="text-slate-700">Pain Score:</span>{" "}
                      <span className="font-black text-black">{data.chiefComplaints?.painScore ?? "—"} / 10</span>
                    </p>
                    <p>
                      BP: <span className="font-black text-black">{data.acupunctureExamination?.bp || "—"}</span> | Pulse: <span className="font-black text-black">{data.acupunctureExamination?.pulse || "—"}</span>
                    </p>
                    {(data.acupunctureExamination?.tenderness || data.acupunctureExamination?.rom || data.acupunctureExamination?.posture) && (
                      <p className="text-slate-800">
                        {data.acupunctureExamination.tenderness && <span className="mr-3"><span className="font-bold text-slate-800">Tenderness:</span> {data.acupunctureExamination.tenderness}</span>}
                        {data.acupunctureExamination.rom && <span className="mr-3"><span className="font-bold text-slate-800">ROM:</span> {data.acupunctureExamination.rom}</span>}
                        {data.acupunctureExamination.posture && <span><span className="font-bold text-slate-800">Posture:</span> {data.acupunctureExamination.posture}</span>}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* PAST HISTORY / MEDICAL HISTORY DETAILS */}
              {(data.medicalHistoryDetails?.medHistory?.length > 0 || data.medicalHistoryDetails?.currentMedications || data.medicalHistoryDetails?.otherMedHistory || data.medicalHistoryDetails?.allergies) && (
                <div className="break-inside-avoid space-y-1">
                  <h3 className="font-extrabold text-[12.5px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                    Past Medical History
                  </h3>
                  <div className="pl-4 space-y-1 text-slate-900 font-semibold text-[13px]">
                    {data.medicalHistoryDetails?.medHistory?.length > 0 && (
                      <p>
                        <span className="font-bold text-slate-700">Conditions:</span> {data.medicalHistoryDetails.medHistory.join(", ")}
                        {data.medicalHistoryDetails.otherMedHistory ? ` (${data.medicalHistoryDetails.otherMedHistory})` : ""}
                      </p>
                    )}
                    {data.medicalHistoryDetails?.currentMedications && (
                      <p><span className="font-bold text-slate-700">Current Medications:</span> {data.medicalHistoryDetails.currentMedications}</p>
                    )}
                  </div>
                </div>
              )}

              {/* LIFESTYLE & HABITS */}
              {data.lifestyle && Object.values(data.lifestyle).some(Boolean) && (
                <div className="break-inside-avoid space-y-1">
                  <h3 className="font-extrabold text-[12.5px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                    Lifestyle & Habits
                  </h3>
                  <div className="pl-4 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5 text-slate-900 font-semibold text-[13px]">
                    {data.lifestyle.sleep && <p><span className="font-bold text-slate-700">Sleep:</span> {data.lifestyle.sleep}</p>}
                    {data.lifestyle.bowel && <p><span className="font-bold text-slate-700">Bowel:</span> {data.lifestyle.bowel}</p>}
                    {data.lifestyle.appetite && <p><span className="font-bold text-slate-700">Appetite:</span> {data.lifestyle.appetite}</p>}
                    {data.lifestyle.stress && <p><span className="font-bold text-slate-700">Stress:</span> {data.lifestyle.stress}</p>}
                    {data.lifestyle.exercise && <p><span className="font-bold text-slate-700">Exercise:</span> {data.lifestyle.exercise}</p>}
                    {data.lifestyle.smoking && <p><span className="font-bold text-slate-700">Smoking:</span> {data.lifestyle.smoking}</p>}
                    {data.lifestyle.alcohol && <p><span className="font-bold text-slate-700">Alcohol:</span> {data.lifestyle.alcohol}</p>}
                    {data.lifestyle.micturition && <p><span className="font-bold text-slate-700">Micturition:</span> {data.lifestyle.micturition}</p>}
                  </div>
                </div>
              )}

              {/* ACUPUNCTURE ASSESSMENT & TREATMENT GIVEN */}
              <div className="break-inside-avoid grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-extrabold text-[12.5px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                    Acupuncture Assessment
                  </h3>
                  <div className="pl-4 space-y-1 text-slate-900 font-semibold text-[13px]">
                    <p><span className="font-extrabold text-slate-900">Diagnosis:</span> {data.acupunctureAssessment?.clinicalDiagnosis || "—"}</p>
                    <p><span className="font-extrabold text-slate-900">Principle:</span> {data.acupunctureAssessment?.treatmentPrinciple || "—"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-[12.5px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                    Treatment Given
                  </h3>
                  <div className="pl-4 space-y-1 text-slate-900 font-semibold text-[13px]">
                    <p><span className="font-extrabold text-slate-900">Therapies:</span> {data.treatmentGiven?.treatments?.join(", ") || "—"}</p>
                    <p><span className="font-extrabold text-slate-900">Acu Points:</span> {data.treatmentGiven?.acuPoints || "—"}</p>
                    <p><span className="font-extrabold text-slate-900">Retention Time:</span> {data.treatmentGiven?.retentionTime || "—"} mins</p>
                  </div>
                </div>
              </div>

              {/* TREATMENT PLAN */}
              {data.treatmentPlan && (
                <div className="break-inside-avoid space-y-1">
                  <h3 className="font-extrabold text-[12.5px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                    Treatment Plan & Home Care
                  </h3>
                  <div className="pl-4 space-y-1 text-slate-900 font-semibold text-[13px]">
                    <p>Sessions: <span className="font-black text-black">{data.treatmentPlan.sessions || "—"}</span> | Frequency: <span className="font-black text-black">{data.treatmentPlan.frequency || "—"}</span></p>
                    <p><span className="font-bold text-slate-700">Home Care Advice:</span> {data.treatmentPlan.homeCare?.join(", ") || "—"}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PRESCRIBED MEDICINES TABLE (Rx) */}
          {data.medicines && data.medicines.filter((m) => m.name || m.referralName).length > 0 && (
            <div className="break-inside-avoid relative z-10 space-y-1.5 pt-1">
              <div className="flex justify-between items-center border-b-2 border-[#2d3e36] pb-1">
                <h3 className="font-black text-xs text-[#2d3e36] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                  Prescribed Medicines
                </h3>
                <span className="font-serif italic text-base font-black text-[#2d3e36]">Rx</span>
              </div>
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-slate-300 text-[11px] font-black text-slate-800 uppercase tracking-wider text-left bg-slate-100/80">
                    <th className="py-1.5 px-2.5 text-center w-8">#</th>
                    <th className="py-1.5 px-2.5">Medicine / Strength</th>
                    <th className="py-1.5 px-2.5 text-center">Dosage</th>
                    <th className="py-1.5 px-2.5 text-center">Frequency</th>
                    <th className="py-1.5 px-2.5 text-center">Timing / Food</th>
                    <th className="py-1.5 px-2.5 text-center">Duration</th>
                    <th className="py-1.5 px-2.5 text-center">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.medicines
                    .filter((m) => m.name || m.referralName)
                    .map((m, idx) => (
                      <tr key={idx} className="even:bg-slate-50/60">
                        <td className="py-1.5 px-2.5 text-center font-bold text-slate-600 text-[11px]">{idx + 1}</td>
                        <td className="py-1.5 px-2.5 font-black text-slate-900 text-[12.5px]">
                          {m.referralName || (typeof m.name === "object" ? (m.name as any)?.name : m.name)}
                          {m.isCustom && (
                            <span className="ml-1.5 text-[9.5px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1 py-0.2 rounded">
                              Outside
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2.5 text-center font-bold text-slate-800 text-[12.5px]">{m.dosage || "—"}</td>
                        <td className="py-1.5 px-2.5 text-center font-black text-[#2d3e36] text-[12.5px]">{m.frequency || "—"}</td>
                        <td className="py-1.5 px-2.5 text-center font-semibold text-slate-700 text-[12.5px]">{m.food || "—"}</td>
                        <td className="py-1.5 px-2.5 text-center font-bold text-slate-800 text-[12.5px]">{m.duration || "—"}</td>
                        <td className="py-1.5 px-2.5 text-center font-black text-slate-900 text-[12.5px]">{m.quantity || "—"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* INVESTIGATION / LAB TESTS TABLE */}
          {data.test && data.test.length > 0 && (
            <div className="break-inside-avoid relative z-10 space-y-1.5 pt-1">
              <div className="border-b-2 border-[#2d3e36] pb-1">
                <h3 className="font-black text-xs text-[#2d3e36] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                  Ordered Investigations & Tests
                </h3>
              </div>
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-slate-300 text-[11px] font-black text-slate-800 uppercase tracking-wider text-left bg-slate-100/80">
                    <th className="py-1.5 px-2.5 text-center w-8">#</th>
                    <th className="py-1.5 px-2.5">Test Name</th>
                    <th className="py-1.5 px-2.5 text-center">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.test.map((t, idx) => {
                    const names = getFormattedInvestigationNames(t, tests, panels);
                    return (
                      <tr key={idx} className="even:bg-slate-50/60">
                        <td className="py-1.5 px-2.5 text-center font-bold text-slate-600 text-[11px]">{idx + 1}</td>
                        <td className="py-1.5 px-2.5 font-black text-slate-900 text-[12.5px]">
                          {names.join(", ") || "—"}
                        </td>
                        <td className="py-1.5 px-2.5 text-center capitalize font-bold text-slate-800 text-[12.5px]">{t.priority}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ADVICE & FOLLOW-UP CARD */}
          {(data.advice || data.followUp || data.followUpDetails?.nextAppt || data.followUpDetails?.additionalNotes || data.followUpDetails?.feedback) && (
            <div className="break-inside-avoid relative z-10 pt-2 space-y-1.5 border-t border-slate-200 text-[13px]">
              {data.advice && (
                <p className="text-slate-900">
                  <span className="font-black text-[#2d3e36] uppercase tracking-wider text-xs">Advice:</span>{" "}
                  <span className="font-semibold text-slate-800">{data.advice}</span>
                </p>
              )}
              {(data.followUp || data.followUpDetails?.nextAppt) && (
                <p className="text-slate-900">
                  <span className="font-black text-[#2d3e36] uppercase tracking-wider text-xs">Follow-Up Date:</span>{" "}
                  <span className="font-black text-emerald-800">
                    {data.followUp
                      ? `${new Date(data.followUp).getDate().toString().padStart(2, "0")}/${(new Date(data.followUp).getMonth() + 1).toString().padStart(2, "0")}/${new Date(data.followUp).getFullYear()}`
                      : data.followUpDetails?.nextAppt
                        ? `${new Date(data.followUpDetails.nextAppt).getDate().toString().padStart(2, "0")}/${(new Date(data.followUpDetails.nextAppt).getMonth() + 1).toString().padStart(2, "0")}/${new Date(data.followUpDetails.nextAppt).getFullYear()}`
                        : "—"}
                  </span>
                </p>
              )}
              {data.followUpDetails?.feedback && (
                <p className="text-slate-900">
                  <span className="font-black text-[#2d3e36] uppercase tracking-wider text-xs">Patient Feedback:</span>{" "}
                  <span className="font-semibold text-slate-800">{data.followUpDetails.feedback}</span>
                </p>
              )}
              {data.followUpDetails?.additionalNotes && (
                <p className="text-slate-900">
                  <span className="font-black text-[#2d3e36] uppercase tracking-wider text-xs">Additional Notes:</span>{" "}
                  <span className="font-semibold text-slate-800">{data.followUpDetails.additionalNotes}</span>
                </p>
              )}
            </div>
          )}

          {/* DOCTOR SIGNATURE AT BOTTOM RIGHT */}
          <div className="mt-auto pt-6">
            <PrescriptionSignature
              doctorName={doctorName}
              specialization={user?.specialization || (appointment?.doctor as any)?.specialization || "Authorized Medical Practitioner"}
              signature={data.followUpDetails?.signature || (appointment?.doctor as any)?.signature}
            />
          </div>
        </div>

        {/* BOTTOM FOOTER SECTION */}
        <PrescriptionFooter />
      </div>
    </div>
  );

  return createPortal(printDocument, document.body);
}
