"use client";

import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  FileText,
  Search,
  AlertTriangle,
  CalendarClock,
  Building2,
  ChevronRight,
  CheckCircle2,
  TestTubeDiagonal,
  FlaskConical,
  ImageIcon,
  Stethoscope,
  ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/layout/app-shell";
import ConsultationAndExaminationNotes from "./ConsultationAndExaminationNotes";
import { ToggleChip } from "./ToggleChip";
import PrescriptionsCard from "./PrescriptionsCard";

// ========================
// Types
// ========================
export type RxRow = {
  drug: string;
  dosage: string;
  freq: string;
  duration: string;
  notes: string;
};
export type Consult = {
  id: string;
  date: string;
  patientId: string;
  patientName: string;
  complaints: string[];
  diagnosis?: string;
  prescriptions: RxRow[];
  advice?: string;
};

export type Lab = {
  id: string;
  name: string;
  inhouse: boolean;
  slots: string[];
};

// ========================
// Mock Data (History + Labs)
// ========================
const HISTORY: Consult[] = [
  {
    id: "C-1008",
    date: "2025-09-03",
    patientId: "P-001",
    patientName: "Ravi Kumar",
    complaints: ["Fever", "Headache"],
    diagnosis: "Viral fever",
    prescriptions: [
      {
        drug: "Paracetamol 650mg",
        dosage: "1 tab",
        freq: "1-1-1",
        duration: "5",
        notes: "After food",
      },
      {
        drug: "Pantoprazole 40mg",
        dosage: "1 tab",
        freq: "0-1-0",
        duration: "5",
        notes: "Morning",
      },
    ],
    advice: "Hydration, rest",
  },
];

const LABS: Lab[] = [
  {
    id: "lab1",
    name: "In‑House Diagnostics",
    inhouse: true,
    slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  },
  {
    id: "lab3",
    name: "Hospital Imaging Center",
    inhouse: true,
    slots: ["14:00", "14:30", "15:00", "15:30", "16:00"],
  },
  {
    id: "lab2",
    name: "Metro Diagnostics",
    inhouse: false,
    slots: ["11:00", "11:30", "12:00", "12:30", "13:00"],
  },
];

function getAvailableSlots(labId: string | null): string[] {
  if (!labId) return [];
  const lab = LABS.find((l) => l.id === labId);
  return lab ? lab.slots : [];
}

function to12h(time24: string): string {
  // expects HH:MM
  const [h, m] = time24.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = ((h + 11) % 12) + 1; // 0->12, 13->1 etc
  return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function genHalfHourTimes(start = 8, end = 20): string[] {
  const out: string[] = [];
  for (let hr = start; hr <= end; hr++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = hr.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      out.push(`${hh}:${mm}`);
    }
  }
  return out;
}

// Simple confetti burst (no external lib)
function ConfettiBurst({
  show,
  onDone,
}: {
  show: boolean;
  onDone?: () => void;
}) {
  const pieces = new Array(22).fill(0).map((_, i) => i);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => onDone && onDone()}
        >
          {pieces.map((i) => {
            const left = Math.random() * 100; // vw
            const delay = Math.random() * 0.15;
            const rotate = Math.random() * 360;
            return (
              <motion.span
                key={i}
                className="absolute block w-2 h-2 rounded-[2px] bg-emerald-400"
                style={{ left: `${left}vw`, top: `40vh` }}
                initial={{ y: 0, scale: 0.9, rotate }}
                animate={{
                  y: [0, -80, 140],
                  x: [0, 20, -10],
                  opacity: [1, 0.9, 0],
                  scale: [1, 0.9, 1],
                }}
                transition={{ duration: 1.2, delay, ease: "easeOut" }}
              />
            );
          })}
          <motion.div
            className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 bg-white shadow-xl rounded-2xl px-5 py-4 flex items-center gap-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span className="text-slate-800 font-medium">Success</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ========================
// Component
// ========================
export default function ConsultingMenu() {
  // ---- Mock current patient ----
  const patient = {
    id: "P-001",
    name: "Ravi Kumar",
    age: 34,
    gender: "Male",
    allergies: ["Penicillin", "Ibuprofen"],
  } as const;

  // ---- State ----
  // const [notes, setNotes] = useState("Chief Complaints : \n\n\nHistory : \n\n");
  // const [examination, setExamination] = useState(
  //   `HR      : \nBP      : \nSpO2 : \nTemp : \n\n\nRS    : \nCVS : \nP/A  : \nCNS :  \n`
  // );
  // const [diagnosis, setDiagnosis] = useState("");
  const [advice, setAdvice] = useState("");
  const [qHist, setQHist] = useState("");

  

  // ---- Booking state ----
  const [orderOpen, setOrderOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState<string>("");
  const [seletedTest, setSeletedTest] = useState<string[]>([]);
  const [orderDay, setOrderDay] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState<string>("");
  const [priority, setPriority] = useState<"STAT" | "High" | "Normal">("STAT");
  const [booked, setBooked] = useState<
    { labId: string; date: Date; slot: string; priority: string }[]
  >([]);
  const [showBookCelebrate, setShowBookCelebrate] = useState(false);

  // ---- Follow-up state (calendar + 12h chips) ----
  const [followDay, setFollowDay] = useState<Date | undefined>(undefined);
  const followTimes = useMemo(() => genHalfHourTimes(8, 20), []);
  const [followTime, setFollowTime] = useState<string>("");
  const [showConsultCelebrate, setShowConsultCelebrate] = useState(false);

  // Sort labs with in-house first (then A→Z)
  const sortedLabs = useMemo(() => {
    return [...LABS].sort(
      (a, b) =>
        Number(b.inhouse) - Number(a.inhouse) || a.name.localeCompare(b.name)
    );
  }, []);

  // Auto-select first in-house lab when opening booking (if none selected)
  useEffect(() => {
    if (orderOpen && !selectedLab && sortedLabs.length) {
      const firstInhouse = sortedLabs.find((l) => l.inhouse) || sortedLabs[0];
      setSelectedLab(firstInhouse.id);
    }
  }, [orderOpen, selectedLab, sortedLabs]);

  // const quickSymptoms = ["Fever", "Headache", "Cough"];


  // ---- History filter ----
  const filteredHistory = useMemo(() => {
    return HISTORY.filter((h) => {
      const matchesQ = qHist
        ? [
            h.id,
            h.patientName,
            h.diagnosis || "",
            ...h.complaints,
            ...h.prescriptions.map((p) => p.drug),
          ]
            .join(" ")
            .toLowerCase()
            .includes(qHist.toLowerCase())
        : true;
      return matchesQ;
    });
  }, [qHist]);

  // ---- Allergy helpers ----


  // ---- Actions ----
  const handleBook = () => {
    if (!selectedLab || !orderDay || !slot) return;
    setBooked((b) => [
      ...b,
      { labId: selectedLab, date: orderDay, slot, priority },
    ]);
    setShowBookCelebrate(true);
    setTimeout(() => setShowBookCelebrate(false), 1500);
  };

  const handleComplete = () => {
    setShowConsultCelebrate(true);
    setTimeout(() => setShowConsultCelebrate(false), 1700);
  };

  // ========================
  // Render
  // ========================

  const [activeTab, setActiveTab] = useState<"consultation" | "history">(
    "consultation"
  );

  const [reviewed, setReviewed] = useState(false)
  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="mx-auto p-5">
          <div className="flex justify-between mb-4">
            <div>
              <h2 className="font-semibold">
                {patient.name}{" "}
                <span className="text-slate-400">(ID: {patient.id})</span>
              </h2>
              <p className="text-xs text-slate-500">
                Age {patient.age}, {patient.gender} • Allergies:{" "}
                {patient.allergies.join(", ")}
              </p>
            </div>
            <div className="inline-flex rounded-2xl bg-slate-100 p-1 shadow-inner">
              {" "}
              <ToggleChip
                active={activeTab === "consultation"}
                onClick={() => setActiveTab("consultation")}
                icon={<Stethoscope className="h-4 w-4" />}
                activeClass="bg-green-600 text-white"
              >
                {" "}
                Consultation{" "}
              </ToggleChip>{" "}
              <ToggleChip
                active={activeTab === "history"}
                onClick={() => setActiveTab("history")}
                icon={<ClipboardList className="h-4 w-4" />}
                activeClass="bg-blue-600 text-white"
              >
                {" "}
                History{" "}
              </ToggleChip>{" "}
            </div>
          </div>

          <div
            className={
              "relative overflow-hidden rounded-2xl border shadow-lg" +
              (reviewed
                ? "border-red-200 bg-gradient-to-r from-red-50 to-white"
                : "border-red-200 bg-gradient-to-r from-red-600 to-red-500 text-white")
            }
          >
            {" "}
            <div
              className={
                "flex items-center justify-between gap-3 p-4 " +
                (reviewed ? "text-red-700" : "")
              }
            >
              {" "}
              <div className="flex items-center gap-3">
                {" "}
                <span
                  className={
                    "grid h-8 w-8 place-items-center rounded-full " +
                    (reviewed ? "bg-red-100 text-red-600" : "bg-white/20")
                  }
                >
                  {" "}
                  <AlertTriangle className="h-5 w-5" />{" "}
                </span>{" "}
                <div>
                  {" "}
                  <p
                    className={
                      "font-semibold text-base " +
                      (reviewed ? "" : "drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]")
                    }
                  >
                    Allergy Alert
                  </p>{" "}
                  <p
                    className={
                      "text-sm " +
                      (reviewed ? "text-red-700/80" : "text-white/90")
                    }
                  >
                    Allergies: Penicillin, Ibuprofen
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex items-center gap-2">
                {" "}
                {!reviewed ? (
                  <Button
                    onClick={() => setReviewed(true)}
                    className="bg-white text-red-600 hover:bg-slate-50 rounded-xl"
                  >
                    {" "}
                    Mark Reviewed{" "}
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                    {" "}
                    <CheckCircle2 className="h-4 w-4" /> Reviewed{" "}
                  </span>
                )}{" "}
              </div>{" "}
            </div>{" "}
          
          </div>

          {/* =================== CONSULT TAB =================== */}
          {activeTab === "consultation" && (
            <div className="mt-4">
              <Card className="p-6">
               

               
                {/* <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex justify-between">
                      <Label>Consultation Notes</Label>

                      <div className="flex gap-1 mt-2">
                        {quickSymptoms.map((s) => (
                          <Button
                            size="sm"
                            key={s}
                            variant="outline"
                            onClick={() =>
                              setNotes((n) => (n ? n + "; " + s : s))
                            }
                          >
                            {s}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-2"
                    />

                    <Label>Diagnosis</Label>
                    <Input
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="mt-2 h-12"
                    />
                  </div>
                  <div className="space-y-6">
                    <Label>Examination Note</Label>

                    <Textarea
                      value={examination}
                      onChange={(e) => setExamination(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div> */}

                <ConsultationAndExaminationNotes />

                <Separator className="my-4" />
              <PrescriptionsCard />
                <Separator className="my-6" />

                {/* Booking */}
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4" /> Lab / Imaging Booking
                  </Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOrderOpen((o) => !o)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {orderOpen ? "Hide" : "Book"}
                  </Button>
                </div>

                <AnimatePresence initial={false}>
                  {orderOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-3 rounded-xl border bg-slate-50"
                    >
                      {/* Compact two-column layout */}
                      <div className="grid md:grid-cols-8 gap-0">
                        {/* Left: Labs list (dense) */}
                        <div className="md:col-span-2 border-r p-3 md:max-h-[420px] md:overflow-y-auto">
                          <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
                            Select Test
                          </div>

                          <div className="flex gap-2.5">
                            <Tabs defaultValue="lab" className="space-y-3">
                              <TabsList className="grid grid-cols-2">
                                <TabsTrigger
                                  value="lab"
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <FlaskConical className="h-4 w-4" />
                                  Lab
                                </TabsTrigger>
                                <TabsTrigger
                                  value="image"
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <ImageIcon className="h-4 w-4" />
                                  Image
                                </TabsTrigger>
                              </TabsList>
                            </Tabs>
                            <div className="relative mb-3">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Search tests..."
                                className="pl-9"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            {[
                              { id: "123", name: "CBC", type: "lab" },
                              { id: "124", name: "TC", type: "lab" },
                              { id: "125", name: "DC", type: "lab" },
                              { id: "126", name: "TSH" },
                              { id: "123", name: "UV", type: "Image" },
                              { id: "124", name: "Radio", type: "Image" },
                              { id: "125", name: "X Ray", type: "Image" },
                            ].map((l) => (
                              <Button
                                key={l.id}
                                size="sm"
                                variant={
                                  selectedLab === l.id ? "default" : "outline"
                                }
                                onClick={() => {
                                  setSeletedTest((prev) => {
                                    const newArray = [...prev, l.id];
                                    return newArray;
                                  });
                                  setSlot("");
                                }}
                                className={`w-full justify-between ${
                                  seletedTest.find((e) => e === l.id)
                                    ? "bg-slate-900 hover:bg-slate-900 text-white"
                                    : ""
                                }`}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <TestTubeDiagonal className="w-4 h-4" />
                                  {l.name}
                                </span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="md:col-span-2 border-r p-3 md:max-h-[420px] md:overflow-y-auto">
                          <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
                            Select Lab
                          </div>
                          <div className="space-y-2">
                            {sortedLabs.map((l) => (
                              <Button
                                key={l.id}
                                size="sm"
                                variant={
                                  selectedLab === l.id ? "default" : "outline"
                                }
                                onClick={() => {
                                  setSelectedLab(l.id);
                                  setSlot("");
                                }}
                                className={`w-full justify-between ${
                                  selectedLab === l.id
                                    ? "bg-slate-900 hover:bg-slate-900"
                                    : ""
                                }`}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <Building2 className="w-4 h-4" />
                                  {l.name}
                                </span>
                                {l.inhouse ? (
                                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                    In‑house
                                  </Badge>
                                ) : (
                                  <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                                    External
                                  </Badge>
                                )}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Right: Calendar + slots + priority */}
                        <div className="md:col-span-4 p-3">
                          <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-2">
                            <CalendarClock className="w-4 h-4" /> Select date &
                            time
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Card className="p-2">
                              <Calendar
                                mode="single"
                                selected={orderDay}
                                onSelect={(d) => {
                                  setOrderDay(d);
                                  setSlot("");
                                }}
                                className="rounded-md"
                              />
                            </Card>
                            <Card className="p-3 flex flex-col">
                              <div className="text-xs text-slate-500 mb-2">
                                Available Slots
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {getAvailableSlots(selectedLab).map((s) => (
                                  <motion.div
                                    key={s}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      size="sm"
                                      variant={
                                        slot === s ? "default" : "outline"
                                      }
                                      onClick={() => setSlot(s)}
                                      disabled={!orderDay}
                                    >
                                      {to12h(s)}
                                    </Button>
                                  </motion.div>
                                ))}
                                {getAvailableSlots(selectedLab).length ===
                                  0 && (
                                  <div className="text-xs text-slate-400 col-span-3">
                                    Select a lab to view slots.
                                  </div>
                                )}
                              </div>
                              <div className="mt-3 flex items-center gap-2">
                                <span className="text-xs text-slate-500">
                                  Priority:
                                </span>
                                {(["STAT", "High", "Normal"] as const).map(
                                  (p) => (
                                    <Badge
                                      key={p}
                                      onClick={() => setPriority(p)}
                                      className={`cursor-pointer border ${
                                        p === priority
                                          ? "ring-2 ring-emerald-400"
                                          : ""
                                      } ${
                                        p === "STAT"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : p === "High"
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : "bg-slate-100 text-slate-700 border"
                                      }`}
                                    >
                                      {p}
                                    </Badge>
                                  )
                                )}
                              </div>
                              <div className="mt-auto flex justify-end gap-2 pt-3">
                                <motion.div whileTap={{ scale: 0.97 }}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={!orderDay || !slot}
                                    onClick={handleBook}
                                  >
                                    Add to Order
                                  </Button>
                                </motion.div>
                                <motion.div whileTap={{ scale: 0.97 }}>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    disabled={!orderDay || !slot}
                                    onClick={handleBook}
                                  >
                                    Book Slot
                                  </Button>
                                </motion.div>
                              </div>
                            </Card>
                          </div>

                          {/* Summary */}
                          <div className="mt-3 flex items-center text-sm text-slate-700">
                            <ChevronRight className="w-4 h-4 text-slate-400 mr-1" />
                            <span className="font-medium mr-2">
                              {sortedLabs.find((l) => l.id === selectedLab)
                                ?.name || "No lab selected"}
                            </span>
                            {orderDay && (
                              <Badge
                                variant="secondary"
                                className="bg-slate-100 text-slate-700 border mr-1"
                              >
                                {orderDay.toDateString()}
                              </Badge>
                            )}
                            {slot && (
                              <Badge
                                variant="secondary"
                                className="bg-slate-100 text-slate-700 border mr-1"
                              >
                                {to12h(slot)}
                              </Badge>
                            )}
                            <Badge
                              variant="secondary"
                              className="bg-indigo-50 text-indigo-700 border-indigo-200"
                            >
                              {priority}
                            </Badge>
                          </div>

                          {/* Booked orders list */}
                          <AnimatePresence>
                            {booked.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                className="mt-3"
                              >
                                <div className="text-xs text-slate-500 mb-1">
                                  Booked
                                </div>
                                <div className="space-y-2">
                                  {booked.map((b, idx) => {
                                    const lab = sortedLabs.find(
                                      (l) => l.id === b.labId
                                    );
                                    return (
                                      <Card
                                        key={`${b.labId}-${idx}`}
                                        className="p-2 flex items-center justify-between"
                                      >
                                        <div className="flex items-center gap-2">
                                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                          <span className="text-sm">
                                            {lab?.name}
                                          </span>
                                        </div>
                                        <div className="text-xs text-slate-600">
                                          {b.date.toDateString()} •{" "}
                                          {to12h(b.slot)} • {b.priority}
                                        </div>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Follow-up with calendar + 12h chips */}
                <Separator className="my-6" />
                <Label className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4" /> Advice & Follow-up
                </Label>
                <Textarea
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  className="mt-2"
                />
                <div className="grid sm:grid-cols-4 gap-3 mt-3">
                  <Card className="p-2 sm:col-span-2">
                    <Calendar
                      mode="single"
                      selected={followDay}
                      onSelect={setFollowDay}
                      className="rounded-md"
                    />
                  </Card>
                  <Card className="p-3 sm:col-span-2">
                    <div className="text-xs text-slate-500 mb-2">
                      Follow‑up Time
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-56 overflow-auto pr-1">
                      {followTimes.map((t) => (
                        <Button
                          key={t}
                          size="sm"
                          variant={followTime === t ? "default" : "outline"}
                          onClick={() => setFollowTime(t)}
                        >
                          {to12h(t)}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-slate-600">
                      {followDay && followTime ? (
                        <span>
                          Selected: <strong>{followDay.toDateString()}</strong>{" "}
                          at <strong>{to12h(followTime)}</strong>
                        </span>
                      ) : (
                        <span>Select a date and time</span>
                      )}
                    </div>
                  </Card>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline">Save Draft</Button>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-1" /> Print
                  </Button>
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleComplete}
                    >
                      Complete Consultation
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </div>
          )}

          {/* =================== HISTORY TAB =================== */}
          {activeTab === "history" && (
            <div className="mt-4">
              <Card className="p-6">
                <div className="flex gap-2 mb-4 items-center">
                  <Search className="w-4 h-4 text-slate-400" />
                  <Input
                    value={qHist}
                    onChange={(e) => setQHist(e.target.value)}
                    placeholder="Search history..."
                  />
                </div>
                {filteredHistory.map((h) => (
                  <div key={h.id} className="border rounded p-3 mb-3">
                    <div className="font-medium">
                      {h.date} — {h.diagnosis}
                    </div>
                    <div className="text-sm">{h.complaints.join(", ")}</div>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>

        {/* Celebration overlays */}
        <ConfettiBurst show={showBookCelebrate} />
        <ConfettiBurst show={showConsultCelebrate} />
      </div>
    </AppShell>
  );
}

// ========================
// Simple Smoke Tests (dev-only)
// ========================
function __runSmokeTests() {
  console.assert(
    Array.isArray(LABS) && LABS.length >= 1,
    "LABS should be seeded"
  );
  console.assert(
    getAvailableSlots("lab1").length > 0,
    "lab1 should have slots"
  );
  console.assert(
    getAvailableSlots("invalid").length === 0,
    "invalid lab should return empty slots"
  );
  console.assert(
    to12h("13:30") === "1:30 PM",
    "12h formatter should show PM correctly"
  );
}
if (typeof window !== "undefined") {
  try {
    __runSmokeTests();
  } catch {
    /* noop */
  }
}
