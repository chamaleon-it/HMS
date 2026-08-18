"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AppointmentType, DataType } from "./interface";
import { useAuth } from "@/auth/context/auth-context";
import useGetTest from "@/data/useGetTest";
import useGetPanels from "@/data/useGetPanels";
import useGetTherapy from "@/data/useGetTherapy";
import useGetProcedure from "@/data/useGetProcedure";
import { getFormattedInvestigationNames, getFormattedTherapyNames, getFormattedProcedureNames } from "@/lib/investigationUtils";

import {
  PrintHeader,
  PrintPatientStrip,
  PrintWatermark,
  PrintSignature,
  PrintFooter,
} from "@/components/print/PrintHeader";

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

interface PageChunk {
  pageIndex: number;
  showNotes: boolean;
  medicines: Array<any & { globalIndex: number }>;
  tests: Array<any & { globalIndex: number }>;
  showAdvice: boolean;
  showSignature: boolean;
}

function calculatePages(data: DataType & Record<string, any>): PageChunk[] {
  const isAcupuncture = data?.consultationType === "acupuncture";
  const validMedicines = (data?.medicines || []).filter(
    (m: any) => m.name || m.referralName
  );
  const validTests = data?.test || [];

  // Usable height for content canvas
  const PAGE_CAPACITY = 780; // Safe conservative height in px

  const titleHeight = 26;
  let notesHeight = 0;
  if (!isAcupuncture) {
    if (data?.consultationNotes?.presentHistory) {
      notesHeight += 20 + Math.ceil(data.consultationNotes.presentHistory.length / 75) * 18 + 6;
    }
    if (data?.consultationNotes?.pastHistory) {
      notesHeight += 20 + Math.ceil(data.consultationNotes.pastHistory.length / 75) * 18 + 6;
    }
    if (data?.consultationNotes?.diagnosis) {
      notesHeight += 38;
    }
    if (data?.therapy || data?.therapyNotes) {
      notesHeight += 20 + (data.therapy ? 18 : 0) + (data.therapyNotes ? 18 : 0);
    }
    if (data?.procedure || data?.procedureNotes) {
      notesHeight += 20 + (data.procedure ? 18 : 0) + (data.procedureNotes ? 18 : 0);
    }
    if (
      data?.examinationNote?.bp ||
      data?.examinationNote?.hr ||
      data?.examinationNote?.spo2 ||
      data?.examinationNote?.temp ||
      data?.examinationNote?.otherNotes
    ) {
      notesHeight += 20 + 36 + (data.examinationNote?.otherNotes ? 18 : 0);
    }
  } else {
    if (data?.chiefComplaints?.complaints?.length || data?.chiefComplaints?.other) notesHeight += 55;
    if (data?.medicalHistoryDetails) notesHeight += 45;
    if (data?.lifestyle && Object.values(data.lifestyle).some(Boolean)) notesHeight += 50;
    if (data?.acupunctureAssessment || data?.treatmentGiven) notesHeight += 50;
    if (data?.therapy || data?.therapyNotes) {
      notesHeight += 20 + (data.therapy ? 18 : 0) + (data.therapyNotes ? 18 : 0);
    }
    if (data?.procedure || data?.procedureNotes) {
      notesHeight += 20 + (data.procedure ? 18 : 0) + (data.procedureNotes ? 18 : 0);
    }
    if (data?.treatmentPlan) notesHeight += 45;
  }

  const medsHeaderHeight = 48;
  const getMedRowHeight = (m: any) => (m.isCustom ? 26 : 24);
  const testsHeaderHeight = 46;
  const testRowHeight = 24;

  const hasAdvice = Boolean(
    data?.advice ||
    data?.followUp ||
    data?.followUpDetails?.nextAppt ||
    data?.followUpDetails?.additionalNotes ||
    data?.followUpDetails?.feedback
  );
  let adviceHeight = 0;
  if (hasAdvice) {
    adviceHeight += 20;
    if (data?.advice) adviceHeight += 18;
    if (data?.followUp || data?.followUpDetails?.nextAppt) adviceHeight += 18;
    if (data?.followUpDetails?.feedback) adviceHeight += 18;
    if (data?.followUpDetails?.additionalNotes) adviceHeight += 18;
  }

  const signatureHeight = 80;

  // Single page fit check: Only fits on 1 page if everything fits and medicines <= 10
  const totalMedsHeight =
    validMedicines.length > 0
      ? medsHeaderHeight + validMedicines.reduce((sum: number, m: any) => sum + getMedRowHeight(m), 0)
      : 0;
  const totalTestsHeight =
    validTests.length > 0 ? testsHeaderHeight + validTests.length * testRowHeight : 0;

  const totalAllHeight =
    titleHeight + notesHeight + totalMedsHeight + totalTestsHeight + adviceHeight + signatureHeight;

  if (totalAllHeight <= PAGE_CAPACITY && validMedicines.length <= 10) {
    return [
      {
        pageIndex: 0,
        showNotes: true,
        medicines: validMedicines.map((m: any, i: number) => ({ ...m, globalIndex: i + 1 })),
        tests: validTests.map((t: any, i: number) => ({ ...t, globalIndex: i + 1 })),
        showAdvice: hasAdvice,
        showSignature: true,
      },
    ];
  }

  // Multi-page building
  const pages: PageChunk[] = [];
  let currentMedIdx = 0;
  let currentTestIdx = 0;

  // Page 1: Notes + initial batch of medicines (up to 14)
  let page1Available = PAGE_CAPACITY - titleHeight - notesHeight;
  const page1Meds: Array<any & { globalIndex: number }> = [];
  if (validMedicines.length > 0 && page1Available >= medsHeaderHeight + 24) {
    page1Available -= medsHeaderHeight;
    while (currentMedIdx < validMedicines.length) {
      const rowH = getMedRowHeight(validMedicines[currentMedIdx]);
      if (page1Available >= rowH && page1Meds.length < 14) {
        page1Available -= rowH;
        page1Meds.push({ ...validMedicines[currentMedIdx], globalIndex: currentMedIdx + 1 });
        currentMedIdx++;
      } else {
        break;
      }
    }
  }

  pages.push({
    pageIndex: 0,
    showNotes: true,
    medicines: page1Meds,
    tests: [],
    showAdvice: false,
    showSignature: false,
  });

  // Subsequent pages
  while (
    currentMedIdx < validMedicines.length ||
    currentTestIdx < validTests.length ||
    !pages[pages.length - 1].showSignature
  ) {
    let pageAvail = PAGE_CAPACITY - titleHeight;
    const pageMeds: Array<any & { globalIndex: number }> = [];
    const pageTests: Array<any & { globalIndex: number }> = [];
    let pageHasAdvice = false;
    let pageHasSignature = false;

    // Check if remaining everything fits with signature on this page
    const remMedsH =
      validMedicines.length - currentMedIdx > 0
        ? medsHeaderHeight +
        validMedicines.slice(currentMedIdx).reduce((sum: number, m: any) => sum + getMedRowHeight(m), 0)
        : 0;
    const remTestsH =
      validTests.length - currentTestIdx > 0
        ? testsHeaderHeight + (validTests.length - currentTestIdx) * testRowHeight
        : 0;

    if (remMedsH + remTestsH + adviceHeight + signatureHeight <= pageAvail) {
      while (currentMedIdx < validMedicines.length) {
        pageMeds.push({ ...validMedicines[currentMedIdx], globalIndex: currentMedIdx + 1 });
        currentMedIdx++;
      }
      while (currentTestIdx < validTests.length) {
        pageTests.push({ ...validTests[currentTestIdx], globalIndex: currentTestIdx + 1 });
        currentTestIdx++;
      }
      pageHasAdvice = hasAdvice;
      pageHasSignature = true;

      pages.push({
        pageIndex: pages.length,
        showNotes: false,
        medicines: pageMeds,
        tests: pageTests,
        showAdvice: pageHasAdvice,
        showSignature: pageHasSignature,
      });
      break;
    }

    // If it cannot all fit on this page, fill medicines up to pageAvail
    const remainingMedsCount = validMedicines.length - currentMedIdx;
    if (remainingMedsCount > 0) {
      pageAvail -= medsHeaderHeight;
      let countToAdd = 0;
      let tempAvail = pageAvail;
      for (let i = currentMedIdx; i < validMedicines.length; i++) {
        const rowH = getMedRowHeight(validMedicines[i]);
        if (tempAvail >= rowH) {
          tempAvail -= rowH;
          countToAdd++;
        } else {
          break;
        }
      }

      if (remainingMedsCount - countToAdd < 5 && remainingMedsCount >= 12) {
        countToAdd = remainingMedsCount - 6;
      }

      for (let k = 0; k < countToAdd; k++) {
        pageMeds.push({ ...validMedicines[currentMedIdx], globalIndex: currentMedIdx + 1 });
        currentMedIdx++;
      }
      pageAvail = tempAvail;
    }

    // Tests if space remains
    if (currentMedIdx >= validMedicines.length && currentTestIdx < validTests.length) {
      if (pageAvail >= testsHeaderHeight + testRowHeight) {
        pageAvail -= testsHeaderHeight;
        while (currentTestIdx < validTests.length) {
          if (pageAvail >= testRowHeight) {
            pageAvail -= testRowHeight;
            pageTests.push({ ...validTests[currentTestIdx], globalIndex: currentTestIdx + 1 });
            currentTestIdx++;
          } else {
            break;
          }
        }
      }
    }

    // Check if advice and signature fit on this page now
    if (currentMedIdx >= validMedicines.length && currentTestIdx >= validTests.length) {
      if (pageAvail >= adviceHeight + signatureHeight) {
        pageHasAdvice = hasAdvice;
        pageHasSignature = true;
      }
    }

    pages.push({
      pageIndex: pages.length,
      showNotes: false,
      medicines: pageMeds,
      tests: pageTests,
      showAdvice: pageHasAdvice,
      showSignature: pageHasSignature,
    });

    if (pageHasSignature) break;
  }

  return pages;
}

export default function PrintConsultation({ appointment, data }: PrintConsultationProps) {
  const { tests } = useGetTest();
  const { panels } = useGetPanels();
  const { therapies } = useGetTherapy();
  const { procedures } = useGetProcedure();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const patient = appointment?.patient;
  const isAcupuncture = data?.consultationType === "acupuncture";
  const doctorName = resolveDoctorName(
    user?.name,
    data?.followUpDetails?.signature,
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

  // Pure synchronous calculation with useMemo - never triggers re-render loops!
  const pages = useMemo(() => {
    return calculatePages(data);
  }, [data]);

  if (!appointment || !mounted) return null;

  // Render consultation notes content
  const renderNotesContent = () => (
    <>
      {!isAcupuncture ? (
        /* Standard Consultation Layout */
        <div className="space-y-2.5 text-[12.5px]">
          {/* PRESENT HISTORY & COMPLAINTS */}
          {data.consultationNotes?.presentHistory && (
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-[12px] text-[#5F7350] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                Present History & Complaints
              </h3>
              <p className="text-slate-900 leading-snug font-semibold pl-4 text-[12.5px]">
                {data.consultationNotes.presentHistory}
              </p>
            </div>
          )}

          {/* PAST MEDICAL HISTORY */}
          {data.consultationNotes?.pastHistory && (
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-[12px] text-[#5F7350] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                Past History
              </h3>
              <p className="text-slate-900 leading-snug font-semibold pl-4 text-[12.5px]">
                {data.consultationNotes.pastHistory}
              </p>
            </div>
          )}

          {/* DIAGNOSIS */}
          {data.consultationNotes?.diagnosis && (
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-[12px] text-[#5F7350] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                Diagnosis
              </h3>
              <p className="text-slate-900 font-extrabold text-[13px] pl-4">
                {data.consultationNotes.diagnosis}
              </p>
            </div>
          )}

          {/* THERAPY & THERAPY NOTES */}
          {(data.therapy || data.therapyNotes) && (
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-[12px] text-[#5F7350] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                Therapy & Notes
              </h3>
              <div className="pl-4 space-y-0.5 text-slate-900 font-semibold text-[12.5px]">
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

          {/* PROCEDURE & PROCEDURE NOTES */}
          {(data.procedure || data.procedureNotes) && (
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-[12px] text-[#5F7350] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                Procedure & Notes
              </h3>
              <div className="pl-4 space-y-0.5 text-slate-900 font-semibold text-[12.5px]">
                {Boolean(getFormattedProcedureNames(data.procedure, procedures)) && (
                  <p>
                    <span className="font-bold text-slate-700">Procedure:</span>{" "}
                    {getFormattedProcedureNames(data.procedure, procedures)}
                  </p>
                )}
                {data.procedureNotes && (
                  <p>
                    <span className="font-bold text-slate-700">Notes:</span> {data.procedureNotes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* EXAMINATION & VITALS */}
          {(data.examinationNote?.bp ||
            data.examinationNote?.hr ||
            data.examinationNote?.spo2 ||
            data.examinationNote?.temp ||
            data.examinationNote?.otherNotes) && (
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-[12px] text-[#5F7350] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                  Examination & Vitals
                </h3>
                <div className="pl-4 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-1 text-xs md:text-[12px] text-slate-900 bg-slate-50/90 px-3.5 py-1.5 rounded-lg border border-slate-300">
                    {data.examinationNote?.bp && (
                      <span>
                        <span className="text-slate-600 uppercase text-[10.5px] font-bold mr-1.5">
                          BP:
                        </span>
                        <span className="font-black text-black">{data.examinationNote.bp}</span>
                      </span>
                    )}
                    {data.examinationNote?.hr && (
                      <span>
                        <span className="text-slate-600 uppercase text-[10.5px] font-bold mr-1.5">
                          Pulse / HR:
                        </span>
                        <span className="font-black text-black">{data.examinationNote.hr}</span>
                      </span>
                    )}
                    {data.examinationNote?.spo2 && (
                      <span>
                        <span className="text-slate-600 uppercase text-[10.5px] font-bold mr-1.5">
                          SpO2:
                        </span>
                        <span className="font-black text-black">{data.examinationNote.spo2}%</span>
                      </span>
                    )}
                    {data.examinationNote?.temp && (
                      <span>
                        <span className="text-slate-600 uppercase text-[10.5px] font-bold mr-1.5">
                          Temp:
                        </span>
                        <span className="font-black text-black">
                          {data.examinationNote.temp} {data.examinationNote.tempUnit || "°C"}
                        </span>
                      </span>
                    )}
                  </div>
                  {data.examinationNote?.otherNotes && (
                    <p className="text-slate-800 font-semibold text-[12.5px]">
                      <span className="font-bold text-slate-700">Notes:</span> {data.examinationNote.otherNotes}
                    </p>
                  )}
                </div>
              </div>
            )}
        </div>
      ) : (
        /* Acupuncture Consultation Layout */
        <div className="space-y-2.5 text-[12.5px]">
          {/* CHIEF COMPLAINTS & PAIN SCORE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-extrabold text-[12px] text-[#5F7350] uppercase tracking-wider flex items-center gap-2 mb-1">
                <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                Chief Complaints
              </h3>
              <p className="text-slate-900 font-extrabold pl-4 text-[12.5px] leading-snug">
                {data.chiefComplaints?.complaints?.join(", ") || "None"}
                {data.chiefComplaints?.other ? ` (${data.chiefComplaints.other})` : ""}
              </p>
              {data.chiefComplaints?.duration && (
                <p className="text-slate-600 text-[11.5px] pl-4 mt-0.5 font-semibold">
                  Duration: {data.chiefComplaints.duration}
                </p>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-[12px] text-[#5F7350] uppercase tracking-wider flex items-center gap-2 mb-1">
                <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                Pain Score & Vitals
              </h3>
              <div className="pl-4 space-y-0.5 text-slate-900 font-semibold text-[12.5px]">
                <p>
                  <span className="text-slate-700">Pain Score:</span>{" "}
                  <span className="font-black text-black">{data.chiefComplaints?.painScore ?? "—"} / 10</span>
                </p>
                <p>
                  BP: <span className="font-black text-black">{data.acupunctureExamination?.bp || "—"}</span> | Pulse:{" "}
                  <span className="font-black text-black">{data.acupunctureExamination?.pulse || "—"}</span>
                </p>
                {(data.acupunctureExamination?.tenderness ||
                  data.acupunctureExamination?.rom ||
                  data.acupunctureExamination?.posture) && (
                    <p className="text-slate-800">
                      {data.acupunctureExamination.tenderness && (
                        <span className="mr-3">
                          <span className="font-bold text-slate-800">Tenderness:</span> {data.acupunctureExamination.tenderness}
                        </span>
                      )}
                      {data.acupunctureExamination.rom && (
                        <span className="mr-3">
                          <span className="font-bold text-slate-800">ROM:</span> {data.acupunctureExamination.rom}
                        </span>
                      )}
                      {data.acupunctureExamination.posture && (
                        <span>
                          <span className="font-bold text-slate-800">Posture:</span> {data.acupunctureExamination.posture}
                        </span>
                      )}
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* PAST HISTORY / MEDICAL HISTORY DETAILS */}
          {(data.medicalHistoryDetails?.medHistory?.length > 0 ||
            data.medicalHistoryDetails?.currentMedications ||
            data.medicalHistoryDetails?.otherMedHistory ||
            data.medicalHistoryDetails?.allergies) && (
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-[12px] text-[#5F7350] uppercase tracking-wider flex items-center gap-2 mb-0.5">
                  <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                  Past Medical History
                </h3>
                <div className="pl-4 space-y-0.5 text-slate-900 font-semibold text-[12.5px]">
                  {data.medicalHistoryDetails?.medHistory?.length > 0 && (
                    <p>
                      <span className="font-bold text-slate-700">Conditions:</span> {data.medicalHistoryDetails.medHistory.join(", ")}
                      {data.medicalHistoryDetails.otherMedHistory ? ` (${data.medicalHistoryDetails.otherMedHistory})` : ""}
                    </p>
                  )}
                  {data.medicalHistoryDetails?.currentMedications && (
                    <p>
                      <span className="font-bold text-slate-700">Current Medications:</span>{" "}
                      {data.medicalHistoryDetails.currentMedications}
                    </p>
                  )}
                </div>
              </div>
            )}

          {/* LIFESTYLE & HABITS */}
          {data.lifestyle && Object.values(data.lifestyle).some(Boolean) && (
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-[12px] text-[#5F7350] uppercase tracking-wider flex items-center gap-2 mb-0.5">
                <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                Lifestyle & Habits
              </h3>
              <div className="pl-4 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-slate-900 font-semibold text-[12.5px]">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-extrabold text-[12px] text-[#5F7350] uppercase tracking-wider flex items-center gap-2 mb-1">
                <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                Acupuncture Assessment
              </h3>
              <div className="pl-4 space-y-0.5 text-slate-900 font-semibold text-[12.5px]">
                <p><span className="font-extrabold text-slate-900">Diagnosis:</span> {data.acupunctureAssessment?.clinicalDiagnosis || "—"}</p>
                <p><span className="font-extrabold text-slate-900">Principle:</span> {data.acupunctureAssessment?.treatmentPrinciple || "—"}</p>
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-[12px] text-[#5F7350] uppercase tracking-wider flex items-center gap-2 mb-1">
                <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                Treatment Given
              </h3>
              <div className="pl-4 space-y-0.5 text-slate-900 font-semibold text-[12.5px]">
                <p><span className="font-extrabold text-slate-900">Therapies:</span> {data.treatmentGiven?.treatments?.join(", ") || "—"}</p>
                <p><span className="font-extrabold text-slate-900">Acu Points:</span> {data.treatmentGiven?.acuPoints || "—"}</p>
                <p><span className="font-extrabold text-slate-900">Retention Time:</span> {data.treatmentGiven?.retentionTime || "—"} mins</p>
              </div>
            </div>
          </div>

          {/* TREATMENT PLAN */}
          {data.treatmentPlan && (
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-[12px] text-[#5F7350] uppercase tracking-wider flex items-center gap-2 mb-0.5">
                <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                Treatment Plan & Home Care
              </h3>
              <div className="pl-4 space-y-0.5 text-slate-900 font-semibold text-[12.5px]">
                <p>
                  Sessions: <span className="font-black text-black">{data.treatmentPlan.sessions || "—"}</span> | Frequency:{" "}
                  <span className="font-black text-black">{data.treatmentPlan.frequency || "—"}</span>
                </p>
                <p>
                  <span className="font-bold text-slate-700">Home Care Advice:</span> {data.treatmentPlan.homeCare?.join(", ") || "—"}
                </p>
              </div>
            </div>
          )}

          {/* THERAPY & THERAPY NOTES */}
          {(data.therapy || data.therapyNotes) && (
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-[12px] text-[#5F7350] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                Therapy & Notes
              </h3>
              <div className="pl-4 space-y-0.5 text-slate-900 font-semibold text-[12.5px]">
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

          {/* PROCEDURE & PROCEDURE NOTES */}
          {(data.procedure || data.procedureNotes) && (
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-[12px] text-[#5F7350] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                Procedure & Notes
              </h3>
              <div className="pl-4 space-y-0.5 text-slate-900 font-semibold text-[12.5px]">
                {Boolean(getFormattedProcedureNames(data.procedure, procedures)) && (
                  <p>
                    <span className="font-bold text-slate-700">Procedure:</span>{" "}
                    {getFormattedProcedureNames(data.procedure, procedures)}
                  </p>
                )}
                {data.procedureNotes && (
                  <p>
                    <span className="font-bold text-slate-700">Notes:</span> {data.procedureNotes}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );

  const printDocument = (
    <div className="print-consultation-document hidden print:block bg-white text-black font-montserrat leading-relaxed">
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
                height: auto !important;
                min-height: 0 !important;
                max-height: none !important;
                overflow: visible !important;
              }
              body > *:not(.print-consultation-document) {
                display: none !important;
              }
              .print-consultation-document, .print-consultation-document * {
                font-family: 'Montserrat', sans-serif !important;
              }
              .print-consultation-document {
                visibility: visible !important;
                display: block !important;
                position: static !important;
                width: 210mm !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              .a4-print-page {
                width: 210mm !important;
                height: 297mm !important;
                min-height: 297mm !important;
                max-height: 297mm !important;
                page-break-after: always !important;
                break-after: page !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                box-sizing: border-box !important;
                display: flex !important;
                flex-direction: column !important;
                overflow: hidden !important;
                background: white !important;
                position: relative !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .a4-print-page:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
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

      {pages.map((page, pageIdx) => {
        const totalPages = pages.length;
        const pageNum = pageIdx + 1;

        return (
          <div
            key={pageIdx}
            className="a4-print-page w-[210mm] h-[297mm] max-h-[297mm] mx-auto flex flex-col relative z-20 bg-white border border-slate-200 print:border-none print:w-[210mm] print:h-[297mm] print:max-h-[297mm] print:m-0 print:p-0 overflow-hidden font-montserrat"
          >
            {/* TOP HEADER SECTION */}
            <PrintHeader />

            {/* PATIENT INFO STRIP */}
            <PrintPatientStrip
              name={patient?.name || ""}
              age={ageStr}
              sex={sexStr}
              date={formattedDate}
              opNo={opNumber}
            />

            {/* FULL-WIDTH MAIN CONSULTATION CANVAS */}
            <div className="flex-1 relative flex flex-col px-8 py-3 bg-white overflow-hidden space-y-2.5">
              <PrintWatermark />

              {/* Consultation Type Header Line */}
              <div className="flex justify-between items-center relative z-10 border-b-2 border-[#5F7350] pb-1 mb-0.5">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-black text-[#5F7350] uppercase tracking-wider">
                    {page.showNotes
                      ? isAcupuncture
                        ? "Acupuncture Consultation"
                        : "Medical Consultation"
                      : isAcupuncture
                        ? "Acupuncture Consultation (Continued)"
                        : "Medical Consultation (Continued)"}
                  </h2>
                  {totalPages > 1 && (
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Page {pageNum} of {totalPages}
                    </span>
                  )}
                </div>
                {patient?.allergies && (
                  <span className="text-[11px] font-extrabold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                    Allergies: {patient.allergies}
                  </span>
                )}
              </div>

              {/* CONSULTATION SECTIONS ON FIRST PAGE */}
              {page.showNotes && (
                <div className="relative z-10">
                  {renderNotesContent()}
                </div>
              )}

              {/* PRESCRIBED MEDICINES TABLE (Rx) */}
              {page.medicines.length > 0 && (
                <div className="break-inside-avoid relative z-10 space-y-1 pt-0.5">
                  <div className="flex justify-between items-center border-b-2 border-[#5F7350] pb-1">
                    <h3 className="font-black text-xs text-[#5F7350] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                      {page.showNotes ? "Prescribed Medicines" : "Prescribed Medicines (Continued)"}
                    </h3>
                    <span className="font-serif italic text-base font-black text-[#5F7350]">Rx</span>
                  </div>
                  <table className="w-full border-collapse text-[12px]">
                    <thead>
                      <tr className="border-b border-slate-300 text-[10.5px] font-black text-slate-800 uppercase tracking-wider text-left bg-slate-100/80">
                        <th className="py-1 px-2 text-center w-8">#</th>
                        <th className="py-1 px-2">Medicine / Strength</th>
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
                            {m.referralName || (typeof m.name === "object" ? (m.name as any)?.name : m.name)}
                            {m.isCustom && (
                              <span className="ml-1.5 text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1 py-0.2 rounded">
                                Outside
                              </span>
                            )}
                          </td>
                          <td className="py-1 px-2 text-center font-bold text-slate-800 text-[12px]">
                            {m.dosage || "—"}
                          </td>
                          <td className="py-1 px-2 text-center font-black text-[#5F7350] text-[12px]">
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

              {/* INVESTIGATION / LAB TESTS TABLE */}
              {page.tests.length > 0 && (
                <div className="break-inside-avoid relative z-10 space-y-1 pt-0.5">
                  <div className="border-b-2 border-[#5F7350] pb-1">
                    <h3 className="font-black text-xs text-[#5F7350] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-[#5F7350] rounded-full inline-block"></span>
                      Ordered Investigations & Tests
                    </h3>
                  </div>
                  <table className="w-full border-collapse text-[12px]">
                    <thead>
                      <tr className="border-b border-slate-300 text-[10.5px] font-black text-slate-800 uppercase tracking-wider text-left bg-slate-100/80">
                        <th className="py-1 px-2 text-center w-8">#</th>
                        <th className="py-1 px-2">Test Name</th>
                        <th className="py-1 px-2 text-center">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {page.tests.map((t: any) => {
                        const names = getFormattedInvestigationNames(t, tests, panels);
                        return (
                          <tr key={t.globalIndex} className="even:bg-slate-50/60">
                            <td className="py-1 px-2 text-center font-bold text-slate-600 text-[11px]">
                              {t.globalIndex}
                            </td>
                            <td className="py-1 px-2 font-black text-slate-900 text-[12px]">
                              {names.join(", ") || "—"}
                            </td>
                            <td className="py-1 px-2 text-center capitalize font-bold text-slate-800 text-[12px]">
                              {t.priority}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ADVICE & FOLLOW-UP CARD */}
              {page.showAdvice && (
                <div className="break-inside-avoid relative z-10 pt-1.5 space-y-1 border-t border-slate-200 text-[12.5px]">
                  {data.advice && (
                    <p className="text-slate-900">
                      <span className="font-black text-[#5F7350] uppercase tracking-wider text-xs">Advice:</span>{" "}
                      <span className="font-semibold text-slate-800">{data.advice}</span>
                    </p>
                  )}
                  {(data.followUp || data.followUpDetails?.nextAppt) && (
                    <p className="text-slate-900">
                      <span className="font-black text-[#5F7350] uppercase tracking-wider text-xs">Follow-Up Date:</span>{" "}
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
                      <span className="font-black text-[#5F7350] uppercase tracking-wider text-xs">Patient Feedback:</span>{" "}
                      <span className="font-semibold text-slate-800">{data.followUpDetails.feedback}</span>
                    </p>
                  )}
                  {data.followUpDetails?.additionalNotes && (
                    <p className="text-slate-900">
                      <span className="font-black text-[#5F7350] uppercase tracking-wider text-xs">Additional Notes:</span>{" "}
                      <span className="font-semibold text-slate-800">{data.followUpDetails.additionalNotes}</span>
                    </p>
                  )}
                </div>
              )}

              {/* DOCTOR SIGNATURE ON FINAL PAGE */}
              {page.showSignature && (
                <div className="mt-auto pt-2">
                  <PrintSignature
                    doctorName={doctorName}
                    specialization={
                      user?.specialization ||
                      (appointment?.doctor as any)?.specialization ||
                      "Authorized Medical Practitioner"
                    }
                    signature={data.followUpDetails?.signature || (appointment?.doctor as any)?.signature}
                  />
                </div>
              )}
            </div>

            {/* BOTTOM FOOTER SECTION */}
            <PrintFooter pageNumber={pageNum} totalPages={totalPages} />
          </div>
        );
      })}
    </div>
  );

  return createPortal(printDocument, document.body);
}
