"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AlertCircle, AlertTriangle, Save, Trash2, UserCircle, Phone, FileText, MapPin, ReceiptText } from "lucide-react";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DUMMY_SUPPLIERS } from "../data";
import { useSearchParams } from "next/navigation";
import { Supplier } from "../interface";

interface BulkUpdateItem {
    _id: string;
    name: string;
    generic: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    purchasePrice: number;
    expiryDate: string;
    supplier: string;
    rackLocation?: string;
}

interface NewItem {
    id: string;
    drug: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

interface Props {
    items: BulkUpdateItem[];
    lowStockThreshold: number;
    onSave?: (updates: Record<string, Partial<BulkUpdateItem>>) => Promise<void>;
}

export default function BulkUpdateTable({ items, lowStockThreshold, onSave }: Props) {
    const searchParams = useSearchParams();
    const defaultSupplierId = searchParams.get("supplierId");

    const [updates, setUpdates] = useState<Record<string, Partial<BulkUpdateItem>>>({});
    const [newItems, setNewItems] = useState<NewItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>(defaultSupplierId || "");

    useEffect(() => {
        if (defaultSupplierId) {
            setSelectedSupplierId(defaultSupplierId);
        }
    }, [defaultSupplierId]);

    const selectedSupplier = DUMMY_SUPPLIERS.find(s => s._id === selectedSupplierId);

    const [billDetails, setBillDetails] = useState({
        invoiceNo: "",
        billDate: new Date().toISOString().split("T")[0],
        paymentMode: "Cash",
        remarks: ""
    });

    const handleBillDetailChange = (field: keyof typeof billDetails, value: string) => {
        setBillDetails(prev => ({ ...prev, [field]: value }));
    };

    // New item functions
    const addNewRow = () => {
        const newItem: NewItem = {
            id: Date.now().toString(),
            drug: "",
            quantity: 0,
            unitPrice: 0,
            totalPrice: 0,
        };
        setNewItems([...newItems, newItem]);
    };

    const removeNewRow = (id: string) => {
        setNewItems(newItems.filter((item) => item.id !== id));
    };

    const updateNewItem = (id: string, field: keyof NewItem, value: string | number) => {
        setNewItems(
            newItems.map((item) => {
                if (item.id === id) {
                    const updated = { ...item, [field]: value };
                    // Auto-calculate total price
                    if (field === "quantity" || field === "unitPrice") {
                        updated.totalPrice = Number(updated.quantity) * Number(updated.unitPrice);
                    }
                    return updated;
                }
                return item;
            })
        );
    };

    // Existing item functions
    const handleFieldChange = (itemId: string, field: keyof BulkUpdateItem, value: string | number) => {
        setUpdates((prev) => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value,
            },
        }));
    };

    const getFieldValue = (item: BulkUpdateItem, field: keyof BulkUpdateItem) => {
        return updates[item._id]?.[field] ?? item[field];
    };

    const handleSaveChanges = async () => {
        const hasUpdates = Object.keys(updates).length > 0;
        const hasNewItems = newItems.length > 0;

        if (!hasUpdates && !hasNewItems) {
            toast.error("No changes to save");
            return;
        }

        setIsSaving(true);
        try {
            if (onSave) {
                await onSave(updates);
            } else {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 1000));
                console.log("Bulk updates:", updates);
                console.log("New items:", newItems);
            }
            toast.success(
                `Successfully ${hasUpdates ? `updated ${Object.keys(updates).length} items` : ""}${hasUpdates && hasNewItems ? " and " : ""}${hasNewItems ? `added ${newItems.length} new items` : ""}`
            );
            setUpdates({});
            setNewItems([]);
        } catch (error) {
            toast.error("Failed to save changes");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = Object.keys(updates).length > 0 || newItems.length > 0;

    const calculateTotal = () => {
        const newItemsTotal = newItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
        return newItemsTotal;
    };

    const totalAmount = calculateTotal();

    return (
        <div className="space-y-6">


            {/* Bill Details Section */}
            <div className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <ReceiptText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-lg">Bill Details</h3>
                </div>

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="text-xs font-medium text-slate-500 ml-1 mb-1.5 block">Select Supplier</label>
                        <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                            <SelectTrigger className="w-full h-10 bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                {DUMMY_SUPPLIERS.map((s: Supplier) => (
                                    <SelectItem key={s._id} value={s._id}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedSupplier && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 shadow-inner">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-1.5 bg-sky-100 rounded-md">
                                    <Phone className="w-3.5 h-3.5 text-sky-600" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Phone</p>
                                    <p className="font-semibold text-slate-900 text-sm tracking-tight">{selectedSupplier.phoneNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-1.5 bg-emerald-100 rounded-md">
                                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">GSTIN</p>
                                    <p className="font-semibold text-slate-900 text-sm tracking-tight">{selectedSupplier.gstin}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 sm:col-span-2">
                                <div className="mt-1 p-1.5 bg-indigo-100 rounded-md">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Address</p>
                                    <p className="font-medium text-slate-700 text-sm leading-snug">
                                        {selectedSupplier.addressLine1}
                                        {selectedSupplier.addressLine2 && <span className="text-slate-500">, {selectedSupplier.addressLine2}</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    <div>
                        <label className="text-xs font-medium text-slate-500 ml-1 mb-1.5 block">Select Supplier</label>
                        <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                            <SelectTrigger className="w-full h-10 bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                {DUMMY_SUPPLIERS.map((s: Supplier) => (
                                    <SelectItem key={s._id} value={s._id}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 ml-1">Invoice No.</label>
                        <Input
                            value={billDetails.invoiceNo}
                            onChange={(e) => handleBillDetailChange("invoiceNo", e.target.value)}
                            className="h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                            placeholder="Enter invoice number"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 ml-1">Bill Date</label>
                        <Input
                            type="date"
                            value={billDetails.billDate}
                            onChange={(e) => handleBillDetailChange("billDate", e.target.value)}
                            className="h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 ml-1">Payment Mode</label>
                        <Select
                            value={billDetails.paymentMode}
                            onValueChange={(v) => handleBillDetailChange("paymentMode", v)}
                        >
                            <SelectTrigger className="h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all">
                                <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Credit">Credit</SelectItem>
                                <SelectItem value="Online">Online</SelectItem>
                                <SelectItem value="UPI">UPI</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 ml-1">Remarks</label>
                        <Input
                            value={billDetails.remarks}
                            onChange={(e) => handleBillDetailChange("remarks", e.target.value)}
                            className="h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                            placeholder="Optional notes"
                        />
                    </div>
                </div>
            </div>



            {/* Items & Actions Section */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
                {/* Action Bar */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
                    <div className="text-sm text-slate-600">
                        {hasChanges ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                {newItems.length > 0 && `${newItems.length} new item(s)`}
                                {Object.keys(updates).length > 0 && newItems.length > 0 && ", "}
                                {Object.keys(updates).length > 0 && `${Object.keys(updates).length} item(s) modified`}
                            </span>
                        ) : (
                            <span className="text-slate-500">Make changes to the table below</span>
                        )}
                    </div>
                    <Button
                        onClick={handleSaveChanges}
                        disabled={!hasChanges || isSaving}
                        className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-200 transition-all hover:shadow-lg active:scale-95 gap-2 px-6"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>

                {/* Single Unified Table */}
                <div className="overflow-x-auto w-full">
                    <Table className="whitespace-nowrap">
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-b border-slate-200 hover:bg-transparent">
                                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider py-4 pl-6">
                                    SNo
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider py-4">
                                    Mfac
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider py-4">
                                    Particulars
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider py-4">
                                    Packing
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider py-4">
                                    HSN
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider py-4">
                                    BatchNo
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider py-4">
                                    Exp
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider py-4">
                                    Qty
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider py-4">
                                    Sch Qty
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider py-4">
                                    MRP
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider py-4">
                                    Rate
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider py-4">
                                    Sch Disc %
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider py-4">
                                    Disc %
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider py-4">
                                    GST %
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider py-4 pr-6">
                                    Taxable Value
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {/* New Items Rows */}
                            {newItems.map((item, index) => (
                                <TableRow key={item.id} className="bg-blue-50 hover:bg-blue-100/60">
                                    <TableCell className="py-3 pl-4">
                                        <span className="text-sm">{index + 1}</span>
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Input type="text" placeholder="Mfac" className="h-9 w-24" />
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Input
                                            type="text"
                                            placeholder="Particulars"
                                            value={item.drug}
                                            onChange={(e) => updateNewItem(item.id, "drug", e.target.value)}
                                            className="h-9"
                                        />
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Input type="text" placeholder="Packing" className="h-9 w-24" />
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Input type="text" placeholder="HSN" className="h-9 w-24" />
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Input type="text" placeholder="Batch" className="h-9 w-24" />
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Input type="date" className="h-9 w-32" />
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Input
                                            type="number"
                                            placeholder="Qty"
                                            value={item.quantity || ""}
                                            onChange={(e) => updateNewItem(item.id, "quantity", Number(e.target.value))}
                                            className="h-9 w-20"
                                            min="0"
                                        />
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Input type="number" placeholder="Sch Qty" className="h-9 w-20" min="0" />
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Input type="number" placeholder="MRP" className="h-9 w-24" step="0.01" />
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Input
                                            type="number"
                                            placeholder="Rate"
                                            value={item.unitPrice || ""}
                                            onChange={(e) => updateNewItem(item.id, "unitPrice", Number(e.target.value))}
                                            className="h-9 w-24"
                                            step="0.01"
                                            min="0"
                                        />
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Input type="number" placeholder="Sch Disc %" className="h-9 w-20" step="0.01" />
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Input type="number" placeholder="Disc  %" className="h-9 w-20" step="0.01" />
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Input type="number" placeholder="GST %" className="h-9 w-20" step="0.01" />
                                    </TableCell>
                                    <TableCell className="py-3 pr-4">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Taxable Value"
                                                value={item.totalPrice.toFixed(2)}
                                                readOnly
                                                className="h-9 w-24 bg-slate-100"
                                            />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => removeNewRow(item.id)}
                                                className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Add Medicine Button Row */}
                            <TableRow className="bg-white hover:bg-white">
                                <TableCell colSpan={14} className="py-3 pl-4">
                                    <Button onClick={addNewRow} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                                        + Add Medicine
                                    </Button>
                                </TableCell>
                            </TableRow>

                            {/* Separator Row */}
                            {items.length > 0 && (
                                <TableRow className="bg-slate-50">
                                    <TableCell colSpan={14} className="py-2 text-sm text-slate-600 font-medium">
                                        Edit fields below to update inventory
                                    </TableCell>
                                </TableRow>
                            )}



                            {/* Existing Items Rows */}
                            {items.map((item, i) => {
                                const currentQuantity = Number(getFieldValue(item, "quantity"));
                                const isModified = !!updates[item._id];

                                return (
                                    <TableRow
                                        key={item._id}
                                        className={`${i % 2 === 0 ? "bg-white hover:bg-white/60" : "bg-slate-100 hover:bg-slate-100/60"
                                            } ${isModified ? "ring-2 ring-purple-300" : ""}`}
                                    >
                                        <TableCell className="py-3 pl-4 text-slate-500">{i + 1}</TableCell>

                                        <TableCell className="font-medium text-gray-900">
                                            {item.name}
                                            <div className="text-xs text-gray-500">(Gen: {item.generic})</div>
                                        </TableCell>

                                        <TableCell className="py-3 text-slate-700">{item.sku}</TableCell>

                                        <TableCell className="py-3">
                                            <Input
                                                type="text"
                                                value={getFieldValue(item, "rackLocation") as string}
                                                onChange={(e) => handleFieldChange(item._id, "rackLocation", e.target.value)}
                                                className="h-8 w-24 text-sm"
                                                placeholder="Rack"
                                            />
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={getFieldValue(item, "quantity")}
                                                    onChange={(e) => handleFieldChange(item._id, "quantity", Number(e.target.value))}
                                                    className="h-8 w-20 text-sm"
                                                    min="0"
                                                />
                                                {currentQuantity === 0 ? (
                                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                                ) : currentQuantity < lowStockThreshold ? (
                                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                                ) : null}
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={getFieldValue(item, "purchasePrice")}
                                                onChange={(e) => handleFieldChange(item._id, "purchasePrice", Number(e.target.value))}
                                                className="h-8 w-24 text-sm"
                                                min="0"
                                            />
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={getFieldValue(item, "unitPrice")}
                                                onChange={(e) => handleFieldChange(item._id, "unitPrice", Number(e.target.value))}
                                                className="h-8 w-24 text-sm"
                                                min="0"
                                            />
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <Input
                                                type="date"
                                                value={
                                                    getFieldValue(item, "expiryDate")
                                                        ? new Date(getFieldValue(item, "expiryDate") as string).toISOString().split("T")[0]
                                                        : ""
                                                }
                                                onChange={(e) => handleFieldChange(item._id, "expiryDate", e.target.value)}
                                                className="h-8 w-36 text-sm"
                                            />
                                        </TableCell>

                                        <TableCell className="py-3 pr-4">
                                            <Input
                                                type="text"
                                                value={getFieldValue(item, "supplier") as string}
                                                onChange={(e) => handleFieldChange(item._id, "supplier", e.target.value)}
                                                className="h-8 w-32 text-sm"
                                                placeholder="Supplier"
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {items.length === 0 && newItems.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={14} className="text-center py-10 text-muted-foreground">
                                        No items found. Click "+ Add Medicine" to add new items.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Invoice Footer Section - Totals */}
                <div className="bg-slate-50 border-t border-slate-200 p-8">
                    <div className="flex justify-end">
                        {/* Totals */}
                        <div className="w-1/3 min-w-[320px] bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-semibold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-2">Payment Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>S.ch Total:</span>
                                    <span className="font-medium">9305.83</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Cash Disc (Item):</span>
                                    <span>176.20</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Scheme Disc (Item):</span>
                                    <span>0.00</span>
                                </div>
                                <div className="flex justify-between font-medium text-slate-700 border-t border-dashed border-slate-200 pt-2">
                                    <span>Taxable Amount:</span>
                                    <span>9129.63</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Tax Amount:</span>
                                    <span>456.48</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Bill Disc:</span>
                                    <span>0.00</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>TDS / TCS Amount:</span>
                                    <span>0.00</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Write Off:</span>
                                    <span>-0.11</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-slate-800 border-t-2 border-slate-100 pt-3 mt-1">
                                    <span>Net Amount:</span>
                                    <span>9586.00</span>
                                </div>
                                <div className="flex justify-between font-bold text-emerald-600 bg-emerald-50 p-2 rounded-md mt-1">
                                    <span>Net Payable:</span>
                                    <span>9586.00</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="mt-8 pt-6 border-t border-slate-200/60">
                        <p className="text-xs text-slate-500 text-center font-medium">
                            Amount In Words: <span className="text-slate-700">Nine Thousand Five Hundred and Eighty Six Rupees Only</span>
                        </p>
                        <p className="text-[10px] text-slate-400 text-center mt-2 uppercase tracking-wide">
                            E & O.E
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
