import React, { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { useDebounce } from "use-debounce";

export function ServerAutocomplete({
  value,
  onChange,
  field,
  placeholder,
  className = "",
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  field: string;
  placeholder: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value || "");
  const [debouncedQ] = useDebounce(q, 300);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch unique locations based on field and debounced query
  const { data } = useSWR<{ data: string[] }>(
    `/patients/unique-locations?field=${field}&q=${debouncedQ}`
  );

  const options = data?.data || [];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Update internal query if value changes from outside
  useEffect(() => {
    if (value !== undefined) {
      setQ(value);
    } else {
      setQ("");
    }
  }, [value]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="relative group flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            if (!e.target.value) {
              onChange(undefined);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && q) {
              onChange(q);
              setOpen(false);
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full h-11 pl-9 pr-8 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-cosmo-copper)]/20 transition-all placeholder:text-slate-400 text-sm"
        />
        <svg
          className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-[var(--color-cosmo-copper)] transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {value && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              onChange(undefined);
              setOpen(false);
            }}
            className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && (options.length > 0 || (q && !options.includes(q))) && (
        <div className="absolute z-30 mt-2 w-full min-w-[200px] bg-white rounded-xl shadow-2xl border border-slate-200 p-2 overflow-hidden">
          <ul role="listbox" className="max-h-60 overflow-auto space-y-1">
            {options.map((o) => {
              const active = o === value;
              return (
                <li key={o}>
                  <button
                    type="button"
                    onClick={() => {
                      setQ(o);
                      onChange(o);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? "bg-[var(--color-cosmo-copper)]/10 text-[var(--color-cosmo-copper)]"
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {o}
                  </button>
                </li>
              );
            })}

            {/* Option to use custom value if it's not in the list */}
            {q && !options.includes(q) && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onChange(q);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-slate-50 text-slate-600 border-t border-slate-100 mt-1 italic"
                >
                  Use "{q}"
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
