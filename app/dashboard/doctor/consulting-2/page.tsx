"use client";

import React, { useEffect, useState, Suspense } from "react";
import { redirect, useSearchParams } from "next/navigation";
import useSWR from "swr";
import AppShell from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Header from "../consulting/Header";
import ActionButton from "../consulting/ActionButton";
import History from "../consulting/History";
import Report from "../consulting/Report";
import AllergyAlert from "../consulting/AllergyAlert";
import PrintConsultation from "../consulting/PrintConsultation";
import TherapyCard from "../consulting/TherapyCard";
import ProcedureCard from "../consulting/ProcedureCard";
import Test from "../consulting/Test";
import { AppointmentType, DataType } from "../consulting/interface";
import {
  Activity,
  Calendar,
  ClipboardList,
  HeartPulse,
  Pill,
  Sparkles,
  Stethoscope,
  UserCheck,
  Check,
  Moon,
  RefreshCw,
  Utensils,
  Flame,
  Dumbbell,
  Cigarette,
  Wine,
  Droplets,
  EllipsisVertical,
  Pencil,
} from "lucide-react";
import BubbleButtonGroup from "./BubbleButtonGroup";
import MultiEntryInput from "./MultiEntryInput";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEFAULT_CHIEF_COMPLAINTS = [
  "Neck Pain",
  "Back Pain",
  "Shoulder Pain",
  "Knee Pain",
  "Sciatica",
  "Headache / Migraine",
  "Frozen Shoulder",
  "Tennis Elbow",
  "Arthritis",
  "Cervical Spondylosis",
  "Lumbar Spondylosis",
  "Stress / Anxiety",
  "Insomnia",
  "Digestive Issues",
];

const DEFAULT_MED_HISTORY = [
  "Diabetes",
  "Hypertension",
  "Thyroid Disorder",
  "Heart Disease",
  "Asthma",
  "Stroke",
  "Epilepsy",
  "Cancer",
  "Pregnancy",
  "Recent Surgery",
  "Pacemaker",
  "Bleeding Disorder",
];

const DEFAULT_HOME_CARE = [
  "Hydration",
  "Stretching",
  "Rest",
  "Heat Therapy",
  "Exercise",
  "Posture Correction",
  "Diet Advice",
];

function ConsultingTwoContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("id") as string;
  const [testIsOK, setTestIsOK] = useState(true);
  const [activeTab, setActiveTab] = useState<"consultation" | "history" | "report">(
    "consultation"
  );

  const { data: appointmentData, isLoading } = useSWR<{
    message: string;
    data: AppointmentType;
  }>(appointmentId ? `/appointments/single/${appointmentId}` : null);

  const appointment = appointmentData?.data;

  const { data: pastConsultationsData } = useSWR<{
    message: string;
    data: any[];
  }>(
    appointment?.patient?._id
      ? `/consultings/patient/${appointment.patient._id}`
      : null
  );

  const isSecondVisitOnwards = (pastConsultationsData?.data?.length ?? 0) > 0;

  const [data, setData] = useState<DataType & Record<string, any>>({
    patient: null,
    appointment: null,
    consultationNotes: {
      presentHistory: null,
      pastHistory: null,
      diagnosis: null,
    },
    examinationNote: {
      hr: null,
      bp: null,
      spo2: null,
      temp: null,
      tempUnit: "°C",
      rs: null,
      cvs: null,
      pa: null,
      cns: null,
      le: null,
      otherNotes: null,
    },
    medicalParameters: {
      sleep: null,
      bowelMovement: null,
      urineMovement: null,
      appetite: null,
    },
    therapy: null,
    therapyNotes: null,
    medicines: [
      {
        dosage: "1 tab",
        name: "",
        duration: "",
        food: "",
        frequency: "",
        quantity: 0,
        referralName: "",
      },
    ],
    advice: null,
    followUp: null,
    test: [],
  });

  // ---------- Interactive Assessment State (NO DEFAULTS) ----------
  // 1. Chief Complaints
  const [complaints, setComplaints] = useState<string[]>([]);
  const [otherComplaintList, setOtherComplaintList] = useState<string[]>([]);
  const [duration, setDuration] = useState("");
  const [painScore, setPainScore] = useState<number | null>(null);

  // ---------- Option Lists with LocalStorage Persistence ----------
  const [complaintOptions, setComplaintOptions] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("@consulting2_chief_complaints_options");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return DEFAULT_CHIEF_COMPLAINTS;
  });

  const [medHistoryOptions, setMedHistoryOptions] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("@consulting2_med_history_options");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return DEFAULT_MED_HISTORY;
  });

  const [isEditingComplaints, setIsEditingComplaints] = useState(false);
  const [isEditingMedHistory, setIsEditingMedHistory] = useState(false);

  const [homeCareOptions, setHomeCareOptions] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("@consulting2_home_care_options");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return DEFAULT_HOME_CARE;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "@consulting2_home_care_options",
        JSON.stringify(homeCareOptions)
      );
    }
  }, [homeCareOptions]);

  const [isEditingHomeCare, setIsEditingHomeCare] = useState(false);

  // 2. Lifestyle
  const [sleep, setSleep] = useState("");
  const [bowel, setBowel] = useState("");
  const [appetite, setAppetite] = useState("");
  const [stress, setStress] = useState("");
  const [exercise, setExercise] = useState("");
  const [smoking, setSmoking] = useState("");
  const [alcohol, setAlcohol] = useState("");
  const [micturition, setMicturition] = useState("");

  // 3. Acupuncture Assessment
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState("");
  const [treatmentPrinciple, setTreatmentPrinciple] = useState("");

  // 4. Treatment Plan
  const [sessions, setSessions] = useState("");
  const [otherSessions, setOtherSessions] = useState("");
  const [frequency, setFrequency] = useState("");
  const [homeCare, setHomeCare] = useState<string[]>([]);

  // 5. Medical History
  const [medHistory, setMedHistory] = useState<string[]>([]);
  const [otherMedHistoryList, setOtherMedHistoryList] = useState<string[]>([]);
  const [currentMedicationsList, setCurrentMedicationsList] = useState<string[]>([]);
  const [historyAllergiesList, setHistoryAllergiesList] = useState<string[]>([]);

  // 6. Examination
  const [bp, setBp] = useState("");
  const [pulse, setPulse] = useState("");
  const [tenderness, setTenderness] = useState("");
  const [rom, setRom] = useState("");
  const [posture, setPosture] = useState("");
  const [specialFindings, setSpecialFindings] = useState("");

  // 7. Follow-Up
  const [nextAppt, setNextAppt] = useState("");
  const [feedback, setFeedback] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [signature, setSignature] = useState("");

  const toggleArrayItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  };

  useEffect(() => {
    if (appointment?._id && appointment.patient?._id) {
      setData((prev) => ({
        ...prev,
        appointment: appointment._id,
        patient: appointment.patient._id,
        consultationType: "acupuncture",
        chiefComplaints: {
          complaints,
          other: otherComplaintList.join(", "),
          duration,
          painScore: painScore ?? undefined,
        },
        lifestyle: {
          sleep,
          bowel,
          appetite,
          stress,
          exercise,
          smoking,
          alcohol,
          micturition,
        },
        acupunctureAssessment: {
          clinicalDiagnosis,
          treatmentPrinciple,
        },
        treatmentPlan: {
          sessions: sessions === "Other" ? otherSessions : sessions,
          frequency,
          homeCare,
        },
        medicalHistoryDetails: {
          medHistory,
          otherMedHistory: otherMedHistoryList.join(", "),
          currentMedications: currentMedicationsList.join(", "),
          allergies: historyAllergiesList.join(", "),
        },
        acupunctureExamination: {
          bp,
          pulse,
          tenderness,
          rom,
          posture,
          specialFindings,
        },
        followUpDetails: {
          nextAppt: nextAppt ? new Date(nextAppt) : null,
          feedback,
          additionalNotes,
          signature,
        },
      }));
    }
  }, [
    appointment,
    complaints,
    otherComplaintList,
    duration,
    painScore,
    sleep,
    bowel,
    appetite,
    stress,
    exercise,
    smoking,
    alcohol,
    micturition,
    clinicalDiagnosis,
    treatmentPrinciple,
    sessions,
    otherSessions,
    frequency,
    homeCare,
    medHistory,
    otherMedHistoryList,
    currentMedicationsList,
    historyAllergiesList,
    bp,
    pulse,
    tenderness,
    rom,
    posture,
    specialFindings,
    nextAppt,
    feedback,
    additionalNotes,
    signature,
  ]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-medium">
          Loading consultation details...
        </div>
      </AppShell>
    );
  }

  if (!appointment && !isLoading) {
    redirect("/dashboard/doctor/appointments");
  }

  const pillClass = (active: boolean) =>
    cn(
      "px-3 py-1.5 rounded-xl text-xs select-none transition-all duration-150 cursor-pointer font-medium border",
      active
        ? "bg-(--color-synapse-light) text-white border-(--color-synapse-light) shadow-xs font-semibold scale-[1.01]"
        : "bg-slate-50 border-slate-200/90 text-slate-600 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900"
    );

  const inputClass =
    "w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100/60 transition-all text-slate-800 placeholder:text-slate-400";

  return (
    <AppShell>
      <div className="min-h-screen bg-linear-to-b from-slate-50/80 via-white to-slate-50/50 p-6 space-y-5">
        <div className="mx-auto space-y-5">
          {/* Header Component */}
          {appointment && (
            <Header
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              appointment={appointment}
              data={data}
              setData={setData as any}
            />
          )}

          {appointment?.patient?.allergies && (
            <AllergyAlert allergies={appointment.patient.allergies} />
          )}

          {activeTab === "consultation" && (
            <div className="mt-4">
              <Card className="p-6 border-slate-200/80 shadow-xs rounded-2xl bg-white">
                <div className="space-y-6">
                  {/* Direct 2-Column Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                    {/* 1. CHIEF COMPLAINTS */}
                    <Card className="shadow-xs border-slate-200/70 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                      <div>
                        <CardHeader className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/40 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-teal-100/70 text-teal-700 border border-teal-200/50">
                              <HeartPulse className="w-4 h-4" />
                            </div>
                            <CardTitle className="text-sm font-bold text-slate-800 tracking-tight">
                              Chief Complaints
                            </CardTitle>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-slate-700 transition-colors outline-none cursor-pointer">
                              <EllipsisVertical className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  className="text-xs cursor-pointer flex items-center gap-2"
                                  onClick={() => setIsEditingComplaints(!isEditingComplaints)}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  {isEditingComplaints ? "Done Editing" : "Edit Options"}
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                          <BubbleButtonGroup
                            options={complaintOptions}
                            setOptions={setComplaintOptions}
                            selectedValues={complaints}
                            setSelectedValues={setComplaints}
                            addButtonText="Add Complaint"
                            addPlaceholder="Add complaint..."
                            pillClass={pillClass}
                            isEditing={isEditingComplaints}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <MultiEntryInput
                                label="Other Complaints"
                                items={otherComplaintList}
                                setItems={setOtherComplaintList}
                                placeholder="Other complaints..."
                              />
                            <div>
                              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                Duration
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  list="duration-options-list"
                                  value={duration}
                                  onChange={(e) => setDuration(e.target.value)}
                                  placeholder="Type or select duration..."
                                  className={inputClass}
                                />
                                <datalist id="duration-options-list">
                                  <option value="1 Day" />
                                  <option value="3 Days" />
                                  <option value="1 Week" />
                                  <option value="2 Weeks" />
                                  <option value="1 Month" />
                                  <option value="3 Months" />
                                  <option value="6 Months" />
                                  <option value="1 Year" />
                                </datalist>
                              </div>
                            </div>
                          </div>

                          {/* Pain Score */}
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Pain Score (0–10)
                              </span>
                              <span className="text-xs font-bold text-emerald-800 px-2.5 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
                                {painScore !== null ? `${painScore} / 10` : "Not set"}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                                const active = painScore === num;
                                return (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => setPainScore(active ? null : num)}
                                    className={cn(
                                      "w-8 h-8 rounded-xl text-xs font-bold border select-none transition-all duration-150 cursor-pointer flex items-center justify-center",
                                      active
                                        ? "bg-(--color-synapse-light) text-white border-(--color-synapse-light) shadow-xs scale-105"
                                        : "bg-slate-50 border-slate-200/90 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    )}
                                  >
                                    {num}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>

                    {/* 2. MEDICAL HISTORY */}
                    <Card className="shadow-xs border-slate-200/70 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                      <div>
                        <CardHeader className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/40 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-amber-100/70 text-amber-700 border border-amber-200/50">
                              <UserCheck className="w-4 h-4" />
                            </div>
                            <CardTitle className="text-sm font-bold text-slate-800 tracking-tight">
                              Medical History & Conditions
                            </CardTitle>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-slate-700 transition-colors outline-none cursor-pointer">
                              <EllipsisVertical className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  className="text-xs cursor-pointer flex items-center gap-2"
                                  onClick={() => setIsEditingMedHistory(!isEditingMedHistory)}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  {isEditingMedHistory ? "Done Editing" : "Edit Options"}
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                          <BubbleButtonGroup
                            options={medHistoryOptions}
                            setOptions={setMedHistoryOptions}
                            selectedValues={medHistory}
                            setSelectedValues={setMedHistory}
                            addButtonText="Add Condition"
                            addPlaceholder="Add condition..."
                            pillClass={pillClass}
                            isEditing={isEditingMedHistory}
                          />

                          <MultiEntryInput
                            label="Other Conditions"
                            items={otherMedHistoryList}
                            setItems={setOtherMedHistoryList}
                            placeholder="Other condition..."
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <MultiEntryInput
                              label="Current Medications"
                              items={currentMedicationsList}
                              setItems={setCurrentMedicationsList}
                              placeholder="e.g. Tab Amlodipine 5mg OD"
                            />
                            <MultiEntryInput
                              label="Allergies"
                              items={historyAllergiesList}
                              setItems={setHistoryAllergiesList}
                              placeholder="e.g. Penicillin"
                            />
                          </div>
                        </CardContent>
                      </div>
                    </Card>

                    {/* 3. LIFESTYLE & HABITS */}
                    <Card className="shadow-xs border-slate-200/70 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                      <div>
                        <CardHeader className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/40 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-sky-100/70 text-sky-700 border border-sky-200/50">
                              <Activity className="w-4 h-4" />
                            </div>
                            <CardTitle className="text-sm font-bold text-slate-800 tracking-tight">
                              Lifestyle & Habits
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0 divide-y divide-slate-100/80">
                          {[
                            {
                              label: "Sleep",
                              icon: Moon,
                              iconColor: "text-indigo-500",
                              iconBg: "bg-indigo-50",
                              state: sleep,
                              setter: setSleep,
                              options: ["Good", "Fair", "Poor"],
                            },
                            {
                              label: "Bowel Habit",
                              icon: RefreshCw,
                              iconColor: "text-teal-600",
                              iconBg: "bg-teal-50",
                              state: bowel,
                              setter: setBowel,
                              options: ["Normal", "Irregular"],
                            },
                            {
                              label: "Appetite",
                              icon: Utensils,
                              iconColor: "text-amber-600",
                              iconBg: "bg-amber-50",
                              state: appetite,
                              setter: setAppetite,
                              options: ["Normal", "Low", "High"],
                            },
                            {
                              label: "Stress Level",
                              icon: Flame,
                              iconColor: "text-rose-500",
                              iconBg: "bg-rose-50",
                              state: stress,
                              setter: setStress,
                              options: ["Low", "Moderate", "High"],
                            },
                            {
                              label: "Exercise",
                              icon: Dumbbell,
                              iconColor: "text-emerald-600",
                              iconBg: "bg-emerald-50",
                              state: exercise,
                              setter: setExercise,
                              options: ["Regular", "Occasional", "None"],
                            },
                            {
                              label: "Smoking",
                              icon: Cigarette,
                              iconColor: "text-slate-600",
                              iconBg: "bg-slate-100",
                              state: smoking,
                              setter: setSmoking,
                              options: ["Yes", "No"],
                            },
                            {
                              label: "Alcohol",
                              icon: Wine,
                              iconColor: "text-purple-600",
                              iconBg: "bg-purple-50",
                              state: alcohol,
                              setter: setAlcohol,
                              options: ["Yes", "No"],
                            },
                            {
                              label: "Micturition",
                              icon: Droplets,
                              iconColor: "text-blue-500",
                              iconBg: "bg-blue-50",
                              state: micturition,
                              setter: setMicturition,
                              options: ["Normal", "Abnormal"],
                            },
                          ].map((row, idx) => (
                            <div
                              key={row.label}
                              className={cn(
                                "flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 transition-colors duration-150",
                                idx % 2 === 0 ? "bg-slate-50/70" : "bg-white"
                              )}
                            >
                              <div className="flex items-center gap-2.5 w-36 shrink-0">
                                <div className={cn("p-1.5 rounded-lg flex items-center justify-center shrink-0 border border-slate-200/50", row.iconBg)}>
                                  <row.icon className={cn("w-3.5 h-3.5", row.iconColor)} />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">
                                  {row.label}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {row.options.map((opt) => {
                                  const active = row.state === opt;
                                  return (
                                    <label
                                      key={opt}
                                      className={cn(
                                        "group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer select-none transition-all duration-200 border",
                                        active
                                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                                          : "bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40 hover:text-emerald-700"
                                      )}
                                    >
                                      <input
                                        type="radio"
                                        name={`lifestyle-${row.label}`}
                                        value={opt}
                                        checked={active}
                                        onChange={() => row.setter(active ? "" : opt)}
                                        className="sr-only"
                                      />
                                      <span
                                        className={cn(
                                          "flex items-center justify-center w-4 h-4 rounded-full border-2 transition-all duration-200 shrink-0",
                                          active
                                            ? "border-emerald-500 bg-emerald-500"
                                            : "border-slate-300 bg-white group-hover:border-emerald-300"
                                        )}
                                      >
                                        <span
                                          className={cn(
                                            "w-1.5 h-1.5 rounded-full bg-white transition-all duration-200",
                                            active ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                          )}
                                        />
                                      </span>
                                      {opt}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </div>
                    </Card>

                    {/* 4. EXAMINATION */}
                    <Card className="shadow-xs border-slate-200/70 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                      <div>
                        <CardHeader className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/40 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-rose-100/70 text-rose-700 border border-rose-200/50">
                              <Stethoscope className="w-4 h-4" />
                            </div>
                            <CardTitle className="text-sm font-bold text-slate-800 tracking-tight">
                              Examination & Vitals
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                BP (mmHg)
                              </label>
                              <input
                                type="text"
                                value={bp}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const oldVal = bp;
                                  let newVal = val;
                                  if (val.length > oldVal.length && !val.includes("/")) {
                                    if (/^[12]\d{2}$/.test(val)) {
                                      newVal = val + "/";
                                    } else if (/^[3-9]\d$/.test(val)) {
                                      newVal = val + "/";
                                    }
                                  }
                                  setBp(newVal);
                                }}
                                placeholder="120/80"
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                Pulse (bpm)
                              </label>
                              <input
                                type="text"
                                value={pulse}
                                onChange={(e) => setPulse(e.target.value)}
                                placeholder="74"
                                className={inputClass}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-3">
                            <span className="text-xs font-semibold text-slate-700 w-32 shrink-0">
                              Tenderness
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {["Mild", "Moderate", "Severe"].map((opt) => {
                                const active = tenderness === opt;
                                return (
                                  <label
                                    key={opt}
                                    className={cn(
                                      "group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer select-none transition-all duration-200 border",
                                      active
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                                        : "bg-white/80 border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40 hover:text-emerald-700"
                                    )}
                                  >
                                    <input
                                      type="radio"
                                      name="tenderness-radio"
                                      value={opt}
                                      checked={active}
                                      onChange={() => setTenderness(active ? "" : opt)}
                                      className="sr-only"
                                    />
                                    <span
                                      className={cn(
                                        "flex items-center justify-center w-4 h-4 rounded-full border-2 transition-all duration-200 shrink-0",
                                        active
                                          ? "border-emerald-500 bg-emerald-500"
                                          : "border-slate-300 bg-white group-hover:border-emerald-300"
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "w-1.5 h-1.5 rounded-full bg-white transition-all duration-200",
                                          active ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                        )}
                                      />
                                    </span>
                                    {opt}
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-3">
                            <span className="text-xs font-semibold text-slate-700 w-32 shrink-0">
                              Range of Motion
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {["Normal", "Restricted"].map((opt) => {
                                const active = rom === opt;
                                return (
                                  <label
                                    key={opt}
                                    className={cn(
                                      "group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer select-none transition-all duration-200 border",
                                      active
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                                        : "bg-white/80 border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40 hover:text-emerald-700"
                                    )}
                                  >
                                    <input
                                      type="radio"
                                      name="rom-radio"
                                      value={opt}
                                      checked={active}
                                      onChange={() => setRom(active ? "" : opt)}
                                      className="sr-only"
                                    />
                                    <span
                                      className={cn(
                                        "flex items-center justify-center w-4 h-4 rounded-full border-2 transition-all duration-200 shrink-0",
                                        active
                                          ? "border-emerald-500 bg-emerald-500"
                                          : "border-slate-300 bg-white group-hover:border-emerald-300"
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "w-1.5 h-1.5 rounded-full bg-white transition-all duration-200",
                                          active ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                        )}
                                      />
                                    </span>
                                    {opt}
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-3">
                            <span className="text-xs font-semibold text-slate-700 w-32 shrink-0">
                              Posture
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {["Normal", "Abnormal"].map((opt) => {
                                const active = posture === opt;
                                return (
                                  <label
                                    key={opt}
                                    className={cn(
                                      "group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer select-none transition-all duration-200 border",
                                      active
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                                        : "bg-white/80 border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40 hover:text-emerald-700"
                                    )}
                                  >
                                    <input
                                      type="radio"
                                      name="posture-radio"
                                      value={opt}
                                      checked={active}
                                      onChange={() => setPosture(active ? "" : opt)}
                                      className="sr-only"
                                    />
                                    <span
                                      className={cn(
                                        "flex items-center justify-center w-4 h-4 rounded-full border-2 transition-all duration-200 shrink-0",
                                        active
                                          ? "border-emerald-500 bg-emerald-500"
                                          : "border-slate-300 bg-white group-hover:border-emerald-300"
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "w-1.5 h-1.5 rounded-full bg-white transition-all duration-200",
                                          active ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                        )}
                                      />
                                    </span>
                                    {opt}
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="pt-1">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                              Special Findings / Clinical Notes
                            </label>
                            <textarea
                              rows={2}
                              value={specialFindings}
                              onChange={(e) => setSpecialFindings(e.target.value)}
                              placeholder="Clinical findings..."
                              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100/60 transition-all text-slate-800"
                            />
                          </div>
                        </CardContent>
                      </div>
                    </Card>

                    {/* 5. ACUPUNCTURE ASSESSMENT */}
                    <Card className="shadow-xs border-slate-200/70 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                      <div>
                        <CardHeader className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/40 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <CardTitle className="text-sm font-bold text-slate-800 tracking-tight">
                              Acupuncture Assessment
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                              Clinical Diagnosis
                            </label>
                            <input
                              type="text"
                              value={clinicalDiagnosis}
                              onChange={(e) => setClinicalDiagnosis(e.target.value)}
                              placeholder="e.g. Bih Syndrome (Joint Pain)"
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                              Treatment Principle
                            </label>
                            <input
                              type="text"
                              value={treatmentPrinciple}
                              onChange={(e) => setTreatmentPrinciple(e.target.value)}
                              placeholder="e.g. Unblock Channels & Dispel Wind-Cold-Dampness"
                              className={inputClass}
                            />
                          </div>
                        </CardContent>
                      </div>
                    </Card>

                    {/* 6. TREATMENT PLAN */}
                    <Card className="shadow-xs border-slate-200/70 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                      <div>
                        <CardHeader className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/40 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-indigo-100/70 text-indigo-700 border border-indigo-200/50">
                              <ClipboardList className="w-4 h-4" />
                            </div>
                            <CardTitle className="text-sm font-bold text-slate-800 tracking-tight">
                              Treatment Plan & Home Care
                            </CardTitle>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-slate-700 transition-colors outline-none cursor-pointer">
                              <EllipsisVertical className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  className="text-xs cursor-pointer flex items-center gap-2"
                                  onClick={() => setIsEditingHomeCare(!isEditingHomeCare)}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  {isEditingHomeCare ? "Done Editing" : "Edit Home Care Options"}
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              Recommended Sessions
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {["3", "5", "7", "10", "12"].map((opt) => {
                                const active = sessions === opt;
                                return (
                                  <label
                                    key={opt}
                                    className={cn(
                                      "group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer select-none transition-all duration-200 border",
                                      active
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                                        : "bg-white/80 border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40 hover:text-emerald-700"
                                    )}
                                  >
                                    <input
                                      type="radio"
                                      name="sessions-radio"
                                      value={opt}
                                      checked={active}
                                      onChange={() => setSessions(active ? "" : opt)}
                                      className="sr-only"
                                    />
                                    <span
                                      className={cn(
                                        "flex items-center justify-center w-4 h-4 rounded-full border-2 transition-all duration-200 shrink-0",
                                        active
                                          ? "border-emerald-500 bg-emerald-500"
                                          : "border-slate-300 bg-white group-hover:border-emerald-300"
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "w-1.5 h-1.5 rounded-full bg-white transition-all duration-200",
                                          active ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                        )}
                                      />
                                    </span>
                                    {opt}
                                  </label>
                                );
                              })}
                              <input
                                type="text"
                                placeholder="Other..."
                                value={otherSessions}
                                onChange={(e) => {
                                  setOtherSessions(e.target.value);
                                  setSessions("Other");
                                }}
                                className="w-24 text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-100"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              Frequency
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {["Daily", "Alternate Days", "Twice Weekly", "Weekly"].map(
                                (opt) => {
                                  const active = frequency === opt;
                                  return (
                                    <label
                                      key={opt}
                                      className={cn(
                                        "group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer select-none transition-all duration-200 border",
                                        active
                                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                                          : "bg-white/80 border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40 hover:text-emerald-700"
                                      )}
                                    >
                                      <input
                                        type="radio"
                                        name="frequency-radio"
                                        value={opt}
                                        checked={active}
                                        onChange={() => setFrequency(active ? "" : opt)}
                                        className="sr-only"
                                      />
                                      <span
                                        className={cn(
                                          "flex items-center justify-center w-4 h-4 rounded-full border-2 transition-all duration-200 shrink-0",
                                          active
                                            ? "border-emerald-500 bg-emerald-500"
                                            : "border-slate-300 bg-white group-hover:border-emerald-300"
                                        )}
                                      >
                                        <span
                                          className={cn(
                                            "w-1.5 h-1.5 rounded-full bg-white transition-all duration-200",
                                            active ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                          )}
                                        />
                                      </span>
                                      {opt}
                                    </label>
                                  );
                                }
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                              Home Care Advice
                            </span>
                            <BubbleButtonGroup
                              options={homeCareOptions}
                              setOptions={setHomeCareOptions}
                              selectedValues={homeCare}
                              setSelectedValues={setHomeCare}
                              addButtonText="Add Advice"
                              addPlaceholder="Add advice..."
                              pillClass={pillClass}
                              isEditing={isEditingHomeCare}
                            />
                          </div>
                        </CardContent>
                      </div>
                    </Card>

                    {/* 7. THERAPY */}
                    <TherapyCard
                      data={data}
                      setData={setData as any}
                      className="shadow-xs border-slate-200/70 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200"
                    />

                    {/* 8. PROCEDURE */}
                    <ProcedureCard
                      data={data}
                      setData={setData as any}
                      className="shadow-xs border-slate-200/70 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200"
                    />

                    {/* 9. LAB & IMAGING */}
                    <Test
                      data={data}
                      setData={setData as any}
                      setTestIsOK={setTestIsOK}
                      className="shadow-xs border-slate-200/70 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 mt-0"
                    />

                    {/* 10. FOLLOW-UP & NOTES */}
                    <Card className="shadow-xs border-slate-200/70 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                      <div>
                        <CardHeader className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/40 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-violet-100/70 text-violet-700 border border-violet-200/50">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <CardTitle className="text-sm font-bold text-slate-800 tracking-tight">
                              Follow-Up & Notes
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-36 shrink-0">
                              Next Appointment
                            </label>
                            <input
                              type="date"
                              value={nextAppt}
                              onChange={(e) => setNextAppt(e.target.value)}
                              className="text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-100 text-slate-800"
                            />
                          </div>

                          {isSecondVisitOnwards && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-100">
                              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                Patient Feedback
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { name: "Improved", emoji: "😃" },
                                  { name: "No Change", emoji: "😐" },
                                  { name: "Worse", emoji: "🙁" },
                                ].map((item) => {
                                  const active = feedback === item.name;
                                  return (
                                    <button
                                      key={item.name}
                                      type="button"
                                      onClick={() => setFeedback(active ? "" : item.name)}
                                      className={cn(
                                        "px-3 py-1.5 rounded-xl text-xs font-semibold border select-none transition-all duration-150 cursor-pointer flex items-center gap-1.5",
                                        active
                                          ? "bg-(--color-synapse-light) text-white border-(--color-synapse-light) shadow-xs"
                                          : "bg-slate-50 border-slate-200/90 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                      )}
                                    >
                                      <span>{item.emoji}</span>
                                      <span>{item.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="pt-1">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                              Additional Notes
                            </label>
                            <textarea
                              rows={2}
                              value={additionalNotes}
                              onChange={(e) => setAdditionalNotes(e.target.value)}
                              placeholder="Follow-up notes..."
                              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100/60 transition-all text-slate-800"
                            />
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </div>

                  {/* Action Buttons */}
                  <ActionButton data={data} testIsOK={testIsOK} />
                </div>
              </Card>
            </div>
          )}

          {activeTab === "history" && appointment?.patient?._id && (
            <History patientId={appointment.patient._id} />
          )}

          {activeTab === "report" && appointment?.patient?._id && (
            <Report patientId={appointment.patient._id} />
          )}

          <PrintConsultation appointment={appointment || null} data={data} />
        </div>
      </div>
    </AppShell>
  );
}

export default function ConsultingTwoPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-medium">
            Loading...
          </div>
        </AppShell>
      }
    >
      <ConsultingTwoContent />
    </Suspense>
  );
}
