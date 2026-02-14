import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
import { fAge, fDateandTime } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import UpdatePrescriptionCard from "./UpdatePrescriptionCard";
import useSWR from "swr";
import Link from "next/link";
import { AlertTriangle, Banknote, QrCode, AlertCircle } from "lucide-react";


interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    order: OrderType | null;
    OrderMutate: () => void;
    autoGenerateBill: boolean;
    handlePrintBill: (order: OrderType) => void;
    printingOrderId?: string | null;
}

function Barcode({ value }: { value: string }) {
    const bars = Array.from(value || "").map(
        (ch, i) => ((ch.charCodeAt(0) + i) % 7) + 2
    );
    const totalW = bars.reduce((a, b) => a + b + 1, 0);
    let x = 0;
    return (
        <svg width={totalW} height={48} className="bg-white">
            {bars.map((w, i) => {
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

    console.log(order?.patient?.allergies)

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
                {order?.patient?.allergies && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 shadow-sm">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            Allergies: <span className="text-sm normal-case font-semibold bg-yellow-100 px-2 py-0.5 rounded">{order.patient.allergies}</span>
                        </div>
                    </div>
                )}
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

export default function ViewOrder({ open, setOpen, order, OrderMutate, autoGenerateBill, handlePrintBill, printingOrderId }: Props) {
    const [localOrder, setLocalOrder] = useState<OrderType | null>(order);
    const [updatePayload, setUpdatePayload] = useState<OrderType | null>(order);
    const [openPrintConfirm, setOpenPrintConfirm] = useState(false);
    const [markingAllPacked, setMarkingAllPacked] = useState(false);
    const [updatingOrder, setUpdatingOrder] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI" | "Underpaid">("Cash");
    const [amountPaid, setAmountPaid] = useState("");
    const [referenceNumber, setReferenceNumber] = useState("");


    const { data } = useSWR<{ data: { pharmacy: { inventory: { allowNegativeStock: boolean } } } }>("/users/profile")
    const allowNegativeStock = data?.data?.pharmacy?.inventory?.allowNegativeStock

    useEffect(() => {
        setLocalOrder(order);
        setUpdatePayload(order);
    }, [order]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return;

            // Don't trigger shortcuts if user is typing in an input or textarea
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            const key = e.key.toLowerCase();
            if (key === 'c') {
                setPaymentMethod("Cash");
            } else if (key === 'u') {
                setPaymentMethod("UPI");
            } else if (key === 'p') {
                setPaymentMethod("Underpaid");
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open]);

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
            patient: localOrder.patient._id,
            doctor: localOrder.doctor._id,
        };
        try {
            setUpdatingOrder(true);
            const res = await toast.promise(api.patch(`pharmacy/orders/update`, payload), {
                loading: "Updating...",
                success: "Updated successfully",
                error: "Failed to update",
            });
            setLocalOrder(updatePayload);
            OrderMutate();
        } catch (error) {
            toast.error("Failed to update: " + error);
        } finally {
            setUpdatingOrder(false);
        }
    };


    const markAllPacked = async () => {
        if (!localOrder) return;
        if (checkIsDirty()) {
            // toast.error("Please update the order to save changes before packing.");
            // return;
            await handleUpdate()
        }
        try {
            setMarkingAllPacked(true);
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
                        items: prev.items.map((it) => ({ ...it, isPacked: true })),
                    }
                    : null;
                setUpdatePayload(updated);
                return updated;
            });
            OrderMutate();
        } catch (error) {
            console.log(error);
        } finally {
            setMarkingAllPacked(false);
        }
    };

    const handleTogglePacked = async (it: any) => {
        if (checkIsDirty()) {
            // toast.error("Please update the order to save changes before packing.");
            // return;
            await handleUpdate()
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
                        items: prev.items.map((i) =>
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
                        allergies={order?.patient.allergies}
                    />

                    {/* Payment Details Section */}
                    <div className="border rounded-xl p-5 bg-slate-50/50 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Payment Details</h3>
                            <div className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border">
                                Total Amount: <span className="text-slate-900 font-bold">{formatINR(updatePayload?.items.reduce((acc, it) => acc + (it.name.unitPrice * it.quantity), 0) || 0)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { id: "Cash", label: "Cash Payment", icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50", shortcut: "C" },
                                { id: "UPI", label: "UPI / Scanner", icon: QrCode, color: "text-indigo-600", bg: "bg-indigo-50", shortcut: "U" },
                                { id: "Underpaid", label: "Partial / Due", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", shortcut: "P" },
                            ].map((method) => {
                                const active = paymentMethod === method.id;
                                return (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(method.id as any)}
                                        className={cn(
                                            "relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left group",
                                            active
                                                ? `border-${method.id === "Cash" ? "emerald" : method.id === "UPI" ? "indigo" : "rose"}-500 ${method.bg} shadow-md`
                                                : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                                        )}
                                    >
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <kbd className={cn(
                                                "px-1.5 py-0.5 text-[9px] font-bold rounded shadow-xs border",
                                                method.id === "Cash" && "bg-emerald-50 border-emerald-200 text-emerald-600",
                                                method.id === "UPI" && "bg-indigo-50 border-indigo-200 text-indigo-600",
                                                method.id === "Underpaid" && "bg-rose-50 border-rose-200 text-rose-600"
                                            )}>
                                                {method.shortcut}
                                            </kbd>
                                        </div>
                                        <div className={cn("p-2 rounded-lg", active ? "bg-white" : "bg-slate-50 group-hover:bg-white")}>
                                            <method.icon className={cn("h-5 w-5", active ? method.color : "text-slate-400")} />
                                        </div>
                                        <div>
                                            <div className={cn("text-sm font-bold", active ? "text-slate-900" : "text-slate-600")}>{method.label}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">Click to select</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {paymentMethod === "Cash" && (
                            <div
                                className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                            >
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Amount Collected (₹)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Enter amount from customer"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value)}
                                        className="h-11 bg-white border-slate-200 rounded-lg focus:ring-emerald-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Balance to Return (₹)</Label>
                                    <div className={cn(
                                        "h-11 flex items-center px-4 rounded-lg border-2 font-bold text-lg transition-colors",
                                        (Number(amountPaid) - (updatePayload?.items.reduce((acc, it) => acc + (it.name.unitPrice * it.quantity), 0) || 0)) >= 0
                                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                            : "bg-rose-50 border-rose-100 text-rose-700"
                                    )}>
                                        {formatINR(Math.max(0, Number(amountPaid) - (updatePayload?.items.reduce((acc, it) => acc + (it.name.unitPrice * it.quantity), 0) || 0)))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {paymentMethod === "Underpaid" && (
                            <div
                                className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                            >
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Amount Collected (₹)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value)}
                                        className="h-11 bg-white border-slate-200 rounded-lg focus:ring-rose-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Reference / Bill No.</Label>
                                    <Input
                                        placeholder="Enter reference if any"
                                        value={referenceNumber}
                                        onChange={(e) => setReferenceNumber(e.target.value)}
                                        className="h-11 bg-white border-slate-200 rounded-lg focus:ring-rose-500/20"
                                    />
                                </div>
                            </div>
                        )}

                        {paymentMethod === "UPI" && (
                            <div className="space-y-2 pt-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Transaction ID / Reference (Optional)</Label>
                                <Input
                                    placeholder="Enter UPI transaction ID"
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    className="h-11 bg-white border-slate-200 rounded-lg focus:ring-indigo-500/20"
                                />
                            </div>
                        )}
                    </div>

                </div>


                <div className="bg-white border-t pt-4 mt-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
                    <div className="text-sm">

                    </div>

                    <div className="flex items-center gap-2">
                        {localOrder.status !== "Completed" && localOrder.status !== "Ready" && <Button
                            disabled={updatingOrder}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={handleUpdate}
                        >
                            {updatingOrder ? "Updating..." : "Update Order"}
                        </Button>}
                        {localOrder.status !== "Completed" && localOrder.status !== "Ready" && <Button
                            disabled={markingAllPacked}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={markAllPacked}
                        >
                            {markingAllPacked ? "Marking..." : "Mark all packed"}
                        </Button>}
                        {
                            autoGenerateBill ?
                                <Button
                                    variant="outline"
                                    disabled={!!printingOrderId}
                                    onClick={() => handlePrintBill(localOrder)}
                                >
                                    {printingOrderId === localOrder._id ? "Printing..." : "Print"}
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
                        {localOrder.status !== "Completed" && <Button onClick={async () => {
                            try {
                                if (localOrder.status !== "Ready") {
                                    await markAllPacked();
                                }
                                await toast.promise(api.patch(`/pharmacy/orders/complete/${localOrder._id}`), {
                                    loading: "Completing...",
                                    success: (data) => {
                                        OrderMutate();
                                        return data.data.message;
                                    },
                                    error: ({ response: { data } }) => {
                                        return data.message;
                                    }
                                })
                                handlePrintBill(localOrder)
                            } catch (error) {
                                console.log(error);
                            }
                        }}>Complete Order</Button>}

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
