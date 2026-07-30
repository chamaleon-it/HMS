"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";

interface MultiEntryInputProps {
  label: string;
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
  placeholder?: string;
}

export default function MultiEntryInput({
  label,
  items,
  setItems,
  placeholder = "Add item...",
}: MultiEntryInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      setItems((prev) => [...prev, trimmed]);
      setInputValue("");
    }
  };

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
        {label}
      </label>

      {/* Tag/Chip List */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {items.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs group transition-all"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="text-emerald-600 hover:text-red-600 hover:bg-emerald-100 rounded-md p-0.5 transition-colors cursor-pointer"
                title="Remove item"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input + Add Button Row */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100/60 transition-all text-slate-800 placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-40 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </div>
  );
}
