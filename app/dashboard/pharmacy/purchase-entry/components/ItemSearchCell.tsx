"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { QuickAddItem } from "../../inventory/QuickAddItem";

// Simple hook for debouncing
function useDebounced<T>(value: T, delay = 250) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

interface Item {
    _id: string;
    name: string;
    generic?: string;
    quantity?: number;
    unitPrice?: number;
    purchasePrice?: number;
    packing?: number;
    gst?: number
    // Add other fields as necessary from the API response
}

interface ItemSearchCellProps {
    selectedItemId: string;
    selectedItemName?: string;
    onSelect: (item: Item) => void;
}

const ItemSearchCell = ({
    selectedItemId,
    selectedItemName,
    onSelect
}: ItemSearchCellProps) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [localSelectedItem, setLocalSelectedItem] = useState<Item | null>(null);
    const debouncedQ = useDebounced(query, 300);

    const qs = useMemo(() => {
        const p = new URLSearchParams();
        p.set("limit", "10");
        if (debouncedQ) p.set("q", debouncedQ);
        return p.toString();
    }, [debouncedQ]);

    const { data, isLoading } = useSWR<{ data: Item[] }>(debouncedQ ? `/pharmacy/items?${qs}` : null);
    const items = data?.data || [];

    // Sync local selection when found in items (helps if we only have an ID)
    useEffect(() => {
        if (!selectedItemId) {
            setLocalSelectedItem(null);
        } else if (items.length > 0) {
            const found = items.find(it => it._id === selectedItemId);
            if (found) setLocalSelectedItem(found);
        }
    }, [selectedItemId, items]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    className={cn(
                        "w-full h-11 justify-between text-sm border border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-300 hover:shadow-md transition-all rounded-lg",
                        !selectedItemId && "text-slate-400 font-medium"
                    )}
                >
                    <span className="truncate">
                        {localSelectedItem ? localSelectedItem.name : (selectedItemName || "Search Medicine...")}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-indigo-500" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0 shadow-2xl border-slate-200 rounded-xl" align="start">
                <Command className="rounded-xl ">
                    <CommandInput
                        placeholder="Type medicine name..."
                        className="h-12 border-none focus:ring-0 "
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList className="">
                        {isLoading && <div className="p-4 text-center text-sm text-slate-500 ">Searching...</div>}
                        {!isLoading && items.length === 0 && query && (
                            <CommandEmpty className="py-6 text-center text-slate-500 text-sm flex flex-col items-center gap-3">
                                <span>No medicines found for "{query}"</span>
                                <Button
                                    size="sm"
                                    className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-semibold shadow-md "
                                    onClick={() => {
                                        setIsAddModalOpen(true);
                                        setOpen(false);
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add New Medicine
                                </Button>
                            </CommandEmpty>
                        )}
                        <CommandGroup className="p-2 ">
                            {items.map((it) => {
                                const qty = it.quantity ?? 0;
                                return (
                                    <CommandItem
                                        key={it._id}
                                        value={it.name}
                                        onSelect={() => {
                                            setLocalSelectedItem(it);
                                            onSelect(it);
                                            setOpen(false);
                                            setQuery("");
                                        }}
                                        className="rounded-lg py-2 px-3 aria-selected:bg-indigo-50 aria-selected:text-indigo-700 font-medium transition-colors cursor-pointer mb-1 flex items-center justify-between"
                                    >
                                        <div className="flex items-center min-w-0 pr-2">
                                            <Check
                                                className={cn(
                                                    "mr-2.5 h-4 w-4 text-indigo-600 transition-all shrink-0",
                                                    selectedItemId === it._id ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                                )}
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-medium leading-tight truncate">{it.name}</span>
                                                {it.generic && <span className="text-[10px] text-slate-400 truncate">{it.generic}</span>}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-0.5 shrink-0 pl-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded-sm ${
                                                qty <= 0
                                                    ? "bg-red-50 text-red-600"
                                                    : qty < 15
                                                        ? "bg-amber-50 text-amber-600"
                                                        : "bg-emerald-50 text-emerald-600"
                                            }`}>
                                                {qty <= 0 ? "Out of Stock" : qty < 15 ? "Low Stock" : "In Stock"}
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-500">
                                                {qty} {qty === 1 ? 'unit' : 'units'} available
                                            </span>
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-3xl!">
                    <DialogHeader>
                        <DialogTitle>Register New Medicine</DialogTitle>
                    </DialogHeader>
                    <QuickAddItem
                        initialName={query}
                        onClose={() => setIsAddModalOpen(false)}
                        onSelect={(it) => {
                            setLocalSelectedItem(it);
                            onSelect(it);
                            setIsAddModalOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Popover>
    );
};

export default ItemSearchCell;
