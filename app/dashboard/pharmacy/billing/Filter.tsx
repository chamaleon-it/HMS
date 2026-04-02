import { ChevronDownIcon, RefreshCcw, Search, Filter as FilterIcon } from "lucide-react";
import React, { useState } from "react";
import { FilterType } from "./page";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import DateFilter from "../DateFilter";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

interface PropsType {
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}

export default function Filters({ filter, setFilter }: PropsType) {
  const [openCalander, setOpenCalander] = useState(false);

  const handleReset = () => {
    setFilter({ q: null, qEnd: null, status: "all", method: "all", activeDate: "Today", date: undefined, page: 1, limit: 10 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-3 rounded-xl shadow-sm border border-slate-200"
    >
      <div className="flex flex-wrap items-end gap-6">
        {/* Search */}
        <div className="space-y-2 flex-1 min-w-[280px]">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Search Invoice Range
          </label>
          <div className="flex gap-2">
            <div className="relative group flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                value={filter.q ?? ""}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, q: e.target.value, page: 1 }))
                }
                placeholder="From..."
                className="pl-9 h-10 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="relative group flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                value={filter.qEnd ?? ""}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, qEnd: e.target.value, page: 1 }))
                }
                placeholder="To..."
                className="pl-9 h-10 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Method */}
        <div className="space-y-2 min-w-[180px]">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Payment Method
          </label>
          <div className="flex items-center gap-2">
            <Select
              value={filter.method}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, method: value, page: 1 }))
              }
            >
              <SelectTrigger className="h-10! bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 transition-all">
                <div className="flex items-center gap-2">
                  <FilterIcon className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Select method" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-lg border-slate-200 shadow-xl">
                <SelectGroup>
                  <SelectLabel className="text-[10px] uppercase tracking-wider text-slate-400">Method</SelectLabel>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Filter */}
        <div className="space-y-2 min-w-[180px]">
          <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
            Date Filter
          </label>
          <div className="block">
            <DateFilter
              activeDate={filter.activeDate}
              setActiveDate={(activeDate) => setFilter((prev) => ({ ...prev, activeDate, page: 1 }))}
              date={filter.date}
              setDate={(date) => setFilter((prev) => ({ ...prev, date, page: 1 }))}
            />
          </div>
        </div>

        {/* Reset Button */}
        <div className="ml-auto">
          <Button
            variant="outline"
            className="h-10 px-7! border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-sm"
            onClick={handleReset}
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
