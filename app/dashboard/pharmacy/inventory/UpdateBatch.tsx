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
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDownIcon, Loader2, PackagePlus } from "lucide-react"
import React, { useRef, useState } from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"
import { ItemType } from './interface'
import TypableExpiryInput from "../suppliers/purchase-entry/components/TypableExpiryInput"

// Schema for adding a batch
const addBatchSchema = z.object({
    batchNumber: z.string().min(1, "Batch number is required"),
    expiryDate: z.coerce.date(),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    purchasePrice: z.coerce.number().min(0, "Price must be positive"),
    supplier: z.string().min(1, "Supplier is required"),
});

type AddBatchFormValues = z.infer<typeof addBatchSchema>;

interface Props {
    item: ItemType;
    mutate: () => void;
}


export default function UpdateBatch({ item, mutate }: Props) {
    const [open, setOpen] = useState(false);
    const [openCalander, setOpenCalander] = useState(false);
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
            supplier: item.supplier
        }
    });

    const { data: suppliersData } = useSWR<{ message: string; data: { _id: string; name: string }[] }>("/suppliers/get_id_and_name");
    const suppliers = suppliersData?.data || [];

    const expiryDate = watch("expiryDate");

    // Refs for keyboard navigation
    const refs = {
        batchNumber: useRef<HTMLInputElement>(null),
        expiryDate: useRef<HTMLButtonElement>(null),
        quantity: useRef<HTMLInputElement>(null),
        purchasePrice: useRef<HTMLInputElement>(null),
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
                supplier: item.supplier
            });
            mutate();
            // Focus back on first field for next entry
            refs.batchNumber.current?.focus();
        } catch (error) {
            console.error(error);
            toast.error("Failed to add batch");
        }
    });

    const ITEMS_PER_PAGE = 5;
    const sortedBatches = item?.batches ? [...item.batches].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
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
                        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">Batch Number *</label>
                                <Input
                                    {...register("batchNumber")}
                                    placeholder="e.g. BATCH001"
                                    className="mt-1 h-9"
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
                                {errors.batchNumber && <p className="text-xs text-red-500 mt-1">{errors.batchNumber.message}</p>}
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">Expiry Date *</label>
                                <TypableExpiryInput
                                    value={expiryDate ? (expiryDate instanceof Date ? expiryDate.toISOString() : expiryDate as any) : ""}
                                    onChange={(dt) => setValue("expiryDate", dt as any, { shouldValidate: true })}
                                    onKeyDown={(e) => handleKeyDown(e, refs.quantity)}
                                />
                                {errors.expiryDate && <p className="text-xs text-red-500 mt-1">{errors.expiryDate.message}</p>}
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">Quantity *</label>
                                <Input
                                    type="number"
                                    {...register("quantity")}
                                    placeholder="e.g. 100"
                                    className="mt-1 h-9"
                                    ref={(e) => {
                                        register("quantity").ref(e);
                                        refs.quantity.current = e;
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, refs.purchasePrice)}
                                />
                                {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">Purchase Price (₹) *</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register("purchasePrice")}
                                    placeholder="e.g. 10.50"
                                    className="mt-1 h-9"
                                    ref={(e) => {
                                        register("purchasePrice").ref(e);
                                        refs.purchasePrice.current = e;
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, refs.supplier)}
                                />
                                {errors.purchasePrice && <p className="text-xs text-red-500 mt-1">{errors.purchasePrice.message}</p>}
                            </div>

                            <div className="col-span-2">
                                <label className="text-xs font-medium text-gray-600">Supplier</label>
                                <Select value={watch("supplier")} onValueChange={(value) => setValue("supplier", value)}>
                                    <SelectTrigger
                                        className="mt-1 h-9 w-full"
                                        ref={refs.supplier}
                                        onKeyDown={(e) => handleKeyDown(e, refs.addButton)}
                                    >
                                        <SelectValue placeholder="Select Supplier" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border-slate-200">
                                        {suppliers.map((s: { _id: string; name: string }) => (
                                            <SelectItem key={s._id} value={s.name} className="rounded-md focus:bg-indigo-50">
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-2 flex justify-end mt-2">
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
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="w-[120px]">Date Added</TableHead>
                                        <TableHead>Batch No</TableHead>
                                        <TableHead>Expiry</TableHead>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead className="text-right">P Price</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedBatches.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">
                                                No batch history found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedBatches.map((batch) => (
                                            <TableRow key={batch._id}>
                                                <TableCell className="text-xs">{fDate(batch.createdAt)}</TableCell>
                                                <TableCell className="font-medium text-xs">{batch.batchNumber}</TableCell>
                                                <TableCell className="text-xs">{fDate(batch.expiryDate)}</TableCell>
                                                <TableCell className="text-xs">{batch.supplier || "-"}</TableCell>
                                                <TableCell className="text-right text-xs">{formatINR(batch.purchasePrice)}</TableCell>
                                                <TableCell className="text-right text-xs font-medium">{batch.quantity}</TableCell>
                                            </TableRow>
                                        ))
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
        </Dialog>
    )
}
