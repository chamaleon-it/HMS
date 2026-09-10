export interface Supplier {
    _id: string;
    name: string;
    phone: string;
    contactPerson: string;
    designation?: string;
    email: string;
    address: {
        line1: string;
        line2?: string;
        city?: string;
        state?: string;
    };
    gstin?: string;
    msme?: string;
    pan?: string;
    dlNo?: string;
    dlExpiryDate?: Date | string;
    balance: number;
    paymentTerms: number;
    description?: string;
    status: "Active" | "Inactive";
    totalPurchaseCount?: number; // UI specific / Calculated
    totalPurchaseValue?: number; // UI specific / Calculated
    totalDue?: number; // UI specific / Calculated
    createdAt: Date | string;
}

export interface SupplierOrderItem {
    _id: string;
    item: {
        _id: string;
        name: string;
        generic?: string;
        hsnCode?: string;
        sku?: string;
        unitPrice: number;
    };
    batch: string;
    expiryDate: string;
    quantity: number;
    pack: number;
    free: number;
    unitPrice: number;
    purchasePrice: number;
    gst: number;
    discount: number;
}

export interface SupplierOrder {
    _id: string;
    invoiceNumber: string;
    invoiceDate: string | Date;
    paymentStatus: string;
    gstEnabled: boolean;
    tscEnabled: boolean;
    subTotal: number;
    total: number;
    paidAmount: number;
    discount: number;
    gst: number;
    transportCharge: number;
    description?: string;
    items: SupplierOrderItem[];
    status?: string; // For compatibility if needed
    updatedAt: string | Date;
    createdAt: string | Date;
}
