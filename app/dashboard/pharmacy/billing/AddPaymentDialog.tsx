import {
    BadgePercent,
    Banknote,
    Building2,
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
    online: number;
    insurance: number;
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
        online: 0,
        insurance: 0,
        discount: 0,
    });

    useEffect(() => {
        if (bill && open) {
            setPayment({
                cash: bill.cash,
                online: bill.online,
                insurance: bill.insurance,
                discount: bill.discount,
            });
        }
    }, [bill, open]);

    if (!bill) return null;

    const {
        subtotal,
        totalGst,
        roundOffAmount,
        finalTotal,
        totalPaid,
        dueAmount
    } = useBillCalculations({
        items: bill.items,
        discount: payment.discount,
        roundOff: bill.roundOff,
        payments: {
            cash: payment.cash,
            online: payment.online,
            insurance: payment.insurance
        }
    });

    const handleSubmit = async () => {
        await toast.promise(api.patch(`/billing/add_payment/${bill._id}`, payment), {
            loading: "Adding Payment...",
            success: "Payment Added Successfully",
            error: "Failed to Add Payment"
        })
        await billingMutate()
        setOpen(false)
    }

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
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Wallet2 className="h-4 w-4" />
                                Payments & Insurance
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
                                        key: "online",
                                        label: "Card / UPI",
                                        icon: CreditCard,
                                        tint: "bg-indigo-50 text-indigo-700 border-indigo-200",
                                    },
                                    {
                                        key: "insurance",
                                        label: "Insurance",
                                        icon: Building2,
                                        tint: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
                                    },
                                ].map(({ key, label, icon: Icon, tint }) => (
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
                                                    value={
                                                        payment[key as "cash" | "online" | "insurance"] === 0
                                                            ? ""
                                                            : payment[
                                                                key as "cash" | "online" | "insurance"
                                                            ].toString()
                                                    }
                                                    onChange={(e) =>
                                                        setPayment((prev) => ({
                                                            ...prev,
                                                            [key as "cash" | "online" | "insurance"]: Number(
                                                                e.target.value
                                                            ),
                                                        }))
                                                    }
                                                    className={
                                                        "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50 text-right"
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}


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
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Discount</span>
                                    <span className="font-medium tabular-nums">
                                        -{formatINR(payment.discount)}
                                    </span>
                                </div>
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
                                <div className="flex items-center justify-between">
                                    <span>Paid</span>
                                    <span className="font-medium tabular-nums">
                                        {formatINR(totalPaid)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                                    <span className="font-semibold">Due</span>
                                    <span className="font-semibold tabular-nums">
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
