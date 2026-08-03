"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useSWR from "swr";
import toast from "react-hot-toast";
import { Loader2, Edit3 } from "lucide-react";
import api from "@/lib/axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TypableExpiryInput from "../purchase-entry/components/TypableExpiryInput";
import { BatchType, ItemType } from "./interface";

const editBatchSchema = z.object({
  batchNumber: z.string().min(1, "Batch number is required"),
  pack: z.coerce.number().min(1, "Pack must be at least 1"),
  noOfPack: z.coerce.number().min(0, "Qty must be non-negative"),
  mrp: z.coerce.number().min(0, "MRP must be positive"),
  unitPrice: z.coerce.number().min(0, "Unit price must be positive").optional(),
  expiryDate: z.coerce.date(),
  purchasePrice: z.coerce.number().min(0, "Purchase price must be positive"),
  free: z.coerce.number().min(0).default(0),
  schemaAmt: z.coerce.number().min(0).default(0),
  quantity: z.coerce.number().min(0, "Total units must be non-negative"),
  total: z.coerce.number().min(0).default(0),
  supplier: z.string().min(1, "Supplier is required"),
});

type EditBatchFormValues = z.infer<typeof editBatchSchema>;

interface EditBatchModalProps {
  item: ItemType;
  batch: BatchType | null;
  isOpen: boolean;
  onClose: () => void;
  mutate: () => void;
}

export function EditBatchModal({
  item,
  batch,
  isOpen,
  onClose,
  mutate,
}: EditBatchModalProps) {
  const { data: suppliersData } = useSWR<{
    message: string;
    data: { _id: string; name: string }[];
  }>("/suppliers/get_id_and_name");
  const suppliers = suppliersData?.data || [];

  const initialPack = batch?.pack || item.packing || 10;
  const initialMrp = batch?.mrp ?? item.mrp ?? item.unitPrice ?? 0;
  const initialPrice = batch?.purchasePrice ?? item.purchasePrice ?? 0;
  const initialUnits = batch?.quantity || 0;
  const initialFree = batch?.free || 0;
  const initialNoOfPack =
    batch?.noOfPack ??
    (initialPack > 0
      ? Math.max(0, Math.floor(initialUnits / initialPack) - initialFree)
      : 0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditBatchFormValues>({
    // @ts-expect-error zodResolver type
    resolver: zodResolver(editBatchSchema),
    defaultValues: {
      batchNumber: batch?.batchNumber || "",
      pack: initialPack,
      noOfPack: initialNoOfPack,
      mrp: initialMrp,
      unitPrice: batch?.unitPrice ?? (initialPack > 0 ? initialMrp / initialPack : initialMrp),
      purchasePrice: initialPrice,
      expiryDate: batch?.expiryDate ? new Date(batch.expiryDate) : new Date(),
      free: initialFree,
      schemaAmt: batch?.schemaAmt ?? initialFree * initialPrice,
      quantity: initialUnits,
      total: batch?.total ?? initialNoOfPack * initialPrice + initialFree * initialPrice,
      supplier: batch?.supplier || item.supplier || "-",
    },
  });

  // Re-set default form values when target batch changes
  useEffect(() => {
    if (batch) {
      const pack = batch.pack || item.packing || 10;
      const mrp = batch.mrp ?? item.mrp ?? item.unitPrice ?? 0;
      const price = batch.purchasePrice ?? item.purchasePrice ?? 0;
      const units = batch.quantity || 0;
      const free = batch.free || 0;
      const noOfPack =
        batch.noOfPack ??
        (pack > 0 ? Math.max(0, Math.floor(units / pack) - free) : 0);

      reset({
        batchNumber: batch.batchNumber,
        pack,
        noOfPack,
        mrp,
        unitPrice: batch.unitPrice ?? (pack > 0 ? mrp / pack : mrp),
        purchasePrice: price,
        expiryDate: batch.expiryDate ? new Date(batch.expiryDate) : new Date(),
        free,
        schemaAmt: batch.schemaAmt ?? free * price,
        quantity: units,
        total: batch.total ?? noOfPack * price + free * price,
        supplier: batch.supplier || item.supplier || "-",
      });
    }
  }, [batch, item, reset]);

  const expiryDate = watch("expiryDate");
  const watchedPack = watch("pack");
  const watchedNoOfPack = watch("noOfPack");
  const watchedFree = watch("free");
  const watchedPurchasePrice = watch("purchasePrice");
  const watchedMrp = watch("mrp");

  // Auto-calculate derived fields
  useEffect(() => {
    const p = Number(watchedPack) || 0;
    const q = Number(watchedNoOfPack) || 0;
    const f = Number(watchedFree) || 0;
    const r = Number(watchedPurchasePrice) || 0;
    const m = Number(watchedMrp) || 0;

    const units = (q + f) * p;
    const sAmt = r * f;
    const tot = q * r + sAmt;
    const calculatedUnitPrice = p > 0 ? m / p : m;

    setValue("quantity", units > 0 ? units : q + f, { shouldValidate: true });
    setValue("schemaAmt", sAmt);
    setValue("total", tot);
    if (calculatedUnitPrice > 0) {
      setValue("unitPrice", Number(calculatedUnitPrice.toFixed(2)));
    }
  }, [
    watchedPack,
    watchedNoOfPack,
    watchedFree,
    watchedPurchasePrice,
    watchedMrp,
    setValue,
  ]);

  const onSubmit = handleSubmit(async (data) => {
    if (!batch?._id) {
      toast.error("Batch ID missing");
      return;
    }
    try {
      await api.patch(
        `/pharmacy/items/${item._id}/batches/${batch._id}`,
        data
      );
      toast.success("Batch updated successfully");
      mutate();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to update batch"
      );
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl! rounded-2xl p-6 shadow-2xl bg-white border border-slate-200">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Edit3 className="w-5 h-5 text-indigo-600" />
            Edit Batch Details
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Updating batch <span className="font-mono font-semibold text-slate-800">{batch?.batchNumber}</span> for medicine <span className="font-semibold text-indigo-600">{item.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-3">
          <div className="grid grid-cols-2 gap-4">
            {/* Batch Number */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Batch Number *</label>
              <Input
                {...register("batchNumber")}
                placeholder="e.g. BATCH001"
                className="mt-1 h-9 text-xs font-mono rounded-lg"
              />
              {errors.batchNumber && (
                <p className="text-[11px] text-red-500 mt-0.5">{errors.batchNumber.message}</p>
              )}
            </div>

            {/* Expiry Date */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Expiry Date *</label>
              <div className="mt-1">
                <TypableExpiryInput
                  value={
                    expiryDate
                      ? expiryDate instanceof Date
                        ? expiryDate.toISOString()
                        : (expiryDate as any)
                      : ""
                  }
                  onChange={(dt) =>
                    setValue("expiryDate", dt as any, { shouldValidate: true })
                  }
                />
              </div>
              {errors.expiryDate && (
                <p className="text-[11px] text-red-500 mt-0.5">{errors.expiryDate.message}</p>
              )}
            </div>

            {/* Pack Size */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Pack (Units per pack) *</label>
              <Input
                type="number"
                {...register("pack")}
                placeholder="e.g. 10"
                className="mt-1 h-9 text-xs rounded-lg"
              />
              {errors.pack && (
                <p className="text-[11px] text-red-500 mt-0.5">{errors.pack.message}</p>
              )}
            </div>

            {/* QTY (Packs) */}
            <div>
              <label className="text-xs font-semibold text-slate-700">QTY (No. of Packs) *</label>
              <Input
                type="number"
                {...register("noOfPack")}
                placeholder="e.g. 5"
                className="mt-1 h-9 text-xs rounded-lg"
              />
              {errors.noOfPack && (
                <p className="text-[11px] text-red-500 mt-0.5">{errors.noOfPack.message}</p>
              )}
            </div>

            {/* MRP */}
            <div>
              <label className="text-xs font-semibold text-slate-700">MRP (per pack ₹) *</label>
              <Input
                type="number"
                step="0.01"
                {...register("mrp")}
                placeholder="e.g. 120.00"
                className="mt-1 h-9 text-xs rounded-lg font-medium"
              />
              {errors.mrp && (
                <p className="text-[11px] text-red-500 mt-0.5">{errors.mrp.message}</p>
              )}
            </div>

            {/* Purchase Price / Rate */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Purchase Rate (per pack ₹) *</label>
              <Input
                type="number"
                step="0.01"
                {...register("purchasePrice")}
                placeholder="e.g. 100.00"
                className="mt-1 h-9 text-xs rounded-lg font-medium"
              />
              {errors.purchasePrice && (
                <p className="text-[11px] text-red-500 mt-0.5">{errors.purchasePrice.message}</p>
              )}
            </div>

            {/* Schema Free Packs */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Schema (Free Packs)</label>
              <Input
                type="number"
                {...register("free")}
                placeholder="e.g. 0"
                className="mt-1 h-9 text-xs rounded-lg"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Supplier *</label>
              <Select
                value={watch("supplier")}
                onValueChange={(val) => setValue("supplier", val, { shouldValidate: true })}
              >
                <SelectTrigger className="mt-1 h-9 w-full text-xs rounded-lg">
                  <SelectValue placeholder="Select Supplier" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-slate-200">
                  {suppliers.map((s) => (
                    <SelectItem key={s._id} value={s.name} className="text-xs">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calculated Total Units */}
            <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100">
              <label className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">Total Units</label>
              <p className="text-lg font-extrabold text-indigo-900 mt-0.5">
                {watch("quantity")} <span className="text-xs font-medium text-indigo-600">units</span>
              </p>
            </div>

            {/* Calculated Total Amount */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Total Batch Amount</label>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                ₹ {Number(watch("total") || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs h-9 px-5 font-semibold shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Batch Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
