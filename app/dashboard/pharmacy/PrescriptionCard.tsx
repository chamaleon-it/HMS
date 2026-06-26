import React, { useEffect, useRef, useState } from "react";

import { DataType } from "./interface";
import Medicine from "./Medicine";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatINR } from "@/lib/fNumber";

// ------------------ Types ------------------
interface Medicine {
  name: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  food: string;
  duration: string;
  quantity: number;
  availableQuantity: number;
  unitPrice: number;
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
      items: prev.items.map((m, i) => (i === idx ? { ...m, [key]: val } : m)),
    }));
  };

  const addMedicineRow = () => {
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          rowId: Date.now().toString(),
          dosage: "1 tab",
          name: "",
          medicineName: "",
          duration: "",
          food: "",
          frequency: "",
          quantity: 0,
          availableQuantity: 0,
          unitPrice: 0,
        },
      ],
    }));
    setShouldFocusNewRow(true);
  };

  const [shouldFocusNewRow, setShouldFocusNewRow] = useState(false);
  const medicineRefs = useRef<(HTMLInputElement | null)[]>([]);
  const quantityRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (shouldFocusNewRow && medicineRefs.current[data.items.length - 1]) {
      medicineRefs.current[data.items.length - 1]?.focus();
      setShouldFocusNewRow(false);
    }
  }, [data.items.length, shouldFocusNewRow]);

  const focusQuantity = (idx: number) => {
    setTimeout(() => {
      quantityRefs.current[idx]?.focus();
    }, 10);
  };

  const handleEnterOnDrug = (idx: number) => {
    focusQuantity(idx);
  };

  const handleEnterOnQuantity = () => {
    addMedicineRow();
  };

  const removeMedicineRow = (rowId: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.rowId !== rowId),
    }));
  };

  const subTotal = data.items.reduce((a, b) => a + b.quantity * b.unitPrice, 0);

  return (

    <div className="border rounded-xl bg-white shadow-sm max-h-[50vh] overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col min-w-[900px]">
        <div
          className={`grid ${showAllFields ? "grid-cols-[35px_repeat(11,1fr)]" : "grid-cols-[35px_repeat(7,1fr)]"
            } gap-1 text-[11px] uppercase font-bold tracking-wider text-slate-500 py-2 border-b bg-slate-50/50 px-2 rounded-t-lg`}
        >
          <div className="col-span-1 flex items-center justify-center">Sl</div>
          <div className="col-span-2">Drug</div>
          {showAllFields && (
            <>
              <div className="col-span-1">Dosage</div>
              <div className="col-span-1">Freq</div>
              <div className="col-span-1">Food</div>
              <div className="col-span-1">Dur</div>
            </>
          )}
          <div className="col-span-1">Avail</div>
          <div className="col-span-1">Qty</div>
          <div className="col-span-1">Price</div>
          <div className="col-span-1">Total</div>
          <div className="col-span-1 text-right pr-2">Act</div>
        </div>

        {data.items.map((m, i) => (
          <div
            key={m.rowId}
            className={`grid ${showAllFields ? "grid-cols-[35px_repeat(11,1fr)]" : "grid-cols-[35px_repeat(7,1fr)]"
              } gap-1 items-center py-1 px-2 border-b last:border-b-0 hover:bg-slate-50/50 transition-colors`}
          >
            <div className="col-span-1 flex items-center justify-center text-slate-400 text-[11px] font-medium">
              {i + 1}
            </div>
            <div className="col-span-2">
              <Medicine
                i={i}
                m={m}
                updateField={updateField}
                onEnter={() => handleEnterOnDrug(i)}
                onSelect={() => focusQuantity(i)}
                inputRef={{
                  get current() {
                    return medicineRefs.current[i] || null;
                  },
                  set current(val) {
                    medicineRefs.current[i] = val;
                  },
                } as React.RefObject<HTMLInputElement>}
              />
            </div>
            {showAllFields && (
              <>
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEnterOnDrug(i);
                    }}
                  />
                </div>

                <div className="col-span-1">
                  <LabeledCombobox
                    options={[
                      "1-0-1",
                      "1-1-1",
                      "0-1-1",
                      "1-0-0",
                      "0-0-1",
                      "SOS",
                    ]}
                    label="Freq"
                    value={m.frequency}
                    onChange={(e) => updateField(i, "frequency", e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEnterOnDrug(i);
                    }}
                  />
                </div>

                <div className="col-span-1">
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEnterOnDrug(i);
                    }}
                  />
                </div>

                <div className="col-span-1">
                  <LabeledCombobox
                    options={[
                      "3 days",
                      "5 days",
                      "7 days",
                      "10 days",
                      "14 days",
                      "28 days",
                    ]}
                    label="Dur"
                    value={m.duration}
                    onChange={(e) => updateField(i, "duration", e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEnterOnDrug(i);
                    }}
                  />
                </div>
              </>
            )}
            <div className="col-span-1">
              <input
                placeholder="0"
                disabled
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 h-9 text-sm outline-none text-slate-500 font-medium"
                value={m.availableQuantity || 0}
              />
            </div>
            <div className="col-span-1">
              <QuantityInput
                updateField={updateField}
                i={i}
                m={m}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEnterOnQuantity();
                }}
                inputRef={{
                  get current() {
                    return quantityRefs.current[i] || null;
                  },
                  set current(val) {
                    quantityRefs.current[i] = val;
                  },
                } as React.RefObject<HTMLInputElement>}
              />
            </div>

            <div className="col-span-1">
              <input
                placeholder="0.00"
                disabled
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 h-9 text-sm outline-none text-slate-500 font-medium text-right"
                value={m.unitPrice === 0 ? "" : m.unitPrice.toFixed(2)}
              />
            </div>

            <div className="col-span-1">
              <input
                placeholder="0.00"
                disabled
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 h-9 text-sm outline-none text-slate-500 font-bold text-right"
                value={m.unitPrice * m.quantity === 0 ? "" : (m.unitPrice * m.quantity).toFixed(2)}
              />
            </div>

            <div className="col-span-1 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                onClick={() => removeMedicineRow(m.rowId)}
                title="Remove medicine"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-slate-50/50 border-t space-y-2">
        <div className="flex gap-3 mb-2">
          <Button
            onClick={addMedicineRow}
            size="sm"
            className="bg-[var(--color-cosmo-dark)] hover:bg-[var(--color-cosmo-dark)] text-white rounded-md h-8"
          >
            + Add Medicine
          </Button>
        </div>

        <div
          className={`grid ${showAllFields ? "grid-cols-12" : "grid-cols-7"
            } gap-2 text-[11px] uppercase tracking-wide text-slate-500`}
        >
          <div
            className={`${showAllFields ? "col-span-8" : "col-span-3"}`}
          ></div>
          <div className="text-right flex items-center justify-end h-full">
            <p className="h-min">Discount %</p>
          </div>
          <div className="relative w-full">
            <input
              placeholder="0"
              type="number"
              inputMode={"numeric"}
              className={`peer w-full rounded-md border border-slate-200 bg-white px-3 h-8 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100`}
              onChange={(e) => {
                const pct = parseFloat(e.target.value) || 0;
                const amt = (pct / 100) * subTotal;
                setData({ ...data, discount: amt });
              }}
              value={
                subTotal && data.discount
                  ? parseFloat(((data.discount / subTotal) * 100).toFixed(2))
                  : ""
              }
            />
          </div>

          <div className="text-right flex items-center justify-end h-full">
            <p className="h-min">Discount ₹</p>
          </div>
          <div className="relative w-full">
            <input
              placeholder="0"
              type="number"
              inputMode={"numeric"}
              className={`peer w-full rounded-md border border-slate-200 bg-white px-3 h-8 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100`}
              onChange={(e) => setData({ ...data, discount: Number(e.target.value) })}
              value={data.discount === 0 ? "" : parseFloat(data.discount.toFixed(2))}
            />
          </div>
        </div>

        <div
          className={`grid ${showAllFields ? "grid-cols-12" : "grid-cols-7"
            } gap-2 text-[11px] uppercase tracking-wide text-slate-500`}
        >
          <div
            className={`${showAllFields ? "col-span-10" : "col-span-5"}`}
          ></div>
          <div className="text-right">Sub Total</div>
          <div className="text-right font-medium">{formatINR(subTotal)}</div>
        </div>

        <div
          className={`grid ${showAllFields ? "grid-cols-12" : "grid-cols-7"
            } gap-2 text-[11px] uppercase tracking-wide text-slate-500`}
        >
          <div
            className={`${showAllFields ? "col-span-10" : "col-span-5"}`}
          ></div>
          <div className="text-right font-bold text-slate-900 text-sm">Grand Total</div>
          <div className="text-right font-bold text-emerald-700 text-sm">{formatINR(subTotal - data.discount)}</div>
        </div>
      </div>

    </div>

  );
}

const QuantityInput = ({
  updateField,
  i,
  m,
  onKeyDown,
  inputRef,
}: {
  updateField: (idx: number, key: keyof Medicine, val: string | number) => void;
  i: number;
  m: Medicine;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  inputRef?: React.RefObject<HTMLInputElement>;
}) => {
  const currentOptions = {
    dosage: ["½ tab", "1 tab", "2 tab"],
    duration: ["3 days", "5 days", "7 days", "10 days", "14 days", "28 days"],
    frequency: ["1-0-1", "1-1-1", "0-1-1", "1-0-0", "0-0-1"],
  };

  useEffect(() => {
    if (
      currentOptions.dosage.includes(m.dosage) &&
      currentOptions.frequency.includes(m.frequency)
    ) {
      const dosage =
        (currentOptions.dosage[0] === m.dosage && 0.5) ||
        (currentOptions.dosage[1] === m.dosage && 1) ||
        (currentOptions.dosage[2] === m.dosage && 2) ||
        0;
      const duration =
        (currentOptions.duration[0] === m.duration && 3) ||
        (currentOptions.duration[1] === m.duration && 5) ||
        (currentOptions.duration[2] === m.duration && 7) ||
        (currentOptions.duration[3] === m.duration && 10) ||
        (currentOptions.duration[4] === m.duration && 14) ||
        (currentOptions.duration[5] === m.duration && 28) ||
        Number(m.duration) ||
        0;
      const frequency =
        (currentOptions.frequency[0] === m.frequency && 2) ||
        (currentOptions.frequency[1] === m.frequency && 3) ||
        (currentOptions.frequency[2] === m.frequency && 2) ||
        (currentOptions.frequency[3] === m.frequency && 1) ||
        (currentOptions.frequency[4] === m.frequency && 1) ||
        0;
      if (dosage * duration * frequency > 0) {
        if (dosage * duration * frequency > m.availableQuantity) {
          setOpenWarning(true)
        }
        updateField(i, "quantity", Math.ceil(dosage * duration * frequency));
      }
    }
  }, [m.dosage, m.duration, m.frequency]);

  const [openWarning, setOpenWarning] = useState(false);

  return (
    <>
      <div className="relative w-full">
        <input
          ref={inputRef}
          placeholder="0"
          onChange={(e) => {
            const value = Number(e.target.value);
            updateField(i, "quantity", value || 0);
          }}
          onKeyDown={onKeyDown}
          inputMode={"numeric"}
          className={`peer w-full rounded-md border border-slate-200 bg-white px-2 h-9 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 font-medium`}
          value={m.quantity === 0 ? "" : m.quantity}
          onFocus={(e) => (e.target.placeholder = "")}
          onBlur={(e) => {
            e.target.placeholder = "0";
            const value = Number(e.target.value);
            if (value > m.availableQuantity) {
              setOpenWarning(true);
            }
          }}
        />
      </div>
      <AlertDialog open={openWarning} onOpenChange={setOpenWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Available quantity: {m.availableQuantity} <br />
              Entered quantity: {m.quantity}
              <br />
              <br />
              <span className="text-destructive">
                The quantity you entered exceeds the available stock.
              </span>{" "}
              Do you want to continue anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                updateField(i, "quantity", 0);
              }}
            >
              No
            </AlertDialogCancel>
            <AlertDialogAction>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

type LabeledComboboxProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  digitsOnly?: boolean; // e.g., for duration
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  inputRef?: React.RefObject<HTMLInputElement>;
};

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function LabeledCombobox({
  label,
  value,
  onChange,
  options,
  digitsOnly,
  onKeyDown,
  inputRef,
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="w-full">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={() => setOpen(true)}
              onClick={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              placeholder={label}
              className="peer w-full rounded-md border border-slate-200 bg-white px-2 h-9 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 relative"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
              ▼
            </span>
          </div>
        </PopoverTrigger>

        <PopoverContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="p-0 border-none shadow-none z-50 mt-1"
          style={{ width: containerRef.current?.offsetWidth }}
          align="start"
        >
          {options.length > 0 && (
            <div className="rounded-md border border-slate-200 bg-white shadow-lg max-h-56 overflow-y-auto p-1">
              {options.map((opt: string) => (
                <button
                  key={opt}
                  type="button"
                  className="w-full text-left px-2 py-1.5 rounded-md text-sm bg-white hover:bg-emerald-50 hover:text-emerald-700"
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
