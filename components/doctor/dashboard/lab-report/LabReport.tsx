"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  FlaskConical,
  Bell,
  Filter,
  Search,
  CheckCircle2,
  Loader2,
  XCircle,
  ExternalLink,
  Printer,
  Share2,
  Building2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/app-shell";

// =============================
// Helpers (pure + testable)
// =============================
export type LabRow = {
  id: string;
  patient: string;
  test: "MRI" | "CT Scan" | "CBC" | "Lipid Profile"
  lab: string;
  referredBy: string;
  date: string; // YYYY-MM-DD
  status: "pending" | "processing" | "completed" | "abnormal";
};

export function filterResults(
  rows: readonly LabRow[],
  q: string,
  type: LabRow["test"] | "all",
  status: LabRow["status"] | "all"
) {
  const query = q.trim().toLowerCase();
  return rows.filter((r) => {
    const matchesQ = query
      ? [r.patient, r.id, r.test, r.lab, r.referredBy]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;
    const matchesType = type === "all" ? true : r.test === type;
    const matchesStatus = status === "all" ? true : r.status === status;
    return matchesQ && matchesType && matchesStatus;
  });
}

// =============================
// Page Component — aligned with booking dashboard styling
// =============================
export default function LabResultsPage() {
  // ----- State -----
  const [q, setQ] = useState("");
  const [type, setType] = useState<LabRow["test"] | "all">("all");
  const [status, setStatus] = useState<LabRow["status"] | "all">("all");
  const [openFilters, setOpenFilters] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [openBook, setOpenBook] = useState(false);
  const [selected, setSelected] = useState<LabRow | null>(null);

  // ----- Data (mock) -----
  const RAW = useMemo<readonly LabRow[]>(
    () => [
      { id: "LR-001", patient: "John Mathew", test: "MRI", lab: "Apollo Diagnostics", referredBy: "Dr. Nadir Sha", date: "2025-09-01", status: "completed" },
      { id: "LR-002", patient: "Aisha Kareem", test: "CT Scan", lab: "HealthMap Labs", referredBy: "Dr. Nadir Sha", date: "2025-09-02", status: "pending" },
      { id: "LR-003", patient: "Mohammed Iqbal", test: "CBC", lab: "Metropolis", referredBy: "Dr. Nadir Sha", date: "2025-09-03", status: "completed" },
      { id: "LR-004", patient: "Sara Ali", test: "MRI", lab: "Aster Labs", referredBy: "Dr. Nadir Sha", date: "2025-09-03", status: "abnormal" },
      { id: "LR-005", patient: "Ravi Kumar", test: "Lipid Profile", lab: "Apollo Diagnostics", referredBy: "Dr. Nadir Sha", date: "2025-09-04", status: "processing" },
    ],
    []
  );

  const TYPE_COLORS = {
    "MRI": "bg-indigo-100 text-indigo-800",
    "CT Scan": "bg-blue-100 text-blue-800",
    "CBC": "bg-emerald-100 text-emerald-800",
    "Lipid Profile": "bg-amber-100 text-amber-800",
  } ;

  const STATUS: Record<LabRow["status"], { label: string; badge: string; icon: LucideIcon }> = {
    pending: { label: "Pending", badge: "bg-amber-100 text-amber-800", icon: Loader2 },
    processing: { label: "In Progress", badge: "bg-blue-100 text-blue-800", icon: Loader2 },
    completed: { label: "Completed", badge: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
    abnormal: { label: "Abnormal", badge: "bg-red-100 text-red-800", icon: XCircle },
  } as const;

  // ----- Filtering -----
  const data = useMemo(() => filterResults(RAW, q, type, status), [RAW, q, type, status]);

  const stats = useMemo(() => {
    const referred = RAW.length;
    const completed = RAW.filter((r) => r.status === "completed").length;
    const pending = RAW.filter((r) => r.status === "pending" || r.status === "processing").length;
    const abnormal = RAW.filter((r) => r.status === "abnormal").length;
    return { referred, completed, pending, abnormal } as const;
  }, [RAW]);

  // ----- Handlers -----
  const openViewDialog = (row: LabRow) => {
    setSelected(row);
    setOpenView(true);
  };
  const openShareDialog = (row: LabRow) => {
    setSelected(row);
    setOpenShare(true);
  };
  const handlePrint = (_row: LabRow | null) => {
    if (typeof window !== "undefined" && "print" in window) window.print();
  };

  return (
    <AppShell>
    <div className="flex flex-col h-screen bg-gray-50">
      

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
        {[
          { label: "Referred", value: stats.referred },
          { label: "Pending / In Progress", value: stats.pending },
          { label: "Completed", value: stats.completed },
          { label: "Abnormal", value: stats.abnormal },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.05 }}>
            <Card className="p-4">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="px-6 -mt-2">
        <Card className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-gray-600">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as LabRow["test"] | "all")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {Object.keys(TYPE_COLORS).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-gray-600">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as LabRow["status"] | "all")}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {Object.keys(STATUS).map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {STATUS[s as keyof typeof STATUS].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="h-5 w-px bg-gray-200 hidden sm:block" />
          <div className="flex gap-2 items-center">
            <Search className="w-4 h-4 text-gray-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-56" />
          </div>
          <div className="ml-auto text-sm text-gray-500">
            Showing {data.length} of {RAW.length}
          </div>
        </Card>
      </div>

      {/* Results table */}
      <div className="p-6 pt-4 overflow-auto">
        <div className="border rounded-xl overflow-hidden bg-white">
          <div className="grid grid-cols-12 bg-gray-50 text-xs font-medium text-gray-600 px-3 py-2 sticky top-0">
            <div className="col-span-2">Patient</div>
            <div className="col-span-2">Test</div>
            <div className="col-span-2">Lab</div>
            <div className="col-span-2">Result ID</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2 text-right">Status / Actions</div>
          </div>

          {data.map((r, i) => {
            const S = STATUS[r.status];
            const Icon = S.icon;
            return (
              <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: i * 0.02 }} className="grid grid-cols-12 items-center px-3 py-3 border-t hover:bg-gray-50">
                <div className="col-span-2">
                  <div className="font-medium">{r.patient}</div>
                  <div className="text-[11px] text-gray-500">Referred by {r.referredBy}</div>
                </div>
                <div className="col-span-2">
                  <span className={`text-[11px] px-2 py-1 rounded ${TYPE_COLORS[r.test] ?? "bg-gray-100 text-gray-700"}`}>{r.test}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2 text-gray-700">
                  <Building2 className="w-3.5 h-3.5 text-gray-500" /> {r.lab}
                </div>
                <div className="col-span-2 text-gray-700">{r.id}</div>
                <div className="col-span-2 text-gray-700">{r.date}</div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded ${S.badge}`}>
                    <Icon className="w-3.5 h-3.5" /> {S.label}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => setOpenBook(true)}>
                    Book
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openViewDialog(r)}>
                    <ExternalLink className="w-4 h-4 mr-1" />View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handlePrint(r)}>
                    <Printer className="w-4 h-4 mr-1" />Print
                  </Button>
                  <Button size="sm" onClick={() => openShareDialog(r)}>
                    <Share2 className="w-4 h-4 mr-1" />Share
                  </Button>
                </div>
              </motion.div>
            );
          })}

          {data.length === 0 && (
            <div className="text-sm text-gray-500 p-6 text-center">No lab results match your filters.</div>
          )}
        </div>
      </div>

      {/* Filters dialog (mobile) */}
      <Dialog open={openFilters} onOpenChange={setOpenFilters}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as LabRow["test"] | "all")}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Object.keys(TYPE_COLORS).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as LabRow["status"] | "all")}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Object.keys(STATUS).map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {STATUS[s as keyof typeof STATUS].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Search</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Patient / ID / Test / Lab" className="col-span-3" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setType("all"); setStatus("all"); setQ(""); }}>
              Reset
            </Button>
            <Button onClick={() => setOpenFilters(false)}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Book Lab Test dialog */}
      <Dialog open={openBook} onOpenChange={setOpenBook}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Book Lab Test</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Patient</Label>
              <Input className="col-span-3" placeholder="Search or enter patient name" />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Test</Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select test" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(TYPE_COLORS).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Lab</Label>
              <Input className="col-span-3" placeholder="Lab name (e.g., Apollo Diagnostics)" />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Date</Label>
              <Input type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Time</Label>
              <Input type="time" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-2">
              <Label className="col-span-1 pt-2">Notes</Label>
              <Textarea className="col-span-3" placeholder="Preparation, fasting, special instructions" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenBook(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpenBook(false)}>Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View result dialog */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Result: {selected?.id}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 text-sm">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="secondary">{selected?.patient}</Badge>
              {selected && (
                <Badge className={TYPE_COLORS[selected.test] ?? "bg-gray-100 text-gray-700"}>{selected.test}</Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> {selected?.lab}
              </Badge>
            </div>
            <div className="rounded-lg border p-3 text-gray-600">
              {/* Placeholder for PDF/image viewer */}
              Preview of report or key metrics goes here…
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handlePrint(selected)}>
              <Printer className="w-4 h-4 mr-1" />Print
            </Button>
            <Button onClick={() => { setOpenView(false); setOpenShare(true); }}>
              <Share2 className="w-4 h-4 mr-1" />Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share dialog */}
      <Dialog open={openShare} onOpenChange={setOpenShare}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Result {selected?.id}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">To</Label>
              <Input className="col-span-3" placeholder="Patient email or WhatsApp number" />
            </div>
            <div className="grid grid-cols-4 items-start gap-2">
              <Label className="col-span-1 pt-2">Message</Label>
              <Textarea className="col-span-3" placeholder="Optional message" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenShare(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpenShare(false)}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AppShell>
  );
}

// =============================
// Lightweight dev tests (run in browser; do not affect prod)
// =============================
try {
  const sample: readonly LabRow[] = [
    { id: "A", patient: "Ravi", test: "MRI", lab: "Apollo", referredBy: "Dr X", date: "2025-09-01", status: "completed" },
    { id: "B", patient: "Sara", test: "CBC", lab: "Metropolis", referredBy: "Dr X", date: "2025-09-01", status: "pending" },
  ];
  console.assert(filterResults(sample, "ravi", "all", "all").length === 1, "Search filter should match by patient");
  console.assert(filterResults(sample, "", "MRI", "all").length === 1, "Type filter should match MRI");
  console.assert(filterResults(sample, "", "all", "pending").length === 1, "Status filter should match pending");
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn("Dev tests failed:", e);
}