"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import AppShell from "@/components/layout/app-shell";
import PharmacyHeader from "../components/PharmacyHeader";
import { TableSkeleton } from "../components/PharmacySkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";
import { Info, PackageMinus, Search } from "lucide-react";

interface Consumable {
  _id: string;
  name: string;
  generic?: string;
  category?: string;
  quantity?: number;
  unitPrice?: number;
  purchasePrice?: number;
  mrp?: number;
  status?: string;
}

interface ConsumableIssue {
  _id: string;
  quantity: number;
  department?: string | null;
  note?: string | null;
  unitPurchasePrice?: number;
  totalCost?: number;
  createdAt: string;
  item?: { name?: string } | null;
  issuedBy?: { name?: string; role?: string } | null;
}

function ConsumablesPage() {
  const [query, setQuery] = useState("");
  const [issueTarget, setIssueTarget] = useState<Consumable | null>(null);
  const [form, setForm] = useState({ quantity: 1, department: "", note: "" });
  const [submitting, setSubmitting] = useState(false);

  const {
    data: consumablesData,
    isLoading,
    mutate: mutateConsumables,
  } = useSWR<{ message: string; data: Consumable[] }>("/pharmacy/consumables");

  const { data: issuesData, mutate: mutateIssues } = useSWR<{
    message: string;
    data: ConsumableIssue[];
  }>("/pharmacy/consumables/issues?limit=25");

  const consumables = consumablesData?.data ?? [];
  const issues = issuesData?.data ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return consumables;
    return consumables.filter((c) =>
      [c.name, c.generic, c.category].some((v) => v?.toLowerCase().includes(q))
    );
  }, [consumables, query]);

  const openIssue = (item: Consumable) => {
    setIssueTarget(item);
    setForm({ quantity: 1, department: "", note: "" });
  };

  const submitIssue = async () => {
    if (!issueTarget) return;
    if (form.quantity < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }
    try {
      setSubmitting(true);
      await toast.promise(
        api.post("/pharmacy/consumables/issue", {
          itemId: issueTarget._id,
          quantity: form.quantity,
          department: form.department.trim() || undefined,
          note: form.note.trim() || undefined,
        }),
        {
          loading: "Issuing consumable...",
          success: ({ data }) => data.message,
          error: ({ response }) =>
            response?.data?.message ?? "Failed to issue consumable",
        }
      );
      setIssueTarget(null);
      await Promise.all([mutateConsumables(), mutateIssues()]);
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PharmacyHeader
        title="Consumables"
        subtitle="Internal issue of consumables to departments"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-10 w-64 rounded-xl border-slate-200 pl-9 text-sm"
            placeholder="Search consumables"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </PharmacyHeader>

      <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Issuing a consumable is <span className="font-semibold">not a sale</span>.
          No bill or patient charge is created — stock is deducted and the cost is
          recorded as an internal expense in Profit &amp; Loss.
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white/90 shadow-md shadow-slate-200">
          <div className="overflow-x-auto">
            <Table className="whitespace-nowrap">
              <TableHeader className="bg-slate-700 hover:bg-slate-700">
                <TableRow className="border-b-0 bg-slate-700 hover:bg-slate-800">
                  <TableHead className="py-2.5 text-[11px] font-bold uppercase tracking-wider text-white">
                    Item
                  </TableHead>
                  <TableHead className="py-2.5 text-[11px] font-bold uppercase tracking-wider text-white">
                    Category
                  </TableHead>
                  <TableHead className="py-2.5 text-[11px] font-bold uppercase tracking-wider text-white">
                    In Stock
                  </TableHead>
                  <TableHead className="py-2.5 text-[11px] font-bold uppercase tracking-wider text-white">
                    Purchase Rate
                  </TableHead>
                  <TableHead className="py-2.5 text-[11px] font-bold uppercase tracking-wider text-white">
                    Status
                  </TableHead>
                  <TableHead className="py-2.5 pr-4 text-right text-[11px] font-bold uppercase tracking-wider text-white">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, i) => (
                  <TableRow
                    key={item._id}
                    className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                  >
                    <TableCell className="font-medium text-slate-900">
                      {item.name}
                      {item.generic && (
                        <div className="text-xs text-slate-500">
                          (Gen: {item.generic})
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {item.category || "-"}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {(item.quantity ?? 0) <= 0 ? (
                        <span className="font-medium text-rose-600">
                          Out of stock
                        </span>
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatINR(item.purchasePrice ?? 0)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {item.status ?? "-"}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 text-xs"
                        disabled={(item.quantity ?? 0) <= 0}
                        onClick={() => openIssue(item)}
                      >
                        <PackageMinus className="h-3.5 w-3.5" />
                        Issue
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No consumables found. Items must be saved with the
                      &quot;Consumables&quot; category in inventory.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {issues.length > 0 && (
        <div className="overflow-hidden rounded-2xl border bg-white/90 shadow-sm">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Recent issues</p>
            <p className="text-xs text-slate-500">
              Internal consumption log — no patient billing involved.
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table className="whitespace-nowrap">
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Item
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Qty
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Department
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Cost
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Issued By
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    When
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.map((issue) => (
                  <TableRow key={issue._id}>
                    <TableCell className="font-medium text-slate-800">
                      {issue.item?.name ?? "-"}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {issue.quantity}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {issue.department || "-"}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatINR(issue.totalCost ?? 0)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {issue.issuedBy?.name ?? "-"}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {fDateandTime(issue.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(issueTarget)}
        onOpenChange={(open) => !open && setIssueTarget(null)}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Issue {issueTarget?.name}</DialogTitle>
            <DialogDescription>
              Internal issue only — this does not create a bill or charge the
              patient.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                max={issueTarget?.quantity ?? undefined}
                className="h-10 rounded-xl"
                value={form.quantity}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value),
                  }))
                }
              />
              <p className="text-xs text-slate-500">
                Available: {issueTarget?.quantity ?? 0}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Department
              </Label>
              <Input
                className="h-10 rounded-xl"
                placeholder="e.g. Casualty, OP, Lab"
                value={form.department}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, department: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">Note</Label>
              <Textarea
                className="min-h-[70px] rounded-xl"
                placeholder="Reason for issue"
                value={form.note}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, note: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIssueTarget(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={submitIssue}
              disabled={submitting}
            >
              {submitting ? "Issuing..." : "Confirm Issue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Page() {
  return (
    <AppShell>
      <main className="min-h-[calc(100vh-67px)] p-5">
        <ConsumablesPage />
      </main>
    </AppShell>
  );
}
