import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/fNumber";
import React from "react";
import { OrderType } from "./interface";
import { fDate } from "@/lib/fDateAndTime";
import { User, Stethoscope, CreditCard, ReceiptIndianRupee, Download } from "lucide-react";
import useSWR from "swr";

interface Props {
  filter: {
    q: string | null;
  };
  setFilter: React.Dispatch<
    React.SetStateAction<{
      q: null | string;
    }>
  >;

  fetchOrder: (mrn?: string) => Promise<void>;

  order: OrderType | null;
}

export default function Search({
  fetchOrder,
  filter,
  setFilter,
  order,
}: Props) {

  const { data: ordersData, isLoading: isLoadingOrders } = useSWR<{
    message: string,
    data: {
      _id: string,
      user: string,
      patient: {
        _id: string,
        name: string,
        phoneNumber: string,
        gender: string,
        dateOfBirth: Date,
        mrn: string,
        address: string
      },
      mrn: string
    }[]
  }>(filter.q ? `/billing/drop-down${filter.q ? `?query=${filter.q}` : ""}` : null)

  const orders = ordersData?.data ?? [];

  const [showDropdown, setShowDropdown] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (selectedIndex !== -1 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  React.useEffect(() => {
    setSelectedIndex(-1);
  }, [orders, showDropdown]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || orders.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < orders.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0) {
        e.preventDefault();
        console.log(orders[selectedIndex])
        setFilter((prev) => ({ ...prev, q: orders[selectedIndex].mrn }));
        setShowDropdown(false);
        setTimeout(async () => await fetchOrder(orders[selectedIndex].mrn), 220);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-1 bg-white border rounded-2xl p-4 shadow-sm shadow-slate-100 flex flex-col gap-3">
        <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <span>Find Bill</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search invoice no. "
              className="pl-9 text-sm h-9 rounded-lg border-slate-300 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              value={filter.q ?? ""}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setFilter((prev) => ({ ...prev, q: e.target.value }))
                setShowDropdown(true)
              }
              }
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              🔍
            </span>

            {showDropdown && orders.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-xl shadow-xl max-h-60 overflow-auto py-2 border-slate-200 animate-in fade-in zoom-in duration-200"
              >
                {orders.map((item, index) => (
                  <div
                    key={item._id}
                    className={`px-4 py-2 cursor-pointer flex flex-col gap-1 transition-colors border-b border-slate-50 last:border-0 ${selectedIndex === index ? "bg-slate-100" : "hover:bg-slate-50"
                      }`}
                    onClick={() => {
                      setFilter((prev) => ({ ...prev, q: item.mrn }));
                      setShowDropdown(false);
                      setTimeout(() => fetchOrder(item.mrn), 0);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-800">
                        {item.patient?.name}{" "}
                        <span className="font-medium ml-1 text-[10px]">
                          ({item.patient.mrn})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.patient?.phoneNumber}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider border border-indigo-100">
                        {item.mrn}
                      </div>
                      {item.patient?.address && (
                        <div className="text-[10px] text-slate-500 truncate italic max-w-[200px]">
                          {item.patient.address}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            className="h-9 rounded-lg bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 text-xs font-medium shadow-md flex items-center gap-2 transition-all active:scale-95"
            onClick={() => fetchOrder()}
          >
            <Download className="w-3.5 h-3.5" />
            Load Order
          </Button>
        </div>
        {Boolean(order) && (
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex flex-col">
              <span className="uppercase tracking-wide">Invoice No</span>
              <span className="text-slate-900 font-medium text-xs">
                {order?.billNo}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="uppercase tracking-wide">Invoice Date</span>
              <span className="text-slate-900 font-medium text-xs">
                {fDate(order?.createdAt)}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="xl:col-span-2 bg-white border rounded-2xl p-4 shadow-sm shadow-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] text-slate-600">
        <div className="flex flex-col">
          <span className="uppercase tracking-wide flex items-center gap-1.5 text-slate-500 font-medium text-xs">
            <User className="w-3 h-3 text-blue-500" /> Patient
          </span>
          <span className="text-blue-700 font-semibold text-sm leading-tight mt-1">
            {order?.patient.name}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            PID: {order?.patient.mrn}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="uppercase tracking-wide flex items-center gap-1.5 text-slate-500 font-medium text-xs">
            <Stethoscope className="w-3 h-3 text-purple-500" /> Doctor
          </span>
          <span className="text-slate-900 font-medium text-sm leading-tight mt-1">
            Dr. {order?.doctor.name}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            {order?.doctor.specialization}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="uppercase tracking-wide flex items-center gap-1.5 text-slate-500 font-medium text-xs">
            <CreditCard className="w-3 h-3 text-orange-500" /> Payment
          </span>
          <span className="text-slate-900 font-medium text-sm leading-tight mt-1">
            UPI
          </span>
        </div>
        <div className="flex flex-col">
          <span className="uppercase tracking-wide flex items-center gap-1.5 text-slate-500 font-medium text-xs">
            <ReceiptIndianRupee className="w-3 h-3 text-emerald-500" /> Total
          </span>
          <span className="text-emerald-700 font-bold text-lg leading-tight mt-1">
            {formatINR(
              order?.items.reduce((a, b) => a + b.name.unitPrice * b.quantity, 0) ?? 0
            )}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">incl. GST</span>
        </div>
      </div>
    </section >
  );
}
