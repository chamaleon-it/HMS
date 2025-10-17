import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { KeyboardEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { DataType } from "./interface";
import { EllipsisVertical } from "lucide-react";

// dnd-kit
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ---------- Types ----------
type FieldKey = "HR" | "BP" | "SpO2" | "Temp" | "RS" | "CVS" | "PA" | "CNS";

type FieldMeta = {
  id: FieldKey;
  label: string;
  type: "input" | "textarea";
  unit?: string;
};

// Base meta for all possible fields
const ALL_FIELDS: Record<FieldKey, FieldMeta> = {
  HR: { id: "HR", label: "HR", type: "input", unit: "bpm" },
  BP: { id: "BP", label: "BP", type: "input", unit: "mmHg" },
  SpO2: { id: "SpO2", label: "SpO₂", type: "input", unit: "%" },
  Temp: { id: "Temp", label: "Temp", type: "input" },
  RS: { id: "RS", label: "RS", type: "textarea" },
  CVS: { id: "CVS", label: "CVS", type: "textarea" },
  PA: { id: "PA", label: "P/A", type: "textarea" },
  CNS: { id: "CNS", label: "CNS", type: "textarea" },
};

// ---------- LocalStorage keys (bump :v2 if you change shape) ----------
const LS_KEYS = {
  order: "examNote:order:v1",
  enabled: "examNote:enabled:v1",
  values: "examNote:values:v1",
};

// ---------- Small utils ----------
const ALL_KEYS = Object.keys(ALL_FIELDS) as FieldKey[];
const isFieldKey = (x: unknown): x is FieldKey => typeof x === "string" && (ALL_KEYS as string[]).includes(x as string);

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

export default function ExaminationNote({
  data,
  setData,
}: {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
}) {
  // Hydration guard so we don't write before we read
  const [hydrated, setHydrated] = useState(false);

  // Which optional sections are ON
  const [enabledSections, setEnabledSections] = useState<FieldKey[]>([]);

  // The current order of all fields (both vitals + optional when enabled)
  const [order, setOrder] = useState<FieldKey[]>(["HR", "BP", "SpO2", "Temp"]);

  // ---------- Hydrate from localStorage on mount ----------
  useEffect(() => {
    // enabled sections
    const storedEnabled = safeRead<FieldKey[]>(LS_KEYS.enabled, []);
    const validEnabled = storedEnabled.filter(isFieldKey).filter((k) => !["HR", "BP", "SpO2", "Temp"].includes(k)); // extras only
    setEnabledSections(validEnabled);

    // order
    const storedOrder = safeRead<FieldKey[]>(LS_KEYS.order, ["HR", "BP", "SpO2", "Temp"]);
    const validOrder = storedOrder.filter(isFieldKey);
    // Ensure base vitals exist at least once
    const base: FieldKey[] = ["HR", "BP", "SpO2", "Temp"];
    const merged = Array.from(new Set([...validOrder, ...base]));
    setOrder(merged);

    // values
    const storedValues = safeRead<Partial<DataType["examinationNote"]>>(LS_KEYS.values, {});
    if (storedValues && Object.keys(storedValues).length > 0) {
      setData((prev) => ({
        ...prev,
        examinationNote: {
          ...prev.examinationNote,
          ...storedValues,
        },
      }));
    }

    setHydrated(true);
  }, [setData]);

  // Build the list of visible items based on current toggles + order
  const visibleItems = useMemo(() => {
    const base: FieldKey[] = ["HR", "BP", "SpO2", "Temp"];
    const extras: FieldKey[] = enabledSections;

    const nextOrder = [...order];
    extras.forEach((k) => {
      if (!nextOrder.includes(k)) nextOrder.push(k);
    });
    // Remove any disabled extras from order
    const cleaned = nextOrder.filter((k) => base.includes(k) || extras.includes(k));

    // Keep state in sync if we changed it
    if (cleaned.join(",") !== order.join(",")) setOrder(cleaned);

    return cleaned;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledSections, order]);

  // dnd sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const toggleSection = (key: FieldKey) => {
    if (!["RS", "CVS", "PA", "CNS"].includes(key)) return;
    setEnabledSections((prev) =>
      prev.includes(key as FieldKey) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIndex = visibleItems.findIndex((i) => i === active.id);
      const newIndex = visibleItems.findIndex((i) => i === over.id);
      setOrder((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  // ---------- Persist to localStorage when things change ----------
  useEffect(() => {
    if (!hydrated) return;
    safeWrite<FieldKey[]>(LS_KEYS.enabled, enabledSections);
  }, [enabledSections, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    safeWrite<FieldKey[]>(LS_KEYS.order, order);
  }, [order, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    safeWrite(LS_KEYS.values, data.examinationNote || {});
  }, [data.examinationNote, hydrated]);

  // Optional helper: reset layout (keeps values)
  const resetLayout = () => {
    setEnabledSections([]);
    setOrder(["HR", "BP", "SpO2", "Temp"]);
    safeWrite<FieldKey[]>(LS_KEYS.enabled, []);
    safeWrite<FieldKey[]>(LS_KEYS.order, ["HR", "BP", "SpO2", "Temp"]);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Examination Note</CardTitle>

        {/* Toggle chips */}
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-2">
            {["RS", "CVS", "P/A", "CNS"].map((raw) => {
              const key = raw === "P/A" ? ("PA" as FieldKey) : (raw as FieldKey);
              const active = enabledSections.includes(key);
              return (
                <button
                  key={raw}
                  onClick={() => toggleSection(key)}
                  className={`px-3 py-1 rounded-full text-xs border transition hover:shadow-sm ${
                    active ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white"
                  }`}
                >
                  {raw}
                </button>
              );
            })}
          </div>

          {/* Reset layout button (optional) */}
          <button
            onClick={resetLayout}
            className="ml-2 px-2 py-1 text-xs rounded border hover:bg-slate-50"
            title="Reset layout (keeps values)"
          >
            Reset layout
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <SortableContext items={visibleItems} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 items-start">
              {visibleItems.map((key) => {
                const meta = ALL_FIELDS[key];
                if (meta.type === "input") {
                  return (
                    <DraggableField key={key} id={key} >
                      <LabeledInput
                        label={meta.label}
                        unit={meta.unit}
                        value={getInputValue(key, data)}
                        onChange={(val) =>
                          setData((prev) => ({
                            ...prev,
                            examinationNote: {
                              ...prev.examinationNote,
                              ...setInputValue(key, val),
                            },
                          }))
                        }
                        type={meta.label === "Temp" || meta.label === "HR" ? "number" : "text"}
                      />
                    </DraggableField>
                  );
                }
                // textarea
                return (
                  <DraggableField key={key} id={key}>
                    <LabeledInput
                      label={meta.label === "PA" ? "P/A" : meta.label}
                      value={getTextareaValue(key, data)}
                      onChange={(val) =>
                        setData((prev) => ({
                          ...prev,
                          examinationNote: {
                            ...prev.examinationNote,
                            ...setTextareaValue(key, val,),
                          },
                        }))
                      }
                    />
                  </DraggableField>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {/* Other Notes (not sortable, fixed at bottom) */}
        <LabeledTextarea
          label="Other Notes"
          value={data.examinationNote.otherNotes || ""}
          onChange={(val) => {
            setData((prev) => ({
              ...prev,
              examinationNote: { ...prev.examinationNote, otherNotes: val },
            }));
          }}
          minRows={4}
        />
      </CardContent>
    </Card>
  );
}

// ---------- Helpers to map keys <-> data.examinationNote ----------
function getInputValue(key: FieldKey, data: DataType): string {
  const ex = data.examinationNote;
  switch (key) {
    case "HR":
      return ex.hr || "";
    case "BP":
      return ex.bp || "";
    case "SpO2":
      return ex.spo2 || "";
    case "Temp":
      return ex.temp || "";
    default:
      return "";
  }
}

function setInputValue(
  key: FieldKey,
  val: string,
): Partial<DataType["examinationNote"]> {
  switch (key) {
    case "HR":
      return { hr: val };
    case "BP":
      return { bp: val };
    case "SpO2":
      return { spo2: val };
    case "Temp":
      return { temp: val };
    default:
      return {};
  }
}

function getTextareaValue(key: FieldKey, data: DataType): string {
  const ex = data.examinationNote;
  switch (key) {
    case "RS":
      return ex.rs || "";
    case "CVS":
      return ex.cvs || "";
    case "PA":
      return ex.pa || "";
    case "CNS":
      return ex.cns || "";
    default:
      return "";
  }
}

function setTextareaValue(
  key: FieldKey,
  val: string,
): Partial<DataType["examinationNote"]> {
  switch (key) {
    case "RS":
      return { rs: val };
    case "CVS":
      return { cvs: val };
    case "PA":
      return { pa: val };
    case "CNS":
      return { cns: val };
    default:
      return {};
  }
}

// ---------- Sortable wrapper with 3-dot grab handle ----------
function DraggableField({
  id,
  
  children,
}: {
  id: FieldKey;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative overflow-visible"
      {...attributes}
      {...listeners} // drag from anywhere
      aria-roledescription="draggable"
    >
      <div
        className={`rounded-xl bg-white transition ${
          isDragging ? "ring-2 ring-emerald-300 shadow-md" : "border-slate-200"
        }`}
      >
        <div className="absolute z-20 -right-2 -top-2 p-0.5 grid place-items-center rounded-md border bg-white/80">
          <EllipsisVertical className="h-3 w-3 text-slate-500" />
        </div>

        {children}
      </div>
    </div>
  );
}

// ---------- Inputs ----------
type LabeledInputProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  unit?: string;
  right?: ReactNode;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  unit,
  right,
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
        inputMode={type === "number" ? "numeric" : undefined}
        className={`peer w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 ${
          hasRight ? "pr-24" : unit ? "pr-12" : ""
        }`}
      />
      <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
        {label}
      </label>
      {hasRight ? (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">{right}</span>
      ) : unit ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
          {unit}
        </span>
      ) : null}
    </div>
  );
}

type LabeledTextareaProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  minRows?: number;
};

function LabeledTextarea({
  label,
  value,
  onChange,
  minRows = 4,
}: LabeledTextareaProps) {
  const minHeight = Math.max(56, minRows * 24);
  return (
    <div className="relative w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        style={{ minHeight }}
        className="peer w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      />
      <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
        {label}
      </label>
    </div>
  );
}
