"use client";

import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BatchType } from "./inventory/interface";
import { formatINR } from "@/lib/fNumber";
import { fDate } from "@/lib/fDateAndTime";
import {
  ChevronDown,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  Package,
  Boxes,
} from "lucide-react";
import useSWR from "swr";

interface BatchSelectorProps {
  itemId?: string;
  medicineName?: string;
  initialBatches?: BatchType[];
  selectedBatchNumber?: string;
  onSelectBatch: (batch: BatchType) => void;
  disabled?: boolean;
  onEnter?: () => void;
}

export default function BatchSelector({
  itemId,
  medicineName,
  initialBatches,
  selectedBatchNumber,
  onSelectBatch,
  disabled,
  onEnter,
}: BatchSelectorProps) {
  const [open, setOpen] = useState(false);

  // If initialBatches are not provided or empty, fetch the item by ID to get latest batches
  const { data: itemData } = useSWR(
    itemId && (!initialBatches || initialBatches.length === 0)
      ? `/pharmacy/items/${itemId}`
      : null,
    { keepPreviousData: true }
  );

  const batches: BatchType[] =
    initialBatches && initialBatches.length > 0
      ? initialBatches
      : itemData?.data?.batches || [];

  // Only show active batches with stock > 0 in new orders
  const availableBatches = batches.filter(
    (b) => b.isActive !== false && (b.quantity ?? 0) > 0
  );

  const selectedBatch = availableBatches.find(
    (b) =>
      b.batchNumber &&
      b.batchNumber.toLowerCase() === selectedBatchNumber?.trim().toLowerCase()
  );

  // Auto-select if there is only 1 available batch and none is selected yet
  useEffect(() => {
    if (!selectedBatchNumber && availableBatches.length === 1 && availableBatches[0]?.batchNumber) {
      onSelectBatch(availableBatches[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableBatches.length, selectedBatchNumber]);

  if (disabled || !itemId) {
    return (
      <div className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-xs flex items-center select-none truncate">
        Select drug first
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="h-8 px-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-[11px] flex items-center gap-1.5 truncate">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
        <span className="truncate">No batches available</span>
      </div>
    );
  }

  if (availableBatches.length === 0) {
    return (
      <div className="h-8 px-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-[11px] flex items-center gap-1.5 truncate">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
        <span className="truncate">No stock available</span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`h-8 w-full px-2.5 rounded-lg border text-xs flex items-center justify-between gap-1.5 transition-all outline-none cursor-pointer ${
            selectedBatch
              ? "bg-white border-slate-300 text-slate-800 hover:border-slate-400 shadow-2xs"
              : "bg-amber-50/80 border-amber-300 text-amber-900 animate-pulse font-medium"
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <Layers className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            {selectedBatch ? (
              <span className="truncate font-semibold">
                {selectedBatch.batchNumber}{" "}
                <span className="text-[11px] font-normal text-slate-500">
                  ({selectedBatch.quantity} in stock &bull; {formatINR(selectedBatch.unitPrice || 0)})
                </span>
              </span>
            ) : (
              <span className="truncate font-medium text-amber-800">
                Select Batch ({availableBatches.length})
              </span>
            )}
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[420px] p-0 rounded-xl shadow-xl border-slate-200 max-h-[360px] overflow-hidden flex flex-col z-50 bg-white"
      >
        {/* Header */}
        <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900">
              Select Batch
            </div>
            <div className="text-[11px] text-slate-500 truncate max-w-[280px]">
              {medicineName || "Available Batches"}
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {availableBatches.length} {availableBatches.length === 1 ? "Batch" : "Batches"}
          </span>
        </div>

        {/* List of Batches */}
        <div className="overflow-y-auto p-2 space-y-2 max-h-[290px]">
          {availableBatches.map((batch, idx) => {
            const isSelected =
              batch.batchNumber.toLowerCase() ===
              selectedBatchNumber?.trim().toLowerCase();
            const isOutOfStock = (batch.quantity ?? 0) <= 0;
            const isExpired =
              batch.expiryDate && new Date(batch.expiryDate) < new Date();

            return (
              <div
                key={batch._id || batch.batchNumber || idx}
                onClick={() => {
                  onSelectBatch(batch);
                  setOpen(false);
                  onEnter?.();
                }}
                className={`p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/80"
                }`}
              >
                {/* Top row: Batch No & Stock */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <span className="font-mono">{batch.batchNumber}</span>
                    {isSelected && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {isExpired ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                        Expired
                      </span>
                    ) : null}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOutOfStock
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : (batch.quantity ?? 0) < 10
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {batch.quantity ?? 0} in stock
                    </span>
                  </div>
                </div>

                {/* Details Grid: 2 columns */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600 bg-slate-50/80 p-2 rounded-md border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Pack / Strip:</span>
                    <span className="truncate max-w-[80px] font-medium text-slate-700">
                      {batch.packing ? `${batch.packing}` : "-"}{" "}
                      {batch.stripCount ? `/ ${batch.stripCount}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">MRP:</span>
                    <span className="font-medium text-slate-700">{formatINR(batch.mrp || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Unit Price:</span>
                    <strong className="text-slate-900">
                      {formatINR(batch.unitPrice || 0)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">P. Rate:</span>
                    <span className="font-medium text-slate-700">{formatINR(batch.purchasePrice || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">GST:</span>
                    <span className="font-medium text-slate-700">{batch.gst ? `${batch.gst}%` : "0%"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Expiry:</span>
                    <span
                      className={
                        isExpired
                          ? "text-rose-600 font-semibold"
                          : "text-slate-700 font-medium"
                      }
                    >
                      {batch.expiryDate ? fDate(batch.expiryDate) : "-"}
                    </span>
                  </div>
                </div>

                {/* Supplier Footer */}
                {batch.supplier && batch.supplier !== "-" && (
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 truncate">
                    <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">Supplier: {batch.supplier}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
