export interface Supplier {
    _id: string;
    name: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    gstin: string;
    msmeNumber?: string;
    dlNumber?: string;
    description?: string;
    totalPurchaseCount: number;
    totalPurchaseValue: number;
    lastPurchaseDate?: Date | string;
    createdAt: Date | string;
}

export interface SupplierOrderItem {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface SupplierOrder {
    _id: string;
    orderId: string; // e.g., PO-1234
    date: Date | string;
    itemCount: number;
    totalValue: number;
    status: "Pending" | "Completed" | "Cancelled";
    items: SupplierOrderItem[];
}
