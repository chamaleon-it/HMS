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
import { fAge, fDate, fAgeString } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Filter, { FilterType } from "./Filter";
import NewOrder from "./NewOrder";
import { TableSkeleton } from "@/app/dashboard/pharmacy/components/PharmacySkeleton";
import PharmacyHeader from "@/app/dashboard/pharmacy/components/PharmacyHeader";
import { PaginationBar } from "@/app/dashboard/pharmacy/components/PaginationBar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PatientForm } from "@/components/shared/patient/PatientForm";
import { AppointmentDialog } from "@/components/shared/appointment/AppointmentDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Pencil, Plus, ClipboardPlus, CalendarPlus } from "lucide-react";
import { useDrafts } from "@/app/dashboard/pharmacy/DraftContext";
import { useAuth } from "@/auth/context/auth-context";
const Customers: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { addDraft } = useDrafts();
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const [appointmentPatient, setAppointmentPatient] = useState<any>(null);

  const [filter, setFilter] = useState<FilterType>({
    query: undefined,
    address: undefined,
    gender: undefined,
    doctor: undefined,
    age: [0, 100],
    lastVisit: undefined,
    alreadyPurchase: false,
    page: 1,
    limit: 20,
    dateRange: { from: undefined, to: undefined },
  });

  const params = new URLSearchParams();

  params.set("alreadyPurchase", filter.alreadyPurchase ? "true" : "false");
  params.set("page", String(filter.page));
  params.set("limit", String(filter.limit));
  if (filter.query) params.set("query", filter.query);
  if (filter.address) params.set("address", filter.address);
  if (filter.city) params.set("city", filter.city);
  if (filter.district) params.set("district", filter.district);
  if (filter.state) params.set("state", filter.state);
  if (filter.pincode) params.set("pincode", filter.pincode);
  if (filter.gender) params.set("gender", filter.gender);
  if (filter.doctor) params.set("doctor", filter.doctor);
  if (filter.age[0] !== 0 || filter.age[1] !== 100) {
    params.set("minAge", filter.age[0].toString());
    params.set("maxAge", filter.age[1].toString());
  }

  if (filter.lastVisit && filter.lastVisit !== "Custom") {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - Number(filter.lastVisit));
    params.set("from", from.toISOString());
    params.set("to", to.toISOString());
  } else if (filter.lastVisit === "Custom") {
    if (filter.dateRange.from) params.set("from", filter.dateRange.from);
    if (filter.dateRange.to) params.set("to", filter.dateRange.to);
  }

  const { data: customersData, isLoading, mutate } = useSWR<{
    message: string;
    total: number;
    data: {
      _id: string;
      name: string;
      phoneNumber: string;
      gender: string;
      dateOfBirth: Date;
      address: string;
      mrn: string;
      doctor: string;
    }[];
  }>(`/patients?${params.toString()}`);

  const customers = customersData?.data ?? [];
  const total = customersData?.total ?? 0;





  return (
    <AppShell>
      <TooltipProvider>
        <div className="p-5 min-h-[calc(100vh-67px)]">
          <main className="flex flex-col gap-4">
            <PharmacyHeader
              title="Customers"
              subtitle="View and manage registered customers"
            >
              <Button
                onClick={() => setAppointmentPatient(null)}
                className="flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shadow-md bg-[var(--color-synapse-dark)] hover:bg-slate-800"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Customer
              </Button>
            </PharmacyHeader>

            <Filter filter={filter} setFilter={setFilter} />

            {isLoading ? (
              <TableSkeleton rows={10} columns={8} />
            ) : (
              <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 overflow-x-auto">
                <Table className="min-w-[1000px]">
                  <TableHeader className="bg-[var(--color-synapse-dark)] hover:bg-[var(--color-synapse-dark)]">
                    <TableRow className="bg-[var(--color-synapse-dark)] hover:bg-[var(--color-synapse-dark)] border-b-0">
                      <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 px-4 pl-4">Sl No</TableHead>
                      <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Customers</TableHead>
                      <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">PID</TableHead>
                      <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">
                        Age / Gender
                      </TableHead>
                      <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Phone</TableHead>
                      <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 text-right pr-4">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-[15px]">
                    {customers.map((p: any, idx: number) => {
                      return (
                        <TableRow
                          key={p._id}
                          className={`cursor-pointer transition-all duration-150 ease-out ${idx % 2 === 0
                            ? "bg-white hover:bg-white/60"
                            : "bg-slate-100 hover:bg-slate-100/60"
                            } hover:-translate-y-px hover:shadow-sm`}

                        >
                          <TableCell className="py-1.5 align-middle text-slate-500 pl-4">
                            {(filter.page - 1) * filter.limit + idx + 1}
                          </TableCell>
                          <TableCell className="py-1.5 align-middle font-medium cursor-pointer" onClick={() =>
                            router.push(
                              `/dashboard/reception/customers/single?id=${p._id}`
                            )
                          }>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[15px] text-slate-900">
                                  <HighlightText
                                    text={p.name}
                                    highlight={filter.query || ""}
                                  />
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {p.mrn && (
                                  <span className="text-[11px] text-[var(--color-synapse-light)] font-medium">{p.mrn}</span>
                                )}
                                <span className="text-[12px] text-slate-500 truncate max-w-[220px]">
                                  <HighlightText
                                    text={p.address || ""}
                                    highlight={filter.query || ""}
                                  />
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 align-middle text-slate-700">
                            <HighlightText
                              text={p.mrn}
                              highlight={filter.query || ""}
                            />
                          </TableCell>
                          <TableCell className="py-1.5 align-middle text-slate-700">
                            {fAgeString(p.dateOfBirth)}/ {p.gender}
                          </TableCell>
                          <TableCell className="py-1.5 align-middle text-slate-700">
                            <HighlightText
                              text={!p.phoneNumber || p.phoneNumber.length < 5 ? "-" : p.phoneNumber}
                              highlight={filter.query || ""}
                            />
                          </TableCell>
                          <TableCell className="py-1.5 align-middle text-right font-semibold text-slate-900 pr-4">
                            <div className="flex justify-end items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-[var(--color-synapse-light)] hover:text-[var(--color-synapse-light)] hover:bg-blue-50"
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      router.push(
                                        `/dashboard/reception/customers/single?id=${p._id}`
                                      )
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Details</p>
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
                                      setEditCustomer(p);
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
                                      setAppointmentPatient(p);
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
                  <div className="px-2 py-0 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
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

        <Dialog open={Boolean(editCustomer)} onOpenChange={(v) => !v && setEditCustomer(null)}>
          <DialogContent className="max-w-3xl!">
            <DialogHeader>
              <DialogTitle>Customer Edit</DialogTitle>
            </DialogHeader>
            <PatientForm
              onClose={() => setEditCustomer(null)}
              mutate={mutate}
              patient={editCustomer}
            />
          </DialogContent>
        </Dialog>

        {appointmentPatient && (
          <AppointmentDialog
            open={!!appointmentPatient}
            onOpenChange={(open) => !open && setAppointmentPatient(null)}
            appointment={{ patient: appointmentPatient }}
            mutate={mutate}
          />
        )}
      </TooltipProvider>
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
