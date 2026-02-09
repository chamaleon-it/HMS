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
import { motion } from "framer-motion";
import useSWR from "swr";
import api from "@/lib/axios";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

const SingleSupplierPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const { data: supplier, error: supplierError, isLoading: isSupplierLoading } = useSWR<Supplier>(id ? `/suppliers/${id}` : null, fetcher);
    const { data: ordersData, error: ordersError, isLoading: isOrdersLoading, mutate: mutateOrders } = useSWR<{ data: SupplierOrder[]; message: string }>(id ? `/purchase_entry/supplier/${id}` : null, (url: string) => api.get(url).then((res) => res.data));

    const orders = ordersData?.data || [];

    const totalPurchaseValue = React.useMemo(() => {
        return orders.reduce((sum, order) => sum + (order.total || 0), 0);
    }, [orders]);



    const totalDueAmount = React.useMemo(() => {
        return orders.reduce((sum, order) => sum + (order.total - order.paidAmount), 0);
    }, [orders]);

    // Filter State
    const [date, setDate] = React.useState<DateRange | undefined>(undefined);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [type, setType] = useState("all");

    const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);

    // Update selected order when orders list changes
    React.useEffect(() => {
        if (orders.length > 0 && !selectedOrder) {
            setSelectedOrder(orders[0]);
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
    }, [orders, type, date]);

    if (isSupplierLoading || isOrdersLoading) {
        return (
            <AppShell>
                <div className="flex items-center justify-center h-screen font-sans">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
                </div>
            </AppShell>
        );
    }

    if (supplierError || ordersError || !supplier) {
        return (
            <AppShell>
                <div className="p-10 text-center text-slate-500 font-sans">
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
            <div className="p-5 min-h-[calc(100vh-80px)] font-sans">
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
                            <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide font-sans">
                                Total Purchase Value
                            </div>
                            <div className="text-2xl font-semibold text-emerald-900 font-sans">
                                {formatINR(totalPurchaseValue)}
                            </div>
                        </div>
                        <div className="border rounded-2xl p-4 bg-rose-50/50 border-rose-100 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
                            <div className="text-xs font-medium text-rose-700 uppercase tracking-wide font-sans">
                                Total Due Amount
                            </div>
                            <div className="text-3xl font-semibold text-rose-900 font-sans">
                                {formatINR(totalDueAmount)}
                            </div>
                        </div>
                        <div className="border rounded-2xl p-4 bg-white flex flex-col gap-1 shadow-sm col-span-2 transition-transform duration-150 hover:-translate-y-[2px]">
                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide font-sans">
                                Details
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="p-2 bg-sky-100 rounded-lg">
                                        <Phone className="w-3.5 h-3.5 text-sky-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1 font-sans">Phone</p>
                                        <p className="font-semibold text-slate-900 text-sm leading-none font-sans">{supplier.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1 font-sans">MSME Number</p>
                                        <p className="font-semibold text-slate-900 text-sm leading-none font-sans">{supplier.msme || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1 font-sans">Address</p>
                                        <p className="font-medium text-slate-700 text-sm leading-snug font-sans truncate max-w-[200px]" title={`${supplier.address.line1}${supplier.address.line2 ? `, ${supplier.address.line2}` : ""}${supplier.address.city ? `, ${supplier.address.city}` : ""}`}>
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
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1 font-sans">DL Number</p>
                                        <p className="font-semibold text-slate-900 text-sm leading-none font-sans">{supplier.dlNo || "N/A"}</p>
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
                                <div className="text-sm font-medium flex items-center gap-2 font-sans">
                                    <span className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-sans">
                                        {filteredOrders.length}
                                    </span>
                                    Purchase Orders
                                </div>
                            </div>

                            {/* Filter Bar */}
                            <div className="flex justify-between items-center bg-slate-50 px-2 py-2 border-b">
                                <div className="flex items-center gap-3 text-[12px] text-slate-700 font-sans">
                                    <span className="font-medium font-sans">Filter:</span>

                                    <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                id="date"
                                                className="w-40 justify-between font-normal h-8 text-[11px] px-2 font-sans"
                                            >
                                                {date?.from && date?.to
                                                    ? `${fDate(date.from)} - ${fDate(date.to)}`
                                                    : "Select date"}
                                                <ChevronDownIcon className="h-3 w-3 opacity-50 font-sans" />
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
                                            className="h-8 text-[11px] px-2 text-slate-500 hover:text-slate-900 font-sans"
                                            onClick={() => setDate(undefined)}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>

                                <div className="relative inline-flex items-center gap-1 text-xs bg-white border border-gray-200 rounded-full p-0.5 font-sans">
                                    {tabs.map(({ key, label }) => {
                                        const active = type === key;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setType(key)}
                                                className={cn(
                                                    "relative flex items-center gap-2 rounded-full px-2 py-1 transition will-change-transform cursor-pointer font-sans",
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
                                                <span className="relative z-10 font-medium font-sans">
                                                    {label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto divide-y font-sans">
                                {filteredOrders.map((order) => {
                                    const active = selectedOrder?._id === order._id;
                                    return (
                                        <button
                                            key={order._id}
                                            type="button"
                                            onClick={() => setSelectedOrder(order)}
                                            className={cn(
                                                "w-full text-left px-4 py-3.5 text-[15px] flex flex-col gap-1 transition-all duration-150 font-sans",
                                                active ? "bg-slate-900 text-slate-50" : "hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-2 font-sans">
                                                <span className={cn("font-medium font-sans", active ? "text-slate-50" : "text-slate-900")}>
                                                    {order.invoiceNumber}
                                                </span>
                                                <span className={cn("text-xs font-semibold font-sans", active ? "text-slate-200" : "text-slate-900")}>
                                                    {formatINR(order.total)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 text-[12px] font-sans">
                                                <span className={cn("font-sans", active ? "text-slate-400" : "text-slate-500")}>
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

                                                    {order.paymentStatus !== "Paid" && (
                                                        <Badge variant="outline" className="rounded-full px-3 bg-red-50 text-red-600 border-red-100 animate-pulse-subtle">
                                                            Due: {formatINR(order.total - order.paidAmount)}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                                {filteredOrders.length === 0 && (
                                    <div className="p-8 text-center text-slate-500 text-sm font-sans">
                                        No orders found.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Order Details */}
                        <div className="md:col-span-3 border rounded-2xl bg-white shadow-sm flex flex-col h-[480px]">
                            <div className="px-4 py-3 bg-slate-50 flex items-center justify-between border-b">
                                <div className="text-sm font-semibold text-slate-900 font-sans">
                                    {selectedOrder ? `Order Details — ${selectedOrder.invoiceNumber}` : "Select an Order"}
                                </div>
                                {selectedOrder && (
                                    <div className="text-[11px] text-slate-500 flex flex-col items-end font-sans">
                                        <span className="font-sans">
                                            Date:{" "}
                                            <span className="font-medium text-slate-700 font-sans">
                                                {fDate(selectedOrder.invoiceDate)}
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {!selectedOrder && (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 font-sans">
                                    <p className="font-sans">Select an order from the list to view details.</p>
                                </div>
                            )}

                            {selectedOrder && (
                                <div className="flex-1 overflow-auto font-sans">
                                    <div className="p-4 bg-slate-50 border-b flex flex-wrap gap-4 text-[13px]">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-slate-500">GST:</span>
                                            <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", selectedOrder.gstEnabled ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-slate-400 border-slate-200")}>
                                                {selectedOrder.gstEnabled ? "Enabled" : "Disabled"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-slate-500">TSC:</span>
                                            <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", selectedOrder.tscEnabled ? "text-amber-600 border-amber-200 bg-amber-50" : "text-slate-400 border-slate-200")}>
                                                {selectedOrder.tscEnabled ? "Enabled" : "Disabled"}
                                            </Badge>
                                        </div>
                                        <div className="ml-auto text-slate-500">
                                            Total Items: <span className="font-semibold text-slate-900">{selectedOrder.items.length}</span>
                                        </div>
                                    </div>

                                    <table className="w-full text-[13px] font-sans">
                                        <thead className="bg-slate-50 text-slate-700 sticky top-0 text-[11px] uppercase tracking-wider font-sans border-b">
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
                                        <tbody className="divide-y divide-slate-100 font-sans">
                                            {selectedOrder.items?.map((item, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 font-sans group">
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
                                                        {formatINR(item.unitPrice)}
                                                    </td>
                                                    <td className="p-3 text-right text-slate-600">
                                                        {formatINR(item.gst)}
                                                    </td>
                                                    <td className="p-3 text-right text-rose-500">
                                                        -{formatINR(item.discount)}
                                                    </td>
                                                    <td className="p-3 text-right font-semibold text-slate-900 pr-6">
                                                        {formatINR(item.purchasePrice)}
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
                                        </div>

                                        {selectedOrder.description && (
                                            <div className="mt-4 p-3 bg-white border rounded-xl text-xs text-slate-600 italic">
                                                <span className="not-italic font-bold text-slate-400 block mb-1 uppercase tracking-tighter">Description</span>
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
        </AppShell>
    );
};

export default SingleSupplierPage;
