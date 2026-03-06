import { FilePlus2, PlusCircle, ReceiptIndianRupee } from 'lucide-react';
import React from 'react'
import { FilterType } from './page';
import BillingStatusFilter from './BillingStatusFilter';
import PharmacyHeader from '../components/PharmacyHeader';
import { motion } from 'framer-motion';

interface PropsType {
  tab: "all" | "new";
  setTab: (v: "all" | "new") => void;
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}

export default function Header({ tab, setTab, filter, setFilter }: PropsType) {
  return (
    <PharmacyHeader
      title="Billing"
      subtitle="Search, filter & review billing history"
    >
      <BillingStatusFilter
        currentStatus={filter.status || "all"}
        setStatus={(status) => setFilter((prev) => ({ ...prev, status }))}
      />

      <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1 print:hidden w-fit">
        {[
          { key: "all", label: "All Bills", icon: ReceiptIndianRupee },
          { key: "new", label: "Create Bill", icon: PlusCircle },
        ].map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key as "all" | "new")}
              className={
                "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer font-medium " +
                (active ? "text-white" : "text-slate-600 hover:bg-slate-50")
              }
              type="button"
            >
              {active && (
                <motion.span
                  layoutId="billing-tab-indicator-1"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "linear-gradient(90deg,#4f46e5,#d946ef)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon size={16} /> {label}
              </span>
            </button>
          );
        })}
      </div>
    </PharmacyHeader>
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
