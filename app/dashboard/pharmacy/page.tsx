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
import { UserRound } from "lucide-react";
import { useDrafts } from "./DraftContext";

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
    q: "Pending" | "Completed" | "Deleted" | "Draft";
    page: number;
    limit: number;
  }>({
    q: "Pending",
    page: 1,
    limit: 20,
  });

  const params = new URLSearchParams();
  const [activeDate, setActiveDate] = useState<"Today" | "7 days" | "30 days" | "Custom">("Today");
  const [date, setDate] = useState<Date>(new Date());

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

  const { drafts } = useDrafts();

  const { data: ordersData, mutate: OrderMutate, isLoading } = useSWR<{
    message: string;
    total: number;
    data: OrderType[];
  }>(filter.q === "Draft" ? null : `/pharmacy/orders?${params.toString()}`);

  const apiOrders = ordersData?.data ?? [];
  const apiTotal = ordersData?.total ?? 0;

  // Combine draft mapping
  const orders = filter.q === "Draft" 
    ? drafts.filter(d => !d.isOpen).map((d) => ({
        _id: d.id,
        mrn: "-",
        rxNumber: `DRFT-${d.id.slice(-4)}`,
        patient: { name: d.patientName || "Unknown" } as any,
        status: "Draft",
        priority: d.payload?.priority || "Normal",
        items: d.payload?.items || [],
        createdAt: new Date(parseInt(d.id)).toISOString(), // fallback timestamp
        department: "Walk-in",
        paymentStatus: "Pending",
        grandTotal: 0,
        doctor: null,
      })) as unknown as OrderType[]
    : apiOrders;
    
  const total = filter.q === "Draft" ? drafts.filter(d => !d.isOpen).length : apiTotal;

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
          <div className="flex items-center justify-end gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <UserRound className="h-4 w-4 text-slate-400" />
              <span className="text-slate-400">In-charge</span>
              <span className="font-semibold text-slate-700">{inChargePharmacist?.name ?? "—"}</span>
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
        <main className="p-5 min-h-[calc(100vh-67px)]">
          <RxQueue />
        </main>
      </TooltipProvider>
    </AppShell>
  );
}
