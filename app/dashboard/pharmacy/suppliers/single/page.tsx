"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/app-shell";
import PharmacyHeader from "../../components/PharmacyHeader";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, ChevronDownIcon, Phone, MapPin, FileText, ShieldCheck } from "lucide-react";
import { DUMMY_SUPPLIERS, DUMMY_SUPPLIER_ORDERS } from "../data";
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

const SingleSupplierPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    // State
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [orders, setOrders] = useState<SupplierOrder[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [date, setDate] = React.useState<DateRange | undefined>(undefined);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [type, setType] = useState("all");

    const tabs = [
        { key: "all", label: "All" },
        { key: "sale", label: "Sale" },
        { key: "return", label: "Return" },
    ];

    useEffect(() => {
        if (id) {
            // Simulate API Fetch
            setTimeout(() => {
                const foundSupplier = DUMMY_SUPPLIERS.find((s) => s._id === id);
                const foundOrders = DUMMY_SUPPLIER_ORDERS[id] || [];
                setSupplier(foundSupplier || null);
                setOrders(foundOrders);
                // Select the first order by default if available
                if (foundOrders.length > 0) {
                    setSelectedOrder(foundOrders[0]);
                }
                setLoading(false);
            }, 500);
        } else {
            setLoading(false);
        }
    }, [id]);

    const filteredOrders = React.useMemo(() => {
        let result = [...orders];

        // Filter by Type (Mock logic: Assuming all dummy orders are 'sale' for now)
        if (type !== "all") {
            if (type === "return") {
                result = []; // No mock returns yet
            }
            // 'sale' keeps all mocks
        }

        // Filter by Date Range
        if (date?.from && date?.to) {
            const start = new Date(date.from);
            const end = new Date(date.to);
            end.setHours(23, 59, 59, 999);
            result = result.filter((item) => {
                const itemDate = new Date(item.date);
                return itemDate >= start && itemDate <= end;
            });
        }

        return result;
    }, [orders, type, date]);

    if (loading) {
        return (
            <AppShell>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
                </div>
            </AppShell>
        );
    }

    if (!supplier) {
        return (
            <AppShell>
                <div className="p-10 text-center text-slate-500">
                    Supplier not found
                    <Button variant="link" onClick={() => router.push("/dashboard/pharmacy/suppliers")}>Go back</Button>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="p-5 min-h-[calc(100vh-80px)]">
                <main className="flex flex-col gap-6">
                    <PharmacyHeader
                        title={supplier.name}
                        subtitle={`GSTIN: ${supplier.gstin}`}
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
                            <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                                Total Purchase Value
                            </div>
                            <div className="text-2xl font-semibold text-emerald-900">
                                {formatINR(supplier.totalPurchaseValue)}
                            </div>
                        </div>
                        <div className="border rounded-2xl p-4 bg-linear-to-br from-sky-50 to-sky-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
                            <div className="text-xs font-medium text-sky-700 uppercase tracking-wide">
                                Total Purchase Count
                            </div>
                            <div className="text-3xl font-semibold text-sky-900">
                                {supplier.totalPurchaseCount}
                            </div>
                        </div>
                        <div className="border rounded-2xl p-4 bg-white flex flex-col gap-1 shadow-sm col-span-2 transition-transform duration-150 hover:-translate-y-[2px]">
                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Details
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="p-2 bg-sky-100 rounded-lg">
                                        <Phone className="w-3.5 h-3.5 text-sky-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">Phone</p>
                                        <p className="font-semibold text-slate-900 text-sm leading-none">{supplier.phoneNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">MSME Number</p>
                                        <p className="font-semibold text-slate-900 text-sm leading-none">{supplier.msmeNumber || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">Address</p>
                                        <p className="font-medium text-slate-700 text-sm leading-snug">
                                            {supplier.addressLine1}
                                            {supplier.addressLine2 && <span className="text-slate-500">, {supplier.addressLine2}</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">DL Number</p>
                                        <p className="font-semibold text-slate-900 text-sm leading-none">{supplier.dlNumber || "N/A"}</p>
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
                                <div className="text-sm font-medium flex items-center gap-2">
                                    <span className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[11px]">
                                        {filteredOrders.length}
                                    </span>
                                    Purchase Orders
                                </div>
                            </div>

                            {/* Filter Bar */}
                            <div className="flex justify-between items-center bg-slate-50 px-2 py-2 border-b">
                                <div className="flex items-center gap-3 text-[12px] text-slate-700">
                                    <span className="font-medium">Filter:</span>

                                    <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                id="date"
                                                className="w-40 justify-between font-normal h-8 text-[11px] px-2"
                                            >
                                                {date?.from && date?.to
                                                    ? `${fDate(date.from)} - ${fDate(date.to)}`
                                                    : "Select date"}
                                                <ChevronDownIcon className="h-3 w-3 opacity-50" />
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
                                            className="h-8 text-[11px] px-2 text-slate-500 hover:text-slate-900"
                                            onClick={() => setDate(undefined)}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>

                                <div className="relative inline-flex items-center gap-1 text-xs bg-white border border-gray-200 rounded-full p-0.5">
                                    {tabs.map(({ key, label }) => {
                                        const active = type === key;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setType(key)}
                                                className={cn(
                                                    "relative flex items-center gap-2 rounded-full px-2 py-1 transition will-change-transform cursor-pointer",
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
                                                <span className="relative z-10 font-medium">
                                                    {label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto divide-y">
                                {filteredOrders.map((order) => {
                                    const active = selectedOrder?._id === order._id;
                                    return (
                                        <button
                                            key={order._id}
                                            type="button"
                                            onClick={() => setSelectedOrder(order)}
                                            className={cn(
                                                "w-full text-left px-4 py-3.5 text-[15px] flex flex-col gap-1 transition-all duration-150",
                                                active ? "bg-slate-900 text-slate-50" : "hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={cn("font-medium", active ? "text-slate-50" : "text-slate-900")}>
                                                    {order.orderId}
                                                </span>
                                                <span className={cn("text-xs font-semibold", active ? "text-slate-200" : "text-slate-900")}>
                                                    {formatINR(order.totalValue)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 text-[12px]">
                                                <span className={cn(active ? "text-slate-400" : "text-slate-500")}>
                                                    {fDate(order.date)}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(active ? "text-slate-400" : "text-slate-500")}>
                                                        {order.itemCount} items
                                                    </span>
                                                    <Badge variant={order.status === "Completed" ? "default" : "secondary"} className={cn(
                                                        "text-[10px] h-5 px-1.5 font-normal",
                                                        order.status === "Completed" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200" :
                                                            order.status === "Pending" ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200" : ""
                                                    )}>
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                                {filteredOrders.length === 0 && (
                                    <div className="p-8 text-center text-slate-500 text-sm">
                                        No orders found.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Order Details */}
                        <div className="md:col-span-3 border rounded-2xl bg-white shadow-sm flex flex-col h-[480px]">
                            <div className="px-4 py-3 bg-slate-50 flex items-center justify-between border-b">
                                <div className="text-sm font-semibold text-slate-900">
                                    {selectedOrder ? `Order Details — ${selectedOrder.orderId}` : "Select an Order"}
                                </div>
                                {selectedOrder && (
                                    <div className="text-[11px] text-slate-500 flex flex-col items-end">
                                        <span>
                                            Date:{" "}
                                            <span className="font-medium text-slate-700">
                                                {fDate(selectedOrder.date)}
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {!selectedOrder && (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                                    <p>Select an order from the list to view details.</p>
                                </div>
                            )}

                            {selectedOrder && (
                                <div className="flex-1 overflow-auto">
                                    <table className="w-full text-[15px]">
                                        <thead className="bg-slate-50 text-slate-700 sticky top-0 text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="p-3 text-left font-medium">Item Name</th>
                                                <th className="p-3 text-right font-medium">Qty</th>
                                                <th className="p-3 text-right font-medium">Unit Price</th>
                                                <th className="p-3 text-right font-medium pr-6">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {selectedOrder.items?.map((item, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50">
                                                    <td className="p-3 text-slate-900 font-medium">
                                                        {item.name}
                                                    </td>
                                                    <td className="p-3 text-right text-slate-600">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="p-3 text-right text-slate-600">
                                                        {formatINR(item.unitPrice)}
                                                    </td>
                                                    <td className="p-3 text-right font-semibold text-slate-900 pr-6">
                                                        {formatINR(item.totalPrice)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50 border-t">
                                            <tr>
                                                <td colSpan={3} className="p-3 text-right text-slate-600 font-medium">
                                                    Total Amount
                                                </td>
                                                <td className="p-3 text-right text-base font-bold text-slate-900 pr-6">
                                                    {formatINR(selectedOrder.totalValue)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
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
