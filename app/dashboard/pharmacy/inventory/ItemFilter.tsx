import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FilterType } from "./interface";
import useSWR from "swr";
import { Search, LayoutGrid, Truck, Package, Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Props {
  setFilter: Dispatch<SetStateAction<FilterType>>;
  filter: FilterType;
}

export default function ItemFilter({ filter, setFilter }: Props) {
  const { data: suppliersResponse } = useSWR("/pharmacy/items/suppliers");

  const suppliers: string[] = suppliersResponse?.data || [];

  const [search, setSearch] = useState(filter.q || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilter((prev) => ({ ...prev, q: search || undefined, page: 1 }));
    }, 500);

    return () => clearTimeout(handler);
  }, [search, setFilter]);

  const handleReset = () => {
    setSearch("");
    setFilter((prev) => ({
      ...prev,
      q: undefined,
      category: undefined,
      supplier: undefined,
      stock: undefined,
      expiry: undefined,
      page: 1,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-7 rounded-xl shadow-sm border border-slate-200"
    >
      <div className="flex flex-wrap items-end gap-6">
        {/* Search */}
        <div className="space-y-2 flex-1 min-w-[240px]">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Search Items
          </label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              placeholder="Name, SKU, or Barcode..."
              className="pl-9 h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2 min-w-[160px]">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Category
          </label>
          <Select
            value={filter.category || "all"}
            onValueChange={(v) =>
              setFilter((prev) => ({
                ...prev,
                category: v === "all" ? undefined : v,
                page: 1,
              }))
            }
          >
            <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-slate-400" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-lg border-slate-200 shadow-xl">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Medicine">Medicine</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Consumables">Consumables</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Supplier */}
        <div className="space-y-2 min-w-[180px]">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Supplier
          </label>
          <Select
            value={filter.supplier || "all"}
            onValueChange={(v) =>
              setFilter((prev) => ({
                ...prev,
                supplier: v === "all" ? undefined : v,
                page: 1,
              }))
            }
          >
            <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-slate-400" />
                <SelectValue placeholder="Supplier" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-lg border-slate-200 shadow-xl max-h-[300px]">
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stock Status */}
        <div className="space-y-2 min-w-[160px]">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Stock Status
          </label>
          <Select
            value={filter.stock || "all"}
            onValueChange={(v) =>
              setFilter((prev) => ({
                ...prev,
                stock: v === "all" ? undefined : v,
                page: 1,
              }))
            }
          >
            <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-400" />
                <SelectValue placeholder="Stock Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-lg border-slate-200 shadow-xl">
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="Instock">In Stock</SelectItem>
              <SelectItem value="Low">Low Stock</SelectItem>
              <SelectItem value="Out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expiry */}
        <div className="space-y-2 min-w-[160px]">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Expiry Filter
          </label>
          <Select
            value={filter.expiry?.toString() || "all"}
            onValueChange={(v) =>
              setFilter((prev) => ({
                ...prev,
                expiry: v === "all" ? undefined : Number(v),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <SelectValue placeholder="Expiry" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-lg border-slate-200 shadow-xl">
              <SelectItem value="all">All Expiry</SelectItem>
              <SelectItem value="30">Within 30 days</SelectItem>
              <SelectItem value="60">Within 60 days</SelectItem>
              <SelectItem value="90">Within 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <div className="flex-none ml-auto">
          <Button
            onClick={handleReset}
            variant="outline"
            className="h-11 px-6 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
