"use client";

import React, { useEffect, useState } from "react";
import { DataType } from "./interface";
import OrderLab from "./OrderLab";
import { Image as ImageIcon, Star, TestTubeDiagonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { combineDateAndSlot } from "@/lib/fDateAndTime";
import { Calendar } from "@/components/ui/calendar";
import configuration from "@/config/configuration";
import { cn } from "@/lib/utils";
import SelectedTests from "./SelectedTests";
import useGetPanels from "@/data/useGetPanels";
import useGetTest, { TestItemType } from "@/data/useGetTest";

type TabKey = "All" | "Lab" | "Imaging";


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
  type: "Test" | "Panel";
  setFavourite: React.Dispatch<React.SetStateAction<TestItemType[]>>
  favourite: TestItemType[]
};

const TestItem: React.FC<TestItemProps> = ({ test, selected, onToggle, type, setFavourite, favourite }) => (
  <div

    className={cn(
      "w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 group",
      selected
        ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/20"
        : "border-zinc-200 bg-white hover:border-emerald-300 hover:shadow-sm hover:bg-zinc-50"
    )}
  >
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 mb-0.5">
        <span className={cn(
          "text-sm font-semibold truncate",
          selected ? "text-emerald-900" : "text-zinc-900"
        )}>
          {test.name}
        </span>
        {test.type === "Lab" ? (
          <TestTubeDiagonal className={cn("w-3.5 h-3.5", selected ? "text-emerald-600" : "text-zinc-400")} />
        ) : (
          <ImageIcon className={cn("w-3.5 h-3.5", selected ? "text-emerald-600" : "text-zinc-400")} />
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-xs font-mono px-1.5 py-0.5 rounded",
          selected ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
        )}>
          {test.code}
        </span>
        <span className="text-xs text-zinc-400 capitalize">{test.type}</span>
      </div>
    </div>
    <div className="flex justify-end items-center gap-5">

      <button
        onClick={() => onToggle(test)}
        className={cn(
          "h-5 w-5 rounded-full border flex items-center justify-center transition-colors cursor-pointer",
          selected
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-zinc-300 bg-transparent text-transparent group-hover:border-emerald-400"
        )}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </button>

      {type === "Test" && <button className="cursor-pointer" onClick={() => {
        setFavourite(prev => {
          const exists = prev.find(t => t._id === test._id)
          if (exists) {
            const newFavourite = prev.filter(t => t._id !== test._id)
            localStorage.setItem("@favouriteTest", JSON.stringify(newFavourite))
            return newFavourite
          }

          const newFavourite = [...prev]
          newFavourite.push(test)
          localStorage.setItem("@favouriteTest", JSON.stringify(newFavourite))
          return newFavourite
        })
      }}>
        <Star className="w-4 h-4 text-yellow-500" fill={favourite.find(t => t._id === test._id) ? "#efb100" : "none"} />
      </button>}


    </div>

  </div>
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
  const [labId, setLabId] = useState<string>(configuration().in_house_lab_id);
  const [slot, setSlot] = useState<string>("");
  const [priority, setPriority] = useState<PriorityId>("Normal");
  const isSelected = (t: TestItemType) => selectedTests.some((x) => x._id === t._id);
  const toggleTest = (t: TestItemType) => setSelectedTests((prev) => isSelected(t) ? prev.filter((x) => x._id !== t._id) : [...prev, t]);
  const [mode, setMode] = useState<Mode>("inhouse");
  const [selectedPanel, setSelectedPanel] = useState<string[]>([]);

  const canBook = selectedTests.length > 0 && (mode === "inhouse" || Boolean(date && labId));
  const [booked, setBooked] = useState(false);
  useEffect(() => {
    setBooked(false);
  }, [selectedTests, date, labId, priority, slot]);

  const bookTest = () => {
    if (booked) return;

    const datetime = combineDateAndSlot(date, slot);
    const newTest = {
      name: selectedTests.map(e => e._id),
      date: mode === "inhouse" ? new Date() : datetime,
      lab: labId === "" ? labId : configuration().in_house_lab_id,
      priority,
      panels: selectedPanel,
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
        panel: string;
        min?: number;
        max?: number;
        unit: string;
        _id: string;
      }[];
    }[];
  }>("/users/lab");

  const Labs = LabData?.data ?? [];








  const [favourite, setFavourite] = useState<TestItemType[]>([]);

  useEffect(() => {
    const fav = localStorage.getItem("@favouriteTest");
    if (fav) {
      setFavourite(JSON.parse(fav));
    }
  }, []);


  const { panels } = useGetPanels();

  const { tests } = useGetTest();

  return (
    <>
      <div className="">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 grid place-items-center shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600">
                <path
                  fill="currentColor"
                  d="M19 3H5c-1.1 0-2 .9-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5c0-1.1-.9-2-2-2Z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                Lab & Imaging
              </h1>
              <p className="text-xs text-zinc-500 font-medium">Select tests to book</p>
            </div>
            {show && <div className="ml-4"><ModeToggle mode={mode} onChange={setMode} /></div>}
          </div>

          {!show && (
            <Button
              onClick={() => setShow(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-md shadow-emerald-200"
            >
              Start Booking
            </Button>
          )}
        </div>

        {show && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <section className="lg:col-span-5 flex flex-col gap-2 max-h-[calc(70vh)]">

              {/* Search and Main Filters */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm space-y-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
                  {(
                    [
                      { key: "All", label: "All Tests" },
                      { key: "Lab", label: "Laboratory" },
                      { key: "Imaging", label: "Imaging" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                        tab === t.key
                          ? "bg-zinc-900 text-white shadow-md"
                          : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by test name or code..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium text-zinc-500">
                  {tests.filter(test => (tab === "All" || test.type === tab) && !selectedTests.find(t => t._id === test._id) && test.name.toLowerCase().includes(query.toLowerCase())).length} tests found tests found
                </span>

              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-zinc-200 min-h-0">
                {
                  favourite?.filter(test => (tab === "All" || test.type === tab) && !selectedTests.find(t => t._id === test._id) && test.name.toLowerCase().startsWith(query.toLowerCase())).map(test => (
                    <TestItem
                      key={test._id}
                      test={test}
                      selected={isSelected(test)}
                      onToggle={toggleTest}
                      type="Test"
                      setFavourite={setFavourite}
                      favourite={favourite}
                    />
                  ))
                }
                {
                  tests?.filter(test => (tab === "All" || test.type === tab) && test.name.toLowerCase().startsWith(query.toLowerCase()) && !favourite?.find(f => f._id === test._id)).map((t) => !selectedTests.find(test => test._id === t._id) && (
                    <TestItem
                      key={t._id}
                      test={t}
                      selected={isSelected(t)}
                      onToggle={toggleTest}
                      type="Test"
                      setFavourite={setFavourite}
                      favourite={favourite}
                    />
                  ))
                }
              </div>
            </section>

            <section className="lg:col-span-7 flex flex-col gap-6 h-full">
              {mode === "external" && (
                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-600 grid place-items-center">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-zinc-900">Booking Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Date</label>
                      <Calendar
                        required
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-xl border shadow-sm w-full max-w-[450px]"
                      />
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Lab Center</label>
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                          {Labs.map((l) => (
                            <button
                              key={l._id}
                              onClick={() => setLabId(l._id)}
                              className={cn(
                                "text-left rounded-lg border px-3 py-2.5 text-sm transition-all",
                                labId === l._id
                                  ? "border-amber-500 bg-amber-50 text-amber-900 shadow-sm ring-1 ring-amber-500/20"
                                  : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                              )}
                            >
                              {l.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Time Slot</label>
                        <div className="grid grid-cols-3 gap-2">
                          {SLOTS.map((s) => (
                            <button
                              key={s}
                              onClick={() => setSlot(s)}
                              className={cn(
                                "rounded-md border px-2 py-1.5 text-xs font-medium transition-all",
                                slot === s
                                  ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                                  : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Priority</label>
                        <div className="flex gap-2">
                          {PRIORITIES.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => setPriority(p.id)}
                              className={cn(
                                "rounded-full border px-4 py-1.5 text-xs font-medium transition-all",
                                priority === p.id
                                  ? p.id === "High"
                                    ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
                                    : "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                              )}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center">
                      <span className="text-xs font-bold">{selectedTests.length}</span>
                    </div>
                    <h3 className="font-semibold text-zinc-900">Selected Tests</h3>
                  </div>
                  {selectedTests.length > 0 && (
                    <button
                      onClick={() => setSelectedTests([])}
                      className="text-xs text-red-500 hover:text-red-600 font-medium hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {selectedTests.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-3">
                      <div className="h-16 w-16 rounded-full bg-zinc-50 border border-zinc-100 grid place-items-center">
                        <TestTubeDiagonal className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="text-sm">No tests selected yet</p>
                      <p className="text-xs text-zinc-300 max-w-[200px] text-center">Select tests from the list to add them to the booking</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {selectedTests
                        .map((test) => (
                          <SelectedTests key={test._id} test={test} toggleTest={toggleTest} />
                        ))}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
                  <div className="flex items-center justify-between mb-4 text-sm text-zinc-600">
                    <span>Total Items</span>
                    <span className="font-semibold text-zinc-900">{selectedTests.length}</span>
                  </div>

                  <button
                    onClick={bookTest}
                    disabled={!canBook}
                    className={cn(
                      "w-full py-3 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2",
                      canBook
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200 hover:-translate-y-0.5"
                        : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                    )}
                  >
                    <span>Confirm Booking</span>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14m-7-7l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
      {show && <OrderLab booked={data.test} setData={setData} Labs={Labs} />}
    </>
  );
}
