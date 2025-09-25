import React, { useState, KeyboardEvent, ReactNode } from "react";

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
const CardContent = ({ children }: CardProps) => (
  <div className="p-5 space-y-4">{children}</div>
);




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

function LabeledInput({ label, value, onChange, type = "text", unit, right, onKeyDown }: LabeledInputProps) {
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

type LabeledTextareaProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  minRows?: number;
};

function LabeledTextarea({ label, value, onChange, minRows = 4 }: LabeledTextareaProps) {
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

// type TempMiniToggleProps = { unit: "C" | "F"; onChange: (unit: "C" | "F") => void };
// function TempMiniToggle({ unit, onChange }: TempMiniToggleProps) {
//   const isC = unit === 'C';
//   return (
//     <button
//       type="button"
//       onClick={() => onChange(isC ? 'F' : 'C')}
//       aria-label="Toggle temperature unit"
//       className={`relative h-8 w-24 rounded-full border transition-all shadow-sm overflow-hidden ${
//         isC ? 'border-emerald-300 bg-emerald-50' : 'border-indigo-300 bg-indigo-50'
//       }`}
//     >
//       <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold ${isC ? 'text-emerald-700' : 'text-slate-600'}`}>°C</span>
//       <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold ${!isC ? 'text-indigo-700' : 'text-slate-600'}`}>°F</span>
//       <span
//         className="absolute top-1 left-1 h-6 w-10 rounded-full bg-white shadow transition-transform"
//         style={{ transform: isC ? 'translateX(0px)' : 'translateX(56px)' }}
//       />
//     </button>
//   );
// }

// --------------------------- Page ---------------------------
const chips = ["Fever", "Headache", "Cough"];

type ExamNotes = {
  hr: string;
  bp: string;
  spo2: string;
  temp: string;
  tempUnit: "C" | "F";
  rs: string;
  cvs: string;
  pja: string;
  cns: string;
  other: string;
};

export default function ConsultationAndExaminationNotes() {
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [consultationNotes, setConsultationNotes] = useState<string>("");
  const [pastHistory, setPastHistory] = useState<string>("")
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [examNotes, setExamNotes] = useState<ExamNotes>({ hr: "", bp: "", spo2: "", temp: "", tempUnit: "C", rs: "", cvs: "", pja: "", cns: "", other: "" });
  const [examination, setExamination] = useState<string[]>([])

  // const setTempUnit = (unit: "C" | "F") => {
  //   if (unit === examNotes.tempUnit) return;
  //   const val = parseFloat(examNotes.temp);
  //   if (!Number.isNaN(val)) {
  //     const converted = unit === 'C' ? Math.round(((val - 32) * 5) / 9) : Math.round((val * 9) / 5 + 32);
  //     setExamNotes({ ...examNotes, temp: String(converted), tempUnit: unit });
  //   } else {
  //     setExamNotes({ ...examNotes, tempUnit: unit });
  //   }
  // };

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
                    onClick={() => setActiveChips((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))}
                    className={`px-3 py-1 rounded-full text-xs border transition hover:shadow-sm ${activeChips.includes(c) ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-4">
                <LabeledTextarea label="Present History" value={consultationNotes} onChange={setConsultationNotes} minRows={6} />
                <LabeledTextarea label="Past History" value={pastHistory} onChange={setPastHistory} minRows={6} />
                <LabeledTextarea label="Diagnosis" value={diagnosis} onChange={setDiagnosis} minRows={4} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Examination Note</CardTitle>
            </CardHeader>
            <CardContent>

<div className="flex flex-wrap gap-2 mb-4">
                {["RS","CVS","P/A","CNS"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setExamination((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))}
                    className={`px-3 py-1 rounded-full text-xs border transition hover:shadow-sm ${examination.includes(c) ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 items-start">
                <LabeledInput label="HR" unit="bpm" value={examNotes.hr} onChange={(v) => setExamNotes({ ...examNotes, hr: v })} type="number" />
                <LabeledInput
                  label="BP"
                  unit="mmHg"
                  value={examNotes.bp}
                  onChange={(v) => setExamNotes({ ...examNotes, bp: v.replace(/[^0-9/]/g, '') })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!examNotes.bp.includes('/')) {
                        const digits = examNotes.bp.replace(/[^0-9]/g, '');
                        if (digits.length >= 4) {
                          const sys = digits.slice(0, Math.min(3, digits.length));
                          const dia = digits.slice(sys.length, Math.min(sys.length + 3, digits.length));
                          const formatted = dia ? `${sys}/${dia}` : sys;
                          setExamNotes({ ...examNotes, bp: formatted });
                        }else if(digits.length >= 3){
                                const sys = digits.slice(0, Math.min(2, digits.length));
                          const dia = digits.slice(sys.length, Math.min(sys.length + 2, digits.length));
                          const formatted = dia ? `${sys}/${dia}` : sys;
                          setExamNotes({ ...examNotes, bp: formatted });
                      }else if(digits.length >= 2){
                        setExamNotes(prev=>({...prev,bp:!!prev.bp ? prev.bp+"/": prev.bp}))
                      }
                    }
                      }
                  }}
                />
                <LabeledInput label="SpO₂" unit="%" value={examNotes.spo2} onChange={(v) => setExamNotes({ ...examNotes, spo2: v })} />
                <LabeledInput
                  label="Temp"
                  value={examNotes.temp}
                  onChange={(v) => setExamNotes({ ...examNotes, temp: v })}
                  type="number"
                  // right={<TempMiniToggle unit={examNotes.tempUnit} onChange={setTempUnit} />}
                />
                {examination.includes("RS") && <LabeledTextarea label="RS" value={examNotes.rs} onChange={(v) => setExamNotes({ ...examNotes, rs: v })} minRows={4} />}
                {examination.includes("CVS") && <LabeledTextarea label="CVS" value={examNotes.cvs} onChange={(v) => setExamNotes({ ...examNotes, cvs: v })} minRows={4} />}
                {examination.includes("P/A") && <LabeledTextarea label="P/A" value={examNotes.pja} onChange={(v) => setExamNotes({ ...examNotes, pja: v })} minRows={4} />}
                {examination.includes("CNS") && <LabeledTextarea label="CNS" value={examNotes.cns} onChange={(v) => setExamNotes({ ...examNotes, cns: v })} minRows={4} />}
              </div>
              <LabeledTextarea label="Other Notes" value={examNotes.other} onChange={(v)=>setExamNotes({...examNotes, other:v})} minRows={4} />
            </CardContent>
          </Card>
        </div>
      </div>
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
}
