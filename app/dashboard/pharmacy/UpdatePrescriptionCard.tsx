import React, { useRef, useState } from "react";

import { DataType, Item, OrderType } from "./interface";
import Medicine from "./Medicine";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import UpdateMedicine from "./UpdateMedicine";

// ------------------ Types ------------------
interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  food: string;
  duration: string;
  quantity: number;
}

export default function UpdatePrescriptionCard({
  data,
  setData,
}: {
  data: OrderType;
  setData: React.Dispatch<React.SetStateAction<OrderType>>;
}) {
  const updateField = (
    idx: number,
    key: keyof Medicine,
    val: string | number
  ) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((m, i) => (i === idx ? { ...m, [key]: val } : m)),
    }));
  };

  const addMedicineRow = (m: Item) => {
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        m,
      ],
    }));
  };

  const removeMedicineRow = (idx: number) => {
    setData((prev) => ({
      ...prev,
      items:
        prev.items.length === 1 ? [] : prev.items.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="">
      <div className="border rounded-xl p-4">
        <div className="flex flex-col gap-3">
          <div className={`grid grid-cols-5 gap-2 text-[11px] uppercase tracking-wide text-slate-500 mt-2`}>
            <div className="col-span-3">Drug</div>


            <div className="col-span-1">Quantity</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {data.items.map((m, i) => (
            <div key={i} className={`grid grid-cols-5 gap-2 mt-2 items-start`}>
              <div className="col-span-3 relative">
                {/* <UpdateMedicine m={m} updateField={updateField} i={i} /> */}

                <input
                  placeholder="Drug"
                  type="text"
                  disabled
                  className={`peer w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100`}
                  value={m.name.name}
                />
                <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
                  Drug
                </label>

              </div>
              <div className="col-span-1">
                <div className="relative w-full">
                  <input
                    placeholder="quantity"
                    type="number"
                    onChange={(e) =>
                      updateField(i, "quantity", parseInt(e.target.value) ?? 0)
                    }
                    inputMode={"numeric"}
                    className={`peer w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100`}
                    value={m.quantity === 0 ? "" : m.quantity}
                  />
                  <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
                    Quantity
                  </label>
                </div>
              </div>

              <div className="col-span-1 flex justify-end gap-2">
                <Button
                  className="!bg-red-600 hover:!bg-red-700 text-white !border-red-600"
                  onClick={() => removeMedicineRow(i)}
                  title="Remove medicine"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <UpdateMedicine addMedicineRow={addMedicineRow} />
        </div>
      </div>
    </div>
  );
}

type LabeledComboboxProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  digitsOnly?: boolean; // e.g., for duration
};

function LabeledCombobox({
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
