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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";

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
    unitPrice?: number;
    purchasePrice?: number;
    packing?: number;
    // Add other fields as necessary from the API response
}

interface ItemSearchCellProps {
    selectedItemId: string;
    onSelect: (item: Item) => void;
}

const ItemSearchCell = ({
    selectedItemId,
    onSelect
}: ItemSearchCellProps) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
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
        if (selectedItemId && items.length > 0) {
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
                        {localSelectedItem ? localSelectedItem.name : "Search Medicine..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-indigo-500" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0 shadow-2xl border-slate-200 rounded-xl" align="start">
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
                            <CommandEmpty className="py-6 text-center text-slate-500 text-sm ">No medicines found.</CommandEmpty>
                        )}
                        <CommandGroup className="p-2 ">
                            {items.map((it) => (
                                <CommandItem
                                    key={it._id}
                                    value={it.name}
                                    onSelect={() => {
                                        setLocalSelectedItem(it);
                                        onSelect(it);
                                        setOpen(false);
                                        setQuery("");
                                    }}
                                    className="rounded-lg h-10 px-3 aria-selected:bg-indigo-50 aria-selected:text-indigo-700 font-medium transition-colors cursor-pointer mb-1 "
                                >
                                    <Check
                                        className={cn(
                                            "mr-3 h-4 w-4 text-indigo-600 transition-all",
                                            selectedItemId === it._id ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                        )}
                                    />
                                    <div className="flex flex-col ">
                                        <span className="">{it.name}</span>
                                        {it.generic && <span className="text-[10px] text-slate-400 ">{it.generic}</span>}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default ItemSearchCell;
