import React, { useState, } from "react";
import { DataType } from "./interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ExaminationNote from "./ExaminationNote";


const chips = ["Fever", "Headache", "Cough"];

export default function ConsultationAndExaminationNotes({
  data,
  setData,
}: {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
}) {
  const [activeChips, setActiveChips] = useState<string[]>([]);

  

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

    <ExaminationNote data={data} setData={setData}/> 
      </div>
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
