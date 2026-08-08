import { ChevronDownIcon, Filter, RefreshCcw, Search, X } from "lucide-react";
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
import { fDate } from "@/lib/fDateAndTime";

interface PropsType {
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}

export default function Filters({ filter, setFilter }: PropsType) {
  const [openCalander, setOpenCalander] = useState(false);

  return (
    <div
      className={
        "rounded-2xl border border-slate-200 p-4 shadow-sm supports-backdrop-filter:bg-white/80 supports-backdrop-filter:backdrop-blur dark:border-slate-800 dark:supports-backdrop-filter:bg-slate-900/70 bg-white dark:bg-slate-900"
      }
    >
      <div className="grid grid-cols-12 items-center gap-3">
        {/* Search Input */}
        <div className="col-span-12 md:col-span-4">
          <div className="relative flex items-center gap-2">
            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
            <input
              value={filter.q ?? ""}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, q: e.target.value }))
              }
              placeholder="Search patient, invoice, MRN, phone..."
              className={
                "h-10 w-full rounded-xl border border-slate-200 bg-white/70 pl-9 pr-8 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-900/50"
              }
            />
            {filter.q && (
              <button
                type="button"
                onClick={() => setFilter((prev) => ({ ...prev, q: null }))}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div className="col-span-6 md:col-span-2 flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <Select
            value={filter.status || "all"}
            onValueChange={(value) =>
              setFilter((prev) => ({ ...prev, status: value === "all" ? "" : value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Method Filter */}
        <div className="col-span-6 md:col-span-2">
          <Select
            value={filter.method || "all"}
            onValueChange={(value) =>
              setFilter((prev) => ({ ...prev, method: value === "all" ? "" : value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Payment Method</SelectLabel>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Date Filter */}
        <div className="col-span-6 md:col-span-3 flex items-center gap-1.5">
          <Popover onOpenChange={setOpenCalander} open={openCalander}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-full justify-between font-normal text-slate-700 bg-white"
              >
                <span className="truncate">
                  {filter.date ? fDate(filter.date) : "Select Date"}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-slate-400 ml-1 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={filter.date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  setFilter((prev) => ({ ...prev, date }));
                  setOpenCalander(false);
                }}
              />
            </PopoverContent>
          </Popover>

          {filter.date && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-slate-400 hover:text-slate-600"
              onClick={() => setFilter((prev) => ({ ...prev, date: undefined }))}
              title="Clear date"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Reset Button */}
        <div className="col-span-6 md:col-span-1 flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-10 font-medium"
            onClick={() => {
              setFilter({ q: null, status: "", method: "", date: undefined });
            }}
          >
            <RefreshCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
