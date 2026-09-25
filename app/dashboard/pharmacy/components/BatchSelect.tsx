"use client";

import React, { useEffect, useMemo, useRef } from "react";
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
  unitPrice?: number;
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
  /** Optional: help resolve stale ObjectIds after B0 re-import by batch number. */
  batchNumber?: string | null;
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
  batchNumber,
  onSelect,
  onStockCap,
  sort = "fefo",
  className,
}: Props) {
  const key = itemId
    ? `/pharmacy/items/${itemId}/batches?sort=${sort}`
    : null;
  const { data, isLoading } = useSWR<BatchesApi>(key);
  const lastApplied = useRef<string | null>(null);

  const batches = useMemo(() => {
    return (data?.data?.batches || []).filter((b) => {
      if (b.expired) return false;
      const status = String(b.status || "active").toLowerCase();
      if (status === "inactive") return false;
      return (Number(b.stock) || 0) > 0;
    });
  }, [data]);

  const selected =
    batches.find((b) => b.batchId === value) ||
    (batchNumber
      ? batches.find(
          (b) =>
            String(b.batchNumber).toLowerCase() ===
            String(batchNumber).toLowerCase()
        )
      : null) ||
    (value
      ? batches.find(
          (b) =>
            String(b.batchNumber).toLowerCase() === String(value).toLowerCase()
        )
      : null) ||
    null;

  useEffect(() => {
    if (!itemId) {
      if (lastApplied.current !== null) {
        lastApplied.current = null;
        onSelect(null);
      }
      return;
    }
    if (batches.length === 0) return;

    // Stale batchId after B0 re-import: value not in list → rebind by number or FEFO
    if (!selected) {
      const byNum = batchNumber
        ? batches.find(
            (b) =>
              String(b.batchNumber).toLowerCase() ===
              String(batchNumber).toLowerCase()
          )
        : null;
      const pick =
        byNum || batches.find((b) => b.available !== false) || batches[0];
      if (pick && lastApplied.current !== pick.batchId) {
        lastApplied.current = pick.batchId;
        onSelect(pick);
        onStockCap?.(Number(pick.stock) || 0);
      }
      return;
    }

    // Keep parent snapshot in sync when we resolved via batchNumber or auto-pick
    if (selected.batchId !== value && lastApplied.current !== selected.batchId) {
      lastApplied.current = selected.batchId;
      onSelect(selected);
      onStockCap?.(Number(selected.stock) || 0);
      return;
    }

    if (!value && lastApplied.current !== selected.batchId) {
      lastApplied.current = selected.batchId;
      onSelect(selected);
      onStockCap?.(Number(selected.stock) || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, batches, value, batchNumber, selected?.batchId]);

  useEffect(() => {
    if (selected) {
      onStockCap?.(Number(selected.stock) || 0);
    }
  }, [selected?.batchId, selected?.stock]);

  const rateOf = (b: BatchOption) => Number(b.unitPrice ?? b.sellingPrice ?? 0) || 0;

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
      value={selected?.batchId || value || ""}
      disabled={isLoading || batches.length === 0}
      onChange={(e) => {
        const b = batches.find((x) => x.batchId === e.target.value) || null;
        lastApplied.current = b?.batchId || null;
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
