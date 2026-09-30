"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Calendar,
  Clock,
  Download,
  FileText,
  Loader2,
  Printer,
  RotateCcw,
  UserCheck,
  Receipt,
  User,
  Stethoscope,
  Layers,
  Sparkles,
} from "lucide-react";
import { fDate, fDateandTime } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import { TimelineDataType, TreatmentOrderType } from "./interface";
import PrintTreatmentTimeline from "./PrintTreatmentTimeline";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import toast from "react-hot-toast";

interface Props {
  treatmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRepeatClick?: (treatment: TreatmentOrderType) => void;
}

export default function TreatmentTimelineModal({
  treatmentId,
  open,
  onOpenChange,
  onRepeatClick,
}: Props) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: response, isLoading } = useSWR<{
    data: TimelineDataType;
    message: string;
  }>(open && treatmentId ? `/treatment/${treatmentId}/timeline` : null);

  const timelineData = response?.data;

  // Print Handler
  const handlePrint = () => {
    if (!timelineData) return;
    window.print();
  };

  // Download PDF Handler
  const handleDownloadPdf = async () => {
    if (!timelineData) return;
    const toastId = toast.loading("Generating High-Resolution Timeline PDF...");
    setIsDownloading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 350));

      const printElement = document.getElementById(
        "treatment-timeline-print-container"
      );
      if (!printElement) {
        throw new Error("Print container element not found");
      }

      const originalDisplay = printElement.style.display;
      const originalPosition = printElement.style.position;
      const originalWidth = printElement.style.width;

      printElement.style.display = "block";
      printElement.style.position = "absolute";
      printElement.style.left = "-9999px";
      printElement.style.top = "0";
      printElement.style.width = "794px";

      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(printElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: 794,
        style: {
          visibility: "visible",
          position: "static",
          display: "block",
          width: "794px",
          height: "auto",
          maxWidth: "none",
          maxHeight: "none",
          margin: "0",
          padding: "0",
          transform: "none",
          overflow: "visible",
        },
      });

      printElement.style.display = originalDisplay;
      printElement.style.position = originalPosition;
      printElement.style.left = "";
      printElement.style.top = "";
      printElement.style.width = originalWidth;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      const filename = `Treatment-Timeline-${timelineData.rootTreatment?.mrn || "Report"}.pdf`;
      pdf.save(filename);

      toast.success("Timeline PDF downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("Error generating timeline PDF:", err);
      toast.error("Failed to generate PDF. You can use Print instead.", {
        id: toastId,
      });
    } finally {
      setIsDownloading(false);
      setIsPrinting(false);
    }
  };

  if (!open) return null;

  const patient = timelineData?.patient;
  const doctor = timelineData?.doctor;
  const sessions = timelineData?.sessions || [];
  const rootTreatment = timelineData?.rootTreatment;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-2xl">
          {/* Solid Header */}
          <DialogHeader className="px-8 py-5 bg-white border-b border-slate-100 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-synapse-light shrink-0" />
                    <span>Treatment Timeline & Session History</span>
                  </DialogTitle>
                  {rootTreatment?.type && (
                    <Badge variant="outline" className="bg-synapse-light/10 text-synapse-light border-synapse-light/30 text-xs font-semibold px-2.5 py-0.5">
                      {rootTreatment.type}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-xs text-slate-500">
                  Track full treatment history, periodic sessions, assigned therapists, and individual billing records.
                </DialogDescription>
              </div>

              {/* Action Buttons: Print, Download, Repeat */}
              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="h-10 rounded-xl border-slate-200 hover:border-slate-300 gap-1.5 text-slate-700 cursor-pointer shadow-2xs text-xs font-semibold px-3.5"
                >
                  <Printer className="h-4 w-4 text-slate-500" />
                  <span>Print Timeline</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDownloading}
                  onClick={handleDownloadPdf}
                  className="h-10 rounded-xl border-slate-200 hover:border-slate-300 gap-1.5 text-slate-700 cursor-pointer shadow-2xs text-xs font-semibold px-3.5"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 text-slate-500" />
                  )}
                  <span>Download PDF</span>
                </Button>

                {sessions.length > 0 && onRepeatClick && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const latestSession = sessions[sessions.length - 1];
                      onRepeatClick(latestSession);
                    }}
                    className="h-10 rounded-xl bg-synapse-light hover:bg-synapse-light/90 text-white gap-1.5 cursor-pointer shadow-xs text-xs font-semibold px-4"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Repeat Treatment</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Patient & Summary Metrics Cards */}
            {timelineData && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider block">
                    Patient
                  </span>
                  <span className="font-bold text-slate-900 text-xs truncate block">
                    {patient?.name || "—"}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    MRN: {patient?.mrn || "—"}
                  </span>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider block">
                    Prescribed By
                  </span>
                  <span className="font-bold text-slate-900 text-xs truncate block">
                    {typeof doctor === "object" && doctor !== null
                      ? `Dr. ${doctor.name}`
                      : rootTreatment?.doctorName || "Self"}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {rootTreatment?.prescriptionDate
                      ? fDate(rootTreatment.prescriptionDate)
                      : "—"}
                  </span>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider block">
                    Total Sessions
                  </span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {timelineData.totalSessions}
                    </span>
                    <span className="text-[10.5px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {timelineData.completedSessions} completed
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider block">
                    Total Billed
                  </span>
                  <span className="font-extrabold text-emerald-800 text-sm block pt-0.5">
                    {formatINR(timelineData.totalSpend || 0)}
                  </span>
                </div>
              </div>
            )}
          </DialogHeader>

          {/* Timeline Sessions Scrollable List with Solid Background */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5 bg-slate-50/60">
            {isLoading ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="h-7 w-7 animate-spin text-synapse-light" />
                <p className="text-xs font-medium">Loading treatment history & timeline...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-800 text-sm">No session history found</p>
                <p className="text-xs text-slate-400 mt-1">Treatment sessions will appear here as they are scheduled and processed.</p>
              </div>
            ) : (
              <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                {sessions.map((sess, idx) => {
                  const isDone = sess.status === "Completed";
                  const sessDate = sess.treatmentDate || sess.createdAt;
                  const sessAmount =
                    (sess.items || []).reduce(
                      (sum, i) => sum + (i.total || 0),
                      0
                    ) - (sess.discount || 0);

                  return (
                    <div key={sess._id} className="relative group">
                      {/* Timeline Bullet Node Icon */}
                      <div
                        className={`absolute -left-7 top-3.5 h-6 w-6 rounded-full border-2 bg-white flex items-center justify-center transition-all shadow-xs ${
                          isDone
                            ? "border-emerald-600 text-emerald-600 ring-4 ring-emerald-50"
                            : "border-amber-500 text-amber-500 ring-4 ring-amber-50"
                        }`}
                      >
                        {isDone ? (
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                        ) : (
                          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        )}
                      </div>

                      {/* Session Card */}
                      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition space-y-4">
                        {/* Session Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 whitespace-nowrap">
                              Session #{sess.sessionNumber || idx + 1}
                            </span>
                            {sess.isRepeated && (
                              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-semibold px-2 py-0.5 whitespace-nowrap">
                                Repeated Session
                              </Badge>
                            )}
                            <Badge
                              className={`text-[10px] font-bold px-2.5 py-0.5 whitespace-nowrap ${
                                isDone
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {sess.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
                            <span className="flex items-center gap-1.5 font-medium text-slate-700">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {fDate(sessDate)}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1 font-medium text-slate-500">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {fDateandTime(sessDate).split(" ")[1] || ""}
                            </span>
                          </div>
                        </div>

                        {/* Session Card Body: Items & Therapist */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          {/* Procedures/Therapies Items */}
                          <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                              Procedures / Therapies Performed
                            </span>
                            <div className="space-y-1.5">
                              {(sess.items || []).map((it, iIdx) => (
                                <div
                                  key={iIdx}
                                  className="flex items-center justify-between text-slate-800"
                                >
                                  <span className="font-semibold truncate pr-2">
                                    {it.name}
                                  </span>
                                  <span className="font-bold text-slate-700">
                                    {formatINR(it.total || it.unitPrice * (it.quantity || 1))}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Therapist & Billing details */}
                          <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                            <div className="space-y-1">
                              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                                Assigned Therapist
                              </span>
                              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                                <UserCheck className="h-4 w-4 text-synapse-light" />
                                <span>{sess.therapistName || "—"}</span>
                              </div>
                            </div>

                            <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-slate-500 font-medium">
                                  Bill No:
                                </span>
                                <span className="font-bold text-slate-800 text-xs font-mono">
                                  {sess.billNo || "Unbilled"}
                                </span>
                              </div>
                              <div className="font-extrabold text-emerald-800 text-sm">
                                Total: {formatINR(sessAmount)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Session Notes */}
                        {sess.notes && (
                          <div className="text-xs text-slate-700 bg-amber-50/60 p-3 rounded-xl border border-amber-100/90">
                            <span className="font-bold text-amber-900">Session Notes: </span>
                            <span>{sess.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden Print Ready Timeline Portal */}
      {timelineData && (
        <PrintTreatmentTimeline timelineData={timelineData} />
      )}
    </>
  );
}
