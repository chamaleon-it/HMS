"use client";

import { useState } from "react";

import AppShell from "@/components/layout/app-shell";
import OrderTable from "./OrderTable";
import { OrderType } from "./interface";
import useSWR from "swr";
import DeleteOrder from "./DeleteOrder";
import NewOrder from "./NewOrder";
import PharmacyStatus from "./PharmacyStatus";

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

          <PharmacyStatus currenctStatus={filter.q} setCurrenctStatus={(status) => setFilter((prev) => ({ ...prev, q: status }))} />

        </div>
      </div>

      <OrderTable
        orders={orders}
        handleDelete={handleDelete}
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
