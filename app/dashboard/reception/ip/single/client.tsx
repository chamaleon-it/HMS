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
  X, NotebookPen, Bed, Building2, CheckCircle2, AlertCircle, FileText, Sparkles
} from "lucide-react";
import {
  LabReportDetailModal,
  PharmacyOrderDetailModal,
  BillingDetailModal,
  ConsultationDetailModal,
} from "@/components/shared/ip/IPRecordDetailModals";

const IP_STATUSES = [
  { value: "Admitted", color: "bg-emerald-500", label: "Admitted" },
  { value: "Under Observation", color: "bg-amber-500", label: "Under Observation" },
  { value: "Surgery", color: "bg-rose-500", label: "Surgery" },
  { value: "Discharged", color: "bg-slate-500", label: "Discharged" },
];

// ─── Status badge helpers ────────────────────────────────────────────────────
function IPStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Admitted: "bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20",
    "Under Observation": "bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-500/20",
    Surgery: "bg-rose-100 text-rose-800 border-rose-300 ring-2 ring-rose-500/20",
    Discharged: "bg-slate-100 text-slate-700 border-slate-300 ring-2 ring-slate-400/20",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      <span className={`w-2 h-2 rounded-full ${status === "Admitted" ? "bg-emerald-500 animate-pulse" : status === "Under Observation" ? "bg-amber-500" : status === "Surgery" ? "bg-rose-500" : "bg-slate-400"}`} />
      {status}
    </span>
  );
}

function ApptStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Upcoming: "bg-sky-100 text-sky-800 border-sky-200",
    Consulted: "bg-violet-100 text-violet-800 border-violet-200",
    Completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Not show": "bg-rose-100 text-rose-700 border-rose-200",
    Observation: "bg-amber-100 text-amber-800 border-amber-200",
    Admit: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Test: "bg-orange-100 text-orange-800 border-orange-200",
  };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status}
    </span>
  );
}

function LabStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Upcoming: "bg-sky-100 text-sky-800 border-sky-200",
    "Sample Collected": "bg-amber-100 text-amber-800 border-amber-200",
    "Waiting For Result": "bg-orange-100 text-orange-800 border-orange-200",
    Completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status}
    </span>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Filling: "bg-blue-100 text-blue-800 border-blue-200",
    Ready: "bg-teal-100 text-teal-800 border-teal-200",
    Completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Failed: "bg-rose-100 text-rose-800 border-rose-200",
    Canceled: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${accent}`}>
            {icon}
          </div>
          <span className="font-bold text-slate-900 text-base tracking-tight">{title}</span>
          {count !== undefined && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
              {count}
            </span>
          )}
        </div>
        <div className="w-7 h-7 rounded-lg bg-slate-100/70 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {open && <div className="border-t border-slate-100">{children}</div>}
    </div>
  );
}

// ─── Info Tile ─────────────────────────────────────────────────────────────────
function InfoTile({
  icon,
  label,
  value,
  bg = "bg-slate-50/80",
  textColor = "text-slate-900",
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | null;
  bg?: string;
  textColor?: string;
}) {
  return (
    <div className={`p-3.5 rounded-xl border border-slate-200/70 ${bg} flex items-start gap-3 transition-all hover:border-slate-300 shadow-2xs`}>
      {icon && <div className="mt-0.5 p-2 rounded-lg bg-white shadow-2xs text-slate-600 shrink-0">{icon}</div>}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <span className={`text-sm font-semibold mt-0.5 truncate ${textColor}`}>{value || "—"}</span>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div className="px-5 py-8 text-center text-slate-400 text-sm font-medium">{label}</div>
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

  // Detail Modals state
  const [selectedLabReport, setSelectedLabReport] = useState<any | null>(null);
  const [selectedPharmacyOrder, setSelectedPharmacyOrder] = useState<any | null>(null);
  const [selectedBillingRecord, setSelectedBillingRecord] = useState<any | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<any | null>(null);

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
    patient?._id ? `/pharmacy/orders/patient/${patient._id}` : null
  );
  const orders: any[] = (ordersData?.data ?? [])
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
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AppShell>
    );
  }

  if (!ip) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] gap-3">
          <XCircle className="w-12 h-12 text-rose-500" />
          <p className="text-slate-600 font-medium text-sm">In-patient record not found.</p>
          <button onClick={() => router.back()} className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold underline">Go back</button>
        </div>
      </AppShell>
    );
  }

  const totalBilled = billings.filter(b => b.transactionType === "Sale")
    .reduce((s, b) => s + b.items.reduce((a: number, it: any) => a + (it.total || 0), 0) - (b.discount || 0), 0);
  const totalPaid = billings.filter(b => b.transactionType === "Sale")
    .reduce((s, b) => s + (b.cash || 0) + (b.online || 0) + (b.insurance || 0), 0);
  const totalDue = Math.max(0, totalBilled - totalPaid);

  const admissionDate = ip?.admissionDate ? new Date(ip.admissionDate) : null;
  const dischargeDate = ip?.dischargeDate ? new Date(ip.dischargeDate) : new Date();
  const stayDays = admissionDate
    ? Math.max(1, Math.ceil((dischargeDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <AppShell>
      <div className="p-6 flex flex-col gap-6 min-h-[calc(100vh-67px)] bg-slate-50/60">

        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/reception/ip/")}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" /> Back
            </button>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">In-Patient Record</h1>
              <IPStatusBadge status={ip.status} />
            </div>
          </div>
          <span className="text-sm font-mono font-bold px-3.5 py-1.5 bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-200/80 rounded-xl text-indigo-900 shadow-2xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            {ip.admissionNumber}
          </span>
        </div>

        {/* ── Patient Profile Hero Card ───────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden">
          {/* Subtle decorative background accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-50/50 via-purple-50/30 to-transparent rounded-bl-full pointer-events-none" />

          <div className="relative z-10 flex flex-wrap gap-6 items-start">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-indigo-200 ring-4 ring-indigo-50">
              {patient?.name?.charAt(0) ?? "?"}
            </div>
            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{patient?.name}</h2>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {patient?.mrn}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5 mt-3 text-xs">
                {patient?.gender && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                    <User className="w-3.5 h-3.5 text-blue-500" />{patient.gender}
                  </span>
                )}
                {patient?.dateOfBirth && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                    <Clock className="w-3.5 h-3.5 text-purple-500" />Age {fAgeString(patient.dateOfBirth)}
                  </span>
                )}
                {patient?.phoneNumber && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />{patient.phoneNumber}
                  </span>
                )}
                {patient?.blood && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                    <Droplets className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />{patient.blood}
                  </span>
                )}
                {patient?.address && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-100 font-medium max-w-xs truncate">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />{patient.address}
                  </span>
                )}
              </div>

              {(patient?.conditions?.length > 0) && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {patient.conditions.map((c: string) => (
                    <span key={c} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />{c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Action buttons ── */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              {/* Quick Note button */}
              <button
                onClick={() => setNoteOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold transition-all shadow-md shadow-violet-200 active:scale-95 cursor-pointer"
              >
                <ClipboardPen className="w-4 h-4" />
                Quick Note
              </button>

              {/* Status Changer */}
              <div className="relative" ref={statusRef}>
                <button
                  onClick={() => setStatusOpen(v => !v)}
                  disabled={updatingStatus}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer
                    ${ip.status === "Admitted" ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                      : ip.status === "Under Observation" ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                        : ip.status === "Surgery" ? "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100"
                          : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"}`}
                >
                  {updatingStatus
                    ? <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    : <span className={`w-2.5 h-2.5 rounded-full ${ip.status === "Admitted" ? "bg-emerald-500 animate-pulse"
                      : ip.status === "Under Observation" ? "bg-amber-500"
                        : ip.status === "Surgery" ? "bg-rose-500"
                          : "bg-slate-400"
                      }`} />}
                  {ip.status}
                  <ChevronDown className="w-4 h-4 opacity-60" />
                </button>

                {statusOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3.5 pt-1.5 pb-1">Change Status</p>
                    {IP_STATUSES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => handleStatusChange(s.value)}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm hover:bg-slate-50 transition-colors text-left font-medium text-slate-700"
                      >
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.color}`} />
                        <span className="flex-1">{s.value}</span>
                        {ip.status === s.value && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admission Details Grid */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <InfoTile
              icon={<Stethoscope className="w-4 h-4 text-blue-600" />}
              label="Assigned Doctor"
              value={ip.doctorId?.name ? `Dr. ${ip.doctorId.name}` : undefined}
              bg="bg-blue-50/60"
              textColor="text-blue-950"
            />
            <InfoTile
              icon={<Building2 className="w-4 h-4 text-indigo-600" />}
              label="Ward & Room"
              value={`${ip.ward || "—"} / ${ip.room || "—"}`}
              bg="bg-indigo-50/60"
              textColor="text-indigo-950"
            />
            <InfoTile
              icon={<Bed className="w-4 h-4 text-purple-600" />}
              label="Bed Number"
              value={ip.bed}
              bg="bg-purple-50/60"
              textColor="text-purple-950"
            />
            <InfoTile
              icon={<Clock className="w-4 h-4 text-emerald-600" />}
              label="Admitted On"
              value={fDateandTime(ip.admissionDate)}
              bg="bg-emerald-50/60"
              textColor="text-emerald-950"
            />
            {ip.diagnosis && (
              <InfoTile
                icon={<Activity className="w-4 h-4 text-amber-600" />}
                label="Diagnosis"
                value={ip.diagnosis}
                bg="bg-amber-50/60"
                textColor="text-amber-950"
              />
            )}
            {ip.dischargeDate && (
              <InfoTile
                icon={<Clock className="w-4 h-4 text-slate-600" />}
                label="Discharged On"
                value={fDateandTime(ip.dischargeDate)}
                bg="bg-slate-100/80"
                textColor="text-slate-900"
              />
            )}
          </div>

          {ip.notes && (
            <div className="mt-3.5 p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/80 flex items-start gap-3">
              <FileText className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Admission Notes</span>
                <p className="text-sm font-medium text-slate-800 mt-0.5 leading-relaxed">{ip.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Key Metrics Summary Cards ─────────────────────── */}
        <div className={`grid grid-cols-2 ${ip.status === "Discharged" ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-4`}>
          <div className="bg-gradient-to-br from-indigo-50 via-indigo-50/80 to-indigo-100/40 rounded-2xl border border-indigo-100 p-4 flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-700/80 uppercase tracking-wider block">Total Billed</span>
              <span className="text-xl font-black text-indigo-950 mt-0.5 block">{formatINR(totalBilled)}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-emerald-100/40 rounded-2xl border border-emerald-100 p-4 flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700/80 uppercase tracking-wider block">Total Paid</span>
              <span className="text-xl font-black text-emerald-950 mt-0.5 block">{formatINR(totalPaid)}</span>
            </div>
          </div>

          <div className={`rounded-2xl border p-4 flex items-center gap-4 shadow-2xs ${totalDue > 0 ? "bg-gradient-to-br from-rose-50 via-rose-50/80 to-rose-100/40 border-rose-200" : "bg-gradient-to-br from-slate-50 to-slate-100/40 border-slate-200"}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md shrink-0 ${totalDue > 0 ? "bg-rose-600 text-white shadow-rose-200" : "bg-slate-600 text-white shadow-slate-200"}`}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider block ${totalDue > 0 ? "text-rose-700/80" : "text-slate-600"}`}>Pending Balance</span>
              <span className={`text-xl font-black mt-0.5 block ${totalDue > 0 ? "text-rose-950" : "text-slate-800"}`}>{formatINR(totalDue)}</span>
            </div>
          </div>

          {ip.status !== "Discharged" && (
            <div className="bg-gradient-to-br from-sky-50 via-sky-50/80 to-sky-100/40 rounded-2xl border border-sky-100 p-4 flex items-center gap-4 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-200 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-sky-700/80 uppercase tracking-wider block">Stay Duration</span>
                <span className="text-xl font-black text-sky-950 mt-0.5 block">
                  {stayDays} {stayDays === 1 ? "Day" : "Days"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Row 1: Quick Notes & Vitals + Appointments ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Quick Notes & Vitals */}
          {(() => {
            const ipNotes: any[] = (ip.ipNotes ?? []).slice().reverse(); // newest first
            return (
              <SectionCard
                icon={<NotebookPen className="w-5 h-5 text-violet-600" />}
                title="Quick Notes & Vitals"
                count={ipNotes.length}
                accent="bg-violet-100 text-violet-700"
              >
                {ipNotes.length === 0 ? <EmptyState label="No notes recorded yet. Use Quick Note to add one." /> : (
                  <div className="divide-y divide-slate-100">
                    {ipNotes.map((n: any, i: number) => (
                      <div key={n._id ?? i} className="p-4 hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{fDateandTime(n.createdAt)}</span>
                            {n.recordedBy?.name && <span className="font-semibold text-slate-700">• {n.recordedBy.name}</span>}
                          </div>
                        </div>
                        {/* Vitals chips */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {n.temp && (
                            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 font-semibold shadow-2xs">
                              <Thermometer className="w-3.5 h-3.5 text-orange-500" /> {n.temp}{n.tempUnit || "°C"}
                            </span>
                          )}
                          {n.bp && (
                            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-semibold shadow-2xs">
                              <Activity className="w-3.5 h-3.5 text-rose-500" /> BP: {n.bp}
                            </span>
                          )}
                          {n.hr && (
                            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200 font-semibold shadow-2xs">
                              <HeartPulse className="w-3.5 h-3.5 text-red-500" /> HR: {n.hr} bpm
                            </span>
                          )}
                          {n.spo2 && (
                            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-semibold shadow-2xs">
                              <Wind className="w-3.5 h-3.5 text-sky-500" /> SpO₂: {n.spo2}%
                            </span>
                          )}
                          {n.rr && (
                            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-semibold shadow-2xs">
                              <Wind className="w-3.5 h-3.5 text-teal-500" /> RR: {n.rr}/min
                            </span>
                          )}
                          {n.weight && (
                            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold shadow-2xs">
                              <Weight className="w-3.5 h-3.5 text-amber-500" /> {n.weight} kg
                            </span>
                          )}
                        </div>
                        {n.note && (
                          <p className="mt-3 text-sm text-slate-800 bg-slate-50/90 rounded-xl p-3 border border-slate-200/70 leading-relaxed font-medium">
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

          {/* Appointments */}
          <SectionCard
            icon={<Calendar className="w-5 h-5 text-sky-600" />}
            title="Appointments"
            count={appointments.length}
            accent="bg-sky-100 text-sky-700"
          >
            {appointments.length === 0 ? <EmptyState label="No appointments found." /> : (
              <div className="divide-y divide-slate-100">
                {appointments.map((a: any) => (
                  <div key={a._id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {fDate(a.date)} &nbsp;<span className="font-semibold text-slate-500 text-xs px-2 py-0.5 bg-slate-100 rounded-md">{a.method}</span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1 font-medium">
                          {a.type} {a.doctor?.name && `• Dr. ${a.doctor.name}`}
                        </div>
                        {a.notes && <div className="text-xs text-slate-500 mt-1 max-w-sm">{a.notes}</div>}
                      </div>
                    </div>
                    <ApptStatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Row 2: Visits / Consultations + Lab Reports ───────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Consultations / Visits */}
          <SectionCard
            icon={<Stethoscope className="w-5 h-5 text-violet-600" />}
            title="Visits / Consultations"
            count={consultations.length}
            accent="bg-violet-100 text-violet-700"
          >
            {consultations.length === 0 ? <EmptyState label="No consultation records found." /> : (
              <div className="divide-y divide-slate-100">
                {consultations.map((c: any, i: number) => (
                  <div
                    key={c._id ?? i}
                    onClick={() => setSelectedConsultation(c)}
                    className="p-4 hover:bg-violet-50/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap text-left">
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100">
                          <HeartPulse className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {fDate(c.date ?? c.createdAt)}
                            {c.doctor?.name && <span className="text-indigo-600 font-semibold text-xs ml-2">Dr. {c.doctor.name}</span>}
                          </div>
                          {c.diagnosis && <div className="text-xs font-semibold text-slate-700 mt-1">Diagnosis: {c.diagnosis}</div>}
                          {c.notes && <div className="text-xs text-slate-500 mt-0.5 max-w-sm">{c.notes}</div>}
                        </div>
                      </div>
                      {c.status && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-violet-100 text-violet-800 border border-violet-200">{c.status}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Lab Reports */}
          <SectionCard
            icon={<FlaskConical className="w-5 h-5 text-amber-600" />}
            title="Lab Reports"
            count={labReports.length}
            accent="bg-amber-100 text-amber-700"
          >
            {labReports.length === 0 ? <EmptyState label="No lab reports found." /> : (
              <div className="divide-y divide-slate-100">
                {labReports.map((r: any) => (
                  <div
                    key={r._id}
                    onClick={() => setSelectedLabReport(r)}
                    className="p-4 hover:bg-amber-50/50 cursor-pointer transition-colors flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          Report #{r.mrn}
                          {r.isFlagged && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">Flagged</span>}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 font-medium">
                          {fDate(r.date)}
                          {r.panels?.length > 0 && <span className="ml-2 font-semibold text-slate-700">• {r.panels.join(", ")}</span>}
                          {r.priority && <span className="ml-2 text-amber-700">• Priority: {r.priority}</span>}
                        </div>
                        {r.technician && <div className="text-xs text-slate-500 mt-0.5">Technician: {r.technician}</div>}
                      </div>
                    </div>
                    <LabStatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Row 3: Pharmacy Orders + Billing Records ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Pharmacy Orders */}
          <SectionCard
            icon={<Pill className="w-5 h-5 text-teal-600" />}
            title="Pharmacy Orders"
            count={orders.length}
            accent="bg-teal-100 text-teal-700"
          >
            {orders.length === 0 ? <EmptyState label="No pharmacy orders found." /> : (
              <div className="divide-y divide-slate-100">
                {orders.map((o: any) => (
                  <div
                    key={o._id}
                    onClick={() => setSelectedPharmacyOrder(o)}
                    className="p-4 hover:bg-teal-50/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            {o.mrn}
                            <OrderStatusBadge status={o.status} />
                          </div>
                          <div className="text-xs text-slate-600 mt-1 font-medium">
                            {fDate(o.createdAt)}
                            {o.doctorName && o.doctorName !== "-" && <span className="ml-2">• Dr. {o.doctorName}</span>}
                            {o.priority && <span className="ml-2 text-teal-700">• {o.priority}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <span className="font-semibold text-slate-700">{o.items?.length ?? 0} item{o.items?.length === 1 ? "" : "s"}</span>
                        <div className="text-xs mt-0.5">
                          <span className={`font-bold ${o.paymentStatus === "Paid" ? "text-emerald-700" : "text-rose-600"}`}>
                            {o.paymentStatus}
                          </span>
                          {o.paidAmount > 0 && <span className="font-semibold text-slate-800"> — {formatINR(o.paidAmount)}</span>}
                        </div>
                      </div>
                    </div>
                    {o.items?.length > 0 && (
                      <div className="mt-3 ml-12 flex flex-wrap gap-1.5">
                        {o.items.map((it: any, idx: number) => (
                          <span key={idx} className="text-[11px] font-medium px-2.5 py-0.5 bg-teal-50 text-teal-800 rounded-md border border-teal-200">
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

          {/* Billing Records */}
          <SectionCard
            icon={<Receipt className="w-5 h-5 text-indigo-600" />}
            title="Billing Records"
            count={billings.length}
            accent="bg-indigo-100 text-indigo-700"
          >
            {billings.length === 0 ? <EmptyState label="No billing records found." /> : (
              <div className="divide-y divide-slate-100">
                {billings.map((b: any) => {
                  const isReturn = b.transactionType === "Return";
                  const itemsTotal = b.items.reduce((s: number, it: any) => s + (it.total || 0), 0);
                  const paid = (b.cash || 0) + (b.online || 0) + (b.insurance || 0);
                  const net = itemsTotal - (b.discount || 0);
                  const due = Math.max(0, net - paid);
                  const docName =
                    typeof b.doctor === "object" && b.doctor
                      ? b.doctor.name || b.doctor.fullName
                      : typeof b.doctor === "string" && b.doctor !== "Self" && !/^[0-9a-fA-F]{24}$/.test(b.doctor)
                      ? b.doctor.startsWith("Dr.")
                        ? b.doctor.replace(/^Dr\.\s*/, "")
                        : b.doctor
                      : null;
                  const isCompleted = b.status === "Completed" || due <= 0;

                  return (
                    <div
                      key={b._id}
                      onClick={() => setSelectedBillingRecord(b)}
                      className="p-4 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${isReturn ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}>
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              {b.mrn}
                              {isReturn
                                ? <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">Return</span>
                                : <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">Sale</span>
                              }
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${isCompleted ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"}`}>
                                {isCompleted ? "Completed" : (b.status || "Draft")}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 mt-1 font-medium">
                              {fDate(b.createdAt)}
                              {docName && <span className="ml-2">• Dr. {docName}</span>}
                              <span className="ml-2">• {b.items.length} item{b.items.length === 1 ? "" : "s"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-black text-slate-900">{formatINR(net)}</div>
                          <div className="text-xs mt-0.5 font-medium">
                            <span className="text-emerald-700 font-bold">Paid: {formatINR(paid)}</span>
                            {due > 0 && <span className="ml-2 text-rose-600 font-bold">Due: {formatINR(due)}</span>}
                          </div>
                        </div>
                      </div>
                      {b.items.length > 0 && (
                        <div className="mt-3 ml-12 flex flex-wrap gap-1.5">
                          {b.items.map((it: any, idx: number) => (
                            <span key={idx} className="text-[11px] font-medium px-2.5 py-0.5 bg-indigo-50 text-indigo-900 rounded-md border border-indigo-200">
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

      </div>

      {/* ── Detail Modals ─────────────────────────────────────────────── */}
      <LabReportDetailModal
        report={selectedLabReport}
        open={Boolean(selectedLabReport)}
        onOpenChange={(open) => !open && setSelectedLabReport(null)}
      />
      <PharmacyOrderDetailModal
        order={selectedPharmacyOrder}
        open={Boolean(selectedPharmacyOrder)}
        onOpenChange={(open) => !open && setSelectedPharmacyOrder(null)}
      />
      <BillingDetailModal
        billing={selectedBillingRecord}
        open={Boolean(selectedBillingRecord)}
        onOpenChange={(open) => !open && setSelectedBillingRecord(null)}
      />
      <ConsultationDetailModal
        consultation={selectedConsultation}
        open={Boolean(selectedConsultation)}
        onOpenChange={(open) => !open && setSelectedConsultation(null)}
      />

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
                      onChange={e => {
                        const val = e.target.value;
                        const oldVal = vitals.bp;
                        let newVal = val;
                        if (val.length > oldVal.length && !val.includes("/")) {
                          if (/^[12]\d{2}$/.test(val)) {
                            newVal = val + "/";
                          } else if (/^[3-9]\d$/.test(val)) {
                            newVal = val + "/";
                          }
                        }
                        setVitals(v => ({ ...v, bp: newVal }));
                      }}
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

