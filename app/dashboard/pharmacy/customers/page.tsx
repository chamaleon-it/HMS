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
import { fDate } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import { useRouter } from "next/navigation";

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

const Customers: React.FC = () => {
  const filtered = patientsMock;

  const router = useRouter();

  return (
    <AppShell>
      <div className="bg-slate-50 p-5">
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
              Showing <span className="font-semibold">{filtered.length}</span>{" "}
              of <span className="font-semibold">{patientsMock.length}</span>{" "}
              patients
            </div>
          </div>

          <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200">
            <Table>
              <TableHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
                <TableRow className="text-sm">
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
                {filtered.map((p, idx) => {
                  const hasHistory = p.visits.length > 0;
                  const isHighValue = sumPatient(p) >= 500;
                  const isRepeat = p.visits.length > 1;

                  return (
                    <TableRow
                      key={p.id}
                      className={`cursor-pointer transition-all duration-150 ease-out ${
                        idx % 2
                          ? "bg-slate-50/80 hover:bg-slate-100/90"
                          : "bg-white hover:bg-slate-50"
                      } hover:-translate-y-[1px] hover:shadow-sm`}
                      onClick={() =>
                        router.push(`/dashboard/pharmacy/customers/${p.id}`)
                      }
                    >
                      <TableCell className="py-3 align-middle text-slate-500">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="py-3 align-middle font-medium">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[15px] text-slate-900">
                            {p.name}
                          </span>
                          <span className="text-[12px] text-slate-500 truncate max-w-[260px]">
                            {p.address}
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
                            {isHighValue && (
                              <Badge className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-medium">
                                High value
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 align-middle text-slate-700">
                        {p.id}
                      </TableCell>
                      <TableCell className="py-3 align-middle text-slate-700">
                        {p.age} / {p.gender}
                      </TableCell>
                      <TableCell className="py-3 align-middle text-slate-700">
                        {p.phone}
                      </TableCell>
                      <TableCell className="py-3 align-middle text-right text-slate-900">
                        {p.visits.length}
                      </TableCell>
                      <TableCell className="py-3 align-middle text-right text-slate-700">
                        {lastPurchaseDate(p)}
                      </TableCell>
                      <TableCell className="py-3 align-middle text-right font-semibold text-slate-900">
                        {formatINR(sumPatient(p))}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filtered.length === 0 && (
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

          <section className="text-xs text-slate-400 text-center">
            <div>Render test: {fDate(new Date())}</div>
          </section>
        </main>
      </div>
    </AppShell>
  );
};

export default Customers;
