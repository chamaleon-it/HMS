"use client";

import { Button } from '@/components/ui/button'
import { Calendar } from "@/components/ui/calendar"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import api from "@/lib/axios"
import useSWR from 'swr'
import { fDate } from "@/lib/fDateAndTime"
import { formatINR } from "@/lib/fNumber"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDownIcon, Loader2, PackagePlus, Pencil, Trash2, PowerOff, CheckCircle2 } from "lucide-react"
import React, { useEffect, useRef, useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"
import { BatchType, ItemType } from './interface'
import TypableExpiryInput from '../purchase-entry/components/TypableExpiryInput';
import { EditBatchModal } from './EditBatchModal';

// Schema for adding a batch
const addBatchSchema = z.object({
    batchNumber: z.string().min(1, "Batch number is required"),
    pack: z.coerce.number().min(1, "Pack must be at least 1"),
    noOfPack: z.coerce.number().min(0, "Qty must be non-negative"),
    mrp: z.coerce.number().min(0, "MRP must be positive"),
    expiryDate: z.coerce.date(),
    purchasePrice: z.coerce.number().min(0, "Price must be positive"),
    free: z.coerce.number().min(0).default(0),
    schemaAmt: z.coerce.number().min(0).default(0),
    quantity: z.coerce.number().min(1, "Total units must be at least 1"),
    total: z.coerce.number().min(0).default(0),
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
    const [editingBatch, setEditingBatch] = useState<BatchType | null>(null);

    const initialPack = item.packing || 10;
    const initialMrp = item.mrp || item.unitPrice || 0;
    const initialPrice = item.purchasePrice || 0;

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
            pack: initialPack,
            noOfPack: 1,
            mrp: initialMrp,
            purchasePrice: initialPrice,
            free: 0,
            schemaAmt: 0,
            quantity: initialPack,
            total: initialPrice,
            supplier: item.supplier || "-"
        }
    });

    const { data: suppliersData } = useSWR<{ message: string; data: { _id: string; name: string }[] }>("/suppliers/get_id_and_name");
    const suppliers = suppliersData?.data || [];

    const expiryDate = watch("expiryDate");
    const watchedPack = watch("pack");
    const watchedNoOfPack = watch("noOfPack");
    const watchedFree = watch("free");
    const watchedPurchasePrice = watch("purchasePrice");

    useEffect(() => {
        const p = Number(watchedPack) || 0;
        const q = Number(watchedNoOfPack) || 0;
        const f = Number(watchedFree) || 0;
        const r = Number(watchedPurchasePrice) || 0;

        const units = (q + f) * p;
        const sAmt = Number((r * f).toFixed(2));
        const tot = Number(((q * r) + sAmt).toFixed(2));

        setValue("quantity", units > 0 ? units : (q + f), { shouldValidate: true });
        setValue("schemaAmt", sAmt);
        setValue("total", tot);
    }, [watchedPack, watchedNoOfPack, watchedFree, watchedPurchasePrice, setValue]);

    const refs = {
        batchNumber: useRef<HTMLInputElement>(null),
        pack: useRef<HTMLInputElement>(null),
        noOfPack: useRef<HTMLInputElement>(null),
        mrp: useRef<HTMLInputElement>(null),
        expiryDate: useRef<HTMLButtonElement>(null),
        purchasePrice: useRef<HTMLInputElement>(null),
        free: useRef<HTMLInputElement>(null),
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
                pack: initialPack,
                noOfPack: 1,
                mrp: initialMrp,
                purchasePrice: initialPrice,
                free: 0,
                schemaAmt: 0,
                quantity: initialPack,
                total: initialPrice,
                supplier: item.supplier || "-"
            });
            mutate();
            refs.batchNumber.current?.focus();
        } catch (error) {
            console.error(error);
            toast.error("Failed to add batch");
        }
    });

    const ITEMS_PER_PAGE = 5;
    const [togglingBatchId, setTogglingBatchId] = useState<string | null>(null);
    const handleToggleBatchStatus = async (batchId?: string, currentIsActive: boolean = true) => {
        if (!batchId) return;
        setTogglingBatchId(batchId);
        const nextStatus = !currentIsActive;
        try {
            await api.patch(`/pharmacy/items/${item._id}/batches/${batchId}/status`, {
                status: nextStatus ? "Active" : "Inactive",
            });
            toast.success(nextStatus ? "Batch activated successfully" : "Batch marked as inactive");
            if (mutate) mutate();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update batch status");
        } finally {
            setTogglingBatchId(null);
        }
    };

    const sortedBatches = item?.batches
        ? [...item.batches]
            .filter((b: any) => !b.isDeleted)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];
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
                            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                            <PackagePlus className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Update Batch</TooltipContent>
            </Tooltip>
            <DialogContent className="max-w-4xl! max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Update Batch for {item.name}</DialogTitle>
                    <DialogDescription>
                        Add a new batch or view past batches.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Add Batch Form */}
                    <div className="rounded-lg border p-4 bg-slate-50">
                        <h3 className="font-semibold text-sm mb-4 text-gray-800">Add New Batch</h3>
                        <form onSubmit={onSubmit} className="grid grid-cols-4 gap-4">
                            {/* Row 1 */}
                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">Batch Number *</label>
                                <Input
                                    {...register("batchNumber")}
                                    placeholder="e.g. BATCH001"
                                    className="mt-1 h-9 text-xs"
                                    ref={(e) => {
                                        register("batchNumber").ref(e);
                                        refs.batchNumber.current = e;
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, refs.pack)}
                                    autoFocus
                                />
                                {errors.batchNumber && <p className="text-[11px] text-red-500 mt-0.5">{errors.batchNumber.message}</p>}
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">Pack *</label>
                                <Input
                                    type="number"
                                    {...register("pack")}
                                    placeholder="e.g. 10"
                                    className="mt-1 h-9 text-xs"
                                    ref={(e) => {
                                        register("pack").ref(e);
                                        refs.pack.current = e;
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, refs.noOfPack)}
                                />
                                {errors.pack && <p className="text-[11px] text-red-500 mt-0.5">{errors.pack.message}</p>}
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">QTY (Packs) *</label>
                                <Input
                                    type="number"
                                    {...register("noOfPack")}
                                    placeholder="e.g. 5"
                                    className="mt-1 h-9 text-xs"
                                    ref={(e) => {
                                        register("noOfPack").ref(e);
                                        refs.noOfPack.current = e;
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, refs.mrp)}
                                />
                                {errors.noOfPack && <p className="text-[11px] text-red-500 mt-0.5">{errors.noOfPack.message}</p>}
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">MRP (₹) *</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register("mrp")}
                                    placeholder="e.g. 120.00"
                                    className="mt-1 h-9 text-xs"
                                    ref={(e) => {
                                        register("mrp").ref(e);
                                        refs.mrp.current = e;
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, refs.purchasePrice)}
                                />
                                {errors.mrp && <p className="text-[11px] text-red-500 mt-0.5">{errors.mrp.message}</p>}
                            </div>

                            {/* Row 2 */}
                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">Expiry Date *</label>
                                <TypableExpiryInput
                                    value={expiryDate ? (expiryDate instanceof Date ? expiryDate.toISOString() : expiryDate as any) : ""}
                                    onChange={(dt) => setValue("expiryDate", dt as any, { shouldValidate: true })}
                                    onKeyDown={(e) => handleKeyDown(e, refs.purchasePrice)}
                                />
                                {errors.expiryDate && <p className="text-[11px] text-red-500 mt-0.5">{errors.expiryDate.message}</p>}
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">Purchase Rate (₹) *</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register("purchasePrice")}
                                    placeholder="e.g. 100.00"
                                    className="mt-1 h-9 text-xs"
                                    ref={(e) => {
                                        register("purchasePrice").ref(e);
                                        refs.purchasePrice.current = e;
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, refs.free)}
                                />
                                {errors.purchasePrice && <p className="text-[11px] text-red-500 mt-0.5">{errors.purchasePrice.message}</p>}
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">Schema (Free)</label>
                                <Input
                                    type="number"
                                    {...register("free")}
                                    placeholder="e.g. 0"
                                    className="mt-1 h-9 text-xs"
                                    ref={(e) => {
                                        register("free").ref(e);
                                        refs.free.current = e;
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, refs.supplier)}
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">Schema Amt (₹)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register("schemaAmt")}
                                    readOnly
                                    className="mt-1 h-9 text-xs bg-slate-100 font-semibold text-slate-700"
                                />
                            </div>

                            {/* Row 3 */}
                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">Units (Total Qty)</label>
                                <Input
                                    type="number"
                                    {...register("quantity")}
                                    readOnly
                                    className="mt-1 h-9 text-xs bg-indigo-50 font-bold text-indigo-700"
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">Total (₹)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register("total")}
                                    readOnly
                                    className="mt-1 h-9 text-xs bg-slate-100 font-bold text-slate-900"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="text-xs font-medium text-gray-600">Supplier</label>
                                <Select value={watch("supplier")} onValueChange={(value) => setValue("supplier", value)}>
                                    <SelectTrigger
                                        className="mt-1 h-9 w-full text-xs"
                                        ref={refs.supplier}
                                        onKeyDown={(e) => handleKeyDown(e, refs.addButton)}
                                    >
                                        <SelectValue placeholder="Select Supplier" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border-slate-200">
                                        {suppliers.map((s: { _id: string; name: string }) => (
                                            <SelectItem key={s._id} value={s.name} className="rounded-md text-xs focus:bg-indigo-50">
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-4 flex justify-end mt-2">
                                <Button type="submit" size="sm" disabled={isSubmitting} ref={refs.addButton}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Add Batch
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Past Batches Table */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3 text-gray-800">Past Batches</h3>
                        <div className="border rounded-md overflow-hidden">
                            <Table className="whitespace-nowrap w-full min-w-[1100px]">
                                <TableHeader>
                                    <TableRow className="bg-slate-700 hover:bg-slate-700">
                                        <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3 pl-4">BATCH</TableHead>
                                        <TableHead className="text-center text-white font-bold text-[11px] uppercase tracking-wider py-3">PACK</TableHead>
                                        <TableHead className="text-center text-white font-bold text-[11px] uppercase tracking-wider py-3">QTY</TableHead>
                                        <TableHead className="text-center text-white font-bold text-[11px] uppercase tracking-wider py-3">MRP</TableHead>
                                        <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3">EXPIRY</TableHead>
                                        <TableHead className="text-center text-white font-bold text-[11px] uppercase tracking-wider py-3">Rate</TableHead>
                                        <TableHead className="text-center text-white font-bold text-[11px] uppercase tracking-wider py-3">SCHEMA (FREE)</TableHead>
                                        <TableHead className="text-center text-white font-bold text-[11px] uppercase tracking-wider py-3">SCHEMA AMT</TableHead>
                                         <TableHead className="text-center text-white font-bold text-[11px] uppercase tracking-wider py-3">Units</TableHead>
                                        <TableHead className="text-right text-white font-bold text-[11px] uppercase tracking-wider py-3 pr-4">TOTAL</TableHead>
                                        <TableHead className="text-center text-white font-bold text-[11px] uppercase tracking-wider py-3 pr-3">ACTION</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedBatches.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={11} className="text-center py-6 text-muted-foreground text-xs">
                                                No batch history found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedBatches.map((batch: any) => {
                                            const isBatchItemActive = Boolean(!batch.isDeleted && batch.isActive !== false && batch.status !== "Inactive");
                                            const isTogglingThis = togglingBatchId === batch._id;
                                            const pack = batch.pack || item.packing || 0;
                                            const units = batch.quantity || 0;
                                            const free = batch.free || 0;
                                            const noOfPack = batch.noOfPack ?? (pack > 0 ? Math.max(0, Math.floor(units / pack) - free) : 0);
                                            const mrp = batch.mrp ?? item.mrp ?? item.unitPrice ?? 0;
                                            const rate = batch.purchasePrice || 0;
                                            const schemaAmt = batch.schemaAmt ?? (free * rate);
                                            const total = batch.total ?? (noOfPack > 0 ? (noOfPack * rate + schemaAmt) : (units * rate));

                                            return (
                                                <TableRow
                                                    key={batch._id}
                                                    className={cn(
                                                        !isBatchItemActive && "bg-red-50/70! hover:bg-red-100/60! border-l-2 border-l-red-500 text-red-950"
                                                    )}
                                                >
                                                    <TableCell className="py-2.5 pl-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={cn(
                                                                "font-mono text-[11px] rounded px-2 py-0.5 shadow-xs border",
                                                                !isBatchItemActive
                                                                    ? "bg-red-100/80 border-red-200 text-red-700"
                                                                    : "bg-white border-slate-200 text-slate-600"
                                                            )}>
                                                                {batch.batchNumber}
                                                            </span>
                                                            {!isBatchItemActive && (
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-100 border border-red-200 rounded-full px-1.5 py-0.5">Inactive</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center text-xs py-2.5 text-slate-600 font-medium">{pack}</TableCell>
                                                    <TableCell className="text-center text-xs py-2.5 text-slate-600 font-medium">{noOfPack}</TableCell>
                                                    <TableCell className="text-center text-xs py-2.5 text-slate-900 font-bold tabular-nums">{formatINR(mrp)}</TableCell>
                                                    <TableCell className="text-xs py-2.5 text-slate-600 font-medium">{fDate(batch.expiryDate)}</TableCell>
                                                    <TableCell className="text-center text-xs py-2.5 text-slate-900 font-bold tabular-nums">{formatINR(rate)}</TableCell>
                                                    <TableCell className="text-center text-xs py-2.5 text-slate-600 font-medium">{free}</TableCell>
                                                    <TableCell className="text-center text-xs py-2.5 text-slate-900 font-bold tabular-nums">{formatINR(schemaAmt)}</TableCell>
                                                    <TableCell className={cn(
                                                        "text-center text-xs py-2.5 font-bold tabular-nums",
                                                        !isBatchItemActive
                                                            ? "text-red-600 bg-red-100/40"
                                                            : "text-indigo-600 bg-indigo-50/20"
                                                    )}>{units}</TableCell>
                                                    <TableCell className="text-right text-xs py-2.5 font-bold text-slate-900 pr-4 tabular-nums">{formatINR(total)}</TableCell>
                                                    <TableCell className="text-center py-2.5 pr-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => setEditingBatch(batch)}
                                                                className="h-7 w-7 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg cursor-pointer"
                                                                title="Edit Batch"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </Button>

                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        disabled={isTogglingThis}
                                                                        className={cn(
                                                                            "h-7 w-7 rounded-lg cursor-pointer transition-colors",
                                                                            isBatchItemActive
                                                                                ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                                : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                                                                        )}
                                                                        title={isBatchItemActive ? "Deactivate Batch" : "Activate Batch"}
                                                                    >
                                                                        {isBatchItemActive ? (
                                                                            <PowerOff className="w-3.5 h-3.5" />
                                                                        ) : (
                                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                                        )}
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="max-w-sm! rounded-xl">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>
                                                                            {isBatchItemActive ? "Deactivate Batch?" : "Activate Batch?"}
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            {isBatchItemActive ? (
                                                                                <>
                                                                                    Are you sure you want to mark batch{" "}
                                                                                    <span className="font-semibold text-slate-900 font-mono">
                                                                                        {batch.batchNumber}
                                                                                    </span>{" "}
                                                                                    as inactive? Its {units} units will be excluded from available inventory count and billing.
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    Are you sure you want to activate batch{" "}
                                                                                    <span className="font-semibold text-slate-900 font-mono">
                                                                                        {batch.batchNumber}
                                                                                    </span>
                                                                                    ? Its {units} units will be included in available inventory count and billing.
                                                                                </>
                                                                            )}
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleToggleBatchStatus(batch._id, isBatchItemActive)}
                                                                            className={cn(
                                                                                "rounded-lg text-white",
                                                                                isBatchItemActive
                                                                                    ? "bg-red-600 hover:bg-red-700"
                                                                                    : "bg-emerald-600 hover:bg-emerald-700"
                                                                            )}
                                                                        >
                                                                            {isBatchItemActive ? "Deactivate" : "Activate"}
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {sortedBatches.length > ITEMS_PER_PAGE && (
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
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
                                        className="w-8 h-8 p-0"
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
            {editingBatch && (
                <EditBatchModal
                    item={item}
                    batch={editingBatch}
                    isOpen={!!editingBatch}
                    onClose={() => setEditingBatch(null)}
                    mutate={mutate}
                />
            )}
        </Dialog>
    )
}
