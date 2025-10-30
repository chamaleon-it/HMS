"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Eye,
  Search,
  Trash2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import AppShell from "@/components/layout/app-shell";

// ---------------------------------------------------
// Shared helpers / mock data
// ---------------------------------------------------

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(n || 0);

// mock product catalog for dropdown in PO form
const PRODUCTS = [
  { id: "SKU-123", name: "Paracetamol 650mg (Dolo 650)", defaultCost: 1.2 },
  { id: "SKU-998", name: "Telmisartan 40mg (Xtan 40)", defaultCost: 4.5 },
  { id: "SKU-771", name: "Azithromycin 500mg (Azee 500)", defaultCost: 8.0 },
];

// mock suppliers for PO form
const WHOLESALERS = [
  {
    id: "sup-1",
    name: "A1 Pharma Distributors",
    contact: "Rahul N",
    phone: "+91 98765 43210",
    lastOrderDate: "18 Oct 2025",
    lastOrderAmount: 47320,
    balance: 125000,
    address:
      "A1 Pharma Distributors,\n1st Floor, MG Road,\nKochi, Kerala - 682001",
    termsDefault: "7d",
  },
  {
    id: "sup-2",
    name: "Medline Wholesale",
    contact: "Shanavas",
    phone: "+91 95678 11223",
    lastOrderDate: "22 Oct 2025",
    lastOrderAmount: 19850,
    balance: 0,
    address: "Medline Wholesale,\nMarket Lane,\nCalicut, Kerala - 673001",
    termsDefault: "cod",
  },
];

// dummy table data for PO list screen
const SAMPLE_ORDERS = [
  {
    poNumber: "PO-2025-1030-001",
    supplier: "A1 Pharma Distributors",
    createdOn: "30 Oct 2025",
    expected: "31 Oct 2025",
    status: "Sent",
    tone: "bg-blue-100 text-blue-700 border-blue-300",
    total: 47320,
    receivedPct: 0,
  },
  {
    poNumber: "PO-2025-1028-004",
    supplier: "Medline Wholesale",
    createdOn: "28 Oct 2025",
    expected: "29 Oct 2025",
    status: "Partially Received",
    tone: "bg-amber-100 text-amber-700 border-amber-300",
    total: 19850,
    receivedPct: 60,
  },
  {
    poNumber: "PO-2025-1025-002",
    supplier: "A1 Pharma Distributors",
    createdOn: "25 Oct 2025",
    expected: "26 Oct 2025",
    status: "Completed",
    tone: "bg-emerald-100 text-emerald-700 border-emerald-300",
    total: 55200,
    receivedPct: 100,
  },
  {
    poNumber: "PO-2025-1025-003",
    supplier: "Medline Wholesale",
    createdOn: "25 Oct 2025",
    expected: "25 Oct 2025",
    status: "Draft",
    tone: "bg-muted text-foreground/70 border-border/60",
    total: 0,
    receivedPct: 0,
  },
];

// ---------------------------------------------------
// CREATE PURCHASE ORDER PAGE (the form)
// ---------------------------------------------------

function PurchaseOrderPage({ onBack }: { onBack: () => void }) {
  // meta
  const [poNumber] = useState("PO-2025-1030-001");
  const [orderDate] = useState("30 Oct 2025");

  // supplier section state
  const [supplierId, setSupplierId] = useState("sup-1");
  const supplierData = useMemo(
    () => WHOLESALERS.find((s) => s.id === supplierId),
    [supplierId]
  );

  const [contactPerson, setContactPerson] = useState(
    supplierData?.contact || ""
  );
  const [phone, setPhone] = useState(supplierData?.phone || "");
  const [deliveryAddress, setDeliveryAddress] = useState(
    supplierData?.address || ""
  );
  const [expectedDate, setExpectedDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState(
    supplierData?.termsDefault || "7d"
  );

  // line items state
  const [items, setItems] = useState([
    {
      productId: "SKU-123",
      productName: "Paracetamol 650mg (Dolo 650)",
      cost: 1.2,
      qty: 100,
      notes: "",
    },
  ]);

  function addItem(product?: {
    id: string;
    name: string;
    defaultCost: number;
  }) {
    // Adds either a blank row or a prefilled product row
    if (!product) {
      setItems((prev) => [
        ...prev,
        {
          productId: "",
          productName: "",
          cost: 0,
          qty: 1,
          notes: "",
        },
      ]);
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        cost: product.defaultCost,
        qty: 1,
        notes: "",
      },
    ]);
  }

  function updateItem(
    idx: number,
    patch?: {
      productId?: string;
      productName?: string;
      cost?: number;
      notes?: string;
      qty?: number;
    }
  ) {
    setItems((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...patch } : row))
    );
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  // totals
  const [shippingCharge, setShippingCharge] = useState(0);
  const GST_RATE = 0.12; // placeholder %

  const subTotal = items.reduce((sum, it) => sum + it.cost * it.qty, 0);
  const tax = subTotal * GST_RATE;
  const grandTotal = subTotal + tax + shippingCharge;

  // flags / notes
  const [specialNotes, setSpecialNotes] = useState("");
  const [allowPartial, setAllowPartial] = useState(false);
  const [urgent, setUrgent] = useState(false);

  return (
    <div className="flex flex-col gap-6 pb-28 max-w-screen-xl mx-auto px-4">
      {/* HEADER WITH BACK */}
      <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 bg-gradient-to-br from-background via-background to-muted/40 border rounded-2xl p-4 lg:p-5 shadow-sm">
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="ghost"
              className="h-9 px-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 flex items-center gap-2"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Purchase Orders</span>
            </Button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              Create Purchase Order
              {urgent ? (
                <Badge className="rounded-full text-[11px] bg-amber-100 text-amber-700 border border-amber-300 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Urgent
                </Badge>
              ) : (
                <Badge variant="secondary" className="rounded-full text-[11px]">
                  Draft
                </Badge>
              )}
            </h1>
          </div>

          <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] uppercase text-muted-foreground">
                PO #
              </span>
              <span className="font-medium text-foreground">{poNumber}</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] uppercase text-muted-foreground">
                Order Date
              </span>
              <span className="font-medium text-foreground">{orderDate}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button variant="outline" className="rounded-xl h-9 px-4">
            Save Draft
          </Button>
          <Button
            className="rounded-xl h-9 px-4"
            // For now assume we send and return to list
            onClick={onBack}
          >
            Send Order
          </Button>
        </div>
      </header>

      {/* SUPPLIER CARD */}
      <Card className="rounded-2xl shadow-sm border-border/60">
        <CardHeader className="pb-3 flex flex-col gap-1 lg:flex-row lg:items-start lg:justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            Supplier / Wholesaler
          </CardTitle>

          {supplierData && (
            <div className="text-[11px] text-muted-foreground grid grid-cols-3 gap-4 lg:text-right lg:grid-cols-3">
              <div className="flex flex-col leading-tight">
                <span className="uppercase text-[10px]">Last Order</span>
                <span className="text-foreground font-medium">
                  {supplierData.lastOrderDate}
                </span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="uppercase text-[10px]">Last Amount</span>
                <span className="text-foreground font-medium">
                  {formatINR(supplierData.lastOrderAmount)}
                </span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="uppercase text-[10px]">Outstanding</span>
                <span
                  className={
                    supplierData.balance > 0
                      ? "text-red-600 font-semibold"
                      : "text-foreground font-medium"
                  }
                >
                  {formatINR(supplierData.balance)}
                </span>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-4">
            {/* Wholesaler */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">
                Wholesaler <span className="text-red-500">*</span>
              </Label>
              <Select
                value={supplierId}
                onValueChange={(val) => {
                  const sup = WHOLESALERS.find((s) => s.id === val);
                  setSupplierId(val);
                  setContactPerson(sup?.contact || "");
                  setPhone(sup?.phone || "");
                  setDeliveryAddress(sup?.address || "");
                  setPaymentTerms(sup?.termsDefault || "7d");
                }}
              >
                <SelectTrigger className="rounded-xl h-10">
                  <SelectValue placeholder="Select wholesaler" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg">
                  {WHOLESALERS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contact */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Contact person</Label>
              <Input
                className="rounded-xl h-10"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Phone / WhatsApp</Label>
              <Input
                className="rounded-xl h-10"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4">
            {/* Address */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Delivery address</Label>
              <Textarea
                rows={4}
                className="rounded-xl resize-none"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>

            {/* Expected + Terms */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Expected delivery</Label>
                <Input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="rounded-xl h-10"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-medium">Payment terms</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger className="rounded-xl h-10">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg">
                    <SelectItem value="cod">Cash on delivery</SelectItem>
                    <SelectItem value="7d">7 days credit</SelectItem>
                    <SelectItem value="30d">30 days credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ITEMS CARD */}
      <Card className="rounded-2xl shadow-sm border-border/60">
        <CardHeader className="pb-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            Items
          </CardTitle>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto">
            <Input
              placeholder="Search product / SKU"
              className="h-10 rounded-xl sm:w-[220px]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // demo: add first product quickly via Enter
                  addItem(PRODUCTS[0]);
                }
              }}
            />
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl h-10 gap-1 text-sm"
              onClick={() => addItem()}
            >
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-xl border overflow-x-auto">
            <Table className="min-w-[900px] text-sm">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[28%]">Item</TableHead>
                  <TableHead className="w-[10%] text-right">
                    Unit Cost (₹)
                  </TableHead>
                  <TableHead className="w-[10%] text-right">Qty</TableHead>
                  <TableHead className="w-[12%] text-right">
                    Line Total
                  </TableHead>
                  <TableHead className="w-[30%]">Notes</TableHead>
                  <TableHead className="w-[10%] text-center">Remove</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((row, idx) => {
                  const lineTotal = row.cost * row.qty;
                  return (
                    <TableRow key={idx} className="align-top">
                      {/* Item / SKU */}
                      <TableCell className="py-4">
                        <div className="grid gap-2">
                          <Select
                            value={row.productId}
                            onValueChange={(val) => {
                              const prod = PRODUCTS.find((p) => p.id === val);
                              updateItem(idx, {
                                productId: val,
                                productName: prod?.name || "",
                                cost: prod?.defaultCost ?? row.cost ?? 0,
                              });
                            }}
                          >
                            <SelectTrigger className="h-9 rounded-lg text-left">
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-lg max-h-64">
                              {PRODUCTS.map((p) => (
                                <SelectItem
                                  key={p.id}
                                  value={p.id}
                                  className="py-2 text-left"
                                >
                                  <div className="flex flex-col text-left">
                                    <span className="font-medium text-sm leading-tight">
                                      {p.name}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground leading-tight">
                                      {p.id}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="text-[11px] text-muted-foreground leading-tight">
                            {row.productName || "—"}
                          </div>
                        </div>
                      </TableCell>

                      {/* Cost */}
                      <TableCell className="py-4 align-top text-right">
                        <Input
                          type="number"
                          className="h-9 rounded-lg text-right"
                          value={row.cost}
                          onChange={(e) =>
                            updateItem(idx, {
                              cost: parseFloat(e.target.value || "0"),
                            })
                          }
                        />
                      </TableCell>

                      {/* Qty */}
                      <TableCell className="py-4 align-top text-right">
                        <Input
                          type="number"
                          min={1}
                          className="h-9 rounded-lg text-right"
                          value={row.qty}
                          onChange={(e) =>
                            updateItem(idx, {
                              qty: parseInt(e.target.value || "0"),
                            })
                          }
                        />
                      </TableCell>

                      {/* Line total */}
                      <TableCell className="py-4 align-top text-right font-medium">
                        {formatINR(lineTotal)}
                      </TableCell>

                      {/* Notes */}
                      <TableCell className="py-4 align-top">
                        <Textarea
                          rows={2}
                          className="resize-none h-[72px] text-sm rounded-lg"
                          placeholder="Batch preference / colour / etc."
                          value={row.notes}
                          onChange={(e) =>
                            updateItem(idx, { notes: e.target.value })
                          }
                        />
                      </TableCell>

                      {/* Remove */}
                      <TableCell className="py-4 align-top text-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          onClick={() => removeItem(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* COST SUMMARY */}
          <div className="flex flex-col items-end">
            <div className="w-full max-w-sm border rounded-xl p-4 bg-muted/20 space-y-3 text-sm shadow-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatINR(subTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  GST ({Math.round(GST_RATE * 100)}%)
                </span>
                <span className="font-medium">{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Shipping / Other</span>
                <Input
                  type="number"
                  className="h-8 w-24 text-right rounded-lg"
                  value={shippingCharge}
                  onChange={(e) =>
                    setShippingCharge(parseFloat(e.target.value || "0"))
                  }
                />
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NOTES & FLAGS */}
      <Card className="rounded-2xl shadow-sm border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Additional Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-2">
            <Label className="text-sm font-medium">
              Special instructions to supplier
            </Label>
            <Textarea
              rows={4}
              className="rounded-xl resize-none"
              placeholder="Eg: Send only fresh stock (MFG Oct 2025 or newer). Pack 10s blister separately."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between rounded-xl border p-4">
              <div className="text-sm">
                <div className="font-medium">Allow partial delivery</div>
                <div className="text-muted-foreground text-xs leading-relaxed">
                  Supplier can send what is available now and the rest later.
                </div>
              </div>
              <Switch
                checked={allowPartial}
                onCheckedChange={setAllowPartial}
              />
            </div>

            <div
              className={`flex items-start justify-between rounded-xl border p-4 ${
                urgent ? "bg-amber-50 border-amber-200" : ""
              }`}
            >
              <div className="text-sm">
                <div className="font-medium flex items-center gap-1">
                  <span>Mark as urgent</span>
                  {urgent && (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                </div>
                <div className="text-muted-foreground text-xs leading-relaxed">
                  Supplier will see this order highlighted with ⚠.
                </div>
              </div>
              <Switch checked={urgent} onCheckedChange={setUrgent} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STICKY FOOTER BAR */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm flex flex-col md:flex-row md:items-center md:gap-4 leading-tight">
            <div className="font-medium">Items: {items.length}</div>
            <div className="text-muted-foreground">
              Grand Total:{" "}
              <span className="font-semibold text-foreground">
                {formatINR(grandTotal)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="rounded-xl h-9 px-4 text-muted-foreground"
              onClick={onBack}
            >
              Cancel
            </Button>
            <Button variant="outline" className="rounded-xl h-9 px-4">
              Save Draft
            </Button>
            <Button className="rounded-xl h-9 px-4" onClick={onBack}>
              Send Purchase Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------
// LIST PAGE (default landing view)
// ---------------------------------------------------

export default function PurchaseOrdersListPage() {
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // toggle view: list <-> create form
  const [showCreate, setShowCreate] = useState(false);

  // if creating new PO, render form
  if (showCreate) {
    return <PurchaseOrderPage onBack={() => setShowCreate(false)} />;
  }

  // otherwise render list/table view
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-5 min-h-[calc(100vh-80px)]">
        <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 bg-gradient-to-br from-background via-background to-muted/40 border rounded-2xl p-4 lg:p-5 shadow-sm">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Purchase Orders
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Track, manage, and create purchase orders to wholesalers.
            </p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="rounded-xl h-9 px-3 gap-2"
          >
            <Plus className="h-4 w-4" /> Create Purchase Order
          </Button>
        </header>

        {/* FILTER BAR */}
        <Card className="rounded-2xl shadow-sm border-border/60">
          <CardContent className="p-4 grid gap-4 md:grid-cols-4 lg:grid-cols-5">
            {/* SEARCH FIELD */}
            <div className="md:col-span-2 lg:col-span-2 flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Search
              </Label>
              <div className="relative">
                <Search className="h-4 w-4 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
                <Input
                  className="pl-8 rounded-xl h-9"
                  placeholder="Search PO # / Supplier / Notes"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* SUPPLIER FILTER */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Supplier
              </Label>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger className="rounded-xl h-9">
                  <SelectValue placeholder="All suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All suppliers</SelectItem>
                  <SelectItem value="A1 Pharma Distributors">
                    A1 Pharma Distributors
                  </SelectItem>
                  <SelectItem value="Medline Wholesale">
                    Medline Wholesale
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* STATUS FILTER */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-xl h-9">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Partially Received">
                    Partially Received
                  </SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* TABLE OF ORDERS */}
        <Card className="rounded-2xl shadow-sm border-border/60">
          <CardHeader className="pb-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-base font-medium">
              All Purchase Orders
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              {SAMPLE_ORDERS.length} orders found
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border overflow-x-auto">
              <Table className="min-w-[900px] text-sm">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>PO #</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead className="text-right">Total (₹)</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SAMPLE_ORDERS.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.poNumber}</TableCell>
                      <TableCell>{row.supplier}</TableCell>
                      <TableCell>{row.createdOn}</TableCell>
                      <TableCell>{row.expected}</TableCell>
                      <TableCell className="text-right">
                        {formatINR(row.total)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`rounded-full text-[11px] border ${row.tone}`}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 rounded-lg text-xs"
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
