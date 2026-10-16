import React, { useState, useEffect, useRef } from "react";
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
import { fDateandTime, fAgeString } from "@/lib/fDateAndTime";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import UpdatePrescriptionCard from "./UpdatePrescriptionCard";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";


interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    order: OrderType | null;
    OrderMutate: () => void;
    autoGenerateBill: boolean;
    handlePrintBill: (order: OrderType) => void;
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

export default function ViewOrder({ open, setOpen, order, OrderMutate, autoGenerateBill, handlePrintBill }: Props) {
    const [localOrder, setLocalOrder] = useState<OrderType | null>(order);
    const [updatePayload, setUpdatePayload] = useState<OrderType | null>(order);
    const [openPrintConfirm, setOpenPrintConfirm] = useState(false);
    const [updatingOrder, setUpdatingOrder] = useState(false);
    const [submittingOrder, setSubmittingOrder] = useState(false);
    const submitInFlight = useRef(false);

    useEffect(() => {
        setLocalOrder(order);
        setUpdatePayload(order);
    }, [order]);

    const orderItemsPayload = (source: OrderType) => source.items.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        food: m.food,
        duration: m.duration,
        quantity: m.quantity,
        batchId: m.batchId || null,
        batchNumber: m.batchNumber || null,
        batchExpiryDate: m.batchExpiryDate || null,
        batchMrp: m.batchMrp ?? null,
        batchPurchasePrice: m.batchPurchasePrice ?? null,
        batchSellingPrice: m.batchSellingPrice ?? null,
        batchGst: m.batchGst ?? null,
        batchStock: m.batchStock ?? null,
        batchSupplier: m.batchSupplier || null,
        batchPacking: m.batchPacking ?? null,
    }));

    const handleUpdate = async (): Promise<boolean> => {
        if (!updatePayload || !localOrder) return false;

        let hasZeroQuantity = false;
        for (const [index, m] of updatePayload.items.entries()) {
            if (m.quantity === 0) {
                hasZeroQuantity = true;
            }
            if (!m.batchId) {
                toast.error(
                    `Item ${index + 1} (${m.name?.name || "medicine"}): Select a batch before updating`
                );
                return false;
            }
        }

        if (hasZeroQuantity) {
            toast.error("Quantity cannot be 0");
            return false;
        }

        const payload = {
            ...updatePayload,
            patient: localOrder.patient._id,
            doctor: localOrder.doctor?._id ?? null,
            items: orderItemsPayload(updatePayload),
        };
        try {
            setUpdatingOrder(true);
            await toast.promise(api.patch(`pharmacy/orders/update`, payload), {
                loading: "Updating...",
                success: "Updated successfully",
                error: "Failed to update",
            });
            setLocalOrder(updatePayload);
            OrderMutate();
            return true;
        } catch (error) {
            toast.error("Failed to update: " + error);
            return false;
        } finally {
            setUpdatingOrder(false);
        }
    };

    const handleCompleteOrder = async () => {
        const orderToComplete = localOrder;
        if (!orderToComplete || !updatePayload) return;
        if (submitInFlight.current) return;
        submitInFlight.current = true;
        setSubmittingOrder(true);
        try {
            const { data: completeResponse } = await toast.promise(
                api.patch(`/pharmacy/orders/complete/${orderToComplete._id}`, {
                    items: orderItemsPayload(updatePayload),
                    discount: updatePayload.discount,
                }),
                {
                    loading: "Completing...",
                    success: (data) => {
                        OrderMutate();
                        return data.data.message;
                    },
                    error: (error: any) => error?.response?.data?.message || "Could not complete the order",
                }
            );
            if (completeResponse.data?.billNo && completeResponse.data.billNo !== '-') {
                handlePrintBill(completeResponse.data);
            }
            setOpen(false);
        } catch (error) {
            console.log(error);
        } finally {
            submitInFlight.current = false;
            setSubmittingOrder(false);
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
                </div>

                <div className="flex items-center gap-2">
                    {localOrder.status === "Pending" && <Button
                        disabled={updatingOrder || submittingOrder}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={handleUpdate}
                    >
                        {updatingOrder ? "Updating..." : "Update Order"}
                    </Button>}
                    {
                        localOrder.billNo && localOrder.billNo !== '-' ?
                            <Button variant="outline" onClick={() => {
                                handlePrintBill(localOrder);
                                setOpen(false);
                            }}>
                                Print Bill
                            </Button>
                            : <Button variant="outline" asChild>
                                    <Link href={`/dashboard/pharmacy/billing?mrn=${localOrder.mrn}#new`}>Print Bill</Link>
                                </Button>
                    }
                    {localOrder.status === "Pending" && <Button disabled={submittingOrder || updatingOrder} onClick={() => handleCompleteOrder()}>Complete Order</Button>}

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
