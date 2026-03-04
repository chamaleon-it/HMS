import React, { useRef, useState } from "react";

type LabeledComboboxProps = {
    label: string;
    value: string;
    onChange?: (v: string) => void;
    onSelect?: (v: string) => void;
    options: string[];
    digitsOnly?: boolean; // e.g., for duration
    clearOnSelect?: boolean;
};

export default function LabeledCombobox({
    label,
    value,
    onChange,
    onSelect,
    options,
    digitsOnly,
    clearOnSelect,
}: LabeledComboboxProps) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState(value ?? "");
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [isTyping, setIsTyping] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setText(value ?? "");
    }, [value]);

    // Reset focused index whenever text changes or options list changes
    React.useEffect(() => {
        setFocusedIndex(-1);
    }, [text, options, open]);

    const handleChange = (raw: string) => {
        const v = digitsOnly ? raw.replace(/[^0-9]/g, "") : raw;
        setText(v);
        setIsTyping(true);
        if (onChange) onChange(v);
        setOpen(true);
    };

    const commit = (val: string) => {
        if (clearOnSelect) {
            setText("");
        } else {
            setText(val);
        }
        setIsTyping(false);
        if (onChange) onChange(val);
        if (onSelect) onSelect(val);
        setOpen(false);
        setFocusedIndex(-1);
    };

    // Filter options matching the current input exactly as typed
    // If not actively typing, show all options.
    const filteredOptions = isTyping
        ? options.filter(opt => opt.toLowerCase().includes(text.toLowerCase()))
        : options;

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
                    commit(filteredOptions[focusedIndex]);
                } else {
                    // Utility: if text exactly matches an option, select it immediately
                    const exactMatch = filteredOptions.find(o => o.toLowerCase() === text.toLowerCase());
                    if (exactMatch) {
                        commit(exactMatch);
                    } else if (filteredOptions.length === 1 && text.length > 0) {
                        // Utility: auto-select the only option on Enter
                        commit(filteredOptions[0]);
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

    // Auto scroll the focused item into view
    const listboxRef = useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (focusedIndex >= 0 && listboxRef.current) {
            const listboxNode = listboxRef.current;
            const focusedItemNode = listboxNode.children[focusedIndex] as HTMLElement;
            if (focusedItemNode) {
                const itemTop = focusedItemNode.offsetTop;
                const itemBottom = itemTop + focusedItemNode.offsetHeight;
                const listboxTop = listboxNode.scrollTop;
                const listboxBottom = listboxTop + listboxNode.offsetHeight;

                if (itemTop < listboxTop) {
                    listboxNode.scrollTop = itemTop;
                } else if (itemBottom > listboxBottom) {
                    listboxNode.scrollTop = itemBottom - listboxNode.offsetHeight;
                }
            }
        }
    }, [focusedIndex]);

    return (
        <div className="relative w-full" ref={containerRef}>
            <input
                value={text}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { setOpen(true); setIsTyping(false); }}
                onClick={() => { setOpen(true); setIsTyping(false); }}
                onBlur={() => {
                    setTimeout(() => {
                        setOpen(false);
                        // Ensure what the user typed is actually committed dynamically
                        // even if they don't explicitly pick an option.
                        if (text !== value && onChange) {
                            onChange(text);
                        }
                    }, 200);
                }}
                placeholder=" "
                className="peer w-full rounded-xl border border-slate-200 bg-transparent px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 z-20 relative"
            />
            <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
                {label}
            </label>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                ▾
            </span>

            {open && (filteredOptions.length > 0 || (text.trim() !== "" && !options.find(o => o.toLowerCase() === text.trim().toLowerCase()))) && (
                <div
                    ref={listboxRef}
                    className="absolute left-0 right-0 z-30 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg max-h-56 overflow-y-auto p-1"
                >
                    {filteredOptions.map((opt: string, index: number) => (
                        <button
                            key={opt}
                            type="button"
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${index === focusedIndex
                                ? "bg-emerald-100 text-emerald-800 font-medium"
                                : "bg-white hover:bg-emerald-50 hover:text-emerald-700"
                                }`}
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur
                                commit(opt);
                            }}
                            onMouseEnter={() => setFocusedIndex(index)}
                        >
                            {opt}
                        </button>
                    ))}
                    {text.trim() !== "" && !options.find(o => o.toLowerCase() === text.trim().toLowerCase()) && (
                        <button
                            type="button"
                            className="w-full text-left px-2 py-2 mt-1 rounded-lg text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium transition-colors flex items-center gap-2"
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur
                                commit(text.trim());
                            }}
                        >
                            <span className="text-lg leading-none mb-0.5">+</span> Add "{text.trim()}"
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
