export interface BatchType {
  _id?: string;
  batchNumber: string;
  packing?: number;
  stripCount?: number;
  mrp?: number;
  unitPrice?: number;
  /** Legacy import alias for unitPrice */
  saleRate?: number;
  purchasePrice?: number;
  /** Import-era field — prefer when purchasePrice is missing */
  purchaseRate?: number;
  gst?: number;
  quantity: number;
  startingQuantity?: number;
  isActive?: boolean;
  status?: string;
  supplier: string;
  expiryDate: Date | string;
  createdAt?: Date;
}

/** Dual-read helpers for AR Rahma / mixed batch documents */
export function batchPurchasePrice(batch: BatchType | any): number {
  const n = Number(batch?.purchasePrice ?? batch?.purchaseRate ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function batchUnitPrice(batch: BatchType | any): number {
  const n = Number(batch?.unitPrice ?? batch?.saleRate ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function batchKey(batch: BatchType | any): string | undefined {
  return batch?._id || batch?.batchNumber || undefined;
}

export interface ItemType {
  _id: string;
  name: string;
  pharmacy: string;
  generic: string;
  hsnCode: string;
  sku?: string;
  category: string;
  supplier?: string;
  manufacturer: string;
  unitPrice?: number;
  mrp?: number;
  purchasePrice?: number;
  openingStockQuantity: number;
  quantity: number;
  expiryDate?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  batches: BatchType[];
  batchNumber?: string;
  rackLocation?: string;
  packing?: number;
  noOfPacking?: number;
  gst?: number;
  soldQuantity?: number;
  soldInLast30Days?: number;
  soldHistory?: Array<{
    date: Date;
    quantity: number;
    unitPrice: number;
    total: number;
    customerName?: string;
    customerPhone?: string;
    doctorName?: string;
    doctor?: string;
    pharmacistName?: string;
    pharmacist?: string;
    patientMrn?: string;
    mrn?: string;
    pid?: string;
    customer?: { name?: string; phone?: string; mrn?: string; pid?: string };
    patient?: { name?: string; phoneNumber?: string; mrn?: string };
  }>;
}

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
  slowMovingItemsView?: boolean;
  topMovingItemsView?: boolean;
  sortBy?: "createdAt" | "quantity" | "soldQuantity";
  orderBy?: "desc" | "asc";
}
