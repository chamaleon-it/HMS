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
  X, NotebookPen, Bed, Smartphone, CheckCircle2, AlertCircle, FileText, Sparkles
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

function EmptyState({ label }: { label: string }) {
  return (
    <div className="px-5 py-8 text-center text-slate-400 text-sm font-medium">{label}</div>
  );
}

export default function DoctorIPDetailsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const { data: ipData, isLoading, mutate: mutateIP } = useSWR(id ? `/in-patients/${id}` : null);
  const ip = ipData?.data;

  const [statusOpen, setStatusOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const [selectedLabReport, setSelectedLabReport] = useState<any | null>(null);
  const [selectedPharmacyOrder, setSelectedPharmacyOrder] = useState<any | null>(null);
  const [selectedBillingRecord, setSelectedBillingRecord] = useState<any | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<any | null>(null);

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

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-(--color-synapse-light)" />
          <p className="text-sm font-medium">Loading In-Patient record...</p>
        </div>
      </AppShell>
    );
  }

  if (!ip) {
    return (
      <AppShell>
        <div className="p-6">
          <button
            onClick={() => router.push("/dashboard/doctor/ip/")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to In-Patients
          </button>
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900">In-Patient Record Not Found</h2>
            <p className="text-slate-500 text-sm mt-1">The requested IP record could not be loaded or doesn't exist.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const patient = ip.patientId;
  const doctor = ip.doctorId;
  const notesList: any[] = ip.dailyNotes || [];
  const consultations: any[] = ip.records?.consultations || [];
  const labReports: any[] = ip.records?.labReports || [];
  const pharmacyOrders: any[] = ip.records?.pharmacyOrders || [];
  const billings: any[] = ip.records?.billings || [];

  return (
    <AppShell>
      <div className="p-6 max-w-[1600px] mx-auto space-y-6 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/doctor/ip/")}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  {ip.admissionNumber}
                </h1>
                <IPStatusBadge status={ip.status} />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Admitted {fDateandTime(ip.admissionDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setNoteOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-(--color-synapse-light) to-(--color-synapse-purple) text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
            >
              <NotebookPen className="w-4 h-4" /> Add Doctor Note & Vitals
            </button>

            <div className="relative" ref={statusRef}>
              <button
                type="button"
                onClick={() => setStatusOpen(!statusOpen)}
                disabled={updatingStatus}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {updatingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Change Status</span>
                    <ChevronDown className="w-4 h-4 opacity-80" />
                  </>
                )}
              </button>

              {statusOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Update IP Status
                  </div>
                  {IP_STATUSES.map((st) => (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => handleStatusChange(st.value)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${
                        ip.status === st.value
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${st.color}`} />
                        <span>{st.label}</span>
                      </div>
                      {ip.status === st.value && <Check className="w-3.5 h-3.5 text-slate-700" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-(--color-synapse-light) flex items-center justify-center font-black text-lg shadow-2xs">
                  {patient?.name?.charAt(0) ?? "?"}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg leading-tight">{patient?.name ?? "—"}</h2>
                  <p className="text-xs text-slate-500 font-medium">MRN: {patient?.mrn || "—"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <InfoTile label="Gender" value={patient?.gender} icon={<User className="w-3.5 h-3.5" />} />
              <InfoTile label="Age" value={fAgeString(patient?.dateOfBirth)} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoTile label="Blood Group" value={patient?.blood} icon={<Droplets className="w-3.5 h-3.5 text-rose-500" />} bg="bg-rose-50/40" textColor="text-rose-700" />
              <InfoTile label="Phone" value={patient?.phoneNumber} icon={<Phone className="w-3.5 h-3.5" />} />
            </div>

            {patient?.allergies && patient?.allergies !== "None" && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] block text-rose-900">Allergies</span>
                  <span className="font-semibold">{patient.allergies}</span>
                </div>
              </div>
            )}

            {patient?.address && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 text-xs flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="font-medium">{patient.address}</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-2xs">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base leading-tight">Room & Bed Allocation</h2>
                <p className="text-xs text-slate-500">Current stay information</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <InfoTile label="Ward" value={ip.ward} bg="bg-indigo-50/40" textColor="text-indigo-950 font-bold" />
              <InfoTile label="Room" value={ip.room} bg="bg-indigo-50/40" textColor="text-indigo-950 font-bold" />
              <InfoTile label="Bed" value={ip.bed} bg="bg-indigo-50/40" textColor="text-indigo-950 font-bold" />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Attending Doctor</span>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {doctor?.name ? `Dr. ${doctor.name}` : "Not Assigned"}
                  </div>
                  {doctor?.email && <div className="text-xs text-slate-500">{doctor.email}</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-2xs">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base leading-tight">Clinical Summary</h2>
                <p className="text-xs text-slate-500">Admission notes & diagnosis</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Admission Diagnosis</span>
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-slate-900 text-sm font-semibold">
                  {ip.diagnosis || "No primary diagnosis specified"}
                </div>
              </div>

              {ip.notes && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Admission Notes</span>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 text-xs font-medium leading-relaxed">
                    {ip.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SectionCard
            icon={<NotebookPen className="w-4 h-4 text-amber-700" />}
            title="Doctor Daily Notes & Vitals Flowsheet"
            count={notesList.length}
            accent="bg-amber-100 text-amber-800"
          >
            {notesList.length === 0 ? (
              <EmptyState label="No daily progress notes or vitals recorded yet." />
            ) : (
              <div className="divide-y divide-slate-100">
                {notesList.map((n: any, idx: number) => (
                  <div key={idx} className="p-5 hover:bg-slate-50/50 transition-colors space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{fDateandTime(n.createdAt)}</span>
                      </div>
                    </div>

                    {(n.temp || n.bp || n.hr || n.spo2 || n.rr || n.weight) && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {n.temp && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold">
                            <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                            <span>Temp: {n.temp} {n.tempUnit || "°C"}</span>
                          </div>
                        )}
                        {n.bp && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-900 text-xs font-semibold">
                            <Activity className="w-3.5 h-3.5 text-rose-600" />
                            <span>BP: {n.bp} mmHg</span>
                          </div>
                        )}
                        {n.hr && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-900 text-xs font-semibold">
                            <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                            <span>HR: {n.hr} bpm</span>
                          </div>
                        )}
                        {n.spo2 && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200/80 text-sky-900 text-xs font-semibold">
                            <Wind className="w-3.5 h-3.5 text-sky-600" />
                            <span>SpO2: {n.spo2}%</span>
                          </div>
                        )}
                        {n.rr && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-semibold">
                            <Activity className="w-3.5 h-3.5 text-emerald-600" />
                            <span>RR: {n.rr} /min</span>
                          </div>
                        )}
                        {n.weight && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-xs font-semibold">
                            <Weight className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Wt: {n.weight} kg</span>
                          </div>
                        )}
                      </div>
                    )}

                    {n.note && (
                      <p className="text-sm font-medium text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                        {n.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={<Stethoscope className="w-4 h-4 text-violet-700" />}
            title="Outpatient Consultations History"
            count={consultations.length}
            accent="bg-violet-100 text-violet-800"
          >
            {consultations.length === 0 ? (
              <EmptyState label="No consultation records attached." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Doctor</th>
                      <th className="py-3 px-5">Type</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {consultations.map((c: any) => (
                      <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-5 text-slate-900 font-semibold">{fDateandTime(c.date)}</td>
                        <td className="py-3 px-5 text-slate-700">{c.doctor?.name ? `Dr. ${c.doctor.name}` : "—"}</td>
                        <td className="py-3 px-5 text-slate-600">{c.type || "New"}</td>
                        <td className="py-3 px-5"><ApptStatusBadge status={c.status} /></td>
                        <td className="py-3 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedConsultation(c)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-(--color-synapse-light) hover:underline cursor-pointer"
                          >
                            <span>View Summary</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={<FlaskConical className="w-4 h-4 text-amber-700" />}
            title="Laboratory & Imaging Reports"
            count={labReports.length}
            accent="bg-amber-100 text-amber-800"
          >
            {labReports.length === 0 ? (
              <EmptyState label="No lab or imaging orders recorded for this patient." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Tests / Panels</th>
                      <th className="py-3 px-5">Doctor</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {labReports.map((l: any) => (
                      <tr key={l._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-5 text-slate-900 font-semibold">{fDate(l.createdAt)}</td>
                        <td className="py-3 px-5 text-slate-800 font-semibold">
                          {l.test?.map((t: any) => t.name).join(", ") || "Lab Tests"}
                        </td>
                        <td className="py-3 px-5 text-slate-700">{l.doctor?.name ? `Dr. ${l.doctor.name}` : "—"}</td>
                        <td className="py-3 px-5"><LabStatusBadge status={l.status} /></td>
                        <td className="py-3 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedLabReport(l)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-(--color-synapse-light) hover:underline cursor-pointer"
                          >
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={<Pill className="w-4 h-4 text-emerald-700" />}
            title="Pharmacy Orders & Medication Dispensing"
            count={pharmacyOrders.length}
            accent="bg-emerald-100 text-emerald-800"
          >
            {pharmacyOrders.length === 0 ? (
              <EmptyState label="No pharmacy orders issued for this patient." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-5">Rx Number</th>
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Items</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {pharmacyOrders.map((p: any) => (
                      <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-5 font-bold text-slate-900">{p.rxNumber}</td>
                        <td className="py-3 px-5 text-slate-700">{fDate(p.createdAt)}</td>
                        <td className="py-3 px-5 text-slate-800">{p.items?.length ?? 0} Item(s)</td>
                        <td className="py-3 px-5"><OrderStatusBadge status={p.status} /></td>
                        <td className="py-3 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedPharmacyOrder(p)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-(--color-synapse-light) hover:underline cursor-pointer"
                          >
                            <span>View Prescription</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={<Receipt className="w-4 h-4 text-sky-700" />}
            title="Invoices & Financial Records"
            count={billings.length}
            accent="bg-sky-100 text-sky-800"
          >
            {billings.length === 0 ? (
              <EmptyState label="No billing invoices recorded." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-5">Invoice No</th>
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Total</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {billings.map((b: any) => (
                      <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-5 font-bold text-slate-900">{b.invoiceNumber || "DRAFT"}</td>
                        <td className="py-3 px-5 text-slate-700">{fDate(b.createdAt)}</td>
                        <td className="py-3 px-5 font-bold text-slate-900">{formatINR(b.grandTotal || b.totalAmount || 0)}</td>
                        <td className="py-3 px-5">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${b.status === "Paid" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"}`}>
                            {b.status || "Draft"}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedBillingRecord(b)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-(--color-synapse-light) hover:underline cursor-pointer"
                          >
                            <span>View Bill</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {noteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <NotebookPen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Record Doctor Progress Note & Vitals</h3>
                  <p className="text-xs text-slate-500">Document daily rounds or patient observation</p>
                </div>
              </div>
              <button
                onClick={() => { setNoteOpen(false); resetNoteForm(); }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Patient Vitals</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Temp</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="98.6"
                        value={vitals.temp}
                        onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                        className="w-full text-xs font-semibold px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-(--color-synapse-light)"
                      />
                      <select
                        value={vitals.tempUnit}
                        onChange={(e) => setVitals({ ...vitals, tempUnit: e.target.value })}
                        className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-1.5 focus:outline-none"
                      >
                        <option value="°C">°C</option>
                        <option value="°F">°F</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={vitals.bp}
                      onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                      className="w-full text-xs font-semibold px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-(--color-synapse-light)"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Heart Rate (bpm)</label>
                    <input
                      type="text"
                      placeholder="72"
                      value={vitals.hr}
                      onChange={(e) => setVitals({ ...vitals, hr: e.target.value })}
                      className="w-full text-xs font-semibold px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-(--color-synapse-light)"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">SpO2 (%)</label>
                    <input
                      type="text"
                      placeholder="98"
                      value={vitals.spo2}
                      onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                      className="w-full text-xs font-semibold px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-(--color-synapse-light)"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Resp Rate (/min)</label>
                    <input
                      type="text"
                      placeholder="16"
                      value={vitals.rr}
                      onChange={(e) => setVitals({ ...vitals, rr: e.target.value })}
                      className="w-full text-xs font-semibold px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-(--color-synapse-light)"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Weight (kg)</label>
                    <input
                      type="text"
                      placeholder="65"
                      value={vitals.weight}
                      onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                      className="w-full text-xs font-semibold px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-(--color-synapse-light)"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Progress Note & Instructions
                </label>
                <textarea
                  rows={4}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter clinical observations, treatment modifications, or nursing notes..."
                  className="w-full p-3 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-(--color-synapse-light) resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setNoteOpen(false); resetNoteForm(); }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingNote}
                onClick={handleSaveNote}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Save Note</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedLabReport && (
        <LabReportDetailModal
          report={selectedLabReport}
          open={!!selectedLabReport}
          onOpenChange={(v) => !v && setSelectedLabReport(null)}
        />
      )}

      {selectedPharmacyOrder && (
        <PharmacyOrderDetailModal
          order={selectedPharmacyOrder}
          open={!!selectedPharmacyOrder}
          onOpenChange={(v) => !v && setSelectedPharmacyOrder(null)}
        />
      )}

      {selectedBillingRecord && (
        <BillingDetailModal
          billing={selectedBillingRecord}
          open={!!selectedBillingRecord}
          onOpenChange={(v) => !v && setSelectedBillingRecord(null)}
        />
      )}

      {selectedConsultation && (
        <ConsultationDetailModal
          consultation={selectedConsultation}
          open={!!selectedConsultation}
          onOpenChange={(v) => !v && setSelectedConsultation(null)}
        />
      )}
    </AppShell>
  );
}
