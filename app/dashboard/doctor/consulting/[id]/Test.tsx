"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DataType } from "./interface";
import OrderLab from "./OrderLab";
import { Image as ImageIcon, TestTubeDiagonal } from "lucide-react";
import { Button } from "@/components/ui/button";

type Mode = "inhouse" | "external";

type TabKey = "All" | "Lab" | "Imaging";

type TestItemType = {
  id: string;
  name: string;
  category: "Lab" | "Imaging";
  inHouse: boolean;
  tags?: string[];
};

type ExternalLab = {
  id: string;
  name: string;
};

type PriorityId = "high" | "normal" | "stat"; // "stat" only used for in‑house UI toggle

type Priority = { id: PriorityId; label: string };

const TESTS: TestItemType[] = [
  { id: "ecg", name: "ECG", category: "Imaging", inHouse: true },
  {
    id: "cbc",
    name: "Complete Blood Count (CBC)",
    category: "Lab",
    inHouse: true,
    tags: ["CBC"],
  },
  {
    id: "esr",
    name: "Erythrocyte Sedimentation Rate",
    category: "Lab",
    inHouse: true,
    tags: ["ESR"],
  },
  {
    id: "crp",
    name: "C Reactive Protein",
    category: "Lab",
    inHouse: true,
    tags: ["CRP"],
  },
  {
    id: "lft",
    name: "Liver Function Tests",
    category: "Lab",
    inHouse: true,
    tags: ["LFT"],
  },
  {
    id: "SGOT",
    name: "Serum Bilirubin",
    category: "Lab",
    inHouse: true,
    tags: ["SGOT", "SGPT", "S Bilirubin"],
  },
  {
    id: "RFT",
    name: "Renal Function Tests",
    category: "Lab",
    inHouse: true,
    tags: ["RFT"],
  },
  {
    id: "S. Creat",
    name: "Serum Creatinine",
    category: "Lab",
    inHouse: true,
    tags: ["S Creat"],
  },
  {
    id: "ure",
    name: "Urine Routine Examination",
    category: "Lab",
    inHouse: true,
    tags: ["URE"],
  },
  {
    id: "u c&s",
    name: "Urine Culture & sensitivity",
    category: "Lab",
    inHouse: true,
    tags: ["Urine C&S"],
  },
  {
    id: "s c&s",
    name: "Stool Culture & sensitivity",
    category: "Lab",
    inHouse: true,
    tags: ["Stool C&S"],
  },
  {
    id: "tft",
    name: "Thyroid Function Tests",
    category: "Lab",
    inHouse: true,
    tags: ["TFT"],
  },
  {
    id: "cxr",
    name: "Chest xray",
    category: "Imaging",
    inHouse: true,
    tags: ["CXR"],
  },
  { id: "hgb", name: "Hemoglobin", category: "Lab", inHouse: true },
  { id: "fbs", name: "Blood Sugar (Fasting)", category: "Lab", inHouse: true },
  { id: "pp", name: "Blood Sugar (PP)", category: "Lab", inHouse: true },
  { id: "hba1c", name: "HbA1c", category: "Lab", inHouse: true },
  { id: "lipid", name: "Lipid Profile", category: "Lab", inHouse: true },
  { id: "vitd", name: "Vitamin D (25‑OH)", category: "Lab", inHouse: false },
  { id: "mri", name: "MRI Brain", category: "Imaging", inHouse: false },
  { id: "ct", name: "CT Chest", category: "Imaging", inHouse: false },
];

const EXTERNAL_LABS: ExternalLab[] = [
  { id: "metro", name: "Metro Diagnostics" },
  { id: "drjossy", name: "Dr Jossy Diagnostic Center" },
  { id: "apollo", name: "Apollo Diagnostics" },
];

const SLOTS: string[] = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:30 PM",
  "04:00 PM",
];

const PRIORITIES: Priority[] = [
  { id: "high", label: "High" },
  { id: "normal", label: "Normal" },
];

type ModeToggleProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange }) => (
  <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1 shadow-sm">
    {(["inhouse", "external"] as const).map((m) => (
      <button
        key={m}
        onClick={() => onChange(m)}
        className={[
          "px-4 py-1.5 rounded-full text-sm font-medium transition",
          mode === m
            ? m === "inhouse"
              ? "bg-emerald-500 text-white shadow"
              : "bg-amber-500 text-white shadow"
            : "text-zinc-600 hover:bg-zinc-50",
        ].join(" ")}
      >
        {m === "inhouse" ? "In‑House" : "External"}
      </button>
    ))}
  </div>
);

type TestItemProps = {
  test: TestItemType;
  disabled: boolean;
  selected: boolean;
  onToggle: (test: TestItemType) => void;
};

const TestItem: React.FC<TestItemProps> = ({
  test,
  disabled,
  selected,
  onToggle,
}) => (
  <button
    onClick={() => !disabled && onToggle(test)}
    className={[
      "w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-1.5 text-left",
      disabled
        ? "opacity-50 cursor-not-allowed bg-zinc-50 border-zinc-200"
        : selected
        ? "border-emerald-500 bg-emerald-50"
        : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50",
    ].join(" ")}
  >
    <div className="truncate">
      <div className="font-medium text-zinc-800 truncate flex gap-2.5 items-center">
        {test.category === "Lab" ? (
          <TestTubeDiagonal className="w-4 h-4" />
        ) : (
          <ImageIcon className="w-4 h-4" />
        )}
        <p>{test.name} </p>
      </div>
      {/* <div className="text-xs text-zinc-500">{test.category}</div> */}
    </div>
    <div className="flex items-center gap-2">
      <span
        className={[
          "text-[11px] px-2 py-0.5 rounded-full border",
          test.inHouse
            ? "border-emerald-200 text-emerald-700 bg-emerald-50"
            : "border-amber-200 text-amber-700 bg-amber-50",
        ].join(" ")}
      >
        {test.inHouse ? "In‑house" : "External"}
      </span>
      <span
        className={[
          "h-5 w-5 grid place-items-center rounded-md border",
          selected
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-zinc-300 bg-white text-transparent",
        ].join(" ")}
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3">
          <path
            fill="currentColor"
            d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"
          />
        </svg>
      </span>
    </div>
  </button>
);

type CalendarProps = {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
};

function Calendar({ value, onChange }: CalendarProps) {
  const localYMD = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const parseYMD = (s: string | null): Date | null => {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const selected = parseYMD(value);
  const today = new Date();
  const todayYMD = localYMD(today);

  const [view, setView] = useState<Date>(
    () =>
      new Date(
        (selected || today).getFullYear(),
        (selected || today).getMonth(),
        1
      )
  );

  const month = view.getMonth();
  const year = view.getFullYear();
  const monthName = view.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<Date | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const isSelected = (d: Date) =>
    selected && localYMD(selected) === localYMD(d);
  const isToday = (d: Date) => localYMD(d) === todayYMD;
  const isPast = (d: Date) => localYMD(d) < todayYMD; // block backdates

  return (
    <div className="rounded-xl border border-zinc-200 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-zinc-50 to-zinc-100">
        <button
          className="rounded-lg border px-2 py-1 text-sm hover:border-zinc-400"
          onClick={() => setView(new Date(year, month - 1, 1))}
          aria-label="Previous month"
        >
          ◀
        </button>
        <div className="text-sm font-semibold text-zinc-800 tracking-wide">
          {monthName}
        </div>
        <button
          className="rounded-lg border px-2 py-1 text-sm hover:border-zinc-400"
          onClick={() => setView(new Date(year, month + 1, 1))}
          aria-label="Next month"
        >
          ▶
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 p-2 text-[11px] text-zinc-500 bg-white">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="py-1 text-center font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 p-2 pt-0 bg-white">
        {cells.map((d, idx) =>
          d ? (
            <button
              key={idx}
              disabled={isPast(d)}
              onClick={() => onChange(localYMD(d))}
              className={[
                "h-9 rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-zinc-300",
                isSelected(d)
                  ? "bg-zinc-900 text-white shadow"
                  : isToday(d)
                  ? "border border-zinc-300"
                  : "border border-transparent hover:border-zinc-300",
                isPast(d)
                  ? "opacity-40 cursor-not-allowed hover:border-transparent"
                  : "",
              ].join(" ")}
            >
              {d.getDate()}
            </button>
          ) : (
            <div key={idx} />
          )
        )}
      </div>
      <div className="px-3 pb-3 pt-1 text-[11px] text-zinc-500">
        {value
          ? `Selected: ${parseYMD(value)?.toLocaleDateString()}`
          : "No date selected"}
      </div>
    </div>
  );
}

export default function Test({
  data,
  setData,
}: {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
}) {
  const [mode, setMode] = useState<Mode>("inhouse");
  const [query, setQuery] = useState<string>("");
  const [tab, setTab] = useState<TabKey>("All");

  const [selectedTests, setSelectedTests] = useState<TestItemType[]>([]);

  const localYMD = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  const parseYMD = (s: string): Date => {
    const [y, m, day] = s.split("-").map(Number);
    return new Date(y, m - 1, day);
  };
  const [date, setDate] = useState<string>(() => localYMD(new Date()));
  const [labId, setLabId] = useState<string>("");
  const [slot, setSlot] = useState<string>("");
  const [priority, setPriority] = useState<PriorityId>("normal");

  const filtered = useMemo<TestItemType[]>(() => {
    const q = query.trim().toLowerCase();
    const isAll = tab === "All";
    const inhouseMode = mode === "inhouse";

    return TESTS.filter((t) => {
      if (!isAll && t.category !== tab) return false;

      const nameMatch = t.name.toLowerCase().includes(q);
      const tagMatch = t.tags?.some((tag) => tag.toLowerCase().includes(q));

      if (q && !nameMatch && !tagMatch) return false;

      return inhouseMode ? t.inHouse : !t.inHouse;
    });
  }, [query, tab, mode]);
  const isDisabled = (t: TestItemType) => mode === "inhouse" && !t.inHouse;
  const isSelected = (t: TestItemType) =>
    selectedTests.some((x) => x.id === t.id);

  const toggleTest = (t: TestItemType) => {
    if (isDisabled(t)) return;
    setSelectedTests((prev) =>
      isSelected(t) ? prev.filter((x) => x.id !== t.id) : [...prev, t]
    );
  };

  const canBook =
    mode === "inhouse"
      ? selectedTests.length > 0
      : selectedTests.length > 0 && Boolean(date && labId && slot);

  const resetExternal = () => {
    setDate("");
    setLabId("");
    setSlot("");
    setPriority("normal");
  };
  const onModeChange = (m: Mode) => {
    setMode(m);
    setSelectedTests([]);
    resetExternal();
  };

  const [booked, setBooked] = useState(false);

  useEffect(() => {
    setBooked(false);
  }, [mode, selectedTests, date, labId, priority, slot]);

  const bookTest = () => {
    if (booked) return;
    if (mode === "inhouse") {
      const newTest = {
        name: selectedTests.map((e) => e.name),
        date: new Date(),
        lab: "In house",
        priority,
        slot: "09:00 AM",
      };

      setData((prev) => ({ ...prev, test: [...prev.test, newTest] }));
      setBooked(true);
    } else if (mode === "external") {
      const newTest = {
        name: selectedTests.map((e) => e.name),
        date: new Date(date),
        lab: EXTERNAL_LABS.find((l) => l.id === labId)?.name as string,
        priority,
        slot: slot,
      };
      setData((prev) => ({ ...prev, test: [...prev.test, newTest] }));
      setBooked(true);
    }
  };

  const [show, setShow] = useState(false);

  return (
    <>
      <div className="">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 grid place-items-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600">
                <path
                  fill="currentColor"
                  d="M19 3H5c-1.1 0-2 .9-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5c0-1.1-.9-2-2-2Z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-zinc-900">
              Lab / Imaging Booking
            </h1>
            {show && <ModeToggle mode={mode} onChange={onModeChange} />}
          </div>

          {!show && (
            <Button
              onClick={() => setShow(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
            >
              Show
            </Button>
          )}
        </div>

        {show && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  {(
                    [
                      { key: "All", label: "All" },
                      { key: "Lab", label: "Lab" },
                      { key: "Imaging", label: "Imaging" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={[
                        "px-3 py-1.5 rounded-full text-sm border",
                        tab === t.key
                          ? "border-zinc-900 text-zinc-900"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-400",
                      ].join(" ")}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="relative w-48">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tests…"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                  <svg
                    viewBox="0 0 24 24"
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400"
                  >
                    <path
                      fill="currentColor"
                      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6Z"
                    />
                  </svg>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 max-h-[60vh] overflow-auto pr-1">
                {filtered.map((t) => (
                  <div key={t.id} className="relative">
                    {isDisabled(t) && (
                      <div
                        className="absolute inset-0 z-10 rounded-2xl"
                        title="Available only via External Labs"
                      />
                    )}
                    <TestItem
                      test={t}
                      disabled={isDisabled(t)}
                      selected={isSelected(t)}
                      onToggle={toggleTest}
                    />
                    {isDisabled(t) && (
                      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-white/70 to-white/10" />
                    )}
                  </div>
                ))}
              </div>

              {mode === "inhouse" && (
                <p className="mt-3 text-[11px] text-zinc-500">
                  Grey items are not available in‑house. Switch to
                  <span className="font-medium text-zinc-700">
                    {" "}
                    External
                  </span>{" "}
                  to book them.
                </p>
              )}
            </section>

            {/* Right panel changes by mode */}
            {mode === "inhouse" ? (
              <section className="lg:col-span-8 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-900">
                  In‑House Booking
                </h2>
                <p className="text-sm text-zinc-600">
                  Select one or more in‑house tests and book directly. No
                  date/lab/time needed.
                </p>
                <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
                  {selectedTests.length > 0 ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm text-zinc-500">
                          Selected ({selectedTests.length})
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {selectedTests.map((t) => (
                            <span
                              key={t.id}
                              className="truncate max-w-[16rem] inline-flex items-center gap-2 rounded-full bg-white border border-emerald-200 px-3 py-1 text-xs text-zinc-800"
                            >
                              {t.name}
                              <button
                                className="text-zinc-400 hover:text-zinc-700"
                                onClick={() => toggleTest(t)}
                                title="Remove"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {/* In‑House STAT toggle only */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-600">
                            Priority:
                          </span>
                          <button
                            onClick={() =>
                              setPriority((p) =>
                                p === "stat" ? "normal" : "stat"
                              )
                            }
                            className={[
                              "rounded-full border px-3 py-1 text-xs font-medium",
                              priority === "stat"
                                ? "border-rose-500 bg-rose-50 text-rose-700"
                                : "border-zinc-200 text-zinc-700 hover:border-zinc-400",
                            ].join(" ")}
                          >
                            STAT
                          </button>
                        </div>
                        <button
                          onClick={bookTest}
                          disabled={selectedTests.length === 0}
                          className={[
                            "rounded-xl px-5 py-2 text-sm font-medium transition",
                            selectedTests.length > 0
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-zinc-200 text-zinc-600 cursor-not-allowed",
                          ].join(" ")}
                        >
                          Book {selectedTests.length > 1 ? "Tests" : "Test"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-zinc-600">
                      No test selected. Choose tests from the left.
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <section className="lg:col-span-8 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-900">
                  External Booking
                </h2>
                <p className="text-sm text-zinc-600">
                  Calendar → Lab → Time (in separate columns). Priority
                  optional.
                </p>
                {/* 3 columns */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Calendar */}
                  <div className="rounded-xl border border-zinc-200 p-4">
                    <div className="font-medium text-zinc-800 mb-2">
                      Select Date
                    </div>
                    <Calendar value={date} onChange={setDate} />
                  </div>

                  {/* Lab list */}
                  <div className="rounded-xl border border-zinc-200 p-4">
                    <div className="font-medium text-zinc-800 mb-2">
                      Select Lab
                    </div>
                    <div className="flex flex-col gap-2">
                      {EXTERNAL_LABS.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => setLabId(l.id)}
                          className={[
                            "text-left rounded-xl border px-3 py-2",
                            labId === l.id
                              ? "border-amber-500 bg-amber-50"
                              : "border-zinc-200 hover:border-zinc-400",
                          ].join(" ")}
                        >
                          {l.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slots & Priority */}
                  <div className="rounded-xl border border-zinc-200 p-4">
                    <div className="font-medium text-zinc-800 mb-2">
                      Available Time
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {SLOTS.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSlot(s)}
                          className={[
                            "rounded-lg border px-3 py-2 text-sm",
                            slot === s
                              ? "bg-zinc-900 text-white border-zinc-900"
                              : "border-zinc-200 hover:border-zinc-400",
                          ].join(" ")}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="font-medium text-zinc-800 mb-1">
                      Priority
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPriority(p.id)}
                          className={[
                            "rounded-full border px-3 py-1 text-xs font-medium",
                            priority === p.id
                              ? p.id === "high"
                                ? "border-amber-500 bg-amber-50 text-amber-700"
                                : "border-zinc-900 bg-zinc-900 text-white"
                              : "border-zinc-200 text-zinc-700 hover:border-zinc-400",
                          ].join(" ")}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 text-sm text-zinc-700">
                  <div className="truncate">
                    {selectedTests.length > 0 ? (
                      <>
                        <span className="font-medium">
                          {selectedTests.length} test(s)
                        </span>
                        {date && <> • {parseYMD(date).toLocaleDateString()}</>}
                        {labId && (
                          <>
                            {" "}
                            • {EXTERNAL_LABS.find((l) => l.id === labId)?.name}
                          </>
                        )}
                        {slot && <> • {slot}</>}
                        {mode === "external" && priority === "high" && (
                          <> • HIGH</>
                        )}
                        {/* {mode === 'inhouse' && priority === 'stat' && <> • STAT</>} */}
                      </>
                    ) : (
                      <>Select tests to start booking.</>
                    )}
                  </div>
                  <button
                    onClick={bookTest}
                    disabled={!canBook}
                    className={[
                      "rounded-xl px-5 py-2 text-sm font-medium transition",
                      canBook
                        ? "bg-amber-600 text-white hover:bg-amber-700"
                        : "bg-zinc-200 text-zinc-600 cursor-not-allowed",
                    ].join(" ")}
                  >
                    Book {selectedTests.length > 1 ? "Tests" : "Test"}
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
      {show && <OrderLab booked={data.test} setData={setData} />}
    </>
  );
}
