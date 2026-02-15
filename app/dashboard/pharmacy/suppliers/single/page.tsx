"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import PharmacyHeader from "../../components/PharmacyHeader";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, ChevronDownIcon, Phone, MapPin, FileText, ShieldCheck, RefreshCw } from "lucide-react";
import { Supplier, SupplierOrder } from "../interface";
import { formatINR } from "@/lib/fNumber";
import { fDate } from "@/lib/fDateAndTime";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import useSWR from "swr";
import api from "@/lib/axios";
import { addDays } from "date-fns";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

const SingleSupplierPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const { data: supplier, error: supplierError, isLoading: isSupplierLoading } = useSWR<Supplier>(id ? `/suppliers/${id}` : null, fetcher);
    const { data: ordersData, error: ordersError, isLoading: isOrdersLoading, mutate: mutateOrders } = useSWR<{ data: SupplierOrder[]; message: string }>(id ? `/purchase_entry/supplier/${id}` : null, (url: string) => api.get(url).then((res) => res.data));

    const orders = ordersData?.data || [];

    const totalPurchaseValue = React.useMemo(() => {
        return orders.reduce((sum: number, order: SupplierOrder) => sum + (order.total || 0), 0);
    }, [orders]);



    const totalDueAmount = React.useMemo(() => {
        return orders.reduce((sum: number, order: SupplierOrder) => sum + (order.total - order.paidAmount), 0);
    }, [orders]);

    // Filter State
    const [date, setDate] = React.useState<DateRange | undefined>(undefined);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [type, setType] = useState("all");

    const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    // Update selected order when orders list changes or to keep it in sync with fresh data
    React.useEffect(() => {
        if (orders.length > 0) {
            if (!selectedOrder) {
                setSelectedOrder(orders[0]);
            } else {
                // Keep the selected order in sync with the latest data from the orders array
                const updatedOrder = orders.find((o: SupplierOrder) => o._id === selectedOrder._id);
                if (updatedOrder && JSON.stringify(updatedOrder) !== JSON.stringify(selectedOrder)) {
                    setSelectedOrder(updatedOrder);
                }
            }
        }
    }, [orders, selectedOrder]);

    const tabs = [
        { key: "all", label: "All" },
        { key: "Pending", label: "Pending" },
        { key: "Partially Paid", label: "Partially Paid" },
        { key: "Paid", label: "Paid" },
    ];

    const filteredOrders = React.useMemo(() => {
        let result = [...orders];

        // Filter by Type (Payment Status)
        if (type !== "all") {
            result = result.filter(o => o.paymentStatus === type);
        }

        // Filter by Date Range
        if (date?.from && date?.to) {
            const start = new Date(date.from);
            const end = new Date(date.to);
            end.setHours(23, 59, 59, 999);
            result = result.filter((item) => {
                const itemDate = new Date(item.invoiceDate);
                return itemDate >= start && itemDate <= end;
            });
        }

        return result;
    }, [orders, type, date, supplier?.paymentTerms]);

    const sortedFilteredOrders = React.useMemo(() => {
        return [...filteredOrders].sort((a, b) => {
            const isDueA = a.paymentStatus !== "Paid";
            const isDueB = b.paymentStatus !== "Paid";

            // 1. Prioritize Due orders over Paid orders
            if (isDueA && !isDueB) return -1;
            if (!isDueA && isDueB) return 1;

            if (isDueA && isDueB) {
                // 2. Both are due: Sort by nearest Due Date first (Ascending)
                const dueDateA = addDays(new Date(a.invoiceDate), supplier?.paymentTerms || 0).getTime();
                const dueDateB = addDays(new Date(b.invoiceDate), supplier?.paymentTerms || 0).getTime();
                return dueDateA - dueDateB;
            } else {
                // 3. Both are paid: Sort by Invoice Date (Descending - newest first)
                return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
            }
        });
    }, [filteredOrders, supplier?.paymentTerms]);

    const handlePaymentSubmit = async () => {
        if (!selectedOrder) return;

        const amount = Number(paymentAmount);
        const due = selectedOrder.total - selectedOrder.paidAmount;

        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (amount > due) {
            toast.error(`Payment amount (₹${amount}) cannot exceed due amount (₹${due.toFixed(2)})`);
            return;
        }

        setIsSubmittingPayment(true);
        try {
            await api.patch(`/purchase_entry/add_payment/${selectedOrder._id}`, { paidAmount: amount });
            toast.success("Payment successful");
            setIsPaymentModalOpen(false);
            setPaymentAmount("");
            mutateOrders();
        } catch (error: any) {
            console.error("Payment error:", error);
            toast.error(error.response?.data?.message || "Failed to process payment");
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    if (isSupplierLoading || isOrdersLoading) {
        return (
            <AppShell>
                <div className="flex items-center justify-center h-screen ">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
                </div>
            </AppShell>
        );
    }

    if (supplierError || ordersError || !supplier) {
        return (
            <AppShell>
                <div className="p-10 text-center text-slate-500 ">
                    <p className="text-red-500 mb-4">{supplierError || ordersError ? "Failed to load details" : "Supplier not found"}</p>
                    <div className="flex justify-center gap-2">
                        <Button variant="outline" onClick={() => router.push("/dashboard/pharmacy/suppliers")}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                        <Button variant="default" onClick={() => { mutateOrders(); }}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="p-5 min-h-[calc(100vh-80px)] ">
                <main className="flex flex-col gap-6">
                    <PharmacyHeader
                        title={supplier.name}
                        subtitle={`GSTIN: ${supplier.gstin || "N/A"}`}
                    >
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="gap-1 rounded-full border-slate-300 bg-white/80 hover:bg-slate-50"
                                onClick={() => router.push("/dashboard/pharmacy/suppliers")}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                            <Button
                                className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
                                onClick={() => router.push(`/dashboard/pharmacy/suppliers/purchase-entry?supplierId=${supplier._id}`)}
                            >
                                Purchase Entry
                            </Button>
                        </div>
                    </PharmacyHeader>

                    {/* Stats Section */}
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="border rounded-2xl p-4 bg-linear-to-br from-emerald-50 to-emerald-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
                            <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide ">
                                Total Purchase Value
                            </div>
                            <div className="text-2xl font-semibold text-emerald-900 ">
                                {formatINR(totalPurchaseValue)}
                            </div>
                        </div>
                        <div className="border rounded-2xl p-4 bg-rose-50/50 border-rose-100 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
                            <div className="text-xs font-medium text-rose-700 uppercase tracking-wide ">
                                Total Due Amount
                            </div>
                            <div className="text-3xl font-semibold text-rose-900 ">
                                {formatINR(totalDueAmount)}
                            </div>
                        </div>
                        <div className="border rounded-2xl p-4 bg-white flex flex-col gap-1 shadow-sm col-span-2 transition-transform duration-150 hover:-translate-y-[2px]">
                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide ">
                                Details
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="p-2 bg-sky-100 rounded-lg">
                                        <Phone className="w-3.5 h-3.5 text-sky-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight leading-none mb-1 ">Phone</p>
                                        <p className="font-semibold text-slate-900 text-sm leading-none ">{supplier.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight leading-none mb-1 ">MSME Number</p>
                                        <p className="font-semibold text-slate-900 text-sm leading-none ">{supplier.msme || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight leading-none mb-1 ">Address</p>
                                        <p className="font-medium text-slate-700 text-sm leading-snug  truncate max-w-[200px]" title={`${supplier.address.line1}${supplier.address.line2 ? `, ${supplier.address.line2}` : ""}${supplier.address.city ? `, ${supplier.address.city}` : ""}`}>
                                            {supplier.address.line1}
                                            {supplier.address.line2 && <span className="text-slate-500">, {supplier.address.line2}</span>}
                                            {supplier.address.city && <span className="text-slate-500">, {supplier.address.city}</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight leading-none mb-1 ">DL Number</p>
                                        <p className="font-semibold text-slate-900 text-sm leading-none ">{supplier.dlNo || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Split View */}
                    <section className="grid gap-5 md:grid-cols-5 items-start">
                        {/* LEFT: Order List */}
                        <div className="md:col-span-2 border rounded-2xl bg-white shadow-sm flex flex-col h-[480px]">
                            <div className="px-4 py-3 bg-slate-900 text-slate-50 flex items-center justify-between">
                                <div className="text-sm font-medium flex items-center gap-2 ">
                                    <span className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[11px] ">
                                        {filteredOrders.length}
                                    </span>
                                    Purchase Orders
                                </div>
                            </div>

                            {/* Filter Bar */}
                            <div className="flex justify-between items-center bg-slate-50 px-2 py-2 border-b">
                                <div className="flex items-center gap-3 text-[12px] text-slate-700 ">
                                    <span className="font-medium ">Filter:</span>

                                    <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                id="date"
                                                className="w-40 justify-between font-normal h-8 text-[11px] px-2 "
                                            >
                                                {date?.from && date?.to
                                                    ? `${fDate(date.from)} - ${fDate(date.to)}`
                                                    : "Select date"}
                                                <ChevronDownIcon className="h-3 w-3 opacity-50 " />
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
                                                    if (from && to && from !== to && (from !== date?.from || to !== date?.to)) {
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
                                            className="h-8 text-[11px] px-2 text-slate-500 hover:text-slate-900 "
                                            onClick={() => setDate(undefined)}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>

                                <div className="relative inline-flex items-center gap-1 text-xs bg-white border border-gray-200 rounded-full p-0.5 ">
                                    {tabs.map(({ key, label }) => {
                                        const active = type === key;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setType(key)}
                                                className={cn(
                                                    "relative flex items-center gap-2 rounded-full px-2 py-1 transition will-change-transform cursor-pointer ",
                                                    active ? "text-white" : "text-gray-700"
                                                )}
                                                type="button"
                                            >
                                                {active && (
                                                    <motion.span
                                                        layoutId="tab-indicator-supplier"
                                                        className="absolute inset-0 rounded-full"
                                                        style={{ background: "linear-gradient(90deg,#4f46e5,#d946ef)" }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                                                    />
                                                )}
                                                <span className="relative z-10 font-medium ">
                                                    {label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto divide-y ">
                                {sortedFilteredOrders.map((order) => {
                                    const active = selectedOrder?._id === order._id;
                                    const isDue = order.paymentStatus !== "Paid";
                                    const dueDate = addDays(new Date(order.invoiceDate), supplier?.paymentTerms || 0);
                                    const isOverdue = isDue && new Date() > dueDate;

                                    return (
                                        <button
                                            key={order._id}
                                            type="button"
                                            onClick={() => setSelectedOrder(order)}
                                            className={cn(
                                                "w-full text-left px-4 py-3.5 text-[15px] flex flex-col gap-1 transition-all duration-150 ",
                                                active ? "bg-slate-900 text-slate-50" : "hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-2 ">
                                                <span className={cn("font-medium ", active ? "text-slate-50" : "text-slate-900")}>
                                                    {order.invoiceNumber}
                                                </span>
                                                <span className={cn("text-xs font-semibold ", active ? "text-slate-200" : "text-slate-900")}>
                                                    {formatINR(order.total)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 text-[12px] ">
                                                <span className={cn("", active ? "text-slate-400" : "text-slate-500")}>
                                                    {fDate(order.invoiceDate)}
                                                </span>
                                                <div className="flex items-center justify-between gap-2">
                                                    <Badge
                                                        className={cn(
                                                            "rounded-full px-3",
                                                            order.paymentStatus === "Paid"
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                                : order.paymentStatus === "Partially Paid"
                                                                    ? "bg-amber-50 text-amber-700 border-amber-100"
                                                                    : "bg-rose-50 text-rose-700 border-rose-100"
                                                        )}
                                                        variant="outline"
                                                    >
                                                        {order.paymentStatus}
                                                    </Badge>


                                                    {isDue && (
                                                        <>
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    "rounded-full px-3",
                                                                    isOverdue
                                                                        ? "bg-rose-50 text-rose-900 border-rose-200 animate-pulse-subtle font-bold px-2.5 py-0.5"
                                                                        : "bg-orange-50 text-orange-900 border-orange-200 font-bold px-2.5 py-0.5"
                                                                )}
                                                            >
                                                                {isOverdue ? "Overdue: " : "Due date: "}{fDate(dueDate)}
                                                            </Badge>
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    "rounded-full px-3 font-bold",
                                                                    !active
                                                                        ? "bg-orange-50 text-orange-900 border-orange-200 ring-1 ring-orange-200/50"
                                                                        : "bg-rose-50 text-rose-900 border-rose-200 ring-1 ring-rose-200/50"
                                                                )}
                                                            >
                                                                {formatINR(order.total - order.paidAmount)}
                                                            </Badge>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                                {filteredOrders.length === 0 && (
                                    <div className="p-8 text-center text-slate-500 text-sm ">
                                        No orders found.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Order Details */}
                        <div className="md:col-span-3 border rounded-2xl bg-white shadow-sm flex flex-col h-[480px]">
                            <div className="px-4 py-3 bg-slate-50 flex items-center justify-between border-b">
                                <div className="text-sm font-semibold text-slate-900 ">
                                    {selectedOrder ? `Order Details — ${selectedOrder.invoiceNumber}` : "Select an Order"}
                                </div>
                                {selectedOrder && selectedOrder.paymentStatus !== "Paid" && (
                                    <div className="text-[11px] text-slate-500 flex flex-col items-end ">
                                        <span className="">
                                            Due Date:{" "}
                                            <span className="font-medium text-slate-700 ">
                                                {selectedOrder && fDate(addDays(new Date(selectedOrder.invoiceDate), supplier.paymentTerms || 0))}
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {!selectedOrder && (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 ">
                                    <p className="">Select an order from the list to view details.</p>
                                </div>
                            )}

                            {selectedOrder && (
                                <div className="flex-1 overflow-auto ">
                                    <div className="p-4 bg-slate-50 border-b flex flex-wrap gap-4 text-[13px]">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-slate-500">GST:</span>
                                            <Badge variant="outline" className={cn("text-[10px] uppercase font-semibold", selectedOrder.gstEnabled ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-slate-400 border-slate-200")}>
                                                {selectedOrder.gstEnabled ? "Enabled" : "Disabled"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-slate-500">TSC:</span>
                                            <Badge variant="outline" className={cn("text-[10px] uppercase font-semibold", selectedOrder.tscEnabled ? "text-amber-600 border-amber-200 bg-amber-50" : "text-slate-400 border-slate-200")}>
                                                {selectedOrder.tscEnabled ? "Enabled" : "Disabled"}
                                            </Badge>
                                        </div>
                                        <div className="ml-auto text-slate-500">
                                            Total Items: <span className="font-semibold text-slate-900">{selectedOrder.items.length}</span>
                                        </div>
                                    </div>

                                    <table className="w-full text-[13px] ">
                                        <thead className="bg-slate-50 text-slate-700 sticky top-0 text-[11px] uppercase tracking-wider  border-b">
                                            <tr>
                                                <th className="p-3 text-left font-medium">Item Details</th>
                                                <th className="p-3 text-left font-medium">Batch / Expiry</th>
                                                <th className="p-3 text-right font-medium">Qty/Pack</th>
                                                <th className="p-3 text-right font-medium">Free</th>
                                                <th className="p-3 text-right font-medium">Rate</th>
                                                <th className="p-3 text-right font-medium">GST</th>
                                                <th className="p-3 text-right font-medium">Discount</th>
                                                <th className="p-3 text-right font-medium pr-6">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 ">
                                            {selectedOrder.items?.map((item, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50  group">
                                                    <td className="p-3">
                                                        <div className="font-semibold text-slate-900">{item.item.name}</div>
                                                        <div className="text-[11px] text-slate-500">HSN: {item.item.hsnCode || "N/A"}</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="text-slate-700 font-medium">{item.batch}</div>
                                                        <div className="text-[11px] text-slate-500">{fDate(item.expiryDate)}</div>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="text-slate-900 font-medium">{item.quantity}</div>
                                                        <div className="text-[11px] text-slate-500">Pack: {item.pack || 0}</div>
                                                    </td>
                                                    <td className="p-3 text-right text-slate-600">
                                                        {item.free || 0}
                                                    </td>
                                                    <td className="p-3 text-right text-slate-600">
                                                        {formatINR(item.purchasePrice)}
                                                    </td>
                                                    <td className="p-3 text-right text-slate-600">
                                                        {formatINR(item.gst)}
                                                    </td>
                                                    <td className="p-3 text-right text-rose-500">
                                                        -{formatINR(item.discount)}
                                                    </td>
                                                    <td className="p-3 text-right font-semibold text-slate-900 pr-6">
                                                        {formatINR(item.purchasePrice * item.quantity)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Financial Summary Section */}
                                    <div className="p-6 bg-slate-50/50 flex flex-col gap-3">
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 max-w-sm ml-auto">
                                            <div className="text-slate-500 text-right">Subtotal:</div>
                                            <div className="text-slate-900 text-right font-medium">{formatINR(selectedOrder.subTotal)}</div>

                                            <div className="text-slate-500 text-right">Discount:</div>
                                            <div className="text-rose-500 text-right font-medium">-{formatINR(selectedOrder.discount)}</div>

                                            <div className="text-slate-500 text-right">GST:</div>
                                            <div className="text-slate-900 text-right font-medium">+{formatINR(selectedOrder.gst)}</div>

                                            <div className="text-slate-500 text-right">Transport:</div>
                                            <div className="text-slate-900 text-right font-medium">+{formatINR(selectedOrder.transportCharge)}</div>

                                            <div className="col-span-2 my-1 border-t border-slate-200"></div>

                                            <div className="text-slate-900 text-right font-bold text-base">Grand Total:</div>
                                            <div className="text-indigo-600 text-right font-bold text-base">{formatINR(selectedOrder.total)}</div>

                                            {selectedOrder.paymentStatus !== "Paid" && (
                                                <div className="col-span-2 pt-4">
                                                    <Button
                                                        onClick={() => {
                                                            setPaymentAmount((selectedOrder.total - selectedOrder.paidAmount).toString());
                                                            setIsPaymentModalOpen(true);
                                                        }}
                                                        className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200/50 h-11 font-semibold text-sm rounded-xl transition-all hover:scale-[1.01]"
                                                    >
                                                        Pay Due Amount
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {selectedOrder.description && (
                                            <div className="mt-4 p-3 bg-white border rounded-xl text-xs text-slate-600 italic">
                                                <span className="not-italic font-semibold text-slate-400 block mb-1 uppercase tracking-tighter">Description</span>
                                                "{selectedOrder.description}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>

            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden ">
                    <div className="bg-linear-to-r from-indigo-600 to-purple-600 p-6 text-white">
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                            Process Payment
                        </DialogTitle>
                        <p className="text-indigo-100/80 text-xs mt-1 font-medium tracking-wide">
                            {selectedOrder?.invoiceNumber} — {supplier.name}
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Bill</p>
                                <p className="text-lg font-bold text-slate-900">{formatINR(selectedOrder?.total || 0)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                                <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-widest mb-1">Remaining Due</p>
                                <p className="text-lg font-bold text-orange-700">{formatINR((selectedOrder?.total || 0) - (selectedOrder?.paidAmount || 0))}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest pl-1">Payment Amount</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="h-16 text-2xl font-bold bg-slate-50 border-2 border-slate-100 rounded-2xl pl-10 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-indigo-700 placeholder:text-slate-300"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50/50 border-t flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-xl border-slate-200 font-semibold text-slate-600"
                            onClick={() => setIsPaymentModalOpen(false)}
                            disabled={isSubmittingPayment}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-2 h-12 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 font-semibold"
                            onClick={handlePaymentSubmit}
                            disabled={isSubmittingPayment}
                        >
                            {isSubmittingPayment ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Confirm Payment"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
};

export default SingleSupplierPage;
