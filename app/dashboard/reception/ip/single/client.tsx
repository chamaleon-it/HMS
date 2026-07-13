"use client";
import React, { useState, useRef, useEffect } from "react";
import AppShell from "@/components/layout/app-shell";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { fDate, fDateandTime, fAgeString } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  ArrowLeft, User, Stethoscope, FlaskConical, Pill,
  Receipt, Calendar, Phone, MapPin, Droplets,
  AlertTriangle, Clock, XCircle,
  ChevronDown, ChevronUp, Loader2, HeartPulse, Check,
  ClipboardPen, Thermometer, Activity, Wind, Weight,
  X, NotebookPen,
} from "lucide-react";

const IP_STATUSES = [
  { value: "Admitted", color: "bg-blue-500" },
  { value: "Under Observation", color: "bg-yellow-500" },
  { value: "Surgery", color: "bg-red-500" },
  { value: "Discharged", color: "bg-gray-500" },
];

// ─── Status badge helpers ────────────────────────────────────────────────────
function IPStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Admitted: "bg-blue-100 text-blue-700 border-blue-200",
    "Under Observation": "bg-yellow-100 text-yellow-700 border-yellow-200",
    Surgery: "bg-red-100 text-red-700 border-red-200",
    Discharged: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status}
    </span>
  );
}

function ApptStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Upcoming: "bg-sky-100 text-sky-700",
    Consulted: "bg-violet-100 text-violet-700",
    Completed: "bg-emerald-100 text-emerald-700",
    "Not show": "bg-rose-100 text-rose-600",
    Observation: "bg-amber-100 text-amber-700",
    Admit: "bg-indigo-100 text-indigo-700",
    Test: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

function LabStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Upcoming: "bg-sky-100 text-sky-700",
    "Sample Collected": "bg-amber-100 text-amber-700",
    "Waiting For Result": "bg-orange-100 text-orange-700",
    Completed: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Filling: "bg-blue-100 text-blue-700",
    Ready: "bg-teal-100 text-teal-700",
    Completed: "bg-emerald-100 text-emerald-700",
    Failed: "bg-rose-100 text-rose-600",
    Canceled: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({
  icon,
  title,
  count,
  accent,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  accent: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
            {icon}
          </div>
          <span className="font-semibold text-gray-900 text-[15px]">{title}</span>
          {count !== undefined && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {count}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="border-t border-gray-100">{children}</div>}
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value || "—"}</span>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div className="px-5 py-8 text-center text-gray-400 text-sm">{label}</div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function IPDetailsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const { data: ipData, isLoading, mutate: mutateIP } = useSWR(id ? `/in-patients/${id}` : null);
  const ip = ipData?.data;

  const [statusOpen, setStatusOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  // Quick Note dialog state
  const [noteOpen, setNoteOpen] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [vitals, setVitals] = useState({ temp: "", tempUnit: "°C", bp: "", hr: "", spo2: "", rr: "", weight: "" });
  const [noteText, setNoteText] = useState("");

  function resetNoteForm() {
    setVitals({ temp: "", tempUnit: "°C", bp: "", hr: "", spo2: "", rr: "", weight: "" });
    setNoteText("");
  }

  async function handleSaveNote() {
    if (!id) return;
    try {
      setSavingNote(true);
      await api.post(`/in-patients/${id}/notes`, { ...vitals, note: noteText });
      await mutateIP();
      toast.success("Note recorded successfully");
      setNoteOpen(false);
      resetNoteForm();
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSavingNote(false);
    }
  }

  // close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleStatusChange(newStatus: string) {
    if (!id || newStatus === ip?.status) { setStatusOpen(false); return; }
    try {
      setUpdatingStatus(true);
      await api.patch(`/in-patients/${id}`, { status: newStatus });
      await mutateIP();
      toast.success(`Status updated to "${newStatus}"`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
      setStatusOpen(false);
    }
  }
  const patient = ip?.patientId;

  const { data: appointmentsData } = useSWR(
    patient?._id ? `/appointments/patient/${patient._id}` : null
  );
  const appointments: any[] = (appointmentsData?.data ?? [])
    .slice()
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const { data: labData } = useSWR(
    patient?._id ? `/lab/report/patient/${patient._id}` : null
  );
  const labReports: any[] = (labData?.data ?? [])
    .slice()
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const { data: ordersData } = useSWR(
    patient?._id ? `/pharmacy/orders/customers/${patient._id}` : null
  );
  const orders: any[] = (ordersData?.data?.orders ?? ordersData?.data ?? [])
    .slice()
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const { data: billingData } = useSWR(
    patient?._id ? `/billing/single?q=${patient._id}` : null
  );
  const billings: any[] = (billingData?.data ?? [])
    .slice()
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const { data: consultData } = useSWR(
    patient?._id ? `/consultings/patient/${patient._id}` : null
  );
  const consultations: any[] = (consultData?.data ?? [])
    .slice()
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AppShell>
    );
  }

  if (!ip) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] gap-3">
          <XCircle className="w-12 h-12 text-rose-400" />
          <p className="text-gray-500 text-sm">In-patient record not found.</p>
          <button onClick={() => router.back()} className="text-sm text-blue-600 underline">Go back</button>
        </div>
      </AppShell>
    );
  }

  const totalBilled = billings.filter(b => b.transactionType === "Sale")
    .reduce((s, b) => s + b.items.reduce((a: number, it: any) => a + (it.total || 0), 0) - (b.discount || 0), 0);
  const totalPaid = billings.filter(b => b.transactionType === "Sale")
    .reduce((s, b) => s + (b.cash || 0) + (b.online || 0) + (b.insurance || 0), 0);
  const totalDue = Math.max(0, totalBilled - totalPaid);

  return (
    <AppShell>
      <div className="p-5 flex flex-col gap-6 min-h-[calc(100vh-67px)] bg-gray-50/50">

        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/reception/ip")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span className="text-gray-300">|</span>
            <h1 className="text-xl font-bold text-gray-900">In-Patient Record</h1>
            <IPStatusBadge status={ip.status} />
          </div>
          <span className="text-sm font-mono font-bold px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-700 shadow-sm">
            {ip.admissionNumber}
          </span>
        </div>

        {/* ── Patient Hero Card ───────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-wrap gap-5 items-start">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-slate-800 to-slate-600 flex items-center justify-center text-white text-xl font-bold shadow">
              {patient?.name?.charAt(0) ?? "?"}
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">{patient?.name}</h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{patient?.mrn}</span>
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                {patient?.gender && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{patient.gender}</span>}
                {patient?.dateOfBirth && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Age {fAgeString(patient.dateOfBirth)}</span>}
                {patient?.phoneNumber && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{patient.phoneNumber}</span>}
                {patient?.blood && <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-rose-500" />{patient.blood}</span>}
                {patient?.address && <span className="flex items-center gap-1 max-w-xs truncate"><MapPin className="w-3.5 h-3.5 shrink-0" />{patient.address}</span>}
              </div>
              {(patient?.conditions?.length > 0) && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {patient.conditions.map((c: string) => (
                    <span key={c} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />{c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Quick Note button ── */}
            <div className="shrink-0">
              <button
                onClick={() => setNoteOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 text-sm font-semibold hover:bg-violet-100 transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <ClipboardPen className="w-3.5 h-3.5" />
                Quick Note
              </button>
            </div>

            {/* ── Status Changer ── */}
            <div className="relative shrink-0" ref={statusRef}>
              <button
                onClick={() => setStatusOpen(v => !v)}
                disabled={updatingStatus}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95
                  ${ip.status === "Admitted" ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    : ip.status === "Under Observation" ? "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                      : ip.status === "Surgery" ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"}`}
              >
                {updatingStatus
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <span className={`w-2 h-2 rounded-full ${ip.status === "Admitted" ? "bg-blue-500"
                    : ip.status === "Under Observation" ? "bg-yellow-500"
                      : ip.status === "Surgery" ? "bg-red-500"
                        : "bg-gray-400"
                    }`} />}
                {ip.status}
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {statusOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 pt-1.5 pb-1">Change Status</p>
                  {IP_STATUSES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => handleStatusChange(s.value)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${s.color}`} />
                      <span className="flex-1 font-medium text-gray-700">{s.value}</span>
                      {ip.status === s.value && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Admission Details Grid */}
          <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <InfoRow label="Doctor" value={ip.doctorId?.name ? `Dr. ${ip.doctorId.name}` : undefined} />
            <InfoRow label="Ward" value={ip.ward} />
            <InfoRow label="Room" value={ip.room} />
            <InfoRow label="Bed" value={ip.bed} />
            <InfoRow label="Admitted On" value={fDateandTime(ip.admissionDate)} />
            {ip.diagnosis && <InfoRow label="Diagnosis" value={ip.diagnosis} />}
            {ip.dischargeDate && <InfoRow label="Discharged On" value={fDateandTime(ip.dischargeDate)} />}
            {ip.notes && <div className="col-span-2 lg:col-span-3"><InfoRow label="Notes" value={ip.notes} /></div>}
          </div>
        </div>

        {/* ── Financial Summary ───────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Total Billed", value: formatINR(totalBilled), color: "from-blue-50 to-indigo-50 text-indigo-700" },
            { label: "Total Paid", value: formatINR(totalPaid), color: "from-emerald-50 to-teal-50 text-emerald-700" },
            { label: "Total Due", value: formatINR(totalDue), color: "from-rose-50 to-pink-50 text-rose-700" },
          ].map(s => (
            <div key={s.label} className={`bg-linear-to-br ${s.color} rounded-2xl p-4 border border-white shadow-sm`}>
              <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{s.label}</div>
              <div className="text-xl font-bold mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── IP Notes Timeline ───────────────────────── */}
        {(() => {
          const ipNotes: any[] = (ip.ipNotes ?? []).slice().reverse(); // newest first
          return (
            <SectionCard
              icon={<NotebookPen className="w-4 h-4 text-violet-600" />}
              title="Quick Notes & Vitals"
              count={ipNotes.length}
              accent="bg-violet-50"
            >
              {ipNotes.length === 0 ? <EmptyState label="No notes recorded yet. Use Quick Note to add one." /> : (
                <div className="divide-y divide-gray-50">
                  {ipNotes.map((n: any, i: number) => (
                    <div key={n._id ?? i} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{fDateandTime(n.createdAt)}</span>
                          {n.recordedBy?.name && <span>• {n.recordedBy.name}</span>}
                        </div>
                      </div>
                      {/* Vitals chips */}
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {n.temp && (
                          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 font-medium">
                            <Thermometer className="w-3 h-3" /> {n.temp}{n.tempUnit || "°C"}
                          </span>
                        )}
                        {n.bp && (
                          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 font-medium">
                            <Activity className="w-3 h-3" /> BP: {n.bp}
                          </span>
                        )}
                        {n.hr && (
                          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-100 font-medium">
                            <HeartPulse className="w-3 h-3" /> HR: {n.hr} bpm
                          </span>
                        )}
                        {n.spo2 && (
                          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 font-medium">
                            <Wind className="w-3 h-3" /> SpO₂: {n.spo2}%
                          </span>
                        )}
                        {n.rr && (
                          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100 font-medium">
                            <Wind className="w-3 h-3" /> RR: {n.rr}/min
                          </span>
                        )}
                        {n.weight && (
                          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-medium">
                            <Weight className="w-3 h-3" /> {n.weight} kg
                          </span>
                        )}
                      </div>
                      {n.note && (
                        <p className="mt-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 leading-relaxed">
                          {n.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          );
        })()}

        {/* ── Appointments ────────────────────────────── */}
        <SectionCard
          icon={<Calendar className="w-4 h-4 text-sky-600" />}
          title="Appointments"
          count={appointments.length}
          accent="bg-sky-50"
        >
          {appointments.length === 0 ? <EmptyState label="No appointments found." /> : (
            <div className="divide-y divide-gray-50">
              {appointments.map((a: any) => (
                <div key={a._id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-sky-500" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {fDate(a.date)} &nbsp;<span className="font-normal text-gray-400 text-xs">{a.method}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {a.type} {a.doctor?.name && `• Dr. ${a.doctor.name}`}
                      </div>
                      {a.notes && <div className="text-xs text-gray-400 mt-0.5 max-w-sm">{a.notes}</div>}
                    </div>
                  </div>
                  <ApptStatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Consultations / Visits ───────────────────── */}
        <SectionCard
          icon={<Stethoscope className="w-4 h-4 text-violet-600" />}
          title="Visits / Consultations"
          count={consultations.length}
          accent="bg-violet-50"
        >
          {consultations.length === 0 ? <EmptyState label="No consultation records found." /> : (
            <div className="divide-y divide-gray-50">
              {consultations.map((c: any, i: number) => (
                <div key={c._id ?? i} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                        <HeartPulse className="w-4 h-4 text-violet-500" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          {fDate(c.date ?? c.createdAt)}
                          {c.doctor?.name && <span className="text-gray-500 font-normal text-xs ml-2">Dr. {c.doctor.name}</span>}
                        </div>
                        {c.diagnosis && <div className="text-xs text-gray-500 mt-0.5">Diagnosis: {c.diagnosis}</div>}
                        {c.notes && <div className="text-xs text-gray-400 mt-0.5 max-w-sm">{c.notes}</div>}
                      </div>
                    </div>
                    {c.status && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{c.status}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Lab Reports ─────────────────────────────── */}
        <SectionCard
          icon={<FlaskConical className="w-4 h-4 text-amber-600" />}
          title="Lab Reports"
          count={labReports.length}
          accent="bg-amber-50"
        >
          {labReports.length === 0 ? <EmptyState label="No lab reports found." /> : (
            <div className="divide-y divide-gray-50">
              {labReports.map((r: any) => (
                <div key={r._id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <FlaskConical className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        Report #{r.mrn}
                        {r.isFlagged && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">Flagged</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {fDate(r.date)}
                        {r.panels?.length > 0 && <span className="ml-2">• {r.panels.join(", ")}</span>}
                        {r.priority && <span className="ml-2">• Priority: {r.priority}</span>}
                      </div>
                      {r.technician && <div className="text-xs text-gray-400 mt-0.5">Technician: {r.technician}</div>}
                    </div>
                  </div>
                  <LabStatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Pharmacy Orders ──────────────────────────── */}
        <SectionCard
          icon={<Pill className="w-4 h-4 text-teal-600" />}
          title="Pharmacy Orders"
          count={orders.length}
          accent="bg-teal-50"
        >
          {orders.length === 0 ? <EmptyState label="No pharmacy orders found." /> : (
            <div className="divide-y divide-gray-50">
              {orders.map((o: any) => (
                <div key={o._id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                        <Pill className="w-4 h-4 text-teal-500" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          {o.mrn}
                          <OrderStatusBadge status={o.status} />
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {fDate(o.createdAt)}
                          {o.doctorName && o.doctorName !== "-" && <span className="ml-2">• Dr. {o.doctorName}</span>}
                          {o.priority && <span className="ml-2">• {o.priority}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {o.items?.length ?? 0} item{o.items?.length === 1 ? "" : "s"}
                      <div className="text-[11px] mt-0.5">
                        <span className={`font-semibold ${o.paymentStatus === "Paid" ? "text-emerald-600" : "text-rose-500"}`}>
                          {o.paymentStatus}
                        </span>
                        {o.paidAmount > 0 && ` — ${formatINR(o.paidAmount)}`}
                      </div>
                    </div>
                  </div>
                  {o.items?.length > 0 && (
                    <div className="mt-2.5 ml-11 flex flex-wrap gap-2">
                      {o.items.map((it: any, idx: number) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-100">
                          {it.name?.name ?? it.name} × {it.quantity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Billing ──────────────────────────────────── */}
        <SectionCard
          icon={<Receipt className="w-4 h-4 text-indigo-600" />}
          title="Billing Records"
          count={billings.length}
          accent="bg-indigo-50"
        >
          {billings.length === 0 ? <EmptyState label="No billing records found." /> : (
            <div className="divide-y divide-gray-50">
              {billings.map((b: any) => {
                const isReturn = b.transactionType === "Return";
                const itemsTotal = b.items.reduce((s: number, it: any) => s + (it.total || 0), 0);
                const paid = (b.cash || 0) + (b.online || 0) + (b.insurance || 0);
                const net = itemsTotal - (b.discount || 0);
                const due = Math.max(0, net - paid);
                return (
                  <div key={b._id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isReturn ? "bg-rose-50" : "bg-indigo-50"}`}>
                          <Receipt className={`w-4 h-4 ${isReturn ? "text-rose-500" : "text-indigo-500"}`} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            {b.mrn}
                            {isReturn
                              ? <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-600">Return</span>
                              : <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">Sale</span>
                            }
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${b.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {b.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {fDate(b.createdAt)}
                            {b.doctor && b.doctor !== "Self" && <span className="ml-2">• Dr. {b.doctor}</span>}
                            <span className="ml-2">• {b.items.length} item{b.items.length === 1 ? "" : "s"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{formatINR(net)}</div>
                        <div className="text-xs mt-0.5">
                          <span className="text-emerald-600 font-medium">Paid: {formatINR(paid)}</span>
                          {due > 0 && <span className="ml-2 text-rose-500 font-medium">Due: {formatINR(due)}</span>}
                        </div>
                      </div>
                    </div>
                    {b.items.length > 0 && (
                      <div className="mt-2.5 ml-11 flex flex-wrap gap-2">
                        {b.items.map((it: any, idx: number) => (
                          <span key={idx} className="text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                            {it.name} × {it.quantity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

      </div>

      {/* ── Quick Note Dialog ─────────────────────────────────────────── */}
      {noteOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4" onClick={() => setNoteOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-violet-600 to-indigo-600">
              <div className="flex items-center gap-2.5 text-white">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <NotebookPen className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-[15px]">Quick Note</div>
                  <div className="text-violet-200 text-[11px]">{patient?.name} · {ip.admissionNumber}</div>
                </div>
              </div>
              <button onClick={() => { setNoteOpen(false); resetNoteForm(); }} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
              {/* Vitals grid */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Vitals</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Temperature
                    </label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="e.g. 98.6" value={vitals.temp}
                        onChange={e => setVitals(v => ({ ...v, temp: e.target.value }))}
                        className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" />
                      <select value={vitals.tempUnit} onChange={e => setVitals(v => ({ ...v, tempUnit: e.target.value }))}
                        className="w-16 px-2 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white">
                        <option>°C</option><option>°F</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-500" /> Blood Pressure
                    </label>
                    <input type="text" placeholder="e.g. 120/80" value={vitals.bp}
                      onChange={e => setVitals(v => ({ ...v, bp: e.target.value }))}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-red-500" /> Heart Rate (bpm)
                    </label>
                    <input type="text" placeholder="e.g. 72" value={vitals.hr}
                      onChange={e => setVitals(v => ({ ...v, hr: e.target.value }))}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-sky-500" /> SpO₂ (%)
                    </label>
                    <input type="text" placeholder="e.g. 98" value={vitals.spo2}
                      onChange={e => setVitals(v => ({ ...v, spo2: e.target.value }))}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-teal-500" /> Resp. Rate (/min)
                    </label>
                    <input type="text" placeholder="e.g. 16" value={vitals.rr}
                      onChange={e => setVitals(v => ({ ...v, rr: e.target.value }))}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                      <Weight className="w-3.5 h-3.5 text-amber-500" /> Weight (kg)
                    </label>
                    <input type="text" placeholder="e.g. 65" value={vitals.weight}
                      onChange={e => setVitals(v => ({ ...v, weight: e.target.value }))}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" />
                  </div>
                </div>
              </div>

              {/* Note textarea */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                  <ClipboardPen className="w-3.5 h-3.5 text-violet-500" /> Note
                </label>
                <textarea rows={4} placeholder="Enter clinical observation, nurse notes, doctor remarks…"
                  value={noteText} onChange={e => setNoteText(e.target.value)}
                  className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all resize-none leading-relaxed" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button onClick={() => { setNoteOpen(false); resetNoteForm(); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveNote} disabled={savingNote}
                className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-60 shadow-lg shadow-violet-200">
                {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

