"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    CreditCard,
    Building2,
    Calendar,
    Phone,
    Mail,
    MapPin,
    FileText,
    Receipt,
    Boxes,
    Clock,
    CheckCircle2,
    AlertCircle,
    RotateCcw,
    IndianRupee,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/fNumber";
import { fDate, fDateandTime } from "@/lib/fDateAndTime";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import configuration from "@/config/configuration";
import { PurchaseEntry } from "../page";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

export default function SinglePurchaseEntryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const {
        data: entry,
        error,
        isLoading,
        mutate,
    } = useSWR<PurchaseEntry>(id ? `/purchase_entry/${id}` : null, fetcher);

    // Payment Dialog State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    const remainingDue = entry ? Math.max(0, (entry.total || 0) - (entry.paidAmount || 0)) : 0;

    const handleOpenPaymentModal = () => {
        if (!entry) return;
        setPaymentAmount(remainingDue > 0 ? remainingDue.toString() : "");
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSubmit = async () => {
        if (!entry) return;
        const amountNum = parseFloat(paymentAmount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error("Please enter a valid payment amount");
            return;
        }

        if (amountNum > remainingDue) {
            toast.error(`Amount exceeds remaining due (${formatINR(remainingDue)})`);
            return;
        }

        setIsSubmittingPayment(true);
        try {
            await api.patch(`/purchase_entry/add_payment/${entry._id}`, {
                paidAmount: amountNum,
            });
            toast.success("Payment recorded successfully");
            setIsPaymentModalOpen(false);
            setPaymentAmount("");
            mutate();
        } catch (err: any) {
            console.error("Payment error:", err);
            toast.error(err.response?.data?.message || "Failed to record payment");
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case "Paid":
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2.5 py-1 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Paid in Full
                    </Badge>
                );
            case "Partially Paid":
                return (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs px-2.5 py-1 font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Partially Paid
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs px-2.5 py-1 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Payment Pending
                    </Badge>
                );
        }
    };

    if (!id) {
        return (
            <AppShell>
                <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-67px)] text-center">
                    <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
                    <h2 className="text-xl font-bold text-slate-800">Missing Purchase Entry ID</h2>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm">
                        No purchase entry identifier was provided in the URL query.
                    </p>
                    <Button
                        className="mt-4 bg-(--color-synapse-light) text-white font-semibold"
                        onClick={() => router.push("/dashboard/pharmacy/purchase-entry")}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Purchase Entries
                    </Button>
                </div>
            </AppShell>
        );
    }

    if (error) {
        return (
            <AppShell>
                <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-67px)] text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                    <h2 className="text-xl font-bold text-slate-800">Failed to Load Purchase Entry</h2>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm">
                        An error occurred while fetching the purchase invoice details.
                    </p>
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" onClick={() => mutate()}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                        <Button
                            className="bg-(--color-synapse-light) text-white font-semibold"
                            onClick={() => router.push("/dashboard/pharmacy/purchase-entry")}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to List
                        </Button>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            {/* Screen Styles and Print Stylesheet */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-invoice, #printable-invoice * {
                visibility: visible;
              }
              #printable-invoice {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 15mm;
                background: white;
              }
              .no-print {
                display: none !important;
              }
            }
          `,
                }}
            />

            <div className="p-5 min-h-[calc(100vh-67px)] w-full space-y-6">
                {/* Top Action Bar (hidden when printing) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                Invoice #{entry?.invoiceNumber || "—"}
                            </h1>
                            {entry && getStatusBadge(entry.paymentStatus)}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Recorded on {entry?.createdAt ? fDateandTime(entry.createdAt) : "—"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {remainingDue > 0 && (
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                                onClick={handleOpenPaymentModal}
                                disabled={isLoading || !entry}
                            >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Record Payment
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 hover:bg-slate-100 text-slate-600"
                            onClick={() => router.push("/dashboard/pharmacy/purchase-entry")}
                        >
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            Back to Purchase Entries
                        </Button>
                    </div>
                </div>

                {isLoading || !entry ? (
                    <div className="space-y-6 animate-pulse">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="h-24 bg-slate-200 rounded-2xl" />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="h-48 bg-slate-200 rounded-xl" />
                            <div className="h-48 bg-slate-200 rounded-xl" />
                        </div>
                        <div className="h-64 bg-slate-200 rounded-xl" />
                    </div>
                ) : (
                    <div id="printable-invoice" className="space-y-6">
                        {/* Print Only Header (visible only on paper) */}
                        <div className="hidden print:block pb-4 mb-4 border-b border-black">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold uppercase tracking-tight text-black">
                                        {configuration().hospitalName || "BHUMI NATURE CURE & WELLNESS"}
                                    </h2>
                                    <p className="text-xs text-black mt-1">
                                        {configuration().hospitalAddress || "KOOTTANAD, PALAKKAD, KERALA"}
                                    </p>
                                    <p className="text-xs text-black">
                                        Phone: {configuration().hospitalPhone || "8505030406, 6282803887"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-lg font-bold text-black uppercase">Purchase Invoice</h3>
                                    <p className="text-sm font-semibold text-black">
                                        Invoice #{entry.invoiceNumber}
                                    </p>
                                    <p className="text-xs text-black">
                                        Date: {entry.invoiceDate ? fDate(entry.invoiceDate) : "—"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Highlight Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Total Amount
                                </span>
                                <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                                    {formatINR(entry.total || 0)}
                                </div>
                                <span className="text-xs text-slate-400 mt-1 block">Gross invoice total</span>
                            </div>

                            <div className="bg-emerald-50/70 p-5 rounded-xl border border-emerald-200">
                                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                                    Paid Amount
                                </span>
                                <div className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
                                    {formatINR(entry.paidAmount || 0)}
                                </div>
                                <span className="text-xs text-emerald-600 mt-1 block">Total settled to date</span>
                            </div>

                            <div className={cn(
                                "p-5 rounded-xl border",
                                remainingDue > 0
                                    ? "bg-rose-50/70 border-rose-200"
                                    : "bg-slate-50 border-slate-200"
                            )}>
                                <span className={cn(
                                    "text-xs font-semibold uppercase tracking-wider",
                                    remainingDue > 0 ? "text-rose-700" : "text-slate-500"
                                )}>
                                    Balance Due
                                </span>
                                <div className={cn(
                                    "text-2xl font-bold mt-1 tabular-nums",
                                    remainingDue > 0 ? "text-rose-600" : "text-slate-700"
                                )}>
                                    {formatINR(remainingDue)}
                                </div>
                                <span className="text-xs text-slate-400 mt-1 block">
                                    {remainingDue > 0 ? "Remaining payable" : "Fully cleared"}
                                </span>
                            </div>

                            <div className="bg-blue-50/70 p-5 rounded-xl border border-blue-200">
                                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                    Items Count
                                </span>
                                <div className="text-2xl font-bold text-blue-800 mt-1">
                                    {entry.items?.length || 0}
                                </div>
                                <span className="text-xs text-blue-600 mt-1 block">Unique medicine batches</span>
                            </div>
                        </div>

                        {/* Details Cards Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Supplier Card */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                    <Building2 className="w-4 h-4 text-blue-600" />
                                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                                        Supplier Details
                                    </h3>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Company / Vendor:</span>
                                        <span className="font-bold text-slate-900 text-sm">
                                            {entry.supplier?.name || "Unknown Supplier"}
                                        </span>
                                    </div>
                                    {entry.supplier?.contactPerson && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-medium">Contact Person:</span>
                                            <span className="font-semibold text-slate-700">
                                                {entry.supplier.contactPerson}
                                            </span>
                                        </div>
                                    )}
                                    {entry.supplier?.phone && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-medium">Phone:</span>
                                            <span className="font-semibold text-slate-700">
                                                {entry.supplier.phone}
                                            </span>
                                        </div>
                                    )}
                                    {entry.supplier?.email && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-medium">Email:</span>
                                            <span className="font-semibold text-slate-700">
                                                {entry.supplier.email}
                                            </span>
                                        </div>
                                    )}
                                    {entry.supplier?.gstin && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-medium">GSTIN:</span>
                                            <span className="font-mono font-semibold text-slate-700">
                                                {entry.supplier.gstin}
                                            </span>
                                        </div>
                                    )}
                                    {entry.supplier?.address && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-medium">Address:</span>
                                            <span className="font-semibold text-slate-700 text-right max-w-xs">
                                                {typeof entry.supplier.address === "string"
                                                    ? entry.supplier.address
                                                    : [
                                                          entry.supplier.address.line1,
                                                          entry.supplier.address.line2,
                                                          entry.supplier.address.city,
                                                          entry.supplier.address.state,
                                                      ]
                                                          .filter(Boolean)
                                                          .join(", ")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Invoice Metadata Card */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                    <Receipt className="w-4 h-4 text-emerald-600" />
                                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                                        Invoice Information
                                    </h3>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Invoice Number:</span>
                                        <span className="font-bold text-slate-900 font-mono">
                                            {entry.invoiceNumber || "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Invoice Date:</span>
                                        <span className="font-semibold text-slate-700">
                                            {entry.invoiceDate ? fDate(entry.invoiceDate) : "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">GST Computation:</span>
                                        <span className="font-semibold text-slate-700">
                                            {entry.gstEnabled ? "Enabled" : "Disabled"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">TCS (0.1%):</span>
                                        <span className="font-semibold text-slate-700">
                                            {entry.tscEnabled ? "Applied" : "Not Applied"}
                                        </span>
                                    </div>
                                    {entry.transportCharge > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-medium">Transport Charges:</span>
                                            <span className="font-semibold text-slate-700">
                                                {formatINR(entry.transportCharge)}
                                            </span>
                                        </div>
                                    )}
                                    {entry.description && (
                                        <div className="flex justify-between pt-1 border-t border-slate-100">
                                            <span className="text-slate-500 font-medium">Notes / Remarks:</span>
                                            <span className="text-slate-700 italic max-w-xs text-right">
                                                {entry.description}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Line Items Table */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <Boxes className="w-4 h-4 text-slate-500" />
                                    Purchased Items & Batches ({entry.items?.length || 0})
                                </h3>
                            </div>

                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-12 text-center font-bold text-slate-700">#</TableHead>
                                        <TableHead className="font-bold text-slate-700">Item Name</TableHead>
                                        <TableHead className="font-bold text-slate-700">Batch No</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-center">Expiry</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-center">Pack</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-center">Qty</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-center">Free</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-right">MRP / Unit</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-right">Purchase Price</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-center">GST %</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-right">Discount</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-right pr-4">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entry.items?.map((row, idx) => {
                                        const qty = row.quantity || 0;
                                        const pPrice = row.purchasePrice || 0;
                                        const disc = row.discount || 0;
                                        const gstVal = row.gst || 0;
                                        const rowTotal = Math.max(0, qty * pPrice - disc + gstVal);

                                        return (
                                            <TableRow key={row._id || idx} className="hover:bg-slate-50/50">
                                                <TableCell className="text-center font-semibold text-slate-400 text-xs">
                                                    {idx + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 text-sm">
                                                            {row.item?.name || "—"}
                                                        </span>
                                                        {row.item?.generic && (
                                                            <span className="text-xs text-slate-400">
                                                                {row.item.generic}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs font-semibold text-slate-700">
                                                    {row.batch || "—"}
                                                </TableCell>
                                                <TableCell className="text-center text-xs text-slate-600 font-medium">
                                                    {row.expiryDate ? fDate(row.expiryDate) : "—"}
                                                </TableCell>
                                                <TableCell className="text-center text-xs font-medium text-slate-600">
                                                    {row.pack || 1}
                                                </TableCell>
                                                <TableCell className="text-center text-xs font-bold text-slate-800">
                                                    {row.quantity}
                                                </TableCell>
                                                <TableCell className="text-center text-xs text-slate-500">
                                                    {row.free || 0}
                                                </TableCell>
                                                <TableCell className="text-right text-xs font-medium text-slate-600 tabular-nums">
                                                    {formatINR(row.unitPrice || 0)}
                                                </TableCell>
                                                <TableCell className="text-right text-xs font-semibold text-slate-800 tabular-nums">
                                                    {formatINR(row.purchasePrice || 0)}
                                                </TableCell>
                                                <TableCell className="text-center text-xs font-medium text-slate-600">
                                                    {row.gst ? `${row.gst}%` : "0%"}
                                                </TableCell>
                                                <TableCell className="text-right text-xs text-slate-600 tabular-nums">
                                                    {row.discount > 0 ? formatINR(row.discount) : "—"}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-slate-900 text-sm tabular-nums pr-4">
                                                    {formatINR(rowTotal)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Financial Totals Breakdown */}
                        <div className="flex justify-end">
                            <div className="w-full sm:w-96 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Gross Subtotal:</span>
                                    <span className="font-semibold tabular-nums">
                                        {formatINR(entry.subTotal || 0)}
                                    </span>
                                </div>
                                {entry.discount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Total Discount:</span>
                                        <span className="font-semibold tabular-nums">
                                            - {formatINR(entry.discount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-600">
                                    <span>Total Tax (GST):</span>
                                    <span className="font-semibold tabular-nums">
                                        {formatINR(entry.gst || 0)}
                                    </span>
                                </div>
                                {entry.transportCharge > 0 && (
                                    <div className="flex justify-between text-slate-600">
                                        <span>Transport Charges:</span>
                                        <span className="font-semibold tabular-nums">
                                            + {formatINR(entry.transportCharge)}
                                        </span>
                                    </div>
                                )}
                                <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-900 text-base font-bold">
                                    <span>Grand Total:</span>
                                    <span className="tabular-nums">{formatINR(entry.total || 0)}</span>
                                </div>
                                <div className="flex justify-between text-emerald-700 text-sm font-semibold">
                                    <span>Paid Amount:</span>
                                    <span className="tabular-nums">{formatINR(entry.paidAmount || 0)}</span>
                                </div>
                                <div className={cn(
                                    "flex justify-between text-sm font-bold pt-1 border-t border-slate-100",
                                    remainingDue > 0 ? "text-rose-600" : "text-slate-600"
                                )}>
                                    <span>Balance Due:</span>
                                    <span className="tabular-nums">{formatINR(remainingDue)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Print Only Signatures */}
                        <div className="hidden print:flex justify-between pt-16 mt-8 border-t border-slate-300 text-xs text-black">
                            <div>
                                <p className="font-bold">Prepared By</p>
                                <p className="mt-8">Pharmacist Signature</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">Authorized Signatory</p>
                                <p className="mt-8">Store Manager / Accountant</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Record Payment Dialog */}
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-800">
                            <CreditCard className="w-5 h-5 text-emerald-600" />
                            Record Supplier Payment
                        </DialogTitle>
                        <DialogDescription>
                            Invoice #{entry?.invoiceNumber} • {entry?.supplier?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {entry && (
                        <div className="space-y-4 py-2">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Invoice Value:</span>
                                    <span className="font-semibold text-slate-800">
                                        {formatINR(entry.total)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Previously Paid:</span>
                                    <span className="font-semibold text-emerald-600">
                                        {formatINR(entry.paidAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                                    <span className="text-slate-700">Remaining Balance Due:</span>
                                    <span className="text-rose-600">{formatINR(remainingDue)}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="singlePaymentAmount" className="text-xs font-bold text-slate-700">
                                    Payment Amount to Record (INR)
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                                        ₹
                                    </span>
                                    <Input
                                        id="singlePaymentAmount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={remainingDue}
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="pl-7 text-base font-bold text-slate-800"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsPaymentModalOpen(false)}
                            disabled={isSubmittingPayment}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            onClick={handlePaymentSubmit}
                            disabled={isSubmittingPayment}
                        >
                            {isSubmittingPayment ? "Recording..." : "Confirm Payment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}
