"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

import AppShell from "@/components/layout/app-shell";

import PurchaseOrder from "./PurchaseOrder";
import PurchaseTable from "./PurchaseTable";
import useSWR from "swr";
import { useAuth } from "@/auth/context/auth-context";
import { PurchaseDataType } from "./interface";

export default function PurchaseOrdersListPage() {
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const {user} = useAuth()

  const [filter, setFilter] = useState({
    page:1,
    limit:100,
    pharmacy:user?._id
  })

  const param = new URLSearchParams()

  param.set("page",String(filter.page))
  param.set("limit",String(filter.limit))
  if(filter.pharmacy){

    param.set("pharmacy",filter?.pharmacy)
  }

  const {data:PurchaseData,mutate} = useSWR<PurchaseDataType>(`/pharmacy/purchase?${param.toString()}`)

  const purchase = PurchaseData?.data ?? []

  if (showCreate) {
    return (
      <AppShell>
        <PurchaseOrder onBack={() => setShowCreate(false)} mutate={mutate} />
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
        <PurchaseTable purchase={purchase} total={PurchaseData?.total ?? 0}/>
      </div>
    </AppShell>
  );
}
