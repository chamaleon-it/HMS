export interface BulkUpdateItem {
    _id: string;
    product: string;
    batch: string;
    qty: number;
    pack: string; // Changed from number to string based on usage in BulkUpdateTable
    unitPrice: number;
    expiryDate: string;
    purchasePrice: number;
    sgst_p: number;
    cgst_p: number;
    dis_p: number;
    dis: number;
    schema_free: number;
    schema_amt: number;
    amount: number;
}

export interface NewItem extends BulkUpdateItem {
    id: string;
}
