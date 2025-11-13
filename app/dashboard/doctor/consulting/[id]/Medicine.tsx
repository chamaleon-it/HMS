import { AlertTriangle, XCircle } from "lucide-react";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

interface Medicine {
  // Store ONLY the id in your form model
  name: string; // _id
  dosage: string;
  frequency: string;
  food: string;
  duration: string;
  quantity: number;
}

type Item = { _id: string; name: string; generic: string; quantity: number };
type ItemsApi = { message: string; data: Item[] };
type ItemApi = { message: string; data: Item };

function useDebounced<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function MedicineField({
  m,
  updateField,
  i,
}: {
  m: Medicine;
  updateField: (idx: number, key: keyof Medicine, val: string) => void;
  i: number;
}) {
  // what the user is typing
  const [query, setQuery] = useState("");
  // the item the user selected (id + label for display)
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(
    null
  );

  const [filter, setFilter] = useState<{
    limit: number;
    q: string;
    page: number;
  }>({
    limit: 5,
    q: "",
    page: 1,
  });
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQ = useDebounced(filter.q, 300);

  const { data: itemById } = useSWR<ItemApi>(
    m.name ? `/pharmacy/items/${m.name}` : null,
    { keepPreviousData: true }
  );

  useEffect(() => {
    if (m.name && itemById?.data && (!selected || selected.id !== m.name)) {
      setSelected({ id: itemById.data._id, name: itemById.data.name });
      // also sync the visible query to the name when idle
      if (!open) setQuery("");
    }
  }, [m.name, itemById, open, selected]);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set("limit", String(filter.limit));
    if (debouncedQ) p.set("q", debouncedQ);
    p.set("page", String(filter.page));
    return p.toString();
  }, [filter.limit, filter.page, debouncedQ]);

  const swrKey = `/pharmacy/items?${qs}`;
  const { data, isLoading } = useSWR<ItemsApi>(swrKey, {
    keepPreviousData: true,
  });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const items = data?.data ?? [];

  const handleSelect = (item: Item) => {
    // store only id in your form
    updateField(i, "name", item._id);
    // remember the label locally
    setSelected({ id: item._id, name: item.name });
    // clear query and close
    setQuery("");
    setFilter((f) => ({ ...f, q: "", page: 1 }));
    setOpen(false);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((idx) => Math.min(idx + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((idx) => Math.max(idx - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = items[activeIdx];
      if (sel) handleSelect(sel);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const displayValue = open || query ? query : selected?.name ?? "";

  return (
    <div ref={containerRef} className="relative w-full">
      <LabeledInput
        label="Drug"
        value={displayValue}
        onChange={(val) => {
          setQuery(val);
          setFilter((prev) => ({ ...prev, q: val, page: 1 }));
          setOpen(true);
          setActiveIdx(-1);
        }}
        right={
          selected ? (
            <button
              type="button"
              onClick={() => {
                // clear selected id from form & UI
                updateField(i, "name", "");
                setSelected(null);
                setQuery("");
                setFilter((f) => ({ ...f, q: "", page: 1 }));
                setOpen(true);
              }}
              className="rounded-md border px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          ) : null
        }
        onKeyDown={onKeyDown}
      />

      {open && (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl">
          {isLoading ? (
            <div className="p-3 text-sm text-slate-500">Searching…</div>
          ) : items.length === 0 ? (
            <div className="p-3 text-sm text-slate-500">No medicines found</div>
          ) : (
            <ul role="listbox" className="divide-y divide-slate-100">
              {items.map((it, idx) => (
                <li
                  key={it._id}
                  role="option"
                  aria-selected={idx === activeIdx}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(it)}
                  className={`cursor-pointer px-3 py-2 text-sm ${
                    idx === activeIdx ? "bg-emerald-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="">
                      <div className="font-medium leading-tight">{it.name}</div>
                      {it.generic ? (
                        <div className="text-xs text-slate-500">
                          {it.generic}
                        </div>
                      ) : null}
                    </div>

                    <div>
                      {it.quantity <= 0 ? (
                        <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
                          <XCircle className="w-3 h-3" />
                          <span>Out of stock</span>
                        </div>
                      ) : it.quantity < 15 ? (
                        <div className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{it.quantity} left - Low stock</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Reusable Input ---------------- */
type LabeledInputProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  unit?: string;
  right?: ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
};

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  unit,
  right,
  inputMode,
  onKeyDown,
}: LabeledInputProps) {
  const hasRight = Boolean(right);
  return (
    <div className="relative w-full">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder=" "
        type={type}
        inputMode={inputMode ?? (type === "number" ? "numeric" : undefined)}
        className={`peer w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 ${
          hasRight ? "pr-24" : unit ? "pr-12" : ""
        }`}
      />
      <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
        {label}
      </label>
      {hasRight ? (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">
          {right}
        </span>
      ) : unit ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
          {unit}
        </span>
      ) : null}
    </div>
  );
}
