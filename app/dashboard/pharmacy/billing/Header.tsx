import { FilePlus2, PlusCircle, ReceiptIndianRupee, ChevronDown, Check, Filter, User2 } from 'lucide-react';
import React, { useMemo, useState, useRef, useEffect } from 'react'
import { FilterType } from './page';
import BillingStatusFilter from './BillingStatusFilter';
import PharmacyHeader from '../components/PharmacyHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PropsType {
  tab: "all" | "new";
  setTab: (v: "all" | "new") => void;
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  billing: {
    doctor: string;
    transactionType: "Return" | "Sale"
    roundOff: boolean;
    mrn: string;
    _id: string;
    createdAt: Date;
    cash: number;
    online: number;
    insurance: number;
    discount: number;
    items: {
      name: string;
      total: number;
      quantity: number;
      unitPrice: number;
      gst: number;
    }[];
    patient: {
      name: string;
      mrn: string;
    };
  }[];
}

export default function Header({ tab, setTab, filter, setFilter, billing }: PropsType) {
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const doctors = useMemo(() => {
    const list = [...new Set(billing.map(b => b.doctor))].filter(Boolean);
    return list.sort();
  }, [billing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDoctorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDoctor = (doctor: string) => {
    setFilter(prev => {
      const current = prev.doctor || [];
      const isSelected = current.includes(doctor);
      if (isSelected) {
        return { ...prev, doctor: current.filter(d => d !== doctor) };
      } else {
        return { ...prev, doctor: [...current, doctor] };
      }
    });
  };

  const clearDoctors = () => {
    setFilter(prev => ({ ...prev, doctor: [] }));
  };

  return (
    <PharmacyHeader
      title="Billing"
      subtitle="Search, filter & review billing history"
    >
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDoctorOpen(!isDoctorOpen)}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all border cursor-pointer font-medium",
            filter.doctor.length > 0 
              ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          )}
          type="button"
        >
          <User2 size={14} className={cn(filter.doctor.length > 0 ? "text-indigo-500" : "text-slate-400")} />
          <span>
            {filter.doctor.length === 0 
              ? "All Doctors" 
              : filter.doctor.length === 1 
                ? filter.doctor[0] 
                : `${filter.doctor.length} Doctors Selected`}
          </span>
          <ChevronDown size={14} className={cn("transition-transform duration-200", isDoctorOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isDoctorOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 z-50 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
            >
              <button
                onClick={() => {
                  clearDoctors();
                  setIsDoctorOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium">All Doctors</span>
                {filter.doctor.length === 0 && <Check size={16} className="text-indigo-600" />}
              </button>
              
              <div className="my-1.5 h-px bg-slate-100" />
              
              <div className="max-h-60 overflow-y-auto scrollbar-hide">
                {doctors.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-slate-400">
                    No doctors found
                  </div>
                ) : (
                  doctors.map(doctor => (
                    <button
                      key={doctor}
                      onClick={() => toggleDoctor(doctor)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <span className="truncate">{doctor}</span>
                      {filter.doctor.includes(doctor) && <Check size={16} className="text-indigo-600" />}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
