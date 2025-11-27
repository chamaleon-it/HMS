"use client";

import React, { useEffect, useState } from "react";
import { DataType } from "./interface";
import OrderLab from "./OrderLab";
import { Image as ImageIcon, TestTubeDiagonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { combineDateAndSlot, fDate } from "@/lib/fDateAndTime";
import { Calendar } from "@/components/ui/calendar";

type TabKey = "All" | "Lab" | "Imaging";

type TestItemType = {
  code: string;
  max?: number;
  min?: number;
  name: string;
  type: "Lab" | "Imaging";
  unit: string;
  _id: string;
};

type PriorityId = "High" | "Normal" | "Stat";

type Priority = { id: PriorityId; label: string };

const SLOTS: string[] = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
];

const PRIORITIES: Priority[] = [
  { id: "High", label: "High" },
  { id: "Normal", label: "Normal" },
];

type Mode = "inhouse" | "external";

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
  selected: boolean;
  onToggle: (test: TestItemType) => void;
};

const TestItem: React.FC<TestItemProps> = ({ test, selected, onToggle }) => (
  <button
    onClick={() => onToggle(test)}
    className={[
      "w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-1.5 text-left",
      false
        ? "opacity-50 cursor-not-allowed bg-zinc-50 border-zinc-200"
        : selected
          ? "border-emerald-500 bg-emerald-50"
          : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50",
    ].join(" ")}
  >
    <div className="truncate">
      <div className="font-medium text-zinc-800 truncate flex gap-2.5 items-center">
        {test.type === "Lab" ? (
          <TestTubeDiagonal className="w-4 h-4" />
        ) : (
          <ImageIcon className="w-4 h-4" />
        )}
        <p>
          {test.name} ({test.code}){" "}
        </p>
      </div>
      <div className="text-xs text-zinc-500">{test.type}</div>
    </div>
    <div className="flex items-center gap-2">
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


export default function Test({
  data,
  setData,
}: {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
}) {
  const [query, setQuery] = useState<string>("");
  const [tab, setTab] = useState<TabKey>("All");

  const [selectedTests, setSelectedTests] = useState<TestItemType[]>([]);

  const [date, setDate] = useState<Date>(new Date());
  const [labId, setLabId] = useState<string>("");
  const [slot, setSlot] = useState<string>("");
  const [priority, setPriority] = useState<PriorityId>("Normal");

  const isSelected = (t: TestItemType) =>
    selectedTests.some((x) => x._id === t._id);

  const toggleTest = (t: TestItemType) => {
    setSelectedTests((prev) =>
      isSelected(t) ? prev.filter((x) => x._id !== t._id) : [...prev, t]
    );
  };

  const canBook = selectedTests.length > 0 && Boolean(date && labId && slot);

  const [booked, setBooked] = useState(false);

  useEffect(() => {
    setBooked(false);
  }, [selectedTests, date, labId, priority, slot]);

  const bookTest = () => {
    if (booked) return;
    const datetime = combineDateAndSlot(date, slot);
    const newTest = {
      name: selectedTests,
      date: datetime,
      lab: labId,
      priority,
    };
    setData((prev) => ({ ...prev, test: [...prev.test, newTest] }));
    setBooked(true);
  };

  const [show, setShow] = useState(false);

  const { data: LabData } = useSWR<{
    message: string;
    data: {
      _id: string;
      name: string;
      tests: {
        code: string;
        name: string;
        type: "Lab" | "Imaging";
        min?: number;
        max?: number;
        unit: string;
        _id: string;
      }[];
    }[];
  }>("/users/lab");

  const Labs = LabData?.data ?? [];

  const Tests = [
    ...new Map(
      (Labs.map((e) => e.tests).flat() ?? []).map((t) => [t.code, t])
    ).values(),
  ];

  const [mode, setMode] = useState<Mode>("inhouse");

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
            {show && <ModeToggle mode={mode} onChange={setMode} />}
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
                {Tests.filter((t) => {
                  if (tab === "Imaging") {
                    return t.type === "Imaging";
                  } else if (tab === "Lab") {
                    return t.type === "Lab";
                  }
                  return true;
                })
                  .filter((t) => {
                    if (!query) {
                      return true;
                    }
                    return (
                      t.code.toLowerCase().includes(query.toLowerCase()) ||
                      t.name.toLowerCase().includes(query.toLowerCase())
                    );
                  })
                  .map((t) => (
                    <div key={t._id} className="relative">
                      <TestItem
                        test={t}
                        selected={isSelected(t)}
                        onToggle={toggleTest}
                      />
                    </div>
                  ))}
              </div>
            </section>

            <section className="lg:col-span-8 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              {mode === "external" && <>

                <p className="text-sm text-zinc-600">
                  Calendar → Lab → Time (in separate columns). Priority optional.
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-zinc-200 p-4">
                    <div className="font-medium text-zinc-800 mb-2">
                      Select Date
                    </div>

                    <Calendar
                      required
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border shadow-sm w-full"
                      captionLayout="dropdown"
                    />

                  </div>

                  <div className="rounded-xl border border-zinc-200 p-4">
                    <div className="font-medium text-zinc-800 mb-2">
                      Select Lab
                    </div>
                    <div className="flex flex-col gap-2">
                      {Labs.filter((l) => {
                        const labCodes = l.tests.map((t) => t.code);
                        const selectedCode = selectedTests.map((t) => t.code);
                        if (selectedCode.length === 0) return false;
                        return selectedCode.every((code) =>
                          labCodes.includes(code)
                        );
                      }).map((l) => (
                        <button
                          key={l._id}
                          onClick={() => setLabId(l._id)}
                          className={[
                            "text-left rounded-xl border px-3 py-2",
                            labId === l._id
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
                          onClick={() => {
                            setSlot(s)
                          }}
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
                    <div className="font-medium text-zinc-800 mb-1">Priority</div>
                    <div className="flex flex-wrap gap-2">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPriority(p.id)}
                          className={[
                            "rounded-full border px-3 py-1 text-xs font-medium",
                            priority === p.id
                              ? p.id === "High"
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
              </>}
              <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 text-sm text-zinc-700">
                <div className="truncate">
                  {selectedTests.length > 0 ? (
                    <>
                      <span className="font-medium">
                        {selectedTests.length} test(s)
                      </span>
                      {date && <> • {fDate(date)}</>}
                      {labId && (
                        <> • {Labs.find((l) => l._id === labId)?.name}</>
                      )}
                      {slot && <> • {slot}</>}
                      {priority === "High" && <> • HIGH</>}
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
          </div>
        )}
      </div>
      {show && <OrderLab booked={data.test} setData={setData} Labs={Labs} />}
    </>
  );
}
