import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState } from "react";

import { fDateandTime } from "@/lib/fDateAndTime";
import { DataType } from "./interface";
import { Consultations } from "./History";
import { EllipsisVertical, Pencil, Plus, X } from "lucide-react";
import OptionButton from "./OptionButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PRESENT_HISTORY = [
  "Left Knee Pain",
  "Right Knee Pain",
  "Multiple Join Pain",
  "Frozen Shoulder",
];

const DIAGNOSIS = [
  "Left Knee Pain",
  "Right Knee Pain",
  "Multiple Join Pain",
  "Frozen Shoulder",
];

const PAST_HISTORY = ["HTN", "CAD", "COPD", "Hyperthyroid", "Hypothyroid", "CKD", "MASLD", "PCOD"];

interface Props {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
  consulting: Consultations[];
}

const STORAGE_KEY = "consultation_values";

export default function ConsultationNotes({
  data,
  setData,
  consulting,
}: Props) {
  const [presentHistory, setPresentHistory] = useState<string[]>([]);
  const [pastHistory, setPastHistory] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState<string[]>([]);

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      consultationNotes: {
        ...prev.consultationNotes,
        pastHistory: consulting[0]?.consultationNotes.pastHistory ?? null,
      },
    }));
  }, [consulting, setData]);

  const [values, setValues] = useState<{
    presentHistory: string[];
    pastHistory: string[];
    diagnosis: string[];
  }>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      presentHistory: PRESENT_HISTORY,
      pastHistory: PAST_HISTORY,
      diagnosis: DIAGNOSIS,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }, [values]);

  const [editable, setEditable] = useState<
    "diagnosis" | "pastHistory" | "presentHistory" | null
  >(null);

  const [addValues, setAddValues] = useState<
    "diagnosis" | "pastHistory" | "presentHistory" | null
  >(null);

  const [value, setValue] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultation Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {values.presentHistory.map((c) => (
            <OptionButton
              key={c}
              value={c}
              selectedValues={presentHistory}
              setSelectedValues={setPresentHistory}
              setValues={setValues}
              setData={setData}
              fieldName="presentHistory"
              editable={editable}
            />
          ))}

          {addValues !== "presentHistory" ? (
            <button
              type="button"
              onClick={() => setAddValues("presentHistory")}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Condition
            </button>
          ) : (
            <div className="relative inline-flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                className="h-8 w-44 rounded-xl border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Add condition..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (value.trim()) {
                      setValues((prev) => ({
                        ...prev,
                        presentHistory: [...prev.presentHistory, value.trim()],
                      }));
                      setValue("");
                      setAddValues(null);
                    }
                  } else if (e.key === "Escape") {
                    setAddValues(null);
                    setValue("");
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (value.trim()) {
                    setValues((prev) => ({
                      ...prev,
                      presentHistory: [...prev.presentHistory, value.trim()],
                    }));
                    setValue("");
                    setAddValues(null);
                  }
                }}
                disabled={!value.trim()}
                className="inline-flex items-center h-8 rounded-xl bg-(--color-synapse-light) px-3 text-xs font-semibold text-white shadow-xs hover:opacity-90 disabled:opacity-40 transition-colors cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddValues(null);
                  setValue("");
                }}
                className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="relative z-20 flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="text-sm"
                    onClick={() => setEditable(prev => prev === "presentHistory" ? null : "presentHistory")}
                  >
                    <Pencil className="w-3 h-3" /> {editable === "presentHistory" ? "Done Editing" : "Edit Options"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <LabeledTextarea
            label="Present History"
            value={data.consultationNotes.presentHistory || ""}
            onChange={(val) => {
              setData((prev) => ({
                ...prev,
                consultationNotes: {
                  ...prev.consultationNotes,
                  presentHistory: val,
                },
              }));
            }}
            minRows={6}
          />
          <div className="flex gap-5 items-center">
            <div className="flex flex-wrap gap-2 items-center">
              {values.pastHistory.map((c) => (
                <OptionButton
                  key={c}
                  value={c}
                  selectedValues={pastHistory}
                  setSelectedValues={setPastHistory}
                  setValues={setValues}
                  setData={setData}
                  fieldName="pastHistory"
                  editable={editable}
                />
              ))}

              {addValues !== "pastHistory" ? (
                <button
                  type="button"
                  onClick={() => setAddValues("pastHistory")}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Condition
                </button>
              ) : (
                <div className="relative inline-flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    className="h-8 w-44 rounded-xl border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Add condition..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (value.trim()) {
                          setValues((prev) => ({
                            ...prev,
                            pastHistory: [...prev.pastHistory, value.trim()],
                          }));
                          setValue("");
                          setAddValues(null);
                        }
                      } else if (e.key === "Escape") {
                        setAddValues(null);
                        setValue("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (value.trim()) {
                        setValues((prev) => ({
                          ...prev,
                          pastHistory: [...prev.pastHistory, value.trim()],
                        }));
                        setValue("");
                        setAddValues(null);
                      }
                    }}
                    disabled={!value.trim()}
                    className="inline-flex items-center h-8 rounded-xl bg-(--color-synapse-light) px-3 text-xs font-semibold text-white shadow-xs hover:opacity-90 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddValues(null);
                      setValue("");
                    }}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="relative z-20 flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <EllipsisVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        className="text-sm"
                        onClick={() => setEditable(prev => prev === "pastHistory" ? null : "pastHistory")}
                      >
                        <Pencil className="w-3 h-3" /> {editable === "pastHistory" ? "Done Editing" : "Edit Options"}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {consulting[0]?.createdAt && (
              <p className="text-xs text-gray-600 shrink-0">
                Last Updated : {fDateandTime(consulting[0].createdAt)}
              </p>
            )}
          </div>

          <LabeledTextarea
            label="Past History"
            value={data.consultationNotes.pastHistory || ""}
            onChange={(val) => {
              setData((prev) => ({
                ...prev,
                consultationNotes: {
                  ...prev.consultationNotes,
                  pastHistory: val,
                },
              }));
            }}
            minRows={6}
          />

          <div className="flex flex-wrap gap-2 items-center">
            {values.diagnosis.map((c) => (
              <OptionButton
                key={c}
                value={c}
                selectedValues={diagnosis}
                setSelectedValues={setDiagnosis}
                setValues={setValues}
                setData={setData}
                fieldName="diagnosis"
                editable={editable}
              />
            ))}

            {addValues !== "diagnosis" ? (
              <button
                type="button"
                onClick={() => setAddValues("diagnosis")}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Condition
              </button>
            ) : (
              <div className="relative inline-flex items-center gap-1.5">
                <input
                  type="text"
                  autoFocus
                  className="h-8 w-44 rounded-xl border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Add condition..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (value.trim()) {
                        setValues((prev) => ({
                          ...prev,
                          diagnosis: [...prev.diagnosis, value.trim()],
                        }));
                        setValue("");
                        setAddValues(null);
                      }
                    } else if (e.key === "Escape") {
                      setAddValues(null);
                      setValue("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (value.trim()) {
                      setValues((prev) => ({
                        ...prev,
                        diagnosis: [...prev.diagnosis, value.trim()],
                      }));
                      setValue("");
                      setAddValues(null);
                    }
                  }}
                  disabled={!value.trim()}
                  className="inline-flex items-center h-8 rounded-xl bg-(--color-synapse-light) px-3 text-xs font-semibold text-white shadow-xs hover:opacity-90 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddValues(null);
                    setValue("");
                  }}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="relative z-20 flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <EllipsisVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="text-sm"
                      onClick={() => setEditable(prev => prev === "diagnosis" ? null : "diagnosis")}
                    >
                      <Pencil className="w-3 h-3" /> {editable === "diagnosis" ? "Done Editing" : "Edit Options"}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <LabeledTextarea
            label="Diagnosis"
            value={data.consultationNotes.diagnosis || ""}
            onChange={(val) => {
              setData((prev) => ({
                ...prev,
                consultationNotes: {
                  ...prev.consultationNotes,
                  diagnosis: val,
                },
              }));
            }}
            minRows={4}
          />
        </div>
      </CardContent>
    </Card>
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
