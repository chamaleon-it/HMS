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

export interface SubTherapyItem {
  _id: string;
  name: string;
  price: number;
  code?: string;
  description?: string;
  status: string;
  isDeleted?: boolean;
}

export interface TherapyItem {
  _id: string;
  name: string;
  price?: number;
  code?: string;
  description?: string;
  hasSubTherapies?: boolean;
  subTherapies?: SubTherapyItem[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TempSubTherapy {
  _id?: string;
  name: string;
  price: string;
  code: string;
  description: string;
  status: string;
}

export default function TherapyPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Main Modal States
  const [openFormModal, setOpenFormModal] = useState(false);
  const [editingTherapy, setEditingTherapy] =
    useState<TherapyItem | null>(null);
  const [deleteTherapy, setDeleteTherapy] =
    useState<TherapyItem | null>(null);

  // Sub-Therapy Modal States
  const [openSubModal, setOpenSubModal] = useState(false);
  const [parentForSub, setParentForSub] = useState<TherapyItem | null>(null);
  const [editingSubTherapy, setEditingSubTherapy] =
    useState<SubTherapyItem | null>(null);
  const [deleteSubTarget, setDeleteSubTarget] = useState<{
    parentId: string;
    parentName: string;
    subTherapy: SubTherapyItem;
  } | null>(null);

  // Form Field States (Main Therapy)
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [hasSubTherapies, setHasSubTherapies] = useState(false);
  const [tempSubList, setTempSubList] = useState<TempSubTherapy[]>([]);

  // Sub-Therapy form fields
  const [subName, setSubName] = useState("");
  const [subPrice, setSubPrice] = useState("");
  const [subCode, setSubCode] = useState("");
  const [subDescription, setSubDescription] = useState("");
  const [subStatus, setSubStatus] = useState("Active");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Therapies
  const queryUrl = `/therapy?search=${encodeURIComponent(search)}${
    statusFilter !== "all" ? `&status=${encodeURIComponent(statusFilter)}` : ""
  }`;
  const { data, error, isLoading, mutate } = useSWR<{
    message: string;
    data: TherapyItem[];
  }>(queryUrl, {
    revalidateOnFocus: false,
  });

  const rawTherapies = data?.data || [];
  const therapies = rawTherapies.filter((item) => {
    if (statusFilter === "all") return true;
    return item.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Calculate Statistics
  const totalCount = rawTherapies.length;
  const activeCount = rawTherapies.filter((t) => t.status === "Active").length;
  const totalSubCount = rawTherapies.reduce(
    (acc, t) => acc + ((t.subTherapies || []).length || 0),
    0
  );

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Open modal for Create Main Therapy
  const handleOpenCreate = () => {
    setEditingTherapy(null);
    setName("");
    setPrice("");
    setCode("");
    setDescription("");
    setStatus("Active");
    setHasSubTherapies(false);
    setTempSubList([]);
    setErrorMsg(null);
    setOpenFormModal(true);
  };

  // Open modal for Edit Main Therapy
  const handleOpenEdit = (item: TherapyItem) => {
    setEditingTherapy(item);
    setName(item.name || "");
    setPrice(item.price !== undefined ? String(item.price) : "");
    setCode(item.code || "");
    setDescription(item.description || "");
    setStatus(item.status || "Active");
    const hasSubs =
      item.hasSubTherapies ||
      (Array.isArray(item.subTherapies) && item.subTherapies.length > 0);
    setHasSubTherapies(Boolean(hasSubs));

    if (item.subTherapies && item.subTherapies.length > 0) {
      setTempSubList(
        item.subTherapies.map((st) => ({
          _id: st._id,
          name: st.name,
          price: String(st.price),
          code: st.code || "",
          description: st.description || "",
          status: st.status || "Active",
        }))
      );
    } else {
      setTempSubList([]);
    }

    setErrorMsg(null);
    setOpenFormModal(true);
  };

  // Add temp sub-therapy row inside Main Therapy modal
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
    field: keyof TempSubTherapy,
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

  // Submit Main Therapy Form (Create / Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Therapy name is required.");
      return;
    }

    let numPrice = 0;
    if (!hasSubTherapies) {
      numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice < 0) {
        setErrorMsg("Please enter a valid price for the standalone therapy.");
        return;
      }
    }

    // Validate sub-therapies if enabled
    const validatedSubTherapies = [];
    if (hasSubTherapies) {
      if (tempSubList.length === 0) {
        setErrorMsg(
          "Please add at least one sub-therapy or disable the 'Has Sub-Therapies' toggle."
        );
        return;
      }

      for (let i = 0; i < tempSubList.length; i++) {
        const st = tempSubList[i];
        if (!st.name.trim()) {
          setErrorMsg(`Sub-therapy #${i + 1} name is required.`);
          return;
        }
        const p = parseFloat(st.price);
        if (isNaN(p) || p < 0) {
          setErrorMsg(
            `Sub-therapy #${i + 1} ("${st.name}") must have a valid non-negative price.`
          );
          return;
        }
        validatedSubTherapies.push({
          ...(st._id ? { _id: st._id } : {}),
          name: st.name.trim(),
          price: p,
          code: st.code.trim() || undefined,
          description: st.description.trim() || undefined,
          status: st.status || "Active",
        });
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: name.trim(),
      code: code.trim() || undefined,
      description: description.trim() || undefined,
      price: !hasSubTherapies ? numPrice : 0,
      hasSubTherapies,
      subTherapies: hasSubTherapies ? validatedSubTherapies : [],
      status,
    };

    try {
      if (editingTherapy) {
        await api.patch(`/therapy/${editingTherapy._id}`, payload);
        setSuccessMsg("Therapy updated successfully!");
      } else {
        await api.post("/therapy", payload);
        setSuccessMsg("New therapy added successfully!");
      }
      setOpenFormModal(false);
      mutate();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          "Failed to save therapy. Please check all fields."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soft Delete Main Therapy
  const handleConfirmDelete = async () => {
    if (!deleteTherapy) return;
    setIsDeleting(true);
    try {
      await api.delete(`/therapy/${deleteTherapy._id}`);
      setSuccessMsg(
        `Therapy "${deleteTherapy.name}" and its sub-therapies deleted.`
      );
      setDeleteTherapy(null);
      mutate();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || "Failed to delete therapy."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Add Sub-Therapy Modal
  const handleOpenAddSub = (parent: TherapyItem) => {
    setParentForSub(parent);
    setEditingSubTherapy(null);
    setSubName("");
    setSubPrice("");
    setSubCode("");
    setSubDescription("");
    setSubStatus("Active");
    setErrorMsg(null);
    setOpenSubModal(true);
  };

  // Open Edit Sub-Therapy Modal
  const handleOpenEditSub = (
    parent: TherapyItem,
    sub: SubTherapyItem
  ) => {
    setParentForSub(parent);
    setEditingSubTherapy(sub);
    setSubName(sub.name);
    setSubPrice(String(sub.price));
    setSubCode(sub.code || "");
    setSubDescription(sub.description || "");
    setSubStatus(sub.status || "Active");
    setErrorMsg(null);
    setOpenSubModal(true);
  };

  // Submit Sub-Therapy (Add or Edit)
  const handleSubmitSubModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentForSub) return;
    if (!subName.trim()) {
      setErrorMsg("Sub-therapy name is required.");
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
      if (editingSubTherapy) {
        await api.patch(
          `/therapy/${parentForSub._id}/sub-therapy/${editingSubTherapy._id}`,
          subPayload
        );
        setSuccessMsg("Sub-therapy updated successfully!");
      } else {
        await api.post(
          `/therapy/${parentForSub._id}/sub-therapy`,
          subPayload
        );
        setSuccessMsg("New sub-therapy added successfully!");
      }
      setOpenSubModal(false);
      // Auto expand parent row so the user sees the new item
      setExpandedRows((prev) => ({ ...prev, [parentForSub._id]: true }));
      mutate();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || "Failed to save sub-therapy."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Soft Delete Sub-Therapy
  const handleConfirmDeleteSub = async () => {
    if (!deleteSubTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(
        `/therapy/${deleteSubTarget.parentId}/sub-therapy/${deleteSubTarget.subTherapy._id}`
      );
      setSuccessMsg(
        `Sub-therapy "${deleteSubTarget.subTherapy.name}" deleted successfully.`
      );
      setDeleteSubTarget(null);
      mutate();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || "Failed to delete sub-therapy."
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

          {/* Therapy Header */}
          <PharmacyHeader
            title="Therapy Management"
            subtitle="Manage clinical therapies, hierarchical sub-therapies, and pricing"
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
                <Plus className="h-4 w-4 mr-2" /> Add Therapy
              </Button>
            </div>
          </PharmacyHeader>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total Main Therapies
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-0.5">
                    {totalCount}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total Sub-Therapies
                  </p>
                  <h3 className="text-2xl font-bold text-teal-600 mt-0.5">
                    {totalSubCount}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Active Therapies
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

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by therapy or sub-therapy..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9.5 rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-emerald-100 h-9"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36 h-9 rounded-xl border-slate-200 text-xs cursor-pointer">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Therapies Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex-1">
            <Table>
              <TableHeader className="bg-slate-50/75 border-b border-slate-200">
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="w-28 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Code
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Therapy Name
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Type / Sub-Therapies
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider text-right">
                    Price
                  </TableHead>
                  <TableHead className="w-28 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="p-0">
                      <TableSkeleton columns={7} rows={6} />
                    </TableCell>
                  </TableRow>
                ) : therapies.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-slate-400 text-sm"
                    >
                      <Activity className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      No therapies found. Click &quot;Add Therapy&quot; to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  therapies.map((item) => {
                    const hasSubs =
                      item.hasSubTherapies ||
                      (Array.isArray(item.subTherapies) &&
                        item.subTherapies.length > 0);
                    const subList = item.subTherapies || [];
                    const isExpanded = Boolean(expandedRows[item._id]);

                    return (
                      <React.Fragment key={item._id}>
                        {/* Parent Therapy Row */}
                        <TableRow
                          className={`hover:bg-slate-50/80 transition-colors border-b border-slate-100 ${
                            isExpanded ? "bg-emerald-50/20" : ""
                          }`}
                        >
                          <TableCell className="p-2 text-center">
                            {hasSubs ? (
                              <button
                                type="button"
                                onClick={() => toggleRow(item._id)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-transform"
                                title={
                                  isExpanded
                                    ? "Collapse sub-therapies"
                                    : "Expand sub-therapies"
                                }
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            ) : (
                              <span className="inline-block w-4" />
                            )}
                          </TableCell>

                          <TableCell className="font-mono text-xs font-semibold text-slate-600">
                            {item.code || "—"}
                          </TableCell>

                          <TableCell>
                            <div className="font-semibold text-slate-800 text-xs">
                              {item.name}
                            </div>
                            {item.description && (
                              <div className="text-[11px] text-slate-400 line-clamp-1 max-w-sm">
                                {item.description}
                              </div>
                            )}
                          </TableCell>

                          <TableCell>
                            {hasSubs ? (
                              <div className="flex items-center gap-1.5">
                                <Badge
                                  variant="secondary"
                                  className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                >
                                  <Layers className="h-3 w-3" />
                                  {subList.length}{" "}
                                  {subList.length === 1
                                    ? "Sub-Therapy"
                                    : "Sub-Therapies"}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-medium">
                                Standalone
                              </span>
                            )}
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}
                            >
                              {item.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right font-bold text-xs text-slate-800">
                            {hasSubs ? (
                              <span className="text-xs font-semibold text-slate-400 italic">
                                Varies by sub-therapy
                              </span>
                            ) : (
                              formatINR(item.price || 0)
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              {hasSubs && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAddSub(item)}
                                      className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg cursor-pointer transition-colors"
                                    >
                                      <PlusCircle className="h-4 w-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Add Sub-Therapy
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(item)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Therapy</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteTherapy(item)}
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>Delete Therapy</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Nested Sub-Therapies Accordion View */}
                        {hasSubs && isExpanded && (
                          <TableRow className="bg-slate-50/50 hover:bg-slate-50/60 border-b border-slate-200">
                            <TableCell colSpan={7} className="py-2.5 px-6">
                              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-2">
                                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                                  <div className="flex items-center gap-2">
                                    <CornerDownRight className="h-4 w-4 text-teal-600" />
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                      Sub-Therapies under &quot;{item.name}&quot;
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      ({subList.length} total)
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenAddSub(item)}
                                    className="h-7 text-xs rounded-lg border-teal-200 text-teal-700 hover:bg-teal-50 cursor-pointer font-semibold flex items-center gap-1"
                                  >
                                    <Plus className="h-3.5 w-3.5" /> Add
                                    Sub-Therapy
                                  </Button>
                                </div>

                                {subList.length === 0 ? (
                                  <p className="text-xs text-slate-400 py-3 text-center italic">
                                    No sub-therapies added yet. Click &quot;Add
                                    Sub-Therapy&quot; above.
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b border-slate-100 text-slate-500 font-semibold text-[11px]">
                                          <th className="py-1.5 text-left font-mono w-24">
                                            Code
                                          </th>
                                          <th className="py-1.5 text-left">
                                            Sub-Therapy Name
                                          </th>
                                          <th className="py-1.5 text-left">
                                            Description
                                          </th>
                                          <th className="py-1.5 text-left w-24">
                                            Status
                                          </th>
                                          <th className="py-1.5 text-right w-28">
                                            Price
                                          </th>
                                          <th className="py-1.5 text-center w-20">
                                            Actions
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {subList.map((st) => (
                                          <tr
                                            key={st._id}
                                            className="hover:bg-slate-50/75 transition-colors"
                                          >
                                            <td className="py-1.5 font-mono text-slate-600 text-[11px]">
                                              {st.code || "—"}
                                            </td>
                                            <td className="py-1.5 font-medium text-slate-800">
                                              {st.name}
                                            </td>
                                            <td className="py-1.5 text-slate-400 text-[11px] line-clamp-1 max-w-xs">
                                              {st.description || "—"}
                                            </td>
                                            <td className="py-1.5">
                                              <Badge
                                                variant="outline"
                                                className={`text-[9px] px-1.5 py-0 font-bold rounded-full ${
                                                  st.status === "Active"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                                }`}
                                              >
                                                {st.status}
                                              </Badge>
                                            </td>
                                            <td className="py-1.5 text-right font-bold text-slate-700">
                                              {formatINR(st.price)}
                                            </td>
                                            <td className="py-1.5 text-center">
                                              <div className="flex items-center justify-center gap-1">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleOpenEditSub(item, st)
                                                  }
                                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                                                  title="Edit Sub-Therapy"
                                                >
                                                  <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setDeleteSubTarget({
                                                      parentId: item._id,
                                                      parentName: item.name,
                                                      subTherapy: st,
                                                    })
                                                  }
                                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                                                  title="Delete Sub-Therapy"
                                                >
                                                  <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN THERAPY MODAL (CREATE / EDIT)                                      */}
        {/* ========================================================================= */}
        <Dialog open={openFormModal} onOpenChange={setOpenFormModal}>
          <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                {editingTherapy ? "Edit Therapy" : "Add New Therapy"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Configure therapy details, standalone pricing, or nested
                sub-therapies.
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
                <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-bold text-slate-700">
                    Therapy Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    required
                    placeholder="e.g. Acupuncture, Physiotherapy, Cupping"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Therapy Code
                  </Label>
                  <Input
                    placeholder="e.g. TH-01"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Status
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="rounded-xl border-slate-200 text-xs">
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
                <Label className="text-xs font-bold text-slate-700">
                  Description
                </Label>
                <Textarea
                  placeholder="Optional brief notes or instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-emerald-100 resize-none h-18"
                />
              </div>

              {/* Sub-Therapies Toggle */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                      <Layers className="h-4 w-4 text-teal-600" />
                      Has Sub-Therapies?
                    </Label>
                    <p className="text-[11px] text-slate-500">
                      Enable if this therapy contains multiple sub-types with
                      individual pricing.
                    </p>
                  </div>
                  <Switch
                    checked={hasSubTherapies}
                    onCheckedChange={setHasSubTherapies}
                  />
                </div>

                {/* Standalone Price if NO sub-therapies */}
                {!hasSubTherapies ? (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">
                      Standalone Therapy Price (₹){" "}
                      <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="e.g. 500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-emerald-100 max-w-xs"
                    />
                  </div>
                ) : (
                  /* Dynamic Sub-Therapies Builder inside Main Modal */
                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">
                        Sub-Therapy Items ({tempSubList.length})
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddTempSub}
                        className="h-7 text-xs rounded-lg border-teal-300 text-teal-700 hover:bg-teal-50 font-semibold cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Row
                      </Button>
                    </div>

                    {tempSubList.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-3 italic bg-white rounded-lg border border-dashed border-slate-200">
                        No sub-therapies added. Click &quot;Add Row&quot; to specify
                        sub-types.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {tempSubList.map((st, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-2 relative group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-600">
                                Sub-Therapy #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTempSub(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded cursor-pointer"
                                title="Remove row"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <Input
                                placeholder="Sub-therapy name *"
                                value={st.name}
                                onChange={(e) =>
                                  handleUpdateTempSub(idx, "name", e.target.value)
                                }
                                className="rounded-lg text-xs h-8 border-slate-200"
                              />
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Price (₹) *"
                                value={st.price}
                                onChange={(e) =>
                                  handleUpdateTempSub(idx, "price", e.target.value)
                                }
                                className="rounded-lg text-xs h-8 border-slate-200"
                              />
                              <Input
                                placeholder="Code (optional)"
                                value={st.code}
                                onChange={(e) =>
                                  handleUpdateTempSub(idx, "code", e.target.value)
                                }
                                className="rounded-lg text-xs h-8 border-slate-200"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenFormModal(false)}
                  className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl text-white font-bold bg-(--color-synapse-light) cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingTherapy ? (
                    "Update Therapy"
                  ) : (
                    "Create Therapy"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* SUB-THERAPY MODAL (ADD / EDIT INDIVIDUAL)                                */}
        {/* ========================================================================= */}
        <Dialog open={openSubModal} onOpenChange={setOpenSubModal}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Layers className="h-4 w-4 text-teal-600" />
                {editingSubTherapy ? "Edit Sub-Therapy" : "Add Sub-Therapy"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Parent Therapy:{" "}
                <span className="font-bold text-slate-700">
                  {parentForSub?.name}
                </span>
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
                <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSubModal} className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">
                  Sub-Therapy Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="e.g. Dry Needling, Electroacupuncture"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">
                    Price (₹) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 350"
                    value={subPrice}
                    onChange={(e) => setSubPrice(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">
                    Code
                  </Label>
                  <Input
                    placeholder="e.g. TH-DN"
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">
                  Status
                </Label>
                <Select value={subStatus} onValueChange={setSubStatus}>
                  <SelectTrigger className="rounded-xl border-slate-200 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">
                  Description
                </Label>
                <Textarea
                  placeholder="Optional details..."
                  value={subDescription}
                  onChange={(e) => setSubDescription(e.target.value)}
                  className="rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-emerald-100 resize-none h-16"
                />
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenSubModal(false)}
                  className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl text-white font-bold bg-(--color-synapse-light) cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingSubTherapy ? (
                    "Save Changes"
                  ) : (
                    "Add Sub-Therapy"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* DELETE MAIN THERAPY ALERT                                               */}
        {/* ========================================================================= */}
        <AlertDialog
          open={Boolean(deleteTherapy)}
          onOpenChange={(open) => !open && setDeleteTherapy(null)}
        >
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold text-slate-800">
                Delete Therapy &quot;{deleteTherapy?.name}&quot;?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-500">
                This action will mark the therapy and all of its associated
                sub-therapies as deleted. Past consultation and billing records
                will remain preserved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete Therapy"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ========================================================================= */}
        {/* DELETE SUB-THERAPY ALERT                                                */}
        {/* ========================================================================= */}
        <AlertDialog
          open={Boolean(deleteSubTarget)}
          onOpenChange={(open) => !open && setDeleteSubTarget(null)}
        >
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold text-slate-800">
                Delete Sub-Therapy &quot;{deleteSubTarget?.subTherapy.name}&quot;?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-500">
                This will remove the sub-therapy from &quot;
                {deleteSubTarget?.parentName}&quot;. Existing patient records
                will not be altered.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeleteSub}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete Sub-Therapy"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TooltipProvider>
    </AppShell>
  );
}
