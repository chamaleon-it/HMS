import React, { useEffect, useState } from "react";
import { FileText, Plus, Star, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatINR } from "@/lib/fNumber";
import ItemSelected from "../ItemSelected";
import { cn } from "@/lib/utils";

interface LineItemsTableProps {
    payload: any;
    updateQty: (itemName: string, quantity: number) => void;
    updatePrice: (itemName: string, unitPrice: number) => void;
    updateGST: (itemName: string, gst: number) => void;
    removeItem: (name: string) => void;
    addItem: (i?: string) => void;
    item: string | null;
    setItem: (item: string | null) => void;
    itemRef: React.RefObject<HTMLInputElement | null>;
    PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
    addFullItem: (item: { name: string; unitPrice: number; gst: number }) => void;
}

export const LineItemsTable: React.FC<LineItemsTableProps> = ({
    payload,
    updateQty,
    updatePrice,
    updateGST,
    removeItem,
    addItem,
    item,
    setItem,
    itemRef,
    PrimaryButton,
    addFullItem,
}) => {
    const [favorites, setFavorites] = useState<{ name: string; unitPrice: number; gst: number }[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("@pharmacy-favorites");
        if (stored) {
            setFavorites(JSON.parse(stored));
        }
    }, []);

    const toggleFavorite = (item: { name: string; unitPrice: number; gst: number }) => {
        setFavorites((prev) => {
            const exists = prev.find((f) => f.name === item.name);
            const next = exists
                ? prev.filter((f) => f.name !== item.name)
                : [...prev, item];
            localStorage.setItem("@pharmacy-favorites", JSON.stringify(next));
            return next;
        });
    };

    return (
        <div className="col-span-12 space-y-4 lg:col-span-8">
            <div className="col-span-12 lg:col-span-8">
                <AnimatePresence>
                    {favorites.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 flex flex-wrap gap-2 overflow-hidden"
                        >
                            {favorites.map((fav) => (
                                <div key={fav.name} className="group relative">
                                    <button
                                        onClick={() => addFullItem(fav)}
                                        className="flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50/50 px-3 py-1.5 text-xs font-medium text-yellow-700 transition-colors hover:bg-yellow-100 dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:text-yellow-400"
                                    >
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" />
                                        {fav.name}
                                        <span className="ml-1 text-[10px] opacity-60">({formatINR(fav.unitPrice)})</span>
                                    </button>
                                    <button
                                        onClick={() => toggleFavorite(fav)}
                                        className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-white shadow-sm hover:bg-yellow-600 group-hover:flex"
                                    >
                                        <X className="h-2.5 w-2.5" />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
                <ItemSelected
                    addItem={addItem}
                    item={item}
                    itemRef={itemRef}
                    setItem={setItem}
                />
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 shadow-sm supports-backdrop-filter:bg-white/80 supports-backdrop-filter:backdrop-blur dark:border-slate-800 dark:supports-backdrop-filter:bg-slate-900/70 bg-white dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4" />
                        Line Items
                    </div>
                    <span className="text-xs text-slate-500">
                        Simple mode • Advanced fields in each row
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full table-fixed text-sm">
                        <colgroup>
                            <col className="w-[36%]" />
                            <col className="w-[10%]" />
                            <col className="w-[16%]" />
                            <col className="w-[12%]" />
                            <col className="w-[14%]" />
                            <col className="w-[12%]" />
                        </colgroup>
                        <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur">
                            <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                                <th className="py-2 text-left">Item</th>
                                <th className="py-2 text-right">Qty</th>
                                <th className="py-2 text-right">Unit Price</th>
                                <th className="py-2 text-right">GST%</th>
                                <th className="py-2 text-right">Amount</th>
                                <th className="py-2 text-center">• • •</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence initial={false}>
                                {payload.items.map((it: any) => {
                                    return (
                                        <React.Fragment key={it.name}>
                                            <motion.tr
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6 }}
                                                transition={{ duration: 0.18 }}
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                                            >
                                                <td className="py-2 pr-2">
                                                    <div className="space-y-1">
                                                        <input
                                                            value={it.name}
                                                            readOnly
                                                            disabled
                                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-2 pr-2 text-right">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={it.quantity === 0 ? "" : it.quantity.toString()}
                                                        placeholder="0"
                                                        onFocus={(e) => (e.target.placeholder = "")}
                                                        onBlur={(e) => (e.target.placeholder = "0")}
                                                        onChange={(e) =>
                                                            updateQty(it.name, Number(e.target.value))
                                                        }
                                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50 text-right"
                                                    />
                                                </td>
                                                <td className="py-2 pr-2 text-right">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={it.unitPrice === 0 ? "" : it.unitPrice.toString()}
                                                        placeholder="0"
                                                        onFocus={(e) => (e.target.placeholder = "")}
                                                        onBlur={(e) => (e.target.placeholder = "0")}
                                                        onChange={(e) =>
                                                            updatePrice(it.name, Number(e.target.value))
                                                        }
                                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50 text-right"
                                                    />
                                                </td>
                                                <td className="py-2 pr-2 text-right">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={28}
                                                        value={it.gst === 0 ? "" : it.gst.toString()}
                                                        placeholder="0"
                                                        onFocus={(e) => (e.target.placeholder = "")}
                                                        onBlur={(e) => (e.target.placeholder = "0")}
                                                        onChange={(e) =>
                                                            updateGST(it.name, Number(e.target.value))
                                                        }
                                                        className="h-10 w-20 rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50 text-right"
                                                    />
                                                </td>
                                                <td className="py-2 pr-2 text-right font-medium tabular-nums">
                                                    {formatINR(it.total)}
                                                </td>
                                                <td className="py-2 text-center">
                                                    <div className="flex items-center gap-2">

                                                        <button
                                                            onClick={() => removeItem(it.name)}
                                                            className="ml-1 rounded-md p-2 hover:bg-rose-50 text-rose-600"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleFavorite({ name: it.name, unitPrice: it.unitPrice, gst: it.gst })}
                                                            className={cn(
                                                                "rounded-md p-2 transition-colors",
                                                                favorites.some((f) => f.name === it.name)
                                                                    ? "bg-yellow-50 text-yellow-600"
                                                                    : "text-slate-400 hover:bg-yellow-50 hover:text-yellow-600"
                                                            )}
                                                        >
                                                            <Star
                                                                className={cn(
                                                                    "h-4 w-4",
                                                                    favorites.some((f) => f.name === it.name) && "fill-yellow-600"
                                                                )}
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        </React.Fragment>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                <div className="mt-3 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <span className="text-slate-500">Line Items Total</span>
                        <span className="ml-3 font-semibold tabular-nums">
                            {formatINR(payload.items.reduce((acc: number, i: any) => acc + i.total, 0))}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <PrimaryButton
                            onClick={() => {
                                if (item) {
                                    addItem();
                                } else {
                                    itemRef.current?.focus();
                                }
                            }}
                            className="flex-1 sm:flex-none"
                        >
                            <Plus className="mr-2 inline h-4 w-4" />
                            Add Item
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </div>
    );
};
