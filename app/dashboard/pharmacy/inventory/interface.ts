export type BatchStatus = "active" | "inactive";

/** Batch-level pricing & stock (canonical pharmacy inventory unit). */
export interface IBatch {
  _id?: string;
  batchNumber: string;
  expiryDate: Date | string;
  mrp: number;
  purchaseRate: number;
  /** Legacy dual-read alias — prefer purchaseRate. */
  purchasePrice?: number;
  /** Canonical sale / unit rate (replaces saleRate). */
  unitPrice: number;
  /** Legacy Atlas dual-read — prefer unitPrice. */
  saleRate?: number;
  startingQuantity: number;
  quantity: number;
  status: BatchStatus;
  supplier?: string;
  /** Units per strip/bottle for this batch. */
  packing?: number;
  /** Number of strips/bottles for this batch. */
  stripCount?: number;
  /** GST % for this batch. */
  gst?: number;
  createdAt: Date | string;
}

/**
 * Pharmacy item master — pricing/supplier/packing live on batches.
 * quantity / expiryDate are denormalized aggregates for list filters.
 * sku is system identity (auto-generated).
 */
export interface IPharmacyItem {
  _id: string;
  name: string;
  pharmacy: string;
  generic: string;
  hsnCode: string;
  sku?: string;
  category: string;
  manufacturer: string;
  /** Aggregate of active batch quantities. */
  quantity: number;
  expiryDate?: Date | string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  batches: IBatch[];
  batchNumber?: string;
  rackLocation?: string;
  soldQuantity?: number;
  soldHistory?: Array<{
    date: Date | string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  /**
   * Legacy Atlas dual-read only — not written on new saves.
   * Prefer batchUnitPrice(latestBatch).
   */
  unitPrice?: number;
  mrp?: number;
  purchasePrice?: number;
  supplier?: string;
  packing?: number;
  noOfPacking?: number;
  openingStockQuantity?: number;
  gst?: number;
}

/** @deprecated Prefer IBatch — kept for gradual migration. */
export type BatchType = IBatch & {
  /** @deprecated use purchaseRate */
  purchasePrice: number;
};

/** @deprecated Prefer IPharmacyItem */
export type ItemType = IPharmacyItem;

export interface FilterType {
  q?: string | undefined;
  category?: string | undefined;
  stock?: string | undefined;
  expiry?: number | undefined;
  page: number;
  limit: number;
  lowStockThreshold?: number;
  supplier?: string;
  lowStockItemsView: boolean;
  sortBy?: "createdAt" | "quantity";
  orderBy?: "desc" | "asc";
}

/** Helpers for dual-read of legacy batches. */
export function batchPurchaseRate(b: Partial<IBatch> | null | undefined): number {
  if (!b) return 0;
  const n = b.purchaseRate ?? b.purchasePrice;
  return Number.isFinite(Number(n)) ? Number(n) : 0;
}

/** Canonical: unitPrice ?? saleRate ?? sellingPrice. */
export function batchUnitPrice(
  b: Partial<IBatch> & { sellingPrice?: number } | null | undefined,
  fallback = 0,
): number {
  if (!b) return fallback;
  const n = b.unitPrice ?? b.saleRate ?? (b as any).sellingPrice ?? fallback;
  return Number.isFinite(Number(n)) ? Number(n) : fallback;
}

/** @deprecated Prefer batchUnitPrice */
export function batchSaleRate(
  b: Partial<IBatch> & { sellingPrice?: number } | null | undefined,
  fallback = 0,
): number {
  return batchUnitPrice(b, fallback);
}

/** Derive display unit price from latest active batch (or legacy Item.unitPrice). */
export function itemDisplayUnitPrice(item: Partial<IPharmacyItem> | null | undefined): number {
  if (!item) return 0;
  const batches = (item.batches || []).filter(
    (b) => String(b.status || "active").toLowerCase() !== "inactive",
  );
  if (batches.length) {
    const latest = [...batches].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    )[0];
    return batchUnitPrice(latest, Number(item.unitPrice) || 0);
  }
  return Number(item.unitPrice) || 0;
}

export function isBatchSellable(
  b: Partial<IBatch> & { expired?: boolean } | null | undefined,
): boolean {
  if (!b) return false;
  const status = String(b.status || "active").toLowerCase();
  if (status === "inactive") return false;
  if (b.expired) return false;
  return (Number(b.quantity) || 0) > 0;
}
