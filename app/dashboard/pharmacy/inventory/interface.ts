export interface BatchType {
  _id: string;
  batchNumber: string;
  expiryDate: Date;
  quantity: number;
  purchasePrice: number;
  supplier: string;
  createdAt: Date;
}

export interface ItemType {
  _id: string;
  name: string;
  pharmacy: string;
  generic: string;
  hsnCode: string;
  sku: string;
  category: string;
  supplier: string;
  manufacturer: string;
  unitPrice: number;
  purchasePrice: number;
  openingStockQuantity: number;
  quantity: number;
  expiryDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  batches: BatchType[];
}

export interface FilterType {
  q?: string | undefined;
  category?: string | undefined;
  stock?: string | undefined;
  expiry?: number | undefined;
  page: number;
  limit: number;
  lowStockThreshold?: number;
}
