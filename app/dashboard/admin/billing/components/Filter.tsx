import { RefreshCcw, Search, Filter as FilterIcon, Download, FileText, Loader2, X } from "lucide-react";
import React, { useState } from "react";
import { FilterType } from "../page";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import DateRangeFilter from "@/components/dashboard/billing/DateRangeFilter";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import useSWR from "swr";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { fDateandTime } from "@/lib/fDateAndTime";
import { getDecimal } from "@/lib/fNumber";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { generateBillingReportPdf } from "@/lib/generateBillingReportPdf";

interface PropsType {
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  billing?: any[];
}

export default function Filters({ filter, setFilter, billing }: PropsType) {
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const { data: doctorsResponse } = useSWR<{ data: { _id: string; name: string }[] }>("/admin/doctors");
  const doctors = doctorsResponse?.data ?? [];

  const handleReset = () => {
    setFilter({
      q: null,
      status: "all",
      method: "all",
      activeDate: "Today",
      dateRange: { from: new Date(), to: new Date() },
      date: new Date(),
      page: 1,
      limit: 10,
      doctor: [],
    });
  };

  const escapeCsv = (str: string | number | undefined | null) => {
    if (str === null || str === undefined) return '""';
    return `"${String(str).replace(/"/g, '""')}"`;
  };

  const getComputedDates = () => {
    let sd: Date = startOfDay(new Date());
    let ed: Date = endOfDay(new Date());

    if (filter.activeDate === "Today") {
      sd = startOfDay(new Date());
      ed = endOfDay(new Date());
    } else if (filter.activeDate === "7 days") {
      sd = startOfDay(subDays(new Date(), 7));
      ed = endOfDay(new Date());
    } else if (filter.activeDate === "30 days") {
      sd = startOfDay(subDays(new Date(), 30));
      ed = endOfDay(new Date());
    } else if (filter.activeDate === "Custom") {
      const from = filter.dateRange?.from || filter.date || new Date();
      const to = filter.dateRange?.to || from;
      sd = startOfDay(from);
      ed = endOfDay(to);
    }
    return { sd, ed };
  };

  const fetchExportData = async () => {
    const params = new URLSearchParams();
    if (filter.q && filter.q.trim()) params.set("q", filter.q.trim());
    if (filter.status && filter.status !== "all") params.set("status", filter.status);
    if (filter.method && filter.method !== "all") params.set("method", filter.method);

    const { sd, ed } = getComputedDates();
    params.set("startDate", sd.toISOString());
    params.set("endDate", ed.toISOString());
    params.set("activeDate", filter.activeDate);
    params.set("page", "1");
    params.set("limit", "100000");

    const res = await api.get(`/admin/billing?${params.toString()}`);
    let exportData = res.data?.data ?? [];

    if (filter.doctor && filter.doctor.length > 0) {
      exportData = exportData.filter((b: any) => {
        const docName = typeof b.doctor === "object" ? b.doctor?.name : b.doctor;
        return filter.doctor.includes(docName);
      });
    }
    return { exportData, sd, ed };
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const { exportData } = await fetchExportData();

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
        "Transaction Type",
      ];

      const csvRows = [headers.map((h) => `"${h}"`).join(",")];

      exportData.forEach((b: any, index: number) => {
        const docName =
          typeof b.doctor === "object"
            ? b.doctor?.name
            : b.doctor === "Self"
            ? "Self"
            : b.doctor;
        const itemsCount = b.items?.length || 0;
        const itemsDetail =
          b.items
            ?.map(
              (i: any) =>
                `${i.name} (${i.quantity || 1}x ${i.unitPrice || i.total})`
            )
            .join("; ") || "";
        const itemsTotal =
          b.items?.reduce((sum: number, i: any) => sum + (i.total || 0), 0) || 0;
        const roundOffVal = b.roundOff ? getDecimal(itemsTotal) : 0;
        const discountVal = b.discount || 0;
        const cashVal = b.cash || 0;
        const cardVal = b.card || 0;
        const upiVal = b.upi || 0;
        const paidVal = cashVal + cardVal + upiVal;
        const dueVal = Math.max(
          0,
          itemsTotal - roundOffVal - (paidVal + discountVal)
        );

        const status = (() => {
          if (
            b.transactionType === "Refund" ||
            b.items?.some((i: any) => i.name?.toLowerCase().includes("refund"))
          ) {
            return "Refund";
          }
          if (b.transactionType === "Return") {
            return "Return";
          }
          const totalAmount = itemsTotal - roundOffVal;
          const paidAmount = paidVal + discountVal;
          return totalAmount <= paidAmount
            ? "Paid"
            : paidAmount === 0
            ? "Unpaid"
            : "Partial";
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
          escapeCsv(b.transactionType || "Sale"),
        ];

        csvRows.push(row.join(","));
      });

      const csvContent =
        "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
      const downloadLink = document.createElement("a");
      downloadLink.setAttribute("href", csvContent);
      downloadLink.setAttribute(
        "download",
        `Hospital_Billing_Export_${new Date()
          .toISOString()
          .slice(0, 10)}.csv`
      );
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success(`Exported ${exportData.length} records to CSV successfully!`);
    } catch (error) {
      console.error("Export CSV error:", error);
      toast.error("Failed to export CSV. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      setIsDownloadingPdf(true);
      const { exportData, sd, ed } = await fetchExportData();

      if (!exportData || exportData.length === 0) {
        toast.error("No billing data available to generate report for selected filters.");
        return;
      }

      await generateBillingReportPdf({
        department: "Hospital Billing",
        bills: exportData,
        datePresetLabel: filter.activeDate,
        startDate: sd.toISOString(),
        endDate: ed.toISOString(),
        paymentMethod: filter.method === "all" || !filter.method ? "ALL" : filter.method,
        statusFilter: filter.status === "all" || !filter.status ? "ALL" : filter.status,
        searchQuery: filter.q,
      });

      toast.success("Hospital billing PDF report downloaded successfully!");
    } catch (err: any) {
      console.error("Failed to generate PDF report:", err);
      toast.error("Failed to generate PDF report. Please try again.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-6"
    >
      <div className="flex flex-wrap items-end gap-6">
        {/* Single Search Bar */}
        <div className="space-y-2 flex-1 min-w-72">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Search
          </label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-(--color-synapse-light) transition-colors" />
            <Input
              value={filter.q ?? ""}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, q: e.target.value, page: 1 }))
              }
              placeholder="Search invoice no, patient name, MRN..."
              className="pl-9 pr-8 h-10 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-synapse-light/20 transition-all placeholder:text-slate-400 text-sm"
            />
            {filter.q && (
              <button
                type="button"
                onClick={() => setFilter((prev) => ({ ...prev, q: null, page: 1 }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Doctor Filter */}
        <div className="space-y-2 min-w-45">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Doctor
          </label>
          <div className="flex items-center gap-2">
            <Select
              value={filter.doctor[0] || "all"}
              onValueChange={(value) =>
                setFilter((prev) => ({
                  ...prev,
                  doctor: value === "all" ? [] : [value],
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="h-10! bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-synapse-light/20 transition-all">
                <div className="flex items-center gap-2">
                  <FilterIcon className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Select doctor" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-lg border-slate-200 shadow-xl max-h-64">
                <SelectGroup>
                  <SelectLabel className="text-[10px] uppercase tracking-wider text-slate-400">
                    Doctor
                  </SelectLabel>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((doc) => (
                    <SelectItem key={doc._id} value={doc.name}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-2 min-w-45">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Payment Method
          </label>
          <div className="flex items-center gap-2">
            <Select
              value={filter.method || "all"}
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
                  <SelectLabel className="text-[10px] uppercase tracking-wider text-slate-400">
                    Method
                  </SelectLabel>
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
        <div className="space-y-2 min-w-45">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Date Filter
          </label>
          <div className="block">
            <DateRangeFilter
              activeDate={filter.activeDate}
              setActiveDate={(activeDate) =>
                setFilter((prev) => ({ ...prev, activeDate, page: 1 }))
              }
              dateRange={filter.dateRange}
              setDateRange={(dateRange) =>
                setFilter((prev) => ({
                  ...prev,
                  dateRange,
                  date: dateRange?.from,
                  page: 1,
                }))
              }
              date={filter.date}
              setDate={(date) =>
                setFilter((prev) => ({ ...prev, date, page: 1 }))
              }
            />
          </div>
        </div>

        {/* Action Buttons: Reset, Export CSV & Download Report */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            className="h-10 px-5 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
            onClick={handleReset}
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>

          <Button
            variant="outline"
            disabled={isExporting}
            className="h-10 px-4 border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
            onClick={handleExportCsv}
          >
            <Download className="h-4 w-4 text-emerald-600" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>

          <Button
            variant="outline"
            disabled={isDownloadingPdf}
            className="h-10 px-4 border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
            onClick={handleDownloadReport}
          >
            {isDownloadingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
            ) : (
              <FileText className="h-4 w-4 text-rose-600" />
            )}
            {isDownloadingPdf ? "Generating..." : "Download Report"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
