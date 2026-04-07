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

  const { data: pharmacistResponse } = useSWR<{ data: { _id: string; name: string; inCharge: boolean }[]; message: string }>("/pharmacist");
  const inChargePharmacist = pharmacistResponse?.data?.find((p) => p.inCharge);


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
          <div className="flex items-center justify-end gap-4 mb-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Pharmacist In-charge</span>
                <span className="text-sm font-semibold text-slate-700">{inChargePharmacist?.name ?? "—"}</span>
              </div>
            </div>
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
