"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AppShell from "@/components/layout/app-shell";
import { fAge, fDate } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Filter, { FilterType } from "./Filter";
import NewOrder from "./NewOrder";
import { TableSkeleton } from "../components/PharmacySkeleton";
import PharmacyHeader from "../components/PharmacyHeader";

const Customers: React.FC = () => {
  const router = useRouter();

  const [filter, setFilter] = useState<FilterType>({
    query: undefined,
    gender: undefined,
    doctor: undefined,
    age: [0, 100],
    lastVisit: undefined,
    alreadyPurchase: false,
    dateRange: { from: undefined, to: undefined },
  });

  const params = new URLSearchParams();

  params.set("alreadyPurchase", filter.alreadyPurchase ? "true" : "false");

  const { data: customersData, isLoading, mutate } = useSWR<{
    message: string;
    data: {
      totalSpend: number;
      visits: number;
      patient: {
        _id: string;
        name: string;
        phoneNumber: string;
        gender: string;
        dateOfBirth: Date;
        address: string;
        mrn: string;
        doctor: string;
      };
      lastPurchase: Date;
    }[];
  }>(`/pharmacy/orders/customers?${params.toString()}`);

  const customers = customersData?.data ?? [];





  return (
    <AppShell>
      <div className="p-5 min-h-[calc(100vh-80px)]">
        <main className="flex flex-col gap-6">
          <PharmacyHeader
            title="Customers"
            subtitle="Click a row to open full pharmacy history for that customer"
          >

            <NewOrder mutate={mutate} />
          </PharmacyHeader>

          <Filter filter={filter} setFilter={setFilter} />

          {isLoading ? (
            <TableSkeleton rows={10} columns={8} />
          ) : (
            <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200">
              <Table>
                <TableHeader className="bg-slate-700 hover:bg-slate-700">
                  <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4 px-4 pl-4">Sl No</TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4">Customers</TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4">PID</TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4">
                      Age / Gender
                    </TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4">Phone</TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4 text-right">
                      Visits
                    </TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4 text-right">
                      Last Purchase
                    </TableHead>
                    <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4 text-right pr-4">
                      Total Spend
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-[15px]">
                  {customers
                    .filter((p) => {
                      // Query filter
                      if (filter.query) {
                        const q = filter.query.toLowerCase();
                        const match =
                          (p.patient.name?.toLowerCase() || "").startsWith(q) ||
                          (p.patient.phoneNumber || "").includes(q) ||
                          (p.patient.mrn || "").includes(q);

                        if (!match) return false;
                      }

                      // Gender filter
                      if (filter.gender) {
                        if (p.patient.gender !== filter.gender) return false;
                      }

                      // Age filter
                      if (filter.age) {
                        const age = fAge(p.patient.dateOfBirth);
                        if (age < filter.age[0] || age > filter.age[1]) return false;
                      }

                      // Doctor filter
                      if (filter.doctor) {
                        if (p.patient.doctor !== filter.doctor) return false;
                      }

                      // Last visit filter
                      if (filter.lastVisit && p.lastPurchase) {
                        const lastPurchaseDate = new Date(p.lastPurchase);

                        // Custom range
                        if (
                          filter.lastVisit === "Custom" &&
                          filter.dateRange?.from &&
                          filter.dateRange?.to
                        ) {
                          const from = new Date(filter.dateRange.from);
                          const to = new Date(filter.dateRange.to);

                          if (lastPurchaseDate < from || lastPurchaseDate > to) return false;
                        }

                        // Last N days
                        if (typeof filter.lastVisit === "number") {
                          const cutoff = new Date();
                          cutoff.setDate(cutoff.getDate() - filter.lastVisit);

                          if (lastPurchaseDate < cutoff) return false;
                        }
                      }

                      return true; // ✅ must return true if all filters pass
                    })
                    .map((p, idx) => {
                      const hasHistory = p.visits > 0;
                      const isRepeat = p.visits > 1;

                      return (
                        <TableRow
                          key={p.patient._id}
                          className={`cursor-pointer transition-all duration-150 ease-out ${idx % 2 === 0
                            ? "bg-white hover:bg-white/60"
                            : "bg-slate-100 hover:bg-slate-100/60"
                            } hover:-translate-y-px hover:shadow-sm`}
                          onClick={() =>
                            router.push(
                              `/dashboard/pharmacy/customers/${p.patient._id}`
                            )
                          }
                        >
                          <TableCell className="py-3 align-middle text-slate-500 pl-4">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="py-3 align-middle font-medium">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[15px] text-slate-900">
                                <HighlightText
                                  text={p.patient.name}
                                  highlight={filter.query || ""}
                                />
                              </span>
                              <span className="text-[12px] text-slate-500 truncate max-w-[260px]">
                                <HighlightText
                                  text={p.patient.address}
                                  highlight={filter.query || ""}
                                />
                              </span>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {!hasHistory && (
                                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-medium">
                                    New
                                  </Badge>
                                )}
                                {isRepeat && (
                                  <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-medium">
                                    Repeat
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 align-middle text-slate-700">
                            <HighlightText
                              text={p.patient.mrn}
                              highlight={filter.query || ""}
                            />
                          </TableCell>
                          <TableCell className="py-3 align-middle text-slate-700">
                            {fAge(p.patient.dateOfBirth)} / {p.patient.gender}
                          </TableCell>
                          <TableCell className="py-3 align-middle text-slate-700">
                            <HighlightText
                              text={p.patient.phoneNumber}
                              highlight={filter.query || ""}
                            />
                          </TableCell>
                          <TableCell className="py-3 align-middle text-right text-slate-900">
                            {p.visits}
                          </TableCell>
                          <TableCell className="py-3 align-middle text-right text-slate-700">
                            {fDate(p.lastPurchase)}
                          </TableCell>
                          <TableCell className="py-3 align-middle text-right font-semibold text-slate-900 pr-4">
                            {formatINR(p.totalSpend)}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  {customers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-slate-500 py-6"
                      >
                        No patients found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </main>
      </div>
    </AppShell>
  );
};


const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!text) return null;
  if (!highlight || !highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200 text-slate-900 rounded-[1px] px-0.5">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

export default Customers;
