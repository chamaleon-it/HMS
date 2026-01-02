import React, { useEffect, useRef, useState } from "react";

import { DataType } from "./interface";
import Medicine from "./Medicine";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

// ------------------ Types ------------------
interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  food: string;
  duration: string;
  quantity: number;
}

export default function PrescriptionCard({
  data,
  setData,
  showAllFields,
}: {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
  showAllFields: boolean;
}) {
  const updateField = (
    idx: number,
    key: keyof Medicine,
    val: string | number
  ) => {
    setData((prev) => ({
      ...prev,
      items: prev.items?.map((m, i) => (i === idx ? { ...m, [key]: val } : m)),
    }));
  };

  const addMedicineRow = () => {
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          dosage: "1 tab",
          name: "",
          duration: "",
          food: "After food",
          frequency: "",
          quantity: 0,
        },
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
          <div className={`grid ${showAllFields ? "grid-cols-12" : "grid-cols-5"} gap-2 text-[11px] uppercase tracking-wide text-slate-500 mt-2`}>
            <div className="col-span-3">Drug</div>
            {showAllFields && (
              <>
                <div className="col-span-1">Dosage</div>
                <div className="col-span-2">Frequency</div>
                <div className="col-span-2">Food</div>
                <div className="col-span-2">Duration</div>
              </>
            )}
            <div className="col-span-1">Quantity</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {data.items?.map((m, i) => (
            <div key={i} className={`grid ${showAllFields ? "grid-cols-12" : "grid-cols-5"} gap-2 mt-2 items-start`}>
              <div className="col-span-3">
                <Medicine i={i} m={m} updateField={updateField} />
              </div>
              {showAllFields && <>
                <div className="col-span-1">
                  <LabeledCombobox
                    options={[
                      "½ tab",
                      "1 tab",
                      "2 tab",
                      "5 ml",
                      "10 ml",
                      "20 ml",
                    ]}
                    label="Dosage"
                    value={m.dosage}
                    onChange={(e) => updateField(i, "dosage", e)}
                  />
                </div>

                <div className="col-span-2">
                  <LabeledCombobox
                    options={["1-0-1", "1-1-1", "0-1-1", "1-0-0", "0-0-1", "SOS"]}
                    label="Frequency"
                    value={m.frequency}
                    onChange={(e) => updateField(i, "frequency", e)}
                  />
                </div>

                <div className="col-span-2">
                  <LabeledCombobox
                    options={[
                      "After food",
                      "Before food",
                      "With food",
                      "Empty stomach",
                      "Anytime",
                    ]}
                    label="Food"
                    value={m.food}
                    onChange={(e) => updateField(i, "food", e)}
                  />
                </div>

                <div className="col-span-2">
                  <LabeledCombobox
                    options={[
                      "3 days",
                      "5 days",
                      "7 days",
                      "10 days",
                      "14 days",
                      "28 days",
                    ]}
                    label="Duration"
                    value={m.duration}
                    onChange={(e) => updateField(i, "duration", e)}
                  />
                </div>
              </>}
              <div className="col-span-1">
                <QuantityInput updateField={updateField} i={i} m={m} />
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
          <Button
            onClick={addMedicineRow}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
          >
            + Add Medicine
          </Button>
        </div>
      </div>
    </div>
  );
}


const QuantityInput = ({ updateField, i, m }: { updateField: (idx: number, key: keyof Medicine, val: string | number) => void, i: number, m: Medicine }) => {


  const currentOptions = {
    dosage: ["½ tab", "1 tab", "2 tab"],
    duration: ["3 days", "5 days", "7 days", "10 days", "14 days", "28 days"],
    frequency: ["1-0-1", "1-1-1", "0-1-1", "1-0-0", "0-0-1"]
  }

  useEffect(() => {
    if (currentOptions.dosage.includes(m.dosage) && currentOptions.frequency.includes(m.frequency)) {
      const dosage = currentOptions.dosage[0] === m.dosage && 0.5 || currentOptions.dosage[1] === m.dosage && 1 || currentOptions.dosage[2] === m.dosage && 2 || 0
      const duration = currentOptions.duration[0] === m.duration && 3 || currentOptions.duration[1] === m.duration && 5 || currentOptions.duration[2] === m.duration && 7 || currentOptions.duration[3] === m.duration && 10 || currentOptions.duration[4] === m.duration && 14 || currentOptions.duration[5] === m.duration && 28 || Number(m.duration) || 0
      const frequency = currentOptions.frequency[0] === m.frequency && 2 || currentOptions.frequency[1] === m.frequency && 3 || currentOptions.frequency[2] === m.frequency && 2 || currentOptions.frequency[3] === m.frequency && 1 || currentOptions.frequency[4] === m.frequency && 1 || 0
      updateField(i, "quantity", Math.ceil(dosage * duration * frequency))
    } else {
      updateField(i, "quantity", 0)
    }

  }, [m.dosage, m.duration, m.frequency])


  return (
    <div className="relative w-full">
      <input
        placeholder="0"
        onChange={(e) => {
          const value = e.target.value;
          updateField(
            i,
            "quantity",
            value === "" ? 0 : Number(value)
          );
        }}
        inputMode={"numeric"}
        className={`peer w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100`}
        value={m.quantity === 0 ? "" : m.quantity}
        onFocus={e => e.target.placeholder = ""}
        onBlur={e => e.target.placeholder = "0"}
      />
      <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
        Quantity
      </label>
    </div>
  )
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
          {options?.map((opt: string) => (
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
