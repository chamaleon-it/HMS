"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import PharmacyHeader from "@/app/dashboard/pharmacy/components/PharmacyHeader";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  ChevronDownIcon,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  RefreshCw,
  User,
  Mail,
  CreditCard,
  CalendarDays,
} from "lucide-react";
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

const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

export default function AdminSingleSupplierPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { data: supplier, error: supplierError, isLoading: isSupplierLoading } = useSWR<Supplier>(
    id ? `/suppliers/${id}` : null,
    fetcher
  );
  const {
    data: ordersData,
    error: ordersError,
    isLoading: isOrdersLoading,
    mutate: mutateOrders,
  } = useSWR<{ data: SupplierOrder[]; message: string }>(
    id ? `/purchase_entry/supplier/${id}` : null,
    (url: string) => api.get(url).then((res) => res.data)
  );

  const orders = ordersData?.data || [];

  const totalPurchaseValue = React.useMemo(() => {
    return orders.reduce((sum: number, order: SupplierOrder) => sum + (order.total || 0), 0);
  }, [orders]);

  const totalDueAmount = React.useMemo(() => {
    return orders.reduce(
      (sum: number, order: SupplierOrder) => sum + (order.total - order.paidAmount),
      0
    );
  }, [orders]);

  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [type, setType] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("0");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isBulkPaymentModalOpen, setIsBulkPaymentModalOpen] = useState(false);
  const [bulkPaymentAmount, setBulkPaymentAmount] = useState<string>("0");
  const [isSubmittingBulkPayment, setIsSubmittingBulkPayment] = useState(false);

  React.useEffect(() => {
    if (orders.length > 0) {
      if (!selectedOrder) {
        setSelectedOrder(orders[0]);
      } else {
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
    if (type !== "all") {
      result = result.filter((o) => o.paymentStatus === type);
    }
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

  const handlePaymentSubmit = async () => {
    if (!selectedOrder) return;
    const amount = Number(paymentAmount);
    const due = selectedOrder.total - selectedOrder.paidAmount;

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount > due) {
      toast.error(`Payment amount cannot exceed due amount (₹${due.toFixed(2)})`);
      return;
    }

    setIsSubmittingPayment(true);
    try {
      await api.patch(`/purchase_entry/add_payment/${selectedOrder._id}`, {
        paidAmount: amount,
      });
      toast.success("Payment registered successfully");
      setIsPaymentModalOpen(false);
      setPaymentAmount("");
      mutateOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process payment");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const fifoPreview = React.useMemo(() => {
    const amount = Number(bulkPaymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) return [];
    let remaining = Math.round(amount * 100) / 100;
    const sorted = [...orders]
      .filter((o) => (o.total || 0) - (o.paidAmount || 0) > 0)
      .sort(
        (a, b) =>
          new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime()
      );
    const preview: { invoiceNumber: string; allocated: number }[] = [];
    for (const order of sorted) {
      if (remaining <= 0) break;
      const due = Math.round(((order.total || 0) - (order.paidAmount || 0)) * 100) / 100;
      const allocated = Math.min(remaining, due);
      preview.push({ invoiceNumber: order.invoiceNumber, allocated });
      remaining = Math.round((remaining - allocated) * 100) / 100;
    }
    return preview;
  }, [bulkPaymentAmount, orders]);

  const handleBulkPaymentSubmit = async () => {
    if (!id) return;
    const amount = Number(bulkPaymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount > totalDueAmount + 1e-6) {
      toast.error(
        `Payment cannot exceed total due (₹${totalDueAmount.toFixed(2)}). Advances are not supported.`
      );
      return;
    }

    setIsSubmittingBulkPayment(true);
    try {
      const { data } = await api.post(`/purchase_entry/supplier/${id}/pay`, {
        amount,
      });
      const allocatedCount = data?.data?.allocations?.length ?? 0;
      toast.success(
        `₹${amount.toFixed(2)} allocated across ${allocatedCount} invoice(s)`
      );
      setIsBulkPaymentModalOpen(false);
      setBulkPaymentAmount("");
      mutateOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process payment");
    } finally {
      setIsSubmittingBulkPayment(false);
    }
  };

  if (isSupplierLoading || isOrdersLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
        </div>
      </AppShell>
    );
  }

  if (supplierError || ordersError || !supplier) {
    return (
      <AppShell>
        <div className="p-10 text-center text-slate-500">
          <p className="text-red-500 mb-4">Failed to load supplier details</p>
          <Button variant="outline" onClick={() => router.push("/dashboard/admin/suppliers")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Suppliers
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-5 min-h-[calc(100vh-67px)]">
        <main className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="gap-2 text-slate-600 hover:text-slate-900 cursor-pointer"
              onClick={() => router.push("/dashboard/admin/suppliers")}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Suppliers
            </Button>
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">{supplier.name}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {supplier.phone}
                </span>
                {supplier.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {supplier.email}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  GSTIN: {supplier.gstin || "N/A"}
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  DL: {supplier.dlNo || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-right">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Total Purchases
                </p>
                <p className="text-lg font-bold text-slate-800">{formatINR(totalPurchaseValue)}</p>
              </div>
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-right">
                <p className="text-xs text-rose-500 font-medium uppercase tracking-wider">
                  Total Due
                </p>
                <p className="text-lg font-bold text-rose-700">{formatINR(totalDueAmount)}</p>
              </div>
              {totalDueAmount > 0 && (
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white h-auto py-3 px-4"
                  onClick={() => {
                    setBulkPaymentAmount(String(totalDueAmount));
                    setIsBulkPaymentModalOpen(true);
                  }}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Outstanding
                </Button>
              )}
            </div>
          </div>

          {/* Orders Section */}
          <div className="bg-white border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Purchase Invoices</h3>
              <div className="flex items-center gap-2">
                {tabs.map((t) => (
                  <Button
                    key={t.key}
                    variant={type === t.key ? "default" : "outline"}
                    size="sm"
                    className="rounded-lg text-xs cursor-pointer"
                    onClick={() => setType(t.key)}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Invoice No</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Total Amount</th>
                    <th className="py-3 px-4 font-semibold">Paid Amount</th>
                    <th className="py-3 px-4 font-semibold">Due Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No purchase invoices found
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const due = (order.total || 0) - (order.paidAmount || 0);
                      return (
                        <tr key={order._id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            {order.invoiceNumber}
                          </td>
                          <td className="py-3 px-4">{fDate(order.invoiceDate)}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {formatINR(order.total)}
                          </td>
                          <td className="py-3 px-4 text-emerald-600 font-medium">
                            {formatINR(order.paidAmount)}
                          </td>
                          <td className="py-3 px-4 text-rose-600 font-medium">
                            {formatINR(due)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={cn(
                                "text-[11px] font-semibold",
                                order.paymentStatus === "Paid"
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                  : order.paymentStatus === "Partially Paid"
                                  ? "bg-amber-100 text-amber-700 border-amber-200"
                                  : "bg-rose-100 text-rose-700 border-rose-200"
                              )}
                            >
                              {order.paymentStatus}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {due > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs cursor-pointer text-indigo-600 hover:text-indigo-700"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setPaymentAmount(String(due));
                                  setIsPaymentModalOpen(true);
                                }}
                              >
                                Record Payment
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

          <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div>
              <Label className="text-xs text-slate-500">Invoice</Label>
              <p className="font-semibold text-slate-800">{selectedOrder?.invoiceNumber}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Total Due</Label>
              <p className="text-lg font-bold text-rose-600">
                {selectedOrder && formatINR(selectedOrder.total - selectedOrder.paidAmount)}
              </p>
            </div>
            <div>
              <Label htmlFor="payAmount">Payment Amount (₹)</Label>
              <Input
                id="payAmount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="mt-1 font-mono text-base"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handlePaymentSubmit}
              disabled={isSubmittingPayment}
            >
              {isSubmittingPayment ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkPaymentModalOpen} onOpenChange={setIsBulkPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pay Outstanding (FIFO)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div>
              <Label className="text-xs text-slate-500">Total Due</Label>
              <p className="text-lg font-bold text-rose-600">{formatINR(totalDueAmount)}</p>
              <p className="text-xs text-slate-400 mt-1">
                Allocates oldest invoices first. Overpayment / advances are blocked.
              </p>
            </div>
            <div>
              <Label htmlFor="bulkPayAmount">Payment Amount (₹)</Label>
              <Input
                id="bulkPayAmount"
                type="number"
                value={bulkPaymentAmount}
                onChange={(e) => setBulkPaymentAmount(e.target.value)}
                className="mt-1 font-mono text-base"
              />
            </div>
            {fifoPreview.length > 0 && (
              <div className="rounded-lg border bg-slate-50 p-3 space-y-1.5 max-h-40 overflow-y-auto">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Allocation preview
                </p>
                {fifoPreview.map((row) => (
                  <div
                    key={row.invoiceNumber}
                    className="flex justify-between text-sm text-slate-700"
                  >
                    <span className="font-mono">{row.invoiceNumber}</span>
                    <span className="font-medium">{formatINR(row.allocated)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleBulkPaymentSubmit}
              disabled={isSubmittingBulkPayment}
            >
              {isSubmittingBulkPayment ? "Processing..." : "Confirm FIFO Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
