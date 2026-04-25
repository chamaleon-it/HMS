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
import {
    Save,
    Trash2,
    Check,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import ItemSearchCell from "./components/ItemSearchCell";
import TypableDateInput from "./components/TypableDateInput";
import TypableExpiryInput from "./components/TypableExpiryInput";
import { BulkUpdateItem, NewItem } from "./components/types";


interface Props {
    items: BulkUpdateItem[];
    lowStockThreshold: number;
    onSave?: (updates: Record<string, Partial<BulkUpdateItem>>) => Promise<void>;
}

export default function BulkUpdateTable({ items, lowStockThreshold, onSave }: Props) {
    const searchParams = useSearchParams();
    const defaultSupplierId = searchParams.get("supplierId");

    const [newItems, setNewItems] = useState<NewItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>(defaultSupplierId || "");
    const [gstType, setGstType] = useState<"inclusive" | "exclusive">("inclusive");
    const [enableTCS, setEnableTCS] = useState(false);

    const focusNextElement = (currentElement: HTMLElement) => {
        const currentRow = currentElement.closest('tr');
        if (!currentRow) return;

        const focusableElements = Array.from(
            currentRow.querySelectorAll('input:not([disabled]), button[role="combobox"]:not([disabled])')
        ) as HTMLElement[];

        const currentIndex = focusableElements.indexOf(currentElement);
        if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
            focusableElements[currentIndex + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, rowId: string, fieldName: string, isLastField: boolean = false, newMedicine: boolean = false) => {
        if (e.key === 'Delete') {
            e.preventDefault();
            removeNewRow(rowId);
            return;
        }
        if (e.key === 'Enter' || (newMedicine && e.key === 'Tab' && !e.shiftKey)) {
            e.preventDefault();

            if (isLastField) {
                addNewRow();
                setTimeout(() => {
                    const allRows = document.querySelectorAll('[data-row-id]');
                    const lastRow = allRows[allRows.length - 1];
                    if (lastRow) {
                        const firstButton = lastRow.querySelector('button[role="combobox"]') as HTMLElement;
                        if (firstButton) {
                            firstButton.focus();
                            firstButton.click();
                        }
                    }
                }, 200);
                return;
            }

            focusNextElement(e.target as HTMLElement);
        }
    };

    useEffect(() => {
        if (defaultSupplierId) {
            setSelectedSupplierId(defaultSupplierId);
        }
    }, [defaultSupplierId]);

    const [billDetails, setBillDetails] = useState({
        invoiceNumber: "",
        invoiceDate: "",
        transportCharges: "0",
        paidAmount: "0",
        description: ""
    });

    const handleBillDetailChange = (field: keyof typeof billDetails, value: string) => {
        setBillDetails(prev => ({ ...prev, [field]: value }));
    };

    const addNewRow = () => {
        const newItem: NewItem = {
            id: Date.now().toString(),
            _id: "",
            product: "",
            batch: "",
            qty: 0,
            pack: 0,
            unitPrice: 0,
            expiryDate: "",
            purchasePrice: 0,
            sgst_p: 0,
            cgst_p: 0,
            dis_p: 0,
            dis: 0,
            schema_free: 0,
            schema_amt: 0,
            amount: 0,
        };
        setNewItems([...newItems, newItem]);
    };

    const removeNewRow = (id: string) => {
        setNewItems(newItems.filter((item) => item.id !== id));
    };

    const updateNewItem = (id: string, field: keyof NewItem, value: any) => {
        setNewItems(prevItems =>
            prevItems.map((item) => {
                if (item.id === id) {
                    const updated = { ...item, [field]: value };

                    const q = Number(updated.qty) || 0;
                    const r = Number(updated.purchasePrice) || 0;
                    const dp = Number(updated.dis_p) || 0;
                    const sp = Number(updated.sgst_p) || 0;
                    const cp = Number(updated.cgst_p) || 0;
                    const sf = Number(updated.schema_free) || 0;

                    const gross = q * r;
                    const discount = gross * (dp / 100);
                    const taxable = gross - discount;
                    const tax = taxable * ((sp + cp) / 100);

                    updated.schema_amt = r * sf;

                    updated.dis = discount;
                    updated.amount = taxable + tax;

                    return updated;
                }
                return item;
            })
        );
    };

    const totals = useMemo(() => {
        return newItems.reduce((acc, item) => {
            const q = Number(item.qty) || 0;
            const r = Number(item.purchasePrice) || 0;
            const dp = Number(item.dis_p) || 0;
            const sp = Number(item.sgst_p) || 0;
            const cp = Number(item.cgst_p) || 0;
            const sam = Number(item.schema_amt) || 0;

            const gross = q * r;
            const discount = gross * (dp / 100);
            const taxable = gross - discount;
            const sgst = taxable * (sp / 100);
            const cgst = taxable * (cp / 100);

            acc.gross += gross;
            acc.discount += discount;
            acc.sgst += sgst;
            acc.cgst += cgst;
            acc.schema_amt += sam;
            acc.total += (taxable + sgst + cgst);
            return acc;
        }, { gross: 0, discount: 0, sgst: 0, cgst: 0, schema_amt: 0, total: Number(billDetails.transportCharges) || 0 });
    }, [newItems, billDetails.transportCharges]);

    const handleSaveChanges = async () => {
        if (!selectedSupplierId) {
            toast.error("Please select a supplier");
            return;
        }
        if (!billDetails.invoiceNumber || !billDetails.invoiceDate) {
            toast.error("Please fill in invoice number and date");
            return;
        }
        const validItems = newItems.filter(item => item._id);

        if (validItems.length === 0) {
            toast.error("Please add at least one valid item");
            return;
        }

        // Validation Loop
        for (const item of validItems) {
            const rowIndex = newItems.findIndex(ni => ni.id === item.id) + 1;

            if (!item.batch) {
                toast.error(`Row ${rowIndex}: Batch number is required`);
                return;
            }
            if (!item.qty || item.qty <= 0) {
                toast.error(`Row ${rowIndex}: Quantity must be positive`);
                return;
            }
            if (!item.unitPrice || item.unitPrice <= 0) {
                toast.error(`Row ${rowIndex}: MRP must be positive`);
                return;
            }
            if (!item.expiryDate) {
                toast.error(`Row ${rowIndex}: Expiry date is required`);
                return;
            }

            const expiryDate = new Date(item.expiryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (expiryDate <= today) {
                toast.error(`Row ${rowIndex}: Expiry date must be a future date`);
                return;
            }
        }

        const paid = Number(billDetails.paidAmount) || 0;
        if (paid > totals.total) {
            toast.error(`Paid amount (₹${paid}) cannot exceed net payable (₹${totals.total.toFixed(2)})`);
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                supplier: selectedSupplierId,
                invoiceNumber: billDetails.invoiceNumber,
                invoiceDate: billDetails.invoiceDate,
                transportCharge: Number(billDetails.transportCharges) || 0,
                paidAmount: Number(billDetails.paidAmount) || 0,
                description: billDetails.description,
                items: validItems.map(item => ({
                    item: item._id,
                    batch: item.batch,
                    quantity: item.qty,
                    pack: item.pack,
                    unitPrice: item.unitPrice,
                    expiryDate: item.expiryDate,
                    free: item.schema_free,
                    purchasePrice: item.purchasePrice,
                    gst: (item.qty * item.purchasePrice - item.dis) * ((item.sgst_p + item.cgst_p) / 100),
                    discount: item.dis,
                })),
                subTotal: totals.gross,
                total: totals.total,
                grossAmount: totals.gross,
                gst: totals.sgst + totals.cgst,
                discount: totals.discount
            };

            await api.post("/purchase_entry", payload);
            toast.success("Purchase entry saved successfully");
            setNewItems([]);
            setBillDetails({
                invoiceNumber: "",
                invoiceDate: "",
                transportCharges: "0",
                paidAmount: "0",
                description: ""
            });
            setSelectedSupplierId("");
        } catch (error: any) {
            console.error("Purchase entry error:", error);
            toast.error(error.response?.data?.message || "Failed to save purchase entry");
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (newItems.length === 0) {
            const initialRows = Array.from({ length: 1 }).map((_, i) => ({
                id: `init-${i}`,
                _id: "",
                product: "",
                hsn: "",
                batch: "",
                qty: 0,
                schm: 0,
                pack: 0,
                unitPrice: 0,
                expiryDate: "",
                purchasePrice: 0,
                sgst_p: 0,
                cgst_p: 0,
                dis_p: 0,
                dis: 0,
                schema_free: 0,
                schema_amt: 0,
                amount: 0,
            }));
            setNewItems(initialRows);
        }
    }, []);

    const { data: suppliersData } = useSWR<{ message: string; data: { _id: string; name: string }[] }>("/suppliers/get_id_and_name");
    const suppliers = suppliersData?.data || [];

    return (
        <div className="space-y-6 ">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-7 rounded-xl shadow-sm border border-slate-200"
            >
                <div className="flex gap-8">
                    <div className="space-y-2">
                        <label className="text-[11px]  text-slate-400 uppercase tracking-widest font-semibold">Supplier*</label>
                        <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                            <SelectTrigger className="h-11! bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all  ">
                                <SelectValue placeholder="Select Supplier" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-slate-200 ">
                                {suppliers.map((s: { _id: string; name: string }) => (
                                    <SelectItem key={s._id} value={s._id} className="rounded-md focus:bg-indigo-50 ">{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px]  text-slate-400 uppercase tracking-widest font-semibold">Invoice Date*</label>
                        <TypableDateInput
                            value={billDetails.invoiceDate}
                            onChange={(date) => handleBillDetailChange("invoiceDate", date)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px]  text-slate-400 uppercase tracking-widest font-semibold">Invoice No*</label>
                        <Input
                            placeholder="Invoice no."
                            className="h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all  "
                            value={billDetails.invoiceNumber}
                            onChange={(e) => handleBillDetailChange("invoiceNumber", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px]  text-slate-400 uppercase tracking-widest font-semibold">Transport Charges</label>
                        <div className="relative ">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm  ">₹</span>
                            <Input
                                type="number"
                                placeholder="0.00"
                                className="h-11 bg-slate-50/50 border-slate-200 rounded-lg pl-7 focus:ring-2 focus:ring-indigo-500/20 transition-all  text-slate-700 "
                                value={Number(billDetails.transportCharges) || ""}
                                onChange={(e) => handleBillDetailChange("transportCharges", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-10 pt-7 ">
                        <div className="flex items-center gap-10 ">
                            <div className="flex items-center gap-6 ">
                                <label className="flex items-center gap-2 cursor-pointer group ">
                                    <div className="relative flex items-center justify-center ">
                                        <input
                                            type="radio"
                                            name="gstType"
                                            checked={gstType === "inclusive"}
                                            onChange={() => setGstType("inclusive")}
                                            className="peer w-5 h-5 opacity-0 absolute z-10 cursor-pointer "
                                        />
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 peer-checked:border-indigo-600 peer-checked:border-[6px] transition-all "></div>
                                    </div>
                                    <span className="text-sm  text-slate-500 group-hover:text-slate-900 transition-colors font-semibold">GST Inclusive</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group ">
                                    <div className="relative flex items-center justify-center ">
                                        <input
                                            type="radio"
                                            name="gstType"
                                            checked={gstType === "exclusive"}
                                            onChange={() => setGstType("exclusive")}
                                            className="peer w-5 h-5 opacity-0 absolute z-10 cursor-pointer "
                                        />
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 peer-checked:border-indigo-600 peer-checked:border-[6px] transition-all "></div>
                                    </div>
                                    <span className="text-sm  text-slate-500 group-hover:text-slate-900 transition-colors font-semibold">GST Exclusive</span>
                                </label>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer group bg-slate-50/50 px-4 py-2 rounded-full">
                            <div className="relative flex items-center justify-center ">
                                <input
                                    type="checkbox"
                                    checked={enableTCS}
                                    onChange={(e) => setEnableTCS(e.target.checked)}
                                    className="peer w-5 h-5 opacity-0 absolute z-10 cursor-pointer "
                                />
                                <div className="w-5 h-5 rounded border-2 border-slate-200 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center ">
                                    <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity " />
                                </div>
                            </div>
                            <span className="text-xs  text-slate-500 uppercase tracking-wider transition-colors font-semibold">Enable TCS</span>
                        </label>
                    </div>
                </div>
            </motion.div>

            {/* Table Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden"
            >


                <div className="overflow-x-auto relative">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#334155] hover:bg-[#334155] border-none">
                                <TableHead className="w-16 text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider border-r border-slate-600/30">SL NO</TableHead>
                                <TableHead className="min-w-[150px] text-[11px] font-semibold uppercase text-slate-200 py-4 tracking-wider">PRODUCT NAME</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 tracking-wider">BATCH</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider min-w-[85px]">QTY</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider">PACK</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider min-w-[85px]">MRP</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 tracking-wider">EXPIRY</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider min-w-[85px]">Rate</TableHead>
                                {gstType === "inclusive" && <>
                                    <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider">SGST(%)</TableHead>
                                    <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider">CGST(%)</TableHead>
                                </>}
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider">DIS(%)</TableHead>
                                {/* <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider">DIS AMT</TableHead> */}
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider">SCHEMA (FREE)</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider">SCHEMA AMT</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-right pr-8 tracking-wider">TOTAL</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-right pr-8 tracking-wider">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {newItems.map((item, index) => (
                                    <motion.tr
                                        key={item.id}
                                        data-row-id={item.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="hover:bg-indigo-50/30 transition-colors border-b border-slate-100 group"
                                    >
                                        <TableCell className="text-center text-xs font-semibold text-slate-300 py-4 group-hover:text-indigo-500 transition-colors">
                                            {String(index + 1)}
                                        </TableCell>
                                        <TableCell className="p-2 min-w-[150px] ">
                                            <ItemSearchCell
                                                selectedItemId={item._id}
                                                onSelect={(it) => {

                                                    const gst = it?.gst || 0;
                                                    updateNewItem(item.id, "_id", it._id);
                                                    updateNewItem(item.id, "product", it.name);
                                                    updateNewItem(item.id, "unitPrice", it.unitPrice || 0);
                                                    updateNewItem(item.id, "purchasePrice", it.purchasePrice || 0);
                                                    updateNewItem(item.id, "pack", it.packing || 0);
                                                    updateNewItem(item.id, "cgst_p", gst / 2);
                                                    updateNewItem(item.id, "sgst_p", gst / 2);

                                                    setTimeout(() => {
                                                        const currentRow = document.querySelector(`[data-row-id="${item.id}"]`);
                                                        if (currentRow) {
                                                            const batchInput = currentRow.querySelector('input[name="batch"]') as HTMLInputElement;
                                                            batchInput?.focus();
                                                        }
                                                    }, 100);
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2"><Input name="batch" className="h-11 text-xs  border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all text-center" value={item.batch} onChange={(e) => updateNewItem(item.id, "batch", e.target.value)} onKeyDown={(e) => handleKeyDown(e, item.id, "batch")} /></TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                name="qty"
                                                data-field="qty"
                                                className="h-11 text-sm font-semibold border-slate-200 bg-indigo-50/20 rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-center text-indigo-700"
                                                value={item.qty || ""}
                                                onChange={(e) => updateNewItem(item.id, "qty", Number(e.target.value))}
                                                onKeyDown={(e) => handleKeyDown(e, item.id, "qty")}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                data-field="pack"
                                                className="h-11 text-sm  border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all text-center"
                                                value={item.pack || ""}
                                                onChange={(e) => updateNewItem(item.id, "pack", Number(e.target.value))}
                                                onKeyDown={(e) => handleKeyDown(e, item.id, "pack")}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                data-field="unitPrice"
                                                className="h-11 text-sm font-semibold border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all text-center text-slate-700"
                                                value={item.unitPrice || ""}
                                                onChange={(e) => updateNewItem(item.id, "unitPrice", Number(e.target.value))}
                                                onKeyDown={(e) => handleKeyDown(e, item.id, "unitPrice")}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <TypableExpiryInput
                                                value={item.expiryDate}
                                                onChange={(date) => updateNewItem(item.id, "expiryDate", date)}
                                                onKeyDown={(e) => handleKeyDown(e, item.id, "expiryDate")}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                data-field="purchasePrice"
                                                className="h-11 text-sm font-semibold border-emerald-200 bg-emerald-50/10 rounded-lg focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all text-center text-emerald-700"
                                                value={item.purchasePrice || ""}
                                                onChange={(e) => updateNewItem(item.id, "purchasePrice", Number(e.target.value))}
                                                onKeyDown={(e) => handleKeyDown(e, item.id, "purchasePrice")}
                                            />
                                        </TableCell>
                                        {gstType === "inclusive" && <>
                                            <TableCell className="p-2">
                                                <Select
                                                    value={String(item.sgst_p)}
                                                    onValueChange={(v) => {
                                                        updateNewItem(item.id, "sgst_p", Number(v));
                                                        setTimeout(() => {
                                                            const trigger = document.querySelector(`[data-row-id="${item.id}"] [data-field="sgst_p"]`) as HTMLElement;
                                                            if (trigger) focusNextElement(trigger);
                                                        }, 50);
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        data-field="sgst_p"
                                                        className="h-11 border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all px-3"
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-lg shadow-xl">
                                                        <SelectItem value="0" className="">0%</SelectItem>
                                                        <SelectItem value="2.5" className="">2.5%</SelectItem>
                                                        <SelectItem value="6" className="">6%</SelectItem>
                                                        <SelectItem value="9" className="">9%</SelectItem>
                                                        <SelectItem value="12" className="">12%</SelectItem>
                                                        <SelectItem value="14" className="">14%</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <Select
                                                    value={String(item.cgst_p)}
                                                    onValueChange={(v) => {
                                                        updateNewItem(item.id, "cgst_p", Number(v));
                                                        setTimeout(() => {
                                                            const trigger = document.querySelector(`[data-row-id="${item.id}"] [data-field="cgst_p"]`) as HTMLElement;
                                                            if (trigger) focusNextElement(trigger);
                                                        }, 50);
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        data-field="cgst_p"
                                                        className="h-11 border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all px-3"
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-lg shadow-xl">
                                                        <SelectItem value="0" className="">0%</SelectItem>
                                                        <SelectItem value="2.5" className="">2.5%</SelectItem>
                                                        <SelectItem value="6" className="">6%</SelectItem>
                                                        <SelectItem value="9" className="">9%</SelectItem>
                                                        <SelectItem value="12" className="">12%</SelectItem>
                                                        <SelectItem value="14" className="">14%</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </>}
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                data-field="dis_p"
                                                className="h-11 text-sm font-semibold border-red-100 bg-red-50/10 rounded-lg focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all text-center text-red-600"
                                                value={item.dis_p || ""}
                                                onChange={(e) => updateNewItem(item.id, "dis_p", Number(e.target.value))}
                                                onKeyDown={(e) => handleKeyDown(e, item.id, "dis_p")}
                                            />
                                        </TableCell>

                                        <TableCell className="p-2 text-center">
                                            <Input
                                                type="number"
                                                data-field="schema_free"
                                                className="h-11 text-sm font-semibold border-indigo-200 bg-indigo-50/20 rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-center text-indigo-600"
                                                value={item.schema_free || ""}
                                                onChange={(e) => updateNewItem(item.id, "schema_free", Number(e.target.value))}
                                                onKeyDown={(e) => handleKeyDown(e, item.id, "schema_free", true, true)}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2 text-center">
                                            <div className="text-xs font-semibold text-indigo-700 bg-indigo-50/50 h-11 flex items-center justify-center rounded-lg border border-indigo-200/50 shadow-sm border-dashed">
                                                ₹{(item.schema_amt || 0).toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-2 text-right pr-8">
                                            <div className="text-base font-bold text-[#1e293b] group-hover:text-indigo-700 transition-colors drop-shadow-sm">
                                                ₹{(item.amount || 0).toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button onClick={() => removeNewRow(item.id)} variant="ghost" size="icon"><Trash2 className="text-red-500" /></Button>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>

                <div className="p-6 bg-[#f8fafc] border-t border-slate-200 flex items-center justify-between">
                    <Button
                        onClick={addNewRow}
                        variant="outline"
                        className="bg-white text-indigo-600 hover:text-white hover:bg-indigo-600 border-indigo-200 font-semibold text-xs uppercase tracking-widest px-8 h-12 rounded-xl transition-all shadow-sm active:scale-95"
                    >
                        + Add Drug Row
                    </Button>
                    <div className="text-[10px]  text-slate-400 italic">
                        Tip: Tab through fields for faster entry
                    </div>
                </div>
            </motion.div>

            {/* Footer Metrics Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`grid grid-cols-2 ${gstType === "exclusive" ? "md:grid-cols-4" : "md:grid-cols-6"} gap-6`}
            >
                {[
                    { label: "GROSS AMOUNT", value: totals.gross, color: "text-slate-600" },
                    { label: "TOTAL DISCOUNT", value: totals.discount, color: "text-red-500", prefix: "-" },
                    { label: "SGST PAYABLE", value: totals.sgst, color: "text-slate-600" },
                    { label: "CGST PAYABLE", value: totals.cgst, color: "text-slate-600" },
                    { label: "SCHEMA TOTAL", value: totals.schema_amt, color: "text-indigo-600" },
                ].filter((stat) => gstType === "exclusive" ? stat.label !== "SGST PAYABLE" && stat.label !== "CGST PAYABLE" : true).map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-indigo-200 transition-all">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 -mr-8 -mt-8 rounded-full group-hover:bg-indigo-50 transition-colors" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest relative">{stat.label}</span>
                        <div className={cn("text-xl font-semibold mt-2 relative", stat.color)}>
                            {stat.prefix} ₹{stat.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                ))}
                <div className="bg-[#0a1128] p-5 rounded-xl shadow-xl shadow-blue-900/10 border-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -mr-12 -mt-12 rounded-full rotate-45 group-hover:scale-110 transition-transform duration-700" />
                    <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-widest relative">NET PAYABLE</span>
                    <div className="text-2xl font-bold mt-2 text-white relative">
                        ₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4 pb-12"
            >
                <div className="lg:col-span-8 space-y-3">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] ml-2">Description</label>
                    <Textarea
                        placeholder="Type additional details about this transaction for records..."
                        className="min-h-[140px] bg-white border-slate-200 rounded-2xl resize-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm text-sm p-5 font-medium leading-relaxed placeholder:text-slate-300 border-2"
                        value={billDetails.description}
                        onChange={(e) => handleBillDetailChange("description", e.target.value)}
                    />
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
                        <div className="flex justify-between items-center border-b pb-4 border-slate-50">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Bill Summary</h3>
                            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold">DRAFT</div>
                        </div>

                        <div className="space-y-4">
                            {(() => {
                                const taxableAmt = totals.gross - totals.discount;
                                const taxAmt = totals.sgst + totals.cgst;
                                const netAmt = taxableAmt + taxAmt;
                                const netPayable = totals.total;

                                return (
                                    <>
                                        <SummaryRow label="Sub Total" value={totals.gross} />
                                        <SummaryRow label="Cash Disc" value={totals.discount} isNegative />
                                        <SummaryRow label="Scheme Disc" value={totals.schema_amt} isNegative />
                                        <div className="h-px bg-slate-100/60 my-2" />
                                        <SummaryRow label="Taxable Amount" value={taxableAmt} isBold />
                                        <SummaryRow label="Tax Amount" value={taxAmt} />
                                        {/* <SummaryRow label="Bill Disc." value={0} isNegative /> */}
                                        {/* <SummaryRow label="TDS / TCS Amount" value={0} /> */}
                                        {/* <SummaryRow label="Write Off" value={0} /> */}
                                        <div className="h-px bg-slate-100/60 my-2" />
                                        {/* <SummaryRow label="CreditNote Amt." value={0} isNegative /> */}
                                        {/* <SummaryRow label="DebitNote Amt." value={0} /> */}

                                        <div className="bg-slate-900 -mx-8 px-8 py-6 mt-6 shadow-2xl shadow-indigo-900/20">
                                            <div className="flex justify-between items-center text-white mb-1">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Net Payable</span>
                                                <span className="text-2xl font-black tracking-tight">₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-medium text-right mt-1">Inclusive of all taxes</div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        <div className="pt-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Capture Paid Amount</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-indigo-500 transition-colors">₹</span>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="h-14 bg-indigo-50/40 border-2 border-indigo-100/50 rounded-2xl pl-10 focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-black text-xl text-indigo-700 tabular-nums shadow-sm"
                                    value={Number(billDetails.paidAmount) || ""}
                                    onChange={(e) => handleBillDetailChange("paidAmount", e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                            className={cn(
                                "w-full bg-emerald-600 hover:bg-emerald-700 text-white h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-200/50 transition-all active:scale-95 flex items-center justify-center gap-3 border-b-4 border-emerald-800"
                            )}
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white animate-spin rounded-full" />
                                    <span>Verifying Entry...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Complete Purchase</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function SummaryRow({ label, value, isBold = false, isNegative = false, color = "text-slate-600" }: { label: string, value: number, isBold?: boolean, isNegative?: boolean, color?: string }) {
    return (
        <div className="flex justify-between items-center group/row">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider group-hover/row:text-slate-700 transition-colors">{label} :</span>
            <span className={cn(
                "text-sm font-bold tabular-nums tracking-tight",
                isBold ? "text-slate-900" : color,
                isNegative && "text-rose-500"
            )}>
                {isNegative && "- "}₹{Math.abs(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
        </div>
    );
}
