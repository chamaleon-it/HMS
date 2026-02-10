"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Save,
    Trash2,
    Upload,
    Check,
    ChevronsUpDown,
    Calculator,
    Calendar as CalendarIcon
} from "lucide-react";
import { format, parse } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import api from "@/lib/axios";

// ... (ItemSearchCell and useDebounced hook here)
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import useSWR from "swr";

const ItemSearchCell = ({
    selectedItemId,
    onSelect
}: {
    selectedItemId: string,
    onSelect: (item: any) => void
}) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [localSelectedItem, setLocalSelectedItem] = useState<any>(null);
    const debouncedQ = useDebounced(query, 300);

    const qs = useMemo(() => {
        const p = new URLSearchParams();
        p.set("limit", "10");
        if (debouncedQ) p.set("q", debouncedQ);
        return p.toString();
    }, [debouncedQ]);

    const { data, isLoading } = useSWR<{ data: any[] }>(debouncedQ ? `/pharmacy/items?${qs}` : null);
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
                        "w-full h-11 justify-between  text-sm border border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-300 hover:shadow-md transition-all rounded-lg",
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

function useDebounced<T>(value: T, delay = 250) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const years = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i);

const DatePicker = ({
    value,
    onChange,
    placeholder = "Pick a date",
    className,
    mode = "date"
}: {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    className?: string;
    mode?: "date" | "year";
}) => {
    const [open, setOpen] = useState(false);
    const date = value ? new Date(value) : undefined;

    const isPast = (monthIdx: number, year: number) => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        if (year < currentYear) return true;
        if (year === currentYear && monthIdx < currentMonth) return true;
        return false;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left  h-11 bg-slate-50/50 border-slate-200 rounded-lg hover:bg-slate-100/50 transition-all",
                        !value && "text-slate-400 font-medium",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                    {value ? (
                        mode === "year"
                            ? format(new Date(value), "MM / yyyy")
                            : format(new Date(value), "PPP")
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                {mode === "date" ? (
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => {
                            if (d) {
                                onChange(format(d, "yyyy-MM-dd"));
                                setOpen(false);
                            }
                        }}
                        initialFocus
                        className="rounded-xl border-none shadow-none"
                    />
                ) : (
                    <div className="w-64 p-3 bg-white rounded-xl shadow-xl border border-slate-100">
                        <div className="space-y-3">
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1">Select Expiry (MM/YYYY)</div>

                            <div className="grid grid-cols-3 gap-1">
                                {months.map((m: string, idx: number) => {
                                    const selectedYear = date ? date.getFullYear() : new Date().getFullYear();
                                    const disabled = isPast(idx, selectedYear);
                                    const isSelected = date && date.getMonth() === idx && date.getFullYear() === selectedYear;

                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            disabled={disabled}
                                            className={cn(
                                                "px-2 py-2 text-xs rounded-lg transition-all ",
                                                isSelected
                                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                                    : disabled
                                                        ? "text-slate-200 cursor-not-allowed"
                                                        : "hover:bg-slate-50 text-slate-600 hover:text-indigo-600"
                                            )}
                                            onClick={() => {
                                                const currentYear = date ? date.getFullYear() : new Date().getFullYear();
                                                const newDate = new Date(currentYear, idx, 1);
                                                onChange(format(newDate, "yyyy-MM-dd"));
                                            }}
                                        >
                                            {m}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="border-t border-slate-100 pt-3">
                                <Select
                                    value={date ? String(date.getFullYear()) : String(new Date().getFullYear())}
                                    onValueChange={(y) => {
                                        const currentMonth = date ? date.getMonth() : new Date().getMonth();
                                        // If selecting a year that makes current month past, reset to current month or first valid month
                                        let targetMonth = currentMonth;
                                        if (isPast(currentMonth, Number(y))) {
                                            targetMonth = new Date().getMonth();
                                        }
                                        const newDate = new Date(Number(y), targetMonth, 1);
                                        onChange(format(newDate, "yyyy-MM-dd"));
                                    }}
                                >
                                    <SelectTrigger className="w-full h-10 text-xs  bg-slate-50/50 border-slate-200 rounded-lg">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200">
                                        {years.map((y: number) => (
                                            <SelectItem key={y} value={String(y)} className="text-xs  rounded-lg focus:bg-indigo-50">
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="button"
                                className="w-full h-10 text-[10px] font-semibold uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-100 transition-all"
                                onClick={() => setOpen(false)}
                            >
                                Confirm Selection
                            </Button>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};

// Typable Date Input Component for faster keyboard entry
const TypableDateInput = ({
    value,
    onChange,
    placeholder = "DD/MM/YYYY",
    className,
    onKeyDown
}: {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    className?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) => {
    const [displayValue, setDisplayValue] = useState("");
    const [open, setOpen] = useState(false);

    // Convert yyyy-MM-dd to DD/MM/YYYY for display
    useEffect(() => {
        if (value) {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    setDisplayValue(`${day}/${month}/${year}`);
                }
            } catch (e) {
                setDisplayValue("");
            }
        } else {
            setDisplayValue("");
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value.replace(/[^0-9]/g, ''); // Remove non-digits

        // Auto-format with slashes
        if (input.length >= 2) {
            input = input.slice(0, 2) + '/' + input.slice(2);
        }
        if (input.length >= 5) {
            input = input.slice(0, 5) + '/' + input.slice(5, 9);
        }

        setDisplayValue(input);

        // Parse and validate complete date (DD/MM/YYYY)
        if (input.length === 10) {
            const parts = input.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10);

                // Basic validation
                if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
                    // Convert to yyyy-MM-dd format
                    const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    onChange(isoDate);
                }
            }
        }
    };

    const date = value ? new Date(value) : undefined;

    return (
        <div className="relative flex items-center gap-1">
            <Input
                type="text"
                placeholder={placeholder}
                className={cn(
                    "h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all text-center font-mono pr-10",
                    className
                )}
                value={displayValue}
                onChange={handleChange}
                onKeyDown={onKeyDown}
                maxLength={10}
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 h-9 w-9 hover:bg-indigo-50 rounded-md transition-colors"
                    >
                        <CalendarIcon className="h-4 w-4 text-indigo-500" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => {
                            if (d) {
                                onChange(format(d, "yyyy-MM-dd"));
                                setOpen(false);
                            }
                        }}
                        initialFocus
                        className="rounded-xl border-none shadow-none"
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};

// Typable Expiry Input (MM/YYYY format)
const TypableExpiryInput = ({
    value,
    onChange,
    placeholder = "MM/YYYY",
    className,
    onKeyDown
}: {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    className?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) => {
    const [displayValue, setDisplayValue] = useState("");
    const [open, setOpen] = useState(false);

    // Convert yyyy-MM-dd to MM/YYYY for display
    useEffect(() => {
        if (value) {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    setDisplayValue(`${month}/${year}`);
                }
            } catch (e) {
                setDisplayValue("");
            }
        } else {
            setDisplayValue("");
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value.replace(/[^0-9]/g, ''); // Remove non-digits

        // Auto-format with slash
        if (input.length >= 2) {
            input = input.slice(0, 2) + '/' + input.slice(2, 6);
        }

        setDisplayValue(input);

        // Parse and validate complete date (MM/YYYY)
        if (input.length === 7) {
            const parts = input.split('/');
            if (parts.length === 2) {
                const month = parseInt(parts[0], 10);
                const year = parseInt(parts[1], 10);

                // Basic validation
                if (month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
                    // Convert to yyyy-MM-dd format (first day of month)
                    const isoDate = `${year}-${String(month).padStart(2, '0')}-01`;
                    onChange(isoDate);
                }
            }
        }
    };

    const date = value ? new Date(value) : undefined;

    const isPast = (monthIdx: number, year: number) => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        if (year < currentYear) return true;
        if (year === currentYear && monthIdx < currentMonth) return true;
        return false;
    };

    return (
        <div className="relative flex items-center gap-1">
            <Input
                type="text"
                placeholder={placeholder}
                className={cn(
                    "h-11 bg-white border-slate-200 rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all text-center font-mono text-sm pr-10",
                    className
                )}
                value={displayValue}
                onChange={handleChange}
                onKeyDown={onKeyDown}
                maxLength={7}
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 h-9 w-9 hover:bg-indigo-50 rounded-md transition-colors"
                    >
                        <CalendarIcon className="h-4 w-4 text-indigo-500" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="w-64 p-3 bg-white rounded-xl shadow-xl border border-slate-100">
                        <div className="space-y-3">
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1">Select Expiry (MM/YYYY)</div>

                            <div className="grid grid-cols-3 gap-1">
                                {months.map((m: string, idx: number) => {
                                    const selectedYear = date ? date.getFullYear() : new Date().getFullYear();
                                    const disabled = isPast(idx, selectedYear);
                                    const isSelected = date && date.getMonth() === idx && date.getFullYear() === selectedYear;

                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            disabled={disabled}
                                            className={cn(
                                                "px-2 py-2 text-xs rounded-lg transition-all ",
                                                isSelected
                                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                                    : disabled
                                                        ? "text-slate-200 cursor-not-allowed"
                                                        : "hover:bg-slate-50 text-slate-600 hover:text-indigo-600"
                                            )}
                                            onClick={() => {
                                                const currentYear = date ? date.getFullYear() : new Date().getFullYear();
                                                const newDate = new Date(currentYear, idx, 1);
                                                onChange(format(newDate, "yyyy-MM-dd"));
                                            }}
                                        >
                                            {m}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="border-t border-slate-100 pt-3">
                                <Select
                                    value={date ? String(date.getFullYear()) : String(new Date().getFullYear())}
                                    onValueChange={(y) => {
                                        const currentMonth = date ? date.getMonth() : new Date().getMonth();
                                        let targetMonth = currentMonth;
                                        if (isPast(currentMonth, Number(y))) {
                                            targetMonth = new Date().getMonth();
                                        }
                                        const newDate = new Date(Number(y), targetMonth, 1);
                                        onChange(format(newDate, "yyyy-MM-dd"));
                                    }}
                                >
                                    <SelectTrigger className="w-full h-10 text-xs bg-slate-50/50 border-slate-200 rounded-lg">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200">
                                        {years.map((y: number) => (
                                            <SelectItem key={y} value={String(y)} className="text-xs rounded-lg focus:bg-indigo-50">
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="button"
                                className="w-full h-10 text-[10px] font-semibold uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-100 transition-all"
                                onClick={() => setOpen(false)}
                            >
                                Confirm Selection
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Supplier } from "../interface";

interface BulkUpdateItem {
    _id: string;
    product: string;
    batch: string;
    qty: number;
    pack: string;
    unitPrice: number;
    expiryDate: string;
    purchasePrice: number;
    sgst_p: number;
    cgst_p: number;
    dis_p: number;
    dis: number;
    schema_free: number;
    schema_amt: number;
    amount: number;
}

interface NewItem extends BulkUpdateItem {
    id: string;
}

interface Props {
    items: BulkUpdateItem[];
    lowStockThreshold: number;
    onSave?: (updates: Record<string, Partial<BulkUpdateItem>>) => Promise<void>;
}

export default function BulkUpdateTable({ items, lowStockThreshold, onSave }: Props) {
    const searchParams = useSearchParams();
    const defaultSupplierId = searchParams.get("supplierId");

    const [newItems, setNewItems] = useState<NewItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>(defaultSupplierId || "");
    const [gstType, setGstType] = useState<"inclusive" | "exclusive">("exclusive");
    const [enableTCS, setEnableTCS] = useState(false);

    // Keyboard navigation handler
    const handleKeyDown = (e: React.KeyboardEvent, rowId: string, fieldName: string, isLastField: boolean = false, newMedicine: boolean = false) => {
        if (e.key === 'Enter' || (newMedicine && e.key === 'Tab' && !e.shiftKey)) {
            e.preventDefault();

            // If it's the last field (schema_free), create a new row
            if (isLastField) {
                addNewRow();
                // Focus the first field of the new row after a short delay
                setTimeout(() => {
                    const allRows = document.querySelectorAll('[data-row-index]');
                    const lastRow = allRows[allRows.length - 1];
                    if (lastRow) {
                        const firstButton = lastRow.querySelector('button[role="combobox"]') as HTMLElement;
                        firstButton?.click(); // Open the product search
                    }
                }, 150);
                return;
            }

            // Move to next field within the current row
            const currentElement = e.target as HTMLElement;
            const currentRow = currentElement.closest('tr');
            if (!currentRow) return;

            // Get all focusable elements in the current row
            const focusableElements = Array.from(
                currentRow.querySelectorAll('input:not([disabled]), button[role="combobox"]:not([disabled])')
            ) as HTMLElement[];

            const currentIndex = focusableElements.indexOf(currentElement);

            if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
                const nextElement = focusableElements[currentIndex + 1];
                nextElement?.focus();
            }
        }
    };

    useEffect(() => {
        if (defaultSupplierId) {
            setSelectedSupplierId(defaultSupplierId);
        }
    }, [defaultSupplierId]);

    const [billDetails, setBillDetails] = useState({
        invoiceNumber: "",
        invoiceDate: "",
        transportCharges: "0",
        paidAmount: "0",
        description: ""
    });

    const handleBillDetailChange = (field: keyof typeof billDetails, value: string) => {
        setBillDetails(prev => ({ ...prev, [field]: value }));
    };

    const addNewRow = () => {
        const newItem: NewItem = {
            id: Date.now().toString(),
            _id: "",
            product: "",
            batch: "",
            qty: 0,
            pack: "",
            unitPrice: 0,
            expiryDate: "",
            purchasePrice: 0,
            sgst_p: 0,
            cgst_p: 0,
            dis_p: 0,
            dis: 0,
            schema_free: 0,
            schema_amt: 0,
            amount: 0,
        };
        setNewItems([...newItems, newItem]);
    };

    const removeNewRow = (id: string) => {
        setNewItems(newItems.filter((item) => item.id !== id));
    };

    const updateNewItem = (id: string, field: keyof NewItem, value: any) => {
        setNewItems(prevItems =>
            prevItems.map((item) => {
                if (item.id === id) {
                    const updated = { ...item, [field]: value };

                    const q = Number(updated.qty) || 0;
                    const r = Number(updated.purchasePrice) || 0;
                    const dp = Number(updated.dis_p) || 0;
                    const sp = Number(updated.sgst_p) || 0;
                    const cp = Number(updated.cgst_p) || 0;
                    const sf = Number(updated.schema_free) || 0;

                    const gross = q * r;
                    const discount = gross * (dp / 100);
                    const taxable = gross - discount;
                    const tax = taxable * ((sp + cp) / 100);

                    // SCHEMA AMT calculation: purchasePrice * SCHEMA (FREE)
                    updated.schema_amt = r * sf;

                    updated.dis = discount;
                    updated.amount = taxable + tax;

                    return updated;
                }
                return item;
            })
        );
    };

    const totals = useMemo(() => {
        return newItems.reduce((acc, item) => {
            const q = Number(item.qty) || 0;
            const r = Number(item.purchasePrice) || 0;
            const dp = Number(item.dis_p) || 0;
            const sp = Number(item.sgst_p) || 0;
            const cp = Number(item.cgst_p) || 0;
            const sam = Number(item.schema_amt) || 0;

            const gross = q * r;
            const discount = gross * (dp / 100);
            const taxable = gross - discount;
            const sgst = taxable * (sp / 100);
            const cgst = taxable * (cp / 100);

            acc.gross += gross;
            acc.discount += discount;
            acc.sgst += sgst;
            acc.cgst += cgst;
            acc.schema_amt += sam;
            acc.total += (taxable + sgst + cgst);
            return acc;
        }, { gross: 0, discount: 0, sgst: 0, cgst: 0, schema_amt: 0, total: Number(billDetails.transportCharges) || 0 });
    }, [newItems, billDetails.transportCharges]);

    const handleSaveChanges = async () => {
        if (!selectedSupplierId) {
            toast.error("Please select a supplier");
            return;
        }
        if (!billDetails.invoiceNumber || !billDetails.invoiceDate) {
            toast.error("Please fill in invoice number and date");
            return;
        }
        if (newItems.length === 0 || !newItems[0]._id) {
            toast.error("Please add at least one item");
            return;
        }

        const paid = Number(billDetails.paidAmount) || 0;
        if (paid > totals.total) {
            toast.error(`Paid amount (₹${paid}) cannot exceed net payable (₹${totals.total.toFixed(2)})`);
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                supplier: selectedSupplierId,
                invoiceNumber: billDetails.invoiceNumber,
                invoiceDate: billDetails.invoiceDate,
                transportCharge: Number(billDetails.transportCharges) || 0,
                paidAmount: Number(billDetails.paidAmount) || 0,
                description: billDetails.description,
                items: newItems.map(item => ({
                    item: item._id,
                    batch: item.batch,
                    quantity: item.qty,
                    pack: item.pack,
                    unitPrice: item.unitPrice,
                    expiryDate: item.expiryDate,
                    free: item.schema_free,
                    purchasePrice: item.purchasePrice,
                    gst: (item.qty * item.purchasePrice - item.dis) * ((item.sgst_p + item.cgst_p) / 100),
                    discount: item.dis,

                })),
                subTotal: totals.gross,
                total: totals.total,
                grossAmount: totals.gross,
                gst: totals.sgst + totals.cgst,
                discount: totals.discount
            };

            await api.post("/purchase_entry", payload);
            toast.success("Purchase entry saved successfully");
            setNewItems([]);
            setBillDetails({
                invoiceNumber: "",
                invoiceDate: "",
                transportCharges: "0",
                paidAmount: "0",
                description: ""
            });
            setSelectedSupplierId("");
        } catch (error: any) {
            console.error("Purchase entry error:", error);
            toast.error(error.response?.data?.message || "Failed to save purchase entry");
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (newItems.length === 0) {
            const initialRows = Array.from({ length: 1 }).map((_, i) => ({
                id: `init-${i}`,
                _id: "",
                product: "",
                hsn: "",
                batch: "",
                qty: 0,
                schm: 0,
                pack: "",
                unitPrice: 0,
                expiryDate: "",
                purchasePrice: 0,
                sgst_p: 0,
                cgst_p: 0,
                dis_p: 0,
                dis: 0,
                schema_free: 0,
                schema_amt: 0,
                amount: 0,
            }));
            setNewItems(initialRows);
        }
    }, []);

    const { data: suppliersData } = useSWR<{ message: string; data: { _id: string; name: string }[] }>("/suppliers/get_id_and_name");
    const suppliers = suppliersData?.data || [];

    return (
        <div className="space-y-6 ">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-7 rounded-xl shadow-sm border border-slate-200"
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
                    <div className="space-y-2">
                        <label className="text-[11px]  text-slate-400 uppercase tracking-widest font-semibold">Supplier*</label>
                        <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                            <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all ">
                                <SelectValue placeholder="Select Supplier" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-slate-200 ">
                                {suppliers.map((s: { _id: string; name: string }) => (
                                    <SelectItem key={s._id} value={s._id} className="rounded-md focus:bg-indigo-50 ">{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px]  text-slate-400 uppercase tracking-widest font-semibold">Invoice Date*</label>
                        <TypableDateInput
                            value={billDetails.invoiceDate}
                            onChange={(date) => handleBillDetailChange("invoiceDate", date)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px]  text-slate-400 uppercase tracking-widest font-semibold">Invoice No*</label>
                        <Input
                            placeholder="Invoice no."
                            className="h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all  "
                            value={billDetails.invoiceNumber}
                            onChange={(e) => handleBillDetailChange("invoiceNumber", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px]  text-slate-400 uppercase tracking-widest font-semibold">Transport Charges</label>
                        <div className="relative ">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm  ">₹</span>
                            <Input
                                placeholder="0.00"
                                className="h-11 bg-slate-50/50 border-slate-200 rounded-lg pl-7 focus:ring-2 focus:ring-indigo-500/20 transition-all  text-slate-700 "
                                value={billDetails.transportCharges}
                                onChange={(e) => handleBillDetailChange("transportCharges", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-10 mt-8 border-t border-slate-100 pt-7 ">
                    <div className="flex items-center gap-10 ">
                        <div className="flex items-center gap-6 ">
                            <label className="flex items-center gap-2 cursor-pointer group ">
                                <div className="relative flex items-center justify-center ">
                                    <input
                                        type="radio"
                                        name="gstType"
                                        checked={gstType === "inclusive"}
                                        onChange={() => setGstType("inclusive")}
                                        className="peer w-5 h-5 opacity-0 absolute z-10 cursor-pointer "
                                    />
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 peer-checked:border-indigo-600 peer-checked:border-[6px] transition-all "></div>
                                </div>
                                <span className="text-sm  text-slate-500 group-hover:text-slate-900 transition-colors font-semibold">GST Inclusive</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group ">
                                <div className="relative flex items-center justify-center ">
                                    <input
                                        type="radio"
                                        name="gstType"
                                        checked={gstType === "exclusive"}
                                        onChange={() => setGstType("exclusive")}
                                        className="peer w-5 h-5 opacity-0 absolute z-10 cursor-pointer "
                                    />
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 peer-checked:border-indigo-600 peer-checked:border-[6px] transition-all "></div>
                                </div>
                                <span className="text-sm  text-slate-500 group-hover:text-slate-900 transition-colors font-semibold">GST Exclusive</span>
                            </label>
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group bg-slate-50/50 px-4 py-2 rounded-full border border-slate-100 hover:border-slate-200 transition-all ">
                        <div className="relative flex items-center justify-center ">
                            <input
                                type="checkbox"
                                checked={enableTCS}
                                onChange={(e) => setEnableTCS(e.target.checked)}
                                className="peer w-5 h-5 opacity-0 absolute z-10 cursor-pointer "
                            />
                            <div className="w-5 h-5 rounded border-2 border-slate-200 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center ">
                                <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity " />
                            </div>
                        </div>
                        <span className="text-xs  text-slate-500 uppercase tracking-wider transition-colors font-semibold">Enable TCS</span>
                    </label>
                </div>
            </motion.div>

            {/* Table Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden"
            >


                <div className="overflow-x-auto relative">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#334155] hover:bg-[#334155] border-none">
                                <TableHead className="w-16 text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider border-r border-slate-600/30">SL NO</TableHead>
                                <TableHead className="min-w-[150px] text-[11px] font-semibold uppercase text-slate-200 py-4 tracking-wider">PRODUCT NAME</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 tracking-wider">BATCH</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider min-w-[85px]">QTY</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider">PACK</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider min-w-[85px]">MRP</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 tracking-wider">EXPIRY</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider min-w-[85px]">Rate</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider">SGST(%)</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider">CGST(%)</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider">DIS(%)</TableHead>
                                {/* <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider">DIS AMT</TableHead> */}
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider">SCHEMA (FREE)</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-center tracking-wider">SCHEMA AMT</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-right pr-8 tracking-wider">TOTAL</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase text-slate-200 py-4 text-right pr-8 tracking-wider">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {newItems.map((item, index) => (
                                    <motion.tr
                                        key={item.id}
                                        data-row-index={index}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="hover:bg-indigo-50/30 transition-colors border-b border-slate-100 group"
                                    >
                                        <TableCell className="text-center text-xs font-semibold text-slate-300 py-4 group-hover:text-indigo-500 transition-colors">
                                            {String(index + 1)}
                                        </TableCell>
                                        <TableCell className="p-2 min-w-[150px] ">
                                            <ItemSearchCell
                                                selectedItemId={item._id}
                                                onSelect={(it) => {
                                                    updateNewItem(item.id, "_id", it._id);
                                                    updateNewItem(item.id, "product", it.name);
                                                    updateNewItem(item.id, "unitPrice", it.unitPrice || 0);
                                                    updateNewItem(item.id, "purchasePrice", it.purchasePrice || 0);
                                                    updateNewItem(item.id, "pack", it.packing || 0);

                                                    // Auto-focus next field (batch input) after selection
                                                    setTimeout(() => {
                                                        const currentRow = document.querySelector(`[data-row-index="${index}"]`);
                                                        if (currentRow) {
                                                            const batchInput = currentRow.querySelector('input[type="text"]') as HTMLInputElement;
                                                            batchInput?.focus();
                                                        }
                                                    }, 100);
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2"><Input className="h-11 text-xs  border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all text-center" value={item.batch} onChange={(e) => updateNewItem(item.id, "batch", e.target.value)} onKeyDown={(e) => handleKeyDown(e, item.id, "batch")} /></TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                className="h-11 text-sm font-semibold border-slate-200 bg-indigo-50/20 rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-center text-indigo-700"
                                                value={item.qty || ""}
                                                onChange={(e) => updateNewItem(item.id, "qty", Number(e.target.value))}
                                                onKeyDown={(e) => handleKeyDown(e, item.id, "qty")}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                className="h-11 text-sm  border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all text-center"
                                                value={item.pack}
                                                onChange={(e) => updateNewItem(item.id, "pack", Number(e.target.value))}
                                                onKeyDown={(e) => handleKeyDown(e, item.id, "pack")}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                className="h-11 text-sm font-semibold border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all text-center text-slate-700"
                                                value={item.unitPrice || ""}
                                                onChange={(e) => updateNewItem(item.id, "unitPrice", Number(e.target.value))}
                                                onKeyDown={(e) => handleKeyDown(e, item.id, "unitPrice")}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <TypableExpiryInput
                                                value={item.expiryDate}
                                                onChange={(date) => updateNewItem(item.id, "expiryDate", date)}
                                                onKeyDown={(e) => handleKeyDown(e, item.id, "expiryDate")}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                className="h-11 text-sm font-semibold border-emerald-200 bg-emerald-50/10 rounded-lg focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all text-center text-emerald-700"
                                                value={item.purchasePrice || ""}
                                                onChange={(e) => updateNewItem(item.id, "purchasePrice", Number(e.target.value))}
                                                onKeyDown={(e) => handleKeyDown(e, item.id, "purchasePrice")}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Select value={String(item.sgst_p)} onValueChange={(v) => updateNewItem(item.id, "sgst_p", Number(v))}>
                                                <SelectTrigger className="h-11 border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all  px-3">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg shadow-xl">
                                                    <SelectItem value="0" className="">0%</SelectItem>
                                                    <SelectItem value="2.5" className="">2.5%</SelectItem>
                                                    <SelectItem value="6" className="">6%</SelectItem>
                                                    <SelectItem value="9" className="">9%</SelectItem>
                                                    <SelectItem value="12" className="">12%</SelectItem>
                                                    <SelectItem value="14" className="">14%</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Select value={String(item.cgst_p)} onValueChange={(v) => updateNewItem(item.id, "cgst_p", Number(v))}>
                                                <SelectTrigger className="h-11 border-slate-200 bg-white rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all  px-3">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg shadow-xl">
                                                    <SelectItem value="0" className="">0%</SelectItem>
                                                    <SelectItem value="2.5" className="">2.5%</SelectItem>
                                                    <SelectItem value="6" className="">6%</SelectItem>
                                                    <SelectItem value="9" className="">9%</SelectItem>
                                                    <SelectItem value="12" className="">12%</SelectItem>
                                                    <SelectItem value="14" className="">14%</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                className="h-11 text-sm font-semibold border-red-100 bg-red-50/10 rounded-lg focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all text-center text-red-600"
                                                value={item.dis_p || ""}
                                                onChange={(e) => updateNewItem(item.id, "dis_p", Number(e.target.value))}
                                                onKeyDown={(e) => handleKeyDown(e, item.id, "dis_p")}
                                            />
                                        </TableCell>

                                        <TableCell className="p-2 text-center">
                                            <Input
                                                type="number"
                                                className="h-11 text-sm font-semibold border-indigo-200 bg-indigo-50/20 rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-center text-indigo-600"
                                                value={item.schema_free || ""}
                                                onChange={(e) => updateNewItem(item.id, "schema_free", Number(e.target.value))}
                                                onKeyDown={(e) => handleKeyDown(e, item.id, "schema_free", true, true)}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2 text-center">
                                            <div className="text-xs font-semibold text-indigo-700 bg-indigo-50/50 h-11 flex items-center justify-center rounded-lg border border-indigo-200/50 shadow-sm border-dashed">
                                                ₹{(item.schema_amt || 0).toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-2 text-right pr-8">
                                            <div className="text-base font-bold text-[#1e293b] group-hover:text-indigo-700 transition-colors drop-shadow-sm">
                                                ₹{(item.amount || 0).toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button onClick={() => removeNewRow(item.id)} variant="ghost" size="icon"><Trash2 className="text-red-500" /></Button>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>

                <div className="p-6 bg-[#f8fafc] border-t border-slate-200 flex items-center justify-between">
                    <Button
                        onClick={addNewRow}
                        variant="outline"
                        className="bg-white text-indigo-600 hover:text-white hover:bg-indigo-600 border-indigo-200 font-semibold text-xs uppercase tracking-widest px-8 h-12 rounded-xl transition-all shadow-sm active:scale-95"
                    >
                        + Add Drug Row
                    </Button>
                    <div className="text-[10px]  text-slate-400 italic">
                        Tip: Tab through fields for faster entry
                    </div>
                </div>
            </motion.div>

            {/* Footer Metrics Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-6 gap-6"
            >
                {[
                    { label: "GROSS AMOUNT", value: totals.gross, color: "text-slate-600" },
                    { label: "TOTAL DISCOUNT", value: totals.discount, color: "text-red-500", prefix: "-" },
                    { label: "SGST PAYABLE", value: totals.sgst, color: "text-slate-600" },
                    { label: "CGST PAYABLE", value: totals.cgst, color: "text-slate-600" },
                    { label: "SCHEMA TOTAL", value: totals.schema_amt, color: "text-indigo-600" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-indigo-200 transition-all">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 -mr-8 -mt-8 rounded-full group-hover:bg-indigo-50 transition-colors" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest relative">{stat.label}</span>
                        <div className={cn("text-xl font-semibold mt-2 relative", stat.color)}>
                            {stat.prefix} ₹{stat.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                ))}
                <div className="bg-[#0a1128] p-5 rounded-xl shadow-xl shadow-blue-900/10 border-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -mr-12 -mt-12 rounded-full rotate-45 group-hover:scale-110 transition-transform duration-700" />
                    <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-widest relative">NET PAYABLE</span>
                    <div className="text-2xl font-bold mt-2 text-white relative">
                        ₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-4 pb-12"
            >
                <div className="lg:col-span-3 space-y-3">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] ml-2">Description</label>
                    <Textarea
                        placeholder="Type additional details about this transaction for records..."
                        className="min-h-[140px] bg-white border-slate-200 rounded-2xl resize-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm text-sm p-5 font-medium leading-relaxed placeholder:text-slate-300 border-2"
                        value={billDetails.description}
                        onChange={(e) => handleBillDetailChange("description", e.target.value)}
                    />
                </div>
                <div className="flex flex-col justify-end h-full gap-4 mt-8 lg:mt-0">

                    <div className="space-y-2 mb-2">
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Paid Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400  text-sm">₹</span>
                            <Input
                                type="number"
                                placeholder="0.00"
                                className="h-14 bg-indigo-50/30 border-2 border-indigo-100/50 rounded-2xl pl-8 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-lg text-indigo-700 placeholder:text-indigo-200"
                                value={billDetails.paidAmount}
                                onChange={(e) => handleBillDetailChange("paidAmount", e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className={cn(
                            "w-full bg-emerald-600 hover:bg-emerald-700 text-white h-16 rounded-2xl text-sm font-semibold uppercase tracking-widest shadow-xl transition-all"
                        )}
                    >

                        {isSaving ? (
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Save className="w-5 h-5" />
                                <span>Complete Purchase</span>
                            </div>
                        )}
                    </Button>

                </div>
            </motion.div>
        </div>
    );
}
