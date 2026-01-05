"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppShell from "@/components/layout/app-shell";
import { OrderType } from "./interface";
import Header from "./Header";
import { formatINR } from "@/lib/fNumber";
import Search from "./Search";
import toast from "react-hot-toast";
import Link from "next/link";
import useSWR from "swr";
import api from "@/lib/axios";
import { fDate, fTime } from "@/lib/fDateAndTime";
import { useAuth } from "@/auth/context/auth-context";
import { TableSkeleton } from "../components/PharmacySkeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSearchParams } from "next/navigation";
import { Trash, CreditCard, User, MessageSquareText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PharmacyReturnPage() {


  const searchParams = useSearchParams();
  const mrn = searchParams?.get('mrn') ?? '';





  const { user } = useAuth();

  const [filter, setFilter] = useState<{ q: null | string }>({
    q: null,
  });

  const { data: profile } = useSWR<{ data: { pharmacy: { billing: { defaultGst?: number } } } }>("/users/profile");
  const defaultGst = profile?.data.pharmacy.billing.defaultGst ?? 0;

  const [order, setOrder] = useState<null | OrderType>(null);
  const [fetching, setFetching] = useState(false);
  const [returning, setReturning] = useState(false);





  const fetchOrder = async () => {
    try {
      setFetching(true);


      if (!mrn && !filter.q) {
        toast.error("Please enter a valid RX id");
        return;
      }

      const params = new URLSearchParams();

      params.set("q", (filter.q ?? mrn) ?? "");

      const { data }: { data: { data: OrderType } } = await api.get(`/pharmacy/orders/single?${params}`);
      setOrder({ ...data.data, items: data.data.items.map((it) => ({ ...it, unitPrice: it.unitPrice || it.name.unitPrice })) });
      setState({ refundMode: "Cash", returnedBy: "Patient", remarks: "" });
    } catch (error) {
      toast.error("Failed to fetch order");
    } finally {
      setFetching(false);
    }
  };


  useEffect(() => {
    if (mrn) {
      setFilter({ q: mrn });
      fetchOrder();
    }
  }, [mrn])


  const [state, setState] = useState({
    refundMode: "Cash",
    returnedBy: "Patient",
    remarks: "",
  });

  const returnOrder = async () => {
    if (!order) {
      toast.error("Please select an order first");
      return;
    }

    const items = order.items ?? [];

    if (items.length === 0) {
      toast.error("No items to return");
      return;
    }

    const hasInvalidReturn = items.some((it) => (it.return ?? 0) <= 0);
    if (hasInvalidReturn) {
      toast.error("Please select return quantity or remove the items");
      return;
    }

    const hasInvalidUnitPrice = items.some((it) => (it.unitPrice || 0) <= 0);
    if (hasInvalidUnitPrice) {
      toast.error("Please enter unit price for all items");
      return;
    }

    try {
      setReturning(true);
      const payload: {
        patient: string;
        order: string;
        refundMode: string;
        returnedBy: string;
        remarks: string;
        items: {
          name: string;
          quantity: number;
          reason: string;
          unitPrice: number;
        }[];
      } = {
        patient: order?.patient._id,
        order: order?._id,
        refundMode: state.refundMode,
        returnedBy: state.returnedBy,
        remarks: state.remarks,
        items: order?.items.map((it) => ({
          name: it.name._id,
          quantity: it.return || 0,
          reason: it.reason,
          unitPrice: it.unitPrice ?? it.name.unitPrice,
        })),
      };
      await toast.promise(api.post("pharmacy/return", payload), {
        loading: "Returning...!",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      setOrder(null);
    } catch (error) {
      // Handle error
    } finally {
      setReturning(false);
    }
  };

  return (
    <AppShell>
      <div className="p-6 flex flex-col gap-6 text-sm min-h-[calc(100vh-80px)] bg-slate-50/50">
        <Header />

        <Search
          fetchOrder={fetchOrder}
          filter={filter}
          setFilter={setFilter}
          order={order}
        />

        {/* RETURNED ITEMS TABLE */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="text-sm font-medium text-slate-700">
              Items to Return
            </div>
            <div className="text-[11px] text-slate-500">
              Stock will update on confirm
            </div>
          </div>

          {fetching ? (
            <TableSkeleton rows={5} columns={11} />
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full text-xs">
                <TableHeader>
                  <TableRow className="bg-slate-700 hover:bg-slate-700 text-white">
                    <TableHead className="w-[32px] text-center text-white">#</TableHead>
                    <TableHead className="text-white">Medicine / Gen</TableHead>
                    <TableHead className="text-white">HSN</TableHead>
                    <TableHead className="text-white">Batch</TableHead>
                    <TableHead className="text-white">Expiry</TableHead>
                    <TableHead className="text-center text-white">Qty Sold</TableHead>
                    <TableHead className="text-center text-white">Qty Return</TableHead>
                    <TableHead className="text-right text-white">Rate</TableHead>
                    <TableHead className="text-right text-white">Amount</TableHead>
                    <TableHead className="text-white text-right">Reason</TableHead>
                    <TableHead className="text-white text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="[&>tr:nth-child(even)]:bg-slate-50/40">
                  {order?.items.map((it, i) => (
                    <TableRow key={it.name._id} className="text-[11px]">
                      <TableCell className="text-center align-top text-slate-500">
                        {i + 1}
                      </TableCell>

                      <TableCell className="align-top">
                        <div className="text-slate-900 font-medium text-[12px] leading-tight">
                          {it.name.name}
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">
                          (Gen: {it.name.generic})
                        </div>
                      </TableCell>

                      <TableCell className="align-top text-slate-600">
                        {it.name.hsnCode}
                      </TableCell>

                      <TableCell className="align-top text-slate-600">
                        {"N/A"}
                      </TableCell>

                      <TableCell className="align-top text-slate-600">
                        {fDate(it.name.expiryDate)}
                      </TableCell>

                      <TableCell className="text-center font-medium text-slate-700">
                        {it.quantity}
                      </TableCell>

                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min={0}
                          max={it.quantity}
                          className="h-8 w-14 text-center rounded-lg border-slate-300 text-[11px] px-2 py-1 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                          value={it.return === 0 ? "" : it.return}

                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (value > it.quantity) {
                              return;
                            }
                            setOrder((prev) =>
                              prev
                                ? {
                                  ...prev,
                                  items: prev.items.map((item) =>
                                    item.name._id === it.name._id
                                      ? {
                                        ...item,
                                        return: value || 0,
                                      }
                                      : item
                                  ),
                                }
                                : null
                            );
                          }}
                        />
                      </TableCell>

                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={0}
                          className="h-8 w-20 text-right rounded-lg border-slate-300 text-[11px] px-2 py-1 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 ml-auto"
                          value={it.unitPrice || ""}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setOrder((prev) =>
                              prev
                                ? {
                                  ...prev,
                                  items: prev.items.map((item) =>
                                    item.name._id === it.name._id
                                      ? {
                                        ...item,
                                        unitPrice: value,
                                      }
                                      : item
                                  ),
                                }
                                : null
                            );
                          }}
                        />
                      </TableCell>

                      <TableCell className="text-right tabular-nums font-semibold text-slate-900">
                        {formatINR(((it.unitPrice ?? it.name.unitPrice) * (it.return ?? 0)) * (1 + defaultGst / 100))}
                      </TableCell>

                      <TableCell className="align-top text-right">
                        <div className="relative inline-block text-[11px]">
                          <select
                            value={it.reason}
                            onChange={(e) => {
                              setOrder((prev) =>
                                prev
                                  ? {
                                    ...prev,
                                    items: prev.items.map((item) =>
                                      item.name._id === it.name._id
                                        ? {
                                          ...item,
                                          reason: e.target.value,
                                        }
                                        : item
                                    ),
                                  }
                                  : null
                              );
                            }}
                            className="appearance-none h-8 rounded-lg border border-slate-300 bg-white pr-7 pl-2 text-[11px] leading-none text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                          >
                            <option>Doctor Changed Rx</option>
                            <option>Expired</option>
                            <option>Near Expiry</option>
                            <option>Quality Issue</option>
                            <option>Wrong Item</option>
                            <option>Adverse Reaction</option>
                            <option>Not Required</option>
                            <option>Other</option>
                            <option>Damaged</option>
                          </select>
                          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                            ▾
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size={"sm"}
                          className="bg-red-600 hover:bg-red-700 transform duration-200"
                          onClick={() => {
                            setOrder((prev) =>
                              prev
                                ? {
                                  ...prev,
                                  items: prev.items.filter(
                                    (e) => e.name._id !== it.name._id
                                  ),
                                }
                                : null
                            );
                          }}
                        >
                          <Trash className="w-3.5 h-3.5 mr-2" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-4 py-3">
            <div className="text-right text-xs">
              <div className="flex justify-between gap-6">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-700">
                  {formatINR(
                    order?.items.reduce(
                      (a, b) => a + (b.unitPrice ?? b.name.unitPrice) * (b.return ?? 0),
                      0
                    ) ?? 0
                  )}
                </span>
              </div>
              <div className="flex justify-between gap-6 text-[11px]">
                <span className="text-slate-500">GST Adjust</span>
                <span className="text-slate-700 font-medium">
                  {formatINR(
                    order?.items.reduce(
                      (acc, it) => acc + (it.unitPrice ?? it.name.unitPrice) * (it.return ?? 0) * (defaultGst / 100),
                      0
                    ) || 0
                  )}
                </span>
              </div>
              <div className="flex justify-between gap-6 text-sm font-semibold text-slate-900 border-t border-slate-100 pt-1 mt-1">
                <span>Total Refund</span>
                <span>
                  {formatINR(
                    order?.items.reduce(
                      (a, b) => a + (b.unitPrice ?? b.name.unitPrice) * (b.return ?? 0) * (1 + defaultGst / 100),
                      0
                    ) ?? 0
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* REFUND ACTIONS CARD */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT: REFUND OPTIONS */}
          <Card className="shadow-md border-slate-200">
            <CardHeader className="">
              <CardTitle className="text-sm font-medium text-slate-700">
                Refund Options
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-wide text-slate-500 flex items-center gap-1.5 font-semibold">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    Refund Mode
                  </span>
                  <Select
                    value={state.refundMode}
                    onValueChange={(val) =>
                      setState((prev) => ({
                        ...prev,
                        refundMode: val,
                      }))
                    }
                  >
                    <SelectTrigger className="h-9 text-xs rounded-lg border-slate-200">
                      <SelectValue placeholder="Select Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Adjust in Next Bill">Adjust in Next Bill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-wide text-slate-500 flex items-center gap-1.5 font-semibold">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Returned By
                  </span>
                  <Select
                    value={state.returnedBy}
                    onValueChange={(val) =>
                      setState((prev) => ({
                        ...prev,
                        returnedBy: val,
                      }))
                    }
                  >
                    <SelectTrigger className="h-9 text-xs rounded-lg border-slate-200">
                      <SelectValue placeholder="Select Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Patient">Patient</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-wide text-slate-500 flex items-center gap-1.5 font-semibold">
                  <MessageSquareText className="w-3.5 h-3.5 text-slate-400" />
                  Remarks
                </span>
                <Input
                  value={state.remarks}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, remarks: e.target.value }))
                  }
                  placeholder="e.g. Returned sealed strip, verified by pharmacist"
                  className="h-9 rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: STATUS + ACTIONS */}
          <Card className="shadow-md border-slate-200 flex flex-col">
            <CardContent className="p-4 flex flex-col justify-between flex-1">
              <div className="flex items-start justify-between">
                <div className="flex flex-col text-[11px] text-slate-600">
                  <span className="uppercase tracking-wide text-[10px] text-slate-500">
                    Status
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="rounded-full bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px] font-medium px-2 py-0.5 h-auto">
                      Pending Approval
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500 leading-tight">
                  <div>
                    Handled by{" "}
                    <span className="text-slate-900 font-medium">
                      {user?.name}
                    </span>
                  </div>
                  <div className="text-[10px]">{fTime(new Date())}</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-6 text-right">

                <div className="flex justify-end gap-2 flex-wrap">

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button disabled={returning} className="h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-medium px-3 shadow-[0_8px_20px_rgba(16,185,129,0.3)]">
                        {returning ? "Returning..." : "Confirm & Refund"}
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to confirm this return and
                          process the refund? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={returnOrder}
                        >
                          Yes, Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
