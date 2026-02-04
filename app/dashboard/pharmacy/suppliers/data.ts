import { Supplier, SupplierOrder } from "./interface";

export const DUMMY_SUPPLIERS: Supplier[] = [
    {
        _id: "sup_001",
        name: "Apollo Pharmacy Supplies",
        phoneNumber: "+91 9876543210",
        addressLine1: "123, Health Street, Phase 1",
        addressLine2: "Industrial Area, Bangalore",
        gstin: "29ABCDE1234F1Z5",
        msmeNumber: "UDYAM-KR-03-0012345",
        dlNumber: "KA/B2/12345",
        description: "Main supplier for general medicines",
        totalPurchaseCount: 15,
        totalPurchaseValue: 450000,
        lastPurchaseDate: "2024-01-25T10:00:00Z",
        createdAt: "2023-01-10T09:00:00Z",
    },
    {
        _id: "sup_002",
        name: "MediCare Distributors",
        phoneNumber: "+91 8765432109",
        addressLine1: "45, Pharma Hub",
        addressLine2: "Mumbai, Maharashtra",
        gstin: "27XYZZZ9876G2Z9",
        msmeNumber: "UDYAM-MH-01-0098765",
        dlNumber: "MH/MZ/67890",
        description: "Specialized in surgical equipment",
        totalPurchaseCount: 8,
        totalPurchaseValue: 200000,
        lastPurchaseDate: "2024-01-20T14:30:00Z",
        createdAt: "2023-03-15T11:00:00Z",
    },
    {
        _id: "sup_003",
        name: "Sun Pharma Agencies",
        phoneNumber: "+91 9988776655",
        addressLine1: "78, Ring Road",
        addressLine2: "Chennai, Tamil Nadu",
        gstin: "33PQRST4567H3Z1",
        dlNumber: "TN/CH/11223",
        totalPurchaseCount: 22,
        totalPurchaseValue: 850000,
        lastPurchaseDate: "2024-02-01T09:15:00Z",
        createdAt: "2022-11-05T10:00:00Z",
    },
];

export const DUMMY_SUPPLIER_ORDERS: Record<string, SupplierOrder[]> = {
    sup_001: [
        {
            _id: "ord_101",
            orderId: "PO-2024-001",
            date: "2024-01-25T10:00:00Z",
            itemCount: 120,
            totalValue: 50000,
            status: "Completed",
            items: [
                { name: "Paracetamol 500mg", quantity: 1000, unitPrice: 20, totalPrice: 20000 },
                { name: "Amoxicillin 250mg", quantity: 500, unitPrice: 40, totalPrice: 20000 },
                { name: "Cetirizine 10mg", quantity: 1000, unitPrice: 10, totalPrice: 10000 },
            ],
        },
        {
            _id: "ord_102",
            orderId: "PO-2023-145",
            date: "2023-12-15T11:20:00Z",
            itemCount: 80,
            totalValue: 35000,
            status: "Completed",
            items: [
                { name: "Ibuprofen 400mg", quantity: 500, unitPrice: 30, totalPrice: 15000 },
                { name: "Aspirin 75mg", quantity: 2000, unitPrice: 10, totalPrice: 20000 },
            ],
        },
        {
            _id: "ord_103",
            orderId: "PO-2023-110",
            date: "2023-11-05T14:00:00Z",
            itemCount: 200,
            totalValue: 100000,
            status: "Completed",
            items: [
                { name: "Metformin 500mg", quantity: 1000, unitPrice: 50, totalPrice: 50000 },
                { name: "Atorvastatin 10mg", quantity: 500, unitPrice: 100, totalPrice: 50000 },
            ],
        },
    ],
    sup_002: [
        {
            _id: "ord_201",
            orderId: "PO-2024-002",
            date: "2024-01-20T14:30:00Z",
            itemCount: 50,
            totalValue: 25000,
            status: "Pending",
            items: [
                { name: "Surgical Gloves (Box)", quantity: 50, unitPrice: 500, totalPrice: 25000 },
            ],
        },
    ],
    sup_003: [
        {
            _id: "ord_301",
            orderId: "PO-2024-005",
            date: "2024-02-01T09:15:00Z",
            itemCount: 150,
            totalValue: 150000,
            status: "Completed",
            items: [
                { name: "Insulin Injection", quantity: 100, unitPrice: 1000, totalPrice: 100000 },
                { name: "Syringes (Pack)", quantity: 500, unitPrice: 100, totalPrice: 50000 },
            ],
        },
        {
            _id: "ord_302",
            orderId: "PO-2024-003",
            date: "2024-01-10T16:00:00Z",
            itemCount: 300,
            totalValue: 300000,
            status: "Completed",
            items: [
                { name: "Vitamin C Supplements", quantity: 1000, unitPrice: 300, totalPrice: 300000 },
            ],
        },
    ],
};
