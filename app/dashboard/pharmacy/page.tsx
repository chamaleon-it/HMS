"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppShell from "@/components/layout/app-shell";
import OrderTable from "./OrderTable";
import { OrderType } from "./interface";
import useSWR from "swr";
import { fAge, fDate, fDateandTime } from "@/lib/fDateAndTime";
import DeleteOrder from "./DeleteOrder";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import NewOrder from "./NewOrder";

import ViewOrder from "./ViewOrder";

function RxQueue() {


  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<OrderType | null>(null);

  const handleView = (rx: OrderType) => {
    setSelected(rx);
    setOpen(true);
  };

  const handleDelete = (rx: OrderType) => {
    setSelected(rx);
    setDeleteOpen(true);
  };

  const [filter, setFilter] = useState({
    q: "all",
  });

  const params = new URLSearchParams();

  if (filter.q !== "all") {
    params.set("q", filter.q);
  }

  const { data: ordersData, mutate: OrderMutate } = useSWR<{
    message: string;
    data: OrderType[];
  }>(`/pharmacy/orders?${params.toString()}`);

  const orders = ordersData?.data ?? [];

  return (
    <div>
      {/* Queue header row */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold">RX Queue</h2>
          <p className="text-slate-600 text-sm">Live prescriptions</p>
        </div>
        <div className="flex gap-5 items-center">

          <NewOrder OrderMutate={OrderMutate} />

          <Tabs
            defaultValue="all"
            className="w-auto"
            value={filter.q}
            onValueChange={(v) => setFilter((prev) => ({ ...prev, q: v }))}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="stat">STAT</TabsTrigger>
              <TabsTrigger value="ready">Ready</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <OrderTable
        handleView={handleView}
        orders={orders}
        handleDelete={handleDelete}
        OrderMutate={OrderMutate}
      />

      <ViewOrder
        open={open}
        setOpen={setOpen}
        order={selected}
        OrderMutate={OrderMutate}
      />

      <DeleteOrder
        open={deleteOpen}
        setOpen={setDeleteOpen}
        selected={selected}
        onDeleted={OrderMutate}
      />
    </div>
  );
}

export default function PharmacyHome() {
  return (
    <AppShell>
      <main className="p-5 min-h-[calc(100vh-80px)]">
        <RxQueue />
      </main>
    </AppShell>
  );
}
