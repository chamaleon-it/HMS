"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AppShell from "@/components/layout/app-shell";
import OrderTable from "./OrderTable";
import { OrderType } from "./interface";
import useSWR from "swr";
import { fAge, fDate, fDateandTime } from "@/lib/fDateAndTime";
import DeleteOrder from "./DeleteOrder";
import { formatINR } from "@/lib/fNumber";
import toast from "react-hot-toast";
import api from "@/lib/axios";

function Barcode({ value }: { value: string }) {
  const bars = Array.from(value || "").map(
    (ch, i) => ((ch.charCodeAt(0) + i) % 7) + 2
  );
  const totalW = bars.reduce((a, b) => a + b + 1, 0);
  let x = 0;
  return (
    <svg width={totalW} height={48} className="bg-white">
      {bars.map((w, i) => {
        const rect = (
          <rect key={i} x={x} y={0} width={w} height={48} fill="#000" />
        );
        x += w + 1;
        return rect;
      })}
    </svg>
  );
}

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

  const params = new URLSearchParams()
  
  if(filter.q!=="all"){
    params.set("q",filter.q)
  }


  const { data: ordersData, mutate: OrderMutate } = useSWR<{
    message: string;
    data: OrderType[];
  }>(`/pharmacy/orders?${params.toString()}`);

  const orders = ordersData?.data ?? [];

  const markAllPacked = async () => {
    try {
      await toast.promise(
        api.post("/pharmacy/orders/mark_all_as_packed", {
          order: selected?._id,
        }),
        {
          loading: "Marking all item is packed",
          error: ({ response }) => response.data.message,
          success: ({ data }) => data.message,
        }
      );
      setSelected((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((it) => ({ ...it, isPacked: true })),
            }
          : null
      );
      OrderMutate();
    } catch (error) {
      console.log(error);
    }
  };

  

  return (
    <div>
      {/* Queue header row */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold">RX Queue</h2>
          <p className="text-slate-600 text-sm">Live prescriptions</p>
        </div>
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

      <OrderTable
        handleView={handleView}
        orders={orders}
        handleDelete={handleDelete}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!w-[98vw] !max-w-7xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Packing View — {selected?.mrn}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[75vh] overflow-auto pr-1 pb-16">
            {/* Patient + Bill Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
              {/* Patient card */}
              <div className="border rounded-lg p-3 md:col-span-2">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Patient
                </div>
                <div className="font-semibold text-lg flex items-center gap-1">
                  <p>{selected?.patient?.name}</p> - <span className="text-sm">({selected?.patient.mrn})</span>
                </div>
                <div className="text-sm text-slate-700">
                  Age/Gender: {fAge(selected?.patient?.dateOfBirth)} /{" "}
                  {selected?.patient?.gender} • Ph:
                  {selected?.patient?.phoneNumber}
                </div>
                <div className="text-sm text-slate-700">
                  Address: {selected?.patient.address}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Doctor: {selected?.doctor.name} • Specialization:{" "}
                  {selected?.doctor.specialization}
                </div>
              </div>

              {/* Bill card */}
              <div className="border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-600">
                    Date:{" "}
                    <span className="font-medium">
                      {fDateandTime(selected?.createdAt)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    RX ID: <span className="font-medium">{selected?.mrn}</span>
                  </div>
                </div>
                <div className="ml-3 bg-white p-1 rounded border">
                  <Barcode value={selected?.mrn ?? ""} />
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-[15px] rounded-xl">
                <thead className="bg-slate-700 hover:bg-slate-700 text-white ">
                  <tr className="w-full">
                    <th className="w-[5%] p-2 text-left">Sl</th>
                    <th className="w-[25%] p-2 text-left">Medicine</th>
                    <th className="w-[10%] p-2 text-left">Exp</th>
                    <th className="w-[10%] p-2 text-right">Qty</th>
                    <th className="w-[10%] p-2 text-right">Available</th>
                    <th className="w-[10%] p-2 text-right">MRP</th>
                    <th className="w-[15%] p-2 text-right">Amount</th>
                    <th className="w-[15%] p-2 text-right">Packed</th>
                  </tr>
                </thead>
                <tbody>
                  {selected?.items.map((it, idx) => {
                    const amount =
                      (Number(it.quantity) || 1) *
                      (Number(it.name.unitPrice) || 0);
                    return (
                      <tr
                        key={it.name._id}
                        className="border-t align-top w-full"
                      >
                        <td className="p-2 align-top">{idx + 1}</td>
                        <td className="p-2 align-top">
                          <div className="font-medium text-slate-900 leading-snug">
                            {it.name.name}
                          </div>
                          <div className="text-[12px] text-slate-600 leading-snug">
                            (Gen: {it.name.generic})
                          </div>
                          {it?.name?.hsnCode && (
                            <div className="text-[11px] text-slate-400 leading-snug">
                              HSN: {it?.name?.hsnCode}
                            </div>
                          )}
                        </td>

                        <td className="p-2 align-top text-slate-700">
                          {fDate(it.name.expiryDate)}
                        </td>
                        <td className="p-2 align-top text-right text-lg font-semibold text-slate-900">
                          {it.quantity}
                        </td>
                        <td className="p-2 align-top text-center text-lg font-semibold text-slate-900">
                          {it.name.quantity}
                        </td>
                        <td className="p-2 align-top text-right whitespace-nowrap">
                          {formatINR(it.name.unitPrice)}
                        </td>
                        <td className="p-2 align-top text-right font-medium whitespace-nowrap">
                          {formatINR(amount)}
                        </td>
                        <td className="p-2 align-top text-right">
                          <input
                            type="checkbox"
                            className="h-5 w-5"
                            checked={it.isPacked}
                            onChange={async () => {
                              try {
                                if (it.isPacked) {
                                  toast.error("This item is already packed");
                                  return;
                                }
                                await toast.promise(
                                  api.post("/pharmacy/orders/packed", {
                                    order: selected._id,
                                    item: it.name._id,
                                  }),
                                  {
                                    loading: "item is packing...",
                                    error: ({ response }) =>
                                      response.data.message,
                                    success: ({ data }) => data.message,
                                  }
                                );
                                OrderMutate();
                                setSelected((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        items: prev.items.map((i) =>
                                          i.name._id === it.name._id
                                            ? { ...i, isPacked: true }
                                            : i
                                        ),
                                      }
                                    : null
                                );
                              } catch (error) {
                                console.log(error);
                              }
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td colSpan={6}></td>
                    <td className="p-2 text-right text-sm">Subtotal</td>
                    <td className="p-2 text-right text-sm">
                      {formatINR(
                        selected?.items.reduce(
                          (a, b) => a + b.name.unitPrice * b.quantity,
                          0
                        ) || 0
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6}></td>
                    <td className="p-2 text-right text-sm">Round Off</td>
                    <td className="p-2 text-right text-sm">
                      {/* {round >= 0 ? "+" : ""} */}
                      {/* {round.toFixed(2)} */}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6}></td>
                    <td className="p-2 text-right font-semibold">
                      Grand Total
                    </td>
                    <td className="p-2 text-right font-semibold">
                      {formatINR(
                        selected?.items.reduce(
                          (a, b) => a + b.name.unitPrice * b.quantity,
                          0
                        ) || 0
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer actions */}
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t pt-3 pb-2 mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
              <div className="text-sm">
                Packed:{" "}
                <span
                  className={`font-medium ${
                    false ? "text-emerald-700" : "text-slate-700"
                  }`}
                >
                  {false ? "All items confirmed" : "In progress"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={markAllPacked}
                >
                  Mark all packed
                </Button>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => window.print?.()}
                >
                  Print
                </Button>
                <Button>Share</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
