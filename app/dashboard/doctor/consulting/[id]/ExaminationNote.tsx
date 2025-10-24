"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DataType } from "./interface";
import { EllipsisVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
type FieldKey =
  | "HR"
  | "BP"
  | "SpO2"
  | "Temp"
  | "RS"
  | "CVS"
  | "PA"
  | "CNS"
  | "LE";

type FieldMeta = {
  id: FieldKey;
  label: string;
  type: "input" | "textarea";
  unit?: string;
};

type TemplateValues = Partial<Record<FieldKey | "otherNotes", string>>;

type Template = {
  id: string;
  name: string;
  description?: string;
  order: FieldKey[];
  enabled: FieldKey[];
  /** Saved text values for sections (includes otherNotes) */
  values?: TemplateValues;
};

const LS_KEYS = {
  order: "examNote:order:v1",
  enabled: "examNote:enabled:v1",
  templates: "examNote:templates:v1",
};

const ALL_FIELDS: Record<FieldKey, FieldMeta> = {
  HR: { id: "HR", label: "HR", type: "input", unit: "bpm" },
  BP: { id: "BP", label: "BP", type: "input", unit: "mmHg" },
  SpO2: { id: "SpO2", label: "SpO₂", type: "input", unit: "%" },
  Temp: { id: "Temp", label: "Temp", type: "input", unit: "C F" },
  RS: { id: "RS", label: "RS", type: "textarea" },
  CVS: { id: "CVS", label: "CVS", type: "textarea" },
  PA: { id: "PA", label: "P/A", type: "textarea" },
  CNS: { id: "CNS", label: "CNS", type: "textarea" },
  LE: { id: "LE", label: "L/E", type: "textarea" },
};

const BASE_KEYS: FieldKey[] = ["HR", "BP", "SpO2", "Temp"];
const EXTRA_KEYS: FieldKey[] = ["RS", "CVS", "PA", "CNS", "LE"];
const ALL_KEYS = Object.keys(ALL_FIELDS) as FieldKey[];
const isFieldKey = (x: unknown): x is FieldKey =>
  typeof x === "string" && (ALL_KEYS as string[]).includes(x as string);

// ---------- LocalStorage helpers ----------
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

const uid = () => Math.random().toString(36).slice(2, 9);

// ---------- Helpers to sync values ----------
function readCurrentValuesFromData(data: DataType): TemplateValues {
  const ex = data.examinationNote || ({} as DataType["examinationNote"]);
  return {
    // HR: ex.hr || "",
    // BP: ex.bp || "",
    // SpO2: ex.spo2 || "",
    // Temp: ex.temp || "",
    RS: ex.rs || "",
    CVS: ex.cvs || "",
    PA: ex.pa || "",
    CNS: ex.cns || "",
    LE: ex.le || "",
    otherNotes: ex.otherNotes || "",
  };
}

function applyTemplateValues(
  values: TemplateValues | undefined,
  setData: React.Dispatch<React.SetStateAction<DataType>>
) {
  if (!values) return;
  setData((prev) => {
    const ex = prev.examinationNote || ({} as DataType["examinationNote"]);
    return {
      ...prev,
      examinationNote: {
        ...ex,
        hr: values.HR ?? ex.hr ?? "",
        bp: values.BP ?? ex.bp ?? "",
        spo2: values.SpO2 ?? ex.spo2 ?? "",
        temp: values.Temp ?? ex.temp ?? "",
        rs: values.RS ?? ex.rs ?? "",
        cvs: values.CVS ?? ex.cvs ?? "",
        pa: values.PA ?? ex.pa ?? "",
        cns: values.CNS ?? ex.cns ?? "",
        le: values.LE ?? ex.le ?? "",
        otherNotes: values.otherNotes ?? ex.otherNotes ?? "",
      },
    };
  });
}

// ---------- Main Component ----------
export default function ExaminationNote({
  data,
  setData,
}: {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [enabledSections, setEnabledSections] = useState<FieldKey[]>([]);
  const [order, setOrder] = useState<FieldKey[]>(["HR", "BP", "SpO2", "Temp"]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplDesc, setTplDesc] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  useEffect(() => {
    const storedEnabled = safeRead<FieldKey[]>(LS_KEYS.enabled, []);
    const validEnabled = Array.isArray(storedEnabled)
      ? storedEnabled.filter(isFieldKey).filter((k) => EXTRA_KEYS.includes(k))
      : [];
    setEnabledSections(validEnabled);

    const storedOrder = safeRead<FieldKey[]>(LS_KEYS.order, BASE_KEYS);
    const validOrder = Array.isArray(storedOrder)
      ? storedOrder.filter(isFieldKey)
      : BASE_KEYS;

    const merged = Array.from(new Set([...validOrder, ...BASE_KEYS]));
    setOrder(merged);

    const storedTemplates = safeRead<Template[]>(LS_KEYS.templates, []);
    const cleanedTemplates = Array.isArray(storedTemplates)
      ? storedTemplates.map((t) => ({
          ...t,
          order: Array.isArray(t.order) ? t.order.filter(isFieldKey) : [],
          enabled: Array.isArray(t.enabled)
            ? t.enabled.filter(isFieldKey).filter((k) => EXTRA_KEYS.includes(k))
            : [],
          values: t.values, // keep if present
        }))
      : [];
    setTemplates(cleanedTemplates);

    setHydrated(true);
  }, [setData]);

  const visibleItems = useMemo(() => {
    const extras: FieldKey[] = enabledSections;

    const nextOrder = [...order];
    extras.forEach((k) => {
      if (!nextOrder.includes(k)) nextOrder.push(k);
    });

    const cleaned = nextOrder.filter(
      (k) => BASE_KEYS.includes(k) || extras.includes(k)
    );

    if (cleaned.join(",") !== order.join(",")) setOrder(cleaned);

    return cleaned;
  }, [enabledSections, order]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const toggleSection = (key: FieldKey) => {
    if (!EXTRA_KEYS.includes(key)) return;
    setEnabledSections((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
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

  // persist LS
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
    safeWrite<Template[]>(LS_KEYS.templates, templates);
  }, [templates, hydrated]);

  const resetLayout = () => {
    setSelectedTemplateId("");
    setEnabledSections([]);
    setOrder(BASE_KEYS);
    safeWrite<FieldKey[]>(LS_KEYS.enabled, []);
    safeWrite<FieldKey[]>(LS_KEYS.order, BASE_KEYS);
    setData((prev) => ({
      ...prev,
      examinationNote: { ...prev.examinationNote, otherNotes: null },
    }));
  };

  // ALWAYS save text content with the template
  const saveCurrentAsTemplate = () => {
    const name = tplName.trim();
    if (!name) return;
    const t: Template = {
      id: uid(),
      name,
      description: tplDesc.trim() || undefined,
      order: [...visibleItems],
      enabled: [...enabledSections],
      values: readCurrentValuesFromData(data),
    };
    setTemplates((prev) => [t, ...prev]);
    setSelectedTemplateId(t.id);
    setTplName("");
    setTplDesc("");
    setSaveOpen(false);
    setMenuOpen(false);
  };

  const applyTemplate = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;

    const mergedOrder = Array.from(new Set([...t.order, ...BASE_KEYS]));
    const cleanedOrder = mergedOrder.filter(
      (k) => BASE_KEYS.includes(k) || t.enabled.includes(k)
    );
    setOrder(cleanedOrder);
    setEnabledSections(t.enabled.filter((k) => EXTRA_KEYS.includes(k)));
    setSelectedTemplateId(id);
    setMenuOpen(false);
    setManageOpen(false);

    // restore values (including otherNotes)
    applyTemplateValues(t.values, setData);
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((x) => x.id !== id));
    if (selectedTemplateId === id) setSelectedTemplateId("");
  };

  return (
    <Card>
      <CardHeader className=" w-full col-span-full">
        <div className="flex items-center gap-2 w-full">
          <CardTitle>Examination Note</CardTitle>
          {selectedTemplateId ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Template:{" "}
              <b>{templates.find((t) => t.id === selectedTemplateId)?.name}</b>
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 relative w-full justify-between">
          <div className="hidden md:flex flex-wrap gap-2">
            {["RS", "CVS", "P/A", "CNS", "L/E"].map((raw) => {
              const key =
                (raw === "P/A" && ("PA" as FieldKey)) ||
                (raw === "L/E" && ("LE" as FieldKey)) ||
                (raw as FieldKey);
              const active = enabledSections.includes(key);
              return (
                <button
                  key={raw}
                  onClick={() => toggleSection(key)}
                  className={`px-3 py-1 rounded-full text-xs border transition hover:shadow-sm ${
                    active
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-white"
                  }`}
                >
                  {raw}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={resetLayout}
              className="px-2 py-1 text-xs rounded border hover:bg-slate-50"
              title="Reset layout (keeps values in UI)"
            >
              Reset layout
            </button>

            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen((s) => !s)}
                className="p-2 rounded-md bg-white border border-slate-200 shadow hover:shadow-md transition"
                title="Templates"
              >
                <EllipsisVertical className="h-4 w-4" />
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-30 overflow-hidden backdrop-blur"
                  >
                    <div className="p-3 border-b bg-gradient-to-r from-violet-50 to-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          Templates
                        </span>
                        <button
                          onClick={() => setSaveOpen(true)}
                          className="text-violet-700 hover:text-violet-900 text-xs font-semibold"
                        >
                          + Save Current
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          value={menuQuery}
                          onChange={(e) => setMenuQuery(e.target.value)}
                          placeholder="Search templates…"
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-emerald-300"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                          ⌘K
                        </span>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-auto divide-y divide-slate-100">
                      {templates.length === 0 ? (
                        <div className="p-5 text-sm text-slate-600 text-center">
                          No templates yet. <br />
                          Click <b>Save Current</b> to create one.
                        </div>
                      ) : (
                        templates
                          .filter(
                            (t) =>
                              !menuQuery.trim() ||
                              t.name
                                .toLowerCase()
                                .includes(menuQuery.toLowerCase())
                          )
                          .map((t) => (
                            <button
                              key={t.id}
                              onClick={() => applyTemplate(t.id)}
                              className={`group w-full text-left px-4 py-3 hover:bg-emerald-50 transition ${
                                selectedTemplateId === t.id
                                  ? "bg-emerald-50/60"
                                  : "bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 text-sm">
                                    🧩
                                  </span>
                                  <div>
                                    <div className="text-sm font-medium text-slate-800">
                                      {t.name}
                                    </div>
                                    {t.description && (
                                      <div className="text-xs text-slate-500 line-clamp-1">
                                        {t.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-emerald-700 opacity-0 group-hover:opacity-100">
                                  Apply
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {t.order.slice(0, 5).map((fid) => (
                                  <span
                                    key={fid}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border"
                                  >
                                    {fid === "PA"
                                      ? "P/A"
                                      : fid === "LE"
                                      ? "L/E"
                                      : fid}
                                  </span>
                                ))}
                                {t.order.length > 5 && (
                                  <span className="text-[10px] text-slate-500">
                                    +{t.order.length - 5} more
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                      )}
                    </div>

                    <div className="p-3 bg-gradient-to-r from-slate-50 to-violet-50 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setManageOpen(true)}
                        className="text-xs px-3 py-1.5 rounded-lg border hover:bg-slate-100"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => setMenuOpen(false)}
                        className="text-xs px-3 py-1.5 rounded-lg border hover:bg-slate-100"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="md:hidden mb-3 flex flex-wrap gap-2">
          {["RS", "CVS", "P/A", "CNS", "L/E"].map((raw) => {
            const key =
              (raw === "P/A" && ("PA" as FieldKey)) ||
              (raw === "L/E" && ("LE" as FieldKey)) ||
              (raw as FieldKey);
            const active = enabledSections.includes(key);
            return (
              <button
                key={raw}
                onClick={() => toggleSection(key)}
                className={`px-3 py-1 rounded-full text-xs border transition hover:shadow-sm ${
                  active
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-white"
                }`}
              >
                {raw}
              </button>
            );
          })}
        </div>

        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <SortableContext items={visibleItems} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 items-start">
              {visibleItems.map((key) => {
                const meta = ALL_FIELDS[key];
                if (meta.type === "input") {
                  return (
                    <DraggableField key={key} id={key}>
                      <LabeledInput
                        label={meta.label}
                        unit={meta.unit}
                        defaultValue={getInputValue(key, data)}
                        type={
                          meta.label === "Temp" || meta.label === "HR"
                            ? "number"
                            : "text"
                        }
                        onChange={(v) => {
                          setData((prev) => ({
                            ...prev,
                            examinationNote: {
                              ...prev.examinationNote,
                              ...(key === "HR" && { hr: v }),
                              ...(key === "BP" && { bp: v }),
                              ...(key === "SpO2" && { spo2: v }),
                              ...(key === "Temp" && { temp: v }),
                            },
                          }));
                        }}
                      />
                    </DraggableField>
                  );
                }

                return (
                  <DraggableField key={key} id={key}>
                    <LabeledTextarea
                      label={
                        (meta.label === "PA" && "P/A") ||
                        (meta.label === "LE" && "L/E") ||
                        meta.label
                      }
                      defaultValue={getTextareaValue(key, data)}
                      minRows={4}
                      onChange={(v) => {
                        setData((prev) => ({
                          ...prev,
                          examinationNote: {
                            ...prev.examinationNote,
                            ...(key === "RS" && { rs: v }),
                            ...(key === "CVS" && { cvs: v }),
                            ...(key === "PA" && { pa: v }),
                            ...(key === "CNS" && { cns: v }),
                            ...(key === "LE" && { le: v }),
                          },
                        }));
                      }}
                    />
                  </DraggableField>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        <LabeledTextarea
          label="Other Notes"
          defaultValue={data.examinationNote.otherNotes || ""}
          minRows={4}
          onChange={(v) =>
            setData((prev) => ({
              ...prev,
              examinationNote: { ...prev.examinationNote, otherNotes: v },
            }))
          }
        />
      </CardContent>

      {/* Save Template Modal */}
      <AnimatePresence>
        {saveOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSaveOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 w-[90%] md:w-[520px]"
            >
              <h3 className="text-lg font-semibold mb-4 text-slate-800">
                Save Layout as Template
              </h3>
              <input
                type="text"
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
                placeholder="Template Name"
                className="w-full border rounded-xl px-3 py-2 mb-3 focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="text"
                value={tplDesc}
                onChange={(e) => setTplDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full border rounded-xl px-3 py-2 mb-4 focus:ring-2 focus:ring-emerald-400"
              />
              <div className="text-xs text-slate-600 mb-3">
                This will also save current notes (RS, CVS, P/A, CNS, L/E, Other
                Notes).
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSaveOpen(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCurrentAsTemplate}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage Templates Modal */}
      <AnimatePresence>
        {manageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setManageOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 w-[95%] md:w-[720px]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Manage Templates
                </h3>
                <button
                  onClick={() => setManageOpen(false)}
                  className="text-slate-600 hover:text-slate-800"
                >
                  ✕
                </button>
              </div>
              {templates.length === 0 ? (
                <p className="text-slate-600">No templates yet.</p>
              ) : (
                <ul className="space-y-3">
                  {templates.map((t) => (
                    <li
                      key={t.id}
                      className="rounded-2xl border p-3 hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-800">
                            {t.name}
                          </div>
                          {t.description && (
                            <div className="text-sm text-slate-600">
                              {t.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => applyTemplate(t.id)}
                            className="px-3 py-1.5 rounded-lg border hover:bg-emerald-50"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => deleteTemplate(t.id)}
                            className="px-3 py-1.5 rounded-lg border text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {t.order.map((fid) => (
                          <span
                            key={fid}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border"
                          >
                            {fid === "PA" ? "P/A" : fid === "LE" ? "L/E" : fid}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ---------- value readers ----------
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
    case "LE":
      return ex.le || "";
    default:
      return "";
  }
}

// ---------- DnD wrapper ----------
function DraggableField({
  id,
  children,
}: {
  id: FieldKey;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
      aria-roledescription="draggable"
    >
      <div
        className="absolute z-20 -right-2 -top-2 p-0.5 grid place-items-center rounded-md border bg-white/80 cursor-grab"
        {...attributes}
        {...listeners}
        aria-label="drag handle"
      >
        <EllipsisVertical className="h-3 w-3 text-slate-500" />
      </div>

      {children}
    </div>
  );
}

// ---------- Inputs ----------
type LabeledInputProps = {
  label: string;
  defaultValue?: string;
  type?: string;
  unit?: string;
  right?: ReactNode;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onChange?: (value: string) => void;
};

function LabeledInput({
  label,
  defaultValue,
  type = "text",
  unit,
  right,
  onKeyDown,
  onChange,
}: LabeledInputProps) {
  const hasRight = Boolean(right);
  return (
    <div className="relative w-full">
      <input
        defaultValue={defaultValue}
        onKeyDown={onKeyDown}
        onChange={(e) => onChange?.(e.target.value)}
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

type LabeledTextareaProps = {
  label: string;
  defaultValue?: string;
  minRows?: number;
  onChange?: (value: string) => void;
};

function LabeledTextarea({
  label,
  defaultValue,
  minRows = 4,
  onChange,
}: LabeledTextareaProps) {
  const minHeight = Math.max(56, minRows * 24);
  return (
    <div className="relative w-full">
      <textarea
        defaultValue={defaultValue}
        placeholder=" "
        style={{ minHeight }}
        onChange={(e) => onChange?.(e.target.value)}
        className="peer w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      />
      <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
        {label}
      </label>
    </div>
  );
}
