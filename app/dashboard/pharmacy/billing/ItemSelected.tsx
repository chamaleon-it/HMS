import api from "@/lib/axios";
import { Plus, Search, Trash2, Tag, CreditCard, Pencil } from "lucide-react";
import React, { useCallback, useState } from "react";
import useSWR from "swr";
import { formatINR } from "@/lib/fNumber";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import toast from "react-hot-toast";

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
  const [isFocused, setIsFocused] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ _id: string, item: string, code: string, price: number } | null>(null);

  const query = isFocused || item?.trim()
    ? `/billing/billing_items${item?.trim() ? `?item=${encodeURIComponent(item.trim())}` : ""}`
    : null;

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
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <input
            placeholder="Search services / tests / items…"
            ref={itemRef}
            className={
              "h-[42px] w-full rounded-lg border border-slate-200 bg-white/70 px-4 text-[13px] font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900/50 transition-all shadow-sm"
            }
            value={item ?? ""}
            onChange={(e) => setItem(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "Tab") {
                e.preventDefault();
                addItem("", 0);
              }
            }}
          />
          {isFocused && billingItems.length > 0 && (
            <div className="absolute w-full mt-2 p-1.5 max-h-64 overflow-y-auto rounded-xl bg-white/95 backdrop-blur-sm border border-slate-200 top-full flex flex-col gap-1 z-50 shadow-xl animate-in fade-in zoom-in-95 duration-200">
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
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setEditingItem(i);
                        setIsEditModalOpen(true);
                      }}
                      aria-label={`Edit ${i.item}`}
                      className="opacity-0 group-hover:opacity-100 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <PrimaryButton onClick={onAddClick} className="h-[42px] w-12 sm:w-14 flex items-center justify-center p-0 shrink-0">
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </PrimaryButton>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Service / Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Service / Item code <span className="text-red-500">*</span></label>
              <input
                value={editingItem?.code || ""}
                onChange={(e) => setEditingItem(prev => prev ? { ...prev, code: e.target.value } : null)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="e.g. CPT-12345"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Service / Item Name <span className="text-red-500">*</span></label>
              <input
                value={editingItem?.item || ""}
                onChange={(e) => setEditingItem(prev => prev ? { ...prev, item: e.target.value } : null)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="ex. Consultation"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Price (₹)</label>
              <input
                type="number"
                min="0"
                value={editingItem?.price === 0 ? "" : editingItem?.price.toString()}
                onChange={(e) => setEditingItem(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <PrimaryButton
              onClick={async () => {
                if (!editingItem) return;
                try {
                  await toast.promise(api.patch(`/billing/billing_item/${editingItem._id}`, {
                    item: editingItem.item,
                    price: editingItem.price,
                    code: editingItem.code
                  }), {
                    loading: "Updating item...",
                    success: "Item updated successfully!",
                    error: "Failed to update item!"
                  });
                  setIsEditModalOpen(false);
                  mutate(); // Refresh the list
                } catch (error) {
                  console.log(error);
                }
              }}
              disabled={!editingItem?.item?.trim() || !editingItem?.code?.trim()}
            >
              Save Changes
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
