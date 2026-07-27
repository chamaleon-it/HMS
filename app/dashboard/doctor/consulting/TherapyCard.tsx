"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useRef, useState } from "react";
import { DataType } from "./interface";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
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

const DEFAULT_THERAPY_OPTIONS = [
  "Physiotherapy",
  "Rest & Elevation",
  "Ice Pack Therapy",
  "Hot Compression",
  "Bandage / Dressing",
  "Dietary Modification",
  "Adequate Hydration",
  "Exercise & Stretching",
  "Nebulization",
  "Regular Follow-up",
];

const STORAGE_KEY = "therapy_dropdown_values";

interface Props {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
}

export default function TherapyCard({ data, setData }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedTherapies, setSelectedTherapies] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [options, setOptions] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_THERAPY_OPTIONS;
        }
      }
    }
    return DEFAULT_THERAPY_OPTIONS;
  });

  // Persist options to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    }
  }, [options]);

  // Sync selected therapies when data.therapy changes
  useEffect(() => {
    const text = data.therapy || "";
    if (text) {
      const matched = options.filter((opt) => text.includes(opt));
      setSelectedTherapies(matched);
    } else {
      setSelectedTherapies([]);
    }
  }, [data.therapy, options]);

  const updateTherapyData = (updated: string[]) => {
    // Keep any freeform text that isn't part of options list
    const currentNotes = data.therapy || "";
    const lines = currentNotes
      .split("\n")
      .filter((line) => !options.some((o) => line.includes(o)));

    const optionHeader = updated.length > 0 ? updated.join(", ") : "";
    const combined = [optionHeader, ...lines].filter(Boolean).join("\n");

    setData((prev) => ({
      ...prev,
      therapy: combined || null,
    }));
  };

  const handleSelect = (value: string) => {
    const isSelected = selectedTherapies.includes(value);
    const updated = isSelected
      ? selectedTherapies.filter((x) => x !== value)
      : [...selectedTherapies, value];

    setSelectedTherapies(updated);
    updateTherapyData(updated);
  };

  const handleRemoveTag = (value: string) => {
    const updated = selectedTherapies.filter((x) => x !== value);
    setSelectedTherapies(updated);
    updateTherapyData(updated);
  };

  const handleAddCustom = () => {
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    if (!options.includes(trimmed)) {
      setOptions((prev) => [...prev, trimmed]);
    }
    if (!selectedTherapies.includes(trimmed)) {
      const updated = [...selectedTherapies, trimmed];
      setSelectedTherapies(updated);
      updateTherapyData(updated);
    }
    setSearchValue("");
  };

  const handleRemoveOption = (opt: string) => {
    setOptions((prev) => prev.filter((o) => o !== opt));
    if (selectedTherapies.includes(opt)) {
      const updated = selectedTherapies.filter((x) => x !== opt);
      setSelectedTherapies(updated);
      updateTherapyData(updated);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-slate-800">
          Therapy
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Searchable Multi-Select Dropdown */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm transition-colors cursor-pointer",
                "hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400",
                selectedTherapies.length === 0 && "text-slate-400"
              )}
            >
              <span className="truncate">
                {selectedTherapies.length > 0
                  ? `${selectedTherapies.length} ${selectedTherapies.length === 1 ? "therapy" : "therapies"} selected`
                  : "Select therapies..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
            <Command>
              <CommandInput
                ref={inputRef}
                placeholder="Search therapies..."
                value={searchValue}
                onValueChange={setSearchValue}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    searchValue.trim() &&
                    !options.some(
                      (o) =>
                        o.toLowerCase() === searchValue.trim().toLowerCase()
                    )
                  ) {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
              />
              <CommandList>
                <CommandEmpty className="py-3 px-2">
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add &ldquo;{searchValue.trim()}&rdquo;
                  </button>
                </CommandEmpty>
                <CommandGroup>
                  {options.map((opt) => {
                    const isSelected = selectedTherapies.includes(opt);
                    return (
                      <CommandItem
                        key={opt}
                        value={opt}
                        onSelect={() => handleSelect(opt)}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded border transition-colors",
                            isSelected
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-300 bg-white"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <span className="flex-1">{opt}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveOption(opt);
                          }}
                          className="ml-auto opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-red-500 transition p-0.5 cursor-pointer"
                          title="Remove option"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </CommandItem>
                    );
                  })}

                  {/* Show "Add custom" at bottom when search has text but matches exist */}
                  {searchValue.trim() &&
                    !options.some(
                      (o) =>
                        o.toLowerCase() === searchValue.trim().toLowerCase()
                    ) &&
                    options.some((o) =>
                      o.toLowerCase().includes(searchValue.trim().toLowerCase())
                    ) && (
                      <CommandItem
                        value={`__add__${searchValue.trim()}`}
                        onSelect={handleAddCustom}
                        className="cursor-pointer border-t border-slate-100 mt-1 pt-1.5 text-emerald-700"
                      >
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        Add &ldquo;{searchValue.trim()}&rdquo;
                      </CommandItem>
                    )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Selected Tags */}
        {selectedTherapies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedTherapies.map((therapy) => (
              <span
                key={therapy}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-800"
              >
                {therapy}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(therapy)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-emerald-200 transition cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Free Text Area */}
        <div className="relative w-full">
          <textarea
            value={data.therapy || ""}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                therapy: e.target.value || null,
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
