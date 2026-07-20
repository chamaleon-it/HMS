"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FlaskConical,
  Pill,
  Receipt,
  Calendar,
  Stethoscope,
  Clock,
  AlertTriangle,
  User,
  CheckCircle2,
  FileText,
  CreditCard,
  ShieldCheck,
  HeartPulse,
  Thermometer,
  Activity,
  Wind,
  Weight,
} from "lucide-react";
import { fDate } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";

// ── Status Badges ─────────────────────────────────────────────────────────────

export const OrderStatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Ready: "bg-teal-100 text-teal-800 border-teal-200",
    Filling: "bg-sky-100 text-sky-800 border-sky-200",
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Canceled: "bg-rose-100 text-rose-800 border-rose-200",
    Failed: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${styles[status] ?? "bg-gray-100 text-gray-700 border-gray-200"
        }`}
    >
      {status}
    </span>
  );
};

export const LabStatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    In_Progress: "bg-amber-100 text-amber-800 border-amber-200",
    Sample_Collected: "bg-sky-100 text-sky-800 border-sky-200",
    Pending: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${styles[status] ?? "bg-gray-100 text-gray-700 border-gray-200"
        }`}
    >
      {status?.replace(/_/g, " ")}
    </span>
  );
};

export const PaymentStatusBadge = ({ status }: { status: string }) => {
  const isPaid = status === "Paid";
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${isPaid
        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
        : "bg-rose-100 text-rose-800 border-rose-200"
        }`}
    >
      {status}
    </span>
  );
};

// ── 1. Lab Report Modal ───────────────────────────────────────────────────────

interface LabReportDetailModalProps {
  report: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LabReportDetailModal: React.FC<LabReportDetailModalProps> = ({
  report,
  open,
  onOpenChange,
}) => {
  if (!report) return null;

  const rawTests = report.test ?? report.testResults ?? report.results ?? report.tests ?? [];

  const testResults = rawTests.map((t: any, idx: number) => {
    const testObj = typeof t.name === "object" && t.name !== null ? t.name : null;
    const testName =
      testObj?.name ??
      t.testName ??
      (typeof t.name === "string" ? t.name : `Test #${idx + 1}`);

    const valRaw = t.value ?? t.result ?? t.observedValue;
    const hasValue = valRaw !== undefined && valRaw !== null && String(valRaw).trim() !== "";
    const value = hasValue ? String(valRaw).trim() : null;

    const unit = testObj?.unit ?? t.unit ?? "";

    let referenceRange = testObj?.referenceRange ?? t.referenceRange ?? t.range ?? "";
    if (!referenceRange && testObj?.range && Array.isArray(testObj.range) && testObj.range.length > 0) {
      const r = testObj.range[0];
      if (r.upto !== undefined && r.upto !== null && r.upto !== "") {
        referenceRange = `Up to ${r.upto}`;
      } else if (r.min !== undefined && r.max !== undefined && r.min !== "" && r.max !== "") {
        referenceRange = `${r.min} - ${r.max}`;
      } else if (r.min !== undefined && r.min !== "") {
        referenceRange = `>${r.min}`;
      } else if (r.max !== undefined && r.max !== "") {
        referenceRange = `<${r.max}`;
      }
    }
    if (typeof referenceRange !== "string") {
      referenceRange = "";
    }

    let isAbnormal = Boolean(t.isAbnormal || t.isFlagged);
    if (!isAbnormal && hasValue && testObj?.range?.[0]) {
      const numVal = parseFloat(valRaw);
      const r = testObj.range[0];
      if (!isNaN(numVal)) {
        if (r.min !== undefined && r.min !== null && r.min !== "" && numVal < parseFloat(r.min)) isAbnormal = true;
        if (r.max !== undefined && r.max !== null && r.max !== "" && numVal > parseFloat(r.max)) isAbnormal = true;
        if (r.upto !== undefined && r.upto !== null && r.upto !== "" && numVal > parseFloat(r.upto)) isAbnormal = true;
      }
    }

    return {
      testName,
      value,
      hasValue,
      unit,
      referenceRange,
      isAbnormal,
    };
  });

  const noteText = report.note ?? report.notes ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] h-auto flex flex-col p-0 rounded-2xl border-0 shadow-2xl overflow-hidden">
        {/* Sticky Modal Header */}
        <div className="bg-linear-to-r from-amber-600 to-amber-700 p-6 text-white rounded-t-2xl shrink-0">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">
                    Lab Report #{report.mrn}
                  </DialogTitle>
                  <p className="text-xs text-amber-100 mt-0.5">
                    Detailed laboratory analysis report
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LabStatusBadge status={report.status} />
                {report.isFlagged && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500 text-white border border-rose-400">
                    Flagged
                  </span>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4 bg-slate-50/50 flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Sticky Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs shrink-0">
            <div>
              <p className="text-xs font-medium text-gray-500">Date & Time</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {fDate(report.date ?? report.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Priority</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {report.priority || "Normal"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Technician</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {report.technician || "N/A"}
              </p>
            </div>
            {report.doctor?.name && (
              <div>
                <p className="text-xs font-medium text-gray-500">Prescribed By</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  Dr. {report.doctor.name}
                </p>
              </div>
            )}
            {report.sampleId && (
              <div>
                <p className="text-xs font-medium text-gray-500">Sample ID</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  {report.sampleId}
                </p>
              </div>
            )}
            {report.sampleType && (
              <div>
                <p className="text-xs font-medium text-gray-500">Sample Type</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  {report.sampleType}
                </p>
              </div>
            )}
            {report.panels?.length > 0 && (
              <div className="col-span-2">
                <p className="text-xs font-medium text-gray-500">Panels / Categories</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {report.panels.map((p: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200/60"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Test Results Table Container (Only Table Scrolls) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden flex-1 min-h-0 flex flex-col">
            <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                Test Findings & Results
              </h4>
              <span className="text-xs text-gray-500 font-medium">
                {testResults.length} test{testResults.length === 1 ? "" : "s"} recorded
              </span>
            </div>

            {testResults.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No individual test parameters recorded yet.
              </div>
            ) : (
              <div className="overflow-y-auto overflow-x-auto flex-1 min-h-0 max-h-[320px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100 sticky top-0 z-10 shadow-xs">
                    <tr>
                      <th className="p-3 bg-gray-50">Test Name</th>
                      <th className="p-3 bg-gray-50">Observed Value</th>
                      <th className="p-3 bg-gray-50">Unit</th>
                      <th className="p-3 bg-gray-50">Ref. Range</th>
                      <th className="p-3 text-right bg-gray-50">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {testResults.map((t: any, idx: number) => (
                      <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                        <td className="p-3 font-semibold text-gray-900">
                          {t.testName}
                        </td>
                        <td className="p-3">
                          {t.hasValue ? (
                            <span className={`font-bold ${t.isAbnormal ? "text-rose-600" : "text-gray-900"}`}>
                              {t.value}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic font-normal">Pending</span>
                          )}
                        </td>
                        <td className="p-3 text-gray-500">
                          {t.unit ? (
                            <span dangerouslySetInnerHTML={{ __html: t.unit }} />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-3 text-gray-500">
                          {t.referenceRange ? (
                            <span dangerouslySetInnerHTML={{ __html: t.referenceRange }} />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {!t.hasValue ? (
                            <span className="text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                              Pending
                            </span>
                          ) : t.isAbnormal ? (
                            <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Abnormal
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sticky Notes / Remarks */}
          {noteText && (
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 shrink-0">
              <p className="text-xs font-bold text-amber-800">Technician Remarks & Notes</p>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed whitespace-pre-wrap">{noteText}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── 2. Pharmacy Order Modal ───────────────────────────────────────────────────

interface PharmacyOrderDetailModalProps {
  order: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PharmacyOrderDetailModal: React.FC<PharmacyOrderDetailModalProps> = ({
  order,
  open,
  onOpenChange,
}) => {
  if (!order) return null;

  const items = order.items ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] h-auto flex flex-col p-0 rounded-2xl border-0 shadow-2xl overflow-hidden">
        {/* Sticky Modal Header */}
        <div className="bg-linear-to-r from-teal-600 to-teal-700 p-6 text-white rounded-t-2xl shrink-0">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">
                    Pharmacy Order #{order.mrn}
                  </DialogTitle>
                  <p className="text-xs text-teal-100 mt-0.5">
                    Medication prescription and fulfillment details
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4 bg-slate-50/50 flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Sticky Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs shrink-0">
            <div>
              <p className="text-xs font-medium text-gray-500">Order Date</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {fDate(order.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Doctor</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {order.doctorName && order.doctorName !== "-"
                  ? `Dr. ${order.doctorName}`
                  : order.doctor?.name
                    ? `Dr. ${order.doctor.name}`
                    : "Self"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Priority</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {order.priority || "Normal"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Bill Number</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {order.billNo && order.billNo !== "-" ? order.billNo : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Paid Amount</p>
              <p className="text-sm font-bold text-emerald-600 mt-0.5">
                {formatINR(order.paidAmount || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Assigned To</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {order.assignedTo || "Unassigned"}
              </p>
            </div>
          </div>

          {/* Prescribed Items Table Container (Only Table Scrolls) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden flex-1 min-h-0 flex flex-col">
            <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                Prescribed Medicines
              </h4>
              <span className="text-xs text-gray-500">
                {items.length} item{items.length === 1 ? "" : "s"}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No items listed in this pharmacy order.
              </div>
            ) : (
              <div className="overflow-y-auto overflow-x-auto flex-1 min-h-0 max-h-[320px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100 sticky top-0 z-10 shadow-xs">
                    <tr>
                      <th className="p-3 bg-gray-50">Sl</th>
                      <th className="p-3 bg-gray-50">Medicine Name</th>
                      <th className="p-3 bg-gray-50">Dosage</th>
                      <th className="p-3 bg-gray-50">Frequency</th>
                      <th className="p-3 bg-gray-50">Food</th>
                      <th className="p-3 text-right bg-gray-50">Qty</th>
                      <th className="p-3 text-right bg-gray-50">Packed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {items.map((it: any, idx: number) => {
                      const itemName = it.name?.name ?? it.name ?? `Medicine #${idx + 1}`;
                      return (
                        <tr key={idx} className="hover:bg-teal-50/30 transition-colors">
                          <td className="p-3 text-gray-400 font-medium">{idx + 1}</td>
                          <td className="p-3 font-semibold text-gray-900">{itemName}</td>
                          <td className="p-3 text-gray-600">{it.dosage || "-"}</td>
                          <td className="p-3 text-gray-600">{it.frequency || "-"}</td>
                          <td className="p-3 text-gray-600">{it.food || "-"}</td>
                          <td className="p-3 text-right font-bold text-gray-900">
                            {it.quantity}
                          </td>
                          <td className="p-3 text-right">
                            {it.isPacked ? (
                              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                                Yes
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">
                                No
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {order.paymentReference && order.paymentReference !== "-" && (
            <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-100 text-xs text-teal-800 flex items-center justify-between shrink-0">
              <span className="font-semibold">Payment Reference:</span>
              <span className="font-mono font-bold">{order.paymentReference}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── 3. Billing Record Modal ───────────────────────────────────────────────────

interface BillingDetailModalProps {
  billing: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BillingDetailModal: React.FC<BillingDetailModalProps> = ({
  billing,
  open,
  onOpenChange,
}) => {
  if (!billing) return null;

  const isReturn = billing.transactionType === "Return";
  const items = billing.items ?? [];
  const itemsTotal = items.reduce((s: number, it: any) => s + (it.total || 0), 0);
  const paid = (billing.cash || 0) + (billing.online || 0) + (billing.insurance || 0);
  const discount = billing.discount || 0;
  const net = itemsTotal - discount;
  const due = Math.max(0, net - paid);

  const doctorDisplayName = React.useMemo(() => {
    const d = billing.doctor;
    if (!d) return "Self";
    if (typeof d === "object") {
      const name = d.name || d.fullName;
      if (name) return name.startsWith("Dr.") ? name : `Dr. ${name}`;
    }
    if (typeof d === "string") {
      if (d === "Self" || d === "-" || !d.trim()) return "Self";
      if (/^[0-9a-fA-F]{24}$/.test(d)) {
        return billing.doctorName ? (billing.doctorName.startsWith("Dr.") ? billing.doctorName : `Dr. ${billing.doctorName}`) : "Assigned Doctor";
      }
      return d.startsWith("Dr.") ? d : `Dr. ${d}`;
    }
    return "Self";
  }, [billing]);

  const isPaidInFull = due <= 0;
  const computedStatus = billing.status === "Completed" || isPaidInFull ? "Completed" : (paid > 0 ? "Partial" : (billing.status || "Draft"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] h-auto flex flex-col p-0 rounded-2xl border-0 shadow-2xl overflow-hidden">
        {/* Sticky Modal Header */}
        <div
          className={`p-6 text-white rounded-t-2xl shrink-0 ${isReturn
            ? "bg-linear-to-r from-rose-600 to-rose-700"
            : "bg-linear-to-r from-indigo-600 to-indigo-700"
            }`}
        >
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">
                    Bill Invoice #{billing.mrn}
                  </DialogTitle>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    Official financial statement & transaction details
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${isReturn
                    ? "bg-rose-100 text-rose-800 border-rose-200"
                    : "bg-indigo-100 text-indigo-800 border-indigo-200"
                    }`}
                >
                  {billing.transactionType || "Sale"}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${computedStatus === "Completed"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : computedStatus === "Partial"
                      ? "bg-sky-100 text-sky-800 border-sky-200"
                      : "bg-amber-100 text-amber-800 border-amber-200"
                    }`}
                >
                  {computedStatus}
                </span>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4 bg-slate-50/50 flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Sticky Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs shrink-0">
            <div>
              <p className="text-xs font-medium text-gray-500">Bill Date</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {fDate(billing.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Doctor</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {doctorDisplayName}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Department</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {billing.department || "General"}
              </p>
            </div>
          </div>

          {/* Line Items Table Container (Only Table Scrolls) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden flex-1 min-h-0 flex flex-col">
            <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                Billed Items & Services
              </h4>
              <span className="text-xs text-gray-500">
                {items.length} item{items.length === 1 ? "" : "s"}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">No items on this bill.</div>
            ) : (
              <div className="overflow-y-auto overflow-x-auto flex-1 min-h-0 max-h-[280px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100 sticky top-0 z-10 shadow-xs">
                    <tr>
                      <th className="p-3 bg-gray-50">Sl</th>
                      <th className="p-3 bg-gray-50">Item Description</th>
                      <th className="p-3 text-right bg-gray-50">Unit Price</th>
                      <th className="p-3 text-right bg-gray-50">Qty</th>
                      <th className="p-3 text-right bg-gray-50">GST %</th>
                      <th className="p-3 text-right bg-gray-50">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {items.map((it: any, idx: number) => (
                      <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="p-3 text-gray-400 font-medium">{idx + 1}</td>
                        <td className="p-3 font-semibold text-gray-900">{it.name}</td>
                        <td className="p-3 text-right text-gray-600">
                          {formatINR(it.unitPrice || 0)}
                        </td>
                        <td className="p-3 text-right font-bold text-gray-900">{it.quantity}</td>
                        <td className="p-3 text-right text-gray-500">{it.gst ?? 0}%</td>
                        <td className="p-3 text-right font-bold text-gray-900">
                          {formatINR(it.total || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sticky Financial Breakdown */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3 shrink-0">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Payment Breakdown
            </h4>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">{formatINR(itemsTotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span className="font-semibold text-rose-600">-{formatINR(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t">
                <span>Net Total</span>
                <span>{formatINR(net)}</span>
              </div>
            </div>

            <div className="pt-3 border-t grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-gray-500 block">Cash Paid</span>
                <span className="font-semibold text-gray-800">
                  {formatINR(billing.cash || 0)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-gray-500 block">Online / UPI</span>
                <span className="font-semibold text-gray-800">
                  {formatINR(billing.online || 0)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-gray-500 block">Insurance</span>
                <span className="font-semibold text-gray-800">
                  {formatINR(billing.insurance || 0)}
                </span>
              </div>
              <div
                className={`p-2.5 rounded-lg border ${due > 0 ? "bg-rose-50 border-rose-100 text-rose-800" : "bg-emerald-50 border-emerald-100 text-emerald-800"
                  }`}
              >
                <span className="block opacity-75">Due Amount</span>
                <span className="font-bold">{formatINR(due)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── 4. Consultation / Visit Modal ─────────────────────────────────────────────

interface ConsultationDetailModalProps {
  consultation: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({
  consultation,
  open,
  onOpenChange,
}) => {
  if (!consultation) return null;

  const cNotes = consultation.consultationNotes || {};
  const exam = consultation.examinationNote || {};
  const medicines = consultation.medicines || [];
  const tests = consultation.test || [];

  const hasVitals = Boolean(
    exam.temp || exam.bp || exam.hr || exam.spo2 || exam.rs || exam.cvs || exam.pa || exam.cns || exam.otherNotes
  );
  const hasNotes = Boolean(
    cNotes.presentHistory || cNotes.pastHistory || cNotes.diagnosis
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] h-auto flex flex-col p-0 rounded-2xl border-0 shadow-2xl overflow-hidden">
        {/* Sticky Modal Header */}
        <div className="bg-linear-to-r from-violet-600 to-violet-700 p-6 text-white rounded-t-2xl shrink-0">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">
                    Consultation Details
                  </DialogTitle>
                  <p className="text-xs text-violet-100 mt-0.5">
                    Clinical record of patient visit
                  </p>
                </div>
              </div>
              {consultation.status && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-violet-100 text-violet-800 border-violet-200">
                  {consultation.status}
                </span>
              )}
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4 bg-slate-50/50 flex-1 min-h-0 flex flex-col overflow-y-auto">
          {/* Sticky Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs shrink-0">
            <div>
              <p className="text-xs font-medium text-gray-500">Visit Date</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {fDate(consultation.date ?? consultation.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Doctor</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {consultation.doctor?.name ? `Dr. ${consultation.doctor.name}` : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Specialization</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {consultation.doctor?.specialization || "General Medicine"}
              </p>
            </div>
          </div>

          {/* Clinical Notes (Diagnosis & History) */}
          {hasNotes && (
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Clinical Notes
              </h4>
              <div className="space-y-2">
                {cNotes.diagnosis && (
                  <div className="p-3 bg-violet-50/50 rounded-lg border border-violet-100/50">
                    <span className="text-[11px] font-bold text-violet-700 block uppercase tracking-wider">Diagnosis</span>
                    <span className="text-sm font-semibold text-gray-800 mt-0.5 block">{cNotes.diagnosis}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cNotes.presentHistory && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-[11px] font-semibold text-gray-500 block uppercase tracking-wider">Presenting History</span>
                      <p className="text-xs text-gray-700 mt-1 whitespace-pre-wrap">{cNotes.presentHistory}</p>
                    </div>
                  )}
                  {cNotes.pastHistory && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-[11px] font-semibold text-gray-500 block uppercase tracking-wider">Past History</span>
                      <p className="text-xs text-gray-700 mt-1 whitespace-pre-wrap">{cNotes.pastHistory}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vitals & Physical Examination */}
          {hasVitals && (
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Vitals & Examination
              </h4>
              {/* Vitals chips */}
              <div className="flex flex-wrap gap-2">
                {exam.temp && (
                  <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100 font-semibold">
                    <Thermometer className="w-3.5 h-3.5" /> Temp: {exam.temp}{exam.tempUnit || "°C"}
                  </span>
                )}
                {exam.bp && (
                  <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 font-semibold">
                    <Activity className="w-3.5 h-3.5" /> BP: {exam.bp}
                  </span>
                )}
                {exam.hr && (
                  <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-100 font-semibold">
                    <HeartPulse className="w-3.5 h-3.5" /> HR: {exam.hr} bpm
                  </span>
                )}
                {exam.spo2 && (
                  <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 font-semibold">
                    <Wind className="w-3.5 h-3.5" /> SpO₂: {exam.spo2}%
                  </span>
                )}
              </div>

              {/* Systemic Examination Details */}
              {(exam.rs || exam.cvs || exam.pa || exam.cns || exam.otherNotes) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-gray-50 text-xs">
                  {exam.rs && (
                    <div>
                      <span className="text-gray-500 font-medium">Respiratory System (RS):</span>
                      <p className="font-semibold text-gray-800 mt-0.5">{exam.rs}</p>
                    </div>
                  )}
                  {exam.cvs && (
                    <div>
                      <span className="text-gray-500 font-medium">Cardiovascular System (CVS):</span>
                      <p className="font-semibold text-gray-800 mt-0.5">{exam.cvs}</p>
                    </div>
                  )}
                  {exam.pa && (
                    <div>
                      <span className="text-gray-500 font-medium">Per Abdomen (P/A):</span>
                      <p className="font-semibold text-gray-800 mt-0.5">{exam.pa}</p>
                    </div>
                  )}
                  {exam.cns && (
                    <div>
                      <span className="text-gray-500 font-medium">Central Nervous System (CNS):</span>
                      <p className="font-semibold text-gray-800 mt-0.5">{exam.cns}</p>
                    </div>
                  )}
                  {exam.otherNotes && (
                    <div className="col-span-1 sm:col-span-2 p-2.5 bg-gray-50 border border-gray-100 rounded-lg">
                      <span className="text-gray-500 font-medium block">Examination Remarks:</span>
                      <p className="text-gray-700 mt-1 whitespace-pre-wrap">{exam.otherNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Medicines / Prescription Table */}
          {medicines.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-violet-600" />
                  Prescribed Medicines
                </h4>
                <span className="text-xs text-gray-500">
                  {medicines.length} item{medicines.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100 shadow-xs">
                    <tr>
                      <th className="p-3 bg-gray-50">Sl</th>
                      <th className="p-3 bg-gray-50">Medicine Name</th>
                      <th className="p-3 bg-gray-50">Dosage</th>
                      <th className="p-3 bg-gray-50">Frequency</th>
                      <th className="p-3 bg-gray-50">Food</th>
                      <th className="p-3 bg-gray-50">Duration</th>
                      <th className="p-3 text-right bg-gray-50">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {medicines.map((it: any, idx: number) => {
                      const itemName = it.name?.name ?? it.name ?? `Medicine #${idx + 1}`;
                      return (
                        <tr key={idx} className="hover:bg-violet-50/30 transition-colors">
                          <td className="p-3 text-gray-400 font-medium">{idx + 1}</td>
                          <td className="p-3 font-semibold text-gray-900">{itemName}</td>
                          <td className="p-3 text-gray-600">{it.dosage || "-"}</td>
                          <td className="p-3 text-gray-600">{it.frequency || "-"}</td>
                          <td className="p-3 text-gray-600">{it.food || "-"}</td>
                          <td className="p-3 text-gray-600">{it.duration || "-"}</td>
                          <td className="p-3 text-right font-bold text-gray-900">{it.quantity}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tests Prescribed */}
          {tests.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-violet-600" />
                  Prescribed Laboratory / Imaging Tests
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100 shadow-xs">
                    <tr>
                      <th className="p-3 bg-gray-50">Sl</th>
                      <th className="p-3 bg-gray-50">Test Name(s)</th>
                      <th className="p-3 bg-gray-50">Target Date</th>
                      <th className="p-3 bg-gray-50">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {tests.map((t: any, idx: number) => {
                      const testNames = Array.isArray(t.name)
                        ? t.name.map((n: any) => n.name ?? n).join(", ")
                        : t.name ?? "Test";
                      return (
                        <tr key={idx} className="hover:bg-violet-50/30 transition-colors">
                          <td className="p-3 text-gray-400 font-medium">{idx + 1}</td>
                          <td className="p-3 font-semibold text-gray-900">{testNames}</td>
                          <td className="p-3 text-gray-600">{fDate(t.date)}</td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.priority === "High" ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-700"
                              }`}>
                              {t.priority || "Normal"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Advice / Remarks & Follow Up */}
          {(consultation.advice || consultation.followUp) && (
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
              {consultation.advice && (
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Clinical Advice</span>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap leading-relaxed">{consultation.advice}</p>
                </div>
              )}
              {/* {consultation.followUp && (
                <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs text-violet-800">
                  <span className="font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Next Follow Up:
                  </span>
                  <span className="font-bold bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-100">
                    {fDate(consultation.followUp)}
                  </span>
                </div>
              )} */}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
