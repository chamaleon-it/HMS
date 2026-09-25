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
    doctorName?: string
    isDeleted: boolean;
}


export interface Doctor {
    _id: string;
    name: string;
    phoneNumber: string;
    specialization: string;
    qualification?: string;
    designation?: string;
}

export interface Item {
    name: Name;
    dosage: string;
    frequency: string;
    food: string;
    duration: string;
    quantity: number;
    isPacked: boolean;
    batchId?: string | null;
    batchNumber?: string | null;
    batchExpiryDate?: string | Date | null;
    batchMrp?: number | null;
    batchPurchasePrice?: number | null;
    batchSellingPrice?: number | null;
    batchGst?: number | null;
    batchStock?: number | null;
    batchSupplier?: string | null;
    batchPacking?: number | null;
}

export interface Name {
    _id: string;
    quantity: number;
    name: string;
    pharmacy: string;
    generic: string;
    hsnCode: string;
    category: string;
    manufacturer: string;
    unitPrice: number;
    purchasePrice?: number;
    expiryDate?: Date;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
    rackLocation?: string;
    supplier?: string;
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








export interface DataType {
    patient: string;
    doctor: string | null;
    doctorName?: string;
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
        batchId?: string | null;
        batchNumber?: string | null;
        batchExpiryDate?: string | Date | null;
        batchMrp?: number | null;
        batchPurchasePrice?: number | null;
        batchSellingPrice?: number | null;
        batchGst?: number | null;
        batchStock?: number | null;
        batchSupplier?: string | null;
        batchPacking?: number | null;
    }[];
    discount: number;
    priority: string;
    status: string;
    pharmacist?: string;
    allergies?: string;
}
