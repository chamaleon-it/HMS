"use client";

import { useEffect, useState } from "react";
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
import AppShell from "@/components/layout/app-shell";
import { OrderType } from "./interface";
import Header from "./Header";
import { formatINR } from "@/lib/fNumber";
import Search from "./Search";
import toast from "react-hot-toast";
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

      if (mrn) {
        params.set("q", mrn);
      }
      else if (filter.q) {

        if (filter.q.startsWith("RX")) {
          toast.error("Please enter a valid RX id");
          return;
        }
        params.set("q", filter.q ?? "");
      } else {
        toast.error("Please enter a valid RX id");
        return;
      }

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
        billNo?: string;
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
        billNo: order?.billNo,
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
      <div className="p-5 flex flex-col gap-6 text-sm min-h-[calc(100vh-80px)]">
        <Header />

        <Search
          fetchOrder={fetchOrder}
          filter={filter}
          setFilter={setFilter}
          order={order}
        />

        {/* RETURNED ITEMS TABLE */}
        <section className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200">


          {fetching ? (
            <TableSkeleton rows={5} columns={11} />
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[1000px] text-xs">
                <TableHeader className="bg-slate-700 hover:bg-slate-700">
                  <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                    <TableHead className="w-[40px] text-center text-white font-bold text-[11px] uppercase tracking-wider py-2.5 pl-4">Sl No</TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Medicine / Gen</TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">HSN</TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Batch</TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Expiry</TableHead>
                    <TableHead className="text-center text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Qty Sold</TableHead>
                    <TableHead className="text-center text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Qty Return</TableHead>
                    <TableHead className="text-right text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Rate</TableHead>
                    <TableHead className="text-right text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Amount</TableHead>
                    <TableHead className="text-white text-right font-bold text-[11px] uppercase tracking-wider py-2.5">Reason</TableHead>
                    <TableHead className="text-white text-right font-bold text-[11px] uppercase tracking-wider py-2.5 pr-4">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="[&>tr:nth-child(even)]:bg-slate-50/40">
                  {order?.items.map((it, i) => (
                    <TableRow key={it.name._id} className="text-[14px]">
                      <TableCell className="text-center  text-slate-500 py-3 pl-4">
                        {i + 1}
                      </TableCell>

                      <TableCell className="">
                        <div className="text-slate-900 font-medium text-[12px] leading-tight">
                          {it.name.name}
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">
                          (Gen: {it.name.generic})
                        </div>
                      </TableCell>

                      <TableCell className=" text-slate-700 font-medium text-sm">
                        {it.name.hsnCode}
                      </TableCell>

                      <TableCell className=" text-slate-700 font-medium">
                        {it.name?.batches?.[0]?.batchNumber ?? "N/A"}
                      </TableCell>

                      <TableCell className=" text-slate-700 font-medium">
                        {fDate(it.name.expiryDate)}
                      </TableCell>

                      <TableCell className="text-center font-medium text-slate-700">
                        {it.quantity}
                      </TableCell>

                      <TableCell className="text-center font-medium">
                        <Input
                          type="number"
                          min={0}
                          max={it.quantity}
                          className="h-8 w-14 text-center rounded-lg border-slate-300 text-[11px] px-2 py-1 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-medium"
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

                      <TableCell className="text-right font-medium">
                        <Input
                          type="number"
                          min={0}
                          className="h-8 w-20 text-right rounded-lg border-slate-300 text-[11px] px-2 py-1 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 ml-auto font-medium"
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
                        {formatINR(((it.unitPrice ?? it.name.unitPrice) * (it.return ?? 0)))}
                      </TableCell>

                      <TableCell className="text-right">
                        <Select
                          defaultValue="Doctor Changed Rx"
                          value={it.reason}
                          onValueChange={(val) => {
                            setOrder((prev) =>
                              prev
                                ? {
                                  ...prev,
                                  items: prev.items.map((item) =>
                                    item.name._id === it.name._id
                                      ? {
                                        ...item,
                                        reason: val,
                                      }
                                      : item
                                  ),
                                }
                                : null
                            );
                          }}
                        >
                          <SelectTrigger className="h-8 w-[160px] text-[11px] rounded-lg border-slate-300 ml-auto">
                            <SelectValue placeholder="Select Reason" />
                          </SelectTrigger>
                          <SelectContent className="text-[11px]">
                            <SelectItem value="Doctor Changed Rx">Doctor Changed Rx</SelectItem>
                            <SelectItem value="Expired">Expired</SelectItem>
                            <SelectItem value="Near Expiry">Near Expiry</SelectItem>
                            <SelectItem value="Quality Issue">Quality Issue</SelectItem>
                            <SelectItem value="Wrong Item">Wrong Item</SelectItem>
                            <SelectItem value="Adverse Reaction">Adverse Reaction</SelectItem>
                            <SelectItem value="Not Required">Not Required</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            <SelectItem value="Damaged">Damaged</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right py-3">
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
                          <Trash className="w-3.5 h-3.5" />

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
              <div className="flex justify-between gap-6 text-sm font-semibold text-slate-900 border-t border-slate-100 pt-1 mt-1">
                <span>Total Refund</span>
                <span>
                  {formatINR(
                    order?.items.reduce(
                      (a, b) => a + (b.unitPrice ?? b.name.unitPrice) * (b.return ?? 0),
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
                  <span className="text-[12px] uppercase tracking-wide text-slate-500 flex items-center gap-1.5 font-semibold">
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
                  <span className="text-[12px] uppercase tracking-wide text-slate-500 flex items-center gap-1.5 font-semibold">
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
                <div className=""></div>
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
