import React from "react";
import {
  Search,
  PlusCircle,
  Truck,
  IndianRupee,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import AppShell from "@/components/layout/app-shell";
import { formatINR } from "@/lib/fNumber";

const today = new Date().toLocaleDateString("en-IN", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});



const emergencyOrdersToday = 3;

export default function WholesalerDashboard() {
  return (
    <AppShell>
      <div className="p-5 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
              <span className="uppercase tracking-wide">Wholesaler</span>
              <span className="text-zinc-400">/</span>
              <span className="uppercase tracking-wide text-zinc-700">
                Dashboard
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-3">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900">
                Pharmacy Wholesale Overview
              </h1>

              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
              >
                <AlertTriangle className="w-3 h-3" /> Low Stock: 12 SKUs
              </Badge>
            </div>

            <div className="text-[12px] text-zinc-500">
              {today} · GSTIN: 32ABCDE1234F1Z5
            </div>
          </div>

          <div className="flex-1 flex flex-col-reverse sm:flex-row sm:items-start justify-end gap-3 md:max-w-xl md:ml-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Search products, retailers, invoices..."
                className="pl-9 text-sm bg-white/70 backdrop-blur border-zinc-200 shadow-sm rounded-xl h-10"
              />
            </div>

            <Button className="rounded-xl h-10 px-3 bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm text-[13px] font-semibold whitespace-nowrap flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-zinc-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-zinc-600 flex items-center gap-2">
                  <Package className="w-4 h-4 text-zinc-500" />
                  Total Orders (Today)
                </CardTitle>
                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-medium px-2 py-0.5">
                  +12%
                </Badge>
              </div>
              <div className="text-3xl font-semibold text-zinc-900 leading-none">
                42
              </div>
              <CardDescription className="text-[12px] text-zinc-500">
                vs yesterday
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Pending Dispatch */}
          <Card className="rounded-2xl border-zinc-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-zinc-600 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-zinc-500" />
                  Pending Dispatch
                </CardTitle>
              </div>
              <div className="text-3xl font-semibold text-zinc-900 leading-none">
                9
              </div>
              <CardDescription className="text-[12px] text-zinc-500">
                Need to ship before 4 PM
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-2xl border-zinc-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-zinc-600 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-zinc-500" />
                  Outstanding Payments
                </CardTitle>
              </div>
              <div className="text-3xl font-semibold text-zinc-900 leading-none">
                {formatINR(182500)}
              </div>
              <CardDescription className="text-[12px] text-zinc-500">
                7 retailers overdue
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-2xl border-zinc-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-red-600" />
                  Emergency Orders
                </CardTitle>
                <Badge className="bg-red-600 text-white border border-red-600 rounded-full text-[10px] font-medium px-2 py-0.5 shadow-[0_8px_24px_rgba(220,38,38,0.4)]">
                  ASAP
                </Badge>
              </div>
              <div className="text-3xl font-semibold text-zinc-900 leading-none">
                {emergencyOrdersToday}
              </div>
              <CardDescription className="text-[12px] text-zinc-500">
                Need dispatch now
              </CardDescription>
              <div>
                <Button className="mt-3 rounded-xl h-8 px-3 bg-red-600 text-white hover:bg-red-500 text-[12px] font-semibold shadow-[0_16px_40px_rgba(220,38,38,0.4)] flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5" /> View Emergency Queue
                </Button>
              </div>
            </CardHeader>
          </Card>
        </section>

        {/* ================= MAIN GRID ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT SIDE (2 cols on desktop) */}
          <div className="flex flex-col gap-6 xl:col-span-2">
            {/* ================= DISPATCH QUEUE TABLE ================= */}
            <Card className="rounded-2xl border-zinc-200 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-zinc-900">
                    Dispatch Queue (Today)
                  </CardTitle>
                  <CardDescription className="text-[12px] text-zinc-500">
                    Orders packed / waiting for pickup
                  </CardDescription>
                </div>

                <Button
                  variant="outline"
                  className="rounded-xl h-9 border-zinc-200 text-[13px] font-medium text-zinc-700 bg-white hover:bg-zinc-50"
                >
                  View all
                </Button>
              </CardHeader>

              <CardContent className="px-0">
                <Table className="text-[13px]">
                  <TableHeader>
                    <TableRow className="border-zinc-200 bg-zinc-50/80">
                      <TableHead className="text-zinc-700 font-medium">
                        Retailer
                      </TableHead>
                      <TableHead className="text-zinc-700 font-medium">
                        Order ID
                      </TableHead>
                      <TableHead className="text-zinc-700 font-medium">
                        Items
                      </TableHead>
                      <TableHead className="text-zinc-700 font-medium">
                        Total
                      </TableHead>
                      <TableHead className="text-zinc-700 font-medium">
                        Status
                      </TableHead>
                      <TableHead className="text-right text-zinc-700 font-medium pr-4">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        retailer: "WellCare Pharmacy, Nilambur",
                        id: "#INV-9821",
                        items: "12 SKUs",
                        total: 42500,
                        status: "Ready to Ship",
                        statusColor:
                          "bg-emerald-100 text-emerald-700 border-emerald-200",
                      },
                      {
                        retailer: "City Meds, Edappal",
                        id: "#INV-9820",
                        items: "8 SKUs",
                        total: 31800,
                        status: "Packing",
                        statusColor:
                          "bg-indigo-100 text-indigo-700 border-indigo-200",
                      },
                      {
                        retailer: "HealthPlus Clinic, Manjeri",
                        id: "#INV-9819",
                        items: "5 SKUs",
                        total: 12500,
                        status: "Delayed",
                        statusColor:
                          "bg-amber-100 text-amber-700 border-amber-200",
                      },
                    ].map((row, i) => (
                      <TableRow
                        key={i}
                        className="border-zinc-100 hover:bg-zinc-50/50"
                      >
                        <TableCell className="py-3 align-top text-zinc-800 font-medium">
                          {row.retailer}
                        </TableCell>
                        <TableCell className="py-3 align-top text-zinc-600 font-medium">
                          {row.id}
                        </TableCell>
                        <TableCell className="py-3 align-top text-zinc-600">
                          {row.items}
                        </TableCell>
                        <TableCell className="py-3 align-top text-zinc-800 font-semibold">
                          {formatINR(row.total)}
                        </TableCell>
                        <TableCell className="py-3 align-top">
                          <Badge
                            className={`border ${row.statusColor} rounded-full text-[10px] font-medium px-2 py-0.5`}
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 align-top text-right pr-4">
                          <div className="relative inline-flex gap-2">
                            <Button className="rounded-lg h-8 px-2 text-[12px] font-medium bg-zinc-900 text-white hover:bg-zinc-800">
                              Print Invoice
                            </Button>
                            <Button className="rounded-lg h-8 px-2 text-[12px] font-medium border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50">
                              Mark Shipped
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* ================= RECENT INVOICES / PAYMENTS ================= */}
            <Card className="rounded-2xl border-zinc-200 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-zinc-900">
                    Recent Invoices / Payments
                  </CardTitle>
                  <CardDescription className="text-[12px] text-zinc-500">
                    Latest bills sent to retailers
                  </CardDescription>
                </div>

                <Button
                  variant="outline"
                  className="rounded-xl h-9 border-zinc-200 text-[13px] font-medium text-zinc-700 bg-white hover:bg-zinc-50"
                >
                  View all
                </Button>
              </CardHeader>

              <CardContent className="px-0">
                <Table className="text-[13px]">
                  <TableHeader>
                    <TableRow className="border-zinc-200 bg-zinc-50/80">
                      <TableHead className="text-zinc-700 font-medium">
                        Invoice
                      </TableHead>
                      <TableHead className="text-zinc-700 font-medium">
                        Retailer
                      </TableHead>
                      <TableHead className="text-zinc-700 font-medium">
                        Amount
                      </TableHead>
                      <TableHead className="text-zinc-700 font-medium">
                        Status
                      </TableHead>
                      <TableHead className="text-zinc-700 font-medium">
                        Due
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        inv: "#INV-9821",
                        retailer: "WellCare Pharmacy",
                        amt: 42500,
                        status: "Paid",
                        statusColor:
                          "bg-emerald-100 text-emerald-700 border-emerald-200",
                        due: "—",
                      },
                      {
                        inv: "#INV-9820",
                        retailer: "City Meds",
                        amt: 31800,
                        status: "Partial",
                        statusColor:
                          "bg-indigo-100 text-indigo-700 border-indigo-200",
                        due: "Nov 02",
                      },
                      {
                        inv: "#INV-9819",
                        retailer: "HealthPlus Clinic",
                        amt: 12500,
                        status: "Unpaid",
                        statusColor:
                          "bg-rose-100 text-rose-700 border-rose-200",
                        due: "Oct 31",
                      },
                    ].map((row, i) => (
                      <TableRow
                        key={i}
                        className="border-zinc-100 hover:bg-zinc-50/50"
                      >
                        <TableCell className="py-3 align-top text-zinc-800 font-medium">
                          {row.inv}
                        </TableCell>
                        <TableCell className="py-3 align-top text-zinc-600">
                          {row.retailer}
                        </TableCell>
                        <TableCell className="py-3 align-top text-zinc-800 font-semibold">
                          {formatINR(row.amt)}
                        </TableCell>
                        <TableCell className="py-3 align-top">
                          <Badge
                            className={`border ${row.statusColor} rounded-full text-[10px] font-medium px-2 py-0.5`}
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 align-top text-zinc-600 text-sm">
                          {row.due}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE (1 col on desktop) */}
          <div className="flex flex-col gap-6">
            {/* ================= LOW STOCK ================= */}
            <Card className="rounded-2xl border-zinc-200 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-zinc-900">
                    Low Stock / Reorder
                  </CardTitle>
                  <CardDescription className="text-[12px] text-zinc-500">
                    These SKUs will run out soon
                  </CardDescription>
                </div>

                <Button
                  variant="outline"
                  className="rounded-xl h-9 border-zinc-200 text-[13px] font-medium text-zinc-700 bg-white hover:bg-zinc-50"
                >
                  View all
                </Button>
              </CardHeader>

              <CardContent className="px-0">
                <Table className="text-[13px]">
                  <TableHeader>
                    <TableRow className="border-zinc-200 bg-zinc-50/80">
                      <TableHead className="text-zinc-700 font-medium">
                        Item
                      </TableHead>
                      <TableHead className="text-zinc-700 font-medium">
                        Qty
                      </TableHead>
                      <TableHead className="text-right text-zinc-700 font-medium pr-4">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {[
                      {
                        name: "T Dolo 650 mg",
                        gen: "(Gen: Paracetamol)",
                        qty: "12 strips",
                        min: "Min 50",
                      },
                      {
                        name: "T Xtan 40 mg",
                        gen: "(Gen: Telmisartan)",
                        qty: "4 strips",
                        min: "Min 30",
                      },
                      {
                        name: "Azithro 500 mg",
                        gen: "(Gen: Azithromycin)",
                        qty: "0 box",
                        min: "Min 10",
                      },
                    ].map((row, i) => (
                      <TableRow
                        key={i}
                        className="border-zinc-100 hover:bg-zinc-50/50"
                      >
                        <TableCell className="py-3 align-top text-zinc-800 font-medium">
                          <div className="leading-tight">
                            <div>{row.name}</div>
                            <div className="text-[11px] text-zinc-500 font-normal">
                              {row.gen}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 align-top text-zinc-800 font-semibold whitespace-nowrap">
                          <div className="leading-tight">
                            <div>{row.qty}</div>
                            <div className="text-[11px] text-zinc-500 font-normal">
                              Min {row.min}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 align-top text-right pr-4">
                          <Button className="rounded-lg h-8 text-[12px] font-medium bg-zinc-900 text-white hover:bg-zinc-800">
                            Reorder
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* ================= ALERTS ================= */}
            <Card className="rounded-2xl border border-amber-200 bg-amber-50/60 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Alerts
                </CardTitle>
                <CardDescription className="text-[12px] text-amber-700">
                  Things that need attention
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-3 text-[13px] text-amber-800">
                <div className="bg-white/70 border border-amber-200 rounded-xl px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
                  <div className="font-medium text-[13px] text-amber-900">
                    Payment overdue
                  </div>
                  <div className="text-[12px] text-amber-700 leading-snug">
                    City Meds ({formatINR(31800)}) due on Oct 31.
                  </div>
                </div>

                <div className="bg-white/70 border border-amber-200 rounded-xl px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
                  <div className="font-medium text-[13px] text-amber-900">
                    Azithro 500 mg out of stock
                  </div>
                  <div className="text-[12px] text-amber-700 leading-snug">
                    You’re at 0 box. Retailers asked 6 boxes today.
                  </div>
                </div>

                <div className="bg-white/70 border border-amber-200 rounded-xl px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
                  <div className="font-medium text-[13px] text-amber-900">
                    GST filing
                  </div>
                  <div className="text-[12px] text-amber-700 leading-snug">
                    Monthly GST filing due in 2 days.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
