export interface ReturnType {
    data: Datum[];
    message: string;
}

export interface Datum {
    mrn?: string;
    _id: string;
    patient: string;
    order: null;
    items: Item[];
    __v?: number;
    createdAt?: Date;
    updatedAt?: Date;
    discount?: number
    paidAmount?: number
    type?: string
    billNo?: string
}

export interface Item {
    name: Name;
    quantity: number;
    reason: string;
    unitPrice: number;
    _id: string;
}

export interface Name {
    _id: string;
    quantity: number;
    name: string;
    pharmacy: string;
    generic: string;
    hsnCode: number | string;
    category: string;
    manufacturer: string;
    unitPrice: number;
    status: string;
    supplier?: string;
}
