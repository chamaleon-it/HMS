import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import api from "@/lib/axios";
import useSWR from 'swr';
import { fDate } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PackagePlus, Power } from "lucide-react";
import React, { useRef, useState } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { ItemType } from './interface';
import TypableExpiryInput from '../purchase-entry/components/TypableExpiryInput';

// Schema for adding a batch with all 10 batch-level fields
const addBatchSchema = z.object({
    batchNumber: z.string().min(1, "Batch number is required"),
    expiryDate: z.coerce.date(),
    quantity: z.coerce.number().min(0, "Quantity must be 0 or more"),
    purchasePrice: z.coerce.number().min(0, "Price must be positive").default(0),
    mrp: z.coerce.number().min(0, "MRP must be positive").default(0),
    unitPrice: z.coerce.number().min(0, "Unit price must be positive").default(0),
    packing: z.coerce.number().min(0).default(0),
    stripCount: z.coerce.number().min(0).default(0),
    gst: z.coerce.number().min(0).max(100).default(0),
    supplier: z.string().min(1, "Supplier is required"),
});

type AddBatchFormValues = z.infer<typeof addBatchSchema>;

interface Props {
    item: ItemType;
    mutate: () => void;
}

export default function UpdateBatch({ item, mutate }: Props) {
    const [open, setOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<AddBatchFormValues>({
        // @ts-expect-error zodResolver
        resolver: zodResolver(addBatchSchema),
        defaultValues: {
            supplier: item.supplier || "",
            quantity: 0,
            purchasePrice: 0,
            mrp: 0,
            unitPrice: 0,
            packing: 0,
            stripCount: 0,
            gst: 0,
        }
    });

    const { data: suppliersData } = useSWR<{ message: string; data: { _id: string; name: string }[] }>("/suppliers/get_id_and_name");
    const suppliers = suppliersData?.data || [];

    const expiryDate = watch("expiryDate");
    const values = watch();

    // Refs for keyboard navigation
    const refs = {
        batchNumber: useRef<HTMLInputElement>(null),
        packing: useRef<HTMLInputElement>(null),
        stripCount: useRef<HTMLInputElement>(null),
        quantity: useRef<HTMLInputElement>(null),
        mrp: useRef<HTMLInputElement>(null),
        unitPrice: useRef<HTMLInputElement>(null),
        purchasePrice: useRef<HTMLInputElement>(null),
        gst: useRef<HTMLInputElement>(null),
        supplier: useRef<HTMLButtonElement>(null),
        addButton: useRef<HTMLButtonElement>(null),
    };

    const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<any>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            nextRef.current?.focus();
        }
    };

    const onSubmit = handleSubmit(async (data) => {
        try {
            await api.post(`/pharmacy/items/add_batch/${item._id}`, data);
            toast.success("Batch added successfully");
            reset({
                supplier: item.supplier || "",
                quantity: 0,
                purchasePrice: 0,
                mrp: 0,
                unitPrice: 0,
                packing: 0,
                stripCount: 0,
                gst: 0,
            });
            mutate();
            refs.batchNumber.current?.focus();
        } catch (error) {
            console.error(error);
            toast.error("Failed to add batch");
        }
    });

    const ITEMS_PER_PAGE = 5;
    const sortedBatches = item?.batches ? [...item.batches].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()) : [];
    const totalPages = Math.ceil(sortedBatches.length / ITEMS_PER_PAGE);
    const paginatedBatches = sortedBatches.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleNextPage = (e: React.MouseEvent) => {
        e.preventDefault();
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = (e: React.MouseEvent) => {
        e.preventDefault();
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                        >
                            <PackagePlus className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Manage Batches</TooltipContent>
            </Tooltip>
            <DialogContent className="max-w-4xl! max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-900">
                        Manage Batches &bull; {item.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                        Each batch holds its own pricing, stock, supplier, expiry, and packing details.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-2">
                    {/* Add Batch Form */}
                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/70 shadow-xs">
                        <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-700 mb-3">
                            Add New Batch
                        </h3>
                        <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                            <div className="sm:col-span-2">
                                <label className="text-[11px] font-medium text-slate-600">Batch Number *</label>
                                <Input
                                    {...register("batchNumber")}
                                    placeholder="e.g. BTH-001"
                                    className="mt-1 h-8 text-xs bg-white"
                                    ref={(e) => {
                                        register("batchNumber").ref(e);
                                        refs.batchNumber.current = e;
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            const el = document.querySelector('input[data-field="expiryDate"]') as HTMLInputElement;
                                            if (el) el.focus();
                                        }
                                    }}
                                    autoFocus
                                />
                                {errors.batchNumber && <p className="text-[10px] text-red-500 mt-0.5">{errors.batchNumber.message}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="text-[11px] font-medium text-slate-600">Expiry Date *</label>
                                <TypableExpiryInput
                                    value={expiryDate ? (expiryDate instanceof Date ? expiryDate.toISOString() : expiryDate as any) : ""}
                                    onChange={(dt) => setValue("expiryDate", dt as any, { shouldValidate: true })}
                                    onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, refs.packing)}
                                />
                                {errors.expiryDate && <p className="text-[10px] text-red-500 mt-0.5">{errors.expiryDate.message}</p>}
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-600">Packing</label>
                                <Input
                                    type="number"
                                    min={0}
                                    {...register("packing")}
                                    placeholder="e.g. 10"
                                    className="mt-1 h-8 text-xs bg-white"
                                    ref={(e) => {
                                        register("packing").ref(e);
                                        refs.packing.current = e;
                                    }}
                                    onChange={(e) => {
                                        const p = Number(e.target.value) || 0;
                                        setValue("packing", p);
                                        const currentStrip = Number(values.stripCount) || 0;
                                        if (p > 0 && currentStrip > 0) {
                                            setValue("quantity", p * currentStrip, { shouldValidate: true });
                                        }
                                        const currentMrp = Number(values.mrp) || 0;
                                        if (p > 0 && currentMrp > 0) {
                                            setValue("unitPrice", Number((currentMrp / p).toFixed(2)), { shouldValidate: true });
                                        }
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, refs.stripCount)}
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-600">Strip Count</label>
                                <Input
                                    type="number"
                                    min={0}
                                    {...register("stripCount")}
                                    placeholder="e.g. 10"
                                    className="mt-1 h-8 text-xs bg-white"
                                    ref={(e) => {
                                        register("stripCount").ref(e);
                                        refs.stripCount.current = e;
                                    }}
                                    onChange={(e) => {
                                        const s = Number(e.target.value) || 0;
                                        setValue("stripCount", s);
                                        const currentPacking = Number(values.packing) || 0;
                                        if (s > 0 && currentPacking > 0) {
                                            setValue("quantity", currentPacking * s, { shouldValidate: true });
                                        }
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, refs.quantity)}
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-600">
                                    Available Stock (Qty) * <span className="text-[10px] text-slate-400 font-normal">(Pack × Strip)</span>
                                </label>
                                <Input
                                    type="number"
                                    min={0}
                                    {...register("quantity")}
                                    placeholder="e.g. 100"
                                    className="mt-1 h-8 text-xs bg-white font-medium"
                                    ref={(e) => {
                                        register("quantity").ref(e);
                                        refs.quantity.current = e;
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, refs.mrp)}
                                />
                                {errors.quantity && <p className="text-[10px] text-red-500 mt-0.5">{errors.quantity.message}</p>}
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-600">MRP (₹)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    {...register("mrp")}
                                    placeholder="e.g. 50.00"
                                    className="mt-1 h-8 text-xs bg-white"
                                    ref={(e) => {
                                        register("mrp").ref(e);
                                        refs.mrp.current = e;
                                    }}
                                    onChange={(e) => {
                                        const m = Number(e.target.value) || 0;
                                        setValue("mrp", m);
                                        const p = Number(values.packing) || 1;
                                        if (p > 0) {
                                            setValue("unitPrice", Number((m / p).toFixed(2)), { shouldValidate: true });
                                        }
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, refs.unitPrice)}
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-600">Unit Price (₹)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    {...register("unitPrice")}
                                    placeholder="e.g. 5.00"
                                    className="mt-1 h-8 text-xs bg-white"
                                    ref={(e) => {
                                        register("unitPrice").ref(e);
                                        refs.unitPrice.current = e;
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, refs.purchasePrice)}
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-600">Purchase Rate (P. Rate) (₹)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    {...register("purchasePrice")}
                                    placeholder="e.g. 3.50"
                                    className="mt-1 h-8 text-xs bg-white"
                                    ref={(e) => {
                                        register("purchasePrice").ref(e);
                                        refs.purchasePrice.current = e;
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, refs.gst)}
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-600">GST (%)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    max={100}
                                    {...register("gst")}
                                    placeholder="e.g. 12"
                                    className="mt-1 h-8 text-xs bg-white"
                                    ref={(e) => {
                                        register("gst").ref(e);
                                        refs.gst.current = e;
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, refs.supplier)}
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-slate-600">Supplier *</label>
                                <Select value={watch("supplier")} onValueChange={(value) => setValue("supplier", value, { shouldValidate: true })}>
                                    <SelectTrigger
                                        className="mt-1 h-8 w-full text-xs bg-white"
                                        ref={refs.supplier}
                                        onKeyDown={(e) => handleKeyDown(e, refs.addButton)}
                                    >
                                        <SelectValue placeholder="Select Supplier" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border-slate-200">
                                        {suppliers.map((s: { _id: string; name: string }) => (
                                            <SelectItem key={s._id} value={s.name} className="text-xs">
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.supplier && <p className="text-[10px] text-red-500 mt-0.5">{errors.supplier.message}</p>}
                            </div>

                            <div className="sm:col-span-4 flex justify-end mt-1">
                                <Button type="submit" size="sm" disabled={isSubmitting} ref={refs.addButton} className="bg-(--color-synapse-light) text-white text-xs cursor-pointer h-8 px-4">
                                    {isSubmitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                                    Save Batch
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Batches Table */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-700">
                                Active & Past Batches ({sortedBatches.length})
                            </h3>
                            <span className="text-[11px] text-slate-500">
                                Total Item Stock: <strong className="text-slate-800">{item.quantity ?? sortedBatches.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0)} units</strong>
                            </span>
                        </div>
                        <div className="border rounded-xl overflow-hidden bg-white shadow-xs">
                            <Table className="text-xs">
                                <TableHeader>
                                    <TableRow className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-600">
                                        <TableHead>Batch No</TableHead>
                                        <TableHead>Expiry</TableHead>
                                        <TableHead className="text-right">Pack / Strip</TableHead>
                                        <TableHead className="text-right">Stock (Qty)</TableHead>
                                        <TableHead className="text-right">MRP</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                        <TableHead className="text-right">P. Rate</TableHead>
                                        <TableHead className="text-right">GST</TableHead>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedBatches.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="text-center py-6 text-slate-400 text-xs">
                                                No batches added yet. Add a batch above to register stock and pricing.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedBatches.map((batch, idx) => (
                                            <TableRow key={batch._id || idx} className="hover:bg-slate-50/60">
                                                <TableCell className="font-semibold text-slate-800">{batch.batchNumber}</TableCell>
                                                <TableCell className="text-slate-600">{fDate(batch.expiryDate)}</TableCell>
                                                <TableCell className="text-right text-slate-600">
                                                    {batch.packing ? `${batch.packing}` : "-"}{batch.stripCount ? ` / ${batch.stripCount}` : ""}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-emerald-700">
                                                    {batch.quantity ?? 0}
                                                </TableCell>
                                                <TableCell className="text-right text-slate-600">{batch.mrp ? formatINR(batch.mrp) : "-"}</TableCell>
                                                <TableCell className="text-right font-medium text-slate-800">{batch.unitPrice ? formatINR(batch.unitPrice) : "-"}</TableCell>
                                                <TableCell className="text-right text-slate-600">{batch.purchasePrice ? formatINR(batch.purchasePrice) : "-"}</TableCell>
                                                <TableCell className="text-right text-slate-600">{batch.gst ? `${batch.gst}%` : "0%"}</TableCell>
                                                <TableCell className="text-slate-600 truncate max-w-[120px]">{batch.supplier || "-"}</TableCell>
                                                <TableCell className="text-center">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    try {
                                                                        await api.patch(`/pharmacy/items/${item._id}/batch/${batch._id}/toggle`);
                                                                        mutate();
                                                                    } catch {
                                                                        toast.error("Failed to toggle batch status");
                                                                    }
                                                                }}
                                                                className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-all cursor-pointer ${
                                                                    batch.isActive !== false
                                                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                                                }`}
                                                            >
                                                                <Power className="w-3.5 h-3.5" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {batch.isActive !== false ? "Active — click to deactivate" : "Inactive — click to activate"}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {sortedBatches.length > ITEMS_PER_PAGE && (
                            <div className="flex items-center justify-end space-x-2 py-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className="text-xs h-7"
                                >
                                    Previous
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setCurrentPage(page);
                                        }}
                                        className="w-7 h-7 p-0 text-xs"
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="text-xs h-7"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="text-xs h-8">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
