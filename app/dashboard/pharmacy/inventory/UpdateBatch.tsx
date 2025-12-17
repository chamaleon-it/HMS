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
import { fDate } from "@/lib/fDateAndTime"
import { formatINR } from "@/lib/fNumber"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDownIcon, Loader2 } from "lucide-react"
import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"
import { ItemType } from './interface'

// Schema for adding a batch
const addBatchSchema = z.object({
    batchNumber: z.string().min(1, "Batch number is required"),
    expiryDate: z.date(),
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

    const expiryDate = watch("expiryDate");




    const onSubmit = handleSubmit(async (data) => {
        try {
            await api.post(`/pharmacy/items/add_batch/${item._id}`, data);
            toast.success("Batch added successfully");
            reset({
                supplier: item.supplier
            });
            mutate();
        } catch (error) {
            console.error(error);
            toast.error("Failed to add batch");
        }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="secondary">Update Batch</Button>
            </DialogTrigger>
            <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
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
                                />
                                {errors.batchNumber && <p className="text-xs text-red-500 mt-1">{errors.batchNumber.message}</p>}
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">Expiry Date *</label>
                                <Popover open={openCalander} onOpenChange={setOpenCalander}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between font-normal mt-1 h-9"
                                        >
                                            {expiryDate ? fDate(expiryDate) : "Select date"}
                                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                        startMonth={new Date(2025,0)}
              endMonth={new Date(2030,0)}
              captionLayout="dropdown"
                                            mode="single"
                                            selected={expiryDate}
                                            onSelect={(date) => {
                                                if (date) setValue("expiryDate", date);
                                                setOpenCalander(false);
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.expiryDate && <p className="text-xs text-red-500 mt-1">{errors.expiryDate.message}</p>}
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600">Quantity *</label>
                                <Input
                                    type="number"
                                    {...register("quantity")}
                                    placeholder="e.g. 100"
                                    className="mt-1 h-9"
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
                                />
                                {errors.purchasePrice && <p className="text-xs text-red-500 mt-1">{errors.purchasePrice.message}</p>}
                            </div>

                            <div className="col-span-2">
                                <label className="text-xs font-medium text-gray-600">Supplier</label>
                                <Input
                                    {...register("supplier")}
                                    placeholder="e.g. ABC Pharma"
                                    className="mt-1 h-9"
                                />
                            </div>

                            <div className="col-span-2 flex justify-end mt-2">
                                <Button type="submit" size="sm" disabled={isSubmitting}>
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
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {item?.batches?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">
                                                No batch history found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        item?.batches?.map((batch) => (
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
