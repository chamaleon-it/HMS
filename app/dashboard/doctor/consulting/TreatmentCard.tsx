"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { DataType } from "./interface";
import { EllipsisVertical, Minus, Pencil, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEFAULT_TREATMENT_CHIPS = [
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

const STORAGE_KEY = "treatment_chips_values";

interface Props {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
}

export default function TreatmentCard({ data, setData }: Props) {
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [editable, setEditable] = useState<boolean>(false);
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [newChipInput, setNewChipInput] = useState<string>("");

  const [chipList, setChipList] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_TREATMENT_CHIPS;
        }
      }
    }
    return DEFAULT_TREATMENT_CHIPS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chipList));
    }
  }, [chipList]);

  // Sync selected chips when data.treatment changes
  useEffect(() => {
    const text = data.treatment || "";
    if (text) {
      const matched = chipList.filter((chip) => text.includes(chip));
      setSelectedTreatments(matched);
    }
  }, [data.treatment, chipList]);

  const handleChipClick = (chip: string) => {
    const isSelected = selectedTreatments.includes(chip);
    const updated = isSelected
      ? selectedTreatments.filter((x) => x !== chip)
      : [...selectedTreatments, chip];

    setSelectedTreatments(updated);

    // Keep any freeform text that isn't part of chip list
    const currentNotes = data.treatment || "";
    const lines = currentNotes
      .split("\n")
      .filter((line) => !chipList.some((c) => line.includes(c)));

    const chipHeader = updated.length > 0 ? updated.join(", ") : "";
    const combined = [chipHeader, ...lines].filter(Boolean).join("\n");

    setData((prev) => ({
      ...prev,
      treatment: combined || null,
    }));
  };

  const handleRemoveChip = (chip: string) => {
    setChipList((prev) => prev.filter((c) => c !== chip));
    if (selectedTreatments.includes(chip)) {
      const updated = selectedTreatments.filter((x) => x !== chip);
      setSelectedTreatments(updated);

      const currentNotes = data.treatment || "";
      const lines = currentNotes
        .split("\n")
        .filter((line) => !chipList.some((c) => line.includes(c)));

      const chipHeader = updated.length > 0 ? updated.join(", ") : "";
      const combined = [chipHeader, ...lines].filter(Boolean).join("\n");

      setData((prev) => ({
        ...prev,
        treatment: combined || null,
      }));
    }
  };

  const handleAddChip = () => {
    if (!newChipInput.trim()) return;
    const trimmed = newChipInput.trim();
    if (!chipList.includes(trimmed)) {
      setChipList((prev) => [...prev, trimmed]);
    }
    setNewChipInput("");
    setAddOpen(false);
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-slate-800">
          Treatment
        </CardTitle>
        <div className="relative z-20 flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 rounded-md hover:bg-slate-100 transition">
              <EllipsisVertical className="h-4 w-4 text-slate-600" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="text-sm cursor-pointer"
                  onClick={() => setEditable((prev) => !prev)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-2" />
                  {editable ? "Done Editing" : "Edit Chips"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chips Row */}
        <div className="flex flex-wrap gap-2 items-center">
          {chipList.map((chip) => {
            const isSelected = selectedTreatments.includes(chip);
            return (
              <div key={chip} className="relative inline-flex group">
                {editable && (
                  <button
                    type="button"
                    className="absolute -right-1 -top-1 grid place-items-center size-4 rounded-full bg-red-500 text-white shadow-xs hover:bg-red-600 z-10 transition cursor-pointer"
                    onClick={() => handleRemoveChip(chip)}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium border select-none transition-all duration-150 cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
                    isSelected
                      ? "bg-emerald-100 border-emerald-300 text-emerald-800 shadow-2xs font-semibold"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-700 hover:bg-emerald-100/70"
                  )}
                >
                  {chip}
                </button>
              </div>
            );
          })}

          {/* Add Treatment Chip Button */}
          {!addOpen ? (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-(--color-synapse-light) to-(--color-synapse-purple) px-3 py-1.5 text-xs font-medium text-white shadow-xs transition hover:from-(--color-synapse-purple) hover:to-(--color-synapse-dark) cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Treatment
            </button>
          ) : (
            <div className="relative inline-flex items-center gap-2">
              <input
                className="h-8 w-48 rounded-full border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="Enter treatment..."
                value={newChipInput}
                onChange={(e) => setNewChipInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChip();
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddChip}
                disabled={!newChipInput.trim()}
                className="inline-flex items-center rounded-full bg-(--color-synapse-light) px-3 py-1 text-xs font-medium text-white hover:bg-(--color-synapse-dark) disabled:opacity-40 cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-700 px-1"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Free Text Area */}
        <div className="relative w-full">
          <textarea
            value={data.treatment || ""}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                treatment: e.target.value || null,
              }))
            }
            placeholder=" "
            style={{ minHeight: 96 }}
            className="peer w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
            Treatment Notes / Details
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
