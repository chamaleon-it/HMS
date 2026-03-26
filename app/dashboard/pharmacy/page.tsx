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
import DateFilter from "./DateFilter";
import { endOfDay, startOfDay, subDays } from "date-fns";

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
  const [activeDate, setActiveDate] = useState<string>("Today");
  const [date, setDate] = useState<Date>();

  let startDateStr = "";
  let endDateStr = "";

  let sd: Date = startOfDay(new Date());
  let ed: Date = endOfDay(new Date());

  if (activeDate === "Today") {
    sd = startOfDay(new Date());
  } else if (activeDate === "7 days") {
    sd = startOfDay(subDays(new Date(), 7));
  } else if (activeDate === "30 days") {
    sd = startOfDay(subDays(new Date(), 30));
  } else if (activeDate === "Custom" && date) {
    sd = startOfDay(date);
    ed = endOfDay(date);
  }

  startDateStr = sd.toISOString();
  endDateStr = ed.toISOString();

  params.set("q", filter.q);
  params.set("page", String(filter.page));
  params.set("limit", String(filter.limit));
  params.set("startDate", startDateStr);
  params.set("endDate", endDateStr);


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
        <DateFilter
          activeDate={activeDate}
          setActiveDate={setActiveDate}
          date={date}
          setDate={setDate}
          isLoading={isLoading}
        />
      </PharmacyHeader>

      {isLoading ? (
        <TableSkeleton rows={8} columns={10} />
      ) : (
        <div className="">
          <div className="flex justify-end  mb-4">
            <PharmacyStatus currenctStatus={filter.q} setCurrenctStatus={(status) => setFilter((prev) => ({ ...prev, q: status, page: 1 }))} />
          </div>
          <OrderTable
            orders={orders}
            total={total}
            filter={filter}
            setFilter={setFilter}
            handleDelete={handleDelete}
            OrderMutate={OrderMutate}
          />
        </div>
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
