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
import { PaginationBar } from "../components/PaginationBar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RegisterPatient } from "../RegisterPatient";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Pencil, Plus, ClipboardPlus, CalendarPlus } from "lucide-react";
const Customers: React.FC = () => {
  const router = useRouter();
  const [editCustomer, setEditCustomer] = useState<any>(null);

  const [filter, setFilter] = useState<FilterType>({
    query: undefined,
    gender: undefined,
    doctor: undefined,
    age: [0, 100],
    lastVisit: undefined,
    alreadyPurchase: false,
    page: 1,
    limit: 10,
    dateRange: { from: undefined, to: undefined },
  });

  const params = new URLSearchParams();

  params.set("alreadyPurchase", filter.alreadyPurchase ? "true" : "false");
  params.set("page", String(filter.page));
  params.set("limit", String(filter.limit));
  if (filter.query) params.set("q", filter.query);
  if (filter.gender) params.set("gender", filter.gender);
  if (filter.doctor) params.set("doctor", filter.doctor);
  if (filter.dateRange.from) params.set("from", filter.dateRange.from);
  if (filter.dateRange.to) params.set("to", filter.dateRange.to);
  if (filter.age[0] !== 0 || filter.age[1] !== 100) params.set("age", `${filter.age[0]}-${filter.age[1]}`);
  if (filter.lastVisit) params.set("lastVisit", String(filter.lastVisit));

  const { data: customersData, isLoading, mutate } = useSWR<{
    message: string;
    total: number;
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
        allergies: string;
      };
      lastPurchase: Date;
    }[];
  }>(`/pharmacy/orders/customers?${params.toString()}`);

  const customers = customersData?.data ?? [];
  const total = customersData?.total ?? 0;





  return (
    <AppShell>
      <TooltipProvider>
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
              <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 overflow-x-auto">
                <Table className="min-w-[1000px]">
                  <TableHeader className="bg-slate-700 hover:bg-slate-700">
                    <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                      <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 px-4 pl-4">Sl No</TableHead>
                      <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Customers</TableHead>
                      <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">PID</TableHead>
                      <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">
                        Age / Gender
                      </TableHead>
                      <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Phone</TableHead>
                      <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 text-right">
                        Visits
                      </TableHead>
                      <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 text-right">
                        Last Purchase
                      </TableHead>
                      <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 text-right pr-4">
                        Total Spend
                      </TableHead>
                      <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 text-right pr-4">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-[15px]">
                    {customers.map((p, idx) => {
                      const hasHistory = p.visits > 0;
                      const isRepeat = p.visits > 1;

                      return (
                        <TableRow
                          key={p.patient._id}
                          className={`cursor-pointer transition-all duration-150 ease-out ${idx % 2 === 0
                            ? "bg-white hover:bg-white/60"
                            : "bg-slate-100 hover:bg-slate-100/60"
                            } hover:-translate-y-px hover:shadow-sm`}

                        >
                          <TableCell className="py-3 align-middle text-slate-500 pl-4">
                            {(filter.page - 1) * filter.limit + idx + 1}
                          </TableCell>
                          <TableCell className="py-3 align-middle font-medium cursor-pointer" onClick={() =>
                            router.push(
                              `/dashboard/pharmacy/customers/single?id=${p.patient._id}`
                            )
                          }>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[15px] text-slate-900">
                                  <HighlightText
                                    text={p.patient.name}
                                    highlight={filter.query || ""}
                                  />
                                </span>
                                <div className="flex flex-wrap gap-1">
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
                              <span className="text-[12px] text-slate-500 truncate max-w-[260px]">
                                <HighlightText
                                  text={p.patient.address}
                                  highlight={filter.query || ""}
                                />
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 align-middle text-slate-700">
                            <HighlightText
                              text={p.patient.mrn}
                              highlight={filter.query || ""}
                            />
                          </TableCell>
                          <TableCell className="py-3 align-middle text-slate-700">
                            {fAge(p.patient.dateOfBirth).years}y / {fAge(p.patient.dateOfBirth).months}m / {p.patient.gender}
                          </TableCell>
                          <TableCell className="py-3 align-middle text-slate-700">
                            <HighlightText
                              text={p.patient.phoneNumber.length < 5 ? "-" : p.patient.phoneNumber}
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
                          <TableCell className="py-3 align-middle text-right font-semibold text-slate-900 pr-4">
                            <div className="flex justify-end items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      router.push(
                                        `/dashboard/pharmacy/customers/single?id=${p.patient._id}`
                                      )
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View History</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      setEditCustomer(p.patient);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit Customer</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      router.push(
                                        `/dashboard/pharmacy?id=${p.patient._id}&mrn=${p.patient.mrn}&name=${p.patient.name}&allergies=${p.patient.allergies || ""}#newOrder`
                                      )
                                    }}
                                  >
                                    <ClipboardPlus className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>New Order</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      router.push(
                                        `/dashboard/pharmacy/appointments?id=${p.patient._id}&mrn=${p.patient.mrn}&name=${p.patient.name}#newAppointment`
                                      )
                                    }}
                                  >
                                    <CalendarPlus className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>New Appointment</p>
                                </TooltipContent>
                              </Tooltip>


                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {customers.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center text-slate-500 py-6"
                        >
                          No patients found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {total > filter.limit && (
                  <div className="px-4 py-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
                    <PaginationBar
                      page={filter.page}
                      limit={filter.limit}
                      total={total}
                      setFilter={setFilter}
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </TooltipProvider>

      <Dialog open={Boolean(editCustomer)} onOpenChange={(v) => !v && setEditCustomer(null)}>
        <DialogContent className="max-w-3xl!">
          <DialogHeader>
            <DialogTitle>Customer Edit</DialogTitle>
          </DialogHeader>
          <RegisterPatient
            onClose={() => setEditCustomer(null)}
            mutate={mutate}
            patient={editCustomer}
          />
        </DialogContent>
      </Dialog>
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
