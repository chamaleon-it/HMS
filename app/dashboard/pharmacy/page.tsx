"use client";

import { useState } from "react";

import AppShell from "@/components/layout/app-shell";
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

  const [filter, setFilter] = useState<{ q: "Pending" | "Filling" | "Ready" | "Completed" }>({
    q: "Pending",
  });

  const params = new URLSearchParams();


  params.set("q", filter.q);


  const { data: ordersData, mutate: OrderMutate, isLoading } = useSWR<{
    message: string;
    data: OrderType[];
  }>(`/pharmacy/orders?${params.toString()}`);

  const orders = ordersData?.data ?? [];

  return (
    <div>

      <PharmacyHeader
        title="RX Queue"
        subtitle="Manage prescriptions and pharmacy operations"
      >
        <NewOrder OrderMutate={OrderMutate} />
        <PharmacyStatus currenctStatus={filter.q} setCurrenctStatus={(status) => setFilter((prev) => ({ ...prev, q: status }))} />
      </PharmacyHeader>

      {isLoading ? (
        <TableSkeleton rows={8} columns={10} />
      ) : (
        <OrderTable
          orders={orders}
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
      <main className="p-5 min-h-[calc(100vh-80px)]">
        <RxQueue />
      </main>
    </AppShell>
  );
}
