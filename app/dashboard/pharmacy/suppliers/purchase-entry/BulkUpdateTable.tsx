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
    Upload,
    Check,
    ChevronsUpDown,
    Calculator
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DUMMY_SUPPLIERS } from "../data";
import { useSearchParams } from "next/navigation";
import { Supplier } from "../interface";

interface BulkUpdateItem {
    _id: string;
    product: string;
    hsn: string;
    batch: string;
    qty: number;
    schm: number;
    pack: string;
    mrp: number;
    expiry: string;
    rate: number;
    sgst_p: number;
    cgst_p: number;
    dis_p: number;
    dis: number;
    schema_free: number;
    schema_amt: number;
    amount: number;
}

interface NewItem extends BulkUpdateItem {
    id: string;
}

interface Props {
    items: BulkUpdateItem[];
    lowStockThreshold: number;
    onSave?: (updates: Record<string, Partial<BulkUpdateItem>>) => Promise<void>;
}

const PRODUCTS = [
    { value: "p1", label: "Paracetamol 500mg" },
    { value: "p2", label: "Amoxicillin 250mg" },
    { value: "p3", label: "Cetirizine 10mg" },
    { value: "p4", label: "Ibuprofen 400mg" },
    { value: "p5", label: "Azithromycin 500mg" },
];

export default function BulkUpdateTable({ items, lowStockThreshold, onSave }: Props) {
    const searchParams = useSearchParams();
    const defaultSupplierId = searchParams.get("supplierId");

    const [newItems, setNewItems] = useState<NewItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>(defaultSupplierId || "");
    const [gstType, setGstType] = useState<"inclusive" | "exclusive">("exclusive");
    const [enableTCS, setEnableTCS] = useState(false);

    useEffect(() => {
        if (defaultSupplierId) {
            setSelectedSupplierId(defaultSupplierId);
        }
    }, [defaultSupplierId]);

    const [billDetails, setBillDetails] = useState({
        invoiceNo: "",
        billDate: "",
        transportCharges: "0",
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
            hsn: "",
            batch: "",
            qty: 0,
            schm: 0,
            pack: "",
            mrp: 0,
            expiry: "",
            rate: 0,
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
                    const r = Number(updated.rate) || 0;
                    const dp = Number(updated.dis_p) || 0;
                    const sp = Number(updated.sgst_p) || 0;
                    const cp = Number(updated.cgst_p) || 0;
                    const sf = Number(updated.schema_free) || 0;

                    const gross = q * r;
                    const discount = gross * (dp / 100);
                    const taxable = gross - discount;
                    const tax = taxable * ((sp + cp) / 100);

                    // SCHEMA AMT calculation: Rate * SCHEMA (FREE)
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
            const r = Number(item.rate) || 0;
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
        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success("Purchase entry saved successfully");
            setNewItems([]);
        } catch (error) {
            toast.error("Failed to save changes");
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
                pack: "",
                mrp: 0,
                expiry: "",
                rate: 0,
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

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-7 rounded-xl shadow-sm border border-slate-200"
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Supplier*</label>
                        <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                            <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all">
                                <SelectValue placeholder="Select Supplier" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-slate-200">
                                {DUMMY_SUPPLIERS.map((s: Supplier) => (
                                    <SelectItem key={s._id} value={s._id} className="rounded-md focus:bg-indigo-50">{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Invoice Date*</label>
                        <Input
                            type="date"
                            className="h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                            value={billDetails.billDate}
                            onChange={(e) => handleBillDetailChange("billDate", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Invoice No*</label>
                        <Input
                            placeholder="Invoice no."
                            className="h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                            value={billDetails.invoiceNo}
                            onChange={(e) => handleBillDetailChange("invoiceNo", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Transport Charges</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                            <Input
                                placeholder="0.00"
                                className="h-11 bg-slate-50/50 border-slate-200 rounded-lg pl-7 focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-slate-700"
                                value={billDetails.transportCharges}
                                onChange={(e) => handleBillDetailChange("transportCharges", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-10 mt-8 border-t border-slate-100 pt-7">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="gstType"
                                        checked={gstType === "inclusive"}
                                        onChange={() => setGstType("inclusive")}
                                        className="peer w-5 h-5 opacity-0 absolute z-10 cursor-pointer"
                                    />
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 peer-checked:border-indigo-600 peer-checked:border-[6px] transition-all"></div>
                                </div>
                                <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">GST Inclusive</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="gstType"
                                        checked={gstType === "exclusive"}
                                        onChange={() => setGstType("exclusive")}
                                        className="peer w-5 h-5 opacity-0 absolute z-10 cursor-pointer"
                                    />
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 peer-checked:border-indigo-600 peer-checked:border-[6px] transition-all"></div>
                                </div>
                                <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">GST Exclusive</span>
                            </label>
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group bg-slate-50/50 px-4 py-2 rounded-full border border-slate-100 hover:border-slate-200 transition-all">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={enableTCS}
                                onChange={(e) => setEnableTCS(e.target.checked)}
                                className="peer w-5 h-5 opacity-0 absolute z-10 cursor-pointer"
                            />
                            <div className="w-5 h-5 rounded border-2 border-slate-200 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider transition-colors">Enable TCS</span>
                    </label>


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
                                <TableHead className="w-16 text-[11px] font-black uppercase text-slate-200 py-4 text-center tracking-wider border-r border-slate-600/30">SL NO</TableHead>
                                <TableHead className="min-w-[150px] text-[11px] font-black uppercase text-slate-200 py-4 tracking-wider">PRODUCT NAME</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-slate-200 py-4 tracking-wider">HSN</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-slate-200 py-4 tracking-wider">BATCH</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-slate-200 py-4 text-center tracking-wider min-w-[85px]">QTY</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-slate-200 py-4 text-center tracking-wider">PACK</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-slate-200 py-4 text-center tracking-wider min-w-[85px]">MRP</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-slate-200 py-4 tracking-wider">EXPIRY</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-slate-200 py-4 text-center tracking-wider min-w-[85px]">RATE</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-slate-200 py-4 text-center tracking-wider">SGST(%)</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-slate-200 py-4 text-center tracking-wider">CGST(%)</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-slate-200 py-4 text-center tracking-wider">DIS(%)</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-slate-200 py-4 text-center tracking-wider">DIS AMT</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-slate-200 py-4 text-center tracking-wider">SCHEMA (FREE)</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-slate-200 py-4 text-center tracking-wider">SCHEMA AMT</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-slate-200 py-4 text-right pr-8 tracking-wider">TOTAL</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {newItems.map((item, index) => (
                                    <motion.tr
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="hover:bg-indigo-50/30 transition-colors border-b border-slate-100 group"
                                    >
                                        <TableCell className="text-center text-xs font-black text-slate-300 py-4 group-hover:text-indigo-500 transition-colors">
                                            {String(index + 1).padStart(2, '0')}
                                        </TableCell>
                                        <TableCell className="p-2 min-w-[150px]">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full h-11 justify-between font-bold text-sm border border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-300 hover:shadow-md transition-all rounded-lg",
                                                            !item.product && "text-slate-400 font-medium"
                                                        )}
                                                    >
                                                        {item.product
                                                            ? PRODUCTS.find((p) => p.value === item.product)?.label
                                                            : "Select / Search Product..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-indigo-500" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[350px] p-0 shadow-2xl border-slate-200 rounded-xl">
                                                    <Command className="rounded-xl">
                                                        <CommandInput placeholder="Search medicines..." className="h-12 border-none focus:ring-0" />
                                                        <CommandList>
                                                            <CommandEmpty className="py-6 text-center text-slate-500 text-sm">No drug found in inventory.</CommandEmpty>
                                                            <CommandGroup heading="Medicines" className="p-2">
                                                                {PRODUCTS.map((product) => (
                                                                    <CommandItem
                                                                        key={product.value}
                                                                        value={product.label}
                                                                        onSelect={() => {
                                                                            updateNewItem(item.id, "product", product.value);
                                                                        }}
                                                                        className="rounded-lg h-10 px-3 aria-selected:bg-indigo-50 aria-selected:text-indigo-700 font-medium transition-colors cursor-pointer mb-1"
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-3 h-4 w-4 text-indigo-600 transition-all",
                                                                                item.product === product.value ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                                                            )}
                                                                        />
                                                                        {product.label}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                        <TableCell className="p-2"><Input className="h-11 text-xs font-bold border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all text-center" value={item.hsn} onChange={(e) => updateNewItem(item.id, "hsn", e.target.value)} /></TableCell>
                                        <TableCell className="p-2"><Input className="h-11 text-xs font-bold border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all text-center" value={item.batch} onChange={(e) => updateNewItem(item.id, "batch", e.target.value)} /></TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                className="h-11 text-sm font-black border-slate-200 bg-indigo-50/20 rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-center text-indigo-700"
                                                value={item.qty || ""}
                                                onChange={(e) => updateNewItem(item.id, "qty", Number(e.target.value))}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                className="h-11 text-sm font-bold border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all text-center"
                                                value={item.pack}
                                                onChange={(e) => updateNewItem(item.id, "pack", e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                className="h-11 text-sm font-black border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all text-center text-slate-700"
                                                value={item.mrp || ""}
                                                onChange={(e) => updateNewItem(item.id, "mrp", Number(e.target.value))}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="date"
                                                className="h-11 text-[11px] font-bold border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all px-2"
                                                value={item.expiry}
                                                onChange={(e) => updateNewItem(item.id, "expiry", e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                className="h-11 text-sm font-black border-emerald-200 bg-emerald-50/10 rounded-lg focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all text-center text-emerald-700"
                                                value={item.rate || ""}
                                                onChange={(e) => updateNewItem(item.id, "rate", Number(e.target.value))}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Select value={String(item.sgst_p)} onValueChange={(v) => updateNewItem(item.id, "sgst_p", Number(v))}>
                                                <SelectTrigger className="h-11 border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold px-3">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg shadow-xl">
                                                    <SelectItem value="0" className="font-bold">0%</SelectItem>
                                                    <SelectItem value="2.5" className="font-bold">2.5%</SelectItem>
                                                    <SelectItem value="6" className="font-bold">6%</SelectItem>
                                                    <SelectItem value="9" className="font-bold">9%</SelectItem>
                                                    <SelectItem value="12" className="font-bold">12%</SelectItem>
                                                    <SelectItem value="14" className="font-bold">14%</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Select value={String(item.cgst_p)} onValueChange={(v) => updateNewItem(item.id, "cgst_p", Number(v))}>
                                                <SelectTrigger className="h-11 border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold px-3">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg shadow-xl">
                                                    <SelectItem value="0" className="font-bold">0%</SelectItem>
                                                    <SelectItem value="2.5" className="font-bold">2.5%</SelectItem>
                                                    <SelectItem value="6" className="font-bold">6%</SelectItem>
                                                    <SelectItem value="9" className="font-bold">9%</SelectItem>
                                                    <SelectItem value="12" className="font-bold">12%</SelectItem>
                                                    <SelectItem value="14" className="font-bold">14%</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                className="h-11 text-sm font-black border-red-100 bg-red-50/10 rounded-lg focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all text-center text-red-600"
                                                value={item.dis_p || ""}
                                                onChange={(e) => updateNewItem(item.id, "dis_p", Number(e.target.value))}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2 text-center">
                                            <div className="text-xs font-black text-slate-700 bg-slate-50 h-11 flex items-center justify-center rounded-lg border border-slate-100 shadow-sm border-dashed">
                                                ₹{(item.dis || 0).toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-2 text-center">
                                            <Input
                                                type="number"
                                                className="h-11 text-sm font-black border-indigo-200 bg-indigo-50/20 rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-center text-indigo-600"
                                                value={item.schema_free || ""}
                                                onChange={(e) => updateNewItem(item.id, "schema_free", Number(e.target.value))}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2 text-center">
                                            <div className="text-xs font-black text-indigo-700 bg-indigo-50/50 h-11 flex items-center justify-center rounded-lg border border-indigo-200/50 shadow-sm border-dashed">
                                                ₹{(item.schema_amt || 0).toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-2 text-right pr-8">
                                            <div className="text-base font-black text-[#1e293b] group-hover:text-indigo-700 transition-colors drop-shadow-sm">
                                                ₹{(item.amount || 0).toFixed(2)}
                                            </div>
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
                        className="bg-white text-indigo-600 hover:text-white hover:bg-indigo-600 border-indigo-200 font-black text-xs uppercase tracking-widest px-8 h-12 rounded-xl transition-all shadow-sm active:scale-95"
                    >
                        + Add Drug Row
                    </Button>
                    <div className="text-[10px] font-bold text-slate-400 italic">
                        Tip: Tab through fields for faster entry
                    </div>
                </div>
            </motion.div>

            {/* Footer Metrics Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-6 gap-6"
            >
                {[
                    { label: "GROSS AMOUNT", value: totals.gross, color: "text-slate-600" },
                    { label: "TOTAL DISCOUNT", value: totals.discount, color: "text-red-500", prefix: "-" },
                    { label: "SGST PAYABLE", value: totals.sgst, color: "text-slate-600" },
                    { label: "CGST PAYABLE", value: totals.cgst, color: "text-slate-600" },
                    { label: "SCHEMA TOTAL", value: totals.schema_amt, color: "text-indigo-600" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-indigo-200 transition-all">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 -mr-8 -mt-8 rounded-full group-hover:bg-indigo-50 transition-colors" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative">{stat.label}</span>
                        <div className={cn("text-xl font-black mt-2 relative", stat.color)}>
                            {stat.prefix} ₹{stat.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                ))}
                <div className="bg-[#0a1128] p-5 rounded-xl shadow-xl shadow-blue-900/10 border-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -mr-12 -mt-12 rounded-full rotate-45 group-hover:scale-110 transition-transform duration-700" />
                    <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest relative">NET PAYABLE</span>
                    <div className="text-2xl font-black mt-2 text-white relative">
                        ₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-4 pb-12"
            >
                <div className="lg:col-span-3 space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Description</label>
                    <Textarea
                        placeholder="Type additional details about this transaction for records..."
                        className="min-h-[140px] bg-white border-slate-200 rounded-2xl resize-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm text-sm p-5 font-medium leading-relaxed placeholder:text-slate-300 border-2"
                        value={billDetails.description}
                        onChange={(e) => handleBillDetailChange("description", e.target.value)}
                    />
                </div>
                <div className="flex flex-col justify-end h-full gap-4 mt-8 lg:mt-0">
                    <Button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className={cn(
                            "w-full bg-emerald-600 hover:bg-emerald-700 text-white h-16 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl transition-all"
                        )}
                    >

                        {isSaving ? (
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Save className="w-5 h-5" />
                                <span>Complete Purchase</span>
                            </div>
                        )}
                    </Button>

                </div>
            </motion.div>
        </div>
    );
}
