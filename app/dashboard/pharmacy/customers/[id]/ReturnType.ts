export interface ReturnType {
    data: Datum[];
    message: string;
}

export interface Datum {
    mrn?: string;
    _id: string;
    patient: string;
    order: null;
    refundMode: string;
    returnedBy: string;
    remarks: string;
    items: Item[];
    __v?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Item {
    name: Name;
    quantity: number;
    reason: string;
    _id: string;
}

export interface Name {
    _id: string;
    quantity: number;
    openingStockQuantity: number;
    name: string;
    pharmacy: string;
    generic: string;
    hsnCode: number;
    sku: string;
    category: string;
    supplier: string;
    manufacturer: string;
    unitPrice: number;
    status: string;
}
