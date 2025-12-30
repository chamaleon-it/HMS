import { FilePlus2, FileText, RefreshCcw, Wallet2 } from 'lucide-react';
import React from 'react'
import { FilterType } from './page';
import BillingStatusFilter from './BillingStatusFilter';

interface PropsType {
  setTab: (v: "new") => void;
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}

export default function Header({ setTab, filter, setFilter }: PropsType) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-gray-500">
          Search, filter & review billing history
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <BillingStatusFilter
          currentStatus={filter.status || "all"}
          setStatus={(status) => setFilter((prev) => ({ ...prev, status }))}
        />
        <PrimaryButton onClick={() => setTab("new")}>
          <FilePlus2 className="mr-2 inline h-4 w-4" /> New Invoice
        </PrimaryButton>
        {/* <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:brightness-110">
          <Wallet2 className="mr-2 inline h-4 w-4" /> Collect Payment
        </button>
        <button className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300">
          <RefreshCcw className="mr-2 inline h-4 w-4" /> Refund
        </button>
        <button className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-300">
          <FileText className="mr-2 inline h-4 w-4" /> Reports
        </button> */}
      </div>
    </div>
  )
}


const theme = {
  from: "#4f46e5",
  to: "#ec4899",
  accent: "#06b6d4",
};

const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...rest }) => (
  <button
    {...rest}
    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 active:scale-[0.99] ${className} cursor-pointer`}
    style={{
      backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
    }}
  >
    {children}
  </button>
);
