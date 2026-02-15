import { ChevronDownIcon, Filter as FilterIcon, RefreshCcw, Search } from "lucide-react";
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
        <div className="col-span-12 md:col-span-5">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={filter.q ?? ""}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, q: e.target.value, page: 1 }))
              }
              placeholder="Search invoice no"
              className={
                "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
              }
            />
          </div>
        </div>

        <div className="col-span-6 md:col-span-3">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4 text-slate-500" />
            <Select
              value={filter.method}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, method: value, page: 1 }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a method" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Method</SelectLabel>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="col-span-6 md:col-span-3">
          <Popover onOpenChange={setOpenCalander} open={openCalander}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-full justify-between font-normal"
              >
                {filter.date ? fDate(filter.date) : "Select date"}
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={filter.date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  setFilter((prev) => ({ ...prev, date, page: 1 }));
                  setOpenCalander(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="col-span-12 md:col-span-1 flex items-center">
          <Button
            variant={"outline"}
            size={"sm"}
            className="w-full gap-2"
            onClick={() => {
              setFilter({ q: null, status: "all", method: "all", date: undefined, page: 1, limit: 10 });
            }}
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
