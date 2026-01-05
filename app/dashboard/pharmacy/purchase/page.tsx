"use client";

import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { Card, CardContent } from "@/components/ui/card";

import AppShell from "@/components/layout/app-shell";

import PurchaseOrder from "./PurchaseOrder";
import PurchaseTable from "./PurchaseTable";
import useSWR from "swr";
import { useAuth } from "@/auth/context/auth-context";
import { PurchaseDataType } from "./interface";
import { TableSkeleton } from "../components/PharmacySkeleton";

export default function PurchaseOrdersListPage() {


  const [showCreate, setShowCreate] = useState(false);

  const { user } = useAuth();

  const [filter, setFilter] = useState({
    page: 1,
    limit: 100,
    pharmacy: user?._id,
    mrn: "",
  });

  const param = new URLSearchParams();

  param.set("page", String(filter.page));
  param.set("limit", String(filter.limit));
  if (filter.pharmacy) {
    param.set("pharmacy", filter?.pharmacy);
  }
  if (filter.mrn) {
    param.set("mrn", filter.mrn);
  }

  const { data: PurchaseData, mutate, isLoading } = useSWR<PurchaseDataType>(
    `/pharmacy/purchase?${param.toString()}`
  );

  const purchase = PurchaseData?.data ?? [];

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
        <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 bg-linear-to-br from-background via-background to-muted/40 border rounded-2xl p-4 lg:p-5 shadow-sm">
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
                  placeholder="Search PO #"
                  value={filter.mrn}
                  onChange={(e) =>
                    setFilter((prev) => ({ ...prev, mrn: e.target.value }))
                  }
                />
              </div>
            </div>



          </CardContent>
        </Card>

        {/* TABLE OF ORDERS */}
        {isLoading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <PurchaseTable purchase={purchase} total={PurchaseData?.total ?? 0} />
        )}
      </div>
    </AppShell>
  );
}
