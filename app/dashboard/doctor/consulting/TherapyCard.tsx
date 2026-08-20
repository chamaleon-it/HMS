"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useMemo, useRef, useState } from "react";
import { DataType } from "./interface";
import { Check, ChevronsUpDown, X, Layers, Activity } from "lucide-react";
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
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TreatmentSchedulePicker from "@/components/shared/treatment/TreatmentSchedulePicker";

export interface SubTherapyOption {
  _id: string;
  name: string;
  price: number;
  code?: string;
  description?: string;
  status: string;
  isDeleted?: boolean;
}

export interface TherapyOption {
  _id: string;
  name: string;
  price?: number;
  code?: string;
  description?: string;
  hasSubTherapies?: boolean;
  subTherapies?: SubTherapyOption[];
  status: string;
}

export interface FlatTherapyOption {
  id: string;
  name: string;
  displayName: string;
  parentName?: string | null;
  parentId?: string | null;
  price: number;
  code?: string | null;
  isSub: boolean;
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

  const availableTherapies = useMemo(() => {
    return (therapyData?.data || []).filter(
      (item) => item.status === "Active"
    );
  }, [therapyData]);

  // Flatten active standalone therapies and sub-therapies into searchable selectable options
  const flatOptions = useMemo<FlatTherapyOption[]>(() => {
    const list: FlatTherapyOption[] = [];

    availableTherapies.forEach((t) => {
      const hasSubs =
        t.hasSubTherapies &&
        t.subTherapies &&
        t.subTherapies.length > 0;

      if (hasSubs) {
        (t.subTherapies || []).forEach((st) => {
          if (st.status === "Active" && !st.isDeleted) {
            list.push({
              id: st._id,
              name: st.name,
              displayName: `${t.name} → ${st.name}`,
              parentName: t.name,
              parentId: t._id,
              price: st.price || 0,
              code: st.code || t.code || null,
              isSub: true,
            });
          }
        });
      } else {
        list.push({
          id: t._id,
          name: t.name,
          displayName: t.name,
          parentName: null,
          parentId: null,
          price: t.price || 0,
          code: t.code || null,
          isSub: false,
        });
      }
    });

    return list;
  }, [availableTherapies]);

  // Parse selectedTherapyIds from data.therapy
  const getSelectedIds = (): string[] => {
    if (!data.therapy) return [];
    if (Array.isArray(data.therapy)) {
      return data.therapy
        .map((item: any) => {
          if (typeof item === "object" && item !== null) {
            return item.subTherapyId || item.therapyId || item._id || "";
          }
          return String(item);
        })
        .filter(Boolean);
    }
    if (typeof data.therapy === "string") {
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
    const matched = flatOptions.find((opt) => opt.id === id);
    return sum + (matched?.price || 0);
  }, 0);

  const updateTherapyData = (updatedIds: string[]) => {
    // Build structured therapy objects for the consultation state
    const structured = updatedIds.map((id) => {
      const matched = flatOptions.find((opt) => opt.id === id);
      if (matched) {
        return {
          therapyId: matched.parentId || matched.id,
          subTherapyId: matched.isSub ? matched.id : null,
          name: matched.name,
          parentName: matched.parentName || null,
          price: matched.price,
          code: matched.code || null,
        };
      }
      return id;
    });

    setData((prev) => ({
      ...prev,
      therapy: structured,
    }));
  };

  const handleSelect = (optionId: string) => {
    const isSelected = selectedIds.includes(optionId);
    const updated = isSelected
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId];

    updateTherapyData(updated);
  };

  const handleRemoveTag = (optionId: string) => {
    const updated = selectedIds.filter((id) => id !== optionId);
    updateTherapyData(updated);
  };

  return (
    <Card
      className={cn(
        "border-slate-200 shadow-xs flex flex-col justify-start",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-600" />
          Therapy
        </CardTitle>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold shadow-2xs">
            <span>Total Price:</span>
            <span className="text-emerald-700 text-sm">
              {formatINR(totalPrice)}
            </span>
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
                  : "Select therapies or sub-therapies..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-(--radix-popover-trigger-width) p-0 max-h-80 overflow-hidden"
            align="start"
          >
            <Command>
              <CommandInput
                ref={inputRef}
                placeholder="Search therapies or sub-therapies..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList className="max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    Loading therapies...
                  </div>
                ) : availableTherapies.length === 0 ? (
                  <CommandEmpty className="py-4 text-center text-xs text-slate-400">
                    No active therapies found in database.
                  </CommandEmpty>
                ) : (
                  <>
                    {availableTherapies.map((thr, index) => {
                      const hasSubs =
                        thr.hasSubTherapies &&
                        thr.subTherapies &&
                        thr.subTherapies.length > 0;

                      if (!hasSubs) {
                        // Standalone Therapy
                        const isSelected = selectedIds.includes(thr._id);
                        return (
                          <CommandGroup key={thr._id}>
                            <CommandItem
                              value={`${thr.name} ${thr.code || ""}`}
                              onSelect={() => handleSelect(thr._id)}
                              className="cursor-pointer flex items-center justify-between py-2"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                                    isSelected
                                      ? "border-emerald-600 bg-emerald-600 text-white"
                                      : "border-slate-300 bg-white"
                                  )}
                                >
                                  {isSelected && <Check className="h-3 w-3" />}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-slate-800 text-sm">
                                    {thr.name}
                                  </span>
                                  {thr.code && (
                                    <span className="text-[10px] text-slate-400">
                                      {thr.code}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="font-bold text-xs text-emerald-700">
                                {formatINR(thr.price || 0)}
                              </span>
                            </CommandItem>
                          </CommandGroup>
                        );
                      }

                      // Parent Therapy with Sub-Therapies
                      const activeSubs = (thr.subTherapies || []).filter(
                        (s) => s.status === "Active" && !s.isDeleted
                      );

                      if (activeSubs.length === 0) return null;

                      return (
                        <React.Fragment key={thr._id}>
                          {index > 0 && <CommandSeparator className="my-1" />}
                          <CommandGroup
                            heading={
                              <div className="flex items-center gap-1.5 font-bold text-xs text-teal-700 uppercase tracking-wider py-1">
                                <Layers className="h-3.5 w-3.5" />
                                <span>{thr.name}</span>
                                <span className="text-[10px] text-slate-400 font-normal lowercase">
                                  ({activeSubs.length} sub-therapies)
                                </span>
                              </div>
                            }
                          >
                            {activeSubs.map((sub) => {
                              const isSelected = selectedIds.includes(sub._id);
                              return (
                                <CommandItem
                                  key={sub._id}
                                  value={`${thr.name} ${sub.name} ${
                                    sub.code || ""
                                  }`}
                                  onSelect={() => handleSelect(sub._id)}
                                  className="cursor-pointer flex items-center justify-between py-2 pl-6"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                                        isSelected
                                          ? "border-emerald-600 bg-emerald-600 text-white"
                                          : "border-slate-300 bg-white"
                                      )}
                                    >
                                      {isSelected && (
                                        <Check className="h-3 w-3" />
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-medium text-slate-800 text-sm">
                                        {sub.name}
                                      </span>
                                      {sub.code && (
                                        <span className="text-[10px] text-slate-400">
                                          {sub.code}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="font-bold text-xs text-teal-700">
                                    {formatINR(sub.price)}
                                  </span>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </React.Fragment>
                      );
                    })}
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Selected Tags */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedIds.map((id) => {
              const matched = flatOptions.find((opt) => opt.id === id);
              const displayName = matched ? matched.displayName : id;
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

        {/* Multi-Session Therapy Schedule Picker */}
        {selectedIds.length > 0 && (
          <TreatmentSchedulePicker
            label="Therapy Schedule"
            dates={data.therapyDates || [new Date().toISOString().split("T")[0]]}
            onChange={(dates) =>
              setData((prev) => ({
                ...prev,
                therapyDates: dates,
              }))
            }
          />
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
            Therapy Notes / Instructions
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
