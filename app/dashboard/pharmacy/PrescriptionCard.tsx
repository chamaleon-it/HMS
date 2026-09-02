"use client";

import React, { useEffect, useRef, useState } from "react";

import { DataType } from "./interface";
import Medicine from "./Medicine";
import { Button } from "@/components/ui/button";
import { Trash, ChevronDown, Package, Calendar, Layers } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import api from "@/lib/axios";

// ------------------ Types ------------------
interface Medicine {
  rowId: string;
  name: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  food: string;
  duration: string;
  quantity: number;
  availableQuantity: number;
  unitPrice: number;
  rackLocation?: string;
  batchNumber?: string;
  selectedBatchId?: string;
  packing?: number;
  batches?: any[];
}

function BatchSelector({
  m,
  i,
  updateField,
}: {
  m: Medicine;
  i: number;
  updateField: (idx: number, key: keyof Medicine, val: any) => void;
}) {
  const [open, setOpen] = useState(false);
  // Only include active non-deleted batches with available units (> 0)
  const batches = (m.batches || []).filter(
    (b: any) =>
      !b.isDeleted &&
      b.isActive !== false &&
      b.status !== "Inactive" &&
      (Number(b.quantity) || 0) > 0
  );

  const currentBatch = batches.find(
    (b: any) =>
      (m.selectedBatchId && String(b._id) === String(m.selectedBatchId)) ||
      (m.batchNumber && b.batchNumber === m.batchNumber)
  );

  const activeBatchNum = currentBatch
    ? currentBatch.batchNumber
    : batches.length > 0
      ? batches[0].batchNumber
      : "-";

  useEffect(() => {
    if (
      batches.length > 0 &&
      (!currentBatch ||
        (m.batchNumber && !batches.some((b: any) => b.batchNumber === m.batchNumber)))
    ) {
      const firstAvailable = batches[0];
      updateField(i, "batchNumber", firstAvailable.batchNumber);
      updateField(i, "selectedBatchId", firstAvailable._id);
      updateField(i, "availableQuantity", Number(firstAvailable.quantity) || 0);
      updateField(i, "packing", firstAvailable.pack ?? m.packing ?? 0);
      const newPrice =
        firstAvailable.unitPrice || firstAvailable.mrp || m.unitPrice || 0;
      if (newPrice) {
        updateField(i, "unitPrice", newPrice);
      }
    } else if (batches.length === 0 && m.batchNumber && m.batchNumber !== "-") {
      updateField(i, "batchNumber", "-");
      updateField(i, "selectedBatchId", "");
      updateField(i, "availableQuantity", 0);
    }
  }, [batches, currentBatch, m.batchNumber, i, updateField, m.packing, m.unitPrice]);

  if (!batches || batches.length === 0) {
    return (
      <input
        placeholder="-"
        disabled
        className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 h-9 text-xs outline-none text-slate-600 font-mono font-medium text-center"
        value={activeBatchNum}
      />
    );
  }

  const handleSelectBatch = async (batch: any) => {
    updateField(i, "batchNumber", batch.batchNumber);
    updateField(i, "selectedBatchId", batch._id);
    updateField(i, "availableQuantity", batch.quantity);
    updateField(i, "packing", batch.pack ?? m.packing ?? 0);
    const newPrice = batch.unitPrice || batch.mrp || m.unitPrice || 0;
    if (newPrice) {
      updateField(i, "unitPrice", newPrice);
    }
    setOpen(false);

    if (m.name && batch._id) {
      try {
        await api.patch(`/pharmacy/items/${m.name}/active-batch`, { batchId: batch._id });
        toast.success(`Active batch updated to ${batch.batchNumber}`);
      } catch (err) {
        console.error("Failed to update active batch on backend", err);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full h-9 px-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-between text-xs font-mono font-medium text-slate-700 shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-emerald-400 cursor-pointer"
          title="Click to change active batch"
        >
          <span className="truncate">{activeBatchNum}</span>
          <div className="flex items-center gap-1 shrink-0 ml-1">
            {batches.length > 1 && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">
                {batches.length}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-xl border-slate-200 rounded-lg z-50 overflow-hidden" align="start">
        <div className="bg-slate-900 text-white p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-xs truncate max-w-50">
              {m.medicineName || "Select Batch"}
            </span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
            {batches.length} {batches.length === 1 ? "batch" : "batches"}
          </span>
        </div>
        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 bg-white">
          {batches.map((batch: any, bIdx: number) => {
            const isSelected =
              (m.selectedBatchId && (batch._id === m.selectedBatchId || batch._id?.toString() === m.selectedBatchId?.toString())) ||
              batch.batchNumber === activeBatchNum;

            const expDateStr = batch.expiryDate
              ? new Date(batch.expiryDate).toLocaleDateString("en-IN", { month: "2-digit", year: "numeric" })
              : "-";

            const price = batch.unitPrice || batch.mrp || m.unitPrice || 0;

            return (
              <div
                key={batch._id || bIdx}
                onClick={() => handleSelectBatch(batch)}
                className={`p-2.5 cursor-pointer transition-colors flex items-center justify-between text-xs hover:bg-emerald-50/70 ${isSelected ? "bg-emerald-50 border-l-4 border-l-emerald-500 font-medium" : ""
                  }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                    <span>{batch.batchNumber}</span>
                    {isSelected && (
                      <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-sans uppercase font-bold tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Exp: {expDateStr}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Layers className="w-3 h-3 text-slate-400" />
                      Pack: {batch.pack ?? m.packing ?? 0}
                    </span>
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="font-bold text-slate-900">₹{price.toFixed(2)}</div>
                  <div className="text-[11px] font-semibold text-emerald-700">
                    {batch.quantity} units
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
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
    val: any
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
          food: "After food",
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

    <div className="border rounded-xl bg-white shadow-sm max-h-[50vh] overflow-y-auto overflow-x-auto">
      <div className="flex flex-col w-full min-w-full">
        <div
          className={`grid ${showAllFields ? "grid-cols-[30px_2.8fr_repeat(4,0.8fr)_0.7fr_0.5fr_0.5fr_0.5fr_0.6fr_0.7fr_0.75fr_30px]" : "grid-cols-[30px_2.8fr_0.7fr_0.5fr_0.5fr_0.5fr_0.6fr_0.7fr_0.75fr_30px]"} gap-1 text-[11px] uppercase font-bold tracking-wider text-slate-500 py-2 border-b bg-slate-50/50 px-2 rounded-t-lg`}
        >
          <div className="flex items-center justify-center">Sl</div>
          <div>Drug</div>
          {showAllFields && (
            <>
              <div>Dosage</div>
              <div>Freq</div>
              <div>Food</div>
              <div>Dur</div>
            </>
          )}
          <div>Batch</div>
          <div>Pack</div>
          <div>Rack</div>
          <div>Avail</div>
          <div>Qty</div>
          <div>Price</div>
          <div>Total</div>
          <div className="text-right pr-2">Act</div>
        </div>

        {data.items.map((m, i) => (
          <div
            key={m.rowId}
            className={`grid ${showAllFields ? "grid-cols-[30px_2.8fr_repeat(4,0.8fr)_0.7fr_0.5fr_0.5fr_0.5fr_0.6fr_0.7fr_0.75fr_30px]" : "grid-cols-[30px_2.8fr_0.7fr_0.5fr_0.5fr_0.5fr_0.6fr_0.7fr_0.75fr_30px]"} gap-1 items-center py-1 px-2 border-b last:border-b-0 hover:bg-slate-50/50 transition-colors`}
          >
            <div className="flex items-center justify-center text-slate-400 text-[11px] font-medium">
              {i + 1}
            </div>
            <div>
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
                <div>
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

                <div>
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

                <div>
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

                <div>
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
            <div>
              <BatchSelector m={m} i={i} updateField={updateField} />
            </div>
            <div>
              <input
                placeholder="-"
                disabled
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 h-9 text-xs outline-none text-slate-600 font-semibold text-center"
                value={m.packing !== undefined && m.packing !== null ? m.packing : "-"}
              />
            </div>
            <div>
              <input
                placeholder="-"
                disabled
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 h-9 text-sm outline-none text-slate-500 font-medium text-center"
                value={m.rackLocation || "-"}
              />
            </div>
            <div>
              <input
                placeholder="0"
                disabled
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 h-9 text-sm outline-none text-slate-500 font-medium"
                value={m.availableQuantity || 0}
              />
            </div>
            <div>
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

            <div>
              <input
                placeholder="0.00"
                disabled
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-1.5 h-9 text-xs outline-none text-slate-500 font-medium text-right"
                value={m.unitPrice === 0 ? "" : m.unitPrice.toFixed(2)}
              />
            </div>

            <div>
              <input
                placeholder="0.00"
                disabled
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-1.5 h-9 text-xs outline-none text-slate-500 font-bold text-right"
                value={m.unitPrice * m.quantity === 0 ? "" : (m.unitPrice * m.quantity).toFixed(2)}
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 cursor-pointer transition-colors"
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md h-8"
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
