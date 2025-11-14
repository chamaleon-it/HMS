"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppShell from "@/components/layout/app-shell";
import { useParams, useRouter } from "next/navigation";
import { formatINR } from "@/lib/fNumber";
import { fDate } from "@/lib/fDateAndTime";

interface PatientVisitItem {
  sl: number;
  brand: string;
  generic: string;
  qty: number;
  mrp: number;
}

interface PatientVisit {
  date: string;
  rxId: string;
  billNo: string;
  items: PatientVisitItem[];
}

interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F" | "O";
  phone: string;
  address: string;
  visits: PatientVisit[];
}

const patientsMock: PatientRecord[] = [
  {
    id: "PT-1001",
    name: "Ameen K",
    age: 34,
    gender: "M",
    phone: "+91 98xxxxxx21",
    address: "Nilambur, Kerala",
    visits: [
      {
        date: fDate(new Date()),
        rxId: "RX-2401",
        billNo: "B-10245",
        items: [
          {
            sl: 1,
            brand: "T Dolo 650 mg",
            generic: "Paracetamol / Acetaminophen",
            qty: 1,
            mrp: 35,
          },
          {
            sl: 2,
            brand: "T Cetirizine 10 mg",
            generic: "Cetirizine HCl",
            qty: 1,
            mrp: 28,
          },
        ],
      },
      {
        date: "12 Nov 2025",
        rxId: "RX-2388",
        billNo: "B-10198",
        items: [
          {
            sl: 1,
            brand: "ORS 21g Sachet",
            generic: "Oral Rehydration Salts",
            qty: 2,
            mrp: 18,
          },
        ],
      },
    ],
  },
  {
    id: "PT-1002",
    name: "Nadisha M",
    age: 28,
    gender: "F",
    phone: "+91 97xxxxxx12",
    address: "Kochi, Kerala",
    visits: [
      {
        date: fDate(new Date()),
        rxId: "RX-2402",
        billNo: "B-10246",
        items: [
          {
            sl: 1,
            brand: "Cap Amoxicillin 500 mg",
            generic: "Amoxicillin",
            qty: 1,
            mrp: 95,
          },
          {
            sl: 2,
            brand: "Capsule Lactobacillus",
            generic: "Probiotic (Lactobacillus)",
            qty: 1,
            mrp: 120,
          },
        ],
      },
    ],
  },
  {
    id: "PT-1003",
    name: "S. Kumar",
    age: 41,
    gender: "M",
    phone: "+91 90xxxxxx88",
    address: "Calicut, Kerala",
    visits: [],
  },
];

function sumVisit(visit: PatientVisit) {
  return visit.items.reduce((acc, it) => acc + it.qty * it.mrp, 0);
}

function sumPatient(p: PatientRecord) {
  return p.visits.reduce((acc, v) => acc + sumVisit(v), 0);
}

function lastPurchaseDate(p: PatientRecord) {
  if (!p.visits.length) return "—";

  return p.visits[0].date;
}

function avgTicket(p: PatientRecord) {
  if (!p.visits.length) return 0;
  return sumPatient(p) / p.visits.length;
}

const Customer: React.FC = () => {
  const router = useRouter();

  const { id } = useParams();
  const [selected, setSelected] = useState<PatientRecord | null>(null);

  useEffect(() => {
    setSelected(patientsMock.find((e) => e.id === id) ?? null);
  }, [id]);

  const [selectedVisit, setSelectedVisit] = useState<PatientVisit | null>(null);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const handlePrint = () => {
    if (typeof window !== "undefined" && (window as Window).print) {
      (window as Window).print();
    }
  };

  if (!selected) return null;
  const v = selectedVisit;
  const hasHistory = selected.visits.length > 0;

  const filteredBills = selected.visits.filter((bill) => {
    if (!dateFrom && !dateTo) return true;
    const billDate = new Date(bill.date);
    if (dateFrom) {
      const from = new Date(dateFrom);
      if (billDate < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      if (billDate > to) return false;
    }
    return true;
  });

  return (
    <AppShell>
      <div className="bg-slate-50 p-5">
        <main className="space-y-6">
          <div className="mb-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 rounded-full border-slate-300 bg-white/80 hover:bg-slate-50"
              onClick={() => router.push("/dashboard/pharmacy/customers")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to customers
            </Button>
          </div>

          <div className="border rounded-2xl bg-white shadow-sm px-5 py-4 flex flex-wrap items-start gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white text-lg font-semibold">
              {selected.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-[220px]">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {selected.name}
                </h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  UHID: {selected.id}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Age {selected.age} / {selected.gender} • Ph: {selected.phone}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                {selected.address}
              </p>
              <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                {!hasHistory && (
                  <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                    No purchase history yet
                  </span>
                )}
              </div>
            </div>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border rounded-2xl p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
              <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                Total Spend
              </div>
              <div className="text-2xl font-semibold text-emerald-900">
                {formatINR(sumPatient(selected))}
              </div>
            </div>
            <div className="border rounded-2xl p-4 bg-gradient-to-br from-sky-50 to-sky-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
              <div className="text-xs font-medium text-sky-700 uppercase tracking-wide">
                Total Visits
              </div>
              <div className="text-3xl font-semibold text-sky-900">
                {selected.visits.length}
              </div>
            </div>
            <div className="border rounded-2xl p-4 bg-gradient-to-br from-violet-50 to-violet-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
              <div className="text-xs font-medium text-violet-700 uppercase tracking-wide">
                Last Purchase
              </div>
              <div className="text-sm font-semibold text-violet-900">
                {lastPurchaseDate(selected)}
              </div>
            </div>
            <div className="border rounded-2xl p-4 bg-gradient-to-br from-amber-50 to-amber-100/60 flex flex-col gap-1 shadow-sm transition-transform duration-150 hover:-translate-y-[2px]">
              <div className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                Avg Ticket
              </div>
              <div className="text-2xl font-semibold text-amber-900">
                {formatINR(avgTicket(selected) || 0)}
              </div>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-5 items-start">
            <div className="md:col-span-2 border rounded-2xl bg-white shadow-sm flex flex-col h-[480px]">
              <div className="px-4 py-3 bg-slate-900 text-slate-50 flex items-center justify-between">
                <div className="text-sm font-medium flex items-center gap-2">
                  <span className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[11px]">
                    {selected.visits.length}
                  </span>
                  Bills / Visits
                </div>
                <div className="text-[11px] text-slate-200">
                  {selected.visits.length || "No"} bill
                  {selected.visits.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="px-4 py-3 bg-slate-50 border-b flex items-center gap-3 text-[12px] text-slate-700">
                <span className="font-medium">Filter:</span>
                <Input
                  type="date"
                  className="h-8 text-xs bg-white border-slate-300"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <span className="text-slate-500">to</span>
                <Input
                  type="date"
                  className="h-8 text-xs bg-white border-slate-300"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
                {(dateFrom || dateTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[11px] px-3"
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto divide-y">
                {selected.visits.length === 0 && (
                  <div className="p-4 text-xs text-slate-500">
                    No purchase history for this patient.
                  </div>
                )}

                {selected.visits.length > 0 && filteredBills.length === 0 && (
                  <div className="p-4 text-xs text-slate-500">
                    No bills in this date range.
                  </div>
                )}

                {filteredBills.map((bill) => {
                  const amount = sumVisit(bill);
                  const active = v && v.rxId === bill.rxId;
                  return (
                    <button
                      key={bill.rxId}
                      type="button"
                      onClick={() => setSelectedVisit(bill)}
                      className={`w-full text-left px-4 py-3.5 text-[15px] flex flex-col gap-1 transition-all duration-150 ${
                        active
                          ? "bg-slate-900 text-slate-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">
                          {bill.date} • {bill.billNo}
                        </span>
                        <span className="text-xs font-semibold">
                          {formatINR(amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[12px]">
                        <span className="opacity-80">RX: {bill.rxId}</span>
                        <span
                          className={active ? "opacity-80" : "text-slate-500"}
                        >
                          {bill.items.length} item
                          {bill.items.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-3 border rounded-2xl bg-white shadow-sm flex flex-col h-[480px]">
              <div className="px-4 py-3 bg-slate-50 flex items-center justify-between border-b">
                <div className="text-sm font-semibold text-slate-900">
                  {v ? `Bill Details — ${v.billNo}` : "Bill Details"}
                </div>
                {v && (
                  <div className="text-[11px] text-slate-500 flex flex-col items-end">
                    <span>
                      Date:{" "}
                      <span className="font-medium text-slate-700">
                        {v.date}
                      </span>
                    </span>
                    <span>
                      RX ID:{" "}
                      <span className="font-medium text-slate-700">
                        {v.rxId}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {!v && (
                <div className="p-6 text-sm text-slate-500">
                  Select a bill on the left to see its item-wise details.
                </div>
              )}

              {v && (
                <>
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-[15px]">
                      <thead className="bg-slate-50 text-slate-700 sticky top-0 text-sm">
                        <tr>
                          <th className="p-2 text-left font-medium">Sl</th>
                          <th className="p-2 text-left font-medium">
                            Medicine
                          </th>
                          <th className="p-2 text-right font-medium">Qty</th>
                          <th className="p-2 text-right font-medium">MRP</th>
                          <th className="p-2 text-right font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {v.items.map((it) => {
                          const amount = it.qty * it.mrp;
                          return (
                            <tr
                              key={it.sl}
                              className="border-t align-top hover:bg-slate-50/70 transition-colors"
                            >
                              <td className="p-2 align-top text-slate-500">
                                {it.sl}
                              </td>
                              <td className="p-2 align-top">
                                <div className="font-medium text-slate-900 leading-snug">
                                  {it.brand}
                                </div>
                                <div className="text-[12px] text-slate-600 leading-snug">
                                  (Gen: {it.generic})
                                </div>
                              </td>
                              <td className="p-2 align-top text-right text-sm font-semibold text-slate-900">
                                {it.qty}
                              </td>
                              <td className="p-2 align-top text-right text-slate-800">
                                {formatINR(it.mrp)}
                              </td>
                              <td className="p-2 align-top text-right font-semibold text-slate-900">
                                {formatINR(amount)}
                              </td>
                            </tr>
                          );
                        })}

                        {v.items.length === 0 && (
                          <tr>
                            <td
                              className="p-3 text-center text-slate-500"
                              colSpan={5}
                            >
                              No items.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="border-t bg-slate-50/80">
                          <td
                            colSpan={4}
                            className="p-2 text-right text-xs text-slate-600"
                          >
                            Total
                          </td>
                          <td className="p-2 text-right text-sm font-semibold text-slate-900">
                            {formatINR(sumVisit(v))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="px-4 py-3 border-t bg-slate-50 flex items-center justify-between gap-3">
                    <div className="text-[12px] text-slate-500">
                      Use Print bill to generate a hard copy. In production this
                      can open a dedicated A5/A4 receipt template.
                    </div>
                    <Button
                      className="rounded-full text-sm px-6 py-2 bg-slate-900 text-white hover:bg-slate-800"
                      onClick={handlePrint}
                    >
                      Print bill
                    </Button>
                  </div>
                </>
              )}
            </div>
          </section>
        </main>
      </div>
    </AppShell>
  );
};

export default Customer;
