"use client";
import React, { useState } from "react";
import { ArrowLeft, ChevronDownIcon, Loader2, AlertTriangle, IndianRupee, Banknote, QrCode, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import AppShell from "@/components/layout/app-shell";
import { useRouter, useSearchParams } from "next/navigation";
import { formatINR, getDecimal } from "@/lib/fNumber";
import { fAge, fDate } from "@/lib/fDateAndTime";
import useSWR from "swr";
import { CustomerType, BillingRecord } from "./interface";
import { EmptyPurchases } from "./EmptyPurchases";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import Link from "next/link";
import { motion } from "framer-motion";
// Removed Datum and ReturnType as they are replaced by BillingRecord
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { OrderType } from "../../interface";
import PrintPrescription from "../../billing/PrintPrescription";
import PrintReceipt from "../../PrintReceipt";
import PharmacyHeader from "../../components/PharmacyHeader";
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

const Customer: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const { data: billingData, error, mutate } = useSWR<CustomerType>(
        id ? `/billing/single?q=${id}` : null
    );

    const billing = billingData?.data || [];

    const customer = React.useMemo(() => {
        if (billing.length === 0) return null;

        const patient = billing[0].patient;
        let totalSpend = 0;
        let totalPaid = 0;
        let totalVisit = 0;
        let lastPurchase = billing[0].createdAt;

        billing.forEach(b => {
            const itemsTotal = b.items.reduce((acc, it) => acc + (it.total || 0), 0);
            const rOff = b.roundOff ? getDecimal(itemsTotal) : 0;
            const paid = (b.cash || 0) + (b.online || 0) + (b.insurance || 0);

            if (b.transactionType === "Sale") {
                totalSpend += itemsTotal - rOff - (b.discount || 0);
                totalPaid += paid;
                totalVisit++;
            } else {
                totalSpend -= itemsTotal;
                totalPaid -= paid;
            }
        });

        return {
            patient,
            totalSpend,
            totalPaid,
            totalDue: Math.max(0, totalSpend - totalPaid),
            totalVisit,
            averageSpend: totalVisit > 0 ? totalSpend / totalVisit : 0,
            lastPurchase,
            billing // To keep UI compatible with .orders check if needed
        };
    }, [billing]);

    const [selectedVisit, setSelectedVisit] = useState<BillingRecord | null>(null);


    const [openCalendar, setOpenCalendar] = useState(false);
    const [date, setDate] = React.useState<DateRange | undefined>(undefined);

    const tabs = [
        { key: "all", label: "All" },
        { key: "sale", label: "Sale" },
        { key: "return", label: "Return" },
    ];

    const [type, setType] = useState("all");

    const [repeatLoading, setRepeatLoading] = useState(false)
    const [printingBill, setPrintingBill] = useState(false)
    const [printingPrescription, setPrintingPrescription] = useState(false)
    const [showRepeatConfirm, setShowRepeatConfirm] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)

    // Payment States
    const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI" | "Underpaid">("Cash");
    const [amountPaid, setAmountPaid] = useState("");
    const [referenceNumber, setReferenceNumber] = useState("");
    const [updatingPayment, setUpdatingPayment] = useState(false);

    const { data: profile } = useSWR<{ data: { pharmacy: { billing: { autoGenerateBill: boolean, prefix: string, defaultGst?: number } } }, message: string }>("/users/profile")
    const autoGenerateBill = profile?.data?.pharmacy?.billing?.autoGenerateBill ?? false
    const prefix = profile?.data?.pharmacy?.billing?.prefix ?? "INV"
    const defaultGst = profile?.data?.pharmacy?.billing?.defaultGst ?? 0

    const [printBill, setPrintBill] = useState<null | any>(null)
    const [printOrder, setPrintOrder] = useState<OrderType | null>(null);

    const handlePrintPrescription = async (order: { mrn?: string }) => {
        if (!order?.mrn) return;
        // We need to fetch full order details because selectedVisit might not have everything
        try {
            setPrintingPrescription(true);
            const params = new URLSearchParams()
            params.set("q", order.mrn)
            const { data } = await api.get<{ data: OrderType, message: string }>(`/pharmacy/orders/single?${params}`)
            setPrintOrder(data.data);
            setTimeout(() => {
                window.print();
                setPrintOrder(null);
            }, 800);
        } catch (error) {
            toast.error("Failed to fetch order details for printing");
        } finally {
            setPrintingPrescription(false);
        }
    };

    const handlePrintBill = async (mrn: string) => {
        try {
            setPrintingBill(true);
            const { data } = await api.get<{
                data: {
                    _id: string;
                    user: string;
                    patient: {
                        _id: string;
                        name: string;
                        phoneNumber: string;
                        gender: string;
                        dateOfBirth: string | null;
                        address: string;
                        mrn: string;
                    };
                    items: {
                        name: string;
                        quantity: number;
                        unitPrice: number;
                        gst: number;
                        discount: number;
                        total: number;
                    }[];
                    cash: number;
                    online: number;
                    insurance: number;
                    discount: number;
                    mrn: string;
                    roundOff: boolean;
                    transactionType: "Sale" | "Return";
                    createdAt: string;
                    updatedAt: string;
                }[], message: string
            }>(`/billing/single?q=${id}`)

            const bill = data.data.find(b => b.mrn === mrn);

            if (!bill) {
                toast.error("Bill not found");
                return;
            }

            // Map Items Logic
            const items = bill.items.map(e => {
                const unitPrice = e.unitPrice || 0;
                const quantity = e.quantity || 0;
                const itemGst = e.gst || 0;
                const total = e.total || 0;
                return {
                    gst: itemGst,
                    name: e.name,
                    quantity,
                    unitPrice,
                    total: total,
                };
            });

            const subtotal = items.reduce((a, b) => a + b.unitPrice * b.quantity, 0);
            const totalGst = items.reduce((a, b) => a + b.unitPrice * b.quantity * (b.gst / 100), 0);
            const discount = bill.discount || 0;
            const grandTotalBeforeRoundOff = subtotal + totalGst - discount;
            const roundOffAmount = bill.roundOff ? getDecimal(grandTotalBeforeRoundOff) : 0;
            const grandTotal = grandTotalBeforeRoundOff - roundOffAmount;

            setPrintBill({
                patient: bill.patient,
                payload: {
                    items,
                    cash: bill.cash,
                    discount,
                    insurance: bill.insurance,
                    online: bill.online,
                    patient: bill.patient._id,
                    department: "Pharmacy",
                    doctor: "N/A",
                    note: "",
                },
                invoiceDetails: {
                    totalGst,
                    prefix,
                    roundOffAmount,
                    subtotal,
                    grandTotal
                }
            });

            setTimeout(() => {
                window.print();
                setPrintBill(null);
            }, 800);
        } catch (error) {
            toast.error("Failed to fetch bill details for printing");
        } finally {
            setPrintingBill(false);
        }
    }

    const calculatedDueAmount = selectedVisit?.transactionType === "Sale" && selectedVisit?.items
        ? selectedVisit.items.reduce((a, b) => a + (b.total || 0), 0) - (selectedVisit?.discount || 0) - ((selectedVisit?.cash || 0) + (selectedVisit?.online || 0) + (selectedVisit?.insurance || 0))
        : 0;

    const handlePaymentUpdate = async () => {
        try {
            setUpdatingPayment(true);
            const payload = {
                cash: (selectedVisit?.cash || 0) + (paymentMethod === "Cash" ? calculatedDueAmount : (paymentMethod === "Underpaid" ? Number(amountPaid) : 0)),
                online: (selectedVisit?.online || 0) + (paymentMethod === "UPI" ? calculatedDueAmount : 0),
                insurance: (selectedVisit?.insurance || 0),
            };

            await api.patch(`/billing/add_payment/${selectedVisit?._id}`, payload);

            toast.success("Payment updated successfully");
            setShowPaymentModal(false);
            mutate();
            setAmountPaid("");
        } catch (error) {
            toast.error("Failed to update payment");
        } finally {
            setUpdatingPayment(false);
        }
    };

    return (
        <AppShell>
            <div className="p-5 print:hidden">
                <main className="space-y-6">
                    <PharmacyHeader
                        title="Customer Profile"
                        subtitle={`Viewing profile for ${customer?.patient?.name || 'Customer'}`}
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 rounded-full border-slate-300 bg-white/80 hover:bg-slate-50"
                            onClick={() => router.push("/dashboard/pharmacy/customers")}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to customers
                        </Button>
                    </PharmacyHeader>
                    {error && <EmptyPurchases />}
                    {!error && (
                        <>
                            <div className="border rounded-2xl bg-white shadow-sm px-5 py-4 flex flex-wrap items-start gap-4">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white text-lg font-semibold">
                                    {customer?.patient?.name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-[220px]">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                                            {customer?.patient?.name}
                                        </h1>
                                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                            {customer?.patient?.mrn}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {customer?.patient?.dateOfBirth && (
                                            <>
                                                Age {fAge(customer.patient.dateOfBirth).years}y / {fAge(customer.patient.dateOfBirth).months}m /{" "}
                                            </>
                                        )}
                                        {customer?.patient?.gender} • Ph:{" "}
                                        {customer?.patient?.phoneNumber}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {customer?.patient?.address}
                                    </p>
                                    {customer?.patient?.allergies && (
                                        <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 shadow-sm max-w-fit">
                                            <AlertTriangle className="h-4 w-4 shrink-0" />
                                            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                                Allergies: <span className="text-sm normal-case font-semibold bg-yellow-100 px-2 py-0.5 rounded text-amber-900 border border-amber-200/50">{customer.patient.allergies}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                                        {customer?.billing.length === 0 && (
                                            <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                                                No purchase history yet
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="border rounded-2xl p-4 bg-linear-to-br from-indigo-50 to-indigo-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
                                    <div className="text-xs font-medium text-indigo-700 uppercase tracking-wide">
                                        Total Spend
                                    </div>
                                    <div className="text-2xl font-bold text-indigo-900">
                                        {formatINR(customer?.totalSpend ?? 0)}
                                    </div>
                                </div>


                                <div className="border rounded-2xl p-4 bg-linear-to-br from-emerald-50 to-emerald-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
                                    <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                                        Total Paid
                                    </div>
                                    <div className="text-2xl font-bold text-emerald-900">
                                        {formatINR(customer?.totalPaid ?? 0)}
                                    </div>
                                </div>


                                <div className="border rounded-2xl p-4 bg-linear-to-br from-rose-50 to-rose-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
                                    <div className="text-xs font-medium text-rose-700 uppercase tracking-wide">
                                        Total Due
                                    </div>
                                    <div className="text-2xl font-bold text-rose-900">
                                        {formatINR(customer?.totalDue ?? 0)}
                                    </div>
                                </div>


                                <div className="border rounded-2xl p-4 bg-linear-to-br from-sky-50 to-sky-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
                                    <div className="text-xs font-medium text-sky-700 uppercase tracking-wide">
                                        Total Visits
                                    </div>
                                    <div className="text-3xl font-semibold text-sky-900">
                                        {customer?.totalVisit}
                                    </div>
                                </div>
                                <div className="border rounded-2xl p-4 bg-linear-to-br from-violet-50 to-violet-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
                                    <div className="text-xs font-medium text-violet-700 uppercase tracking-wide">
                                        Last Purchase
                                    </div>
                                    <div className="text-sm font-semibold text-violet-900">
                                        {customer?.lastPurchase ? fDate(customer.lastPurchase) : "N/A"}
                                    </div>
                                </div>
                                <div className="border rounded-2xl p-4 bg-linear-to-br from-amber-50 to-amber-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
                                    <div className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                                        Avg Spend
                                    </div>
                                    <div className="text-2xl font-semibold text-amber-900">
                                        {formatINR(customer?.averageSpend || 0)}
                                    </div>
                                </div>
                            </section>

                            <section className="grid gap-5 md:grid-cols-5 items-start">
                                <div className="md:col-span-2 border rounded-2xl bg-white shadow-sm flex flex-col h-[480px]">
                                    <div className="px-4 py-3 bg-slate-900 text-slate-50 flex items-center justify-between">
                                        <div className="text-sm font-medium flex items-center gap-2">
                                            <span className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[11px]">
                                                {customer?.totalVisit}
                                            </span>
                                            Bills / Visits
                                        </div>
                                        <div className="text-[11px] text-slate-200">
                                            {customer?.totalVisit !== 0 ? customer?.totalVisit : "No"}{" "}
                                            bill
                                            {customer?.totalVisit === 1 ? "" : "s"}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center bg-slate-50 px-2 py-2">
                                        <div className="flex items-center gap-3 text-[12px] text-slate-700">
                                            <span className="font-medium">Filter:</span>

                                            <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        id="date"
                                                        className="w-64 justify-between font-normal"
                                                    >
                                                        {date?.from && date?.to
                                                            ? `${fDate(date.from)} to ${fDate(date.to)}`
                                                            : "Select date"}
                                                        <ChevronDownIcon />
                                                    </Button>
                                                </PopoverTrigger>

                                                <PopoverContent
                                                    className="w-auto overflow-hidden p-0"
                                                    align="start"
                                                >
                                                    <Calendar
                                                        mode="range"
                                                        selected={date}
                                                        captionLayout="dropdown"
                                                        numberOfMonths={2}
                                                        onSelect={(s) => {
                                                            setDate(s);

                                                            const { from, to } = s || {};

                                                            if (
                                                                from &&
                                                                to &&
                                                                from !== to &&
                                                                (from !== date?.from || to !== date?.to)
                                                            ) {
                                                                setOpenCalendar(false);
                                                            }
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>

                                            {date?.from && date?.to && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-[11px] px-3"
                                                    onClick={() => {
                                                        setDate({ from: undefined, to: undefined });
                                                    }}
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>

                                        <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1">
                                            {tabs.map(({ key, label }: { key: string; label: string }) => {
                                                const active = type === key;
                                                return (
                                                    <button
                                                        key={key}
                                                        onClick={() => setType(key)}
                                                        className={
                                                            "relative flex items-center gap-2 rounded-full px-2 py-1.5 transition will-change-transform cursor-pointer " +
                                                            (active ? "text-white" : "text-gray-700")
                                                        }
                                                        type="button"
                                                    >
                                                        {active && (
                                                            <motion.span
                                                                layoutId="tab-indicator-1"
                                                                className="absolute inset-0 rounded-full"
                                                                style={{ background: "linear-gradient(90deg,#4f46e5,#d946ef)" }}
                                                                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                                                            />
                                                        )}
                                                        <span className="relative z-10 flex items-center gap-1 text-sm">
                                                            {label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>


                                    </div>

                                    <div className="flex-1 overflow-y-auto divide-y">

                                        {(() => {
                                            // 1. Combine Data
                                            let combined = billing.map(b => ({
                                                ...b,
                                                type: b.transactionType.toLowerCase()
                                            }));

                                            // 2. Filter by Tab Type (sale, return, all)
                                            if (type !== "all") {
                                                combined = combined.filter((item) => item.type === type);
                                            }

                                            // 3. Filter by Date Range
                                            if (date?.from && date?.to) {
                                                const start = new Date(date.from);
                                                const end = new Date(date.to);
                                                end.setHours(23, 59, 59, 999);
                                                combined = combined.filter((item) => {
                                                    if (!item.createdAt) return false;
                                                    const created = new Date(item.createdAt);
                                                    return created >= start && created <= end;
                                                });
                                            }

                                            // 4. Sort by Date Descending
                                            combined.sort(
                                                (a, b) => {
                                                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                                                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                                                    return dateB - dateA;
                                                }
                                            );

                                            // 5. Render
                                            return combined.map((item: any) => {
                                                const active = selectedVisit && selectedVisit._id === item._id;
                                                const isReturn = item.type === "return";

                                                const itemsTotal = item.items.reduce((a: number, b: any) => a + (b.total || 0), 0);
                                                const rOff = item.roundOff ? getDecimal(itemsTotal) : 0;
                                                const paid = (item.cash || 0) + (item.online || 0) + (item.insurance || 0);
                                                const netTotal = itemsTotal - rOff - (item.discount || 0);
                                                const due = Math.max(0, netTotal - paid);

                                                return (
                                                    <button
                                                        key={item._id}
                                                        type="button"
                                                        onClick={() => setSelectedVisit(item)}
                                                        className={`w-full text-left px-4 py-3.5 text-[15px] flex flex-col gap-1 transition-all duration-150 ${active
                                                            ? "bg-slate-900 text-slate-50"
                                                            : "hover:bg-slate-50"
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            {isReturn ? (
                                                                // Return Item Header
                                                                <>
                                                                    <span className="font-medium">
                                                                        {fDate(item.createdAt)} - {item.mrn} - Return
                                                                    </span>
                                                                    <span className="text-xs font-semibold">
                                                                        {formatINR(itemsTotal)}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                // Sale Item Header
                                                                <>
                                                                    <span className="font-medium">
                                                                        {fDate(item.createdAt)} • {item.mrn}
                                                                    </span>
                                                                    <div className="text-right flex flex-col items-end">
                                                                        <span className={`text-[13px] font-bold ${active ? "text-slate-50" : "text-slate-900"}`}>
                                                                            {formatINR(netTotal)}
                                                                        </span>
                                                                        {due > 0 && (
                                                                            <span className={`text-[10px] font-bold uppercase tracking-tight ${active ? "text-rose-300" : "text-rose-500"}`}>
                                                                                Due: {formatINR(due)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between gap-2 text-[12px]">
                                                            <span className={active ? "opacity-80" : "text-slate-500"}>
                                                                {item.items.length} item
                                                                {item.items.length === 1 ? "" : "s"}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            });
                                        })()}


                                    </div>
                                </div>

                                <div className="md:col-span-3 border rounded-2xl bg-white shadow-sm flex flex-col h-[480px]">
                                    <div className="px-4 py-3 bg-slate-50 flex items-center justify-between border-b">
                                        <div className="text-sm font-semibold text-slate-900">
                                            {selectedVisit?.transactionType === "Sale" ? "Sale" : "Return"} Details — {selectedVisit?.mrn || selectedVisit?._id}
                                        </div>
                                        {selectedVisit && (
                                            <div className="text-[11px] text-slate-500 flex flex-col items-end">
                                                <span>
                                                    Date:{" "}
                                                    <span className="font-medium text-slate-700">
                                                        {fDate(selectedVisit.createdAt)}
                                                    </span>
                                                </span>
                                                {selectedVisit?.mrn && <span>
                                                    RX ID:{" "}
                                                    <span className="font-medium text-slate-700">
                                                        {selectedVisit.mrn}
                                                    </span>
                                                </span>}
                                            </div>
                                        )}
                                    </div>

                                    {!selectedVisit && (
                                        <div className="p-6 text-sm text-slate-500">
                                            Select a bill on the left to see its item-wise details.
                                        </div>
                                    )}

                                    {selectedVisit && (
                                        <>
                                            <div className="flex-1 overflow-auto">
                                                <table className="w-full text-[15px]">
                                                    <thead className="bg-slate-50 text-slate-700 sticky top-0 text-sm">
                                                        <tr>
                                                            <th className="p-2 text-left font-medium">Sl</th>
                                                            <th className="p-2 text-left font-medium">
                                                                Medicine
                                                            </th>
                                                            <th className="p-2 text-right font-medium">
                                                                Qty
                                                            </th>
                                                            <th className="p-2 text-right font-medium">
                                                                MRP
                                                            </th>
                                                            <th className="p-2 text-right font-medium">
                                                                Amount
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedVisit.items.map((it, i) => {
                                                            const amount = it.total || 0;
                                                            return (
                                                                <tr
                                                                    key={it.name + i}
                                                                    className="border-t align-top hover:bg-slate-50/70 transition-colors"
                                                                >
                                                                    <td className="p-2 align-top text-slate-500">
                                                                        {i + 1}
                                                                    </td>
                                                                    <td className="p-2 align-top">
                                                                        <div className="font-medium text-slate-900 leading-snug">
                                                                            {it.name}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2 align-top text-right text-sm font-semibold text-slate-900">
                                                                        {it.quantity}
                                                                    </td>
                                                                    <td className="p-2 align-top text-right text-slate-800">
                                                                        {formatINR(it.unitPrice)}
                                                                    </td>
                                                                    <td className="p-2 align-top text-right font-semibold text-slate-900">
                                                                        {formatINR(amount)}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}

                                                        {selectedVisit.items.length === 0 && (
                                                            <tr>
                                                                <td
                                                                    className="p-3 text-center text-slate-500"
                                                                    colSpan={5}
                                                                >
                                                                    No items.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                    <tfoot className="bg-slate-50/80 font-medium">
                                                        <tr className="border-t">
                                                            <td colSpan={4} className="p-2 text-right text-xs text-slate-600">
                                                                Sub Total
                                                            </td>
                                                            <td className="p-2 text-right text-sm font-semibold text-slate-900">
                                                                {formatINR(
                                                                    selectedVisit.items.reduce((a, b) => a + (b.total || 0), 0)
                                                                )}
                                                            </td>
                                                        </tr>
                                                        {selectedVisit?.transactionType === "Sale" && (
                                                            <>
                                                                <tr className="border-t">
                                                                    <td colSpan={4} className="p-2 text-right text-xs text-slate-600">
                                                                        Discount
                                                                    </td>
                                                                    <td className="p-2 text-right text-sm font-semibold text-slate-900">
                                                                        {formatINR(selectedVisit?.discount || 0)}
                                                                    </td>
                                                                </tr>
                                                                <tr className="border-t">
                                                                    <td colSpan={4} className="p-2 text-right text-xs text-slate-600">
                                                                        Amount Paid
                                                                    </td>
                                                                    <td className="p-2 text-right text-sm font-semibold text-emerald-700">
                                                                        {formatINR(
                                                                            (selectedVisit?.cash || 0) +
                                                                            (selectedVisit?.online || 0) +
                                                                            (selectedVisit?.insurance || 0)
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr className="border-t">
                                                                    <td colSpan={4} className="p-2 text-right text-xs text-slate-600">
                                                                        Due Amount
                                                                    </td>
                                                                    <td className="p-2 text-right text-sm font-semibold text-rose-500">
                                                                        {formatINR(
                                                                            selectedVisit.items.reduce((a, b) => a + (b.total || 0), 0) -
                                                                            (selectedVisit?.discount || 0) -
                                                                            ((selectedVisit?.cash || 0) +
                                                                                (selectedVisit?.online || 0) +
                                                                                (selectedVisit?.insurance || 0))
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            </>
                                                        )}
                                                        <tr className="border-t bg-slate-100/50">
                                                            <td colSpan={4} className="p-2 text-right text-xs font-bold text-slate-700">
                                                                Total
                                                            </td>
                                                            <td className="p-2 text-right text-sm font-bold text-slate-900">
                                                                {formatINR(
                                                                    selectedVisit.items.reduce((a, b) => a + (b.total || 0), 0) -
                                                                    (selectedVisit?.discount || 0)
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>

                                            {selectedVisit?.mrn && <div className="px-4 py-3 border-t bg-slate-50 flex items-center justify-between gap-3">
                                                <div className="text-[12px] text-slate-500">

                                                </div>
                                                <div className="flex items-center gap-2">

                                                    {calculatedDueAmount > 0 && (
                                                        <Button
                                                            className="rounded-full text-sm px-6 py-2 bg-slate-900 text-white hover:bg-slate-800"
                                                            onClick={() => setShowPaymentModal(true)}
                                                        >
                                                            Pay Due Amount
                                                        </Button>
                                                    )}

                                                    <AlertDialog open={showRepeatConfirm} onOpenChange={setShowRepeatConfirm}>
                                                        <Button
                                                            disabled={repeatLoading}
                                                            className="rounded-full text-sm px-6 py-2 bg-slate-900 text-white hover:bg-slate-800"
                                                            onClick={() => setShowRepeatConfirm(true)}
                                                        >
                                                            {repeatLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            Repeat Prescription
                                                        </Button>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Repeat Prescription?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to repeat this prescription? This will create a new order with the same items.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-slate-900 text-white hover:bg-slate-800"
                                                                    onClick={async () => {
                                                                        try {
                                                                            setRepeatLoading(true)
                                                                            await toast.promise(api.post(`/pharmacy/orders/repeat_order/${selectedVisit?._id}`), {
                                                                                loading: "Loading...",
                                                                                success: "Repeat Prescription",
                                                                                error: "Something went wrong"
                                                                            })
                                                                            const updatedData = await mutate()
                                                                            setSelectedVisit(updatedData?.data[0] ?? null)
                                                                        } catch (error) {
                                                                            // Handle error
                                                                        } finally {
                                                                            setRepeatLoading(false)
                                                                        }
                                                                    }}
                                                                >
                                                                    Confirm
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    <Button
                                                        className="rounded-full text-sm px-6 py-2 bg-slate-900 text-white hover:bg-slate-800"
                                                        disabled={printingBill}
                                                        onClick={() => selectedVisit.mrn && handlePrintBill(selectedVisit.mrn)}
                                                    >
                                                        {printingBill ? "Printing..." : "Print bill"}
                                                    </Button>
                                                    <Button
                                                        className="rounded-full text-sm px-6 py-2 bg-slate-900 text-white hover:bg-slate-800"
                                                        disabled={printingPrescription}
                                                        onClick={() => handlePrintPrescription(selectedVisit)}
                                                    >
                                                        {printingPrescription ? "Printing..." : "Print Prescription"}
                                                    </Button>

                                                    <Button
                                                        className="rounded-full text-sm px-6 py-2 bg-slate-900 text-white hover:bg-slate-800"
                                                        asChild
                                                    >
                                                        <Link href={selectedVisit.mrn ? `/dashboard/pharmacy/return/?mrn=${selectedVisit.mrn}` : `#`}>
                                                            Return
                                                        </Link>
                                                    </Button>



                                                </div>
                                            </div>}
                                        </>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </main>
            </div>
            {printOrder && <PrintPrescription order={printOrder} />}
            {Boolean(printBill) && <PrintReceipt payload={printBill?.payload} invoiceDetails={printBill?.invoiceDetails} patient={printBill?.patient} />}

            {/* Payment Modal */}
            <AlertDialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <AlertDialogContent className="max-w-2xl!">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Pay Due Amount</AlertDialogTitle>
                        <AlertDialogDescription>
                            Select payment method and enter the amount collected from the customer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="flex flex-col gap-4 py-4">
                        <div className="flex items-center justify-between bg-rose-50 border border-rose-100 p-4 rounded-xl">
                            <span className="text-sm font-bold text-rose-700 uppercase tracking-wider">Total Due</span>
                            <div className="flex items-center text-rose-900">
                                <IndianRupee className="w-5 h-5 stroke-[2.5] mr-0.5 text-rose-700" />
                                <span className="text-3xl font-extrabold leading-none tracking-tight">
                                    {Math.max(0, calculatedDueAmount)}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { id: "Cash", label: "Cash Payment", icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50" },
                                { id: "UPI", label: "UPI / Scanner", icon: QrCode, color: "text-indigo-600", bg: "bg-indigo-50" },
                                { id: "Underpaid", label: "Partial / Due", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
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
                                        <div className={cn("p-2 rounded-lg", active ? "bg-white" : "bg-slate-50 group-hover:bg-white")}>
                                            <method.icon className={cn("h-5 w-5", active ? method.color : "text-slate-400")} />
                                        </div>
                                        <div>
                                            <div className={cn("text-sm font-bold", active ? "text-slate-900" : "text-slate-600")}>{method.label}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {paymentMethod === "Cash" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Amount Collected (₹)</Label>
                                    <Input
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
                                        (Number(amountPaid) - calculatedDueAmount) >= 0
                                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                            : "bg-rose-50 border-rose-100 text-rose-700"
                                    )}>
                                        {formatINR(Math.max(0, Number(amountPaid) - calculatedDueAmount))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {paymentMethod === "Underpaid" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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
                                        onKeyDown={(e) => e.key === "Enter" && handlePaymentUpdate()}
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
                                    onKeyDown={(e) => e.key === "Enter" && handlePaymentUpdate()}
                                    className="h-11 bg-white border-slate-200 rounded-lg focus:ring-indigo-500/20"
                                />
                            </div>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={updatingPayment}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handlePaymentUpdate}
                            disabled={updatingPayment}
                            className="bg-slate-900 text-white hover:bg-slate-800"
                        >
                            {updatingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirm Payment
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppShell>
    );
};

export default Customer;
