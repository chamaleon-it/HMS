"use client";

import React, { useEffect, useMemo } from "react";
import useSWR from "swr";
import { fDate } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import { cn } from "@/lib/utils";

export type BatchOption = {
  batchId: string;
  batchNumber: string;
  expiryDate?: string | Date;
  purchasePrice?: number;
  purchaseRate?: number;
  sellingPrice?: number;
  saleRate?: number;
  mrp?: number;
  gst?: number;
  stock: number;
  quantity?: number;
  supplier?: string;
  packing?: number;
  status?: "active" | "inactive" | string;
  expired?: boolean;
  available?: boolean;
};

type BatchesApi = {
  data: {
    batches: BatchOption[];
    packing?: number;
    unitPrice?: number;
    mrp?: number;
  };
};

type Props = {
  itemId: string | null | undefined;
  value?: string | null;
  onSelect: (batch: BatchOption | null) => void;
  /** Cap selected qty helper — parent should use this as max qty. */
  onStockCap?: (maxQty: number) => void;
  /** Default FEFO; kept for API compat — UI is a single compact field. */
  sort?: "fefo" | "fifo";
  className?: string;
};

/**
 * Compact batch picker. Option label: batch# | exp | stock | rate.
 * Defaults to FEFO sort from the API; no FEFO/FIFO pills or detail panel.
 */
export default function BatchSelect({
  itemId,
  value,
  onSelect,
  onStockCap,
  sort = "fefo",
  className,
}: Props) {
  const key = itemId
    ? `/pharmacy/items/${itemId}/batches?sort=${sort}`
    : null;
  const { data, isLoading } = useSWR<BatchesApi>(key);

  const batches = useMemo(() => {
    return (data?.data?.batches || []).filter((b) => {
      if (b.expired) return false;
      const status = String(b.status || "active").toLowerCase();
      if (status === "inactive") return false;
      return (Number(b.stock) || 0) > 0;
    });
  }, [data]);

  const selected = batches.find((b) => b.batchId === value) || null;

  useEffect(() => {
    if (!itemId) {
      onSelect(null);
      return;
    }
    if (!value && batches.length > 0) {
      const pick = batches.find((b) => b.available !== false) || batches[0];
      if (pick) {
        onSelect(pick);
        onStockCap?.(Number(pick.stock) || 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, batches.length]);

  useEffect(() => {
    if (selected) {
      onStockCap?.(Number(selected.stock) || 0);
    }
  }, [selected?.batchId, selected?.stock]);

  const rateOf = (b: BatchOption) =>
    Number(b.saleRate ?? b.sellingPrice ?? 0) || 0;

  if (!itemId) {
    return (
      <div className={cn("text-[11px] text-slate-400", className)}>
        Select medicine first
      </div>
    );
  }

  return (
    <select
      className={cn(
        "h-8 max-w-md w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700",
        className,
      )}
      value={value || ""}
      disabled={isLoading || batches.length === 0}
      onChange={(e) => {
        const b = batches.find((x) => x.batchId === e.target.value) || null;
        onSelect(b);
        if (b) onStockCap?.(Number(b.stock) || 0);
      }}
      title={
        selected
          ? `${selected.batchNumber} · Exp ${selected.expiryDate ? fDate(selected.expiryDate) : "—"} · Stock ${selected.stock} · ${formatINR(rateOf(selected))}`
          : undefined
      }
    >
      <option value="" disabled>
        {isLoading
          ? "Loading batches…"
          : batches.length === 0
            ? "No sellable batches"
            : "Select batch"}
      </option>
      {batches.map((b) => (
        <option key={b.batchId} value={b.batchId}>
          {b.batchNumber} · Exp {b.expiryDate ? fDate(b.expiryDate) : "—"} · Stock{" "}
          {b.stock} · {formatINR(rateOf(b))}
        </option>
      ))}
    </select>
  );
}
