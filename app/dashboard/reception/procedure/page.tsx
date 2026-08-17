"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import useSWR from "swr";
import api from "@/lib/axios";
import { formatINR } from "@/lib/fNumber";
import { fDate } from "@/lib/fDateAndTime";
import PharmacyHeader from "@/app/dashboard/pharmacy/components/PharmacyHeader";
import { TableSkeleton } from "@/app/dashboard/pharmacy/components/PharmacySkeleton";
import {
  Activity,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  CornerDownRight,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export interface SubProcedureItem {
  _id: string;
  name: string;
  price: number;
  code?: string;
  description?: string;
  status: string;
  isDeleted?: boolean;
}

export interface ProcedureItem {
  _id: string;
  name: string;
  price?: number;
  code?: string;
  description?: string;
  hasSubProcedures?: boolean;
  subProcedures?: SubProcedureItem[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TempSubProc {
  _id?: string;
  name: string;
  price: string;
  code: string;
  description: string;
  status: string;
}

export default function ProcedurePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Main Modal States
  const [openFormModal, setOpenFormModal] = useState(false);
  const [editingProcedure, setEditingProcedure] =
    useState<ProcedureItem | null>(null);
  const [deleteProcedure, setDeleteProcedure] =
    useState<ProcedureItem | null>(null);

  // Sub-Procedure Modal States
  const [openSubModal, setOpenSubModal] = useState(false);
  const [parentForSub, setParentForSub] = useState<ProcedureItem | null>(null);
  const [editingSubProcedure, setEditingSubProcedure] =
    useState<SubProcedureItem | null>(null);
  const [deleteSubTarget, setDeleteSubTarget] = useState<{
    parentId: string;
    parentName: string;
    subProc: SubProcedureItem;
  } | null>(null);

  // Form Field States (Main Procedure)
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [hasSubProcedures, setHasSubProcedures] = useState(false);
  const [tempSubList, setTempSubList] = useState<TempSubProc[]>([]);

  // Sub-procedure form fields
  const [subName, setSubName] = useState("");
  const [subPrice, setSubPrice] = useState("");
  const [subCode, setSubCode] = useState("");
  const [subDescription, setSubDescription] = useState("");
  const [subStatus, setSubStatus] = useState("Active");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Procedures
  const queryUrl = `/procedure?search=${encodeURIComponent(search)}${statusFilter !== "all" ? `&status=${encodeURIComponent(statusFilter)}` : ""
    }`;
  const { data, error, isLoading, mutate } = useSWR<{
    message: string;
    data: ProcedureItem[];
  }>(queryUrl, {
    revalidateOnFocus: false,
  });

  const rawProcedures = data?.data || [];
  const procedures = rawProcedures.filter((item) => {
    if (statusFilter === "all") return true;
    return item.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Calculate Statistics
  const totalCount = rawProcedures.length;
  const activeCount = rawProcedures.filter((p) => p.status === "Active").length;
  const totalSubCount = rawProcedures.reduce(
    (acc, p) => acc + ((p.subProcedures || []).length || 0),
    0
  );

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Open modal for Create Main Procedure
  const handleOpenCreate = () => {
    setEditingProcedure(null);
    setName("");
    setPrice("");
    setCode("");
    setDescription("");
    setStatus("Active");
    setHasSubProcedures(false);
    setTempSubList([]);
    setErrorMsg(null);
    setOpenFormModal(true);
  };

  // Open modal for Edit Main Procedure
  const handleOpenEdit = (item: ProcedureItem) => {
    setEditingProcedure(item);
    setName(item.name || "");
    setPrice(item.price !== undefined ? String(item.price) : "");
    setCode(item.code || "");
    setDescription(item.description || "");
    setStatus(item.status || "Active");
    const hasSubs =
      item.hasSubProcedures ||
      (Array.isArray(item.subProcedures) && item.subProcedures.length > 0);
    setHasSubProcedures(Boolean(hasSubs));

    if (item.subProcedures && item.subProcedures.length > 0) {
      setTempSubList(
        item.subProcedures.map((sp) => ({
          _id: sp._id,
          name: sp.name,
          price: String(sp.price),
          code: sp.code || "",
          description: sp.description || "",
          status: sp.status || "Active",
        }))
      );
    } else {
      setTempSubList([]);
    }

    setErrorMsg(null);
    setOpenFormModal(true);
  };

  // Add temp sub-procedure row inside Main Procedure modal
  const handleAddTempSub = () => {
    setTempSubList((prev) => [
      ...prev,
      {
        name: "",
        price: "",
        code: "",
        description: "",
        status: "Active",
      },
    ]);
  };

  const handleUpdateTempSub = (
    index: number,
    field: keyof TempSubProc,
    val: string
  ) => {
    setTempSubList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleRemoveTempSub = (index: number) => {
    setTempSubList((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Main Procedure Form (Create / Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Procedure name is required.");
      return;
    }

    let numPrice = 0;
    if (!hasSubProcedures) {
      numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice < 0) {
        setErrorMsg("Please enter a valid non-negative price.");
        return;
      }
    }

    // Validate sub-procedures if enabled
    let validatedSubProcedures: any[] = [];
    if (hasSubProcedures) {
      if (tempSubList.length === 0) {
        setErrorMsg("Please add at least one sub-procedure or disable sub-procedures.");
        return;
      }

      for (let i = 0; i < tempSubList.length; i++) {
        const sp = tempSubList[i];
        if (!sp.name.trim()) {
          setErrorMsg(`Sub-procedure #${i + 1} requires a name.`);
          return;
        }
        const p = parseFloat(sp.price);
        if (isNaN(p) || p < 0) {
          setErrorMsg(
            `Sub-procedure "${sp.name}" requires a valid non-negative price.`
          );
          return;
        }
        validatedSubProcedures.push({
          ...(sp._id ? { _id: sp._id } : {}),
          name: sp.name.trim(),
          price: p,
          code: sp.code.trim() || undefined,
          description: sp.description.trim() || undefined,
          status: sp.status || "Active",
        });
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: name.trim(),
      code: code.trim() || undefined,
      description: description.trim() || undefined,
      price: !hasSubProcedures ? numPrice : 0,
      hasSubProcedures,
      subProcedures: hasSubProcedures ? validatedSubProcedures : [],
      status,
    };

    try {
      if (editingProcedure) {
        await api.patch(`/procedure/${editingProcedure._id}`, payload);
        setSuccessMsg("Procedure updated successfully!");
      } else {
        await api.post("/procedure", payload);
        setSuccessMsg("New procedure added successfully!");
      }
      setOpenFormModal(false);
      mutate();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
        "Failed to save procedure. Please check all fields."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soft Delete Main Procedure
  const handleConfirmDelete = async () => {
    if (!deleteProcedure) return;
    setIsDeleting(true);
    try {
      await api.delete(`/procedure/${deleteProcedure._id}`);
      setSuccessMsg(
        `Procedure "${deleteProcedure.name}" and its sub-procedures deleted.`
      );
      setDeleteProcedure(null);
      mutate();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || "Failed to delete procedure."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Add Sub-Procedure Modal
  const handleOpenAddSub = (parent: ProcedureItem) => {
    setParentForSub(parent);
    setEditingSubProcedure(null);
    setSubName("");
    setSubPrice("");
    setSubCode("");
    setSubDescription("");
    setSubStatus("Active");
    setErrorMsg(null);
    setOpenSubModal(true);
  };

  // Open Edit Sub-Procedure Modal
  const handleOpenEditSub = (
    parent: ProcedureItem,
    sub: SubProcedureItem
  ) => {
    setParentForSub(parent);
    setEditingSubProcedure(sub);
    setSubName(sub.name);
    setSubPrice(String(sub.price));
    setSubCode(sub.code || "");
    setSubDescription(sub.description || "");
    setSubStatus(sub.status || "Active");
    setErrorMsg(null);
    setOpenSubModal(true);
  };

  // Submit Sub-Procedure (Add or Edit)
  const handleSubmitSubModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentForSub) return;
    if (!subName.trim()) {
      setErrorMsg("Sub-procedure name is required.");
      return;
    }
    const numP = parseFloat(subPrice);
    if (isNaN(numP) || numP < 0) {
      setErrorMsg("Please enter a valid non-negative price.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const subPayload = {
      name: subName.trim(),
      price: numP,
      code: subCode.trim() || undefined,
      description: subDescription.trim() || undefined,
      status: subStatus,
    };

    try {
      if (editingSubProcedure) {
        await api.patch(
          `/procedure/${parentForSub._id}/sub-procedure/${editingSubProcedure._id}`,
          subPayload
        );
        setSuccessMsg("Sub-procedure updated successfully!");
      } else {
        await api.post(
          `/procedure/${parentForSub._id}/sub-procedure`,
          subPayload
        );
        setSuccessMsg("New sub-procedure added successfully!");
      }
      setOpenSubModal(false);
      // Auto expand parent row so the user sees the new item
      setExpandedRows((prev) => ({ ...prev, [parentForSub._id]: true }));
      mutate();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || "Failed to save sub-procedure."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Soft Delete Sub-Procedure
  const handleConfirmDeleteSub = async () => {
    if (!deleteSubTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(
        `/procedure/${deleteSubTarget.parentId}/sub-procedure/${deleteSubTarget.subProc._id}`
      );
      setSuccessMsg(
        `Sub-procedure "${deleteSubTarget.subProc.name}" deleted successfully.`
      );
      setDeleteSubTarget(null);
      mutate();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || "Failed to delete sub-procedure."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppShell>
      <TooltipProvider>
        <div className="p-5 flex flex-col gap-5 w-full min-h-[calc(100vh-67px)]">
          {/* Banner Alert Messages */}
          {successMsg && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-medium">{successMsg}</span>
            </div>
          )}
          {errorMsg && !openFormModal && !openSubModal && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 shadow-sm animate-in fade-in slide-in-from-top-2">
              <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span className="text-sm font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Procedure Header */}
          <PharmacyHeader
            title="Procedure Management"
            subtitle="Manage clinical procedures, hierarchical sub-procedures, and pricing"
          >
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => mutate()}
                className="flex items-center gap-2 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </Button>
              <Button
                onClick={handleOpenCreate}
                className="flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shadow-md bg-(--color-synapse-light) cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Procedure
              </Button>
            </div>
          </PharmacyHeader>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total Main Procedures
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-0.5">
                    {totalCount}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total Sub-Procedures
                  </p>
                  <h3 className="text-2xl font-bold text-indigo-600 mt-0.5">
                    {totalSubCount}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Active Procedures
                  </p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">
                    {activeCount}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search procedure, sub-procedure, or code..."
                className="bg-transparent border-none outline-none text-sm w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0 font-medium">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filter:
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-35 rounded-xl border-slate-200 bg-white text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Table Container */}
          <div className="bg-white/90 border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm overflow-x-auto w-full">
            {isLoading ? (
              <div className="p-6">
                <TableSkeleton rows={8} columns={7} />
              </div>
            ) : error ? (
              <div className="p-12 text-center text-rose-500">
                <XCircle className="h-10 w-10 mx-auto mb-2 opacity-80" />
                <p className="font-medium">Failed to load procedures.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => mutate()}
                  className="mt-3 rounded-xl cursor-pointer"
                >
                  Retry
                </Button>
              </div>
            ) : procedures.length === 0 ? (
              <div className="p-16 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8" />
                </div>
                <h4 className="text-base font-semibold text-slate-700">
                  No Procedures Found
                </h4>
                <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                  {search
                    ? `No procedures match "${search}". Try searching with a different keyword.`
                    : "Click the button below to create your first procedure."}
                </p>
                {!search && (
                  <Button
                    onClick={handleOpenCreate}
                    className="mt-4 rounded-xl bg-(--color-synapse-light) text-white font-bold text-sm px-4 py-2 cursor-pointer"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Procedure
                  </Button>
                )}
              </div>
            ) : (
              <Table className="w-full min-w-225">
                <TableHeader className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark)">
                  <TableRow className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) border-b-0">
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4 pl-4 w-12 text-center">
                      #
                    </TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4 w-28">
                      Code
                    </TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4">
                      Procedure Name
                    </TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4">
                      Type / Hierarchy
                    </TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4">
                      Price (₹)
                    </TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4">
                      Status
                    </TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4">
                      Created Date
                    </TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4 pr-6 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-sm">
                  {procedures.map((item, idx) => {
                    const hasSubs =
                      item.hasSubProcedures &&
                      item.subProcedures &&
                      item.subProcedures.length > 0;
                    const isExpanded = !!expandedRows[item._id];

                    return (
                      <React.Fragment key={item._id}>
                        <TableRow
                          className={`transition-colors border-b border-slate-100 ${isExpanded
                              ? "bg-slate-50/90 font-medium"
                              : idx % 2 === 0
                                ? "bg-white hover:bg-slate-50/80"
                                : "bg-slate-50/40 hover:bg-slate-50"
                            }`}
                        >
                          <TableCell className="py-3 pl-4 text-center">
                            {hasSubs ? (
                              <button
                                type="button"
                                onClick={() => toggleRow(item._id)}
                                className="p-1 rounded-md text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 transition cursor-pointer"
                                title={isExpanded ? "Collapse" : "Expand"}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-(--color-synapse-light)" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">
                                {idx + 1}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-3 font-mono text-xs text-slate-600">
                            {item.code || "—"}
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800">
                                {item.name}
                              </span>
                              {item.description && (
                                <span className="text-xs text-slate-400 truncate max-w-50">
                                  ({item.description})
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            {hasSubs ? (
                              <Badge
                                variant="secondary"
                                className="bg-indigo-50 text-indigo-700 border-indigo-200 font-medium flex items-center gap-1.5 w-fit cursor-pointer"
                                onClick={() => toggleRow(item._id)}
                              >
                                <Layers className="h-3 w-3" />
                                {item.subProcedures?.length} Sub-procedure
                                {(item.subProcedures?.length || 0) > 1
                                  ? "s"
                                  : ""}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-slate-50 text-slate-600 border-slate-200 font-normal text-xs"
                              >
                                Standalone
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-3 font-bold text-slate-900">
                            {hasSubs ? (
                              <span className="text-xs font-semibold text-slate-500 italic">
                                Varies by sub-procedure
                              </span>
                            ) : (
                              formatINR(item.price || 0)
                            )}
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge
                              className={
                                item.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-2.5 py-0.5"
                                  : "bg-slate-100 text-slate-600 border-slate-200 font-semibold px-2.5 py-0.5"
                              }
                              variant="outline"
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-xs text-slate-500">
                            {fDate(item.createdAt)}
                          </TableCell>
                          <TableCell className="py-3 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Add Sub-procedure button */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenAddSub(item)}
                                    className="h-8 w-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg cursor-pointer"
                                  >
                                    <PlusCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Add Sub-Procedure under {item.name}
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenEdit(item)}
                                    className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Procedure</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteProcedure(item)}
                                    className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Delete Procedure
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expandable Sub-procedures Row */}
                        {hasSubs && isExpanded && (
                          <TableRow className="bg-slate-50/70 hover:bg-slate-50/90 border-b border-slate-200/80">
                            <TableCell colSpan={8} className="p-0">
                              <div className="py-3 px-6 pl-14 bg-linear-to-b from-indigo-50/40 to-slate-50/60 border-y border-indigo-100/60 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-800">
                                    <CornerDownRight className="h-4 w-4 text-indigo-500" />
                                    <span>
                                      Sub-procedures under {item.name} (
                                      {item.subProcedures?.length || 0})
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenAddSub(item)}
                                    className="h-7 text-xs rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                                  >
                                    <Plus className="h-3 w-3 mr-1" /> Add Sub-Procedure
                                  </Button>
                                </div>

                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                                  <Table className="w-full">
                                    <TableHeader className="bg-slate-100/80">
                                      <TableRow className="border-b border-slate-200 text-xs font-semibold text-slate-600">
                                        <TableHead className="py-2 px-3 text-xs w-28">
                                          Sub Code
                                        </TableHead>
                                        <TableHead className="py-2 px-3 text-xs">
                                          Sub-Procedure Name
                                        </TableHead>
                                        <TableHead className="py-2 px-3 text-xs">
                                          Description
                                        </TableHead>
                                        <TableHead className="py-2 px-3 text-xs">
                                          Price
                                        </TableHead>
                                        <TableHead className="py-2 px-3 text-xs">
                                          Status
                                        </TableHead>
                                        <TableHead className="py-2 px-3 text-xs text-right pr-4">
                                          Actions
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {item.subProcedures?.map((sub) => (
                                        <TableRow
                                          key={sub._id}
                                          className="hover:bg-slate-50 border-b border-slate-100 last:border-0"
                                        >
                                          <TableCell className="py-2 px-3 font-mono text-xs text-slate-600">
                                            {sub.code || "—"}
                                          </TableCell>
                                          <TableCell className="py-2 px-3 font-medium text-slate-800">
                                            {sub.name}
                                          </TableCell>
                                          <TableCell className="py-2 px-3 text-xs text-slate-500 max-w-xs truncate">
                                            {sub.description || "—"}
                                          </TableCell>
                                          <TableCell className="py-2 px-3 font-bold text-slate-900 text-xs">
                                            {formatINR(sub.price)}
                                          </TableCell>
                                          <TableCell className="py-2 px-3">
                                            <Badge
                                              className={
                                                sub.status === "Active"
                                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium text-[10px] px-2 py-0.5"
                                                  : "bg-slate-100 text-slate-600 border-slate-200 font-medium text-[10px] px-2 py-0.5"
                                              }
                                              variant="outline"
                                            >
                                              {sub.status}
                                            </Badge>
                                          </TableCell>
                                          <TableCell className="py-2 px-3 pr-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                      handleOpenEditSub(
                                                        item,
                                                        sub
                                                      )
                                                    }
                                                    className="h-7 w-7 text-slate-600 hover:text-slate-900 rounded-md cursor-pointer"
                                                  >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  Edit Sub-Procedure
                                                </TooltipContent>
                                              </Tooltip>

                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                      setDeleteSubTarget({
                                                        parentId: item._id,
                                                        parentName: item.name,
                                                        subProc: sub,
                                                      })
                                                    }
                                                    className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer"
                                                  >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  Delete Sub-Procedure
                                                </TooltipContent>
                                              </Tooltip>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Add / Edit Procedure Modal */}
        <Dialog open={openFormModal} onOpenChange={setOpenFormModal}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Activity className="h-5 w-5 text-(--color-synapse-light)" />
                {editingProcedure ? "Edit Procedure" : "Add New Procedure"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">
                {editingProcedure
                  ? "Update procedure details, hierarchy, and pricing."
                  : "Enter details to create a new procedure or parent procedure."}
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="procName"
                  className="text-xs font-semibold text-slate-700"
                >
                  Procedure Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="procName"
                  placeholder="e.g. pr1 or Dental Extraction"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="procCode"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Procedure Code
                  </Label>
                  <Input
                    id="procCode"
                    placeholder="e.g. PR-001"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="procStatus"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Status
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full rounded-xl border-slate-200 text-sm">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="procDesc"
                  className="text-xs font-semibold text-slate-700"
                >
                  Description
                </Label>
                <Textarea
                  id="procDesc"
                  rows={2}
                  placeholder="Optional procedure notes or details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl border-slate-200 text-sm resize-none"
                />
              </div>

              {/* Toggle Has Sub-Procedures */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    Has Sub-procedures?
                  </Label>
                  <p className="text-xs text-slate-500">
                    Enable if this procedure has multiple child options (e.g.
                    pr3 $\rightarrow$ pr3.1, pr3.2)
                  </p>
                </div>
                <Switch
                  checked={hasSubProcedures}
                  onCheckedChange={setHasSubProcedures}
                />
              </div>

              {/* Standalone Price input */}
              {!hasSubProcedures ? (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="procPrice"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Price (₹) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="procPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 text-sm"
                  />
                </div>
              ) : (
                /* Dynamic Sub-procedure Builder */
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      Sub-Procedures List ({tempSubList.length})
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddTempSub}
                      className="h-7 text-xs rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Sub-Procedure
                    </Button>
                  </div>

                  {tempSubList.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 bg-slate-50/50">
                      No sub-procedures added yet. Click &quot;Add Sub-Procedure&quot; above.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {tempSubList.map((sp, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2 relative"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                            <span>Sub-Procedure #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTempSub(idx)}
                              className="text-rose-500 hover:text-rose-700 p-0.5 rounded cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-6">
                              <Input
                                placeholder="Name (e.g. pr3.1)*"
                                value={sp.name}
                                onChange={(e) =>
                                  handleUpdateTempSub(idx, "name", e.target.value)
                                }
                                required
                                className="h-8 text-xs bg-white rounded-lg"
                              />
                            </div>
                            <div className="col-span-3">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Price (₹)*"
                                value={sp.price}
                                onChange={(e) =>
                                  handleUpdateTempSub(
                                    idx,
                                    "price",
                                    e.target.value
                                  )
                                }
                                required
                                className="h-8 text-xs bg-white rounded-lg"
                              />
                            </div>
                            <div className="col-span-3">
                              <Input
                                placeholder="Code (opt)"
                                value={sp.code}
                                onChange={(e) =>
                                  handleUpdateTempSub(idx, "code", e.target.value)
                                }
                                className="h-8 text-xs bg-white rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <DialogFooter className="mt-6 gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenFormModal(false)}
                  className="rounded-xl border-slate-200 text-slate-600 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-(--color-synapse-light) text-white font-bold cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingProcedure ? (
                    "Update Procedure"
                  ) : (
                    "Create Procedure"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Quick Add / Edit Sub-Procedure Modal */}
        <Dialog open={openSubModal} onOpenChange={setOpenSubModal}>
          <DialogContent className="sm:max-w-md rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                {editingSubProcedure
                  ? "Edit Sub-Procedure"
                  : "Add Sub-Procedure"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">
                Under parent procedure:{" "}
                <strong className="text-slate-800">
                  {parentForSub?.name}
                </strong>
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitSubModal} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="subName"
                  className="text-xs font-semibold text-slate-700"
                >
                  Sub-Procedure Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="subName"
                  placeholder="e.g. pr3.1 or Root Canal Prep"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="subPrice"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Price (₹) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="subPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 300"
                    value={subPrice}
                    onChange={(e) => setSubPrice(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="subCode"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Code (Optional)
                  </Label>
                  <Input
                    id="subCode"
                    placeholder="e.g. PR-003-1"
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="subStatus"
                  className="text-xs font-semibold text-slate-700"
                >
                  Status
                </Label>
                <Select value={subStatus} onValueChange={setSubStatus}>
                  <SelectTrigger className="w-full rounded-xl border-slate-200 text-sm">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="subDescription"
                  className="text-xs font-semibold text-slate-700"
                >
                  Description (Optional)
                </Label>
                <Textarea
                  id="subDescription"
                  rows={2}
                  placeholder="Optional details or sub-procedure specifications..."
                  value={subDescription}
                  onChange={(e) => setSubDescription(e.target.value)}
                  className="rounded-xl border-slate-200 text-sm resize-none"
                />
              </div>

              <DialogFooter className="mt-6 gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenSubModal(false)}
                  className="rounded-xl border-slate-200 text-slate-600 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingSubProcedure ? (
                    "Update Sub-Procedure"
                  ) : (
                    "Add Sub-Procedure"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Confirm Delete Main Procedure Dialog */}
        <AlertDialog
          open={!!deleteProcedure}
          onOpenChange={(open) => !open && setDeleteProcedure(null)}
        >
          <AlertDialogContent className="rounded-2xl p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-rose-500" />
                Delete Procedure
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-600 mt-2">
                Are you sure you want to delete{" "}
                <strong className="text-slate-900">
                  {deleteProcedure?.name}
                </strong>
                ?
                {deleteProcedure?.hasSubProcedures &&
                  deleteProcedure.subProcedures &&
                  deleteProcedure.subProcedures.length > 0 && (
                    <span className="block mt-1 text-rose-600 font-medium">
                      Note: This will also delete all{" "}
                      {deleteProcedure.subProcedures.length} associated
                      sub-procedures.
                    </span>
                  )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-2">
              <AlertDialogCancel className="rounded-xl border-slate-200 cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Procedure"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirm Delete Sub-Procedure Dialog */}
        <AlertDialog
          open={!!deleteSubTarget}
          onOpenChange={(open) => !open && setDeleteSubTarget(null)}
        >
          <AlertDialogContent className="rounded-2xl p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-rose-500" />
                Delete Sub-Procedure
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-600 mt-2">
                Are you sure you want to delete sub-procedure{" "}
                <strong className="text-slate-900">
                  {deleteSubTarget?.subProc.name}
                </strong>{" "}
                under parent{" "}
                <strong className="text-slate-900">
                  {deleteSubTarget?.parentName}
                </strong>
                ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-2">
              <AlertDialogCancel className="rounded-xl border-slate-200 cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeleteSub}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Sub-Procedure"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TooltipProvider>
    </AppShell>
  );
}
