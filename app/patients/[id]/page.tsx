"use client";

import React, { JSX, useState } from "react";
import {
  ChevronRight,
  FileText,
  Stethoscope,
  TestTube2,
  Pill,
  Receipt,
  Paperclip,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/layout/app-shell";
import VitalsCard from "@/app/consulting/VitalsCard";

// ===================== Types =====================
type TabKey = "consultations" | "labs" | "prescriptions" | "bills" | "files" | "notes";

type Consult = {
  id: string;
  date: string; // ISO or display string
  doctor: string;
  reason: string;
  status: "Consulted" | "Pending" | "Cancelled" | string;
  vitals: Record<string, string | number>;
  past_history?: string[];
  diagnosis?: string[];
  prescriptions?: { drug: string; dose: string; days: number }[];
};

type LabRow = { id: string; test: string; date: string; result: string };
type RxRow = { id: string; drug: string; date: string; instructions: string };
type BillRow = { id: string; date: string; amount: string; status: "Paid" | "Pending" | string };
type FileRow = { id: string; name: string; date: string };
type NoteRow = { id: string; date: string; note: string };

type Selected =
  | { type: "consult"; data: Consult }
  | { type: "lab"; data: LabRow }
  | { type: "prescription"; data: RxRow }
  | { type: "bill"; data: BillRow }
  | { type: "file"; data: FileRow }
  | { type: "note"; data: NoteRow };

// For Card component props
type IconType = React.ComponentType<{ size?: number; className?: string }>;

type CardProps = {
  title: string;
  subtitle?: string;
  right?: string;
  icon?: IconType;
  color: string; // Tailwind classes for left border color
  onView?: () => void;
};

// ===================== Seeds (same as your data) =====================
const seedConsults: Consult[] = [
  {
    id: "C-27841",
    date: "2025-09-12 09:30",
    doctor: "Dr. Nadir Sha",
    reason: "Chest pain & palpitations",
    status: "Consulted",
    vitals: { bp: "120/80", hr: 86, temp: "36.8°C" },
    past_history: ["No DM/HTN"],
    diagnosis: ["Atypical chest pain"],
    prescriptions: [{ drug: "Metoprolol 25mg", dose: "1-0-1", days: 14 }],
  },
];

const dummyLabs: LabRow[] = [
  { id: "L-104", test: "CBC", date: "2025-09-10", result: "Normal" },
  { id: "L-105", test: "Lipid Profile", date: "2025-09-15", result: "Borderline LDL" },
];

const dummyPrescriptions: RxRow[] = [
  { id: "Rx-120", drug: "Amoxicillin 500mg", date: "2025-09-11", instructions: "1-0-1 for 5 days" },
  { id: "Rx-121", drug: "Cetirizine 10mg", date: "2025-09-12", instructions: "0-0-1 for 7 days" },
];

const dummyBills: BillRow[] = [
  { id: "B-2001", date: "2025-09-11", amount: "₹1,200", status: "Paid" },
  { id: "B-2002", date: "2025-09-14", amount: "₹850", status: "Pending" },
];

const dummyFiles: FileRow[] = [
  { id: "F-301", name: "ECG Report.pdf", date: "2025-09-10" },
  { id: "F-302", name: "Chest X-Ray.png", date: "2025-09-12" },
];

const dummyNotes: NoteRow[] = [
  { id: "N-401", date: "2025-09-11", note: "Patient complained of mild dizziness in mornings." },
  { id: "N-402", date: "2025-09-13", note: "Follow-up call placed. Patient stable." },
];

// ===================== Component =====================
export default function PatientConsultationsPage(): JSX.Element {
  const [activeTab] = useState<TabKey>("consultations");
  const [selected, setSelected] = useState<Selected | null>(null);


  const Card: React.FC<CardProps> = ({ title, subtitle, right, icon: Icon, color, onView }) => (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between rounded-2xl p-4 bg-white shadow-sm border-l-4 ${color}`}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gray-100">
            <Icon size={18} />
          </div>
        )}
        <div>
          <div className="font-medium text-gray-900">{title}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {right && <div className="text-sm font-semibold">{right}</div>}
        {onView && (
          <button
            onClick={onView}
            className="px-3 py-1 rounded-lg bg-black text-white text-xs flex items-center gap-1"
            type="button"
          >
            View <ChevronRight size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );

  const Content: React.FC = () => {
    switch (activeTab) {
      case "labs":
        return (
          <div className="grid gap-3">
            {dummyLabs.map((l) => (
              <Card
                key={l.id}
                title={l.test}
                subtitle={`${l.date} • ${l.result}`}
                icon={TestTube2}
                color="border-indigo-400"
                onView={() => setSelected({ type: "lab", data: l })}
              />
            ))}
          </div>
        );
      case "prescriptions":
        return (
          <div className="grid gap-3">
            {dummyPrescriptions.map((rx) => (
              <Card
                key={rx.id}
                title={rx.drug}
                subtitle={`${rx.date} • ${rx.instructions}`}
                icon={Pill}
                color="border-emerald-400"
                onView={() => setSelected({ type: "prescription", data: rx })}
              />
            ))}
          </div>
        );
      case "bills":
        return (
          <div className="grid gap-3">
            {dummyBills.map((b) => (
              <Card
                key={b.id}
                title={b.id}
                subtitle={b.date}
                right={`${b.amount} (${b.status})`}
                icon={Receipt}
                color={b.status === "Paid" ? "border-emerald-400" : "border-orange-400"}
                onView={() => setSelected({ type: "bill", data: b })}
              />
            ))}
          </div>
        );
      case "files":
        return (
          <div className="grid gap-3">
            {dummyFiles.map((f) => (
              <Card
                key={f.id}
                title={f.name}
                subtitle={f.date}
                icon={Paperclip}
                color="border-fuchsia-400"
                onView={() => setSelected({ type: "file", data: f })}
              />
            ))}
          </div>
        );
      case "notes":
        return (
          <div className="grid gap-3">
            {dummyNotes.map((n) => (
              <Card
                key={n.id}
                title={n.note}
                subtitle={n.date}
                icon={FileText}
                color="border-blue-400"
                onView={() => setSelected({ type: "note", data: n })}
              />
            ))}
          </div>
        );
      default:
        return (
          <div className="grid gap-3">
            {seedConsults.map((c) => (
              <Card
                key={c.id}
                title={c.reason}
                subtitle={`${c.date} • ${c.doctor}`}
                icon={Stethoscope}
                color="border-violet-400"
                onView={() => setSelected({ type: "consult", data: c })}
              />
            ))}
          </div>
        );
    }
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
      <div className="bg-gray-50 rounded-lg p-3 text-sm">{children}</div>
    </div>
  );

  const Drawer: React.FC = () => (
    <AnimatePresence>
      {selected && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <motion.div
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="absolute right-0 top-0 h-full w-[460px] bg-white shadow-2xl p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h3 className="text-lg font-semibold">{selected.type.toUpperCase()} Details</h3>
              <button onClick={() => setSelected(null)} className="text-sm text-gray-500" type="button">
                Close
              </button>
            </div>

            {selected.type === "consult" && (
              <>
                <Section title="Overview">
                  <p>
                    <strong>ID:</strong> {selected.data.id}
                  </p>
                  <p>
                    <strong>Date:</strong> {selected.data.date}
                  </p>
                  <p>
                    <strong>Doctor:</strong> {selected.data.doctor}
                  </p>
                  <p>
                    <strong>Reason:</strong> {selected.data.reason}
                  </p>
                  <p>
                    <strong>Status:</strong> {selected.data.status}
                  </p>
                </Section>
                <Section title="Vitals">
                  {Object.entries(selected.data.vitals).map(([k, v]) => (
                    <p key={k}>
                      {k.toUpperCase()}: {String(v)}
                    </p>
                  ))}
                </Section>
                {selected.data.past_history?.length ? (
                  <Section title="Past History">
                    {selected.data.past_history.map((h, i) => (
                      <p key={i}>• {h}</p>
                    ))}
                  </Section>
                ) : null}
                {selected.data.diagnosis?.length ? (
                  <Section title="Diagnosis">
                    {selected.data.diagnosis.map((d, i) => (
                      <p key={i}>• {d}</p>
                    ))}
                  </Section>
                ) : null}
                {selected.data.prescriptions?.length ? (
                  <Section title="Prescriptions">
                    {selected.data.prescriptions.map((p, i) => (
                      <div key={i} className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{p.drug}</p>
                          <p className="text-xs text-gray-500">
                            {p.dose} • {p.days} days
                          </p>
                        </div>
                        <button className="px-2 py-1 rounded-lg border text-xs flex items-center gap-1" type="button">
                          <RefreshCw size={12} /> Re-prescribe
                        </button>
                      </div>
                    ))}
                    <button className="mt-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm flex items-center gap-1" type="button">
                      <RefreshCw size={14} /> Re-prescribe All
                    </button>
                  </Section>
                ) : null}
              </>
            )}

            {selected.type === "lab" && (
              <>
                <Section title="Test">{selected.data.test}</Section>
                <Section title="Date">{selected.data.date}</Section>
                <Section title="Result">{selected.data.result}</Section>
              </>
            )}

            {selected.type === "prescription" && (
              <>
                <Section title="Drug">{selected.data.drug}</Section>
                <Section title="Date">{selected.data.date}</Section>
                <Section title="Instructions">{selected.data.instructions}</Section>
                <button className="mt-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm flex items-center gap-1" type="button">
                  <RefreshCw size={14} /> Re-prescribe
                </button>
              </>
            )}

            {selected.type === "bill" && (
              <>
                <Section title="ID">{selected.data.id}</Section>
                <Section title="Date">{selected.data.date}</Section>
                <Section title="Amount">{selected.data.amount}</Section>
                <Section title="Status">{selected.data.status}</Section>
              </>
            )}

            {selected.type === "file" && (
              <>
                <Section title="Name">{selected.data.name}</Section>
                <Section title="Date">{selected.data.date}</Section>
              </>
            )}

            {selected.type === "note" && (
              <>
                <Section title="Date">{selected.data.date}</Section>
                <Section title="Note">{selected.data.note}</Section>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

   const patient = {
    id: "P-001",
    name: "Ravi Kumar",
    age: 34,
    gender: "Male",
    allergies: ["Penicillin", "Ibuprofen"],
  } as const;


 

  return (
    <AppShell>

   
    <div className="p-5 min-h-[calc(100vh-80px)]">
      <div className="">
        {/* Header */}
         <div className="flex justify-between mb-4">
            <div>
              <h2 className="font-semibold">
                {patient.name}{" "}
                <span className="text-slate-400">(ID: {patient.id})</span>
              </h2>
              <div className="flex items-center gap-5">

              <p className="text-xs text-slate-500">
                Age {patient.age}, {patient.gender} • Allergies:{" "}
                {patient.allergies.join(", ")}
              </p>
              <VitalsCard />
              </div>
            </div>
          
          </div>

        {/* Content */}
        <div className="mt-4">
          <Content />
        </div>
      </div>

      {/* Drawer */}
      <Drawer />
    </div>
     </AppShell>
  );
}
