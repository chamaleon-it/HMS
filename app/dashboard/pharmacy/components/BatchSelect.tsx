"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  sort?: "fefo" | "fifo";
  className?: string;
};

/**
 * Manual batch picker. Only active batches with quantity > 0 are selectable.
 * Option label: batch# | exp | stock | rate.
 */
export default function BatchSelect({
  itemId,
  value,
  onSelect,
  onStockCap,
  sort = "fefo",
  className,
}: Props) {
  const [sortMode, setSortMode] = useState<"fefo" | "fifo">(sort);
  const key = itemId
    ? `/pharmacy/items/${itemId}/batches?sort=${sortMode}`
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
  }, [itemId, batches.length, sortMode]);

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
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-2">
        <select
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs"
          value={value || ""}
          disabled={isLoading || batches.length === 0}
          onChange={(e) => {
            const b = batches.find((x) => x.batchId === e.target.value) || null;
            onSelect(b);
            if (b) onStockCap?.(Number(b.stock) || 0);
          }}
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
              {b.batchNumber} | Exp{" "}
              {b.expiryDate ? fDate(b.expiryDate) : "—"} | Stock {b.stock} |{" "}
              {formatINR(rateOf(b))}
            </option>
          ))}
        </select>
        <div className="flex shrink-0 rounded-md border border-slate-200 overflow-hidden text-[10px]">
          <button
            type="button"
            className={cn(
              "px-2 py-1",
              sortMode === "fefo" ? "bg-slate-800 text-white" : "bg-white",
            )}
            onClick={() => setSortMode("fefo")}
            title="Earliest expiry first"
          >
            FEFO
          </button>
          <button
            type="button"
            className={cn(
              "px-2 py-1",
              sortMode === "fifo" ? "bg-slate-800 text-white" : "bg-white",
            )}
            onClick={() => setSortMode("fifo")}
            title="Oldest intake first"
          >
            FIFO
          </button>
        </div>
      </div>

      {selected && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-2 text-[10px] text-slate-600">
          <Detail label="Batch #" value={selected.batchNumber} />
          <Detail
            label="Expiry"
            value={selected.expiryDate ? fDate(selected.expiryDate) : "—"}
          />
          <Detail label="MRP" value={formatINR(selected.mrp || 0)} />
          <Detail
            label="Purchase"
            value={formatINR(
              selected.purchaseRate ?? selected.purchasePrice ?? 0,
            )}
          />
          <Detail label="Sale rate" value={formatINR(rateOf(selected))} />
          <Detail label="GST %" value={String(selected.gst ?? 0)} />
          <Detail label="Stock" value={String(selected.stock)} />
          <Detail label="Supplier" value={selected.supplier || "—"} />
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="uppercase tracking-wide text-slate-400">{label}: </span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}
