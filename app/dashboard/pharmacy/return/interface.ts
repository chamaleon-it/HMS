export interface OrderType {
    _id: string;
    mrn: string;
    patient: Patient;
    doctor: Doctor;
    items: Item[];
    priority: string;
    status: string;
    assignedTo: null;
    createdAt: Date;
    updatedAt: Date;
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
    return?: number;
    reason: string;
    unitPrice?: number;

}

export interface Batch {
    batchNumber: string;
    expiryDate: Date;
    quantity: number;
}

/** Item master + optional batch-enriched fields (no sku / openingStock on Item). */
export interface Name {
    _id: string;
    name: string;
    pharmacy: string;
    generic: string;
    hsnCode: string;
    category: string;
    manufacturer: string;
    status: string;
    quantity?: number;
    unitPrice?: number;
    purchasePrice?: number;
    expiryDate?: Date;
    supplier?: string;
    createdAt?: Date;
    updatedAt?: Date;
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
