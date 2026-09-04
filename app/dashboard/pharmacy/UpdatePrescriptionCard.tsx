import React, { useState, useEffect, useRef } from "react";


import { Item, OrderType } from "./interface";
import Medicine from "./Medicine";
import { Button } from "@/components/ui/button";
import { Trash, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import UpdateMedicine from "./UpdateMedicine";
import { fDate } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ------------------ Types ------------------
interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  food: string;
  duration: string;
  quantity: number;
}

const hasAllergyConflict = (generic?: string, allergies?: string) => {
  if (!generic || !allergies) return false;

  const normalize = (str: string) =>
    str.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2); // Filter out short words and units like 'mg', 'ml'

  const genericWords = normalize(generic);
  const allergyWords = normalize(allergies);

  return genericWords.some(word => allergyWords.includes(word));
};

export default function UpdatePrescriptionCard({
  data,
  setData,
  allergies
}: {
  data: OrderType;
  setData: React.Dispatch<React.SetStateAction<OrderType>>;
  allergies?: string
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

  const subTotal = data.items.reduce((a, b) => a + (b.quantity || 0) * (b.name.unitPrice || 0), 0);

  useEffect(() => {
    if (data.items.length > 0) {
      const lastIdx = data.items.length - 1;
      setTimeout(() => {
        const lastQtyInput = document.getElementById(`qty-input-${lastIdx}`);
        if (lastQtyInput) {
          lastQtyInput.focus();
          (lastQtyInput as HTMLInputElement).select();
        }
      }, 50);
    }
  }, [data.items.length]);


  return (
    <div className="rounded-lg border overflow-x-auto">
      <div className="rounded-t-lg min-w-310">
        <table className="w-full text-[15px]">
          <thead className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) text-white text-xs uppercase tracking-wider font-semibold">
            <tr className="w-full">
              <th className="p-3 text-left w-10">Sl</th>
              <th className="p-3 text-left min-w-45">Drug</th>
              <th className="p-3 text-left min-w-26.25">Dosage</th>
              <th className="p-3 text-left min-w-26.25">Frequency</th>
              <th className="p-3 text-left min-w-31.25">Food</th>
              <th className="p-3 text-left min-w-26.25">Duration</th>
              <th className="p-3 text-left min-w-20">Rack</th>
              <th className="p-3 text-left min-w-23.75">Exp</th>
              <th className="p-3 text-center min-w-20">Available</th>
              <th className="p-3 text-right min-w-21.25">Qty</th>
              <th className="p-3 text-right min-w-18.75">MRP</th>
              <th className="p-3 text-right min-w-20">Amount</th>
              <th className="p-3 text-right min-w-15">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((m, i) => (
              <tr key={i} className="border-b last:border-b-0 hover:bg-slate-50/80 transition-all duration-200 group">
                <td className="p-3 align-middle text-slate-500 font-medium text-sm">{i + 1}</td>
                <td className="p-3 align-middle">
                  <div className="flex items-center justify-start gap-2">
                    <div className="">
                      <div className="relative w-full">
                        <input
                          placeholder="Drug Name"
                          type="text"
                          disabled
                          className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none disabled:cursor-not-allowed"
                          value={m.name.name}
                        />
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-1 pl-0.5">
                        {m.name.generic ? <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Gen: {m.name.generic}</span> : null}
                      </div>
                    </div>
                    {hasAllergyConflict(m.name.generic, allergies) && (
                      <div className="mt-1 flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-100 w-fit">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-600 animate-pulse cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-rose-600 text-white border-none shadow-lg">
                              <p className="font-semibold">The patient is allergic to this medicine</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3 align-middle">
                  <ComboboxInput
                    label="Dosage"
                    value={m.dosage}
                    disabled={data.status === "Completed"}
                    onChange={(val) => updateField(i, "dosage", val)}
                    options={["½ tab", "1 tab", "2 tab", "5 ml", "10 ml", "20 ml"]}
                  />
                </td>
                <td className="p-3 align-middle">
                  <ComboboxInput
                    label="Frequency"
                    value={m.frequency}
                    disabled={data.status === "Completed"}
                    onChange={(val) => updateField(i, "frequency", val)}
                    options={["1-0-1", "1-1-1", "0-1-1", "1-0-0", "0-0-1", "SOS"]}
                  />
                </td>
                <td className="p-3 align-middle">
                  <ComboboxInput
                    label="Food"
                    value={m.food}
                    disabled={data.status === "Completed"}
                    onChange={(val) => updateField(i, "food", val)}
                    options={[
                      "After food",
                      "Before food",
                      "With food",
                      "Empty stomach",
                      "Anytime",
                    ]}
                  />
                </td>
                <td className="p-3 align-middle">
                  <ComboboxInput
                    label="Duration"
                    value={m.duration}
                    disabled={data.status === "Completed"}
                    onChange={(val) => updateField(i, "duration", val)}
                    options={[
                      "3 days",
                      "5 days",
                      "7 days",
                      "10 days",
                      "14 days",
                      "28 days",
                    ]}
                  />
                </td>
                <td className="p-3 align-middle text-sm text-slate-600">
                  {m?.name?.rackLocation || "-"}
                </td>
                <td className="p-3 align-middle text-sm text-slate-600">
                  {fDate(m.name.expiryDate)}
                </td>
                <td className="p-3 align-middle text-center font-medium text-slate-700">
                  {m.name.quantity}
                </td>
                <td className="p-3 align-middle">
                  <QuantityInput i={i} m={m} updateField={updateField} status={data.status} />
                </td>
                <td className="p-3 align-middle text-right text-sm font-medium text-slate-600 whitespace-nowrap">
                  {formatINR(m.name.unitPrice)}
                </td>
                <td className="p-3 align-middle text-right text-sm font-semibold text-slate-800 whitespace-nowrap">
                  {formatINR((m.quantity || 0) * (m.name.unitPrice || 0))}
                </td>
                <td className="p-3 align-middle text-right">
                  <Button
                    disabled={data.status === "Completed"}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    onClick={() => removeMedicineRow(i)}
                    title="Remove medicine"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t bg-slate-50 flex flex-col gap-3 rounded-b-lg">
        {data.status !== "Completed" && <UpdateMedicine addMedicineRow={addMedicineRow} />}

        <div className="flex flex-col gap-2 mt-2 w-full max-w-xs ml-auto border-t pt-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Sub Total</span>
            <span>{formatINR(subTotal)}</span>
          </div>


          <div className="flex justify-between items-center text-sm text-slate-600">
            <span>Amount Paid</span>
            <span>{formatINR(data.paidAmount ?? 0)}</span>
          </div>

          <div className="flex justify-between items-center text-sm text-slate-600">
            <span>Amount Due</span>
            <span className="text-red-600">{formatINR((subTotal - (data.discount || 0)) - (data.paidAmount ?? 0))}</span>
          </div>

          <div className="flex justify-between text-md font-semibold text-slate-800 border-t pt-2">
            <span>Grand Total</span>
            <span>{formatINR(subTotal - (data.discount || 0))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

type ComboboxInputProps = {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
};

const ComboboxInput = ({
  label,
  value,
  onChange,
  options,
  disabled,
}: ComboboxInputProps) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(value ?? "");
  }, [value]);

  const handleChange = (raw: string) => {
    setText(raw);
    onChange(raw);
    if (!disabled) setOpen(true);
  };

  const commit = (val: string) => {
    setText(val);
    onChange(val);
    setOpen(false);
  };

  return (
    <div className="relative w-full min-w-21.25" ref={containerRef}>
      <Popover open={open && !disabled} onOpenChange={(o) => !disabled && setOpen(o)}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <input
              disabled={disabled}
              value={disabled && !text ? "-" : text}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => !disabled && setOpen(true)}
              onClick={() => !disabled && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setOpen(false);
                  (e.target as HTMLElement).blur();
                }
              }}
              placeholder={label}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400 placeholder:font-normal disabled:bg-transparent disabled:border-transparent disabled:text-slate-700 disabled:cursor-default pr-4"
            />
            {!disabled && (
              <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[8px]">
                ▼
              </span>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="p-1 border border-slate-200 shadow-lg bg-white rounded-lg z-50 text-xs w-auto min-w-30"
          align="start"
        >
          <div className="max-h-44 overflow-y-auto space-y-0.5">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-emerald-50 hover:text-emerald-700 text-xs font-medium text-slate-700 transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(opt);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const QuantityInput = ({
  updateField,
  i,
  m,
  status,
}: {
  updateField: (idx: number, key: any, val: string | number) => void;
  i: number;
  m: Item;
  status: string;
}) => {
  const [openWarning, setOpenWarning] = useState(false);

  return (
    <>
      <div className="flex justify-end">
        <input
          disabled={status === "Completed"}
          placeholder="0"
          type="number"
          min="0"
          onChange={(e) =>
            updateField(i, "quantity", parseInt(e.target.value) || 0)
          }
          onBlur={(e) => {
            const value = parseInt(e.target.value) || 0;
            if (value > m.name.quantity) {
              setOpenWarning(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const drugSearch = document.getElementById("drug-search-input");
              if (drugSearch) {
                drugSearch.focus();
              }
            }
          }}
          id={`qty-input-${i}`}
          inputMode="numeric"
          className="w-20 text-right bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          value={m.quantity ? (m?.quantity === 0 ? "" : m?.quantity) : ""}
        />
      </div>

      <AlertDialog open={openWarning} onOpenChange={setOpenWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Available quantity: {m.name.quantity} <br />
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
