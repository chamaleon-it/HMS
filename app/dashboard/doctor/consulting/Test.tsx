"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DataType } from "./interface";
import OrderLab from "./OrderLab";
import { Image as ImageIcon, Star, TestTubeDiagonal } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/20"
          : "border-zinc-200 bg-white hover:border-emerald-300 hover:shadow-sm hover:bg-zinc-50"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={cn(
              "text-sm font-semibold truncate",
              selected ? "text-emerald-900" : "text-zinc-900"
            )}
          >
            {test.name}
          </span>
          {test.type === "Lab" && (
            <TestTubeDiagonal
              className={cn(
                "w-3.5 h-3.5",
                selected ? "text-emerald-600" : "text-zinc-400"
              )}
            />
          )}
          {test.type === "Imaging" && (
            <ImageIcon
              className={cn(
                "w-3.5 h-3.5",
                selected ? "text-emerald-600" : "text-zinc-400"
              )}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-mono px-1.5 py-0.5 rounded",
              selected
                ? "bg-emerald-100 text-emerald-700"
                : "bg-zinc-100 text-zinc-500"
            )}
          >
            {test.code}
          </span>
          <span className="text-xs text-zinc-400 capitalize">{test.type}</span>
        </div>
      </div>
      <div className="flex justify-end items-center gap-5">
        <div
          className={cn(
            "h-5 w-5 rounded-full border flex items-center justify-center transition-colors cursor-pointer",
            selected
              ? "border-emerald-500 bg-[var(--color-cosmo-dark)] text-white"
              : "border-zinc-300 bg-transparent text-transparent group-hover:border-emerald-400"
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </button>

    {type === "Test" ? (
      <Button
        variant={"ghost"}
        className="cursor-pointer"
        onClick={() => {
          setFavourite?.((prev) => {
            const exists = prev.find((t) => t._id === test._id);
            if (exists) {
              const newFavourite = prev.filter((t) => t._id !== test._id);
              localStorage.setItem(
                "@favouriteTest",
                JSON.stringify(newFavourite)
              );
              return newFavourite;
            }

            const newFavourite = [...prev];
            newFavourite.push(test);
            localStorage.setItem(
              "@favouriteTest",
              JSON.stringify(newFavourite)
            );
            return newFavourite;
          });
        }}
      >
        <Star
          className="w-4 h-4 text-yellow-500"
          fill={favourite?.find((t) => t._id === test._id) ? "#efb100" : "none"}
        />
      </Button>
    ) : (
      <Button
        variant={"ghost"}
        className="cursor-pointer"
        onClick={() => {
          setFavouritePanels?.((prev) => {
            const exists = prev.find((t) => t === test.name);
            if (exists) {
              const newFavourite = prev.filter((t) => t !== test.name);
              localStorage.setItem(
                "@favouriteTest",
                JSON.stringify(newFavourite)
              );
              return newFavourite;
            }

            const newFavourite = [...prev];
            newFavourite.push(test.name);
            localStorage.setItem(
              "@favouritePanel",
              JSON.stringify(newFavourite)
            );
            return newFavourite;
          });
        }}
      >
        <Star
          className="w-4 h-4 text-yellow-500"
          fill={
            favouritePanels?.find((t) => t === test.name) ? "#efb100" : "none"
          }
        />
      </Button>
    )}
  </div>
);

export default function Test({
  data,
  setData,
  setTestIsOK,
}: {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
  setTestIsOK: Dispatch<SetStateAction<boolean>>;
}) {
  const [query, setQuery] = useState<string>("");
  const [tab, setTab] = useState<TabKey>("All");
  const [selectedTests, setSelectedTests] = useState<TestItemType[]>([]);
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
      priority: "Normal",
      panels: selectedPanel,
    };
    setData((prev) => ({ ...prev, test: [...prev.test, newTest] }));
    setBooked(true);
    setSelectedTests([]);
    setSelectedPanel([]);
  };

  const [show, setShow] = useState(false);

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
              <p className="text-xs text-zinc-500 font-medium">
                Select tests to book
              </p>
            </div>
          </div>

          {!show && (
            <Button
              onClick={() => setShow(true)}
              className="bg-[var(--color-cosmo-dark)] hover:bg-[var(--color-cosmo-dark)] text-white rounded-full px-6 shadow-md shadow-[var(--color-cosmo-copper)]/30"
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
                  {
                    tests.filter(
                      (test) =>
                        (tab === "All" || test.type === tab) &&
                        !selectedTests.find((t) => t._id === test._id) &&
                        test.name.toLowerCase().includes(query.toLowerCase())
                    ).length
                  }{" "}
                  tests found tests found
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
                      onToggle={(t) => {
                        setSelectedPanel((prev) => [...prev, t.code]);
                        const panelTest = tests.filter((t) =>
                          t.panels?.find((p) => p.name === panel)
                        );
                        panelTest.forEach((test) => {
                          toggleTest(test);
                        });
                      }}
                      favouritePanels={favouritePanels}
                      setFavouritePanels={setFavouritePanels}
                    />
                  ))}
                {favourite
                  ?.filter(
                    (test) =>
                      (tab === "All" || test.type === tab) &&
                      !selectedTests.find((t) => t._id === test._id) &&
                      test.name.toLowerCase().startsWith(query.toLowerCase())
                  )
                  .map((test) => (
                    <TestItem
                      key={test._id}
                      test={test}
                      selected={isSelected(test)}
                      onToggle={toggleTest}
                      type="Test"
                      setFavourite={setFavourite}
                      favourite={favourite}
                    />
                  ))}
                {panels
                  ?.filter(
                    (panel) =>
                      !selectedPanel.includes(panel.name) &&
                      panel.name.toLowerCase().startsWith(query.toLowerCase()) &&
                      !favouritePanels.includes(panel.name)
                  )
                  .map((panel) => (
                    <TestItem
                      key={panel.name}
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
                      onToggle={(t) => {
                        setSelectedPanel((prev) => [...prev, t.code]);
                        const panelTest = tests.filter((t) =>
                          t.panels?.find((p) => p.name === panel.name)
                        );
                        panelTest.forEach((test) => {
                          toggleTest(test);
                        });
                      }}
                      favouritePanels={favouritePanels}
                      setFavouritePanels={setFavouritePanels}
                    />
                  ))}

                {tests
                  ?.filter(
                    (test) =>
                      (tab === "All" || test.type === tab) &&
                      test.name.toLowerCase().startsWith(query.toLowerCase()) &&
                      !favourite?.find((f) => f._id === test._id)
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

            <section className="lg:col-span-7 flex flex-col gap-6 h-full">
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center">
                      <span className="text-xs font-bold">
                        {selectedTests.length}
                      </span>
                    </div>
                    <h3 className="font-semibold text-zinc-900">
                      Selected Tests
                    </h3>
                  </div>
                  {selectedTests.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedTests([]);
                        setSelectedPanel([]);
                      }}
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
                      <p className="text-xs text-zinc-300 max-w-[200px] text-center">
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
                              prev.filter((panel) => panel !== panel)
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
                      "w-full py-3 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2",
                      canBook
                        ? "bg-[var(--color-cosmo-dark)] text-white hover:bg-[var(--color-cosmo-dark)] hover:shadow-[var(--color-cosmo-copper)]/30 hover:-translate-y-0.5"
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
      </div>
      {show && (
        <OrderLab
          booked={data.test}
          setData={setData}
        />
      )}
    </>
  );
}
