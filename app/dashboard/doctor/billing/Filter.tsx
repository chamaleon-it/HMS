import { ChevronDown, ChevronDownIcon, Filter, RefreshCcw, Search } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { fDate } from "@/lib/fDateAndTime";

interface PropsType {
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}

export default function Filters({ filter, setFilter }: PropsType) {

  const [openCalander, setOpenCalander] = useState(false)
  return (
    <div
      className={
        "rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900"
      }
    >
      <div className="grid grid-cols-12 items-center gap-3">
        <div className="col-span-12 md:col-span-5">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={filter.q ?? ""}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, q: e.target.value }))
              }
              placeholder="Search invoice no."
              className={
                "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
              }
            />
          </div>
        </div>
        <div className="col-span-6 md:col-span-2 flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />

          <Select
            value={filter.status}
            onValueChange={(value) =>
              setFilter((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-6 md:col-span-2">
          <Select
            value={filter.method}
            onValueChange={(value) =>
              setFilter((prev) => ({ ...prev, method: value }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a method" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Method</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-3 col-span-6 md:col-span-2">
      
      <Popover onOpenChange={setOpenCalander} open={openCalander}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            {filter.date ? fDate(filter.date) : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={filter.date}
            captionLayout="dropdown"
            onSelect={(date) => {
              setFilter(prev=>({...prev,date}))
              setOpenCalander(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
        <div className="col-span-12 md:col-span-1 flex items-center">
          <button
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
            onClick={() => {
              setFilter({ q: null, status: "", method: "",date:undefined });
            }}
          >
            <RefreshCcw className="mr-2 inline h-4 w-4" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
