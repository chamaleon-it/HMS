"use client";

import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Banknote, CreditCard, IndianRupee, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { formatINR } from "@/lib/fNumber";
import { fDate } from "@/lib/fDateAndTime";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Supplier } from "./interface";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

const OVER_DUE_MESSAGE = "Payment total is over the due amount";

type OpenInvoice = {
    _id: string;
    invoiceNumber: string;
    invoiceDate: string | Date;
    dueAmount: number;
};

type OpenInvoicesResponse = {
    invoices: OpenInvoice[];
    totalDue: number;
};

type RecordPaymentModalProps = {
    supplier: Supplier | null;
    open: boolean;
    onClose: () => void;
    onRecorded: () => void;
};

function toPaise(value: number) {
    return Math.round(value * 100);
}

function readAmount(value: string): number | null {
    const trimmed = value.trim();
    if (trimmed === "") return 0;
    const amount = Number(trimmed);
    if (!Number.isFinite(amount) || amount < 0) return null;
    return toPaise(amount) / 100;
}

export function RecordPaymentModal({
    supplier,
    open,
    onClose,
    onRecorded,
}: RecordPaymentModalProps) {
    const [cash, setCash] = useState("");
    const [card, setCard] = useState("");
    const [upi, setUpi] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");

    const { data, error, isLoading, isValidating } = useSWR<OpenInvoicesResponse>(
        open && supplier ? `/purchase_entry/supplier/${supplier._id}/dues` : null,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 0 },
    );
    const duesLoading = isLoading || isValidating;

    useEffect(() => {
        if (!open) return;
        setCash("");
        setCard("");
        setUpi("");
        setServerError("");
        setSubmitting(false);
    }, [open, supplier?._id]);

    const invoices = duesLoading ? [] : data?.invoices ?? [];
    const totalDue = duesLoading ? 0 : data?.totalDue ?? 0;
    const duesReady = !duesLoading && !error && !!data;
    const cashAmount = readAmount(cash);
    const cardAmount = readAmount(card);
    const upiAmount = readAmount(upi);
    const amountsValid = cashAmount !== null && cardAmount !== null && upiAmount !== null;
    const paymentPaise = amountsValid
        ? toPaise(cashAmount) + toPaise(cardAmount) + toPaise(upiAmount)
        : 0;
    const paymentTotal = paymentPaise / 100;
    const overDue = duesReady && amountsValid && paymentPaise > toPaise(totalDue);
    const canSubmit =
        !!supplier &&
        !duesLoading &&
        !error &&
        amountsValid &&
        paymentPaise > 0 &&
        !overDue &&
        !submitting;

    const validationMessage = useMemo(() => {
        if (!amountsValid) return "Enter valid cash, card, and UPI amounts.";
        if (overDue) return OVER_DUE_MESSAGE;
        return "";
    }, [amountsValid, overDue]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!supplier || !canSubmit || cashAmount === null || cardAmount === null || upiAmount === null) {
            return;
        }
        setSubmitting(true);
        setServerError("");
        try {
            await api.post(`/purchase_entry/supplier/${supplier._id}/payment`, {
                cash: cashAmount,
                card: cardAmount,
                upi: upiAmount,
            });
            toast.success("Payment recorded");
            onRecorded();
            onClose();
        } catch (err: unknown) {
            const response = (err as { response?: { data?: { message?: string | string[] } } })?.response;
            const message = response?.data?.message;
            const text = Array.isArray(message)
                ? message.join(", ")
                : message || "Failed to record payment";
            setServerError(text);
            toast.error(text);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
            <DialogContent className="sm:max-w-xl" data-testid="record-payment-modal">
                <DialogHeader>
                    <DialogTitle>Record Payment{supplier ? ` — ${supplier.name}` : ""}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {duesLoading && (
                        <p className="text-sm text-slate-500">Loading invoices...</p>
                    )}
                    {error && (
                        <p className="text-sm text-rose-600">Failed to load invoices with a due amount.</p>
                    )}
                    {!duesLoading && !error && invoices.length === 0 && (
                        <p className="text-sm text-slate-500">No invoices with a due amount.</p>
                    )}
                    {!duesLoading && !error && invoices.length > 0 && (
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            <div className="grid grid-cols-12 gap-2 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                <span className="col-span-5">Invoice number</span>
                                <span className="col-span-4">Invoice date</span>
                                <span className="col-span-3 text-right">Due amount</span>
                            </div>
                            <ul>
                                {invoices.map((invoice, index) => (
                                    <li
                                        key={invoice._id}
                                        data-testid="open-invoice-row"
                                        className="grid grid-cols-12 gap-2 border-t border-slate-100 px-3 py-2.5 text-sm"
                                    >
                                        <span className="col-span-5 font-medium text-slate-900">
                                            {index + 1}. {invoice.invoiceNumber}
                                        </span>
                                        <span className="col-span-4 text-slate-600">
                                            {fDate(invoice.invoiceDate)}
                                        </span>
                                        <span className="col-span-3 text-right font-semibold text-slate-900">
                                            {formatINR(invoice.dueAmount)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2.5 text-sm" data-testid="total-due">
                        <span className="font-medium text-rose-800">Total Due amount</span>
                        <span className="font-bold text-rose-900">{formatINR(totalDue)}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <AmountField label="Cash" icon={Banknote} value={cash} onChange={setCash} testId="payment-cash" />
                        <AmountField label="Card" icon={CreditCard} value={card} onChange={setCard} testId="payment-card" />
                        <AmountField label="UPI" icon={Smartphone} value={upi} onChange={setUpi} testId="payment-upi" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Payment total</span>
                        <span className="font-semibold text-slate-900" data-testid="payment-total">
                            {formatINR(paymentTotal)}
                        </span>
                    </div>

                    {(validationMessage || serverError) && (
                        <p className="text-sm font-medium text-rose-600" data-testid="payment-error" role="alert">
                            {serverError || validationMessage}
                        </p>
                    )}

                    <DialogFooter>
                        <Button
                            type="submit"
                            data-testid="payment-submit"
                            disabled={!canSubmit}
                            className="bg-(--color-synapse-light) text-white"
                        >
                            {submitting ? "Submitting..." : "Submit"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AmountField({
    label,
    icon: Icon,
    value,
    onChange,
    testId,
}: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    value: string;
    onChange: (value: string) => void;
    testId: string;
}) {
    return (
        <label className="block rounded-xl border border-slate-200 px-3 py-2.5">
            <span className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <Icon className="h-4 w-4" />
                {label}
            </span>
            <span className="flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                <input
                    data-testid={testId}
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-9 w-full bg-transparent text-right text-sm outline-none"
                    placeholder="0"
                />
            </span>
        </label>
    );
}
