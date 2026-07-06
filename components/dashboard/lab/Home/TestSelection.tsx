import React, { useMemo, useRef, useState } from "react";

export type TestOption = {
    label: string;
    value: string;
    type?: string;
    department?: string;
};

type TestSelectionProps = {
    onSelect?: (v: string) => void;
    options: TestOption[];
};

export default function TestSelection({
    onSelect,
    options
}: TestSelectionProps) {


    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const handleChange = (raw: string) => {
        const v = raw;
        setText(v);
        setOpen(true);
    };

    const commit = (val: string) => {
        setText("");
        if (onSelect) onSelect(val);
        setOpen(false);
        setFocusedIndex(-1);
    };


    const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(text.toLowerCase()))
    const listboxRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open && e.key !== 'Escape') {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                setOpen(true);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setFocusedIndex((prevIndex) =>
                    prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : prevIndex
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setFocusedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
                break;
            case "Enter":
                e.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
                    commit(filteredOptions[focusedIndex].value);
                } else {
                    // Utility: if text exactly matches an option, select it immediately
                    const exactMatch = filteredOptions.find(o => o.label.toLowerCase() === text.toLowerCase());
                    if (exactMatch) {
                        commit(exactMatch.value);
                    } else if (filteredOptions.length === 1 && text.length > 0) {
                        // Utility: auto-select the only option on Enter
                        commit(filteredOptions[0].value);
                    } else if (text.trim() !== "") {
                        // Allow completely custom free-text entry by committing typed text natively
                        commit(text);
                    }
                }
                break;
            case "Escape":
                setOpen(false);
                setFocusedIndex(-1);
                break;
        }
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <input
                value={text}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={() => { setOpen(true); }}
                placeholder=" "
                className="peer w-full rounded-xl border border-slate-200 bg-transparent px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 z-20 relative"
            />
            <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
                Select a Test
            </label>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                ▾
            </span>

            {open && (
                <div
                    ref={listboxRef}
                    className="absolute left-0 right-0 z-30 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg max-h-64 overflow-y-auto p-1"
                >
                    {filteredOptions.map((opt: TestOption, index: number) => (
                        <button
                            key={index}
                            type="button"
                            className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm transition-colors ${index === focusedIndex
                                ? "bg-emerald-100 text-emerald-800 font-medium"
                                : "bg-white hover:bg-emerald-50 hover:text-emerald-700"
                                }`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                commit(opt.value);
                            }}
                            onMouseEnter={() => setFocusedIndex(index)}
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">{opt.label}</span>
                                {opt.department && <span className="text-[10px] uppercase font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{opt.department}</span>}
                                {opt.type && <span className="text-[10px] uppercase font-semibold bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{opt.type}</span>}
                            </div>
                        </button>
                    ))}

                </div>
            )}
        </div>
    );
}