import { ChevronDownIcon, RefreshCcw, Search, Filter as FilterIcon, Download } from "lucide-react";
import React, { useState } from "react";
import { FilterType } from "./page";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import DateFilter from "../DateFilter";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { fDateandTime } from "@/lib/fDateAndTime";
import { getDecimal } from "@/lib/fNumber";
import { startOfDay, endOfDay, subDays } from "date-fns";

interface PropsType {
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  billing?: any[];
}

export default function Filters({ filter, setFilter, billing }: PropsType) {
  const [isExporting, setIsExporting] = useState(false);

  const handleReset = () => {
    setFilter({ q: null, qEnd: null, status: "all", method: "all", activeDate: "Today", date: new Date(), page: 1, limit: 10, doctor: [] });
  };

  const escapeCsv = (str: string | number | undefined | null) => {
    if (str === null || str === undefined) return '""';
    return `"${String(str).replace(/"/g, '""')}"`;
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);

      let exportData: any[] = [];

      // Fetch all matching data without pagination limits
      const params = new URLSearchParams();
      if (filter.q) params.set("q", filter.q);
      if (filter.qEnd && filter.qEnd.length >= 7) params.set("qEnd", filter.qEnd);
      if (filter.status && filter.status !== "all") params.set("status", filter.status);
      if (filter.method && filter.method !== "all") params.set("method", filter.method);

      let sd: Date = startOfDay(new Date());
      let ed: Date = endOfDay(new Date());

      if (filter.activeDate === "Today") {
        sd = startOfDay(new Date());
      } else if (filter.activeDate === "7 days") {
        sd = startOfDay(subDays(new Date(), 7));
      } else if (filter.activeDate === "30 days") {
        sd = startOfDay(subDays(new Date(), 30));
      } else if (filter.activeDate === "Custom" && filter.date) {
        sd = startOfDay(filter.date);
        ed = endOfDay(filter.date);
      }

      params.set("startDate", sd.toISOString());
      params.set("endDate", ed.toISOString());
      params.set("activeDate", filter.activeDate);
      params.set("userRole", "Reception");
      params.set("page", "1");
      params.set("limit", "100000");

      const res = await api.get(`/billing?${params.toString()}`);
      exportData = res.data?.data ?? [];

      if (filter.doctor && filter.doctor.length > 0) {
        exportData = exportData.filter((b: any) => {
          const docName = typeof b.doctor === "object" ? b.doctor?.name : b.doctor;
          return filter.doctor.includes(docName);
        });
      }

      if (!exportData || exportData.length === 0) {
        toast.error("No billing data available to export for selected filters.");
        return;
      }

      const headers = [
        "Sl No",
        "Invoice No",
        "Date & Time",
        "Patient Name",
        "Patient MRN",
        "Doctor",
        "Items Count",
        "Items Detail",
        "Total (INR)",
        "Round Off (INR)",
        "Discount (INR)",
        "Paid Amount (INR)",
        "Cash (INR)",
        "Card (INR)",
        "UPI (INR)",
        "Due Amount (INR)",
        "Status",
        "Transaction Type"
      ];

      const csvRows = [headers.map((h) => `"${h}"`).join(",")];

      exportData.forEach((b: any, index: number) => {
        const docName = typeof b.doctor === "object" ? b.doctor?.name : (b.doctor === "Self" ? "Self" : b.doctor);
        const itemsCount = b.items?.length || 0;
        const itemsDetail = b.items?.map((i: any) => `${i.name} (${i.quantity || 1}x ${i.unitPrice || i.total})`).join("; ") || "";
        const itemsTotal = b.items?.reduce((sum: number, i: any) => sum + (i.total || 0), 0) || 0;
        const roundOffVal = b.roundOff ? getDecimal(itemsTotal) : 0;
        const discountVal = b.discount || 0;
        const cashVal = b.cash || 0;
        const cardVal = b.card || 0;
        const upiVal = b.upi || 0;
        const paidVal = cashVal + cardVal + upiVal;
        const dueVal = Math.max(0, itemsTotal - roundOffVal - (paidVal + discountVal));

        const status = (() => {
          if (b.transactionType === "Refund" || b.items?.some((i: any) => i.name?.toLowerCase().includes("refund"))) {
            return "Refund";
          }
          if (b.transactionType === "Return") {
            return "Return";
          }
          const totalAmount = itemsTotal - roundOffVal;
          const paidAmount = paidVal + discountVal;
          return totalAmount <= paidAmount ? "Paid" : paidAmount === 0 ? "Unpaid" : "Partial";
        })();

        const row = [
          index + 1,
          escapeCsv(b.mrn),
          escapeCsv(fDateandTime(b.createdAt)),
          escapeCsv(b.patient?.name || ""),
          escapeCsv(b.patient?.mrn || ""),
          escapeCsv(docName || "Self"),
          itemsCount,
          escapeCsv(itemsDetail),
          itemsTotal.toFixed(2),
          roundOffVal.toFixed(2),
          discountVal.toFixed(2),
          paidVal.toFixed(2),
          cashVal.toFixed(2),
          cardVal.toFixed(2),
          upiVal.toFixed(2),
          dueVal.toFixed(2),
          escapeCsv(status),
          escapeCsv(b.transactionType || "Sale")
        ];

        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `billing_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${exportData.length} records to CSV successfully!`);
    } catch (error) {
      console.error("Export CSV error:", error);
      toast.error("Failed to export CSV. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-3 rounded-xl shadow-sm border border-slate-200"
    >
      <div className="flex flex-wrap items-end gap-6">
        {/* Search */}
        <div className="space-y-2 flex-1 min-w-[280px]">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Search Invoice Range
          </label>
          <div className="flex gap-2">
            <div className="relative group flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-(--color-synapse-light) transition-colors" />
              <Input
                value={filter.q ?? ""}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, q: e.target.value, page: 1 }))
                }
                placeholder="From..."
                className="pl-9 h-10 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-synapse-light/20 transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="relative group flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-(--color-synapse-light) transition-colors" />
              <Input
                value={filter.qEnd ?? ""}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, qEnd: e.target.value, page: 1 }))
                }
                placeholder="To..."
                className="pl-9 h-10 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-synapse-light/20 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Method */}
        <div className="space-y-2 min-w-[180px]">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Payment Method
          </label>
          <div className="flex items-center gap-2">
            <Select
              value={filter.method}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, method: value, page: 1 }))
              }
            >
              <SelectTrigger className="h-10! bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-synapse-light/20 transition-all">
                <div className="flex items-center gap-2">
                  <FilterIcon className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Select method" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-lg border-slate-200 shadow-xl">
                <SelectGroup>
                  <SelectLabel className="text-[10px] uppercase tracking-wider text-slate-400">Method</SelectLabel>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Filter */}
        <div className="space-y-2 min-w-[180px]">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Date Filter
          </label>
          <div className="block">
            <DateFilter
              activeDate={filter.activeDate}
              setActiveDate={(activeDate) => setFilter((prev) => ({ ...prev, activeDate, page: 1 }))}
              date={filter.date}
              setDate={(date) => setFilter((prev) => ({ ...prev, date, page: 1 }))}
            />
          </div>
        </div>

        {/* Reset & Export Buttons */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            className="h-10 px-7! border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
            onClick={handleReset}
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>

          <Button
            variant="outline"
            className="h-10 px-5 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-700 font-semibold rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
            onClick={handleExportCsv}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 text-emerald-600" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

