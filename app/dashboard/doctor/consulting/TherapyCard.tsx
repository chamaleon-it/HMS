"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useRef, useState } from "react";
import { DataType } from "./interface";
import { Check, ChevronsUpDown, X, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { formatINR } from "@/lib/fNumber";
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

export interface TherapyOption {
  _id: string;
  name: string;
  price: number;
  code?: string;
  description?: string;
  status: string;
}

interface Props {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
  className?: string;
}

export default function TherapyCard({ data, setData, className }: Props) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch Therapies from Database
  const { data: therapyData, isLoading } = useSWR<{
    message: string;
    data: TherapyOption[];
  }>("/therapy", {
    revalidateOnFocus: false,
  });

  const availableTherapies = (therapyData?.data || []).filter(
    (item) => item.status === "Active"
  );

  // Parse selectedTherapyIds from data.therapy
  const getSelectedIds = (): string[] => {
    if (!data.therapy) return [];
    if (Array.isArray(data.therapy)) {
      return data.therapy.map((item: any) =>
        typeof item === "object" && item?._id ? item._id : String(item)
      );
    }
    if (typeof data.therapy === "string") {
      // If it's a comma separated string or single ID
      return data.therapy
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const selectedIds = getSelectedIds();

  // Calculate Total Price of selected therapies
  const totalPrice = selectedIds.reduce((sum, id) => {
    const matched = availableTherapies.find((t) => t._id === id);
    return sum + (matched?.price || 0);
  }, 0);

  const updateTherapyData = (updatedIds: string[]) => {
    setData((prev) => ({
      ...prev,
      therapy: updatedIds,
    }));
  };

  const handleSelect = (therapyId: string) => {
    const isSelected = selectedIds.includes(therapyId);
    const updated = isSelected
      ? selectedIds.filter((id) => id !== therapyId)
      : [...selectedIds, therapyId];

    updateTherapyData(updated);
  };

  const handleRemoveTag = (therapyId: string) => {
    const updated = selectedIds.filter((id) => id !== therapyId);
    updateTherapyData(updated);
  };

  return (
    <Card className={cn("border-slate-200 shadow-xs flex flex-col justify-between h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-600" />
          Therapy
        </CardTitle>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold shadow-2xs">
            <span>Total Price:</span>
            <span className="text-emerald-700 text-sm">{formatINR(totalPrice)}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Searchable Multi-Select Dropdown from Database Therapies */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm transition-colors cursor-pointer",
                "hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400",
                selectedIds.length === 0 && "text-slate-400"
              )}
            >
              <span className="truncate">
                {selectedIds.length > 0
                  ? `${selectedIds.length} ${
                      selectedIds.length === 1 ? "therapy" : "therapies"
                    } selected`
                  : "Select therapies..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-(--radix-popover-trigger-width) p-0"
            align="start"
          >
            <Command>
              <CommandInput
                ref={inputRef}
                placeholder="Search database therapies..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                {isLoading ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    Loading therapies...
                  </div>
                ) : availableTherapies.length === 0 ? (
                  <CommandEmpty className="py-4 text-center text-xs text-slate-400">
                    No active therapies found in database.
                  </CommandEmpty>
                ) : (
                  <CommandGroup>
                    {availableTherapies.map((item) => {
                      const isSelected = selectedIds.includes(item._id);
                      return (
                        <CommandItem
                          key={item._id}
                          value={`${item.name} ${item.code || ""}`}
                          onSelect={() => handleSelect(item._id)}
                          className="cursor-pointer flex items-center justify-between py-2"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                                isSelected
                                  ? "border-(--color-synapse-light) bg-(--color-synapse-light) text-white"
                                  : "border-slate-300 bg-white"
                              )}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-800 text-sm">
                                {item.name}
                              </span>
                              {item.code && (
                                <span className="text-[10px] text-slate-400">
                                  {item.code}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-bold text-xs text-emerald-700">
                            {formatINR(item.price)}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Selected Tags */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedIds.map((id) => {
              const matched = availableTherapies.find((t) => t._id === id);
              const displayName = matched ? matched.name : id;
              const displayPrice = matched ? formatINR(matched.price) : "";

              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-2xs"
                >
                  <span>{displayName}</span>
                  {displayPrice && (
                    <span className="text-emerald-600 text-[11px]">
                      ({displayPrice})
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(id)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-emerald-200/60 transition cursor-pointer text-emerald-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Therapy Notes Area */}
        <div className="relative w-full">
          <textarea
            value={data.therapyNotes || ""}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                therapyNotes: e.target.value || null,
              }))
            }
            placeholder=" "
            style={{ minHeight: 96 }}
            className="peer w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
            Therapy Notes / Details
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
