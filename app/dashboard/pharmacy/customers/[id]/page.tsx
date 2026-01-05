"use client";
import React, { useState } from "react";
import { ArrowLeft, ChevronDownIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/layout/app-shell";
import { useParams, useRouter } from "next/navigation";
import { formatINR } from "@/lib/fNumber";
import { fAge, fDate } from "@/lib/fDateAndTime";
import useSWR from "swr";
import { CustomerType, Order } from "./interface";
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
import { Datum, ReturnType } from "./ReturnType";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { OrderType } from "../../interface";
import PrintPrescription from "../../billing/PrintPrescription";
import PrintReceipt from "../../PrintReceipt";
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
  const { id } = useParams();
  const { data: customerData, error, mutate } = useSWR<CustomerType>(
    `/pharmacy/orders/customers/${id}`
  );

  const { data: returnData } = useSWR<ReturnType>(
    `/pharmacy/return/patient/${id}`
  );

  const customer = customerData?.data;
  const [selectedVisit, setSelectedVisit] = useState<Order | Datum | null>(null);


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

  const { data: profile } = useSWR<{ data: { pharmacy: { billing: { autoGenerateBill: boolean, prefix: string, defaultGst?: number } } }, message: string }>("/users/profile")
  const autoGenerateBill = profile?.data.pharmacy.billing.autoGenerateBill ?? false
  const prefix = profile?.data.pharmacy.billing.prefix ?? "INV"
  const defaultGst = profile?.data.pharmacy.billing.defaultGst ?? 0

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
      const params = new URLSearchParams()
      params.set("q", mrn)
      const { data } = await api.get<{
        data: {
          assignedTo: string,
          createdAt: Date,
          discount: number,
          doctor: {
            name: string;
            phoneNumber: string;
            specialization: string;
            _id: string
          },
          items: {
            dosage: string;
            duration: string;
            food: string;
            frequency: string;
            isPacked: string;
            quantity: number;
            name: {
              name: string;
              unitPrice: number;
              _id: string
            },
          }[];
          mrn: string;
          patient: {
            name: string;
            mrn?: string;
            phoneNumber?: string;
            gender?: string;
            dateOfBirth: string | Date;
            address?: string;
            _id: string
          }
          priority: string;
          status: string;
          updatedAt: string;
          _id: string
        }, message: string
      }>(`/pharmacy/orders/single?${params}`,)

      const items = data.data.items.map(e => {
        const unitPrice = e.name.unitPrice || 0;
        const quantity = e.quantity || 0;
        const itemGst = defaultGst;
        const basePrice = unitPrice * quantity;
        const gstAmount = basePrice * (itemGst / 100);
        return {
          gst: itemGst,
          name: e.name.name,
          quantity,
          unitPrice,
          total: Math.round((basePrice + gstAmount) * 100) / 100,
        };
      });

      const subtotal = items.reduce((a, b) => a + b.unitPrice * b.quantity, 0);
      const totalGst = items.reduce((a, b) => a + b.unitPrice * b.quantity * (b.gst / 100), 0);
      const discount = data.data.discount || 0;
      const grandTotal = subtotal + totalGst - discount;

      setPrintBill({
        patient: data.data.patient,
        payload: {
          items,
          cash: 0,
          discount,
          insurance: 0,
          online: 0,
          patient: data.data.patient._id,
          department: data.data.doctor.specialization,
          doctor: data.data.doctor.name,
          note: "",
        },
        invoiceDetails: {
          totalGst,
          prefix,
          roundOffAmount: 0,
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

  return (
    <AppShell>
      <div className="bg-slate-50 p-5 print:hidden">
        <main className="space-y-6">
          <div className="mb-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 rounded-full border-slate-300 bg-white/80 hover:bg-slate-50"
              onClick={() => router.push("/dashboard/pharmacy/customers")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to customers
            </Button>
          </div>
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
                    Age {fAge(customer?.patient?.dateOfBirth)} /{" "}
                    {customer?.patient?.gender} • Ph:{" "}
                    {customer?.patient?.phoneNumber}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {customer?.patient?.address}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                    {customer?.orders.length === 0 && (
                      <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                        No purchase history yet
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="border rounded-2xl p-4 bg-linear-to-br from-emerald-50 to-emerald-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
                  <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                    Total Spend
                  </div>
                  <div className="text-2xl font-semibold text-emerald-900">
                    {formatINR(customer?.totalSpend ?? 0)}
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
                    {fDate(customer?.lastPurchase)}
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
                      let combined = [];
                      if (returnData?.data) {
                        combined.push(
                          ...returnData.data.map((r) => ({ ...r, type: "return" }))
                        );
                      }
                      if (customer?.orders) {
                        combined.push(
                          ...customer.orders.map((o) => ({ ...o, type: "sale" }))
                        );
                      }

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
                                    {fDate(item.createdAt)} - Return
                                  </span>
                                  <span className="text-xs font-semibold">
                                    {formatINR(
                                      item.items.reduce(
                                        (a: number, b: any) =>
                                          a + b.quantity * (b.unitPrice ?? b.name.unitPrice),
                                        0
                                      )
                                    )}
                                  </span>
                                </>
                              ) : (
                                // Sale Item Header
                                <>
                                  <span className="font-medium">
                                    {fDate(item.createdAt)} • {item.mrn}
                                  </span>
                                  <span className="text-xs font-semibold">
                                    {formatINR(
                                      item.items.reduce(
                                        (a: number, b: any) =>
                                          a + b.quantity * b.name.unitPrice,
                                        0
                                      ) - (item?.discount || 0)
                                    )}
                                  </span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2 text-[12px]">
                              {isReturn ? (
                                // Return Item Subtext
                                <span
                                  className={
                                    active ? "opacity-80" : "text-slate-500"
                                  }
                                >
                                  {item.items.length} item
                                  {item.items.length === 1 ? "" : "s"}
                                </span>
                              ) : (
                                // Sale Item Subtext
                                <>
                                  <span className="opacity-80">RX: {item.mrn}</span>
                                  <span
                                    className={
                                      active ? "opacity-80" : "text-slate-500"
                                    }
                                  >
                                    {item.items.length} item
                                    {item.items.length === 1 ? "" : "s"}
                                  </span>
                                </>
                              )}
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
                      {selectedVisit
                        ? `${selectedVisit?.mrn ? "Sale" : "Return"} Details — ${selectedVisit?.mrn || selectedVisit?._id}`
                        : "Bill Details"}
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
                              const amount = it.quantity * (it?.unitPrice ?? it.name?.unitPrice);
                              return (
                                <tr
                                  key={it.name.name}
                                  className="border-t align-top hover:bg-slate-50/70 transition-colors"
                                >
                                  <td className="p-2 align-top text-slate-500">
                                    {i + 1}
                                  </td>
                                  <td className="p-2 align-top">
                                    <div className="font-medium text-slate-900 leading-snug">
                                      {it.name.name}
                                    </div>
                                    <div className="text-[12px] text-slate-600 leading-snug">
                                      (Gen: {it.name.generic})
                                    </div>
                                  </td>
                                  <td className="p-2 align-top text-right text-sm font-semibold text-slate-900">
                                    {it.quantity}
                                  </td>
                                  <td className="p-2 align-top text-right text-slate-800">
                                    {formatINR(it.unitPrice ?? it.name.unitPrice)}
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
                          <tfoot>

                            <tr className="border-t bg-slate-50/80">
                              <td
                                colSpan={4}
                                className="p-2 text-right text-xs text-slate-600"
                              >
                                Sub Total
                              </td>
                              <td className="p-2 text-right text-sm font-semibold text-slate-900">
                                {formatINR(
                                  selectedVisit.items.reduce(
                                    (a, b) => a + b.quantity * (b.unitPrice ?? b.name.unitPrice),
                                    0
                                  )
                                )}
                              </td>
                            </tr>
                            <tr className="border-t bg-slate-50/80">
                              <td
                                colSpan={4}
                                className="p-2 text-right text-xs text-slate-600"
                              >
                                Discount
                              </td>
                              <td className="p-2 text-right text-sm font-semibold text-slate-900">
                                {formatINR(
                                  selectedVisit?.discount || 0

                                )}
                              </td>
                            </tr>



                            <tr className="border-t bg-slate-50/80">
                              <td
                                colSpan={4}
                                className="p-2 text-right text-xs text-slate-600"
                              >
                                Total
                              </td>
                              <td className="p-2 text-right text-sm font-semibold text-slate-900">
                                {formatINR(
                                  selectedVisit.items.reduce(
                                    (a, b) => a + b.quantity * (b.unitPrice ?? b.name.unitPrice),
                                    0
                                  ) - (selectedVisit?.discount || 0)
                                )}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {selectedVisit?.mrn && <div className="px-4 py-3 border-t bg-slate-50 flex items-center justify-between gap-3">
                        <div className="text-[12px] text-slate-500">
                          Use Print bill to generate a hard copy.
                        </div>
                        <div className="flex items-center gap-2">


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
                                      setSelectedVisit(updatedData?.data?.orders[0] ?? null)
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
                            <Link href={`/dashboard/pharmacy/return/?mrn=${selectedVisit?.mrn}`}>
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
    </AppShell>
  );
};

export default Customer;
