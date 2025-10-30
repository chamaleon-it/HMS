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

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    n || 0
  );

export default function PharmacyReturnPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [items, setItems] = useState([
    {
      id: 1,
      hsn: "30045010",
      name: "T Dolo 650 mg",
      generic: "Paracetamol / Acetaminophen",
      batch: "B1234",
      expiry: "12/26",
      qtySold: 10,
      qtyReturn: 2,
      rate: 18,
      reason: "Expired",
    },
  ]);

  const totalRefund = items.reduce(
    (sum, it) => sum + it.qtyReturn * it.rate,
    0
  );

  return (
    <AppShell>
      <div className="p-5 flex flex-col gap-6 text-sm min-h-[calc(100vh-80px)]">
        {/* PAGE HEADER */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">
                Return / Credit Note
              </span>
              <h1 className="text-xl font-semibold leading-tight text-slate-900">
                Pharmacy Return
              </h1>
            </div>
            <Badge className="rounded-full bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
              Draft
            </Badge>
          </div>

          <div className="flex flex-col items-end text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">
              Return No
            </div>
            <div className="font-medium text-slate-900">RET-00023</div>
            <div className="text-[10px] text-slate-400">
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </header>

        {/* SEARCH + PATIENT/INVOICE ROW */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* LEFT: SEARCH BOX */}
          <Card className="xl:col-span-1 shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <span>Find Bill / Patient</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search invoice no. / patient name..."
                    className="pl-9 text-sm h-9 rounded-lg border-slate-300 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    🔍
                  </span>
                </div>
                <Button className="h-9 rounded-lg bg-slate-900 text-white hover:bg-slate-800 px-3 text-xs font-medium">
                  Load
                </Button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex flex-col">
                  <span className="uppercase tracking-wide">Invoice No</span>
                  <span className="text-slate-900 font-medium text-xs">
                    INV-1024
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="uppercase tracking-wide">Invoice Date</span>
                  <span className="text-slate-900 font-medium text-xs">
                    28 Oct 2025
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: BILL SUMMARY */}
          <Card className="xl:col-span-2 shadow-sm border-slate-200">
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-[11px] text-slate-600">
              <div className="flex flex-col">
                <span className="uppercase tracking-wide">Patient</span>
                <span className="text-slate-900 font-medium text-sm leading-tight">
                  John Mathew
                </span>
                <span className="text-[10px] text-slate-400">PID: P-88921</span>
              </div>
              <div className="flex flex-col">
                <span className="uppercase tracking-wide">Doctor</span>
                <span className="text-slate-900 font-medium text-sm leading-tight">
                  Dr. Rahul Nair
                </span>
                <span className="text-[10px] text-slate-400">OPD</span>
              </div>
              <div className="flex flex-col">
                <span className="uppercase tracking-wide">Payment Mode</span>
                <span className="text-slate-900 font-medium text-sm leading-tight">
                  UPI
                </span>
                <span className="text-[10px] text-slate-400">
                  Txn: TXN284712
                </span>
              </div>
              <div className="flex flex-col">
                <span className="uppercase tracking-wide">Invoice Total</span>
                <span className="text-slate-900 font-semibold text-base leading-tight">
                  {formatINR(1800)}
                </span>
                <span className="text-[10px] text-slate-400">incl. GST</span>
              </div>
            </CardContent>
          </Card>
        </section>

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
                {items.map((it, i) => (
                  <TableRow key={it.id} className="text-[11px]">
                    <TableCell className="text-center align-top text-slate-500">
                      {i + 1}
                    </TableCell>

                    <TableCell className="align-top">
                      <div className="text-slate-900 font-medium text-[12px] leading-tight">
                        {it.name}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        (Gen: {it.generic})
                      </div>
                    </TableCell>

                    <TableCell className="align-top text-slate-600">
                      {it.hsn}
                    </TableCell>

                    <TableCell className="align-top text-slate-600">
                      {it.batch}
                    </TableCell>

                    <TableCell className="align-top text-slate-600">
                      {it.expiry}
                    </TableCell>

                    <TableCell className="text-center font-medium text-slate-700">
                      {it.qtySold}
                    </TableCell>

                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min={0}
                        max={it.qtySold}
                        value={it.qtyReturn}
                        className="h-8 w-14 text-center rounded-lg border-slate-300 text-[11px] px-2 py-1 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setItems((prev) =>
                            prev.map((row) =>
                              row.id === it.id
                                ? {
                                    ...row,
                                    qtyReturn: v > it.qtySold ? it.qtySold : v,
                                  }
                                : row
                            )
                          );
                        }}
                      />
                    </TableCell>

                    <TableCell className="text-right tabular-nums text-slate-700 font-medium">
                      {formatINR(it.rate)}
                    </TableCell>

                    <TableCell className="text-right tabular-nums font-semibold text-slate-900">
                      {formatINR(it.qtyReturn * it.rate)}
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
                  {formatINR(totalRefund)}
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
                <span>{formatINR(totalRefund)}</span>
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
                      Pharmacy Staff
                    </span>
                  </div>
                  <div className="text-[10px]">11:42 AM</div>
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
