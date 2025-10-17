import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AnimatePresence } from "framer-motion";
import {
  Building2,
  CalendarClock,
  FlaskConical,
  ImageIcon,
  Search,
  TestTubeDiagonal,
} from "lucide-react";
import React, { useMemo, useState } from "react";

import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import OrderLab from "./OrderLab";
import { DataType } from "./interface";
import { LABS, TESTS } from "./data";
import { to12h } from "@/lib/fDateAndTime";

export default function LabAndTest({
  data,
  setData,
}: {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
}) {
  const [orderOpen, setOrderOpen] = useState(false);
  const [labTestType, setLabTestType] = useState("all");
  const [labTestName, setLabTestName] = useState("");
  const [selectedLab, setSelectedLab] = useState<string>("");
  const [seletedTest, setSeletedTest] = useState<string[]>([]);
  const [slot, setSlot] = useState<string>("");
  const [orderDay, setOrderDay] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<"STAT" | "High" | "Normal">(
    "Normal"
  );

  const sortedLabs = useMemo(() => {
    return [...LABS].sort(
      (a, b) =>
        Number(b.inhouse) - Number(a.inhouse) || a.name.localeCompare(b.name)
    );
  }, []);

  const handleBook = () => {
    setData((prev) => ({
      ...prev,
      test: [
        ...prev.test,
        {
          name: seletedTest,
          date: orderDay || new Date(),
          lab: selectedLab,
          slot: slot,
          priority: priority,
        },
      ],
    }));
    if (!selectedLab || !orderDay || !slot) return;
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <CalendarClock className="w-4 h-4" /> Lab / Imaging Booking
        </Label>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOrderOpen((o) => !o)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
        >
          {orderOpen ? "Hide" : "Book"}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {orderOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-3 rounded-xl border bg-slate-50"
          >
            <div className="grid md:grid-cols-8 gap-0">
              <div className="md:col-span-2 border-r p-3 md:max-h-[350px] md:overflow-y-auto">
                <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
                  Select Test
                </div>

                <div className="flex shrink-0 gap-2.5">
                  <Tabs defaultValue="lab" className="space-y-3">
                    <TabsList className="flex gap-1">
                      <TabsTrigger
                        value="all"
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => setLabTestType("all")}
                      >
                        All
                      </TabsTrigger>

                      <TabsTrigger
                        value="lab"
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => setLabTestType("lab")}
                      >
                        <FlaskConical className="h-2 w-2" />
                        Lab
                      </TabsTrigger>
                      <TabsTrigger
                        value="image"
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => setLabTestType("image")}
                      >
                        <ImageIcon className="h-2 w-2" />
                        Imaging
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="relative mb-3 w-[45%]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search tests..."
                      className="pl-9"
                      onChange={(e) => setLabTestName(e.target.value)}
                      value={labTestName}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {TESTS.filter((e) => {
                    const typeMatch =
                      labTestType === "all" ||
                      (labTestType === "lab" && e.type === "lab") ||
                      (labTestType === "image" && e.type === "image");

                    const nameMatch =
                      !labTestName ||
                      e.name.toLowerCase().includes(labTestName.toLowerCase());

                    return typeMatch && nameMatch;
                  }).map((l) => (
                    <Button
                      key={l.id}
                      size="sm"
                      variant={selectedLab === l.name ? "default" : "outline"}
                      onClick={() => {
                        setSeletedTest((prev) => {
                          if (prev.includes(l.name)) {
                            return prev.filter((e) => e !== l.name);
                          } else {
                            return [...prev, l.name];
                          }
                        });
                        setSlot("");
                      }}
                      className={`w-full justify-between cursor-pointer ${
                        seletedTest.find((e) => e === l.name)
                          ? "bg-slate-900 hover:bg-slate-900 text-white hover:text-white"
                          : ""
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <TestTubeDiagonal className="w-4 h-4" />
                        {l.name}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-6 p-3">
                <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-2">
                  <CalendarClock className="w-4 h-4" /> Select date & time
                </div>
                <div className="grid grid-cols-3 gap-3 w-full">
                  <Card className="p-2">
                    <Calendar
                      mode="single"
                      selected={orderDay}
                      onSelect={(d) => {
                        setOrderDay(d);
                        setSlot("");
                      }}
                      className="rounded-md"
                    />
                  </Card>

                  <Card className="p-2">
                    <div className="text-xs text-slate-500 mb-2">
                      Select Lab
                    </div>
                    <div className="space-y-2">
                      {sortedLabs.map((l) => (
                        <Button
                          key={l.id}
                          size="sm"
                          variant={
                            selectedLab === l.name ? "default" : "outline"
                          }
                          onClick={() => {
                            setSelectedLab(l.name);
                            setSlot("");
                          }}
                          className={`w-full justify-between cursor-pointer ${
                            selectedLab === l.name
                              ? "bg-slate-900 hover:bg-slate-900"
                              : ""
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <Building2 className="w-4 h-4" />
                            {l.name}
                          </span>
                          {l.inhouse ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              In‑house
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                              External
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-3 flex flex-col">
                    <div className="text-xs text-slate-500 mb-2">
                      Available Slots
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {getAvailableSlots(selectedLab).map((s) => (
                        <motion.div key={s} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant={slot === s ? "default" : "outline"}
                            onClick={() => setSlot(s)}
                            disabled={!orderDay}
                          >
                            {to12h(s)}
                          </Button>
                        </motion.div>
                      ))}
                      {getAvailableSlots(selectedLab).length === 0 && (
                        <div className="text-xs text-slate-400 col-span-3">
                          Select a lab to view slots.
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-slate-500">Priority:</span>
                      {(["STAT", "High", "Normal"] as const).map((p) => (
                        <Badge
                          key={p}
                          onClick={() => {
                            if (
                              sortedLabs.find((e) => selectedLab === e.name)
                                ?.inhouse === false &&
                              p === "STAT"
                            ) {
                              return;
                            } else {
                              setPriority(p);
                            }
                          }}
                          className={`
                                        ${
                                          sortedLabs.find(
                                            (e) => selectedLab === e.name
                                          )?.inhouse === false && p === "STAT"
                                            ? "border !bg-gray-400 border-gray-700 text-white"
                                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        } 
                                        cursor-pointer border ${
                                          p === priority
                                            ? "ring-2 ring-emerald-400"
                                            : ""
                                        } ${
                            p === "STAT"
                              ? ""
                              : p === "High"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-700 border"
                          }`}
                        >
                          {p}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-auto flex justify-end gap-2 pt-3">
                      <motion.div whileTap={{ scale: 0.97 }}>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                          disabled={!orderDay || !slot}
                          onClick={handleBook}
                        >
                          Book Test
                        </Button>
                      </motion.div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>

            {data.test.length !== 0 && <OrderLab booked={data.test} />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function getAvailableSlots(labId: string | null): string[] {
  if (!labId) return [];
  const lab = LABS.find((l) => l.name === labId);
  return lab ? lab.slots : [];
}

