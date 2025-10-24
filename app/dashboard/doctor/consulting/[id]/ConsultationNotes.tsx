import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState } from "react";

import { fDateandTime } from "@/lib/fDateAndTime";
import { DataType } from "./interface";
import { Consultations } from "./History";
import {  EllipsisVertical, Pencil, Plus } from "lucide-react";
import OptionButton from "./OptionButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PRESENT_HISTORY = [
  "Fever",
  "Headache",
  "Cough",
  "Cold",
  "Body Pain",
  "Nausea",
  "Dizziness",
];

const DIAGNOSIS = [
  "Fever",
  "Headache",
  "Cough",
  "Cold",
  "Body Pain",
  "Nausea",
  "Dizziness",
];

const PAST_HISTORY = ["HTN", "T2DM", "CAD", "COPD", "RA", "Hypothyroidism"];

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


  const [editable, setEditable] = useState<"diagnosis" | "pastHistory" | "presentHistory"  | null>(null)

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

          <button
            onClick={() => {
              if (data?.consultationNotes?.presentHistory) {
                setValues((prev) => {
                  const newItems = (data.consultationNotes.presentHistory ?? "")
                    .split(",")
                    .map((str) => str.trim())
                    .filter(Boolean);

                  const merged = [...prev.presentHistory, ...newItems];

                  return {
                    ...prev,
                    presentHistory: Array.from(new Set(merged)),
                  };
                });
              }
            }}
            className={`px-3 py-1 rounded-md text-xs border transition hover:shadow-sm ${"bg-[#fe9a00]/50"} flex gap-0.5 items-center`}
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
          <div className="relative z-20 flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem className="text-sm" onClick={()=>setEditable("presentHistory")}>
                    <Pencil className="w-3 h-3" /> Edit
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
            <div className="flex flex-wrap gap-2  items-center">
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

              <button
                onClick={() => {
                  if (data?.consultationNotes?.pastHistory) {
                    setValues((prev) => {
                      const newItems = (
                        data.consultationNotes.pastHistory ?? ""
                      )
                        .split(",")
                        .map((str) => str.trim())
                        .filter(Boolean);

                      const merged = [...prev.pastHistory, ...newItems];

                      return {
                        ...prev,
                        pastHistory: Array.from(new Set(merged)),
                      };
                    });
                  }
                }}
                className={`px-3 py-1 rounded-md text-xs border transition hover:shadow-sm ${"bg-[#fe9a00]/50"} flex gap-0.5 items-center`}
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
              <div className="relative z-20 flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem className="text-sm" onClick={()=>setEditable("pastHistory")}>
                    <Pencil className="w-3 h-3" /> Edit
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
            </div>
            {consulting[0]?.createdAt && (
              <p className="text-sm text-gray-600 shrink-0">
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

          <div className="flex flex-wrap gap-2  items-center">
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

            <button
              onClick={() => {
                if (data?.consultationNotes?.diagnosis) {
                  setValues((prev) => {
                    const newItems = (data.consultationNotes.diagnosis ?? "")
                      .split(",")
                      .map((str) => str.trim())
                      .filter(Boolean);

                    const merged = [...prev.diagnosis, ...newItems];

                    return {
                      ...prev,
                      diagnosis: Array.from(new Set(merged)),
                    };
                  });
                }
              }}
              className={`px-3 py-1 rounded-md text-xs border transition hover:shadow-sm ${"bg-[#fe9a00]/50"} flex gap-0.5 items-center`}
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
            <div className="relative z-20 flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem className="text-sm" onClick={()=>setEditable("diagnosis")}>
                    <Pencil className="w-3 h-3" /> Edit
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
