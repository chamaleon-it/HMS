import React, { useEffect, useState } from "react";
import { Ruler, Gauge, Weight } from "lucide-react";


export default function VitalsCard({
  heightCm = 172,
  weightKg = 72,
  className = "",
  compact = true,
  showImperialTooltips = true,
  editable = true,
  size = "sm",
  onChange,
  
}: {
  heightCm?: number;
  weightKg?: number;
  className?: string;
  compact?: boolean;
  showImperialTooltips?: boolean;
  editable?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  onChange?: (next: { heightCm: number; weightKg: number }) => void;
}) {
  const ui = getUi(size);

  const [h, setH] = useState<number>(heightCm);
  const [w, setW] = useState<number>(weightKg);

  useEffect(() => setH(heightCm), [heightCm]);
  useEffect(() => setW(weightKg), [weightKg]);

  function updateHeight(val: string) {
    const v = clampNum(parseFloat(val), 0, 300);
    setH(v);
    onChange?.({ heightCm: v, weightKg: w });
  }
  function updateWeight(val: string) {
    const v = clampNum(parseFloat(val), 0, 500);
    setW(v);
    onChange?.({ heightCm: h, weightKg: v });
  }

  const safeH = h > 0 ? h : 0;
  const safeW = w > 0 ? w : 0;
  const bmiRaw = safeH > 0 ? safeW / Math.pow(safeH / 100, 2) : NaN;
  const bmi = Number((bmiRaw || 0).toFixed(1));
  const bmiInfo = getBmiInfo(bmiRaw);

  const imperial = showImperialTooltips
    ? (() => {
        const { feet, inches } = cmToFeetInches(safeH);
        const pounds = Math.round(kgToLb(safeW));
        return { feet, inches, pounds };
      })()
    : null;

  if (compact) {
    // header variant, larger per size
    return (
      <div
        className={
          `flex items-center ${ui.gap} ${ui.text} text-gray-700 whitespace-nowrap overflow-hidden [&>*]:shrink-0 ` +
          className
        }
      >
        {/* Height */}
        <span
          className="inline-flex items-center gap-1"
          title={
            imperial
              ? `Height: ${safeH} cm (${imperial.feet}′${imperial.inches}″)`
              : `Height: ${safeH} cm`
          }
        >
          <Ruler className={ui.icon} />
          {editable ? (
            <NumInput
              value={h}
              onChange={updateHeight}
              suffix="cm"
              ariaLabel="Height in centimeters"
              wClass={ui.inputW}
            />
          ) : (
            <span>{safeH} cm</span>
          )}
        </span>

        <Dot />

        {/* Weight */}
        <span
          className="inline-flex items-center gap-1"
          title={
            imperial
              ? `Weight: ${safeW} kg (${imperial.pounds} lb)`
              : `Weight: ${safeW} kg`
          }
        >
          <Weight className={ui.icon} />
          {editable ? (
            <NumInput
              value={w}
              onChange={updateWeight}
              suffix="kg"
              ariaLabel="Weight in kilograms"
              wClass={ui.inputW}
            />
          ) : (
            <span>{safeW} kg</span>
          )}
        </span>

        <Dot />

        {/* BMI */}
        <span
          className="inline-flex items-center gap-1"
          title={`BMI: ${isFinite(bmiRaw || NaN) ? bmi : "—"} • ${
            bmiInfo.label
          }`}
        >
          <Gauge className={`${ui.icon} ${bmiInfo.text}`} />
          <span className={ui.valueWeight}>
            {isFinite(bmiRaw || NaN) ? bmi : "—"}
          </span>
          <span
            className={`${ui.chipPad} ${ui.chipText} rounded-full ${bmiInfo.bg} ${bmiInfo.text}`}
          >
            {bmiInfo.short}
          </span>
        </span>
      </div>
    );
  }

  // non‑compact, still minimal
  return (
    <div
      className={
        `flex items-center ${ui.gapWide} ${ui.textWide} text-gray-700 ` +
        className
      }
    >
      <div
        className="flex items-center gap-2"
        title={
          imperial
            ? `Height: ${safeH} cm (${imperial.feet}′${imperial.inches}″)`
            : `Height: ${safeH} cm`
        }
      >
        <Ruler className={ui.iconWide} />
        {editable ? (
          <NumInput
            value={h}
            onChange={updateHeight}
            suffix="cm"
            ariaLabel="Height in centimeters"
            wClass={ui.inputWWide}
          />
        ) : (
          <span>{safeH} cm</span>
        )}
      </div>

      <div
        className="flex items-center gap-2"
        title={
          imperial
            ? `Weight: ${safeW} kg (${imperial.pounds} lb)`
            : `Weight: ${safeW} kg`
        }
      >
        <Weight className={ui.iconWide} />
        {editable ? (
          <NumInput
            value={w}
            onChange={updateWeight}
            suffix="kg"
            ariaLabel="Weight in kilograms"
            wClass={ui.inputWWide}
          />
        ) : (
          <span>{safeW} kg</span>
        )}
      </div>

      <div
        className="flex items-center gap-2"
        title={`BMI: ${isFinite(bmiRaw || NaN) ? bmi : "—"} • ${bmiInfo.label}`}
      >
        <Gauge className={`${ui.iconWide} ${bmiInfo.text}`} />
        <span className={ui.valueWeightWide}>
          BMI {isFinite(bmiRaw || NaN) ? bmi : "—"}
        </span>
        <span
          className={`${ui.chipPadWide} ${ui.chipTextWide} rounded-full ${bmiInfo.bg} ${bmiInfo.text}`}
        >
          {bmiInfo.label}
        </span>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="text-gray-300">•</span>;
}

function NumInput({
  value,
  onChange,
  suffix,
  ariaLabel,
  wClass,
}: {
  value: number;
  onChange: (val: string) => void;
  suffix: string;
  ariaLabel: string;
  wClass?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <input
        aria-label={ariaLabel}
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${
          wClass ?? "w-20"
        } appearance-none bg-transparent border border-transparent border-b-gray-200 focus:border-b-gray-400 focus:outline-none px-2 py-1 rounded-none text-gray-800`}
        step={0.1}
        min={0}
      />
      <span className="text-gray-500">{suffix}</span>
    </span>
  );
}

// --- UI scale helpers ------------------------------------------------------
function getUi(size: "sm" | "md" | "lg" | "xl") {
  const map = {
    sm: {
      text: "text-sm",
      textWide: "text-sm",
      gap: "gap-3",
      gapWide: "gap-6",
      icon: "h-4 w-4",
      iconWide: "h-4 w-4",
      chipPad: "px-1.5 py-0.5",
      chipText: "text-[11px]",
      chipPadWide: "px-2 py-0.5",
      chipTextWide: "text-xs",
      valueWeight: "font-medium",
      valueWeightWide: "font-medium",
      inputW: "w-16",
      inputWWide: "w-20",
    },
    md: {
      text: "text-base",
      textWide: "text-base",
      gap: "gap-4",
      gapWide: "gap-7",
      icon: "h-5 w-5",
      iconWide: "h-5 w-5",
      chipPad: "px-2 py-0.5",
      chipText: "text-xs",
      chipPadWide: "px-2.5 py-1",
      chipTextWide: "text-sm",
      valueWeight: "font-semibold",
      valueWeightWide: "font-semibold",
      inputW: "w-20",
      inputWWide: "w-24",
    },
    lg: {
      text: "text-lg",
      textWide: "text-lg",
      gap: "gap-5",
      gapWide: "gap-8",
      icon: "h-6 w-6",
      iconWide: "h-6 w-6",
      chipPad: "px-2.5 py-1",
      chipText: "text-sm",
      chipPadWide: "px-3 py-1.5",
      chipTextWide: "text-sm",
      valueWeight: "font-semibold",
      valueWeightWide: "font-semibold",
      inputW: "w-24",
      inputWWide: "w-28",
    },
    xl: {
      text: "text-xl",
      textWide: "text-xl",
      gap: "gap-6",
      gapWide: "gap-10",
      icon: "h-7 w-7",
      iconWide: "h-7 w-7",
      chipPad: "px-3 py-1.5",
      chipText: "text-base",
      chipPadWide: "px-3.5 py-1.5",
      chipTextWide: "text-base",
      valueWeight: "font-semibold",
      valueWeightWide: "font-semibold",
      inputW: "w-28",
      inputWWide: "w-32",
    },
  } as const;
  return map[size];
}

// --- Helpers ---------------------------------------------------------------
function clampNum(n: number, min: number, max: number) {
  if (!isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

export function getBmiInfo(bmi: number | null | undefined) {
  const v = typeof bmi === "number" && isFinite(bmi) ? bmi : NaN;
  if (!isFinite(v))
    return {
      label: "BMI",
      short: "—",
      bg: "bg-gray-100",
      text: "text-gray-600",
    } as const;
  if (v < 18.5)
    return {
      label: "Underweight",
      short: "Low",
      bg: "bg-blue-100",
      text: "text-blue-600",
    } as const;
  if (v < 25)
    return {
      label: "Healthy",
      short: "OK",
      bg: "bg-green-100",
      text: "text-green-600",
    } as const;
  if (v < 30)
    return {
      label: "Overweight",
      short: "High",
      bg: "bg-amber-100",
      text: "text-amber-600",
    } as const;
  return {
    label: "Obese",
    short: "Very",
    bg: "bg-red-100",
    text: "text-red-600",
  } as const;
}

export function cmToFeetInches(cm: number) {
  if (!isFinite(cm) || cm <= 0) return { feet: 0, inches: 0 };
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return { feet, inches };
}

export function kgToLb(kg: number) {
  if (!isFinite(kg) || kg <= 0) return 0;
  return kg * 2.2046226218;
}

// --- Lightweight self-tests -----------------------------------------------
export function __runVitalsSelfTest() {
  const cases = [
    { h: 172, w: 50, exp: "Underweight" },
    { h: 172, w: 72, exp: "Healthy" },
    { h: 172, w: 80, exp: "Overweight" },
    { h: 172, w: 95, exp: "Obese" },
  ];
  const results = cases.map((t) => {
    const bmi = t.w / Math.pow(t.h / 100, 2);
    const info = getBmiInfo(bmi);
    return {
      ...t,
      bmi: Number(bmi.toFixed(1)),
      got: info.label,
      pass: info.label === t.exp,
    };
  });

  console.table(results);
  return results.every((r) => r.pass);
}

export function __simulateEditTest() {
  // Simulate editing from 72kg to 80kg at 172cm; BMI should increase from ~24.3 to ~27.0
  const h = 172;
  const w1 = 72;
  const w2 = 80;
  const bmi1 = Number((w1 / Math.pow(h / 100, 2)).toFixed(1));
  const bmi2 = Number((w2 / Math.pow(h / 100, 2)).toFixed(1));
  const ok = bmi2 > bmi1 && getBmiInfo(bmi1).label !== getBmiInfo(bmi2).label;

  console.log({ bmi1, bmi2, ok });
  return ok;
}
