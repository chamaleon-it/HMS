"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useMemo, useRef, useState } from "react";
import { DataType } from "./interface";
import { Check, ChevronsUpDown, X, Layers, Stethoscope } from "lucide-react";
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

export interface SubProcedureOption {
  _id: string;
  name: string;
  price: number;
  code?: string;
  description?: string;
  status: string;
  isDeleted?: boolean;
}

export interface ProcedureOption {
  _id: string;
  name: string;
  price?: number;
  code?: string;
  description?: string;
  hasSubProcedures?: boolean;
  subProcedures?: SubProcedureOption[];
  status: string;
}

export interface FlatProcedureOption {
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

export default function ProcedureCard({ data, setData, className }: Props) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch Procedures from Database
  const { data: procedureData, isLoading } = useSWR<{
    message: string;
    data: ProcedureOption[];
  }>("/procedure", {
    revalidateOnFocus: false,
  });

  const availableProcedures = useMemo(() => {
    return (procedureData?.data || []).filter(
      (item) => item.status === "Active"
    );
  }, [procedureData]);

  // Flatten active standalone procedures and sub-procedures into searchable selectable options
  const flatOptions = useMemo<FlatProcedureOption[]>(() => {
    const list: FlatProcedureOption[] = [];

    availableProcedures.forEach((p) => {
      const hasSubs =
        p.hasSubProcedures &&
        p.subProcedures &&
        p.subProcedures.length > 0;

      if (hasSubs) {
        (p.subProcedures || []).forEach((sp) => {
          if (sp.status === "Active" && !sp.isDeleted) {
            list.push({
              id: sp._id,
              name: sp.name,
              displayName: `${p.name} → ${sp.name}`,
              parentName: p.name,
              parentId: p._id,
              price: sp.price || 0,
              code: sp.code || p.code || null,
              isSub: true,
            });
          }
        });
      } else {
        list.push({
          id: p._id,
          name: p.name,
          displayName: p.name,
          parentName: null,
          parentId: null,
          price: p.price || 0,
          code: p.code || null,
          isSub: false,
        });
      }
    });

    return list;
  }, [availableProcedures]);

  // Parse selectedProcedureIds from data.procedure
  const getSelectedIds = (): string[] => {
    if (!data.procedure) return [];
    if (Array.isArray(data.procedure)) {
      return data.procedure
        .map((item: any) => {
          if (typeof item === "object" && item !== null) {
            return item.subProcedureId || item.procedureId || item._id || "";
          }
          return String(item);
        })
        .filter(Boolean);
    }
    if (typeof data.procedure === "string") {
      return data.procedure
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const selectedIds = getSelectedIds();

  // Calculate Total Price of selected procedures
  const totalPrice = selectedIds.reduce((sum, id) => {
    const matched = flatOptions.find((opt) => opt.id === id);
    return sum + (matched?.price || 0);
  }, 0);

  const updateProcedureData = (updatedIds: string[]) => {
    // Build structured procedure objects for the consultation state
    const structured = updatedIds.map((id) => {
      const matched = flatOptions.find((opt) => opt.id === id);
      if (matched) {
        return {
          procedureId: matched.parentId || matched.id,
          subProcedureId: matched.isSub ? matched.id : null,
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
      procedure: structured,
    }));
  };

  const handleSelect = (optionId: string) => {
    const isSelected = selectedIds.includes(optionId);
    const updated = isSelected
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId];

    updateProcedureData(updated);
  };

  const handleRemoveTag = (optionId: string) => {
    const updated = selectedIds.filter((id) => id !== optionId);
    updateProcedureData(updated);
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
          <Stethoscope className="h-4 w-4 text-blue-600" />
          Procedure
        </CardTitle>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-xs font-bold shadow-2xs">
            <span>Total Price:</span>
            <span className="text-blue-700 text-sm">{formatINR(totalPrice)}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Searchable Multi-Select Dropdown from Database Procedures */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm transition-colors cursor-pointer",
                "hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400",
                selectedIds.length === 0 && "text-slate-400"
              )}
            >
              <span className="truncate">
                {selectedIds.length > 0
                  ? `${selectedIds.length} ${
                      selectedIds.length === 1 ? "procedure" : "procedures"
                    } selected`
                  : "Select procedures (e.g. pr1, pr3.1)..."}
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
                placeholder="Search procedures or sub-procedures..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList className="max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    Loading procedures...
                  </div>
                ) : availableProcedures.length === 0 ? (
                  <CommandEmpty className="py-4 text-center text-xs text-slate-400">
                    No active procedures found in database.
                  </CommandEmpty>
                ) : (
                  <>
                    {availableProcedures.map((proc, index) => {
                      const hasSubs =
                        proc.hasSubProcedures &&
                        proc.subProcedures &&
                        proc.subProcedures.length > 0;

                      if (!hasSubs) {
                        // Standalone Procedure
                        const isSelected = selectedIds.includes(proc._id);
                        return (
                          <CommandGroup key={proc._id}>
                            <CommandItem
                              value={`${proc.name} ${proc.code || ""}`}
                              onSelect={() => handleSelect(proc._id)}
                              className="cursor-pointer flex items-center justify-between py-2"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                                    isSelected
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : "border-slate-300 bg-white"
                                  )}
                                >
                                  {isSelected && <Check className="h-3 w-3" />}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-slate-800 text-sm">
                                    {proc.name}
                                  </span>
                                  {proc.code && (
                                    <span className="text-[10px] text-slate-400">
                                      {proc.code}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="font-bold text-xs text-blue-700">
                                {formatINR(proc.price || 0)}
                              </span>
                            </CommandItem>
                          </CommandGroup>
                        );
                      }

                      // Parent Procedure with Sub-Procedures
                      const activeSubs = (proc.subProcedures || []).filter(
                        (s) => s.status === "Active" && !s.isDeleted
                      );

                      if (activeSubs.length === 0) return null;

                      return (
                        <React.Fragment key={proc._id}>
                          {index > 0 && <CommandSeparator className="my-1" />}
                          <CommandGroup
                            heading={
                              <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-700 uppercase tracking-wider py-1">
                                <Layers className="h-3.5 w-3.5" />
                                <span>{proc.name}</span>
                                <span className="text-[10px] text-slate-400 font-normal lowercase">
                                  ({activeSubs.length} sub-procedures)
                                </span>
                              </div>
                            }
                          >
                            {activeSubs.map((sub) => {
                              const isSelected = selectedIds.includes(sub._id);
                              return (
                                <CommandItem
                                  key={sub._id}
                                  value={`${proc.name} ${sub.name} ${
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
                                          ? "border-blue-600 bg-blue-600 text-white"
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
                                  <span className="font-bold text-xs text-indigo-700">
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
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-800 shadow-2xs"
                >
                  <span>{displayName}</span>
                  {displayPrice && (
                    <span className="text-blue-600 text-[11px]">
                      ({displayPrice})
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(id)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-blue-200/60 transition cursor-pointer text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Multi-Session Procedure Schedule Picker */}
        {selectedIds.length > 0 && (
          <TreatmentSchedulePicker
            label="Procedure Schedule"
            dates={data.procedureDates || [new Date().toISOString().split("T")[0]]}
            onChange={(dates) =>
              setData((prev) => ({
                ...prev,
                procedureDates: dates,
              }))
            }
          />
        )}

        {/* Procedure Notes Area */}
        <div className="relative w-full">
          <textarea
            value={data.procedureNotes || ""}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                procedureNotes: e.target.value || null,
              }))
            }
            placeholder=" "
            style={{ minHeight: 96 }}
            className="peer w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600">
            Procedure Notes / Instructions
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
