"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

interface PageChunk {
  pageIndex: number;
  showNotes: boolean;
  medicines: Array<any & { globalIndex: number }>;
  tests: Array<any & { globalIndex: number }>;
  showAdvice: boolean;
  showSignature: boolean;
}

export default function PrintConsultation({ appointment, data }: PrintConsultationProps) {
  const { tests } = useGetTest();
  const { panels } = useGetPanels();
  const { therapies } = useGetTherapy();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  // Dynamic DOM measurement refs
  const measureScaffoldRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const patientStripRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const notesRef = useRef<HTMLDivElement | null>(null);
  const medsHeadRef = useRef<HTMLDivElement | null>(null);
  const medRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const testsHeadRef = useRef<HTMLDivElement | null>(null);
  const testRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const adviceRef = useRef<HTMLDivElement | null>(null);
  const signatureRef = useRef<HTMLDivElement | null>(null);

  const [pages, setPages] = useState<PageChunk[]>([]);

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

  const validMedicines = (data?.medicines || []).filter(
    (m: any) => m.name || m.referralName
  );
  const validTests = data?.test || [];
  const hasAdvice = Boolean(
    data?.advice ||
      data?.followUp ||
      data?.followUpDetails?.nextAppt ||
      data?.followUpDetails?.additionalNotes ||
      data?.followUpDetails?.feedback
  );

  // Measure actual DOM heights and dynamically calculate pagination
  const recomputePagination = () => {
    if (!measureScaffoldRef.current) return;

    // A4 total height in pixels (297mm * 3.7795px/mm ≈ 1122.5px).
    // Using 1080px to guarantee safe printable bounds without cutting off footer.
    const TOTAL_A4_HEIGHT = 1080;

    const headerH = headerRef.current?.getBoundingClientRect().height || 75;
    const patientStripH = patientStripRef.current?.getBoundingClientRect().height || 34;
    const footerH = footerRef.current?.getBoundingClientRect().height || 54;
    const canvasPadding = 24; // py-3 top + bottom

    // Exact printable content area height available per page
    const usablePageHeight = TOTAL_A4_HEIGHT - headerH - patientStripH - footerH - canvasPadding;

    const titleH = titleRef.current?.getBoundingClientRect().height || 26;
    const notesH = notesRef.current?.getBoundingClientRect().height || 0;
    const medsHeadH = validMedicines.length > 0 ? (medsHeadRef.current?.getBoundingClientRect().height || 46) : 0;
    const medRowHeights = validMedicines.map((_, i) => medRowRefs.current[i]?.getBoundingClientRect().height || 24);

    const testsHeadH = validTests.length > 0 ? (testsHeadRef.current?.getBoundingClientRect().height || 44) : 0;
    const testRowHeights = validTests.map((_, i) => testRowRefs.current[i]?.getBoundingClientRect().height || 22);

    const adviceH = hasAdvice ? (adviceRef.current?.getBoundingClientRect().height || 40) : 0;
    const sigH = signatureRef.current?.getBoundingClientRect().height || 70;

    // Check if EVERYTHING fits on 1 page with safe bottom margin
    const totalMedsHeight = validMedicines.length > 0
      ? medsHeadH + medRowHeights.reduce((a, b) => a + b, 0)
      : 0;
    const totalTestsHeight = validTests.length > 0
      ? testsHeadH + testRowHeights.reduce((a, b) => a + b, 0)
      : 0;

    const totalEverythingPage1 = titleH + notesH + totalMedsHeight + totalTestsHeight + adviceH + sigH;

    if (totalEverythingPage1 <= usablePageHeight - 10) {
      setPages([
        {
          pageIndex: 0,
          showNotes: true,
          medicines: validMedicines.map((m: any, i: number) => ({ ...m, globalIndex: i + 1 })),
          tests: validTests.map((t: any, i: number) => ({ ...t, globalIndex: i + 1 })),
          showAdvice: hasAdvice,
          showSignature: true,
        },
      ]);
      return;
    }

    // Multi-page building
    const resultPages: PageChunk[] = [];
    let currentMedIdx = 0;
    let currentTestIdx = 0;

    // PAGE 1: Title + Notes + as many medicines as fit
    let page1Avail = usablePageHeight - titleH - notesH - 8;
    const page1Meds: Array<any & { globalIndex: number }> = [];

    if (validMedicines.length > 0 && page1Avail >= medsHeadH + 20) {
      page1Avail -= medsHeadH;
      while (currentMedIdx < validMedicines.length) {
        const rowH = medRowHeights[currentMedIdx];
        if (page1Avail >= rowH) {
          page1Avail -= rowH;
          page1Meds.push({ ...validMedicines[currentMedIdx], globalIndex: currentMedIdx + 1 });
          currentMedIdx++;
        } else {
          break;
        }
      }
    }

    resultPages.push({
      pageIndex: 0,
      showNotes: true,
      medicines: page1Meds,
      tests: [],
      showAdvice: false,
      showSignature: false,
    });

    // SUBSEQUENT PAGES:
    while (
      currentMedIdx < validMedicines.length ||
      currentTestIdx < validTests.length ||
      !resultPages[resultPages.length - 1].showSignature
    ) {
      let pageAvail = usablePageHeight - titleH - 8;
      const pageMeds: Array<any & { globalIndex: number }> = [];
      const pageTests: Array<any & { globalIndex: number }> = [];
      let pageHasAdvice = false;
      let pageHasSignature = false;

      // Check if EVERYTHING remaining fits on this page WITH advice & signature
      const remMedsH = (validMedicines.length - currentMedIdx > 0)
        ? medsHeadH + medRowHeights.slice(currentMedIdx).reduce((a, b) => a + b, 0)
        : 0;
      const remTestsH = (validTests.length - currentTestIdx > 0)
        ? testsHeadH + testRowHeights.slice(currentTestIdx).reduce((a, b) => a + b, 0)
        : 0;

      if (remMedsH + remTestsH + adviceH + sigH <= pageAvail) {
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

        resultPages.push({
          pageIndex: resultPages.length,
          showNotes: false,
          medicines: pageMeds,
          tests: pageTests,
          showAdvice: pageHasAdvice,
          showSignature: pageHasSignature,
        });
        break;
      }

      // If it doesn't all fit with signature, fill medicines up to pageAvail
      if (currentMedIdx < validMedicines.length) {
        pageAvail -= medsHeadH;
        while (currentMedIdx < validMedicines.length) {
          const rowH = medRowHeights[currentMedIdx];
          if (pageAvail >= rowH) {
            pageAvail -= rowH;
            pageMeds.push({ ...validMedicines[currentMedIdx], globalIndex: currentMedIdx + 1 });
            currentMedIdx++;
          } else {
            break;
          }
        }
      }

      // Fill tests if space remains and medicines are finished
      if (currentMedIdx >= validMedicines.length && currentTestIdx < validTests.length) {
        if (pageAvail >= testsHeadH + (testRowHeights[currentTestIdx] || 22)) {
          pageAvail -= testsHeadH;
          while (currentTestIdx < validTests.length) {
            const rowH = testRowHeights[currentTestIdx];
            if (pageAvail >= rowH) {
              pageAvail -= rowH;
              pageTests.push({ ...validTests[currentTestIdx], globalIndex: currentTestIdx + 1 });
              currentTestIdx++;
            } else {
              break;
            }
          }
        }
      }

      // Check if advice & signature fit on this page now
      if (currentMedIdx >= validMedicines.length && currentTestIdx >= validTests.length) {
        if (pageAvail >= adviceH + sigH) {
          pageHasAdvice = hasAdvice;
          pageHasSignature = true;
        }
      }

      resultPages.push({
        pageIndex: resultPages.length,
        showNotes: false,
        medicines: pageMeds,
        tests: pageTests,
        showAdvice: pageHasAdvice,
        showSignature: pageHasSignature,
      });

      if (pageHasSignature) break;
    }

    setPages(resultPages);
  };

  useLayoutEffect(() => {
    if (mounted) {
      recomputePagination();
    }
  }, [mounted, data, appointment, tests, panels, therapies]);

  // Hook into beforeprint to recalculate dynamically before printing
  useEffect(() => {
    const handleBeforePrint = () => {
      recomputePagination();
    };
    window.addEventListener("beforeprint", handleBeforePrint);
    return () => window.removeEventListener("beforeprint", handleBeforePrint);
  }, [mounted, data, appointment, tests, panels, therapies]);

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
              <h3 className="font-extrabold text-[12px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
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
              <h3 className="font-extrabold text-[12px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
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
              <h3 className="font-extrabold text-[12px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
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
              <h3 className="font-extrabold text-[12px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
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

          {/* EXAMINATION & VITALS */}
          {(data.examinationNote?.bp ||
            data.examinationNote?.hr ||
            data.examinationNote?.spo2 ||
            data.examinationNote?.temp ||
            data.examinationNote?.otherNotes) && (
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-[12px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
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
              <h3 className="font-extrabold text-[12px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2 mb-1">
                <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
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
              <h3 className="font-extrabold text-[12px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2 mb-1">
                <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
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
              <h3 className="font-extrabold text-[12px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2 mb-0.5">
                <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
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
              <h3 className="font-extrabold text-[12px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2 mb-0.5">
                <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                Lifestyle & Habits
              </h3>
              <div className="pl-4 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-slate-900 font-semibold text-[12px]">
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
              <h3 className="font-extrabold text-[12px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2 mb-1">
                <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                Acupuncture Assessment
              </h3>
              <div className="pl-4 space-y-0.5 text-slate-900 font-semibold text-[12.5px]">
                <p><span className="font-extrabold text-slate-900">Diagnosis:</span> {data.acupunctureAssessment?.clinicalDiagnosis || "—"}</p>
                <p><span className="font-extrabold text-slate-900">Principle:</span> {data.acupunctureAssessment?.treatmentPrinciple || "—"}</p>
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-[12px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2 mb-1">
                <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
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
              <h3 className="font-extrabold text-[12px] text-[#2d3e36] uppercase tracking-wider flex items-center gap-2 mb-0.5">
                <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
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
        </div>
      )}
    </>
  );

  const printDocument = (
    <>
      {/* HIDDEN MEASUREMENT SCAFFOLD FOR DYNAMIC PIXEL-PERFECT DOM MEASUREMENT */}
      <div
        ref={measureScaffoldRef}
        aria-hidden="true"
        className="fixed -left-[9999px] top-0 w-[210mm] bg-white text-black font-sans leading-relaxed pointer-events-none opacity-0 invisible"
        style={{ width: "210mm", boxSizing: "border-box" }}
      >
        <div ref={headerRef}><PrescriptionHeader /></div>
        <div ref={patientStripRef}>
          <PrescriptionPatientStrip
            name={patient?.name || ""}
            age={ageStr}
            sex={sexStr}
            date={formattedDate}
            opNo={opNumber}
          />
        </div>
        <div ref={footerRef}><PrescriptionFooter /></div>

        <div className="px-8 py-3 space-y-2.5">
          <div ref={titleRef} className="flex justify-between items-center border-b-2 border-[#2d3e36] pb-1 mb-0.5">
            <h2 className="text-sm font-black uppercase">Medical Consultation</h2>
          </div>

          <div ref={notesRef}>
            {renderNotesContent()}
          </div>

          {validMedicines.length > 0 && (
            <div ref={medsHeadRef} className="border-b-2 border-[#2d3e36] pb-1 pt-0.5">
              <h3 className="font-black text-xs uppercase">Prescribed Medicines</h3>
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-slate-300 text-[10.5px] font-black uppercase bg-slate-100/80">
                    <th className="py-1 px-2 text-center w-8">#</th>
                    <th className="py-1 px-2">Medicine / Strength</th>
                    <th className="py-1 px-2 text-center">Dosage</th>
                    <th className="py-1 px-2 text-center">Frequency</th>
                    <th className="py-1 px-2 text-center">Timing / Food</th>
                    <th className="py-1 px-2 text-center">Duration</th>
                    <th className="py-1 px-2 text-center">Qty</th>
                  </tr>
                </thead>
              </table>
            </div>
          )}

          <table className="w-full border-collapse text-[12px]">
            <tbody className="divide-y divide-slate-200">
              {validMedicines.map((m: any, idx: number) => (
                <tr
                  key={idx}
                  ref={(el) => { medRowRefs.current[idx] = el; }}
                  className="even:bg-slate-50/60"
                >
                  <td className="py-1 px-2 text-center font-bold text-slate-600 text-[11px]">{idx + 1}</td>
                  <td className="py-1 px-2 font-black text-slate-900 text-[12px]">
                    {m.referralName || (typeof m.name === "object" ? (m.name as any)?.name : m.name)}
                    {m.isCustom && <span className="ml-1.5 text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1 py-0.2 rounded">Outside</span>}
                  </td>
                  <td className="py-1 px-2 text-center font-bold text-slate-800 text-[12px]">{m.dosage || "—"}</td>
                  <td className="py-1 px-2 text-center font-black text-[#2d3e36] text-[12px]">{m.frequency || "—"}</td>
                  <td className="py-1 px-2 text-center font-semibold text-slate-700 text-[12px]">{m.food || "—"}</td>
                  <td className="py-1 px-2 text-center font-bold text-slate-800 text-[12px]">{m.duration || "—"}</td>
                  <td className="py-1 px-2 text-center font-black text-slate-900 text-[12px]">{m.quantity || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {validTests.length > 0 && (
            <div ref={testsHeadRef} className="border-b-2 border-[#2d3e36] pb-1 pt-0.5">
              <h3 className="font-black text-xs uppercase">Ordered Investigations & Tests</h3>
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-slate-300 text-[10.5px] font-black uppercase bg-slate-100/80">
                    <th className="py-1 px-2 text-center w-8">#</th>
                    <th className="py-1 px-2">Test Name</th>
                    <th className="py-1 px-2 text-center">Priority</th>
                  </tr>
                </thead>
              </table>
            </div>
          )}

          <table className="w-full border-collapse text-[12px]">
            <tbody className="divide-y divide-slate-200">
              {validTests.map((t: any, idx: number) => (
                <tr
                  key={idx}
                  ref={(el) => { testRowRefs.current[idx] = el; }}
                  className="even:bg-slate-50/60"
                >
                  <td className="py-1 px-2 text-center font-bold text-slate-600 text-[11px]">{idx + 1}</td>
                  <td className="py-1 px-2 font-black text-slate-900 text-[12px]">{getFormattedInvestigationNames(t, tests, panels).join(", ") || "—"}</td>
                  <td className="py-1 px-2 text-center capitalize font-bold text-slate-800 text-[12px]">{t.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {hasAdvice && (
            <div ref={adviceRef} className="pt-1.5 space-y-1 border-t border-slate-200 text-[12.5px]">
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

          <div ref={signatureRef} className="pt-2">
            <PrescriptionSignature
              doctorName={doctorName}
              specialization={user?.specialization || (appointment?.doctor as any)?.specialization || "Authorized Medical Practitioner"}
              signature={data.followUpDetails?.signature || (appointment?.doctor as any)?.signature}
            />
          </div>
        </div>
      </div>

      {/* ACTUAL PRINT DOCUMENT */}
      <div className="print-consultation-document hidden print:block bg-white text-black font-sans leading-relaxed">
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
                  background: white !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  height: auto !important;
                  min-height: 0 !important;
                  max-height: none !important;
                  overflow: visible !important;
                }
                body > *:not(.print-consultation-document) {
                  display: none !important;
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
              className="a4-print-page w-[210mm] h-[297mm] max-h-[297mm] mx-auto flex flex-col relative z-20 bg-white border border-slate-200 print:border-none print:w-[210mm] print:h-[297mm] print:max-h-[297mm] print:m-0 print:p-0 overflow-hidden"
            >
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
              <div className="flex-1 relative flex flex-col px-8 py-3 bg-white overflow-hidden space-y-2.5">
                <PrescriptionWatermark />

                {/* Consultation Type Header Line */}
                <div className="flex justify-between items-center relative z-10 border-b-2 border-[#2d3e36] pb-1 mb-0.5">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-black text-[#2d3e36] uppercase tracking-wider">
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
                    <div className="flex justify-between items-center border-b-2 border-[#2d3e36] pb-1">
                      <h3 className="font-black text-xs text-[#2d3e36] uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
                        {page.showNotes ? "Prescribed Medicines" : "Prescribed Medicines (Continued)"}
                      </h3>
                      <span className="font-serif italic text-base font-black text-[#2d3e36]">Rx</span>
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
                            <td className="py-1 px-2 text-center font-black text-[#2d3e36] text-[12px]">
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
                    <div className="border-b-2 border-[#2d3e36] pb-1">
                      <h3 className="font-black text-xs text-[#2d3e36] uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-3.5 bg-[#2d3e36] rounded-full inline-block"></span>
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

                {/* DOCTOR SIGNATURE ON FINAL PAGE */}
                {page.showSignature && (
                  <div className="mt-auto pt-2">
                    <PrescriptionSignature
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
              <PrescriptionFooter pageNumber={pageNum} totalPages={totalPages} />
            </div>
          );
        })}
      </div>
    </>
  );

  return createPortal(printDocument, document.body);
}
