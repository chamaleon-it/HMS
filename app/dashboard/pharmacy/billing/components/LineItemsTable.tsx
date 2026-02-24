import React, { useEffect, useState, useRef } from "react";
import { Plus, Search, Star, Trash2, X, Sun, Sunrise, Moon, MoonStar, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatINR } from "@/lib/fNumber";
import ItemSelected from "../ItemSelected";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import useSWR from "swr";

interface LineItemsTableProps {
    payload: any;
    updateQty: (itemName: string, quantity: number) => void;
    updatePrice: (itemName: string, unitPrice: number) => void;
    updateGST: (itemName: string, gst: number) => void;
    removeItem: (name: string) => void;
    addItem: (item: string, price: number) => void;
    item: string | null;
    setItem: (item: string | null) => void;
    itemRef: React.RefObject<HTMLInputElement | null>;
    PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;

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
}) => {
    const [favorites, setFavorites] = useState<{ name: string; unitPrice: number; gst: number }[]>([]);
    const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);
    const [customItem, setCustomItem] = useState({ procedureCode: "", name: "", unitPrice: 0 });
    const procedureNameRef = useRef<HTMLInputElement>(null);
    const unitPriceRef = useRef<HTMLInputElement>(null);



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


    const { data: billingItemsResponse, mutate: billingItemsMutate } = useSWR<{ data: { code: string, item: string, price: number, _id: string }[], message: string }>("/billing/billing_items")
    const billingItems = billingItemsResponse?.data ?? []


    return (
        <div className="col-span-12 space-y-4 lg:col-span-8">
            <div className="col-span-12 lg:col-span-8">
                <AnimatePresence>
                    {favorites.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 flex flex-wrap gap-2 overflow-hidden pt-3"
                        >
                            {favorites.map((fav) => (
                                <div key={fav.name} className="group relative">
                                    <button
                                        className="flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50/50 px-3 py-1.5 text-xs font-medium text-yellow-700 transition-colors hover:bg-yellow-100 dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:text-yellow-400"
                                        onClick={() => {
                                            addItem(fav.name, fav.unitPrice)
                                        }}
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


                <AnimatePresence>
                    {billingItems?.length > 0 && (
                        <div className="space-y-6  mb-5">
                            {(() => {
                                const categories = [
                                    { name: "Dressing", keywords: ["dressing"] },
                                    { name: "Procedure", keywords: ["procedure", "injection", "cannulation", "extraction", "catheterisation", "enema"] },
                                    { name: "Consultation", keywords: ["consultation"] }
                                ];

                                const grouped = billingItems.reduce((acc, item) => {
                                    const itemName = item.item.toLowerCase();
                                    const category = categories.find(c => c.keywords.some(k => itemName.includes(k)));
                                    const categoryName = category ? category.name : "Others";

                                    if (!acc[categoryName]) acc[categoryName] = [];
                                    acc[categoryName].push(item);
                                    return acc;
                                }, {} as Record<string, typeof billingItems>);

                                return ["Consultation"].map(catName => {
                                    const items = grouped[catName];
                                    if (!items || items.length === 0) return null;

                                    return (
                                        <div key={catName} className="space-y-3">
                                            <div className="flex items-center gap-2 px-1">
                                                <div className="h-1 w-1 rounded-full bg-slate-400" />
                                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{catName}</h4>
                                                <div className="h-px flex-1 bg-slate-100" />
                                            </div>
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex flex-wrap gap-2 overflow-hidden pt-1"
                                            >
                                                {items.map((item) => {
                                                    const isConsultation = catName === "Consultation";
                                                    let tierStyles = "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600";
                                                    let Icon = null;

                                                    if (isConsultation) {
                                                        const p = item.price;
                                                        if (item.code === "CF1") {
                                                            // CF1: Early Morning (6am-8am) - Soft Sunrise Amber
                                                            tierStyles = "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 shadow-amber-500/5";
                                                            Icon = (
                                                                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-100/80 text-amber-600">
                                                                    <Sunrise className="h-3 w-3" />
                                                                </div>
                                                            );
                                                        } else if (item.code === "CF2") {
                                                            // CF2: Day (8am-10pm) - Vibrant Solar Gold
                                                            tierStyles = "border-orange-400 bg-orange-500 text-white hover:bg-orange-600 hover:border-orange-500 shadow-orange-500/10";
                                                            Icon = (
                                                                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20 text-white">
                                                                    <Sun className="h-3 w-3 fill-white/20" />
                                                                </div>
                                                            );
                                                        } else if (item.code === "CF3") {
                                                            // CF3: Evening (10pm-11pm) - Light Dark (Slate)
                                                            tierStyles = "border-slate-400 bg-slate-600 text-white hover:bg-slate-700 hover:border-slate-600 shadow-slate-500/10";
                                                            Icon = (
                                                                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/10 text-white/90">
                                                                    <Moon className="h-3 w-3 fill-white/20" />
                                                                </div>
                                                            );
                                                        } else if (item.code === "CF4") {
                                                            // CF4: Midnight (11pm-6am) - Sleek Midnight Zinc
                                                            tierStyles = "border-zinc-800 bg-zinc-900 text-white hover:bg-black hover:border-black shadow-zinc-900/20";
                                                            Icon = (
                                                                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 text-zinc-400">
                                                                    <MoonStar className="h-3 w-3" />
                                                                </div>
                                                            );
                                                        }
                                                    }

                                                    return (
                                                        <div key={item.item} className="group relative">
                                                            <button
                                                                className={`relative flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all shadow-sm ${tierStyles}`}
                                                                onClick={() => {
                                                                    addItem(item.item, item.price)
                                                                }}
                                                            >
                                                                {Icon}
                                                                {item.item}
                                                                <span className={`ml-1 text-[10px] font-normal ${isConsultation && item.price >= 120 ? "opacity-70" : "text-slate-400"}`}>
                                                                    ({formatINR(item.price)})
                                                                </span>
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await toast.promise(api.delete(`/billing/billing_item?item=${item.item}`), {
                                                                            loading: "Deleting item...",
                                                                            success: "Item deleted successfully",
                                                                            error: "Failed to delete item"
                                                                        })
                                                                        billingItemsMutate()
                                                                    } catch (error) {

                                                                    }
                                                                }}
                                                                className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white shadow-md hover:bg-rose-600 group-hover:flex z-50"
                                                            >
                                                                <X className="h-2.5 w-2.5" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </motion.div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    )}
                </AnimatePresence>

                <ItemSelected
                    addItem={addItem}
                    item={item}
                    itemRef={itemRef}
                    setItem={setItem}
                    onOpenCustomModal={() => setIsCustomItemModalOpen(true)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-2">
                        Line Items
                    </div>
                    <span className="text-xs text-slate-400 italic">
                        Start typing to search items
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
                        <thead className="bg-[#334155]">
                            <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-white font-semibold">
                                <th className="py-4 pl-4 text-left">Item Name</th>
                                <th className="py-4 pr-2 text-right">Qty</th>
                                <th className="py-4 pr-2 text-right">Unit Price</th>
                                <th className="py-4 pr-2 text-right">GST%</th>
                                <th className="py-4 pr-2 text-right">Amount</th>
                                <th className="py-4 text-center">Action</th>
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
                                                className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/30 group transition-colors"
                                            >
                                                <td className="py-3 pl-3 pr-2">
                                                    <div className="space-y-1">
                                                        <input
                                                            value={it.name}
                                                            readOnly
                                                            disabled
                                                            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-2 text-right">
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
                                                        className="h-11 w-full rounded-lg border border-slate-200 bg-indigo-50/30 px-3 text-sm font-bold text-indigo-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all text-center"
                                                    />
                                                </td>
                                                <td className="py-3 pr-2 text-right">
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
                                                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all text-right"
                                                    />
                                                </td>
                                                <td className="py-3 pr-2 text-right">
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
                                                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all text-right"
                                                    />
                                                </td>
                                                <td className="py-3 pr-2 text-right font-bold text-slate-700 tabular-nums text-base">
                                                    {formatINR(it.total)}
                                                </td>
                                                <td className="py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">

                                                        <button
                                                            onClick={() => removeItem(it.name)}
                                                            className="rounded-lg p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleFavorite({ name: it.name, unitPrice: it.unitPrice, gst: it.gst })}
                                                            className={cn(
                                                                "rounded-lg p-2 transition-colors",
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

                <div className="p-4 pt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 flex items-center">
                        <span className="text-slate-500 text-[15px] font-medium">Line Items Total</span>
                        <span className="ml-3 font-bold tabular-nums text-lg text-slate-800">
                            {formatINR(payload.items.reduce((acc: number, i: any) => acc + i.total, 0))}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <PrimaryButton
                            onClick={() => {
                                if (item) {
                                    addItem("", 0);
                                } else {
                                    setIsCustomItemModalOpen(true);
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

            <Dialog open={isCustomItemModalOpen} onOpenChange={setIsCustomItemModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Custom Item / Service</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Service / Item code <span className="text-red-500">*</span></label>
                            <input
                                value={customItem.procedureCode}
                                onChange={(e) => setCustomItem({ ...customItem, procedureCode: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        procedureNameRef.current?.focus();
                                    }
                                }}
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="e.g. CPT-12345"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Service / Item Name <span className="text-red-500">*</span></label>
                            <input
                                ref={procedureNameRef}
                                value={customItem.name}
                                onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        unitPriceRef.current?.focus();
                                    }
                                }}
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="ex. Consultation"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Price (₹)</label>
                            <input
                                ref={unitPriceRef}
                                type="number"
                                min="0"
                                value={customItem.unitPrice === 0 ? "" : customItem.unitPrice.toString()}
                                onChange={(e) => setCustomItem({ ...customItem, unitPrice: Number(e.target.value) })}

                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <PrimaryButton
                            onClick={async () => {
                                try {
                                    const data = await toast.promise(api.post("/billing/billing_item", {
                                        item: customItem.name,
                                        price: customItem.unitPrice,
                                        code: customItem.procedureCode
                                    }), {
                                        loading: "Adding custom item...",
                                        success: "Custom item added successfully!",
                                        error: "Failed to add custom item!"
                                    })
                                    setCustomItem({
                                        name: "",
                                        procedureCode: "",
                                        unitPrice: 0
                                    })
                                    setIsCustomItemModalOpen(false)
                                    billingItemsMutate()
                                } catch (error) {
                                    console.log(error)
                                }
                            }}
                            disabled={!customItem.name.trim() || !customItem.procedureCode.trim()}
                        >
                            Add Procedure
                        </PrimaryButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
