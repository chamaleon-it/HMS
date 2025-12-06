"use client";

import React from "react";
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

const Customers: React.FC = () => {
  const router = useRouter();

  const { data: customersData } = useSWR<{
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
      };
      lastPurchase: Date;
    }[];
  }>("/pharmacy/orders/customers");

  const customers = customersData?.data ?? [];

  return (
    <AppShell>
      <div className="bg-slate-50 p-5 min-h-[calc(100vh-80px)]">
        <main className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                Customers
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Click a row to open full pharmacy history for that patient.
              </p>
            </div>
            <div className="text-sm text-slate-500 bg-white/70 border rounded-full px-4 py-1 shadow-sm">
              Showing <span className="font-semibold">{customers.length}</span>{" "}
              of <span className="font-semibold">{customers.length}</span>{" "}
              patients
            </div>
          </div>

          <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200">
            <Table>
              <TableHeader className="">
                <TableRow className="bg-slate-700 hover:bg-slate-700 text-white">
                  <TableHead className="text-white py-3">Sl</TableHead>
                  <TableHead className="text-white py-3">Customers</TableHead>
                  <TableHead className="text-white py-3">UHID</TableHead>
                  <TableHead className="text-white py-3">
                    Age / Gender
                  </TableHead>
                  <TableHead className="text-white py-3">Phone</TableHead>
                  <TableHead className="text-white py-3 text-right">
                    Visits
                  </TableHead>
                  <TableHead className="text-white py-3 text-right">
                    Last Purchase
                  </TableHead>
                  <TableHead className="text-white py-3 text-right">
                    Total Spend
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
                        } hover:-translate-y-[1px] hover:shadow-sm`}
                      onClick={() =>
                        router.push(
                          `/dashboard/pharmacy/customers/${p.patient._id}`
                        )
                      }
                    >
                      <TableCell className="py-3 align-middle text-slate-500">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="py-3 align-middle font-medium">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[15px] text-slate-900">
                            {p.patient.name}
                          </span>
                          <span className="text-[12px] text-slate-500 truncate max-w-[260px]">
                            {p.patient.address}
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
                        {p.patient.mrn}
                      </TableCell>
                      <TableCell className="py-3 align-middle text-slate-700">
                        {fAge(p.patient.dateOfBirth)} / {p.patient.gender}
                      </TableCell>
                      <TableCell className="py-3 align-middle text-slate-700">
                        {p.patient.phoneNumber}
                      </TableCell>
                      <TableCell className="py-3 align-middle text-right text-slate-900">
                        {p.visits}
                      </TableCell>
                      <TableCell className="py-3 align-middle text-right text-slate-700">
                        {fDate(p.lastPurchase)}
                      </TableCell>
                      <TableCell className="py-3 align-middle text-right font-semibold text-slate-900">
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
        </main>
      </div>
    </AppShell>
  );
};

export default Customers;
