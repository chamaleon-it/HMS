import api from "@/lib/axios";
import { Plus, Search, Trash2, Tag, CreditCard } from "lucide-react";
import React, { useCallback } from "react";
import useSWR from "swr";
import { formatINR } from "@/lib/fNumber";

const theme = {
  from: "#4f46e5",
  to: "#ec4899",
  accent: "#06b6d4",
};

interface PropsType {
  addItem: (item: string, price: number) => void;
  itemRef: React.RefObject<HTMLInputElement | null>;
  item: string | null;
  setItem: (v: string) => void;
  onOpenCustomModal: () => void;
}

export default function ItemSelected({
  addItem,
  itemRef,
  item,
  setItem,
  onOpenCustomModal,
}: PropsType) {
  const query = item?.trim() ? `/billing/billing_items?item=${encodeURIComponent(item.trim())}` : null;
  const { data: billingItemsData, mutate } = useSWR<{ message: string; data: { item: string, code: string, price: number, _id: string }[] }>(
    query
  );

  const billingItems = billingItemsData?.data ?? [];

  const addbillingItem = useCallback(
    async (it: string, price: number) => {
      const trimmed = it?.trim();
      if (!trimmed) return;
      try {
        await api.post("/billing/billing_item", { item: trimmed, price });
        await mutate();
      } catch (err) {
        console.log(err);
      }
    },
    [mutate]
  );

  const deleteBillingItem = useCallback(
    async (it: string) => {
      const trimmed = it?.trim();
      if (!trimmed) return;
      try {
        await api.delete(`/billing/billing_item?item=${encodeURIComponent(trimmed)}`);
        await mutate();
      } catch (err) {
        console.log(err);
      }
    },
    [mutate]
  );

  const onAddClick = useCallback(() => {
    if (item?.trim()) {
      addItem(item, 0);
      addbillingItem(item, 0);
    } else {
      onOpenCustomModal();
    }
  }, [addItem, item, addbillingItem, onOpenCustomModal]);

  return (
    <div className="col-span-12 md:col-span-4 ">
      <div className="text-sm font-medium mb-2 flex items-center gap-2">
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-white"
          style={{
            backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
          }}
        >
          <Search className="h-4 w-4" />
        </span>
        Add Item
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <input
            placeholder="Search services / tests / items…"
            ref={itemRef}
            className={
              "h-12 w-full rounded-lg border border-slate-200 bg-white/70 px-4 text-[15px] font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900/50 transition-all shadow-sm"
            }
            value={item ?? ""}
            onChange={(e) => setItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "Tab") {
                e.preventDefault();
                addItem("", 0);
              }
            }}
          />
          {billingItems.length > 0 && (
            <div className="absolute w-full mt-2 p-1.5 rounded-xl bg-white/95 backdrop-blur-sm border border-slate-200 top-full flex flex-col gap-1 z-50 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {billingItems.map((i) => (
                <div
                  key={i._id}
                  onClick={() => addItem(i.item, i.price)}
                  className="group flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                      <Tag className="h-4 w-4 text-slate-500 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded leading-none group-hover:bg-indigo-100/50 group-hover:text-indigo-600 transition-colors">
                          {i.code}
                        </span>
                        <span className="text-sm font-semibold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                          {i.item}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                        <CreditCard className="h-3 w-3" />
                        <span>Unit Price: {formatINR(i.price)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <div className="text-sm font-bold text-slate-400 group-hover:text-indigo-600 transition-colors mr-2">
                      {formatINR(i.price)}
                    </div>
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        deleteBillingItem(i.item);
                        if (item?.trim() === i.item) setItem("");
                      }}
                      aria-label={`Delete ${i.item}`}
                      className="opacity-0 group-hover:opacity-100 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all active:scale-90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <PrimaryButton onClick={onAddClick} className="h-12 w-16 sm:w-20 flex items-center justify-center p-0 shrink-0">
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </PrimaryButton>
      </div>
    </div>
  );
}

const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = "",
  children,
  ...rest
}) => (
  <button
    {...rest}
    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 active:scale-[0.99] ${className}`}
    style={{
      backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
    }}
  >
    {children}
  </button>
);
