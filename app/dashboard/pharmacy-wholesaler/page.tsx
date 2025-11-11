"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { useAuth } from "@/auth/context/auth-context";
import useSWR from "swr";
import { PurchaseDataType } from "./interface";
import PurchaseTable from "./PurchaseTable";
import InvoiceTable from "./InvoiceTable";
import LowStock from "./LowStock";
import Header from "./Header";
import TotalOrder from "./TotalOrder";
import PendingDispatch from "./PendingDispatch";
import AlertMessage from "./AlertMessage";
import OutstandingPayments from "./OutstandingPayments";
import EmergencyOrders from "./EmergencyOrders";

export default function WholesalerDashboard() {
  const { user } = useAuth();

  const [filter] = useState({
    page: 1,
    limit: 100,
    wholesaler: user?._id,
    mrn: "",
  });

  const param = new URLSearchParams();

  param.set("page", String(filter.page));
  param.set("limit", String(filter.limit));
  if (filter.wholesaler) {
    param.set("wholesaler", filter?.wholesaler);
  }
  if (filter.mrn) {
    param.set("mrn", filter.mrn);
  }

  const { data: PurchaseData } = useSWR<PurchaseDataType>(
    `/pharmacy/purchase?${param.toString()}`
  );

  const purchase = PurchaseData?.data ?? [];

  return (
    <AppShell>
      <div className="p-5 flex flex-col gap-6">
        <Header />
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <TotalOrder orders={purchase.length} />
          <PendingDispatch orders={purchase.length} />
          <OutstandingPayments
            amount={purchase.reduce((total, order) => {
              const orderTotal =
                order.items.reduce(
                  (sum, item) => sum + item.quantity * item.unitPrice,
                  0
                ) + order.shipping;
              return total + orderTotal;
            }, 0)}
          />
          <EmergencyOrders
            urgentOrders={purchase.filter((e) => e.urgent).length}
          />
        </section>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="flex flex-col gap-6 xl:col-span-2">
            <PurchaseTable purchase={purchase} />
            <InvoiceTable purchase={purchase} />
          </div>
          <div className="flex flex-col gap-6">
            <LowStock />
            <AlertMessage />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
