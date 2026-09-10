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
import { fDate, fAgeString } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Filter, { FilterType } from "@/app/dashboard/pharmacy/customers/Filter";
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
import { RegisterPatient } from "@/app/dashboard/pharmacy/RegisterPatient";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Pencil, Plus, Users, ShoppingBag, CreditCard, Activity } from "lucide-react";

const AdminCustomers: React.FC = () => {
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
    limit: 20,
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
  if (filter.age[0] !== 0 || filter.age[1] !== 100)
    params.set("age", `${filter.age[0]}-${filter.age[1]}`);
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
        dateOfBirth: string;
        mrn: string;
        address: string;
      };
      lastPurchase: string;
    }[];
  }>(`/pharmacy/customers?${params.toString()}`);

  const [openRegister, setOpenRegister] = useState(false);

  const customers = customersData?.data || [];
  const total = customersData?.total || 0;

  return (
    <AppShell>
      <TooltipProvider>
        <div className="p-5 min-h-[calc(100vh-67px)]">
          <main className="flex flex-col gap-6">
            <PharmacyHeader
              title="Customers"
              subtitle="Overview of all pharmacy customers, patient spending, and order history"
            >
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md font-semibold cursor-pointer"
                onClick={() => setOpenRegister(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Register Customer
              </Button>
            </PharmacyHeader>

            {/* Filter Section */}
            <Filter filter={filter} setFilter={setFilter} />

            {/* Table Section */}
            <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 overflow-x-auto">
              <Table className="min-w-[1000px]">
                <TableHeader className="bg-slate-700 hover:bg-slate-700">
                  <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 px-4 pl-4">
                      Sl No
                    </TableHead>
                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">
                      Name
                    </TableHead>
                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">
                      MRN
                    </TableHead>
                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">
                      Age / Gender
                    </TableHead>
                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">
                      Phone Number
                    </TableHead>
                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 text-right">
                      Visits
                    </TableHead>
                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 text-right">
                      Last Purchase
                    </TableHead>
                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 text-right pr-4">
                      Total Spend
                    </TableHead>
                    <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 text-right pr-4">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="text-[15px]">
                  {isLoading ? (
                    <TableSkeleton rows={10} columns={9} />
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-slate-400">
                        No customers found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((c, idx) => (
                      <TableRow
                        key={c.patient._id}
                        className={`transition-colors cursor-pointer ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                        } hover:bg-slate-100/60`}
                        onClick={() =>
                          router.push(`/dashboard/pharmacy/customers/single?id=${c.patient._id}`)
                        }
                      >
                        <TableCell className="py-2.5 pl-4 text-slate-500">
                          {(filter.page - 1) * filter.limit + idx + 1}
                        </TableCell>
                        <TableCell className="py-2.5 font-medium text-slate-900">
                          <div>
                            <p className="font-semibold">{c.patient.name}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[200px]">
                              {c.patient.address || "-"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 font-mono text-slate-700">
                          {c.patient.mrn}
                        </TableCell>
                        <TableCell className="py-2.5 text-slate-700">
                          {fAgeString(c.patient.dateOfBirth)} / {c.patient.gender}
                        </TableCell>
                        <TableCell className="py-2.5 text-slate-700">
                          {c.patient.phoneNumber || "-"}
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-medium text-slate-900">
                          {c.visits}
                        </TableCell>
                        <TableCell className="py-2.5 text-right text-slate-600">
                          {c.lastPurchase ? fDate(c.lastPurchase) : "N/A"}
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-bold text-slate-900 pr-4">
                          {formatINR(c.totalSpend)}
                        </TableCell>
                        <TableCell className="py-2.5 text-right pr-4">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/pharmacy/customers/single?id=${c.patient._id}`
                                    )
                                  }
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Customer</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                                  onClick={() => setEditCustomer(c.patient)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Customer</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex justify-end">
              <PaginationBar
                page={filter.page}
                limit={filter.limit}
                total={total}
                setFilter={setFilter}
              />
            </div>
          </main>
        </div>

        {/* Register Dialog */}
        <Dialog open={openRegister} onOpenChange={setOpenRegister}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register Customer / Patient</DialogTitle>
            </DialogHeader>
            <RegisterPatient
              onClose={() => setOpenRegister(false)}
              mutate={mutate}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editCustomer} onOpenChange={() => setEditCustomer(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            {editCustomer && (
              <RegisterPatient
                patient={editCustomer}
                onClose={() => setEditCustomer(null)}
                mutate={mutate}
              />
            )}
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </AppShell>
  );
};

export default AdminCustomers;
