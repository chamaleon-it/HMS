"use client";
import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { fDate, fDateandTime, fAgeString } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import {
  ArrowLeft, User, Stethoscope, FlaskConical, Pill, Receipt,
  Calendar, Phone, MapPin, Droplets, AlertTriangle, Clock,
  XCircle, ChevronDown, ChevronUp, Loader2, HeartPulse,
  Thermometer, Activity, Wind, Weight, NotebookPen,
} from "lucide-react";
import {
  LabReportDetailModal,
  PharmacyOrderDetailModal,
  BillingDetailModal,
} from "@/components/shared/ip/IPRecordDetailModals";

const STATUS_COLORS: Record<string, string> = {
  Admitted: "bg-blue-100 text-blue-700 border-blue-200",
  "Under Observation": "bg-yellow-100 text-yellow-700 border-yellow-200",
  Surgery: "bg-red-100 text-red-700 border-red-200",
  Discharged: "bg-gray-100 text-gray-600 border-gray-200",
};

function Badge({ status, map }: { status: string; map: Record<string, string> }) {
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

function SectionCard({ icon, title, count, accent, children, defaultOpen = true }: {
  icon: React.ReactNode; title: string; count?: number; accent: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>{icon}</div>
          <span className="font-semibold text-gray-900 text-[15px]">{title}</span>
          {count !== undefined && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{count}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="border-t border-gray-100">{children}</div>}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value || "—"}</span>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="px-5 py-8 text-center text-gray-400 text-sm">{label}</div>;
}

const APPT_BADGE: Record<string, string> = {
  Upcoming: "bg-sky-100 text-sky-700", Consulted: "bg-violet-100 text-violet-700",
  Completed: "bg-emerald-100 text-emerald-700", "Not show": "bg-rose-100 text-rose-600",
  Observation: "bg-amber-100 text-amber-700", Admit: "bg-indigo-100 text-indigo-700",
};
const LAB_BADGE: Record<string, string> = {
  Upcoming: "bg-sky-100 text-sky-700", "Sample Collected": "bg-amber-100 text-amber-700",
  "Waiting For Result": "bg-orange-100 text-orange-700", Completed: "bg-emerald-100 text-emerald-700",
};
const ORDER_BADGE: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700", Filling: "bg-blue-100 text-blue-700",
  Ready: "bg-teal-100 text-teal-700", Completed: "bg-emerald-100 text-emerald-700",
  Failed: "bg-rose-100 text-rose-600", Canceled: "bg-gray-100 text-gray-500",
};

export default function AdminIPSingleClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [selectedLabReport, setSelectedLabReport] = useState<any | null>(null);
  const [selectedPharmacyOrder, setSelectedPharmacyOrder] = useState<any | null>(null);
  const [selectedBillingRecord, setSelectedBillingRecord] = useState<any | null>(null);

  const { data: ipData, isLoading } = useSWR(id ? `/in-patients/${id}` : null);
  const ip = ipData?.data;
  const patient = ip?.patientId;

  const { data: apptData } = useSWR(patient?._id ? `/appointments/patient/${patient._id}` : null);
  const appointments: any[] = (apptData?.data ?? []).slice().sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const { data: labData } = useSWR(patient?._id ? `/lab/report/patient/${patient._id}` : null);
  const labReports: any[] = (labData?.data ?? []).slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const { data: ordersData } = useSWR(patient?._id ? `/pharmacy/orders/patient/${patient._id}` : null);
  const orders: any[] = (ordersData?.data ?? []).slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const { data: billingData } = useSWR(patient?._id ? `/billing/single?q=${patient._id}` : null);
  const billings: any[] = (billingData?.data ?? []).slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const { data: consultData } = useSWR(patient?._id ? `/consultings/patient/${patient._id}` : null);
  const consultations: any[] = (consultData?.data ?? []).slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) return (
    <AppShell><div className="flex items-center justify-center h-[calc(100vh-120px)]"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div></AppShell>
  );
  if (!ip) return (
    <AppShell>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] gap-3">
        <XCircle className="w-12 h-12 text-rose-400" />
        <p className="text-gray-500 text-sm">In-patient record not found.</p>
        <button onClick={() => router.back()} className="text-sm text-blue-600 underline">Go back</button>
      </div>
    </AppShell>
  );

  const totalBilled = billings.filter(b => b.transactionType === "Sale").reduce((s, b) => s + b.items.reduce((a: number, it: any) => a + (it.total || 0), 0) - (b.discount || 0), 0);
  const totalPaid = billings.filter(b => b.transactionType === "Sale").reduce((s, b) => s + (b.cash || 0) + (b.online || 0) + (b.insurance || 0), 0);
  const totalDue = Math.max(0, totalBilled - totalPaid);
  const ipNotes: any[] = (ip.ipNotes ?? []).slice().reverse();

  return (
    <AppShell>
      <div className="p-5 flex flex-col gap-6 min-h-[calc(100vh-67px)] bg-gray-50/50">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/dashboard/admin/ip")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span className="text-gray-300">|</span>
            <h1 className="text-xl font-bold text-gray-900">In-Patient Record</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[ip.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {ip.status}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Read Only</span>
          </div>
          <span className="text-sm font-mono font-bold px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-700 shadow-sm">
            {ip.admissionNumber}
          </span>
        </div>

        {/* Hero Card */}
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
              {patient?.conditions?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {patient.conditions.map((c: string) => (
                    <span key={c} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />{c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
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

        {/* Financials */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Total Billed", value: formatINR(totalBilled), cls: "from-blue-50 to-indigo-50 text-indigo-700" },
            { label: "Total Paid", value: formatINR(totalPaid), cls: "from-emerald-50 to-teal-50 text-emerald-700" },
            { label: "Total Due", value: formatINR(totalDue), cls: "from-rose-50 to-pink-50 text-rose-700" },
          ].map(s => (
            <div key={s.label} className={`bg-linear-to-br ${s.cls} rounded-2xl p-4 border border-white shadow-sm`}>
              <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{s.label}</div>
              <div className="text-xl font-bold mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Quick Notes */}
        <SectionCard icon={<NotebookPen className="w-4 h-4 text-violet-600" />} title="Quick Notes & Vitals" count={ipNotes.length} accent="bg-violet-50">
          {ipNotes.length === 0 ? <Empty label="No notes recorded." /> : (
            <div className="divide-y divide-gray-50">
              {ipNotes.map((n: any, i: number) => (
                <div key={n._id ?? i} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{fDateandTime(n.createdAt)}</span>
                    {n.recordedBy?.name && <span>• {n.recordedBy.name}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {n.temp && <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 font-medium"><Thermometer className="w-3 h-3" />{n.temp}{n.tempUnit || "°C"}</span>}
                    {n.bp && <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 font-medium"><Activity className="w-3 h-3" />BP: {n.bp}</span>}
                    {n.hr && <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-100 font-medium"><HeartPulse className="w-3 h-3" />HR: {n.hr} bpm</span>}
                    {n.spo2 && <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 font-medium"><Wind className="w-3 h-3" />SpO₂: {n.spo2}%</span>}
                    {n.rr && <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100 font-medium"><Wind className="w-3 h-3" />RR: {n.rr}/min</span>}
                    {n.weight && <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-medium"><Weight className="w-3 h-3" />{n.weight} kg</span>}
                  </div>
                  {n.note && <p className="mt-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 leading-relaxed">{n.note}</p>}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Appointments & Consultations Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Appointments */}
          <SectionCard icon={<Calendar className="w-4 h-4 text-sky-600" />} title="Appointments" count={appointments.length} accent="bg-sky-50">
            {appointments.length === 0 ? <Empty label="No appointments." /> : (
              <div className="divide-y divide-gray-50">
                {appointments.map((a: any) => (
                  <div key={a._id} className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{fDate(a.date)} <span className="font-normal text-xs text-gray-400">{a.method}</span></div>
                      <div className="text-xs text-gray-500 mt-0.5">{a.type}{a.doctor?.name && ` • Dr. ${a.doctor.name}`}</div>
                    </div>
                    <Badge status={a.status} map={APPT_BADGE} />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Consultations */}
          <SectionCard icon={<Stethoscope className="w-4 h-4 text-violet-600" />} title="Visits / Consultations" count={consultations.length} accent="bg-violet-50">
            {consultations.length === 0 ? <Empty label="No consultation records." /> : (
              <div className="divide-y divide-gray-50">
                {consultations.map((c: any, i: number) => (
                  <div key={c._id ?? i} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="text-sm font-semibold text-gray-800">{fDate(c.date ?? c.createdAt)}{c.doctor?.name && <span className="font-normal text-xs text-gray-400 ml-2">Dr. {c.doctor.name}</span>}</div>
                    {c.diagnosis && <div className="text-xs text-gray-500 mt-0.5">Diagnosis: {c.diagnosis}</div>}
                    {c.notes && <div className="text-xs text-gray-400 mt-0.5">{c.notes}</div>}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Lab Reports & Pharmacy Orders Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Lab Reports */}
          <SectionCard icon={<FlaskConical className="w-4 h-4 text-amber-600" />} title="Lab Reports" count={labReports.length} accent="bg-amber-50">
            {labReports.length === 0 ? <Empty label="No lab reports." /> : (
              <div className="divide-y divide-gray-50">
                {labReports.map((r: any) => (
                  <div
                    key={r._id}
                    onClick={() => setSelectedLabReport(r)}
                    className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-amber-50/50 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Report #{r.mrn}{r.isFlagged && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">Flagged</span>}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{fDate(r.date)}{r.panels?.length > 0 && ` • ${r.panels.join(", ")}`}</div>
                    </div>
                    <Badge status={r.status} map={LAB_BADGE} />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Pharmacy Orders */}
          <SectionCard icon={<Pill className="w-4 h-4 text-teal-600" />} title="Pharmacy Orders" count={orders.length} accent="bg-teal-50">
            {orders.length === 0 ? <Empty label="No pharmacy orders." /> : (
              <div className="divide-y divide-gray-50">
                {orders.map((o: any) => (
                  <div
                    key={o._id}
                    onClick={() => setSelectedPharmacyOrder(o)}
                    className="px-5 py-3.5 hover:bg-teal-50/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">{o.mrn}<Badge status={o.status} map={ORDER_BADGE} /></div>
                        <div className="text-xs text-gray-500 mt-0.5">{fDate(o.createdAt)}{o.doctorName && o.doctorName !== "-" && ` • Dr. ${o.doctorName}`}</div>
                      </div>
                      <span className={`text-xs font-semibold ${o.paymentStatus === "Paid" ? "text-emerald-600" : "text-rose-500"}`}>{o.paymentStatus}</span>
                    </div>
                    {o.items?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {o.items.map((it: any, idx: number) => (
                          <span key={idx} className="text-[11px] px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-100">{it.name?.name ?? it.name} × {it.quantity}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Billing */}
        <SectionCard icon={<Receipt className="w-4 h-4 text-indigo-600" />} title="Billing Records" count={billings.length} accent="bg-indigo-50">
          {billings.length === 0 ? <Empty label="No billing records." /> : (
            <div className="divide-y divide-gray-50">
              {billings.map((b: any) => {
                const net = b.items.reduce((s: number, it: any) => s + (it.total || 0), 0) - (b.discount || 0);
                const paid = (b.cash || 0) + (b.online || 0) + (b.insurance || 0);
                return (
                  <div
                    key={b._id}
                    onClick={() => setSelectedBillingRecord(b)}
                    className="px-5 py-3.5 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          {b.mrn}
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${b.transactionType === "Return" ? "bg-rose-100 text-rose-600" : "bg-indigo-100 text-indigo-600"}`}>{b.transactionType}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{fDate(b.createdAt)} • {b.items.length} item{b.items.length !== 1 ? "s" : ""}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{formatINR(net)}</div>
                        <div className="text-xs text-emerald-600 font-medium">Paid: {formatINR(paid)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

      </div>

      {/* Detail Modals */}
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
    </AppShell>
  );
}
