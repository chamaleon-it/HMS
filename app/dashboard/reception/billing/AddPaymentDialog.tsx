import {
    BadgePercent,
    Banknote,
    Smartphone,
    CreditCard,
    IndianRupee,
    Percent,
    Wallet2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useBillCalculations } from "./hooks/useBillCalculations";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatINR, getDecimal } from "@/lib/fNumber";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import api from "@/lib/axios";

interface BillData {
    _id: string;
    mrn: string;
    cash: number;
    card: number;
    upi: number;
    discount: number;
    items: {
        total: number;
        quantity: number;
        unitPrice: number;
        gst: number;
    }[];
    roundOff: boolean;
}

interface AddPaymentDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    bill: BillData | null;
    billingMutate: () => void;
}

export default function AddPaymentDialog({
    open,
    setOpen,
    bill,
    billingMutate,
}: AddPaymentDialogProps) {
    const [payment, setPayment] = useState({
        cash: 0,
        card: 0,
        upi: 0,
        discount: 0,
    });

    useEffect(() => {
        if (open) {
            setPayment({
                cash: 0,
                card: 0,
                upi: 0,
                discount: 0,
            });
        }
    }, [open]);

    const existingCash = bill?.cash ?? 0;
    const existingCard = bill?.card ?? 0;
    const existingUpi = bill?.upi ?? 0;
    const existingDiscount = bill?.discount ?? 0;

    const existingPaidTotal = existingCash + existingCard + existingUpi;
    const newPayingTotal = (payment.cash || 0) + (payment.card || 0) + (payment.upi || 0);

    const totalDiscount = existingDiscount + (payment?.discount ?? 0);

    const {
        subtotal,
        totalGst,
        roundOffAmount,
        finalTotal,
        totalPaid,
        dueAmount
    } = useBillCalculations({
        items: bill?.items || [],
        discount: totalDiscount,
        roundOff: bill?.roundOff || false,
        payments: {
            cash: existingCash + (payment?.cash ?? 0),
            card: existingCard + (payment?.card ?? 0),
            upi: existingUpi + (payment?.upi ?? 0)
        }
    });

    if (!bill) return null;

    const handleSubmit = async () => {
        const payload = {
            cash: existingCash + (payment.cash || 0),
            card: existingCard + (payment.card || 0),
            upi: existingUpi + (payment.upi || 0),
            discount: existingDiscount + (payment.discount || 0),
        };

        await toast.promise(api.patch(`/billing/add_payment/${bill._id}`, payload), {
            loading: "Adding Payment...",
            success: "Payment Added Successfully",
            error: "Failed to Add Payment"
        });
        await billingMutate();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-6xl! max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Payment - {bill.mrn}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-12 gap-6 mt-2">
                    {/* Left Column: Payment Inputs */}
                    <div className="col-span-12 lg:col-span-8 space-y-4">
                        <div className="rounded-2xl border border-slate-200 p-4 shadow-sm bg-white dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-2 flex items-center justify-between text-sm font-medium">
                                <span className="flex items-center gap-2">
                                    <Wallet2 className="h-4 w-4" />
                                    Additional Payment / Discount
                                </span>
                                {existingPaidTotal > 0 && (
                                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                        Previously Paid: {formatINR(existingPaidTotal)}
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-12 gap-4">
                                {[
                                    {
                                        key: "cash",
                                        label: "Cash",
                                        icon: Banknote,
                                        tint: "bg-emerald-50 text-emerald-700 border-emerald-200",
                                    },
                                    {
                                        key: "card",
                                        label: "Card",
                                        icon: CreditCard,
                                        tint: "bg-synapse-light/10 text-(--color-synapse-light) border-synapse-light/30",
                                    },
                                    {
                                        key: "upi",
                                        label: "UPI",
                                        icon: Smartphone,
                                        tint: "bg-violet-50 text-violet-700 border-violet-200",
                                    },
                                    {
                                        key: "discount",
                                        label: "Discount",
                                        icon: BadgePercent,
                                        tint: "bg-amber-50 text-amber-700 border-amber-200",
                                    },
                                ].map(({ key, label, icon: Icon, tint }) => {
                                    const val = payment[key as "cash" | "card" | "upi" | "discount"];
                                    return (
                                        <div key={key} className="col-span-12 md:col-span-6">
                                            <div className={`rounded-xl border px-3 py-3 ${tint}`}>
                                                <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                                                    <Icon className="h-4 w-4" />
                                                    {label}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <IndianRupee className="h-4 w-4" />
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        placeholder="0"
                                                        onFocus={(e) => (e.target.placeholder = "")}
                                                        onBlur={(e) => (e.target.placeholder = "0")}
                                                        value={!val ? "" : String(val)}
                                                        onChange={(e) =>
                                                            setPayment((prev) => ({
                                                                ...prev,
                                                                [key as "cash" | "card" | "upi" | "discount"]: Number(
                                                                    e.target.value
                                                                ),
                                                            }))
                                                        }
                                                        className={
                                                            "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50 text-right font-bold text-slate-800"
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}


                            </div>
                        </div>
                    </div>

                    {/* Right Column: Invoice Summary */}
                    <div className="col-span-12 lg:col-span-4">
                        <div className="rounded-2xl border border-slate-200 p-4 shadow-sm bg-white dark:border-slate-800 dark:bg-slate-900 sticky top-4">
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Wallet2 className="h-4 w-4" />
                                Invoice Summary
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="font-medium tabular-nums">
                                        {formatINR(subtotal)}
                                    </span>
                                </div>
                                {totalDiscount > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Discount</span>
                                        <span className="font-medium tabular-nums text-amber-700">
                                            -{formatINR(totalDiscount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">GST</span>
                                    <span className="font-medium tabular-nums">
                                        {formatINR(totalGst)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Round off</span>
                                    <span className="font-medium tabular-nums">
                                        {formatINR(roundOffAmount)}
                                    </span>
                                </div>
                                <div className="my-2 h-px bg-slate-200" />
                                <div className="flex items-center justify-between text-base font-semibold">
                                    <span>Total</span>
                                    <span className="tabular-nums">{formatINR(finalTotal)}</span>
                                </div>
                                {existingPaidTotal > 0 && (
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span>Previously Paid</span>
                                        <span className="font-medium tabular-nums">
                                            {formatINR(existingPaidTotal)}
                                        </span>
                                    </div>
                                )}
                                {newPayingTotal > 0 && (
                                    <div className="flex items-center justify-between text-emerald-600 font-semibold">
                                        <span>Paying Now</span>
                                        <span className="font-semibold tabular-nums">
                                            +{formatINR(newPayingTotal)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">Total Paid</span>
                                    <span className="font-semibold tabular-nums text-emerald-700">
                                        {formatINR(totalPaid)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                                    <span className="font-semibold">Due</span>
                                    <span className="font-bold tabular-nums">
                                        {formatINR(dueAmount)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Button className="w-full" onClick={handleSubmit}>
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
