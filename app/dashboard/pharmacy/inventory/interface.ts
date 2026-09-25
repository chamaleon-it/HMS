export type BatchStatus = "active" | "inactive";

/** Batch-level pricing & stock (canonical pharmacy inventory unit). */
export interface IBatch {
  _id?: string;
  batchNumber: string;
  expiryDate: Date | string;
  mrp: number;
  purchaseRate: number;
  unitPrice: number;
  startingQuantity: number;
  quantity: number;
  status: BatchStatus;
  supplier?: string;
  packing?: number;
  stripCount?: number;
  gst?: number;
  createdAt: Date | string;
}

/**
 * Pharmacy item master — pricing/supplier/packing/stock live on batches.
 * quantity / expiryDate / unitPrice / mrp / purchasePrice / supplier may be
 * API-enriched computed fields from active batches (not stored on Item).
 */
export interface IPharmacyItem {
  _id: string;
  name: string;
  pharmacy: string;
  generic: string;
  hsnCode: string;
  category: string;
  manufacturer: string;
  /** Computed: sum of active batch quantities. */
  quantity?: number;
  /** Computed: earliest active batch expiry. */
  expiryDate?: Date | string;
  /** Computed: latest active batch unitPrice. */
  unitPrice?: number;
  /** Computed: latest active batch mrp. */
  mrp?: number;
  /** Computed: latest active batch purchaseRate. */
  purchasePrice?: number;
  /** Computed: latest active batch supplier. */
  supplier?: string;
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
  packing?: number;
  gst?: number;
}

export type BatchType = IBatch;
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

export function batchPurchaseRate(b: Partial<IBatch> | null | undefined): number {
  if (!b) return 0;
  const n = b.purchaseRate;
  return Number.isFinite(Number(n)) ? Number(n) : 0;
}

export function batchUnitPrice(
  b: Partial<IBatch> | null | undefined,
  fallback = 0,
): number {
  if (!b) return fallback;
  const n = b.unitPrice ?? fallback;
  return Number.isFinite(Number(n)) ? Number(n) : fallback;
}

export function itemDisplayUnitPrice(item: Partial<IPharmacyItem> | null | undefined): number {
  if (!item) return 0;
  if (item.unitPrice != null && Number.isFinite(Number(item.unitPrice))) {
    return Number(item.unitPrice);
  }
  const batches = (item.batches || []).filter(
    (b) => String(b.status || "active").toLowerCase() !== "inactive",
  );
  if (batches.length) {
    const latest = [...batches].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    )[0];
    return batchUnitPrice(latest, 0);
  }
  return 0;
}

export function itemActiveQuantity(item: Partial<IPharmacyItem> | null | undefined): number {
  if (!item) return 0;
  if (item.quantity != null && Number.isFinite(Number(item.quantity))) {
    return Number(item.quantity);
  }
  return (item.batches || [])
    .filter((b) => String(b.status || "active").toLowerCase() !== "inactive")
    .reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
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
