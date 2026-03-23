import React, { useRef, useState } from "react";

type LabeledComboboxProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  digitsOnly?: boolean; // e.g., for duration
};

export default function LabeledCombobox({
  label,
  value,
  onChange,
  options,
  digitsOnly,
}: LabeledComboboxProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setText(value ?? "");
  }, [value]);

  const handleChange = (raw: string) => {
    const v = digitsOnly ? raw.replace(/[^0-9]/g, "") : raw;
    setText(v);
    onChange(v);
    setOpen(true);
  };

  const commit = (val: string) => {
    setText(val);
    onChange(val);
    setOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder=" "
        className="peer w-full rounded-xl border border-slate-200 bg-transparent px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 z-20 relative"
      />
      <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
        {label}
      </label>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        ▾
      </span>

      {open && options.length > 0 && (
        <div className="absolute left-0 right-0  z-30 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg max-h-56 overflow-y-auto p-1">
          {options.map((opt: string) => (
            <button
              key={opt}
              type="button"
              className="w-full text-left px-2 py-1.5 rounded-lg text-sm bg-white hover:bg-emerald-50 hover:text-emerald-700"
              onMouseDown={(e) => {
                e.preventDefault();
                commit(opt);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
