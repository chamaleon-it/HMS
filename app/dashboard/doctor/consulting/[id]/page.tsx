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
  CalendarClock,
  Building2,
  TestTubeDiagonal,
  FlaskConical,
  ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/layout/app-shell";
import ConsultationAndExaminationNotes from "./ConsultationAndExaminationNotes";
import { useParams, useRouter } from "next/navigation";
import PrescriptionCard2 from "./PrescriptionCard2";
import FollowUpTime from "./FollowUpTime";
import OrderLab from "./OrderLab";
import History from "./History";
import AllergyAlert from "./AllergyAlert";
import { ConfettiBurst } from "./ConfettiBurst";
import Header from "./Header";
import Advice from "./Advice";
import ActionButton from "./ActionButton";


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
  {
    id: "lab4",
    name: "Dr Jossy Diagnostic Center",
    inhouse: false,
    slots: ["11:00", "11:30", "12:00", "12:30", "13:00"],
  },
];

function getAvailableSlots(labId: string | null): string[] {
  if (!labId) return [];
  const lab = LABS.find((l) => l.name === labId);
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

export default function ConsultingMenu() {
const params = useParams()

const {id:appointmentId} = params


  const router = useRouter();

  const patient = {
    id: "P-001",
    name: "Ravi Kumar",
    age: 34,
    gender: "Male",
    allergies: ["Penicillin", "Ibuprofen"],
  } as const;

  const [advice, setAdvice] = useState("");
  
  const [orderOpen, setOrderOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState<string>("");
  const [seletedTest, setSeletedTest] = useState<string[]>([]);
  const [orderDay, setOrderDay] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState<string>("");
  const [priority, setPriority] = useState<"STAT" | "High" | "Normal">(
    "Normal"
  );
  const [booked, setBooked] = useState<
    {
      labId: string;
      date: Date;
      slot: string;
      priority: string;
      seletedTest?: string[];
    }[]
  >([]);


  const [showBookCelebrate, setShowBookCelebrate] = useState(false);
  const [followDay, setFollowDay] = useState<Date | undefined>(undefined);
  const followTimes = useMemo(() => genHalfHourTimes(8, 20), []);
  const [followTime, setFollowTime] = useState<string>("");
  const [showConsultCelebrate, setShowConsultCelebrate] = useState(false);

  const sortedLabs = useMemo(() => {
    return [...LABS].sort(
      (a, b) =>
        Number(b.inhouse) - Number(a.inhouse) || a.name.localeCompare(b.name)
    );
  }, []);

  useEffect(() => {
    if (orderOpen && !selectedLab && sortedLabs.length) {
      const firstInhouse = sortedLabs.find((l) => l.inhouse) || sortedLabs[0];
      setSelectedLab(firstInhouse.id);
    }
  }, [orderOpen, selectedLab, sortedLabs]);




  const handleBook = () => {
    if (!selectedLab || !orderDay || !slot) return;
    setBooked((b) => [
      ...b,
      {
        labId: selectedLab,
        date: orderDay,
        slot,
        priority,
        seletedTest: seletedTest,
      },
    ]);
    setShowBookCelebrate(true);
    setTimeout(() => setShowBookCelebrate(false), 1500);
  };

  const handleComplete = () => {
    setShowConsultCelebrate(true);
    setTimeout(() => setShowConsultCelebrate(false), 1700);
    router.push("/");
  };


  const [activeTab, setActiveTab] = useState<"consultation" | "history">(
    "consultation"
  );

  const [labTestType, setLabTestType] = useState("all");
  const [labTestName, setLabTestName] = useState("");
  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="mx-auto p-5">
     <Header activeTab={activeTab} setActiveTab={setActiveTab}/>

          <AllergyAlert />

          {/* =================== CONSULT TAB =================== */}
          {activeTab === "consultation" && (
            <div className="mt-4">
              <Card className="p-6">
                <ConsultationAndExaminationNotes />

                <Separator className="my-4" />
                <PrescriptionCard2 />
                <Separator className="my-6" />
                
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4" /> Lab / Imaging Booking
                  </Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOrderOpen((o) => !o)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
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
                        <div className="md:col-span-2 border-r p-3 md:max-h-[350px] md:overflow-y-auto">
                          <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
                            Select Test
                          </div>

                          <div className="flex shrink-0 gap-2.5">
                            <Tabs defaultValue="lab" className="space-y-3">
                              <TabsList className="flex gap-1">
                                <TabsTrigger
                                  value="all"
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={() => setLabTestType("all")}
                                >
                                  All
                                </TabsTrigger>

                                <TabsTrigger
                                  value="lab"
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={() => setLabTestType("lab")}
                                >
                                  <FlaskConical className="h-2 w-2" />
                                  Lab
                                </TabsTrigger>
                                <TabsTrigger
                                  value="image"
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={() => setLabTestType("image")}
                                >
                                  <ImageIcon className="h-2 w-2" />
                                  Imaging
                                </TabsTrigger>
                              </TabsList>
                            </Tabs>
                            <div className="relative mb-3 w-[45%]">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Search tests..."
                                className="pl-9"
                                onChange={(e) => setLabTestName(e.target.value)}
                                value={labTestName}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            {[
                              { id: "I033", name: "ECG", type: "image" },

                              // ---------------- LAB TESTS ----------------
                              {
                                id: "L001",
                                name: "Complete Blood Count (CBC)",
                                type: "lab",
                              },
                              { id: "L002", name: "Hemoglobin", type: "lab" },
                              {
                                id: "L003",
                                name: "Blood Sugar (Fasting)",
                                type: "lab",
                              },
                              {
                                id: "L004",
                                name: "Blood Sugar (PP)",
                                type: "lab",
                              },
                              { id: "L005", name: "HbA1c", type: "lab" },
                              {
                                id: "L006",
                                name: "Lipid Profile",
                                type: "lab",
                              },
                              { id: "L007", name: "Cholesterol", type: "lab" },
                              {
                                id: "L008",
                                name: "Triglycerides",
                                type: "lab",
                              },
                              { id: "L009", name: "HDL", type: "lab" },
                              { id: "L010", name: "LDL", type: "lab" },
                              {
                                id: "L011",
                                name: "Liver Function Test",
                                type: "lab",
                              },
                              {
                                id: "L012",
                                name: "Kidney Function Test",
                                type: "lab",
                              },
                              { id: "L013", name: "Creatinine", type: "lab" },
                              { id: "L014", name: "Uric Acid", type: "lab" },
                              { id: "L015", name: "Electrolytes", type: "lab" },
                              { id: "L016", name: "Calcium", type: "lab" },
                              { id: "L017", name: "Phosphorus", type: "lab" },
                              { id: "L018", name: "Magnesium", type: "lab" },
                              { id: "L019", name: "Iron Studies", type: "lab" },
                              { id: "L020", name: "Ferritin", type: "lab" },
                              { id: "L021", name: "Vitamin D", type: "lab" },
                              { id: "L022", name: "Vitamin B12", type: "lab" },
                              { id: "L023", name: "Folate", type: "lab" },
                              {
                                id: "L024",
                                name: "Thyroid (TSH)",
                                type: "lab",
                              },
                              { id: "L025", name: "T3", type: "lab" },
                              { id: "L026", name: "T4", type: "lab" },
                              {
                                id: "L027",
                                name: "Parathyroid Hormone",
                                type: "lab",
                              },
                              { id: "L028", name: "Prolactin", type: "lab" },
                              { id: "L029", name: "Testosterone", type: "lab" },
                              { id: "L030", name: "Progesterone", type: "lab" },
                              { id: "L031", name: "Estrogen", type: "lab" },
                              {
                                id: "L032",
                                name: "C-Reactive Protein (CRP)",
                                type: "lab",
                              },
                              { id: "L033", name: "ESR", type: "lab" },
                              { id: "L034", name: "D-Dimer", type: "lab" },
                              {
                                id: "L035",
                                name: "Coagulation Profile",
                                type: "lab",
                              },
                              { id: "L036", name: "Blood Group", type: "lab" },
                              {
                                id: "L037",
                                name: "Urine Routine",
                                type: "lab",
                              },
                              {
                                id: "L038",
                                name: "Stool Routine",
                                type: "lab",
                              },
                              { id: "L039", name: "Malaria Test", type: "lab" },
                              { id: "L040", name: "Dengue Test", type: "lab" },
                              {
                                id: "L041",
                                name: "Typhoid (Widal)",
                                type: "lab",
                              },
                              { id: "L042", name: "HIV Test", type: "lab" },
                              {
                                id: "L043",
                                name: "Hepatitis B Surface Antigen",
                                type: "lab",
                              },
                              {
                                id: "L044",
                                name: "Hepatitis C Antibody",
                                type: "lab",
                              },
                              {
                                id: "L045",
                                name: "Syphilis Test (VDRL)",
                                type: "lab",
                              },
                              {
                                id: "L046",
                                name: "Covid-19 RTPCR",
                                type: "lab",
                              },
                              {
                                id: "L047",
                                name: "Covid-19 Antibody",
                                type: "lab",
                              },
                              {
                                id: "L048",
                                name: "Blood Culture",
                                type: "lab",
                              },
                              {
                                id: "L049",
                                name: "Urine Culture",
                                type: "lab",
                              },
                              {
                                id: "L050",
                                name: "Sputum Culture",
                                type: "lab",
                              },

                              // ---------------- IMAGING TESTS ----------------
                              {
                                id: "I001",
                                name: "X-Ray Chest",
                                type: "image",
                              },
                              {
                                id: "I002",
                                name: "X-Ray Abdomen",
                                type: "image",
                              },
                              {
                                id: "I003",
                                name: "X-Ray Spine",
                                type: "image",
                              },
                              {
                                id: "I004",
                                name: "X-Ray Skull",
                                type: "image",
                              },
                              {
                                id: "I005",
                                name: "X-Ray Pelvis",
                                type: "image",
                              },
                              { id: "I006", name: "X-Ray Hand", type: "image" },
                              { id: "I007", name: "X-Ray Foot", type: "image" },
                              {
                                id: "I008",
                                name: "X-Ray Shoulder",
                                type: "image",
                              },
                              { id: "I009", name: "X-Ray Knee", type: "image" },
                              {
                                id: "I010",
                                name: "Ultrasound Abdomen",
                                type: "image",
                              },
                              {
                                id: "I011",
                                name: "Ultrasound Pelvis",
                                type: "image",
                              },
                              {
                                id: "I012",
                                name: "Ultrasound Neck",
                                type: "image",
                              },
                              {
                                id: "I013",
                                name: "Ultrasound Breast",
                                type: "image",
                              },
                              {
                                id: "I014",
                                name: "Ultrasound Pregnancy",
                                type: "image",
                              },
                              {
                                id: "I015",
                                name: "CT Scan Brain",
                                type: "image",
                              },
                              {
                                id: "I016",
                                name: "CT Scan Chest",
                                type: "image",
                              },
                              {
                                id: "I017",
                                name: "CT Scan Abdomen",
                                type: "image",
                              },
                              {
                                id: "I018",
                                name: "CT Scan Pelvis",
                                type: "image",
                              },
                              {
                                id: "I019",
                                name: "CT Angiography",
                                type: "image",
                              },
                              {
                                id: "I020",
                                name: "CT Coronary",
                                type: "image",
                              },
                              { id: "I021", name: "MRI Brain", type: "image" },
                              { id: "I022", name: "MRI Spine", type: "image" },
                              { id: "I023", name: "MRI Knee", type: "image" },
                              {
                                id: "I024",
                                name: "MRI Shoulder",
                                type: "image",
                              },
                              {
                                id: "I025",
                                name: "MRI Abdomen",
                                type: "image",
                              },
                              { id: "I026", name: "MRI Pelvis", type: "image" },
                              { id: "I027", name: "PET Scan", type: "image" },
                              { id: "I028", name: "Bone Scan", type: "image" },
                              {
                                id: "I029",
                                name: "Thyroid Scan",
                                type: "image",
                              },
                              { id: "I030", name: "Renal Scan", type: "image" },
                              {
                                id: "I031",
                                name: "Mammography",
                                type: "image",
                              },
                              {
                                id: "I032",
                                name: "Echocardiography",
                                type: "image",
                              },

                              { id: "I034", name: "EEG", type: "image" },
                              { id: "I035", name: "EMG", type: "image" },
                              {
                                id: "I036",
                                name: "Holter Monitoring",
                                type: "image",
                              },
                              {
                                id: "I037",
                                name: "Stress Test (TMT)",
                                type: "image",
                              },
                              {
                                id: "I038",
                                name: "Angiography",
                                type: "image",
                              },
                              { id: "I039", name: "Venography", type: "image" },
                              {
                                id: "I040",
                                name: "Myelography",
                                type: "image",
                              },
                              {
                                id: "I041",
                                name: "Fluoroscopy",
                                type: "image",
                              },
                              {
                                id: "I042",
                                name: "Bone Density (DEXA)",
                                type: "image",
                              },
                              {
                                id: "I043",
                                name: "Dental X-Ray (OPG)",
                                type: "image",
                              },
                              {
                                id: "I044",
                                name: "Sinus X-Ray",
                                type: "image",
                              },
                              {
                                id: "I045",
                                name: "Contrast CT",
                                type: "image",
                              },
                              {
                                id: "I046",
                                name: "Contrast MRI",
                                type: "image",
                              },
                              {
                                id: "I047",
                                name: "3D CT Reconstruction",
                                type: "image",
                              },
                              {
                                id: "I048",
                                name: "Cardiac MRI",
                                type: "image",
                              },
                              {
                                id: "I049",
                                name: "Virtual Colonoscopy",
                                type: "image",
                              },
                              {
                                id: "I050",
                                name: "Endoscopic Ultrasound (EUS)",
                                type: "image",
                              },
                            ]

                              .filter((e) => {
                                const typeMatch =
                                  labTestType === "all" ||
                                  (labTestType === "lab" && e.type === "lab") ||
                                  (labTestType === "image" &&
                                    e.type === "image");

                                const nameMatch =
                                  !labTestName ||
                                  e.name
                                    .toLowerCase()
                                    .includes(labTestName.toLowerCase());

                                return typeMatch && nameMatch;
                              })
                              .map((l) => (
                                <Button
                                  key={l.id}
                                  size="sm"
                                  variant={
                                    selectedLab === l.name
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => {
                                    setSeletedTest((prev) => {
                                      if (prev.includes(l.name)) {
                                        return prev.filter((e) => e !== l.name);
                                      } else {
                                        return [...prev, l.name];
                                      }
                                    });
                                    setSlot("");
                                  }}
                                  className={`w-full justify-between cursor-pointer ${
                                    seletedTest.find((e) => e === l.name)
                                      ? "bg-slate-900 hover:bg-slate-900 text-white hover:text-white"
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

                        <div className="md:col-span-6 p-3">
                          <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-2">
                            <CalendarClock className="w-4 h-4" /> Select date &
                            time
                          </div>
                          <div className="grid grid-cols-3 gap-3 w-full">
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

                            <Card className="p-2">
                              <div className="text-xs text-slate-500 mb-2">
                                Select Lab
                              </div>
                              <div className="space-y-2">
                                {sortedLabs.map((l) => (
                                  <Button
                                    key={l.id}
                                    size="sm"
                                    variant={
                                      selectedLab === l.name
                                        ? "default"
                                        : "outline"
                                    }
                                    onClick={() => {
                                      setSelectedLab(l.name);
                                      setSlot("");
                                    }}
                                    className={`w-full justify-between cursor-pointer ${
                                      selectedLab === l.name
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
                                      onClick={() => {
                                        if (
                                          sortedLabs.find(
                                            (e) => selectedLab === e.name
                                          )?.inhouse === false &&
                                          p === "STAT"
                                        ) {
                                          return;
                                        } else {
                                          setPriority(p);
                                        }
                                      }}
                                      className={`
                                        ${
                                          sortedLabs.find(
                                            (e) => selectedLab === e.name
                                          )?.inhouse === false && p === "STAT"
                                            ? "border !bg-gray-400 border-gray-700 text-white"
                                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        } 
                                        cursor-pointer border ${
                                          p === priority
                                            ? "ring-2 ring-emerald-400"
                                            : ""
                                        } ${
                                        p === "STAT"
                                          ? ""
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
                                    className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                                    disabled={!orderDay || !slot}
                                    onClick={handleBook}
                                  >
                                    Book Test
                                  </Button>
                                </motion.div>
                              </div>
                            </Card>
                          </div>
                        </div>
                      </div>
                   {booked.length !== 0 &&   <OrderLab booked={booked} setBooked={setBooked} />}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Follow-up with calendar + 12h chips */}
                <Separator className="my-6" />
                <Advice advice={advice} setAdvice={setAdvice} />
                <FollowUpTime
                  followDay={followDay}
                  setFollowDay={setFollowDay}
                  followTimes={followTimes}
                  followTime={followTime}
                  setFollowTime={setFollowTime}
                />

               <ActionButton />
              </Card>
            </div>
          )}

          {activeTab === "history" && <History />}
        </div>


        <ConfettiBurst show={showBookCelebrate} />
        <ConfettiBurst show={showConsultCelebrate} />
      </div>
    </AppShell>
  );
}
