import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getFormattedTherapyNames } from "@/lib/investigationUtils";

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
import { sanitizeOrderUpdatePayload } from "@/lib/sanitizeOrderPayload";
import { batchSalePrice, lineSaleBatch, positiveMoney, unselectedOversellWarnings, OversellWarning } from "@/lib/pharmacyReceiptLine";
import { isOutsideOrderLine, withConsultationLines } from "@/lib/pharmacyOutsideMedicine";
import OversellWarningDialog from "./OversellWarningDialog";
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

function OrderHeader({ order }: { order: OrderType }) {
    const accountantName = String(order?.pharmacist ?? "").trim();
    const accountantDisplay = accountantName && accountantName !== "-" ? accountantName : "—";

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
            <div className="border rounded-lg p-3">
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
                    Accountant in charge: <span className="font-medium">{accountantDisplay}</span>
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
    const mergedOrderId = useRef<string | null>(null);
    const loadedSplit = useRef<{ orderId: string; cash: number; card: number; upi: number } | null>(null);

    const withSavedSplit = (next: OrderType | null): OrderType | null => {
        const saved = loadedSplit.current;
        if (!next || !saved || saved.orderId !== next._id) return next;
        return { ...next, cash: saved.cash, card: saved.card, upi: saved.upi, paidAmount: saved.cash + saved.card + saved.upi };
    };

    useEffect(() => {
        if (loadedSplit.current && loadedSplit.current.orderId !== order?._id) {
            loadedSplit.current = null;
        }
        setLocalOrder(withSavedSplit(order));
        setUpdatePayload(withSavedSplit(order));
        mergedOrderId.current = null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order]);

    // The list does not carry the payment split, so read it from the order record and its bill.
    const { data: savedOrder } = useSWR<{ data: { _id: string; cash?: number; card?: number; upi?: number } }>(
        open && order?.mrn ? `/pharmacy/orders/single?q=${encodeURIComponent(order.mrn)}` : null,
        { revalidateOnFocus: false },
    );

    useEffect(() => {
        const saved = savedOrder?.data;
        if (!saved || !order?._id || saved._id !== order._id) return;
        if (loadedSplit.current?.orderId === order._id) return;
        loadedSplit.current = {
            orderId: order._id,
            cash: Number(saved.cash) || 0,
            card: Number(saved.card) || 0,
            upi: Number(saved.upi) || 0,
        };
        setLocalOrder((prev) => withSavedSplit(prev));
        setUpdatePayload((prev) => withSavedSplit(prev));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [savedOrder?.data, order?._id]);

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

        const payload = sanitizeOrderUpdatePayload({
            ...updatePayload,
            patient: localOrder.patient?._id,
            doctor: localOrder.doctor?._id,
        });
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
        open && order?.patient?._id ? `/consultings/patient/${order.patient._id}` : null
    );

    useEffect(() => {
        if (!order?._id || !patientConsultings?.data) return;
        if (mergedOrderId.current === order._id) return;
        mergedOrderId.current = order._id;
        const merged = withSavedSplit(withConsultationLines(order, patientConsultings.data));
        setLocalOrder(merged);
        setUpdatePayload(merged);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order, patientConsultings?.data]);

    const lineAmount = (it: { isCustom?: boolean; referralName?: string; quantity?: number; unitPrice?: number; batchNumber?: string; name?: { unitPrice?: number; batches?: { batchNumber?: string; unitPrice?: number; saleRate?: number; mrp?: number; packing?: number }[] } | null }) => {
        if (isOutsideOrderLine(it)) return 0;
        const selected = lineSaleBatch(it.name?.batches, it.batchNumber, it.quantity);
        if (!selected) return 0;
        const price = batchSalePrice(selected) || positiveMoney(it.unitPrice);
        return price * (Number(it.quantity) || 0);
    };

    const [openOversell, setOpenOversell] = useState(false);
    const [oversellLines, setOversellLines] = useState<OversellWarning[]>([]);
    const oversellAction = useRef<"complete" | "payment" | null>(null);

    const handleCompleteOrderDirect = async () => {
        if (!updatePayload || !localOrder) return;
        if (updatePayload.items.some((m) => (m.quantity || 0) === 0)) {
            toast.error("Quantity cannot be 0");
            return;
        }
        try {
            await api.patch(
                `pharmacy/orders/update`,
                sanitizeOrderUpdatePayload({
                    ...updatePayload,
                    patient: localOrder.patient?._id,
                    doctor: localOrder.doctor?._id,
                }),
            );
            await toast.promise(api.patch(`/pharmacy/orders/complete/${updatePayload._id}`), {
                loading: "Completing...",
                success: (data) => {
                    OrderMutate();
                    return data.data.message;
                },
                error: ({ response: { data } }) => {
                    return data?.message || "Failed to complete order";
                }
            });
            handlePrintBill(updatePayload);
            setOpen(false);
        } catch (error) {

        }
    };

    const handleCompleteOrder = async (options?: { skipOversell?: boolean }) => {
        if (!updatePayload) return;

        if (!options?.skipOversell) {
            const warnings = unselectedOversellWarnings(updatePayload.items);
            if (warnings.length) {
                oversellAction.current = "complete";
                setOversellLines(warnings);
                setOpenOversell(true);
                return;
            }
        }

        if (updatePayload.status?.toLowerCase() !== "completed") {
            // Check if patient has prescribed therapies in consultation that are not marked completed
            const activeConsultingWithTherapy = patientConsultings?.data?.find(
                (c) => c.therapy && c.therapy.length > 0 && !c.therapyCompleted
            );

            if (activeConsultingWithTherapy) {
                setPendingConsulting(activeConsultingWithTherapy);
                setPendingOrderToComplete(updatePayload);
                setPendingAction("complete");
                setOpenTherapyAlert(true);
                return;
            }
        }

        await handleCompleteOrderDirect();
    };

    const handlePrintWithTherapyCheck = async () => {
        if (!localOrder) return;
        if (localOrder.status?.toLowerCase() !== "completed") {
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
            await handleCompleteOrderDirect();
        }
        setPendingOrderToComplete(null);
        setPendingConsulting(null);
        setPendingAction("complete");
    };

    const applyPaymentUpdate = async () => {
        if (!updatePayload) return;

        const payload = {
            orderId: updatePayload._id,
            paidAmount: 0,
            paymentStatus: "Partial",
            paymentReference: referenceNumber
        }

        if (paymentMethod === "UPI" || paymentMethod === "Cash") {
            payload.paymentStatus = "Paid";
            payload.paidAmount = ((updatePayload?.items ?? []).reduce((acc, it) => acc + lineAmount(it), 0) - (updatePayload?.discount || 0)) || 0;
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
                    await handleCompleteOrder({ skipOversell: true });
                }
            }
        } catch (error) {
            console.log(error)
        }
    };

    const handlePaymentUpdate = async () => {
        if (!updatePayload) return;
        const warnings = unselectedOversellWarnings(updatePayload.items);
        if (warnings.length) {
            oversellAction.current = "payment";
            setOversellLines(warnings);
            setOpenOversell(true);
            return;
        }
        await applyPaymentUpdate();
    };

    const confirmOversell = () => {
        const action = oversellAction.current;
        oversellAction.current = null;
        setOpenOversell(false);
        if (action === "payment") {
            void applyPaymentUpdate();
            return;
        }
        void handleCompleteOrder({ skipOversell: true });
    };

    const declineOversell = () => {
        const indexes = new Set(oversellLines.map((line) => line.index));
        oversellAction.current = null;
        setOpenOversell(false);
        setUpdatePayload((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                items: prev.items.map((item, index) =>
                    indexes.has(index) ? { ...item, quantity: 0 } : item,
                ),
            };
        });
    };

    if (!localOrder || !updatePayload) return null;

    return (



        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-[98vw]! max-w-7xl! h-[80vh] flex flex-col print:hidden">
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
                        allergies={order?.patient?.allergies}
                    />



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


                <OversellWarningDialog
                    open={openOversell}
                    lines={oversellLines}
                    onOpenChange={(next) => {
                        setOpenOversell(next);
                        if (!next) oversellAction.current = null;
                    }}
                    onConfirm={confirmOversell}
                    onDecline={declineOversell}
                />

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
                                                {pendingConsulting.therapy.map((th: any, idx: number) => {
                                                    const name = typeof th === "object" && th !== null ? (th.name || "Therapy") : (getFormattedTherapyNames(th) || "Therapy");
                                                    return (
                                                        <li key={th._id || idx}>
                                                            <span className="font-bold">{name}</span>
                                                            {th.price ? ` — ₹${th.price}` : ""}
                                                        </li>
                                                    );
                                                })}
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
