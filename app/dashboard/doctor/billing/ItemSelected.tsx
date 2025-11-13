import api from "@/lib/axios";
import { Plus, Search, Trash2 } from "lucide-react";
import React, { useCallback } from "react";
import useSWR from "swr";

const theme = {
  from: "#4f46e5",
  to: "#ec4899",
  accent: "#06b6d4",
};

interface PropsType {
  addItem: (i?: string) => void;
  itemRef: React.RefObject<HTMLInputElement | null>;
  item: string | null;
  setItem: (v: string) => void;
}

export default function ItemSelected({
  addItem,
  itemRef,
  item,
  setItem,
}: PropsType) {
  const query = item?.trim() ? `/billing/billing_items?item=${encodeURIComponent(item.trim())}` : null;
  const { data: billingItemsData, mutate } = useSWR<{ message: string; data: string[] }>(
    query
  );

  const billingItems = billingItemsData?.data ?? [];

  const addbillingItem = useCallback(
    async (it: string) => {
      const trimmed = it?.trim();
      if (!trimmed) return;
      try {
        await api.post("/billing/billing_item", { item: trimmed });
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
    addItem();
    if (item?.trim()) addbillingItem(item);
  }, [addItem, item, addbillingItem]);

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
        Quick Add
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <input
            placeholder="Search services / tests / items…"
            ref={itemRef}
            className={
              "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
            }
            value={item ?? ""}
            onChange={(e) => setItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "Tab") {
                e.preventDefault();
                addItem();
                if (item?.trim()) {
                  addbillingItem(item);
                }
              }
            }}
          />
          {billingItems.length > 0 && (
            <div className="absolute w-full p-2 rounded-md bg-white border top-11 flex flex-col gap-1.5 !z-50 shadow-sm">
              {billingItems.map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-slate-50 cursor-default"
                >
                  <button
                    type="button"
                    onClick={() => addItem(i)}
                    className="text-left w-full truncate text-sm"
                    title={`Add ${i}`}
                  >
                    {i}
                  </button>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      deleteBillingItem(i);
                      if (item?.trim() === i) setItem("");
                    }}
                    aria-label={`Delete ${i}`}
                    className="ml-2 rounded px-2 py-1 hover:bg-slate-100 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <PrimaryButton onClick={onAddClick}>
          <Plus className="h-4 w-4" />
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
