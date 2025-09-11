"use client";
import React, { useState, useMemo, useRef, ReactNode } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";

// ------------------------- Utils -------------------------
export function to12Hour(time24: string): string {
  const [h, m] = String(time24).split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
}

// ----------------- UI Primitives -----------------
type CardProps = { children: ReactNode };
const Card = ({ children }: CardProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">{children}</div>
);
const CardHeader = ({ children }: CardProps) => (
  <div className="px-5 pt-5 pb-3 border-b border-slate-100">{children}</div>
);
const CardTitle = ({ children }: CardProps) => (
  <h3 className="text-lg font-bold text-slate-800 tracking-wide">{children}</h3>
);
const CardSubtitle = ({ children }: CardProps) => (
  <p className="mt-1 text-xs text-slate-500">{children}</p>
);
const CardContent = ({ children }: CardProps) => (
  <div className="p-5 space-y-4">{children}</div>
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };
const Button = ({ children, className = "", ...props }: ButtonProps) => (
  <button
    className={`inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 active:scale-[0.99] transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Floating label input
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

function LabeledInput({ label, value, onChange, type = "text", unit, right, inputMode, onKeyDown }: LabeledInputProps) {
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
        className={`peer w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 ${hasRight ? 'pr-24' : unit ? 'pr-12' : ''}`}
      />
      <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
        {label}
      </label>
      {hasRight ? (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">{right}</span>
      ) : unit ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">{unit}</span>
      ) : null}
    </div>
  );
}

// Floating-label Combobox (typable + searchable)
type LabeledComboboxProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  digitsOnly?: boolean; // e.g., for duration
};

function LabeledCombobox({ label, value, onChange, options, digitsOnly }: LabeledComboboxProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => { setText(value ?? ""); }, [value]);

  const filtered = useMemo(() => {
    const q = (text || "").toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [text, options]);

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
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder=" "
        className="peer w-full rounded-xl border border-slate-200 bg-transparent px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 z-20 relative"
      />
      <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
        {label}
      </label>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</span>

      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 z-20 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg max-h-56 overflow-y-auto p-1">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              className="w-full text-left px-2 py-1.5 rounded-lg text-sm hover:bg-emerald-50 hover:text-emerald-700"
              onMouseDown={(e) => { e.preventDefault(); commit(opt); }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Badge
const Badge = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${className}`}>{children}</span>
);

// --------------------------- Prescriptions Only ---------------------------
export type RxRow = { drug: string; dosage: string; freq: string; food: string; duration: string; notes: string };

const dosageOptions = ["½ tab", "1 tab", "2 tab", "5 ml", "10 ml", "20 ml"];
const freqOptions   = ["1-0-1", "1-1-1", "0-1-1", "1-0-0", "0-0-1", "SOS"];
const foodOptions   = ["After food", "Before food", "With food", "Empty stomach", "Anytime"];
const durationOptions = ["3", "5", "7", "10", "14", "28"];

const allergyList = new Set(["penicillin", "amoxicillin", "ibuprofen", "aspirin"]);
export const drugHitsAllergy = (drug: string) => {
  const norm = drug.toLowerCase();
  for (const a of allergyList) {
    if (a && norm.includes(a)) return true;
  }
  return false;
};

export default function PrescriptionsCard() {
  const [prescriptions, setPrescriptions] = useState<RxRow[]>([
    { drug: "", dosage: "", freq: "", food: "", duration: "", notes: "" },
  ]);

  const hasAnyAllergy = prescriptions.some((p) => drugHitsAllergy(p.drug));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescriptions</CardTitle>
        <CardSubtitle>Typable + searchable dosage, frequency, food timing, and duration</CardSubtitle>
      </CardHeader>
      <CardContent>
        {hasAnyAllergy && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">One or more drugs match the patient&apos;s allergy list. Review carefully.</span>
          </div>
        )}

        {/* Header row */}
        <div className="grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wide text-slate-500 mt-2">
          <div className="col-span-3">Drug</div>
          <div className="col-span-2">Dosage</div>
          <div className="col-span-2">Frequency</div>
          <div className="col-span-2">Food</div>
          <div className="col-span-1">Duration</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {prescriptions.map((p, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 mt-2 items-start">
            <div className="col-span-3">
              <div className="relative">
                <LabeledInput
                  label="Drug"
                  value={p.drug}
                  onChange={(v) =>
                    setPrescriptions((rows) => rows.map((r, j) => (j === i ? { ...r, drug: v } : r)))
                  }
                />
                {drugHitsAllergy(p.drug) && (
                  <Badge className="absolute -top-2 -right-2 border-red-200 bg-red-100 text-red-700">Allergy</Badge>
                )}
              </div>
            </div>

            <div className="col-span-2">
              <LabeledCombobox
                label="Dosage"
                value={p.dosage}
                onChange={(v) => setPrescriptions((rows) => rows.map((r, j) => (j === i ? { ...r, dosage: v } : r)))}
                options={dosageOptions}
              />
            </div>

            <div className="col-span-2">
              <LabeledCombobox
                label="Frequency"
                value={p.freq}
                onChange={(v) => setPrescriptions((rows) => rows.map((r, j) => (j === i ? { ...r, freq: v } : r)))}
                options={freqOptions}
              />
            </div>

            <div className="col-span-2">
              <LabeledCombobox
                label="Food"
                value={p.food}
                onChange={(v) => setPrescriptions((rows) => rows.map((r, j) => (j === i ? { ...r, food: v } : r)))}
                options={foodOptions}
              />
            </div>

            <div className="col-span-1">
              <LabeledCombobox
                label="Duration"
                value={p.duration}
                onChange={(v) => setPrescriptions((rows) => rows.map((r, j) => (j === i ? { ...r, duration: v } : r)))}
                options={durationOptions}
                digitsOnly
              />
            </div>

            <div className="col-span-2 flex justify-end gap-2">
              <Button
                className="!bg-emerald-600 hover:!bg-emerald-700 text-white !border-emerald-600"
                onClick={() =>
                  setPrescriptions((rows) => [
                    ...rows,
                    { drug: "", dosage: "1 tab", freq: "1-0-1", food: "After food", duration: "5", notes: "" },
                  ])
                }
                title="Add another medicine"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                className="!bg-red-600 hover:!bg-red-700 text-white !border-red-600"
                onClick={() =>
                  setPrescriptions((rows) =>
                    rows.length === 1
                      ? [{ drug: "", dosage: "1 tab", freq: "1-0-1", food: "After food", duration: "5", notes: "" }]
                      : rows.filter((_, j) => j !== i)
                  )
                }
                title="Remove this medicine"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Optional notes per line */}
            {/* <div className="col-span-12 -mt-1">
              <LabeledInput
                label="Notes (optional)"
                value={p.notes}
                onChange={(v) => setPrescriptions((rows) => rows.map((r, j) => (j === i ? { ...r, notes: v } : r)))}
              />
            </div> */}
          </div>
        ))}

        <div className="pt-2">
          <Button
            onClick={() =>
              setPrescriptions((rows) => [
                ...rows,
                { drug: "", dosage: "1 tab", freq: "1-0-1", food: "After food", duration: "5", notes: "" },
              ])
            }
            className="mt-2 w-fit !bg-emerald-600 hover:!bg-emerald-700 text-white !border-emerald-600"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Medicine
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// -------------------- Tiny Runtime Tests --------------------
if (typeof window !== "undefined") {
  console.assert(to12Hour("00:00") === "12:00 AM", "to12Hour midnight failed");
  console.assert(to12Hour("12:00") === "12:00 PM", "to12Hour noon failed");
  console.assert(to12Hour("13:30") === "1:30 PM", "to12Hour 13:30 failed");
  console.assert(to12Hour("09:05") === "9:05 AM", "to12Hour 09:05 failed");
  console.assert(to12Hour("23:59") === "11:59 PM", "to12Hour 23:59 failed");
  console.assert(to12Hour("01:00") === "1:00 AM", "to12Hour 01:00 failed");
  console.assert(to12Hour("12:01") === "12:01 PM", "to12Hour 12:01 failed");
  // Extra edge cases
  console.assert(to12Hour("00:01") === "12:01 AM", "to12Hour 00:01 failed");
  console.assert(to12Hour("12:59") === "12:59 PM", "to12Hour 12:59 failed");
  console.assert(to12Hour("20:00") === "8:00 PM", "to12Hour 20:00 failed");
  console.assert(to12Hour("07:00") === "7:00 AM", "to12Hour 07:00 failed");
  // Allergy helper sanity checks
  console.assert((() => drugHitsAllergy("Amoxicillin 500mg"))() === true, "drugHitsAllergy positive failed");
  console.assert((() => drugHitsAllergy("Paracetamol"))() === false, "drugHitsAllergy negative failed");
}
