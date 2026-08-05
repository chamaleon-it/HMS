"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

export interface TherapyItem {
  _id: string;
  name: string;
  price: number;
  code?: string;
  description?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function TherapyPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal States
  const [openFormModal, setOpenFormModal] = useState(false);
  const [editingTherapy, setEditingTherapy] = useState<TherapyItem | null>(null);
  const [deleteTherapy, setDeleteTherapy] = useState<TherapyItem | null>(null);

  // Form Field States
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Therapies
  const { data, error, isLoading, mutate } = useSWR<{
    message: string;
    data: TherapyItem[];
  }>(`/therapy?search=${encodeURIComponent(search)}`, {
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
  const avgPrice =
    totalCount > 0
      ? rawTherapies.reduce((sum, t) => sum + (t.price || 0), 0) / totalCount
      : 0;

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingTherapy(null);
    setName("");
    setPrice("");
    setCode("");
    setDescription("");
    setStatus("Active");
    setErrorMsg(null);
    setOpenFormModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (item: TherapyItem) => {
    setEditingTherapy(item);
    setName(item.name || "");
    setPrice(item.price ? String(item.price) : "");
    setCode(item.code || "");
    setDescription(item.description || "");
    setStatus(item.status || "Active");
    setErrorMsg(null);
    setOpenFormModal(true);
  };

  // Handle Create / Update Submit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Therapy name is required.");
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMsg("Please enter a valid non-negative price.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: name.trim(),
      price: numPrice,
      code: code.trim() || undefined,
      description: description.trim() || undefined,
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
        "Failed to save therapy. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Soft Delete
  const handleConfirmDelete = async () => {
    if (!deleteTherapy) return;
    setIsDeleting(true);
    try {
      await api.delete(`/therapy/${deleteTherapy._id}`);
      setSuccessMsg(`Therapy "${deleteTherapy.name}" deleted successfully.`);
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
          {errorMsg && !openFormModal && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 shadow-sm animate-in fade-in slide-in-from-top-2">
              <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span className="text-sm font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Pharmacy Standard Header */}
          <PharmacyHeader title="Therapy Management" subtitle="Add and manage therapy packages and pricing">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => mutate()}
                className="flex items-center gap-2 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
              <Button
                onClick={handleOpenCreate}
                className="flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shadow-md bg-(--color-synapse-dark) hover:bg-slate-800 cursor-pointer"
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
                    Total Therapies
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-0.5">
                    {totalCount}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Activity className="h-5 w-5" />
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

            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Average Price
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-0.5">
                    {formatINR(avgPrice)}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  ₹
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
                placeholder="Search therapy name, code, or description..."
                className="bg-transparent border-none outline-none text-sm w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-xs text-slate-400 hover:text-slate-600"
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
                <p className="font-medium">Failed to load therapies.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => mutate()}
                  className="mt-3 rounded-xl"
                >
                  Retry
                </Button>
              </div>
            ) : therapies.length === 0 ? (
              <div className="p-16 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8" />
                </div>
                <h4 className="text-base font-semibold text-slate-700">
                  No Therapies Found
                </h4>
                <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                  {search
                    ? `No therapies match "${search}". Try searching with a different keyword.`
                    : "Click the button below to add your first therapy."}
                </p>
                {!search && (
                  <Button
                    onClick={handleOpenCreate}
                    className="mt-4 rounded-xl bg-(--color-synapse-dark) text-white font-bold text-sm px-4 py-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Therapy
                  </Button>
                )}
              </div>
            ) : (
              <Table className="w-full min-w-225">
                <TableHeader className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark)">
                  <TableRow className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) border-b-0">
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4 pl-6 w-20">
                      Sl No
                    </TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4 w-30">
                      Code
                    </TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4">
                      Therapy Name
                    </TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4">
                      Description
                    </TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4">
                      Price
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
                  {therapies.map((item, idx) => (
                    <TableRow
                      key={item._id}
                      className={`transition-colors border-b border-slate-100 ${idx % 2 === 0
                        ? "bg-white hover:bg-slate-50/80"
                        : "bg-slate-50/40 hover:bg-slate-50"
                        }`}
                    >
                      <TableCell className="py-3 pl-6 font-medium text-slate-500">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="py-3 font-mono text-xs text-slate-600">
                        {item.code || "—"}
                      </TableCell>
                      <TableCell className="py-3 font-semibold text-slate-800">
                        {item.name}
                      </TableCell>
                      <TableCell className="py-3 text-slate-500 max-w-xs truncate">
                        {item.description || "—"}
                      </TableCell>
                      <TableCell className="py-3 font-bold text-slate-900">
                        {formatINR(item.price)}
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
                        <div className="flex items-center justify-end gap-2">
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
                            <TooltipContent>Edit Therapy</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteTherapy(item)}
                                className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Therapy</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Add / Edit Therapy Modal */}
        <Dialog open={openFormModal} onOpenChange={setOpenFormModal}>
          <DialogContent className="sm:max-w-md rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Activity className="h-5 w-5 text-(--color-synapse-light)" />
                {editingTherapy ? "Edit Therapy" : "Add New Therapy"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">
                {editingTherapy
                  ? "Update the details and price for this therapy."
                  : "Enter details and pricing to create a new therapy item."}
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                  Therapy Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Physiotherapy Session"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs font-semibold text-slate-700">
                    Price (₹) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="price"
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

                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-xs font-semibold text-slate-700">
                    Therapy Code
                  </Label>
                  <Input
                    id="code"
                    placeholder="e.g. TH-001"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-semibold text-slate-700">
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

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold text-slate-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Optional description or therapy details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl border-slate-200 text-sm resize-none"
                />
              </div>

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
                  className="rounded-xl bg-(--color-synapse-dark) text-white font-bold cursor-pointer"
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

        {/* Confirm Soft Delete Alert Dialog */}
        <AlertDialog
          open={!!deleteTherapy}
          onOpenChange={(open) => !open && setDeleteTherapy(null)}
        >
          <AlertDialogContent className="rounded-2xl p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-rose-500" />
                Delete Therapy
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-600 mt-2">
                Are you sure you want to delete{" "}
                <strong className="text-slate-900">{deleteTherapy?.name}</strong>?
                This will mark the therapy as deleted and remove it from active listings.
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
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TooltipProvider>
    </AppShell>
  );
}
