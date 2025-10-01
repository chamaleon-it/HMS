"use client";

import React, { JSX, useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Bell,
  RefreshCcw,
  Search,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AppShell from "@/components/layout/app-shell";

// -----------------------------
// Types
// -----------------------------
type Priority = "STAT" | "VIP" | "Routine";
type Status = "Filling" | "Clinical Check" | "Ready";

type RxQueueItem = {
  id: string;
  patient: string;
  items: number;
  priority: Priority;
  status: Status | string;
  assignedTo: string | null;
};

type RxItem = {
  sl: number;
  name: string;
  batch: string;
  exp: string;
  qty: number;
  mrp: number;
  sig: string;
  subs?: string[];
};

type RxDetail = {
  billNo: string;
  date: string;
  doctor: { name: string; reg: string };
  patient: {
    name: string;
    age: number;
    gender: string;
    phone: string;
    address: string;
  };
  items: RxItem[];
};

type PackedState = Record<number, boolean>;

type Totals = { sub: number; round: number; grand: number };

// -----------------------------
// Helpers
// -----------------------------
const today: string = new Date().toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const formatINR = (n: number | undefined | null): string =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Number(n ?? 0)
  );

const calcTotals = (items: RxItem[] = []): Totals => {
  let sub = 0;
  for (const it of items) sub += (Number(it.qty) || 0) * (Number(it.mrp) || 0);
  const grand = Math.round(sub);
  const round = +(grand - sub).toFixed(2);
  return { sub, round, grand };
};

// -----------------------------
// Data (mock)
// -----------------------------
const currentPharmacist = "sahla";

const rxQueue: RxQueueItem[] = [
  {
    id: "RX-2401",
    patient: "Ameen K",
    items: 3,
    priority: "STAT",
    status: "Filling",
    assignedTo: "Suhail",
  },
  {
    id: "RX-2402",
    patient: "Nadisha M",
    items: 2,
    priority: "Routine",
    status: "Clinical Check",
    assignedTo: null,
  },
  {
    id: "RX-2403",
    patient: "S. Kumar",
    items: 1,
    priority: "VIP",
    status: "Ready",
    assignedTo: "Afsal",
  },
  {
    id: "RX-2404",
    patient: "Rahul R",
    items: 2,
    priority: "STAT",
    status: "Filling",
    assignedTo: "Sahla",
  },
];

const rxDetails: Record<string, RxDetail> = {
  "RX-2401": {
    billNo: "B-10245",
    date: today,
    doctor: { name: "Dr. Nadirsha", reg: "KMC/IM/20345" },
    patient: {
      name: "Ameen K",
      age: 34,
      gender: "M",
      phone: "+91 98xxxxxx21",
      address: "Nilambur, Kerala",
    },
    items: [
      {
        sl: 1,
        name: "Paracetamol 500 mg Tab",
        batch: "PARA23A",
        exp: "01/2027",
        qty: 1,
        mrp: 35.0,
        sig: "1 tab SOS for fever",
        subs: ["Dolo 650", "Crocin 500"],
      },
      {
        sl: 2,
        name: "Cetirizine 10 mg Tab",
        batch: "CET24B",
        exp: "04/2027",
        qty: 1,
        mrp: 28.0,
        sig: "1 tab HS",
        subs: ["Levocetirizine 5 mg", "Allegra 120 mg"],
      },
      {
        sl: 3,
        name: "ORS 21g Sachet",
        batch: "ORS25C",
        exp: "11/2026",
        qty: 2,
        mrp: 18.0,
        sig: "Dissolve in 200ml water",
        subs: ["Electral ORS", "Dripdrop ORS"],
      },
    ],
  },
  "RX-2402": {
    billNo: "B-10246",
    date: today,
    doctor: { name: "Dr. Nadirsha", reg: "KMC/ENT/88761" },
    patient: {
      name: "Nadisha M",
      age: 28,
      gender: "F",
      phone: "+91 97xxxxxx12",
      address: "Kochi, Kerala",
    },
    items: [
      {
        sl: 1,
        name: "Amoxicillin 500 mg Cap",
        batch: "AMX25A",
        exp: "11/2025",
        qty: 1,
        mrp: 95.0,
        sig: "1 cap TID x 5 days",
        subs: ["Mox 500", "Novamox 500"],
      },
      {
        sl: 2,
        name: "Lactobacillus Caps",
        batch: "LAC25D",
        exp: "02/2027",
        qty: 1,
        mrp: 120.0,
        sig: "1 cap OD x 5 days",
        subs: ["Econorm", "Bifilac"],
      },
    ],
  },
};

// -----------------------------
// Small barcode (visual only)
// -----------------------------
function Barcode({ value }: { value: string }) {
  const bars = Array.from(value || "").map(
    (ch, i) => ((ch.charCodeAt(0) + i) % 7) + 2
  );
  const totalW = bars.reduce((a, b) => a + b + 1, 0);
  let x = 0;
  return (
    <svg width={totalW} height={48} className="bg-white">
      {bars.map((w, i) => {
        const rect = <rect key={i} x={x} y={0} width={w} height={48} fill="#000" />;
        x += w + 1;
        return rect;
      })}
    </svg>
  );
}

// -----------------------------
// Badges / Topbar
// -----------------------------
function StatusBadge({ status }: { status: Status | string }) {
  const map: Record<string, string> = {
    Filling: "bg-blue-100 text-blue-700",
    "Clinical Check": "bg-amber-100 text-amber-700",
    Ready: "bg-emerald-100 text-emerald-700",
  };
  return (
    <Badge className={`${map[status] || "bg-slate-100 text-slate-700"}`}>
      {status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    STAT: "bg-rose-100 text-rose-700",
    VIP: "bg-purple-100 text-purple-700",
    Routine: "bg-sky-100 text-sky-700",
  };
  return <Badge className={map[priority]}>{priority}</Badge>;
}

function Topbar() {
  return (
    <div className=" bg-white/80 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2">
        <Home className="w-6 h-6" />
        <div className="font-semibold tracking-tight">Pharmacy — Home</div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input className="pl-8" placeholder="Search RX, patients, SKUs…" />
          </div>
          <Button variant="outline" className="gap-2">
            <CalendarIcon className="w-4 h-4" />
            {today}
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// RX Queue + Packing View
// -----------------------------
function RxQueue() {
  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<RxQueueItem | null>(null);
  const [packed, setPacked] = useState<PackedState>({});

  useEffect(() => {
    if (!selected) return;
    const d = rxDetails[selected.id];
    if (!d) return;
    const init: PackedState = {};
    d.items.forEach((it) => (init[it.sl] = false));
    setPacked(init);
  }, [selected]);

  const handleView = (rx: RxQueueItem) => {
    setSelected(rx);
    setOpen(true);
  };

  const markAllPacked = () => {
    if (!selected) return;
    const d = rxDetails[selected.id];
    if (!d) return;
    const next: PackedState = {};
    d.items.forEach((it) => (next[it.sl] = true));
    setPacked(next);
  };

  const headerBg = "bg-slate-700"; // toned-down header color

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold">RX Queue</h2>
          <p className="text-slate-600 text-sm">Live prescriptions</p>
        </div>
        <Tabs defaultValue="all" className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="stat">STAT</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Table>
        <TableHeader className={headerBg}>
          <TableRow>
            <TableHead className="text-white font-semibold">Sl No</TableHead>
            <TableHead className="text-white font-semibold">RX ID</TableHead>
            <TableHead className="text-white font-semibold">Patient</TableHead>
            <TableHead className="text-white font-semibold">Items</TableHead>
            <TableHead className="text-white font-semibold">Priority</TableHead>
            <TableHead className="text-white font-semibold">Status</TableHead>
            <TableHead className="text-left text-white font-semibold">
              Assigned To
            </TableHead>
            <TableHead className="text-right text-white font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rxQueue.map((r, idx) => (
            <TableRow
              key={r.id}
              className={
                idx % 2 === 0
                  ? "bg-white hover:bg-slate-50/60"
                  : "bg-slate-50 hover:bg-slate-100"
              }
            >
              <TableCell>{idx + 1}</TableCell>
              <TableCell className="font-medium">{r.id}</TableCell>
              <TableCell>{r.patient}</TableCell>
              <TableCell>{r.items}</TableCell>
              <TableCell>
                <PriorityBadge priority={r.priority} />
              </TableCell>
              <TableCell>
                <StatusBadge status={r.status} />
              </TableCell>
              <TableCell className="text-left">
                {r.assignedTo ? (
                  <Badge
                    className={
                      r.assignedTo.toLowerCase() !==
                      currentPharmacist.toLowerCase()
                        ? "bg-orange-100 text-orange-700"
                        : "bg-emerald-100 text-emerald-700"
                    }
                  >
                    {r.assignedTo.toLowerCase() ===
                    currentPharmacist.toLowerCase()
                      ? "You"
                      : r.assignedTo}
                  </Badge>
                ) : (
                  <span className="text-slate-500">Unassigned</span>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleView(r)}>
                  View
                </Button>
                <Button size="sm" variant="outline">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Packing View */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-7xl min-w-5xl w-full">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Packing View — {selected?.id}
            </DialogTitle>
          </DialogHeader>

          {selected && rxDetails[selected.id] ? (
            (() => {
              const d = rxDetails[selected.id];
              const { sub, round, grand } = calcTotals(d.items);
              const allPacked = Object.values(packed).every(Boolean);

              return (
                <div className="space-y-4 max-h-[75vh] overflow-auto pr-1 pb-16">
                  {/* Patient & RX header */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                    <div className="border rounded-lg p-3 md:col-span-2">
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Patient
                      </div>
                      <div className="font-semibold text-lg">{d.patient.name}</div>
                      <div className="text-sm text-slate-700">
                        Age/Gender: {d.patient.age} / {d.patient.gender} • Ph:{" "}
                        {d.patient.phone}
                      </div>
                      <div className="text-sm text-slate-700">
                        Address: {d.patient.address}
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        Doctor: {d.doctor.name} • Reg: {d.doctor.reg}
                      </div>
                    </div>
                    <div className="border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-600">
                          Bill No: <span className="font-medium">{d.billNo}</span>
                        </div>
                        <div className="text-xs text-slate-600">
                          Date: <span className="font-medium">{d.date}</span>
                        </div>
                        <div className="text-xs text-slate-600">
                          RX ID: <span className="font-medium">{selected.id}</span>
                        </div>
                      </div>
                      <div className="ml-3 bg-white p-1 rounded border">
                        <Barcode value={selected.id} />
                      </div>
                    </div>
                  </div>

                  {/* Items table */}
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-[15px]">
                      <thead className="bg-slate-50 text-slate-700">
                        <tr>
                          <th className="p-2 text-left">Sl</th>
                          <th className="p-2 text-left">Medicine</th>
                          <th className="p-2 text-left">Batch</th>
                          <th className="p-2 text-left">Exp</th>
                          <th className="p-2 text-right">Qty</th>
                          <th className="p-2 text-left">Instructions</th>
                          <th className="p-2 text-left">Substitution</th>
                          <th className="p-2 text-right">MRP</th>
                          <th className="p-2 text-right">Amount</th>
                          <th className="p-2 text-center">Packed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.items.map((it) => {
                          const amount =
                            (Number(it.qty) || 0) * (Number(it.mrp) || 0);
                          return (
                            <tr key={it.sl} className="border-t align-top">
                              <td className="p-2">{it.sl}</td>
                              <td className="p-2 font-medium">{it.name}</td>
                              <td className="p-2">{it.batch}</td>
                              <td className="p-2">{it.exp}</td>
                              <td className="p-2 text-right text-lg font-semibold">
                                {it.qty}
                              </td>
                              <td className="p-2 text-slate-700">{it.sig}</td>
                              <td className="p-2 text-slate-700">
                                {it.subs?.join(", ") || "-"}
                              </td>
                              <td className="p-2 text-right">{formatINR(it.mrp)}</td>
                              <td className="p-2 text-right font-medium">
                                {formatINR(amount)}
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="checkbox"
                                  className="h-5 w-5"
                                  checked={!!packed[it.sl]}
                                  onChange={(e) =>
                                    setPacked((prev) => ({
                                      ...prev,
                                      [it.sl]: e.target.checked,
                                    }))
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t">
                          <td colSpan={8}></td>
                          <td className="p-2 text-right text-sm">Subtotal</td>
                          <td className="p-2 text-right text-sm">
                            {formatINR(sub)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={8}></td>
                          <td className="p-2 text-right text-sm">Round Off</td>
                          <td className="p-2 text-right text-sm">
                            {round >= 0 ? "+" : ""}
                            {round.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={8}></td>
                          <td className="p-2 text-right font-semibold">
                            Grand Total
                          </td>
                          <td className="p-2 text-right font-semibold">
                            {formatINR(grand)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Footer actions */}
                  <div className="sticky bottom-0 left-0 right-0 bg-white border-t pt-3 pb-2 mt-4 flex items-center justify-between">
                    <div className="text-sm">
                      Packed:{" "}
                      <span
                        className={`font-medium ${
                          allPacked ? "text-emerald-700" : "text-slate-700"
                        }`}
                      >
                        {allPacked ? "All items confirmed" : "In progress"}
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
                        onClick={() => (typeof window !== "undefined" ? window.print?.() : undefined)}
                      >
                        Print
                      </Button>
                      <Button>Share</Button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="p-4 text-sm text-slate-600">
              No details available for this RX.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PharmacyPage(): JSX.Element {
  return (
    <AppShell>

    <div className="min-h-[calc(100vh-80px)]">
      <Topbar />
      <main className="px-5 space-y-6">
        <RxQueue />
      </main>
    </div>
    </AppShell>
  );
}
