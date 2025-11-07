"use client";

import React, { useState } from "react";
import { Plus, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
import { formatINR } from "@/lib/fNumber";
import PurchaseOrder from "./PurchaseOrder";

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

export default function PurchaseOrdersListPage() {
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  if (showCreate) {
    return (
      <AppShell>
        <PurchaseOrder onBack={() => setShowCreate(false)} />
      </AppShell>
    );
  }

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
