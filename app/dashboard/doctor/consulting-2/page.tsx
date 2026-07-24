"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Header from "../consulting/Header";
import ActionButton from "../consulting/ActionButton";
import PrescriptionCard from "../consulting/PrescriptionCard";
import { AppointmentType, DataType } from "../consulting/interface";
import {
  Plus,
  Trash2,
} from "lucide-react";

// Dummy Appointment Data matching screenshot (Ihsan P, P8595450, Age 24y 4m, Male)
const DUMMY_APPOINTMENT: AppointmentType = {
  _id: "6a5ee5e3e7d8649ac2db87ce",
  patient: {
    _id: "6a5ee5e3e7d8649ac2db87ce",
    name: "Ihsan P",
    mrn: "P8595450",
    dateOfBirth: "2001-11-01T00:00:00.000Z",
    gender: "Male",
    phone: "+91 98765 43210",
    allergies: "",
  },
  doctor: {
    _id: "doc123",
    name: "Dr. Muhammed Rashid",
  },
} as any;

export default function ConsultingTwoPage() {
  const [activeTab, setActiveTab] = useState<"consultation" | "history" | "report">(
    "consultation"
  );

  const [data, setData] = useState<DataType>({
    patient: DUMMY_APPOINTMENT.patient._id,
    appointment: DUMMY_APPOINTMENT._id,
    consultationNotes: {
      presentHistory: null,
      pastHistory: "No records",
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
    treatment: null,
    medicines: [
      {
        dosage: "1 tab",
        name: "Tab Paracetamol 500mg",
        duration: "5 Days",
        food: "After Food",
        frequency: "1-0-1",
        quantity: 10,
        referralName: "",
      },
    ],
    advice: null,
    followUp: null,
    test: [],
  });

  // ---------- Interactive Assessment State ----------
  // 1. Chief Complaint
  const [complaints, setComplaints] = useState<string[]>(["Knee Pain", "Back Pain"]);
  const [otherComplaint, setOtherComplaint] = useState("");
  const [duration, setDuration] = useState("2 Weeks");
  const [painScore, setPainScore] = useState<number>(6);

  // 2. Lifestyle
  const [sleep, setSleep] = useState("Fair");
  const [bowel, setBowel] = useState("Normal");
  const [appetite, setAppetite] = useState("Normal");
  const [stress, setStress] = useState("Moderate");
  const [exercise, setExercise] = useState("Occasional");
  const [smoking, setSmoking] = useState("No");
  const [alcohol, setAlcohol] = useState("No");

  // 3. Acupuncture Assessment
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState("Bih Syndrome (Joint Pain)");
  const [treatmentPrinciple, setTreatmentPrinciple] = useState("Unblock Channels & Dispel Wind-Cold-Dampness");

  // 4. Treatment Plan
  const [sessions, setSessions] = useState("7");
  const [otherSessions, setOtherSessions] = useState("");
  const [frequency, setFrequency] = useState("Alternate Days");
  const [homeCare, setHomeCare] = useState<string[]>(["Hydration", "Stretching", "Rest"]);

  // 5. Medical History
  const [medHistory, setMedHistory] = useState<string[]>(["Hypertension"]);
  const [otherMedHistory, setOtherMedHistory] = useState("");
  const [currentMedications, setCurrentMedications] = useState("Tab Amlodipine 5mg OD");
  const [historyAllergies, setHistoryAllergies] = useState("Penicillin");

  // 6. Examination
  const [bp, setBp] = useState("120/80");
  const [pulse, setPulse] = useState("74");
  const [weight, setWeight] = useState("68");
  const [tenderness, setTenderness] = useState("Moderate");
  const [rom, setRom] = useState("Restricted");
  const [posture, setPosture] = useState("Normal");
  const [specialFindings, setSpecialFindings] = useState("Mild swelling around the knee joint");

  // 7. Treatment Given
  const [treatmentsGiven, setTreatmentsGiven] = useState<string[]>(["Acupuncture", "Cupping", "TENS"]);
  const [acuPoints, setAcuPoints] = useState("ST36, SP6, GB34, LI4");
  const [retentionTime, setRetentionTime] = useState("20");

  // 8. Follow-Up
  const [nextAppt, setNextAppt] = useState("2026-07-31");
  const [feedback, setFeedback] = useState("Improved");
  const [additionalNotes, setAdditionalNotes] = useState("Patient shows good progress after 1st session.");
  const [signature, setSignature] = useState("Dr. Muhammed Rashid");

  // Prescribed Medicines
  const [medicines, setMedicines] = useState([
    { id: 1, name: "Tab Paracetamol 500mg", dosage: "1 tab", frequency: "1-0-1", food: "After Food", duration: "5 Days", qty: 10 },
    { id: 2, name: "Cap Omeprazole 20mg", dosage: "1 cap", frequency: "1-0-0", food: "Before Food", duration: "7 Days", qty: 7 },
  ]);

  const toggleArrayItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 p-6 space-y-5">
        <div className="mx-auto space-y-5">

          {/* EXACT Header Component from Header.tsx (DoctorHeader, VitalsCard, Export, Import, Tabs) */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            appointment={DUMMY_APPOINTMENT}
            data={data}
            setData={setData}
          />

          {activeTab === "consultation" && (
            <div className="mt-4">
              <Card className="p-6">
                <div className="space-y-6">

                  {/* 2-Column Grid matching ConsultationAndExaminationNotes.tsx spacing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                    {/* LEFT COLUMN */}
                    <div className="space-y-6">

                      {/* 1. CHIEF COMPLAINT */}
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-base font-semibold text-slate-800">
                            Chief Complaint
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Neck Pain", "Back Pain", "Shoulder Pain", "Knee Pain",
                              "Sciatica", "Headache / Migraine", "Frozen Shoulder", "Tennis Elbow",
                              "Arthritis", "Cervical Spondylosis", "Lumbar Spondylosis", "Stress / Anxiety",
                              "Insomnia", "Digestive Issues",
                            ].map((item) => {
                              const active = complaints.includes(item);
                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => toggleArrayItem(complaints, setComplaints, item)}
                                  className={cn(
                                    "px-3 py-1 rounded-full text-xs border select-none transition cursor-pointer",
                                    active
                                      ? "bg-emerald-100 border-emerald-300 text-emerald-700 shadow-xs font-medium"
                                      : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                  )}
                                >
                                  {item}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-xs font-medium text-slate-700 w-24 shrink-0">Other:</span>
                            <input
                              type="text"
                              value={otherComplaint}
                              onChange={(e) => setOtherComplaint(e.target.value)}
                              placeholder="Other complaint..."
                              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-700 w-24 shrink-0">Duration:</span>
                            <input
                              type="text"
                              value={duration}
                              onChange={(e) => setDuration(e.target.value)}
                              placeholder="e.g. 2 weeks"
                              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </div>

                          {/* Pain Score */}
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                              <span>Pain Score (0–10):</span>
                              <span className="text-emerald-700 font-semibold px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                                {painScore} / 10
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                                const active = painScore === num;
                                return (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => setPainScore(num)}
                                    className={cn(
                                      "w-7 h-7 rounded-full text-xs font-medium border select-none transition cursor-pointer",
                                      active
                                        ? "bg-emerald-600 text-white border-emerald-700 shadow-xs font-semibold"
                                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                    )}
                                  >
                                    {num}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 2. LIFESTYLE */}
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-base font-semibold text-slate-800">
                            Lifestyle
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-2">
                          {[
                            { label: "Sleep", state: sleep, setter: setSleep, options: ["Good", "Fair", "Poor"] },
                            { label: "Bowel Habit", state: bowel, setter: setBowel, options: ["Normal", "Irregular"] },
                            { label: "Appetite", state: appetite, setter: setAppetite, options: ["Normal", "Low", "High"] },
                            { label: "Stress Level", state: stress, setter: setStress, options: ["Low", "Moderate", "High"] },
                            { label: "Exercise", state: exercise, setter: setExercise, options: ["Regular", "Occasional", "None"] },
                            { label: "Smoking", state: smoking, setter: setSmoking, options: ["Yes", "No"] },
                            { label: "Alcohol", state: alcohol, setter: setAlcohol, options: ["Yes", "No"] },
                          ].map((row) => (
                            <div key={row.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="text-xs font-medium text-slate-700 w-32 shrink-0">{row.label}:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {row.options.map((opt) => {
                                  const active = row.state === opt;
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => row.setter(opt)}
                                      className={cn(
                                        "px-3 py-1 rounded-full text-xs border select-none transition cursor-pointer",
                                        active
                                          ? "bg-emerald-100 border-emerald-300 text-emerald-700 shadow-xs font-medium"
                                          : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                      )}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* 3. ACUPUNCTURE ASSESSMENT */}
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-base font-semibold text-slate-800">
                            Acupuncture Assessment
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                          <div>
                            <label className="text-xs font-medium text-slate-700 block mb-1">Clinical Diagnosis:</label>
                            <input
                              type="text"
                              value={clinicalDiagnosis}
                              onChange={(e) => setClinicalDiagnosis(e.target.value)}
                              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-700 block mb-1">Treatment Principle:</label>
                            <input
                              type="text"
                              value={treatmentPrinciple}
                              onChange={(e) => setTreatmentPrinciple(e.target.value)}
                              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* 4. TREATMENT PLAN */}
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-base font-semibold text-slate-800">
                            Treatment Plan
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                          <div className="space-y-1.5">
                            <span className="text-xs font-medium text-slate-700 block">Recommended Sessions:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {["3", "5", "7", "10", "12"].map((opt) => {
                                const active = sessions === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setSessions(opt)}
                                    className={cn(
                                      "px-3 py-1 rounded-full text-xs border select-none transition cursor-pointer",
                                      active
                                        ? "bg-emerald-100 border-emerald-300 text-emerald-700 shadow-xs font-medium"
                                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                    )}
                                  >
                                    {opt}
                                  </button>
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
                                className="w-20 text-xs border border-slate-200 rounded-full px-2.5 py-1 outline-none focus:ring-2 focus:ring-emerald-200"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-medium text-slate-700 block">Frequency:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {["Daily", "Alternate Days", "Twice Weekly", "Weekly"].map((opt) => {
                                const active = frequency === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setFrequency(opt)}
                                    className={cn(
                                      "px-3 py-1 rounded-full text-xs border select-none transition cursor-pointer",
                                      active
                                        ? "bg-emerald-100 border-emerald-300 text-emerald-700 shadow-xs font-medium"
                                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                    )}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-medium text-slate-700 block">Home Care Advice:</span>
                            <div className="flex flex-wrap gap-2">
                              {[
                                "Hydration", "Stretching", "Rest", "Heat Therapy",
                                "Exercise", "Posture Correction", "Diet Advice", "Other"
                              ].map((name) => {
                                const active = homeCare.includes(name);
                                return (
                                  <button
                                    key={name}
                                    type="button"
                                    onClick={() => toggleArrayItem(homeCare, setHomeCare, name)}
                                    className={cn(
                                      "px-3 py-1 rounded-full text-xs border select-none transition cursor-pointer",
                                      active
                                        ? "bg-emerald-100 border-emerald-300 text-emerald-700 shadow-xs font-medium"
                                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                    )}
                                  >
                                    {name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">

                      {/* 5. MEDICAL HISTORY */}
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-base font-semibold text-slate-800">
                            Medical History
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Diabetes", "Hypertension", "Thyroid Disorder", "Heart Disease",
                              "Asthma", "Stroke", "Epilepsy", "Cancer",
                              "Pregnancy", "Recent Surgery", "Pacemaker", "Bleeding Disorder",
                            ].map((item) => {
                              const active = medHistory.includes(item);
                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => toggleArrayItem(medHistory, setMedHistory, item)}
                                  className={cn(
                                    "px-3 py-1 rounded-full text-xs border select-none transition cursor-pointer",
                                    active
                                      ? "bg-emerald-100 border-emerald-300 text-emerald-700 shadow-xs font-medium"
                                      : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                  )}
                                >
                                  {item}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-xs font-medium text-slate-700 w-24 shrink-0">Other:</span>
                            <input
                              type="text"
                              value={otherMedHistory}
                              onChange={(e) => setOtherMedHistory(e.target.value)}
                              placeholder="Other condition..."
                              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-medium text-slate-700 block mb-1">Current Medications:</label>
                            <input
                              type="text"
                              value={currentMedications}
                              onChange={(e) => setCurrentMedications(e.target.value)}
                              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-medium text-slate-700 block mb-1">Allergies:</label>
                            <input
                              type="text"
                              value={historyAllergies}
                              onChange={(e) => setHistoryAllergies(e.target.value)}
                              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* 6. EXAMINATION */}
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-base font-semibold text-slate-800">
                            Examination
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs font-medium text-slate-700 block mb-1">BP (mmHg):</label>
                              <input
                                type="text"
                                value={bp}
                                onChange={(e) => setBp(e.target.value)}
                                placeholder="120/80"
                                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-200"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-700 block mb-1">Pulse (bpm):</label>
                              <input
                                type="text"
                                value={pulse}
                                onChange={(e) => setPulse(e.target.value)}
                                placeholder="74"
                                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-200"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-700 block mb-1">Weight (kg):</label>
                              <input
                                type="text"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="68"
                                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-200"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <span className="text-xs font-medium text-slate-700 w-32 shrink-0">Tenderness:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {["Mild", "Moderate", "Severe"].map((opt) => {
                                const active = tenderness === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setTenderness(opt)}
                                    className={cn(
                                      "px-3 py-1 rounded-full text-xs border select-none transition cursor-pointer",
                                      active
                                        ? "bg-emerald-100 border-emerald-300 text-emerald-700 shadow-xs font-medium"
                                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                    )}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <span className="text-xs font-medium text-slate-700 w-32 shrink-0">Range of Motion:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {["Normal", "Restricted"].map((opt) => {
                                const active = rom === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setRom(opt)}
                                    className={cn(
                                      "px-3 py-1 rounded-full text-xs border select-none transition cursor-pointer",
                                      active
                                        ? "bg-emerald-100 border-emerald-300 text-emerald-700 shadow-xs font-medium"
                                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                    )}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <span className="text-xs font-medium text-slate-700 w-32 shrink-0">Posture:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {["Normal", "Abnormal"].map((opt) => {
                                const active = posture === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setPosture(opt)}
                                    className={cn(
                                      "px-3 py-1 rounded-full text-xs border select-none transition cursor-pointer",
                                      active
                                        ? "bg-emerald-100 border-emerald-300 text-emerald-700 shadow-xs font-medium"
                                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                    )}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-slate-700 block mb-1">Special Findings / Clinical Notes:</label>
                            <textarea
                              rows={3}
                              value={specialFindings}
                              onChange={(e) => setSpecialFindings(e.target.value)}
                              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* 7. TREATMENT GIVEN */}
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-base font-semibold text-slate-800">
                            Treatment Given
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Acupuncture", "Electroacupuncture", "Cupping", "Hijama",
                              "Cauterization", "Venesection", "Moxibustion", "Gua Sha",
                              "TENS", "Dry Needling", "Auricular Acupuncture",
                            ].map((item) => {
                              const active = treatmentsGiven.includes(item);
                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => toggleArrayItem(treatmentsGiven, setTreatmentsGiven, item)}
                                  className={cn(
                                    "px-3 py-1 rounded-full text-xs border select-none transition cursor-pointer",
                                    active
                                      ? "bg-emerald-100 border-emerald-300 text-emerald-700 shadow-xs font-medium"
                                      : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                  )}
                                >
                                  {item}
                                </button>
                              );
                            })}
                          </div>

                          <div>
                            <label className="text-xs font-medium text-slate-700 block mb-1">Acupuncture Points Used:</label>
                            <input
                              type="text"
                              value={acuPoints}
                              onChange={(e) => setAcuPoints(e.target.value)}
                              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-700 shrink-0">Needle Retention Time:</span>
                            <input
                              type="text"
                              value={retentionTime}
                              onChange={(e) => setRetentionTime(e.target.value)}
                              className="w-20 text-xs border border-slate-200 rounded-lg px-2.5 py-1 text-center outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                            <span className="text-xs text-slate-500">minutes</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 8. FOLLOW-UP */}
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-base font-semibold text-slate-800">
                            Follow-Up
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-700 shrink-0">Next Appointment:</span>
                            <input
                              type="date"
                              value={nextAppt}
                              onChange={(e) => setNextAppt(e.target.value)}
                              className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-medium text-slate-700 block">Patient Feedback:</span>
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
                                    onClick={() => setFeedback(item.name)}
                                    className={cn(
                                      "px-3 py-1.5 rounded-full text-xs font-medium border select-none transition cursor-pointer flex items-center gap-1.5",
                                      active
                                        ? "bg-emerald-100 border-emerald-300 text-emerald-700 shadow-xs font-semibold"
                                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                    )}
                                  >
                                    <span>{item.emoji}</span>
                                    <span>{item.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-slate-700 block mb-1">Additional Notes:</label>
                            <textarea
                              rows={2}
                              value={additionalNotes}
                              onChange={(e) => setAdditionalNotes(e.target.value)}
                              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-medium text-slate-700 block mb-1">Practitioner's Signature:</label>
                            <input
                              type="text"
                              value={signature}
                              onChange={(e) => setSignature(e.target.value)}
                              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-200 font-semibold text-slate-800"
                            />
                          </div>
                        </CardContent>
                      </Card>

                    </div>
                  </div>

                  {/* EXACT PrescriptionCard Component (SL NO, DRUG, DOSAGE, FREQUENCY, FOOD, DURATION, QUANTITY, ACTIONS, Favorites & Templates) */}
                  {/* <PrescriptionCard
                    data={data}
                    setData={setData}
                    appointmentData={{ message: "Success", data: DUMMY_APPOINTMENT }}
                  /> */}

                  {/* EXACT Action Buttons from ActionButton.tsx (Print, Send for Test, Observation, Admit, Complete) */}
                  <ActionButton data={data} testIsOK={true} />

                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}
