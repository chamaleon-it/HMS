"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { formatINR } from "@/lib/fNumber";
import { fDate, fTime } from "@/lib/fDateAndTime";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Supplier } from "./interface";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

export const PAYMENT_HISTORY_PAGE_SIZE = 5;

type PaymentAllocation = {
    purchaseEntry: string;
    invoiceNumber: string;
    amount: number;
};

type SupplierPaymentRecord = {
    _id: string;
    date: string | Date;
    cash: number;
    card: number;
    upi: number;
    total: number;
    allocations: PaymentAllocation[];
};

type PaymentHistoryResponse = {
    payments: SupplierPaymentRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

type PaymentHistoryModalProps = {
    supplier: Supplier | null;
    open: boolean;
    onClose: () => void;
};

export function PaymentHistoryModal({
    supplier,
    open,
    onClose,
}: PaymentHistoryModalProps) {
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (open) setPage(1);
    }, [open, supplier?._id]);

    const { data, error, isLoading } = useSWR<PaymentHistoryResponse>(
        open && supplier
            ? `/purchase_entry/supplier/${supplier._id}/payments?page=${page}&limit=${PAYMENT_HISTORY_PAGE_SIZE}`
            : null,
        fetcher,
    );

    const payments = data?.payments ?? [];
    const totalPages = data?.totalPages ?? 0;
    const total = data?.total ?? 0;

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
            <DialogContent className="bg-white sm:max-w-xl" data-testid="payment-history-modal">
                <DialogHeader>
                    <DialogTitle>
                        Payment History{supplier ? ` — ${supplier.name}` : ""}
                    </DialogTitle>
                </DialogHeader>

                {isLoading && (
                    <p className="text-sm text-slate-500">Loading payments...</p>
                )}
                {error && (
                    <p className="text-sm text-rose-600">Failed to load payment history.</p>
                )}
                {!isLoading && !error && payments.length === 0 && (
                    <p className="text-sm text-slate-500" data-testid="payment-history-empty">
                        No payments recorded for this supplier.
                    </p>
                )}

                {!isLoading && !error && payments.length > 0 && (
                    <ul className="max-h-[60vh] space-y-3 overflow-y-auto">
                        {payments.map((payment) => (
                            <li
                                key={payment._id}
                                data-testid="payment-history-row"
                                className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                            >
                                <div className="mb-2 text-sm font-semibold text-slate-900">
                                    {fDate(payment.date)}
                                    {fTime(payment.date) ? `, ${fTime(payment.date)}` : ""}
                                </div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm sm:grid-cols-4">
                                    <Amount label="Cash" value={payment.cash} />
                                    <Amount label="Card" value={payment.card} />
                                    <Amount label="UPI" value={payment.upi} />
                                    <Amount label="Total" value={payment.total} emphasis />
                                </div>
                                <div className="mt-2 text-sm text-slate-600">
                                    <span className="font-medium text-slate-700">Invoices paid: </span>
                                    {payment.allocations.length === 0
                                        ? "—"
                                        : payment.allocations.map((allocation, index) => (
                                            <span key={`${allocation.purchaseEntry}-${index}`}>
                                                {index > 0 ? ", " : ""}
                                                {allocation.invoiceNumber} {formatINR(allocation.amount)}
                                            </span>
                                        ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {!isLoading && !error && total > 0 && (
                    <div className="flex items-center justify-between gap-3 text-sm" data-testid="payment-history-pager">
                        <span className="text-slate-500">
                            Page {data?.page ?? page} of {Math.max(totalPages, 1)}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                data-testid="payment-history-prev"
                                disabled={page <= 1}
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                            >
                                Previous
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                data-testid="payment-history-next"
                                disabled={page >= totalPages}
                                onClick={() => setPage((current) => current + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function Amount({
    label,
    value,
    emphasis,
}: {
    label: string;
    value: number;
    emphasis?: boolean;
}) {
    return (
        <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
            <div className={emphasis ? "font-semibold text-slate-900" : "text-slate-800"}>
                {formatINR(value || 0)}
            </div>
        </div>
    );
}
