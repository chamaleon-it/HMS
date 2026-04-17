import React, { useMemo, useRef, useState } from "react";

type TestSelectionProps = {
    onSelect?: (v: string) => void;
    options: string[];
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


    const filteredOptions = options.filter(opt => opt.toLowerCase().startsWith(text.toLowerCase()))



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
                    className="absolute left-0 right-0 z-30 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg max-h-56 overflow-y-auto p-1"
                >
                    {filteredOptions.map((opt: string, index: number) => (
                        <button
                            key={index}
                            type="button"
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${index === focusedIndex
                                ? "bg-emerald-100 text-emerald-800 font-medium"
                                : "bg-white hover:bg-emerald-50 hover:text-emerald-700"
                                }`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                commit(opt);
                            }}
                            onMouseEnter={() => setFocusedIndex(index)}
                        >
                            {opt}
                        </button>
                    ))}

                </div>
            )}
        </div>
    );
}