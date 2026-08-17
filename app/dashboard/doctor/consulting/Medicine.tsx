import { AlertTriangle, PlusCircle, XCircle, CheckCircle2 } from "lucide-react";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

interface Medicine {
  referralName: string;
  name: string; // _id if internal item, empty string if custom
  isCustom?: boolean;
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
  updateField: (idx: number, key: keyof Medicine, val: any) => void;
  i: number;
}) {
  // what the user is typing
  const [query, setQuery] = useState("");
  // the item the user selected (id + label for display)
  const [selected, setSelected] = useState<{
    id: string;
    name: string;
    isCustom?: boolean;
  } | null>(() => {
    if (m.name || m.referralName) {
      return {
        id: m.name || "",
        name: m.referralName || "",
        isCustom: m.isCustom || !m.name,
      };
    }
    return null;
  });

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
    if (!m.name && !m.referralName) {
      if (selected !== null) setSelected(null);
      if (!open && query !== "") setQuery("");
    } else if (m.name && itemById?.data && (!selected || selected.id !== m.name)) {
      setSelected({
        id: itemById.data._id,
        name: itemById.data.name,
        isCustom: false,
      });
      if (!open) setQuery("");
    } else if (!m.name && m.referralName && (!selected || selected.name !== m.referralName)) {
      setSelected({
        id: "",
        name: m.referralName,
        isCustom: true,
      });
      if (!open) setQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.name, m.referralName, itemById, open, selected]);

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
  const cleanQuery = filter.q.trim();

  const handleSelectInventory = (item: Item) => {
    updateField(i, "name", item._id);
    updateField(i, "referralName", item.name);
    updateField(i, "isCustom", false);
    setSelected({ id: item._id, name: item.name, isCustom: false });
    setQuery("");
    setFilter((f) => ({ ...f, q: "", page: 1 }));
    setOpen(false);
  };

  const handleSelectCustom = (customName: string) => {
    const nameToUse = customName.trim();
    if (!nameToUse) return;
    updateField(i, "name", "");
    updateField(i, "referralName", nameToUse);
    updateField(i, "isCustom", true);
    setSelected({ id: "", name: nameToUse, isCustom: true });
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

    const totalOptions = items.length + (cleanQuery ? 1 : 0);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((idx) => Math.min(idx + 1, totalOptions - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((idx) => Math.max(idx - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < items.length) {
        handleSelectInventory(items[activeIdx]);
      } else if (activeIdx === items.length && cleanQuery) {
        handleSelectCustom(cleanQuery);
      } else if (cleanQuery) {
        handleSelectCustom(cleanQuery);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const displayValue = open || query ? query : selected?.name ?? m.referralName;
  const isCustomSelected = Boolean(selected?.isCustom || (!m.name && m.referralName));
  const isInventorySelected = Boolean(selected && !isCustomSelected && m.name);

  return (
    <div ref={containerRef} className="relative w-full">
      <LabeledInput
        label="Drug / Medicine"
        value={displayValue}
        onChange={(val) => {
          setQuery(val);
          setFilter((prev) => ({ ...prev, q: val, page: 1 }));
          setOpen(true);
          setActiveIdx(-1);
        }}
        right={
          <div className="flex items-center gap-1.5">
            {isInventorySelected && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> In-House
              </span>
            )}
            {isCustomSelected && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                <PlusCircle className="w-3 h-3" /> Outside
              </span>
            )}
            {selected ? (
              <button
                type="button"
                onClick={() => {
                  updateField(i, "name", "");
                  updateField(i, "referralName", "");
                  updateField(i, "isCustom", false);
                  setSelected(null);
                  setQuery("");
                  setFilter((f) => ({ ...f, q: "", page: 1 }));
                  setOpen(true);
                }}
                className="rounded-md border px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Clear
              </button>
            ) : null}
          </div>
        }
        onKeyDown={onKeyDown}
      />

      {open && (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl">
          {isLoading ? (
            <div className="p-3 text-sm text-slate-500">Searching inventory…</div>
          ) : (
            <ul role="listbox" className="divide-y divide-slate-100">
              {items.map((it, idx) => (
                <li
                  key={it._id}
                  role="option"
                  aria-selected={idx === activeIdx}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectInventory(it)}
                  className={`cursor-pointer px-3 py-2.5 text-sm ${
                    idx === activeIdx ? "bg-emerald-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium leading-tight text-slate-900 flex items-center gap-2">
                        {it.name}
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          In-House
                        </span>
                      </div>
                      {it.generic ? (
                        <div className="text-xs text-slate-500">{it.generic}</div>
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
                          <span>{it.quantity} left</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}

              {cleanQuery && (
                <li
                  role="option"
                  aria-selected={activeIdx === items.length}
                  onMouseEnter={() => setActiveIdx(items.length)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectCustom(cleanQuery)}
                  className={`cursor-pointer px-3 py-3 text-sm border-t border-purple-100 ${
                    activeIdx === items.length
                      ? "bg-purple-50"
                      : "bg-purple-50/40 hover:bg-purple-50"
                  }`}
                >
                  <div className="flex items-center gap-2 text-purple-900 font-semibold">
                    <PlusCircle className="w-4 h-4 text-purple-600" />
                    <span>Prescribe Outside Medicine: &quot;{cleanQuery}&quot;</span>
                  </div>
                  <p className="text-xs text-purple-700 mt-0.5 ml-6">
                    Prescribe medicine not in internal stock for outside purchase.
                  </p>
                </li>
              )}

              {items.length === 0 && !cleanQuery && (
                <li className="p-3 text-sm text-slate-500">
                  Type to search inventory or prescribe an outside medicine...
                </li>
              )}
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
          hasRight ? "pr-36" : unit ? "pr-12" : ""
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
