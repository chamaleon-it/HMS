"use client";

import React, { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AppShell from "@/components/layout/app-shell";
import { OrderType } from "./interface";
import Header from "./Header";
import { formatINR } from "@/lib/fNumber";
import Search from "./Search";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { fDate, fTime } from "@/lib/fDateAndTime";
import { useAuth } from "@/auth/context/auth-context";

export default function PharmacyReturnPage() {
  const [showDialog, setShowDialog] = useState(false);
  const { user } = useAuth();

  const [filter, setFilter] = useState<{ q: null | string }>({
    q: null,
  });

  const [order, setOrder] = useState<null | OrderType>(null);

  const fetchOrder = async () => {
    try {
      if (!filter.q) {
        toast.error("Please enter a valid RX id");
        return;
      }
      const params = new URLSearchParams();

      params.set("q", filter.q);

      const { data } = await api.get(`/pharmacy/orders/single?${params}`);
      setOrder(data.data);
    } catch (error) {
      console.log(error);
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
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="text-sm font-medium text-slate-700">
              Items to Return
            </div>
            <div className="text-[11px] text-slate-500">
              Stock will update on confirm
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-full text-xs">
              <TableHeader>
                <TableRow className="bg-white [&>th]:h-9 [&>th]:text-[11px] [&>th]:font-medium [&>th]:text-slate-500 [&>th]:uppercase [&>th]:tracking-wide">
                  <TableHead className="w-[32px] text-center">#</TableHead>
                  <TableHead>Medicine / Gen</TableHead>
                  <TableHead>HSN</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-center">Qty Sold</TableHead>
                  <TableHead className="text-center">Qty Return</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Reason</TableHead>
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
                      {"B1234"}
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
                        value={it.return}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if(value>it.quantity){
                            return
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

                    <TableCell className="text-right tabular-nums text-slate-700 font-medium">
                      {formatINR(it.name.unitPrice)}
                    </TableCell>

                    <TableCell className="text-right tabular-nums font-semibold text-slate-900">
                      {formatINR(it.name.unitPrice * (it.return ?? 0))}
                    </TableCell>

                    <TableCell className="align-top">
                      <div className="relative inline-block text-[11px]">
                        <select className="appearance-none h-8 rounded-lg border border-slate-300 bg-white pr-7 pl-2 text-[11px] leading-none text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400">
                          <option>Expired</option>
                          <option>Damaged</option>
                          <option>Wrong item</option>
                          <option>Other</option>
                        </select>
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                          ▾
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-4 py-3">
            <div className="text-right text-xs">
              <div className="flex justify-between gap-6">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-700">
                  {formatINR(order?.items.reduce((a,b)=>a+b.name.unitPrice* (b.return ?? 0),0) ?? 0)}
                </span>
              </div>
              <div className="flex justify-between gap-6 text-[11px]">
                <span className="text-slate-500">GST Adjust</span>
                <span className="text-slate-700 font-medium">
                  {formatINR(0)}
                </span>
              </div>
              <div className="flex justify-between gap-6 text-sm font-semibold text-slate-900">
                <span>Total Refund</span>
                <span>{formatINR(order?.items.reduce((a,b)=>a+b.name.unitPrice* (b.return ?? 0),0) ?? 0)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* REFUND ACTIONS CARD */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT: REFUND OPTIONS */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Refund Options
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-[11px] text-slate-700">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wide text-slate-500">
                  Refund Mode
                </span>
                <div className="relative inline-block">
                  <select className="appearance-none h-9 w-full rounded-lg border border-slate-300 bg-white pr-8 pl-3 text-[12px] leading-none text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400">
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Adjust in Next Bill</option>
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                    ▾
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wide text-slate-500">
                  Returned By
                </span>
                <div className="relative inline-block">
                  <select className="appearance-none h-9 w-full rounded-lg border border-slate-300 bg-white pr-8 pl-3 text-[12px] leading-none text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400">
                    <option>Patient</option>
                    <option>Staff</option>
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                    ▾
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 col-span-2">
                <span className="text-[10px] uppercase tracking-wide text-slate-500">
                  Remarks
                </span>
                <Input
                  placeholder="example: Returned sealed strip, verified"
                  className="h-9 rounded-lg border-slate-300 text-[12px] focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: STATUS + ACTIONS */}
          <Card className="shadow-sm border-slate-200 flex flex-col">
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
                <div className="text-[10px] text-slate-500">
                  Preview before confirm
                </div>
                <div className="flex justify-end gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    className="h-9 rounded-lg border-slate-300 text-[12px] font-medium px-3"
                  >
                    Preview Credit Note
                  </Button>
                  <Button
                    onClick={() => setShowDialog(true)}
                    className="h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-medium px-3 shadow-[0_8px_20px_rgba(16,185,129,0.3)]"
                  >
                    Confirm & Refund
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SUCCESS DIALOG */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="rounded-xl max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                  ✓
                </span>
                Return Completed
              </DialogTitle>
            </DialogHeader>
            <div className="text-xs text-slate-600 leading-relaxed">
              Stock updated. Refund recorded. Credit note ready to print.
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                className="h-8 rounded-lg border-slate-300 text-[12px] font-medium px-3"
              >
                Print Credit Note
              </Button>
              <Button
                onClick={() => setShowDialog(false)}
                className="h-8 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-[12px] font-medium px-3"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
