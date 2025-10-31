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
}

export interface FilterType {
  q?: string | undefined;
  category?: string | undefined;
  stock?: string | undefined;
  expiry?: number | undefined;
  page: number;
  limit: number;
}
