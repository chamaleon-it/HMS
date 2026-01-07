import { FilePlus2 } from 'lucide-react';
import React from 'react'
import { FilterType } from './page';
import BillingStatusFilter from './BillingStatusFilter';
import PharmacyHeader from '../components/PharmacyHeader';

interface PropsType {
  setTab: (v: "new") => void;
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}

export default function Header({ setTab, filter, setFilter }: PropsType) {
  return (
    <PharmacyHeader
      title="Billing"
      subtitle="Search, filter & review billing history"
    >
      <BillingStatusFilter
        currentStatus={filter.status || "all"}
        setStatus={(status) => setFilter((prev) => ({ ...prev, status }))}
      />
      <PrimaryButton onClick={() => setTab("new")}>
        <FilePlus2 className="mr-2 inline h-4 w-4" /> New Invoice
      </PrimaryButton>
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
