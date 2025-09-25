import { ChevronDown, Eye, Filter, RefreshCcw, Search } from 'lucide-react'
import React from 'react'
import { createPortal } from 'react-dom';

import { motion, AnimatePresence } from "framer-motion";

interface BillRow {
  id: string;
  invoiceNo: string;
  date: string; // ISO string
  patientId: string;
  patientName: string;
  itemsCount: number;
  grand: number;
  paid: number;
  due: number;
  status: "Paid" | "Partial" | "Unpaid";
  method: "Cash" | "Card/UPI" | "Insurance" | "Mixed";
}

const demoBills: BillRow[] = [
  {
    id: "b1",
    invoiceNo: "INV-2025-00918",
    date: "2025-09-22",
    patientId: "PT-001101",
    patientName: "Aisha K",
    itemsCount: 3,
    grand: 1860,
    paid: 1860,
    due: 0,
    status: "Paid",
    method: "Card/UPI",
  },
  {
    id: "b2",
    invoiceNo: "INV-2025-00919",
    date: "2025-09-23",
    patientId: "PT-002134",
    patientName: "John Mathew",
    itemsCount: 2,
    grand: 1150,
    paid: 700,
    due: 450,
    status: "Partial",
    method: "Mixed",
  },
  {
    id: "b3",
    invoiceNo: "INV-2025-00920",
    date: "2025-09-23",
    patientId: "PT-000876",
    patientName: "Divya S",
    itemsCount: 1,
    grand: 500,
    paid: 0,
    due: 500,
    status: "Unpaid",
    method: "Cash",
  },
  {
    id: "b4",
    invoiceNo: "INV-2025-00921",
    date: "2025-09-24",
    patientId: "PT-003900",
    patientName: "Rahul R",
    itemsCount: 4,
    grand: 2420,
    paid: 2420,
    due: 0,
    status: "Paid",
    method: "Insurance",
  },
];

export default function AllBill() {

      const [query, setQuery] = React.useState("");
      const [status, setStatus] = React.useState<"All" | BillRow["status"]>("All");
      const [method, setMethod] = React.useState<"All" | BillRow["method"]>("All");

        const billsFiltered = React.useMemo(() => {
          return demoBills
            .filter((b) => (status === "All" ? true : b.status === status))
            .filter((b) => (method === "All" ? true : b.method === method))
            .filter((b) => {
              const q = query.toLowerCase().trim();
              if (!q) return true;
              return (
                b.invoiceNo.toLowerCase().includes(q) ||
                b.patientName.toLowerCase().includes(q) ||
                b.patientId.toLowerCase().includes(q)
              );
            });
        }, [query, status, method]);
  return (
    <div className="space-y-4">
              {/* Filters (modernized) */}
              <div className={"rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900"}>
                <div className="grid grid-cols-12 items-center gap-3">
                  <div className="col-span-12 md:col-span-5">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-slate-500" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search invoice no. / patient name / ID"
                        className={"h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"}
                      />
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-3 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <PopSelect
                      label="Status"
                      value={status}
                      onChange={setStatus }
                      options={[
                        { label: "All", value: "All" },
                        { label: "Paid", value: "Paid", tone: "success" },
                        { label: "Partial", value: "Partial", tone: "warn" },
                        { label: "Unpaid", value: "Unpaid", tone: "danger" },
                      ]}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <PopSelect
                      label="Method"
                      value={method}
                      onChange={setMethod}
                      options={[
                        { label: "All", value: "All" },
                        { label: "Cash", value: "Cash" },
                        { label: "Card / UPI", value: "Card/UPI" },
                        { label: "Insurance", value: "Insurance" },
                        { label: "Mixed", value: "Mixed" },
                      ]}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-1 flex items-center">
                    <button className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                      <RefreshCcw className="mr-2 inline h-4 w-4" /> Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className={"rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900"}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold">Bills</div>
                  <div className="text-xs text-slate-500">
                    {billsFiltered.length} results
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-sm">
                    <colgroup>
                      <col className="w-[12%]" />
                      <col className="w-[12%]" />
                      <col className="w-[22%]" />
                      <col className="w-[10%]" />
                      <col className="w-[12%]" />
                      <col className="w-[12%]" />
                      <col className="w-[12%]" />
                      <col className="w-[8%]" />
                    </colgroup>
                    <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur">
                      <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                        <th className="py-2 text-left">Invoice</th>
                        <th className="py-2 text-left">Date</th>
                        <th className="py-2 text-left">Patient</th>
                        <th className="py-2 text-right">Items</th>
                        <th className="py-2 text-right">Total</th>
                        <th className="py-2 text-right">Paid</th>
                        <th className="py-2 text-right">Due</th>
                        <th className="py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billsFiltered.map((b) => (
                        <tr
                          key={b.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                        >
                          <td className="py-2 pr-2">
                            <div className="font-medium">{b.invoiceNo}</div>
                            <div className="text-[11px] text-slate-500">
                              {b.method !== "Mixed" ? (
                                <MethodPill m={b.method} />
                              ) : (
                                <MethodPill m="Mixed" />
                              )}
                            </div>
                          </td>
                          <td className="py-2 pr-2">
                            {new Date(b.date).toLocaleDateString("en-IN")}
                          </td>
                          <td className="py-2 pr-2">
                            <div className="font-medium truncate">
                              {b.patientName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {b.patientId}
                            </div>
                          </td>
                          <td className="py-2 pr-2 text-right tabular-nums">
                            {b.itemsCount}
                          </td>
                          <td className="py-2 pr-2 text-right tabular-nums">
                            {currency(b.grand)}
                          </td>
                          <td className="py-2 pr-2 text-right tabular-nums">
                            {currency(b.paid)}
                          </td>
                          <td className="py-2 pr-2 text-right tabular-nums">
                            {currency(b.due)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="flex justify-between items-center gap-5">
                              <StatusPill s={b.status} />
                              <button className="ml-2 inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                                <Eye className="mr-1 h-3.5 w-3.5" /> View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination (static demo) */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    Showing {Math.min(10, billsFiltered.length)} of{" "}
                    {billsFiltered.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                      Prev
                    </button>
                    <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
  )
}



function PopSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T | "All";
  onChange: (v: T | "All") => void;
  options: {
    label: string;
    value: T | "All";
    tone?: "default" | "success" | "warn" | "danger";
  }[];
}) {
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = React.useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const updatePosition = React.useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({
      top: r.bottom + 6,
      left: r.left,
      width: Math.max(220, r.width + 160),
    });
  }, []);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!btnRef.current) return;
      const target = e.target as Node;
      if (!btnRef.current.parentElement?.contains(target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("click", onDoc);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition]);

  React.useEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  const badgeTone =
    value === "Paid" || value === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : value === "Partial" || value === "warn"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : value === "Unpaid" || value === "danger"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-white text-slate-700 border-slate-200";

  return (
    <div className="relative inline-flex">
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${badgeTone} hover:bg-white`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-slate-500">{label}:</span>
        <span className="font-medium">{String(value)}</span>
        <ChevronDown
          className={`h-4 w-4 transition ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      <AnimatePresence>
        {open &&
          pos &&
          createPortal(
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="fixed z-[1000] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
              style={{ top: pos.top, left: pos.left, width: pos.width }}
              role="listbox"
            >
              {options.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  role="option"
                  aria-selected={value === opt.value}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    value === opt.value ? "bg-slate-50 dark:bg-slate-800" : ""
                  }`}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && (
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white dark:bg-white dark:text-slate-900">
                      Selected
                    </span>
                  )}
                </button>
              ))}
            </motion.div>,
            document.body
          )}
      </AnimatePresence>
    </div>
  );
}

const MethodPill: React.FC<{ m: BillRow["method"] }> = ({ m }) => {
    const map: Record<BillRow["method"], string> = {
      Cash: "bg-slate-100 text-slate-700 border-slate-200",
      "Card/UPI": "bg-indigo-50 text-indigo-700 border-indigo-200",
      Insurance: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
      Mixed: "bg-sky-50 text-sky-700 border-sky-200",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${map[m]}`}
      >
        {m}
      </span>
    );
  };

  const currency = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);


    const StatusPill: React.FC<{ s: BillRow["status"] }> = ({ s }) => {
      const cls =
        s === "Paid"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : s === "Partial"
          ? "bg-amber-50 text-amber-800 border-amber-200"
          : "bg-rose-50 text-rose-700 border-rose-200";
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}
        >
          {s}
        </span>
      );
    };