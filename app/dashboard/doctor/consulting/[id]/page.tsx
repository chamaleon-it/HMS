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
