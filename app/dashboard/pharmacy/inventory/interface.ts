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
  saleRate: number;
  startingQuantity: number;
  quantity: number;
  status: BatchStatus;
  supplier?: string;
  createdAt: Date | string;
}

/** Pharmacy item master — stock/pricing prefer active batches. */
export interface IPharmacyItem {
  _id: string;
  name: string;
  pharmacy: string;
  generic: string;
  hsnCode: string;
  sku?: string;
  category: string;
  supplier: string;
  manufacturer: string;
  /** Denormalized — prefer batch.saleRate at order time. */
  unitPrice: number;
  /** Denormalized — prefer batch.mrp. */
  mrp: number;
  /** Denormalized — prefer batch.purchaseRate. */
  purchasePrice: number;
  openingStockQuantity: number;
  /** Aggregate of active batch quantities. */
  quantity: number;
  expiryDate: Date | string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  batches: IBatch[];
  batchNumber?: string;
  rackLocation?: string;
  packing?: number;
  noOfPacking?: number;
  gst?: number;
  soldQuantity?: number;
  soldHistory?: Array<{
    date: Date | string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
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

export function batchSaleRate(
  b: Partial<IBatch> & { sellingPrice?: number } | null | undefined,
  fallback = 0,
): number {
  if (!b) return fallback;
  const n = b.saleRate ?? (b as any).sellingPrice ?? fallback;
  return Number.isFinite(Number(n)) ? Number(n) : fallback;
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
