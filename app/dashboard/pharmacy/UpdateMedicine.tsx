import { AlertTriangle, XCircle } from "lucide-react";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { Item as ItemInterface, Name } from "./interface";

type Item = Name;
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

export default function UpdateMedicine({
  addMedicineRow
}: {
  addMedicineRow: (m: ItemInterface) => void
}) {

  const [query, setQuery] = useState("");

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
    query ? `/pharmacy/items/${query}` : null,
    { keepPreviousData: true }
  );

  useEffect(() => {
    if (query && itemById?.data && (!selected || selected.id !== query)) {
      if (!open) setQuery("");
    }
  }, [query, itemById, open, selected]);

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
    addMedicineRow({
      name: item,
      dosage: "",
      duration: "",
      quantity: 0,
      frequency: "",
      food: "",
      isPacked: false
    });


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
                  className={`cursor-pointer px-3 py-2 text-sm ${idx === activeIdx ? "bg-emerald-50" : "hover:bg-slate-50"
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

                    <div className="flex flex-col items-end gap-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded-sm ${it.quantity <= 0
                        ? "bg-red-50 text-red-600"
                        : it.quantity < 15
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                        }`}>
                        {it.quantity <= 0 ? "Out of Stock" : it.quantity < 15 ? "Low Stock" : "In Stock"}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {it.quantity} {it.quantity === 1 ? 'unit' : 'units'} available
                      </span>
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
  const newMedicineInput = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    newMedicineInput.current?.focus()
  }, [])
  return (
    <div className="relative w-full">
      <input
        ref={newMedicineInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder=" "
        type={type}
        inputMode={inputMode ?? (type === "number" ? "numeric" : undefined)}
        id="drug-search-input"
        className={`peer w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 ${hasRight ? "pr-24" : unit ? "pr-12" : ""
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
