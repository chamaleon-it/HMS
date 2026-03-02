"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import OrderTable from "./OrderTable";
import { OrderType } from "./interface";
import useSWR from "swr";
import DeleteOrder from "./DeleteOrder";
import NewOrder from "./NewOrder";
import PharmacyStatus from "./PharmacyStatus";
import { TableSkeleton } from "./components/PharmacySkeleton";
import PharmacyHeader from "./components/PharmacyHeader";

function RxQueue() {

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<OrderType | null>(null);


  const handleDelete = (rx: OrderType) => {
    setSelected(rx);
    setDeleteOpen(true);
  };

  const [filter, setFilter] = useState<{
    q: "Pending" | "Filling" | "Ready" | "Completed" | "Deleted";
    page: number;
    limit: number;
  }>({
    q: "Pending",
    page: 1,
    limit: 20,
  });

  const params = new URLSearchParams();


  params.set("q", filter.q);
  params.set("page", String(filter.page));
  params.set("limit", String(filter.limit));


  const { data: ordersData, mutate: OrderMutate, isLoading } = useSWR<{
    message: string;
    total: number;
    data: OrderType[];
  }>(`/pharmacy/orders?${params.toString()}`);

  const orders = ordersData?.data ?? [];
  const total = ordersData?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">

      <PharmacyHeader
        title="RX Queue"
        subtitle="Manage prescriptions and pharmacy operations"
      >
        <NewOrder OrderMutate={OrderMutate} />
        <PharmacyStatus currenctStatus={filter.q} setCurrenctStatus={(status) => setFilter((prev) => ({ ...prev, q: status, page: 1 }))} />
      </PharmacyHeader>

      {isLoading ? (
        <TableSkeleton rows={8} columns={10} />
      ) : (
        <OrderTable
          orders={orders}
          total={total}
          filter={filter}
          setFilter={setFilter}
          handleDelete={handleDelete}
          OrderMutate={OrderMutate}
        />
      )}


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
      <TooltipProvider>
        <main className="p-5 min-h-[calc(100vh-80px)]">
          <RxQueue />
        </main>
      </TooltipProvider>
    </AppShell>
  );
}
