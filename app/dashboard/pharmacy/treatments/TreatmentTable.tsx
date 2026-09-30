"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Calendar,
  Clock,
  Edit3,
  Eye,
  FileText,
  History,
  Layers,
  MoreHorizontal,
  Plus,
  Printer,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatINR } from "@/lib/fNumber";
import { fDate, fDateandTime } from "@/lib/fDateAndTime";
import { PaginationBar } from "@/app/dashboard/pharmacy/components/PaginationBar";
import { TreatmentOrderType } from "./interface";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface Props {
  treatments: TreatmentOrderType[];
  total: number;
  filter: { page: number; limit: number };
  setFilter: React.Dispatch<React.SetStateAction<any>>;
  onProcess: (treatment: TreatmentOrderType) => void;
  onEdit: (treatment: TreatmentOrderType) => void;
  onRepeat: (treatment: TreatmentOrderType) => void;
  onViewTimeline: (treatment: TreatmentOrderType) => void;
  onMutate: () => void;
}

export default function TreatmentTable({
  treatments,
  total,
  filter,
  setFilter,
  onProcess,
  onEdit,
  onRepeat,
  onViewTimeline,
  onMutate,
}: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/treatment/${deleteId}`);
      toast.success("Treatment deleted successfully");
      setDeleteId(null);
      onMutate();
    } catch (err: any) {
      console.error("Error deleting treatment:", err);
      toast.error(err.response?.data?.message || "Failed to delete treatment");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "In-Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getBillingBadge = (status: string, billNo?: string) => {
    if (status === "Billed" || status === "Paid") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span>Billed</span>
          {billNo && billNo !== "-" && (
            <span className="font-mono text-[9.5px]">({billNo})</span>
          )}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        Unbilled
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <TableHead className="py-3.5 pl-4">Treatment #</TableHead>
              <TableHead className="py-3.5">Patient</TableHead>
              <TableHead className="py-3.5">Doctor</TableHead>
              <TableHead className="py-3.5">Therapy / Procedure</TableHead>
              <TableHead className="py-3.5">Category</TableHead>
              <TableHead className="py-3.5">Assigned Therapist</TableHead>
              <TableHead className="py-3.5">Treatment Date</TableHead>
              <TableHead className="py-3.5">Status</TableHead>
              <TableHead className="py-3.5">Billing Status</TableHead>
              <TableHead className="py-3.5 text-right pr-4">Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {treatments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Activity className="h-8 w-8 text-slate-300" />
                    <span className="font-semibold text-slate-700">No treatments found</span>
                    <span className="text-xs text-slate-400">
                      Doctor prescribed therapies and walk-in treatments will appear here.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              treatments.map((treatment) => {
                const isCompleted = treatment.status === "Completed";
                const isBilled =
                  treatment.billingStatus === "Billed" || treatment.billingStatus === "Paid";
                const totalAmount =
                  (treatment.items || []).reduce((s, i) => s + i.total, 0) -
                  (treatment.discount || 0);

                return (
                  <TableRow
                    key={treatment._id}
                    className="hover:bg-slate-50/70 border-b border-slate-100 transition text-xs"
                  >
                    {/* Treatment ID / MRN */}
                    <TableCell className="font-mono font-bold text-synapse-light pl-4">
                      <div className="flex flex-col">
                        <span>{treatment.mrn}</span>
                        {treatment.sessionNumber > 1 && (
                          <span className="text-[10px] text-indigo-600 font-semibold">
                            Session #{treatment.sessionNumber}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Patient */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-xs">
                          {treatment.patient?.name || "—"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {treatment.patient?.mrn || "—"} • {treatment.patient?.phoneNumber || ""}
                        </span>
                      </div>
                    </TableCell>

                    {/* Doctor */}
                    <TableCell>
                      <div className="flex flex-col text-slate-700 font-medium">
                        <span>{treatment.doctorName || "Self / Walk-in"}</span>
                      </div>
                    </TableCell>

                    {/* Treatment Items */}
                    <TableCell className="max-w-xs">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex flex-wrap gap-1">
                          {(treatment.items || []).map((it, idx) => (
                            <span
                              key={idx}
                              className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] truncate"
                              title={it.name}
                            >
                              {it.name}
                            </span>
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-500 font-bold">
                          {formatINR(totalAmount)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          treatment.type === "Procedure"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }
                      >
                        {treatment.type || treatment.category}
                      </Badge>
                    </TableCell>

                    {/* Assigned Therapist */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <UserCheck className="h-3.5 w-3.5 text-synapse-light shrink-0" />
                        <span className="truncate max-w-[130px]" title={treatment.therapistName}>
                          {treatment.therapistName || "—"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Treatment Date */}
                    <TableCell className="text-slate-600 whitespace-nowrap">
                      {fDate(treatment.treatmentDate || treatment.createdAt)}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${getStatusBadge(treatment.status)}`}
                      >
                        {treatment.status}
                      </Badge>
                    </TableCell>

                    {/* Billing Status */}
                    <TableCell>
                      {getBillingBadge(treatment.billingStatus, treatment.billNo)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Process / Bill Action Button if not yet billed */}
                        {!isBilled && (
                          <Button
                            size="sm"
                            onClick={() => onProcess(treatment)}
                            className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold gap-1 shadow-2xs cursor-pointer"
                          >
                            <Receipt className="h-3 w-3" />
                            <span>Process & Bill</span>
                          </Button>
                        )}

                        {/* View Timeline Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewTimeline(treatment)}
                          className="h-7 w-7 p-0 rounded-lg hover:bg-synapse-light/10 text-synapse-light cursor-pointer"
                          title="View Treatment Timeline"
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>

                        {/* Repeat Treatment Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRepeat(treatment)}
                          className="h-7 w-7 p-0 rounded-lg hover:bg-indigo-50 text-indigo-600 cursor-pointer"
                          title="Repeat Treatment Session"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>

                        {/* More Menu (Edit, Delete) */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 text-xs">
                            <DropdownMenuLabel className="text-[10px] text-slate-400 font-bold uppercase">
                              Treatment Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => onViewTimeline(treatment)}
                              className="cursor-pointer gap-2"
                            >
                              <History className="h-3.5 w-3.5 text-slate-500" />
                              <span>View Timeline</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => onRepeat(treatment)}
                              className="cursor-pointer gap-2"
                            >
                              <RotateCcw className="h-3.5 w-3.5 text-indigo-500" />
                              <span>Repeat Session</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => onEdit(treatment)}
                              className="cursor-pointer gap-2"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                              <span>Edit Details / Therapist</span>
                            </DropdownMenuItem>

                            {!isBilled && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeleteId(treatment._id)}
                                  className="cursor-pointer gap-2 text-rose-600 focus:text-rose-700"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete Treatment</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      {total > filter.limit && (
        <PaginationBar
          page={filter.page}
          limit={filter.limit}
          setFilter={setFilter}
          total={total}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Delete Treatment Record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Are you sure you want to delete this treatment record? This action will mark the treatment as deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
