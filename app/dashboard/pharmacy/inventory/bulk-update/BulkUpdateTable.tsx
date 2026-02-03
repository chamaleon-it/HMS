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
import { AlertCircle, AlertTriangle, Save, Trash2, UserCircle } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

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
    const [updates, setUpdates] = useState<Record<string, Partial<BulkUpdateItem>>>({});
    const [newItems, setNewItems] = useState<NewItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const [customerDetails, setCustomerDetails] = useState({
        name: "",
        address1: "",
        address2: "",
        phone: "",
        gstin: "",
        msme: "",
        dl: "",
        description: ""
    });

    const handleCustomerDetailChange = (field: keyof typeof customerDetails, value: string) => {
        setCustomerDetails(prev => ({ ...prev, [field]: value }));
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

    return (
        <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200">
            <div className="p-0 m-0">
                {/* Action Bar */}
                <div className="flex justify-between items-center p-4 border-b bg-slate-50">
                    <div className="text-sm text-slate-600">
                        {hasChanges ? (
                            <span className="font-medium text-amber-600">
                                {newItems.length > 0 && `${newItems.length} new item(s)`}
                                {Object.keys(updates).length > 0 && newItems.length > 0 && ", "}
                                {Object.keys(updates).length > 0 && `${Object.keys(updates).length} item(s) modified`}
                            </span>
                        ) : (
                            <span>Edit fields below to update inventory</span>
                        )}
                    </div>
                    <Button
                        onClick={handleSaveChanges}
                        disabled={!hasChanges || isSaving}
                        className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all hover:shadow-lg active:scale-95 gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>

                {/* Customer Details Section */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-xs">
                    <div className="flex items-center gap-2 mb-4">
                        <UserCircle className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-800">Customer Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-500 ml-1">Customer Name</label>
                            <Input
                                value={customerDetails.name}
                                onChange={(e) => handleCustomerDetailChange("name", e.target.value)}
                                className="h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                placeholder="Enter name"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-500 ml-1">Phone Number</label>
                            <Input
                                value={customerDetails.phone}
                                onChange={(e) => handleCustomerDetailChange("phone", e.target.value)}
                                className="h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                placeholder="Enter phone"
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-medium text-slate-500 ml-1">Address Line 1</label>
                            <Input
                                value={customerDetails.address1}
                                onChange={(e) => handleCustomerDetailChange("address1", e.target.value)}
                                className="h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                placeholder="Street address, P.O. box, etc."
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-medium text-slate-500 ml-1">Address Line 2</label>
                            <Input
                                value={customerDetails.address2}
                                onChange={(e) => handleCustomerDetailChange("address2", e.target.value)}
                                className="h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                placeholder="Apartment, suite, unit, etc."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-500 ml-1">GSTIN</label>
                            <Input
                                value={customerDetails.gstin}
                                onChange={(e) => handleCustomerDetailChange("gstin", e.target.value)}
                                className="h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                placeholder="GSTIN Number"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-500 ml-1">MSME No.</label>
                            <Input
                                value={customerDetails.msme}
                                onChange={(e) => handleCustomerDetailChange("msme", e.target.value)}
                                className="h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                placeholder="MSME Number"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-500 ml-1">DL No.</label>
                            <Input
                                value={customerDetails.dl}
                                onChange={(e) => handleCustomerDetailChange("dl", e.target.value)}
                                className="h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                placeholder="Drug License Number"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-500 ml-1">Description</label>
                            <Input
                                value={customerDetails.description}
                                onChange={(e) => handleCustomerDetailChange("description", e.target.value)}
                                className="h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                placeholder="Additional notes"
                            />
                        </div>
                    </div>
                </div>

                {/* Single Unified Table */}
                <div className="overflow-x-auto w-full">
                    <Table className="whitespace-nowrap">
                        <TableHeader className="bg-slate-700 hover:bg-slate-700">
                            <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 pl-4">
                                    SNo
                                </TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">
                                    Mfac
                                </TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">
                                    Particulars
                                </TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">
                                    Packing
                                </TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">
                                    HSN
                                </TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">
                                    BatchNo
                                </TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">
                                    Exp
                                </TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">
                                    Qty
                                </TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">
                                    Sch Qty
                                </TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">
                                    MRP
                                </TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">
                                    Rate
                                </TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">
                                    Sch Disc %
                                </TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">
                                    Disc GST %
                                </TableHead>
                                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 pr-4">
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
                                        <Input type="number" placeholder="Disc GST %" className="h-9 w-20" step="0.01" />
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
                <div className="bg-white border border-slate-200 rounded-lg p-6 mt-4">
                    <div className="flex justify-end">

                        {/* Totals */}
                        <div className="w-1/3 min-w-[300px]">
                            <h3 className="font-semibold text-sm mb-3 border-b pb-2">Summary</h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>S.ch Total:</span>
                                    <span className="font-medium">9305.83</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Cash Disc (Item):</span>
                                    <span>176.20</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Scheme Disc (Item):</span>
                                    <span>0.00</span>
                                </div>
                                <div className="flex justify-between font-semibold border-t pt-1">
                                    <span>Taxable Amount:</span>
                                    <span>9129.63</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax Amount:</span>
                                    <span>456.48</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Bill Disc:</span>
                                    <span>0.00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>TDS / TCS Amount:</span>
                                    <span>0.00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Write Off:</span>
                                    <span>-0.11</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t-2 pt-2 mt-2">
                                    <span>Net Amount:</span>
                                    <span>9586.00</span>
                                </div>
                                <div className="flex justify-between font-semibold text-green-700 border-t pt-1">
                                    <span>Net Payable:</span>
                                    <span>9586.00</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-slate-600 text-center">
                            Amount In Words: Nine Thousand Five Hundred and Eighty Six Rupees Only
                        </p>
                        <p className="text-xs text-slate-500 text-center mt-2">
                            E & O.E
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
