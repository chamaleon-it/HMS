"use client";

import React, { useState } from "react";
import { Minus, Plus, X } from "lucide-react";

interface BubbleButtonGroupProps {
  options: string[];
  setOptions: React.Dispatch<React.SetStateAction<string[]>>;
  selectedValues: string[];
  setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>;
  addButtonText?: string;
  addPlaceholder?: string;
  pillClass: (active: boolean) => string;
  isEditing?: boolean;
}

export default function BubbleButtonGroup({
  options,
  setOptions,
  selectedValues,
  setSelectedValues,
  addButtonText = "Add Item",
  addPlaceholder = "Add new...",
  pillClass,
  isEditing = false,
}: BubbleButtonGroupProps) {
  const [addValueOpen, setAddValueOpen] = useState(false);
  const [newValue, setNewValue] = useState("");

  const toggleArrayItem = (item: string) => {
    setSelectedValues((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleRemove = (item: string) => {
    setOptions((prev) => prev.filter((x) => x !== item));
    setSelectedValues((prev) => prev.filter((x) => x !== item));
  };

  const handleAdd = () => {
    const trimmed = newValue.trim();
    if (trimmed) {
      if (!options.includes(trimmed)) {
        setOptions((prev) => [...prev, trimmed]);
      }
      setNewValue("");
      setAddValueOpen(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((item) => {
        const active = selectedValues.includes(item);
        return (
          <div key={item} className="relative inline-flex group items-center">
            {isEditing && (
              <button
                type="button"
                className="absolute -right-1.5 -top-1.5 grid place-items-center size-4 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 focus:outline-none z-10 cursor-pointer transition-transform hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item);
                }}
                title="Delete option"
              >
                <Minus className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => toggleArrayItem(item)}
              className={pillClass(active)}
            >
              {item}
            </button>
          </div>
        );
      })}

      {addValueOpen ? (
        <div className="relative inline-flex items-center gap-1.5">
          <input
            type="text"
            autoFocus
            className="h-8 w-44 rounded-xl border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            placeholder={addPlaceholder}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              } else if (e.key === "Escape") {
                setAddValueOpen(false);
                setNewValue("");
              }
            }}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newValue.trim()}
            className="inline-flex items-center h-8 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-40 transition-colors cursor-pointer"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setAddValueOpen(false);
              setNewValue("");
            }}
            className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddValueOpen(true)}
          className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> {addButtonText}
        </button>
      )}
    </div>
  );
}
