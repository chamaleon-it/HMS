"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DataType } from "./interface";
import OrderLab from "./OrderLab";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, Star, TestTubeDiagonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import SelectedTests from "./SelectedTests";
import useGetPanels from "@/data/useGetPanels";
import useGetTest, { TestItemType } from "@/data/useGetTest";

type TabKey = "All" | "Lab" | "Imaging";

type TestItemProps = {
  test: TestItemType;
  selected: boolean;
  onToggle: (test: TestItemType) => void;
  type: "Test" | "Panel";
  setFavourite?: React.Dispatch<React.SetStateAction<TestItemType[]>>;
  favourite?: TestItemType[];
  favouritePanels?: string[];
  setFavouritePanels?: React.Dispatch<React.SetStateAction<string[]>>;
};

const TestItem: React.FC<TestItemProps> = ({
  test,
  selected,
  onToggle,
  type,
  setFavourite,
  favourite,
  favouritePanels,
  setFavouritePanels,
}) => (
  <div className="flex justify-between items-center gap-2">
    <button
      onClick={() => onToggle(test)}
      className={cn(
        "w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 group",
        selected
          ? "border-(--color-synapse-light) bg-synapse-light/10 shadow-sm ring-1 ring-synapse-light/20"
          : "border-zinc-200 bg-white hover:border-synapse-light/50 hover:shadow-sm hover:bg-zinc-50"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={cn(
              "text-sm font-semibold truncate",
              selected ? "text-zinc-900" : "text-zinc-900"
            )}
          >
            {test.name}
          </span>
          {test.type === "Lab" && (
            <TestTubeDiagonal
              className={cn(
                "w-3.5 h-3.5",
                selected ? "text-(--color-synapse-light)" : "text-zinc-400 group-hover:text-zinc-600"
              )}
            />
          )}
          {test.type === "Imaging" && (
            <ImageIcon
              className={cn(
                "w-3.5 h-3.5",
                selected ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-600"
              )}
            />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-[11px] text-zinc-600">
            {test.code}
          </span>
          {test.type && (
            <>
              <span>•</span>
              <span
                className={cn(
                  "font-medium",
                  test.type === "Lab"
                    ? "text-(--color-synapse-light)"
                    : test.type === "Imaging"
                      ? "text-blue-600"
                      : "text-zinc-500"
                )}
              >
                {test.type}
              </span>
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
          selected
            ? "border-(--color-synapse-light) bg-(--color-synapse-light) text-white"
            : "border-zinc-300 bg-white group-hover:border-zinc-400"
        )}
      >
        {selected && (
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-current stroke-3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </button>
    <div>
      <Button
        onClick={() => {
          if (type === "Test") {
            if (favourite?.some((f) => f._id === test._id)) {
              setFavourite?.(favourite.filter((f) => f._id !== test._id));
              localStorage.setItem(
                "@favouriteTest",
                JSON.stringify(favourite.filter((f) => f._id !== test._id))
              );
            } else {
              setFavourite?.([...(favourite ?? []), test]);
              localStorage.setItem(
                "@favouriteTest",
                JSON.stringify([...(favourite ?? []), test])
              );
            }
          } else {
            if (favouritePanels?.some((f) => f === test._id)) {
              setFavouritePanels?.(favouritePanels.filter((f) => f !== test._id));
              localStorage.setItem(
                "@favouritePanel",
                JSON.stringify(favouritePanels.filter((f) => f !== test._id))
              );
            } else {
              setFavouritePanels?.([...(favouritePanels ?? []), test._id]);
              localStorage.setItem(
                "@favouritePanel",
                JSON.stringify([...(favouritePanels ?? []), test._id])
              );
            }
          }
        }}
        className={cn(
          "h-10 w-10 p-0 rounded-xl border border-zinc-200 shadow-xs cursor-pointer transition-all",
          type === "Test"
            ? favourite?.some((f) => f._id === test._id)
              ? "bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-100"
              : "bg-white text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
            : favouritePanels?.some((f) => f === test._id)
              ? "bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-100"
              : "bg-white text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
        )}
      >
        <Star
          className={cn(
            "w-4 h-4",
            type === "Test"
              ? favourite?.some((f) => f._id === test._id) && "fill-amber-500"
              : favouritePanels?.some((f) => f === test._id) && "fill-amber-500"
          )}
        />
      </Button>
    </div>
  </div>
);

type Props = {
  data: DataType;
  setData: Dispatch<SetStateAction<DataType>>;
  setTestIsOK: Dispatch<SetStateAction<boolean>>;
  className?: string;
};

export default function Test({
  setData,
  data,
  setTestIsOK,
  className,
}: Props) {
  const [selectedTests, setSelectedTests] = useState<TestItemType[]>([]);
  const [tab, setTab] = useState<TabKey>("All");
  const [query, setQuery] = useState<string>("");

  const isSelected = (t: TestItemType) =>
    selectedTests.some((x) => x._id === t._id);
  const toggleTest = (t: TestItemType) =>
    setSelectedTests((prev) =>
      isSelected(t) ? prev.filter((x) => x._id !== t._id) : [...prev, t]
    );

  const [selectedPanel, setSelectedPanel] = useState<string[]>([]);

  const canBook = selectedTests.length > 0;
  const [booked, setBooked] = useState(false);
  useEffect(() => {
    setBooked(false);
  }, [selectedTests]);

  const bookTest = () => {
    if (booked) return;

    const newTest = {
      name: selectedTests.map((e) => e._id),
      date: new Date(),
      lab: "",
      priority: "Normal",
      panels: selectedPanel,
    };
    setData((prev) => ({ ...prev, test: [...prev.test, newTest] }));
    setBooked(true);
    setSelectedTests([]);
    setSelectedPanel([]);
  };

  const [show, setShow] = useState(false);

  const { data: LabData } = useSWR<{
    message: string;
    data: {
      _id: string;
      name: string;
    }[];
  }>("/users/lab");

  const Labs = LabData?.data ?? [];

  const [favourite, setFavourite] = useState<TestItemType[]>([]);
  const [favouritePanels, setFavouritePanels] = useState<string[]>([]);

  useEffect(() => {
    const fav = localStorage.getItem("@favouriteTest");
    if (fav) {
      setFavourite(JSON.parse(fav));
    }
  }, []);

  useEffect(() => {
    const fav = localStorage.getItem("@favouritePanel");
    if (fav) {
      setFavouritePanels(JSON.parse(fav));
    }
  }, []);

  const { panels } = useGetPanels();
  const { tests } = useGetTest();

  useEffect(() => {
    if (selectedPanel.length === 0 && selectedTests.length === 0) {
      setTestIsOK(true);
    } else {
      setTestIsOK(false);
    }
  }, [selectedPanel, selectedTests]);

  return (
    <Card className={cn("border-slate-200 shadow-xs", show && "md:col-span-2", className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="font-semibold text-lg text-slate-800">Lab & Imaging</h2>
            {data.test.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-synapse-light/10 text-(--color-synapse-light)">
                {data.test.reduce((acc, t) => acc + (t.name?.length || 0), 0)} prescribed
              </span>
            )}
          </div>

          {!show ? (
            <Button
              onClick={() => setShow(true)}
              className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) text-white rounded-full px-4 py-1.5 text-xs font-semibold shadow-xs cursor-pointer"
            >
              + Add Tests
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShow(false)}
              className="rounded-full px-3.5 py-1 text-xs font-medium border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Close
            </Button>
          )}
        </div>

        {show && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <section className="lg:col-span-7 flex flex-col gap-2 max-h-[calc(70vh)]">
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
                        "px-4 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border cursor-pointer",
                        tab === t.key
                          ? "bg-(--color-synapse-light) text-white border-(--color-synapse-light) shadow-xs font-semibold"
                          : "bg-slate-50 border-slate-200/90 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-synapse-light/20 focus:border-(--color-synapse-light) transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-zinc-500">
                  {
                    tests.filter(
                      (test) =>
                        (tab === "All" || test.type === tab) &&
                        !selectedTests.find((t) => t._id === test._id) &&
                        test.name.toLowerCase().includes(query.toLowerCase())
                    ).length
                  }{" "}
                  tests found
                </span>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-zinc-200 min-h-0">
                {favouritePanels
                  ?.filter(
                    (panel) =>
                      !selectedPanel.includes(panel) &&
                      panel.toLowerCase().startsWith(query.toLowerCase())
                  )
                  .map((panel) => (
                    <TestItem
                      key={panel}
                      selected={selectedPanel.includes(panel)}
                      type="Panel"
                      test={{
                        _id: panel,
                        name: panel,
                        code: panel,
                        type: "Panel",
                        range: [],
                        note: "",
                      }}
                      onToggle={(p) => {
                        const panelTests = tests.filter((test) =>
                          test.panels?.map((p) => p.name.includes(panel)).includes(true)
                        );
                        setSelectedTests((prev) => {
                          const existingIds = new Set(prev.map((t) => t._id));
                          const newTests = panelTests.filter((t) => !existingIds.has(t._id));
                          return [...prev, ...newTests];
                        });
                        setSelectedPanel((prev) => [...prev, panel]);
                      }}
                      favouritePanels={favouritePanels}
                      setFavouritePanels={setFavouritePanels}
                    />
                  ))}

                {favourite
                  ?.filter(
                    (test) =>
                      !selectedTests.find((t) => t._id === test._id) &&
                      (tab === "All" || test.type === tab) &&
                      test.name.toLowerCase().startsWith(query.toLowerCase())
                  )
                  .map((test) => (
                    <TestItem
                      key={test._id}
                      selected={isSelected(test)}
                      onToggle={toggleTest}
                      test={test}
                      type="Test"
                      setFavourite={setFavourite}
                      favourite={favourite}
                    />
                  ))}

                {panels
                  ?.filter(
                    (panel) =>
                      !selectedPanel.includes(panel.name) &&
                      !favouritePanels?.includes(panel.name) &&
                      panel.name.toLowerCase().startsWith(query.toLowerCase())
                  )
                  .map((panel) => (
                    <TestItem
                      key={panel._id}
                      selected={selectedPanel.includes(panel.name)}
                      type="Panel"
                      test={{
                        _id: panel.name,
                        name: panel.name,
                        code: panel.name,
                        type: "Panel",
                        range: [],
                        note: "",
                      }}
                      onToggle={(p) => {
                        const panelTests = tests.filter((test) =>
                          test.panels?.map((p) => p.name.includes(panel.name)).includes(true)
                        );
                        setSelectedTests((prev) => {
                          const existingIds = new Set(prev.map((t) => t._id));
                          const newTests = panelTests.filter((t) => !existingIds.has(t._id));
                          return [...prev, ...newTests];
                        });
                        setSelectedPanel((prev) => [...prev, panel.name]);
                      }}
                      favouritePanels={favouritePanels}
                      setFavouritePanels={setFavouritePanels}
                    />
                  ))}

                {tests
                  .filter(
                    (test) =>
                      (tab === "All" || test.type === tab) &&
                      !favourite?.find((t) => t._id === test._id) &&
                      test.name.toLowerCase().includes(query.toLowerCase())
                  )
                  .map(
                    (t) =>
                      !selectedTests.find((test) => test._id === t._id) && (
                        <TestItem
                          key={t._id}
                          test={t}
                          selected={isSelected(t)}
                          onToggle={toggleTest}
                          type="Test"
                          setFavourite={setFavourite}
                          favourite={favourite}
                        />
                      )
                  )}
              </div>
            </section>

            <section className="lg:col-span-5 flex flex-col gap-6 h-full">
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-synapse-light/15 text-(--color-synapse-light) grid place-items-center">
                      <span className="text-xs font-bold">
                        {selectedTests.length}
                      </span>
                    </div>
                    <h3 className="font-semibold text-zinc-900 text-sm">
                      Selected Tests
                    </h3>
                  </div>
                  {selectedTests.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedTests([]);
                        setSelectedPanel([]);
                      }}
                      className="text-xs text-red-500 hover:text-red-600 font-medium hover:underline cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 max-h-[calc(50vh)]">
                  {selectedTests.length === 0 ? (
                    <div className="h-full py-12 flex flex-col items-center justify-center text-zinc-400 space-y-3">
                      <div className="h-14 w-14 rounded-full bg-zinc-50 border border-zinc-100 grid place-items-center">
                        <TestTubeDiagonal className="w-7 h-7 opacity-20" />
                      </div>
                      <p className="text-sm font-medium">No tests selected yet</p>
                      <p className="text-xs text-zinc-400 max-w-50 text-center">
                        Select tests from the list to add them to the booking
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {selectedTests
                        .filter(
                          (test) =>
                            !test.panels
                              ?.map((p) => selectedPanel.includes(p.name))
                              .includes(true)
                        )
                        .map((test) => (
                          <SelectedTests
                            key={test._id}
                            test={test}
                            toggleTest={toggleTest}
                          />
                        ))}

                      {selectedPanel.map((panel) => (
                        <SelectedTests
                          key={panel}
                          test={{
                            _id: panel,
                            name: panel,
                            code: panel,
                            type: "Panel",
                            range: [],
                            note: "",
                          }}
                          toggleTest={() => {
                            tests
                              .filter((test) =>
                                test.panels
                                  ?.map((p) => p.name.includes(panel))
                                  .includes(true)
                              )
                              .map((test) => toggleTest(test));
                            setSelectedPanel((prev) =>
                              prev.filter((p) => p !== panel)
                            );
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
                  <div className="flex items-center justify-between mb-4 text-sm text-zinc-600">
                    <span>Total Items</span>
                    <span className="font-semibold text-zinc-900">
                      {selectedTests.length}
                    </span>
                  </div>

                  <button
                    onClick={bookTest}
                    disabled={!canBook}
                    className={cn(
                      "w-full py-2.5 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2 text-sm cursor-pointer",
                      canBook
                        ? "bg-(--color-synapse-dark) text-white hover:bg-(--color-synapse-dark) hover:shadow-(--color-synapse-light)/30 hover:-translate-y-0.5"
                        : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                    )}
                  >
                    <span>Confirm Booking</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14m-7-7l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        <OrderLab
          booked={data.test}
          setData={setData}
          Labs={Labs}
          panels={selectedPanel}
        />
      </CardContent>
    </Card>
  );
}
