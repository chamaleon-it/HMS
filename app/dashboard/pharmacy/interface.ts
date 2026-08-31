export interface OrderType {
    _id: string;
    mrn: string;
    patient: Patient;
    doctor: Doctor;
    items: Item[];
    priority: string;
    status: string;
    discount: number;
    paidAmount: number;
    paymentStatus: "Paid" | "Pending" | "Partial";
    assignedTo: null;
    createdAt?: Date;
    updatedAt?: Date;
    billNo?: string;
    pharmacist?: string
    isDeleted: boolean;
}


export interface Doctor {
    _id: string;
    name: string;
    phoneNumber: string;
    specialization: string;
}

export interface Item {
    name: Name;
    dosage: string;
    frequency: string;
    food: string;
    duration: string;
    quantity: number;
    batchNumber?: string;
    batchId?: string;
    unitPrice?: number;
    return?: number;
    reason?: string;
    isPacked: boolean
}

export interface Name {
    _id: string;
    quantity: number;
    openingStockQuantity: number;
    name: string;
    pharmacy: string;
    generic: string;
    hsnCode: string;
    sku: string;
    category: string;
    supplier: string;
    manufacturer: string;
    unitPrice: number;
    mrp?: number;
    purchasePrice: number;
    expiryDate: Date;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
    rackLocation?: string;
    activeBatch?: string;
    batches?: Batch[];
}

export interface Patient {
    _id: string;
    name: string;
    phoneNumber: string;
    email: string;
    gender: string;
    dateOfBirth: Date;
    conditions: string[];
    blood: string;
    allergies: string;
    address: string;
    notes: string;
    createdBy: string;
    status: string;
    mrn: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Batch {
    _id: string;
    batchNumber: string;
    quantity: number;
    pack?: number;
    noOfPack?: number;
    mrp?: number;
    unitPrice?: number;
    expiryDate: string | Date;
    purchasePrice?: number;
    supplier?: string;
}

export interface DataType {
    patient: string;
    doctor: string;
    items: {
        rowId: string;
        name: string;
        medicineName: string;
        dosage: string;
        frequency: string;
        food: string;
        duration: string;
        quantity: number;
        availableQuantity: number;
        unitPrice: number;
        rackLocation?: string;
        batchNumber?: string;
        selectedBatchId?: string;
        packing?: number;
        batches?: Batch[];
    }[];
    discount: number;
    priority: string;
    status: string;
    pharmacist?: string;
    allergies?: string;
}

export function getOrderItemBatch(orderItem: any): Batch | null {
    const item = orderItem?.name;
    if (!item || typeof item !== "object") return null;
    const batches = item.batches || [];
    if (!batches.length) return null;

    if (orderItem.batchId) {
        const found = batches.find(
            (b: any) => String(b._id) === String(orderItem.batchId)
        );
        if (found) return found;
    }

    if (orderItem.batchNumber && orderItem.batchNumber !== "-") {
        const found = batches.find(
            (b: any) => b.batchNumber === orderItem.batchNumber
        );
        if (found) return found;
    }

    if (item.activeBatch) {
        const found = batches.find(
            (b: any) => String(b._id) === String(item.activeBatch)
        );
        if (found) return found;
    }

    return (
        batches.find((b: any) => (Number(b.quantity) || 0) > 0) || batches[0] || null
    );
}

export function getOrderItemUnitPrice(orderItem: any): number {
    if (orderItem?.unitPrice && typeof orderItem.unitPrice === "number" && orderItem.unitPrice > 0) {
        return orderItem.unitPrice;
    }
    const item = orderItem?.name;
    if (!item) return 0;
    if (typeof item === "number") return item;

    const batch = getOrderItemBatch(orderItem);
    if (batch) {
        return batch.unitPrice || batch.mrp || item.unitPrice || 0;
    }
    return item.unitPrice || item.mrp || 0;
}

