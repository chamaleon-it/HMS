"use client";

import {
    Banknote,
    Smartphone,
    CreditCard,
    IndianRupee,
    Plus,
    Trash2,
    Wallet2,
    FileEdit,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatINR } from "@/lib/fNumber";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import api from "@/lib/axios";

interface BillItem {
    name: string;
    quantity: number;
    unitPrice: number;
    gst: number;
    discount: number;
    total: number;
}

interface BillData {
    _id: string;
    mrn: string;
    cash: number;
    card: number;
    upi: number;
    discount: number;
    items: BillItem[];
    roundOff: boolean;
}

interface AddPaymentDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    bill: BillData | null;
    billingMutate: () => void;
}

function calcTotal(item: Omit<BillItem, "total">): number {
    const base = item.quantity * item.unitPrice;
    const afterDiscount = base - (item.discount ?? 0);
    const gstAmount = (afterDiscount * (item.gst ?? 0)) / 100;
    return Math.max(0, afterDiscount + gstAmount);
}

export default function AddPaymentDialog({
    open,
    setOpen,
    bill,
    billingMutate,
}: AddPaymentDialogProps) {
    const [items, setItems] = useState<BillItem[]>([]);
    const [payment, setPayment] = useState({ cash: 0, card: 0, upi: 0, discount: 0 });

    // Sync state when bill or dialog opens
    useEffect(() => {
        if (bill && open) {
            setItems(bill.items.map(i => ({ ...i })));
            setPayment({
                cash: bill.cash,
                card: bill.card,
                upi: bill.upi,
                discount: bill.discount,
            });
        }
    }, [bill, open]);

    if (!bill) return null;

    // ── Item helpers ──────────────────────────────────────────────────────────
    const updateItemField = (idx: number, field: keyof BillItem, value: string | number) => {
        setItems(prev => {
            const next = [...prev];
            const item = { ...next[idx], [field]: field === "name" ? value : Number(value) };
            item.total = calcTotal(item);
            next[idx] = item;
            return next;
        });
    };

    const addItem = () => {
        setItems(prev => [...prev, { name: "", quantity: 1, unitPrice: 0, gst: 0, discount: 0, total: 0 }]);
    };

    const removeItem = (idx: number) => {
        setItems(prev => prev.filter((_, i) => i !== idx));
    };

    // ── Totals ────────────────────────────────────────────────────────────────
    const subtotal = items.reduce((a, i) => a + i.total, 0);
    const totalPaid = payment.cash + payment.card + payment.upi;
    const due = Math.max(0, subtotal - totalPaid - (payment.discount ?? 0));

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        const payload = {
            items,
            cash: payment.cash,
            card: payment.card,
            upi: payment.upi,
            discount: payment.discount,
        };
        await toast.promise(api.patch(`/billing/${bill._id}`, payload), {
            loading: "Saving bill...",
            success: "Bill updated successfully",
            error: "Failed to update bill",
        });
        await billingMutate();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-5xl! max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileEdit className="h-4 w-4 text-(--color-synapse-light)" />
                        Edit Draft Bill — {bill.mrn}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-12 gap-5 mt-2">
                    {/* ── Left: Items + Payments ───────────────────────────── */}
                    <div className="col-span-12 lg:col-span-8 space-y-4">

                        {/* Items table */}
                        <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-700">Bill Items</span>
                                <Button size="sm" variant="outline" onClick={addItem} className="h-7 gap-1 text-xs">
                                    <Plus className="h-3 w-3" /> Add Row
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold w-[32%]">Name</th>
                                            <th className="px-2 py-2 text-right font-semibold">Qty</th>
                                            <th className="px-2 py-2 text-right font-semibold">Price</th>
                                            <th className="px-2 py-2 text-right font-semibold">Disc</th>
                                            <th className="px-2 py-2 text-right font-semibold">GST%</th>
                                            <th className="px-2 py-2 text-right font-semibold">Total</th>
                                            <th className="px-2 py-2 w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="text-center py-6 text-slate-400 text-sm">
                                                    No items — click "Add Row" to add one
                                                </td>
                                            </tr>
                                        )}
                                        {items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/60">
                                                <td className="px-3 py-1.5">
                                                    <input
                                                        className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-[var(--color-synapse-light)] focus:ring-1 focus:ring-indigo-100"
                                                        value={item.name}
                                                        placeholder="Item name"
                                                        onChange={e => updateItemField(idx, "name", e.target.value)}
                                                    />
                                                </td>
                                                {(["quantity", "unitPrice", "discount", "gst"] as const).map(field => (
                                                    <td key={field} className="px-2 py-1.5">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            className="w-20 rounded-md border border-slate-200 px-2 py-1.5 text-xs text-right outline-none focus:border-[var(--color-synapse-light)] focus:ring-1 focus:ring-indigo-100"
                                                            value={item[field] === 0 ? "" : item[field]}
                                                            placeholder="0"
                                                            onChange={e => updateItemField(idx, field, e.target.value)}
                                                        />
                                                    </td>
                                                ))}
                                                <td className="px-2 py-1.5 text-right font-medium text-slate-700 tabular-nums whitespace-nowrap">
                                                    {formatINR(item.total)}
                                                </td>
                                                <td className="px-2 py-1.5 text-center">
                                                    <button
                                                        onClick={() => removeItem(idx)}
                                                        className="text-rose-400 hover:text-rose-600 transition-colors"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {items.length > 0 && (
                                        <tfoot className="bg-slate-50 border-t border-slate-200">
                                            <tr>
                                                <td colSpan={5} className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Subtotal</td>
                                                <td className="px-2 py-2 text-right text-xs font-bold text-slate-800 tabular-nums">{formatINR(subtotal)}</td>
                                                <td />
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>

                        {/* Payment section */}
                        <div className="rounded-2xl border border-slate-200 p-4 shadow-sm bg-white">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Wallet2 className="h-4 w-4" />
                                Payments
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {([
                                    { key: "cash", label: "Cash", icon: Banknote, tint: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                                    { key: "card", label: "Card", icon: CreditCard, tint: "bg-synapse-light/10 text-(--color-synapse-light) border-synapse-light/30" },
                                    { key: "upi", label: "UPI", icon: Smartphone, tint: "bg-violet-50 text-violet-700 border-violet-200" },
                                ] as const).map(({ key, label, icon: Icon, tint }) => (
                                    <div key={key} className={`rounded-xl border px-3 py-3 ${tint}`}>
                                        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold">
                                            <Icon className="h-3.5 w-3.5" />
                                            {label}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                                            <input
                                                type="number"
                                                min={0}
                                                placeholder="0"
                                                value={payment[key] === 0 ? "" : payment[key]}
                                                onChange={e => setPayment(p => ({ ...p, [key]: Number(e.target.value) }))}
                                                className="h-9 w-full rounded-lg border border-white/60 bg-white/70 px-2 text-sm outline-none focus:border-current text-right"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Discount row */}
                            <div className="mt-3 flex items-center gap-3">
                                <span className="text-xs font-semibold text-slate-500 shrink-0">Bill Discount</span>
                                <div className="flex items-center gap-1.5 max-w-[180px]">
                                    <IndianRupee className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="0"
                                        value={payment.discount === 0 ? "" : payment.discount}
                                        onChange={e => setPayment(p => ({ ...p, discount: Number(e.target.value) }))}
                                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-[var(--color-synapse-light)] text-right"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Summary ───────────────────────────────────── */}
                    <div className="col-span-12 lg:col-span-4">
                        <div className="rounded-2xl border border-slate-200 p-4 shadow-sm bg-white sticky top-4">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Wallet2 className="h-4 w-4" />
                                Invoice Summary
                            </div>
                            <div className="space-y-2 text-sm">
                                <Row label="Subtotal" value={formatINR(subtotal)} />
                                <Row label="Discount" value={`−${formatINR(payment.discount)}`} />
                                <div className="my-2 h-px bg-slate-200" />
                                <Row label="Total" value={formatINR(Math.max(0, subtotal - payment.discount))} bold />
                                <Row label="Paid" value={formatINR(totalPaid)} className="text-emerald-600" />
                                <Row label="Due" value={formatINR(due)} className="text-rose-600" bold />
                            </div>

                            <div className="mt-5">
                                <Button className="w-full bg-(--color-synapse-light) hover:bg-(--color-synapse-light)" onClick={handleSubmit}>
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

function Row({
    label,
    value,
    bold,
    className = "",
}: {
    label: string;
    value: string;
    bold?: boolean;
    className?: string;
}) {
    return (
        <div className={`flex items-center justify-between ${className}`}>
            <span className={bold ? "font-semibold" : "text-slate-500"}>{label}</span>
            <span className={`tabular-nums ${bold ? "font-bold" : "font-medium"}`}>{value}</span>
        </div>
    );
}
