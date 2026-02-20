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
    purchasePrice: number;
    expiryDate: Date;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
    rackLocation?: string;
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
    doctor: string;
    items: {
        name: string;
        dosage: string;
        frequency: string;
        food: string;
        duration: string;
        quantity: number;
        availableQuantity: number
        unitPrice: number;
    }[];
    discount: number;
    priority: string;
    status: string;
    pharmacists?: string;
    allergies?: string;
}
