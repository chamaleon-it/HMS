import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import React, { RefObject, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

interface Item {
  name: string;
  generic?: string;
  sku?: string;
}

interface PropTypes {
  setMedicine: (value: SetStateAction<string | null>) => void;
  medicine: string | null;
  medicineRef: RefObject<HTMLInputElement | null>;
  addItems: (name: string) => Promise<void>;
}

export default function SelectMedicine({
  medicine,
  medicineRef,
  setMedicine,
  addItems,
}: PropTypes) {
  const { data: ItemsData } = useSWR<{ message: string; data: Item[] }>(
    medicine ? `pharmacy/items?q=${encodeURIComponent(medicine)}` : null
  );

  const items: Item[] = useMemo(() => ItemsData?.data ?? [], [ItemsData?.data]);

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (medicine && (items.length > 0 || medicine.length > 0)) setOpen(true);
    else setOpen(false);
    setHighlight(-1);
  }, [medicine, items]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!medicine) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, items.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();

      if (open) {
        if (highlight === -1) {
          addItems(medicine);
        } else if (highlight < items.length) {
          const sel = items[highlight].name;
          setMedicine(sel);
          addItems(sel);
        } else {
          addItems(medicine);
        }
      } else {
        addItems(medicine);
      }
      setOpen(false);
    } else if (e.key === "Tab") {
      if (open && highlight >= 0) {
        e.preventDefault();
        const sel = highlight < items.length ? items[highlight].name : medicine;
        setMedicine(sel);
        addItems(sel);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const onClickItem = (index: number) => {
    if (index < items.length) {
      const sel = items[index].name;
      setMedicine(sel);
      addItems(sel);
    } else {
      addItems(medicine ?? "");
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full lg:w-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
        <Input
          placeholder="Type medicine"
          className="h-10 rounded-xl sm:w-[220px]"
          onChange={(e) => setMedicine(e.target.value)}
          value={medicine ?? ""}
          ref={medicineRef}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (medicine) setOpen(true);
          }}
        />

        <Button
          size="sm"
          variant="outline"
          className="rounded-xl h-10 gap-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white"
          onClick={() => {
            if (!medicine) return;
            addItems(medicine);
            setOpen(false);
          }}
        >
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full sm:w-[320px] max-h-60 overflow-auto rounded-xl border bg-white shadow-lg">
          {items.length > 0 ? (
            items?.map((it, idx) => (
              <button
                key={it.sku ?? it.name + idx}
                type="button"
                onMouseEnter={() => setHighlight(idx)}
                onMouseLeave={() => setHighlight(-1)}
                onClick={() => onClickItem(idx)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex justify-between ${highlight === idx ? "bg-gray-100" : ""
                  }`}
              >
                <div className="truncate">
                  <div className="font-medium text-sm">{it.name}</div>
                  {it.generic && (
                    <div className="text-xs text-muted-foreground truncate">{it.generic}</div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{it.sku}</div>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">No matches</div>
          )}

          {medicine && (
            <button
              type="button"
              onMouseEnter={() => setHighlight(items.length)}
              onMouseLeave={() => setHighlight(-1)}
              onClick={() => onClickItem(items.length)}
              className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${highlight === items.length ? "bg-gray-100" : ""
                }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add “{medicine}” as custom item</span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
