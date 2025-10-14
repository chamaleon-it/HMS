import React, { useState, KeyboardEvent, ReactNode } from "react";
import { DataType } from "./interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const chips = ["Fever", "Headache", "Cough"];

export default function ConsultationAndExaminationNotes({
  data,
  setData,
}: {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
}) {
  const [activeChips, setActiveChips] = useState<string[]>([]);

  const [examination, setExamination] = useState<string[]>([]);

  return (
    <div className=" space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Consultation Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() =>
                    setActiveChips((prev) =>
                      prev.includes(c)
                        ? prev.filter((x) => x !== c)
                        : [...prev, c]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-xs border transition hover:shadow-sm ${
                    activeChips.includes(c)
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-white"
                  }`}
                >
                  {c}
                </button>
              ))}
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

        <Card>
          <CardHeader>
            <CardTitle>Examination Note</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {["RS", "CVS", "P/A", "CNS"].map((c) => (
                <button
                  key={c}
                  onClick={() =>
                    setExamination((prev) =>
                      prev.includes(c)
                        ? prev.filter((x) => x !== c)
                        : [...prev, c]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-xs border transition hover:shadow-sm ${
                    examination.includes(c)
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3 items-start">
              <LabeledInput
                label="HR"
                unit="bpm"
                value={data.examinationNote.hr || ""}
                onChange={(val) => {
                  setData((prev) => ({
                    ...prev,
                    examinationNote: { ...prev.examinationNote, hr: val },
                  }));
                }}
                type="number"
              />
              <LabeledInput
                label="BP"
                unit="mmHg"
                value={data.examinationNote.bp || ""}
                onChange={(val) => {
                  setData((prev) => ({
                    ...prev,
                    examinationNote: { ...prev.examinationNote, bp: val },
                  }));
                }}
              />
              <LabeledInput
                label="SpO₂"
                unit="%"
                value={data.examinationNote.spo2 || ""}
                onChange={(val) => {
                  setData((prev) => ({
                    ...prev,
                    examinationNote: { ...prev.examinationNote, spo2: val },
                  }));
                }}
              />
              <LabeledInput
                label="Temp"
                value={data.examinationNote.temp || ""}
                onChange={(val) => {
                  setData((prev) => ({
                    ...prev,
                    examinationNote: { ...prev.examinationNote, temp: val },
                  }));
                }}
                type="number"
                // right={<TempMiniToggle unit={examNotes.tempUnit} onChange={setTempUnit} />}
              />
              {examination.includes("RS") && (
                <LabeledTextarea
                  label="RS"
                  value={data.examinationNote.rs || ""}
                  onChange={(val) => {
                    setData((prev) => ({
                      ...prev,
                      examinationNote: { ...prev.examinationNote, rs: val },
                    }));
                  }}
                  minRows={4}
                />
              )}
              {examination.includes("CVS") && (
                <LabeledTextarea
                  label="CVS"
                  value={data.examinationNote.cvs || ""}
                  onChange={(val) => {
                    setData((prev) => ({
                      ...prev,
                      examinationNote: { ...prev.examinationNote, cvs: val },
                    }));
                  }}
                  minRows={4}
                />
              )}
              {examination.includes("P/A") && (
                <LabeledTextarea
                  label="P/A"
                  value={data.examinationNote.pa || ""}
                  onChange={(val) => {
                    setData((prev) => ({
                      ...prev,
                      examinationNote: { ...prev.examinationNote, pa: val },
                    }));
                  }}
                  minRows={4}
                />
              )}
              {examination.includes("CNS") && (
                <LabeledTextarea
                  label="CNS"
                  value={data.examinationNote.cns || ""}
                  onChange={(val) => {
                    setData((prev) => ({
                      ...prev,
                      examinationNote: { ...prev.examinationNote, cns: val },
                    }));
                  }}
                  minRows={4}
                />
              )}
            </div>
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
      </div>
    </div>
  );
}



// Floating label input with optional right adornment (for toggle)
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
