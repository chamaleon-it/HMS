import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { OrderType } from "./interface";
import { fAge, fDate, fDateandTime } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import UpdatePrescriptionCard from "./UpdatePrescriptionCard";
import useSWR from "swr";
import Link from "next/link";

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    order: OrderType | null;
    OrderMutate: () => void;
    autoGenerateBill: boolean;
    handlePrintBill: (mrn: string) => void;
}

function Barcode({ value }: { value: string }) {
    const bars = Array.from(value || "")?.map(
        (ch, i) => ((ch.charCodeAt(0) + i) % 7) + 2
    );
    const totalW = bars.reduce((a, b) => a + b + 1, 0);
    let x = 0;
    return (
        <svg width={totalW} height={48} className="bg-white">
            {bars?.map((w, i) => {
                const rect = (
                    <rect key={i} x={x} y={0} width={w} height={48} fill="#000" />
                );
                x += w + 1;
                return rect;
            })}
        </svg>
    );
}

function OrderHeader({ order }: { order: OrderType }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start mb-4">
            {/* Patient card */}
            <div className="border rounded-lg p-3 md:col-span-2">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                    Patient
                </div>
                <div className="font-semibold text-lg flex items-center gap-1">
                    <p>{order?.patient?.name}</p> -{" "}
                    <span className="text-sm">({order?.patient?.mrn})</span>
                </div>
                <div className="text-sm text-slate-700">
                    Age/Gender: {fAge(order?.patient?.dateOfBirth)} /{" "}
                    {order?.patient?.gender} • Ph:
                    {order?.patient?.phoneNumber}
                </div>
                <div className="text-sm text-slate-700">
                    Address: {order?.patient?.address}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                    Doctor: {order?.doctor?.name} • Specialization:{" "}
                    {order?.doctor?.specialization}
                </div>
            </div>

            {/* Bill card */}
            <div className="border rounded-lg p-3 flex items-center justify-between">
                <div>
                    <div className="text-xs text-slate-600">
                        Date:{" "}
                        <span className="font-medium">
                            {fDateandTime(order?.createdAt)}
                        </span>
                    </div>
                    <div className="text-xs text-slate-600">
                        RX ID: <span className="font-medium">{order?.mrn}</span>
                    </div>
                </div>
                <div className="ml-3 bg-white p-1 rounded border">
                    <Barcode value={order?.mrn ?? ""} />
                </div>
            </div>
        </div>
    );
}

export default function ViewOrder({ open, setOpen, order, OrderMutate, autoGenerateBill, handlePrintBill }: Props) {
    const [localOrder, setLocalOrder] = useState<OrderType | null>(order);
    const [updatePayload, setUpdatePayload] = useState<OrderType | null>(order);
    const [openPrintConfirm, setOpenPrintConfirm] = useState(false);

    const { data } = useSWR<{ data: { pharmacy: { inventory: { allowNegativeStock: boolean } } } }>("/users/profile")
    const allowNegativeStock = data?.data?.pharmacy?.inventory?.allowNegativeStock

    useEffect(() => {
        setLocalOrder(order);
        setUpdatePayload(order);
    }, [order]);

    const checkIsDirty = () => {
        if (!localOrder || !updatePayload) return false;
        if (localOrder.items.length !== updatePayload.items.length) return true;
        for (let i = 0; i < localOrder.items.length; i++) {
            const l = localOrder.items[i];
            const u = updatePayload.items[i];
            if (l.name._id !== u.name._id) return true;
            if (l.quantity !== u.quantity) return true;
        }
        return false;
    };

    const markAllPacked = async () => {
        if (!localOrder) return;
        if (checkIsDirty()) {
            toast.error("Please update the order to save changes before packing.");
            return;
        }
        try {
            await toast.promise(
                api.post("/pharmacy/orders/mark_all_as_packed", {
                    order: localOrder._id,
                }),
                {
                    loading: "Marking all items as packed...",
                    error: ({ response }) => response.data.message,
                    success: ({ data }) => data.message,
                }
            );
            setLocalOrder((prev) => {
                const updated = prev
                    ? {
                        ...prev,
                        items: prev.items?.map((it) => ({ ...it, isPacked: true })),
                    }
                    : null;
                setUpdatePayload(updated);
                return updated;
            });
            OrderMutate();
        } catch (error) {
            console.log(error);
        }
    };

    const handleUpdate = async () => {
        if (!updatePayload || !localOrder) return;

        let hasZeroQuantity = false;
        updatePayload.items.forEach((m) => {
            if (m.quantity === 0) {
                hasZeroQuantity = true;
            }
        });

        if (hasZeroQuantity) {
            toast.error("Quantity cannot be 0");
            return;
        }

        const payload = {
            ...updatePayload,
            patient: localOrder?.patient?._id,
            doctor: localOrder.doctor._id,
        };
        try {
            const res = await toast.promise(api.patch(`pharmacy/orders/update`, payload), {
                loading: "Updating...",
                success: "Updated successfully",
                error: "Failed to update",
            });
            setLocalOrder(updatePayload);
            OrderMutate();
        } catch (error) {
            toast.error("Failed to update: " + error);
        }
    };

    const handleTogglePacked = async (it: any) => {
        if (checkIsDirty()) {
            toast.error("Please update the order to save changes before packing.");
            return;
        }
        try {
            if (it.isPacked) {
                toast.error("This item is already packed");
                return;
            }
            if (!allowNegativeStock) {
                if (it.quantity > it.name.quantity) {
                    toast.error(
                        `Requested quantity ${it.quantity} for ${it.name.name} is not available. Only ${it.name.quantity} are in stock.`
                    );
                    return;
                }
            }
            await toast.promise(
                api.post("/pharmacy/orders/packed", {
                    order: localOrder?._id,
                    item: it.name._id,
                }),
                {
                    loading: "Item is packing...",
                    error: ({ response }) => response.data.message,
                    success: ({ data }) => data.message,
                }
            );
            OrderMutate();

            // Sync both states
            const syncState = (prev: OrderType | null) =>
                prev
                    ? {
                        ...prev,
                        items: prev.items?.map((i) =>
                            i.name._id === it.name._id
                                ? { ...i, isPacked: true }
                                : i
                        ),
                    }
                    : null;

            setLocalOrder(syncState);
            setUpdatePayload(syncState);

        } catch (error) {
            console.log(error);
        }
    };

    if (!localOrder || !updatePayload) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-[98vw]! max-w-7xl! h-[90vh] flex flex-col print:hidden">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center justify-between pr-8">
                        <span>Order — {localOrder.mrn}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto flex flex-col gap-4">
                    <OrderHeader order={localOrder} />

                    <UpdatePrescriptionCard
                        setData={setUpdatePayload as React.Dispatch<React.SetStateAction<OrderType>>}
                        data={updatePayload}
                        onTogglePacked={handleTogglePacked}
                    />
                </div>

                {/* Footer Actions */}
                <div className="bg-white border-t pt-4 mt-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
                    <div className="text-sm">
                        Packed:{" "}
                        <span className="font-medium text-slate-700">
                            In progress
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={markAllPacked}
                        >
                            Mark all packed
                        </Button>
                        {
                            autoGenerateBill ?
                                <Button
                                    variant="outline"
                                    onClick={() => handlePrintBill(localOrder.mrn)}
                                >
                                    Print
                                </Button>
                                : <Button
                                    variant="outline"
                                    asChild
                                >
                                    <Link href={`/dashboard/pharmacy/billing?mrn=${localOrder.mrn}#new`}>
                                        Print
                                    </Link>
                                </Button>
                        }

                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={handleUpdate}
                        >
                            Update Order
                        </Button>
                    </div>
                </div>

                <AlertDialog open={openPrintConfirm} onOpenChange={setOpenPrintConfirm}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will print the prescription details for this order.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => window.print?.()}>
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DialogContent>
        </Dialog>
    );
}
