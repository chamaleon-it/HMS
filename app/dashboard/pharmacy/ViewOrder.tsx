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
import { fAge, fDateandTime, fAgeString } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import UpdatePrescriptionCard from "./UpdatePrescriptionCard";
import useSWR from "swr";
import Link from "next/link";
import { AlertTriangle, Banknote, QrCode, AlertCircle, IndianRupee, Activity } from "lucide-react";


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

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
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
                    Age/Gender: {fAgeString(order?.patient?.dateOfBirth)} /{" "}
                    {order?.patient?.gender} • Ph:
                    {order?.patient?.phoneNumber}
                </div>
                <div className="text-sm text-slate-700">
                    Address: {order?.patient?.address}
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
                    <div className="mt-2 text-xs text-slate-500">
                        Doctor: {order?.doctor?.name} • Specialization:{" "}
                        {order?.doctor?.specialization}
                    </div>
                    <div className="text-xs text-slate-600">
                        Pharmacist: <span className="font-medium">{order?.pharmacist}</span>
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
                e.preventDefault();
                setPaymentMethod("Cash");
                setTimeout(() => document.getElementById("cash-amount-input")?.focus(), 10);
            } else if (key === 'u') {
                e.preventDefault();
                setPaymentMethod("UPI");
                setTimeout(() => document.getElementById("upi-ref-input")?.focus(), 10);
            } else if (key === 'p') {
                e.preventDefault();
                setPaymentMethod("Underpaid");
                setTimeout(() => document.getElementById("partial-amount-input")?.focus(), 10);
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


    const [openTherapyAlert, setOpenTherapyAlert] = useState(false);
    const [pendingConsulting, setPendingConsulting] = useState<any>(null);
    const [pendingOrderToComplete, setPendingOrderToComplete] = useState<OrderType | null>(null);
    const [pendingAction, setPendingAction] = useState<"complete" | "print">("complete");

    const { data: patientConsultings } = useSWR<{
        data: Array<{
            _id: string;
            therapy: Array<{ _id: string; name: string; price?: number; description?: string }>;
            therapyNotes?: string;
            therapyCompleted?: boolean;
            createdAt?: string;
        }>;
    }>(
        open && localOrder?.patient?._id ? `/consultings/patient/${localOrder.patient._id}` : null
    );

    const handleCompleteOrderDirect = async (orderToComplete = localOrder) => {
        if (!orderToComplete) return;
        try {
            await toast.promise(api.patch(`/pharmacy/orders/complete/${orderToComplete._id}`), {
                loading: "Completing...",
                success: (data) => {
                    OrderMutate();
                    return data.data.message;
                },
                error: ({ response: { data } }) => {
                    return data?.message || "Failed to complete order";
                }
            });
            handlePrintBill(orderToComplete);
            setOpen(false);
        } catch (error) {

        }
    };

    const handleCompleteOrder = async (orderToComplete = localOrder) => {
        if (!orderToComplete) return;

        // Check if patient has prescribed therapies in consultation that are not marked completed
        const activeConsultingWithTherapy = patientConsultings?.data?.find(
            (c) => c.therapy && c.therapy.length > 0 && !c.therapyCompleted
        );

        if (activeConsultingWithTherapy) {
            setPendingConsulting(activeConsultingWithTherapy);
            setPendingOrderToComplete(orderToComplete);
            setPendingAction("complete");
            setOpenTherapyAlert(true);
            return;
        }

        await handleCompleteOrderDirect(orderToComplete);
    };

    const handlePrintWithTherapyCheck = async () => {
        if (!localOrder) return;
        const activeConsultingWithTherapy = patientConsultings?.data?.find(
            (c) => c.therapy && c.therapy.length > 0 && !c.therapyCompleted
        );

        if (activeConsultingWithTherapy) {
            setPendingConsulting(activeConsultingWithTherapy);
            setPendingOrderToComplete(localOrder);
            setPendingAction("print");
            setOpenTherapyAlert(true);
            return;
        }

        handlePrintBill(localOrder);
        setOpen(false);
    };

    const handleConfirmTherapyCompletion = async () => {
        if (pendingConsulting?._id) {
            try {
                await api.patch(`/consultings/${pendingConsulting._id}/therapy-status`, {
                    completed: true,
                });
                toast.success("Therapy status updated & details sent to Pharmacist module");
            } catch (err) {
                console.error("Failed to update therapy status", err);
            }
        }
        setOpenTherapyAlert(false);
        if (pendingAction === "print" && pendingOrderToComplete) {
            handlePrintBill(pendingOrderToComplete);
            setOpen(false);
        } else if (pendingOrderToComplete) {
            await handleCompleteOrderDirect(pendingOrderToComplete);
        }
        setPendingOrderToComplete(null);
        setPendingConsulting(null);
        setPendingAction("complete");
    };

    const handlePaymentUpdate = async () => {
        if (!updatePayload) return;

        const payload = {
            orderId: updatePayload._id,
            paidAmount: 0,
            paymentStatus: "Partial",
            paymentReference: referenceNumber
        }

        if (paymentMethod === "UPI" || paymentMethod === "Cash") {
            payload.paymentStatus = "Paid";
            payload.paidAmount = (updatePayload?.items.reduce((acc, it) => acc + (it.name.unitPrice * it.quantity), 0) - (updatePayload?.discount || 0)) || 0;
        } else {
            payload.paymentStatus = "Partial";
            payload.paidAmount = Number(amountPaid);
        }

        try {
            const { data: response } = await toast.promise(
                api.patch<{ data: OrderType }>("/pharmacy/orders/update_payment", payload),
                {
                    loading: "Updating payment...",
                    success: "Payment updated successfully",
                    error: "Failed to update payment"
                }
            )
            OrderMutate()
            if (response?.data) {
                setLocalOrder(response.data)
                setUpdatePayload(response.data)

                if (paymentMethod === "UPI" || paymentMethod === "Cash") {
                    // Trigger completion and printing
                    await handleCompleteOrder(response.data);
                }
            }
        } catch (error) {
            console.log(error)
        }
    };

    if (!localOrder || !updatePayload) return null;

    return (



        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-[98vw]! max-w-7xl! h-[95vh] flex flex-col print:hidden">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center justify-between pr-8">
                        <span>Order — {localOrder.mrn}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto flex flex-col gap-2">
                    <OrderHeader order={localOrder} />

                    <UpdatePrescriptionCard
                        setData={setUpdatePayload as React.Dispatch<React.SetStateAction<OrderType>>}
                        data={updatePayload}
                        allergies={order?.patient.allergies}
                    />

                    {/* Payment Details Section */}
                    {localOrder?.paymentStatus !== "Paid" && <div className="border rounded-xl p-2.5 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Payment Details</h3>
                            <div className="flex flex-col items-end justify-center bg-white px-4 py-1 rounded-xl border border-slate-200 shadow-sm ">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Total Amount</span>
                                <div className="flex items-center text-slate-900">
                                    <IndianRupee className="w-5 h-5 stroke-[2.5] mr-0.5 text-slate-400" />
                                    <span className="text-xl font-extrabold leading-none tracking-tight">
                                        {formatINR(Math.max(0, (updatePayload?.items.reduce((acc, it) => acc + (it.name.unitPrice * it.quantity), 0) - (updatePayload?.discount || 0)) || 0)).replace("₹", "")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                            {[
                                { id: "Cash", label: "Cash Payment", icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50", shortcut: "C" },
                                { id: "UPI", label: "UPI / Scanner", icon: QrCode, color: "text-(--color-synapse-light)", bg: "bg-synapse-light/10", shortcut: "U" },
                                { id: "Underpaid", label: "Partial / Due", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", shortcut: "P" },
                            ].map((method) => {
                                const active = paymentMethod === method.id;
                                return (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(method.id as any)}
                                        className={cn(
                                            "relative flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all text-left group",
                                            active
                                                ? `border-${method.id === "Cash" ? "emerald" : method.id === "UPI" ? "indigo" : "rose"}-500 ${method.bg} shadow-md`
                                                : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                                        )}
                                    >
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <kbd className={cn(
                                                "px-1.5 py-0.5 text-[9px] font-bold rounded shadow-xs border",
                                                method.id === "Cash" && "bg-emerald-50 border-emerald-200 text-emerald-600",
                                                method.id === "UPI" && "bg-synapse-light/10 border-synapse-light/30 text-(--color-synapse-light)",
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
                        <div className="flex gap-5 items-end">

                            {paymentMethod === "Cash" && (
                                <div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 w-full"
                                >
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Amount Collected (₹)</Label>
                                        <Input
                                            id="cash-amount-input"
                                            type="number"
                                            placeholder="Enter amount from customer"
                                            value={amountPaid}
                                            onChange={(e) => setAmountPaid(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handlePaymentUpdate()}
                                            className="h-11 bg-white border-slate-200 rounded-lg focus:ring-emerald-500/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Balance to Return (₹)</Label>
                                        <div className={cn(
                                            "h-11 flex items-center px-4 rounded-lg border-2 font-bold text-lg transition-colors",
                                            (Number(amountPaid) - (updatePayload?.items.reduce((acc, it) => acc + (it.name.unitPrice * it.quantity), 0) - updatePayload?.discount || 0)) >= 0
                                                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                                : "bg-rose-50 border-rose-100 text-rose-700"
                                        )}>
                                            {formatINR(Math.max(0, Number(amountPaid) - (updatePayload?.items.reduce((acc, it) => acc + (it.name.unitPrice * it.quantity), 0) - updatePayload?.discount || 0)))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === "Underpaid" && (
                                <div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 w-full"
                                >
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Amount Collected (₹)</Label>
                                        <Input
                                            id="partial-amount-input"
                                            type="number"
                                            placeholder="0.00"
                                            value={amountPaid}
                                            onChange={(e) => setAmountPaid(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    document.getElementById("partial-reference-input")?.focus();
                                                }
                                            }}
                                            className="h-11 bg-white border-slate-200 rounded-lg focus:ring-rose-500/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Reference / Bill No.</Label>
                                        <Input
                                            id="partial-reference-input"
                                            placeholder="Enter reference if any"
                                            value={referenceNumber}
                                            onChange={(e) => setReferenceNumber(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handlePaymentUpdate()}
                                            className="h-11 bg-white border-slate-200 rounded-lg focus:ring-rose-500/20"
                                        />
                                    </div>
                                </div>
                            )}

                            {paymentMethod === "UPI" && (
                                <div className="space-y-2 pt-2 w-full">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Transaction ID / Reference (Optional)</Label>
                                    <Input
                                        id="upi-ref-input"
                                        placeholder="Enter UPI transaction ID"
                                        value={referenceNumber}
                                        onChange={(e) => setReferenceNumber(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handlePaymentUpdate()}
                                        className="h-11 bg-white border-slate-200 rounded-lg focus:ring-synapse-light/20"
                                    />
                                </div>
                            )}


                            <Button
                                onClick={handlePaymentUpdate}
                                className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) text-white h-10">
                                Update Payment
                            </Button>

                        </div>
                    </div>}

                </div>

                <div className="flex items-center gap-2">
                    {localOrder.status !== "Completed" && <Button
                        disabled={updatingOrder}
                        className="bg-(--color-synapse-light) hover:bg-(--color-synapse-light) text-white"
                        onClick={handleUpdate}
                    >
                        {updatingOrder ? "Updating..." : "Update Order"}
                    </Button>}
                    {
                        autoGenerateBill ?
                            <Button
                                variant="outline"
                                disabled={!!printingOrderId}
                                onClick={() => handlePrintWithTherapyCheck()}
                            >
                                {printingOrderId === localOrder._id ? "Printing..." : "Print"}
                            </Button>
                            : <Button
                                variant="outline"
                                onClick={() => handlePrintWithTherapyCheck()}
                            >
                                Print
                            </Button>
                    }
                    {localOrder.status !== "Completed" && <Button onClick={() => handleCompleteOrder()}>Complete Order</Button>}

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

                {/* Prescribed Therapy Alert Dialog */}
                <AlertDialog open={openTherapyAlert} onOpenChange={setOpenTherapyAlert}>
                    <AlertDialogContent className="rounded-2xl max-w-md p-6">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-lg font-bold flex items-center gap-2 text-amber-700">
                                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                                Prescribed Therapy Alert
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="space-y-3 mt-2 text-slate-600 text-sm">
                                    <p>
                                        This prescription contains therapy prescribed during consultation. It cannot be completed directly until therapy status is confirmed.
                                    </p>
                                    {pendingConsulting?.therapy?.length > 0 && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
                                            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                                                <Activity className="w-4 h-4 text-amber-600" /> Prescribed Therapies:
                                            </div>
                                            <ul className="list-disc list-inside text-xs font-medium text-amber-900 space-y-1">
                                                {pendingConsulting.therapy.map((th: any, idx: number) => (
                                                    <li key={th._id || idx}>
                                                        <span className="font-bold">{th.name || "Therapy"}</span>
                                                        {th.price ? ` — ₹${th.price}` : ""}
                                                    </li>
                                                ))}
                                            </ul>
                                            {pendingConsulting?.therapyNotes && (
                                                <p className="text-xs text-amber-700 italic mt-1">
                                                    Notes: "{pendingConsulting.therapyNotes}"
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <p className="font-semibold text-slate-800 text-sm pt-1">
                                        Is therapy completed?
                                    </p>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4 flex gap-2">
                            <AlertDialogCancel
                                onClick={() => {
                                    setOpenTherapyAlert(false);
                                    setPendingOrderToComplete(null);
                                    setPendingConsulting(null);
                                }}
                                className="rounded-xl border-slate-200 cursor-pointer"
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmTherapyCompletion}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                            >
                                Yes, Therapy Completed
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DialogContent>
        </Dialog>
    );
}
