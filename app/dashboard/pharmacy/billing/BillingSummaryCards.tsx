import { Pill, ReceiptIndianRupee, Stethoscope, Syringe, Wallet } from "lucide-react";
import { formatINR } from "@/lib/fNumber";

export interface BillingSummary {
  total: number;
  paid: number;
  consultationFee: number;
  medicineSold: number;
  procedureCharge: number;
}

export default function BillingSummaryCards({
  summary,
  loading,
  error,
}: {
  summary?: BillingSummary;
  loading: boolean;
  error?: unknown;
}) {
  const cards = [
    { label: "Total", value: summary?.total, icon: ReceiptIndianRupee, color: "text-indigo-600", background: "bg-indigo-50" },
    { label: "Paid", value: summary?.paid, icon: Wallet, color: "text-emerald-600", background: "bg-emerald-50" },
    { label: "Consultation Fee (CF)", value: summary?.consultationFee, icon: Stethoscope, color: "text-blue-600", background: "bg-blue-50" },
    { label: "Medicine Sold", value: summary?.medicineSold, icon: Pill, color: "text-violet-600", background: "bg-violet-50" },
    { label: "Procedure Charge", value: summary?.procedureCharge, icon: Syringe, color: "text-amber-600", background: "bg-amber-50" },
  ];

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map(({ label, value, icon: Icon, color, background }) => (
        <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className={`rounded-lg p-2 ${background}`}>
              <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
            </span>
            {label}
          </div>
          <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">
            {loading ? "…" : error ? "—" : formatINR(value ?? 0)}
          </p>
        </div>
      ))}
    </div>
  );
}
