export interface PurchaseDataType {
    message: string;
    data:    PurchaseType[];
    total:   number;
    page:    number;
    limit:   number;
}

export interface PurchaseType {
    _id:              string;
    wholesaler:       Pharmacy;
    pharmacy:         Pharmacy;
    contactPerson:    string;
    phoneNumber:      string;
    deliveryAddress:  string;
    expectedDelivery: Date;
    paymentTerms:     string;
    items:            Item[];
    shipping:         number;
    instructions:     string;
    partialDelivery:  boolean;
    urgent:           boolean;
    createdAt:        Date;
    updatedAt:        Date;
}

export interface Item {
    name:      string;
    unitPrice: number;
    quantity:  number;
    notes:     null;
    _id:       string;
}

export interface Pharmacy {
    _id:         string;
    name:        string;
    email:       string;
    phoneNumber: null;
    address:     null;
}
