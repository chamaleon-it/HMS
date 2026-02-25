import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PatientSelection from "./PatientSelection";
import { useState, useEffect } from "react";
import { useAuth } from "@/auth/context/auth-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { combineToIST, fDate } from "@/lib/fDateAndTime";
import {
  Calendar as CalendarIcon,
  ChevronDownIcon,
  Plus,
  Trash,
  Zap,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useSWR from "swr";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

import useGetTest from "@/data/useGetTest";
import Drawer from "@/components/ui/drawer";
import { RegisterPatient } from "./RegisterPatient";
import useGetPanels from "@/data/useGetPanels";
import LabeledCombobox from "./LabeledCombobox";

interface NewTestProps {
  mutate?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultBookingType?: "Book Now" | "Schedule";
}

const theme = {
  from: "#4f46e5",
  to: "#ec4899",
  accent: "#06b6d4",
};

export default function NewTest({
  mutate,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  defaultBookingType = "Book Now"
}: NewTestProps) {
  const { user } = useAuth();
  const { panels } = useGetPanels();


  const [openCreate, setOpenCreate] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const [openDate, setOpenDate] = useState(false);
  const [bookingType, setBookingType] = useState<"Book Now" | "Schedule">(
    defaultBookingType
  );

  // Update booking type when default changes or dialog opens
  useEffect(() => {
    if (open && isControlled && defaultBookingType) {
      setBookingType(defaultBookingType);
    }
  }, [open, isControlled, defaultBookingType]);

  const tabs = [
    { key: "Book Now", label: "Book Now", icon: Zap },
    { key: "Schedule", label: "Schedule", icon: CalendarIcon },
  ] as const;
  const [payload, setPayload] = useState<{
    patient: string;
    doctor: string;
    lab: string;
    test: { name: string }[];
    panels: string[];
    date: Date | undefined;
    priority: string;
    sampleType: string;
    status: string;
  }>({
    patient: "",
    doctor: user?._id ?? "",
    lab: user?._id ?? "",
    test: [],
    panels: [],
    date: new Date(),
    priority: "Normal",
    sampleType: "Other",
    status: "Upcoming",
  });

  const { tests } = useGetTest();

  const Tests = tests;

  const handleSubmit = async () => {
    if (!payload.patient) {
      toast.error("Please select patient");
      return;
    }
    let submitDate = payload.date;
    if (bookingType === "Book Now") {
      submitDate = new Date();
    }

    if (!submitDate) {
      toast.error("Please select a date");
      return;
    }
    if (payload.test.length === 0) {
      toast.error("Please select at least one date");
      return;
    }

    try {
      await toast.promise(
        api.post("/lab/report", { ...payload, date: submitDate }),
        {
          loading: "We are create new lab test order",
          success: ({ data }) => data.message,
          error: ({ response }) => response.data.message,
        }
      );
      setOpen?.(false);
      mutate?.();
      setPayload({
        patient: "",
        doctor: user?._id ?? "",
        lab: user?._id ?? "",
        test: [],
        panels: [],
        date: new Date(),
        priority: "Normal",
        sampleType: "Other",
        status: "Upcoming",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1 shadow-sm">
          {[
            { key: "Book Now", label: "Book now", icon: Zap },
            { key: "Schedule", label: "Schedule", icon: CalendarIcon },
          ].map(({ key, label, icon: Icon }) => {
            const active = bookingType === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setBookingType(key as "Book Now" | "Schedule");
                  setOpen?.(true);
                }}
                className={
                  "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer font-medium " +
                  (active ? "text-white" : "text-slate-600 hover:bg-slate-50")
                }
                type="button"
              >
                {active && (
                  <motion.span
                    layoutId="external-booking-indicator"
                    className="absolute inset-0 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${theme.from}, ${theme.to})` }}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={16} /> {label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <DialogContent className="min-w-4xl">
        <DialogHeader>
          <DialogTitle>Add new test</DialogTitle>
          <DialogDescription>Create a new test</DialogDescription>
        </DialogHeader>
        <div className="flex justify-between items-center">
          <PatientSelection
            setValue={(id: string) => {
              setPayload((prev) => ({ ...prev, patient: id }));
            }}
            register={() => {
              setOpenCreate(true);
              setOpen?.(false);
            }}
          />
          <div className="flex flex-col gap-3">
            <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1">
              {tabs.map(({ key, label, icon: Icon }) => {
                const active = bookingType === key;
                return (
                  <button
                    key={key}
                    onClick={() => setBookingType(key)}
                    className={
                      "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer " +
                      (active ? "text-white" : "text-gray-700")
                    }
                    type="button"
                  >
                    {active && (
                      <motion.span
                        layoutId="tab-indicator-1"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "linear-gradient(90deg,#4f46e5,#d946ef)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon size={16} /> {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-between w-full">
          <div className="w-[300px]">
            <LabeledCombobox
              label="Select a Test"
              value=""
              onChange={(val) => {
                if (!val) return;

                // Check if it's a panel
                const isPanel = panels.find((p) => p.name === val);
                if (isPanel) {
                  setPayload((prev) => {
                    const panelExists = prev.panels.includes(val);
                    if (panelExists) return prev; // Should not happen if filtered, but safe guard

                    const newTests = tests
                      .filter((t) => t.panels?.some((p) => p.name === val))
                      .map((t) => ({ name: t._id }));

                    return {
                      ...prev,
                      panels: [...prev.panels, val],
                      test: [
                        ...prev.test,
                        ...newTests.filter(
                          (nt) => !prev.test.some((pt) => pt.name === nt.name)
                        ),
                      ],
                    };
                  });
                } else {
                  // Must be a test
                  const testObj = tests.find((t) => t.name === val);
                  if (testObj) {
                    setPayload((prev) => {
                      const exist = prev.test.find((n) => n.name === testObj._id);
                      if (exist) return prev;
                      return {
                        ...prev,
                        test: [...prev.test, { name: testObj._id }],
                      };
                    });
                  }
                }
              }}
              options={[
                ...panels.filter((p) => !payload.panels.includes(p.name)).map(e => e.name),
                ...tests
                  .filter(
                    (t) =>
                      !t.panels?.find((p) => payload.panels.includes(p.name)) &&
                      !payload.test.some((pt) => pt.name === t._id)
                  )
                  .map((t) => t.name),
              ]}
            />
          </div>

          {bookingType === "Schedule" && (
            <>
              <div className="flex gap-2">
                <Popover open={openDate} onOpenChange={setOpenDate}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date"
                      className="w-48 justify-between font-normal"
                    >
                      {payload.date ? fDate(payload.date) : "Select date"}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={payload.date}
                      captionLayout="dropdown"
                      startMonth={new Date(2025, 0)}
                      endMonth={new Date(2027, 0)}
                      onSelect={(date) => {
                        setPayload((prev) => ({ ...prev, date }));
                        setOpenDate(false);
                      }}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  id="time-picker"
                  step="1800"
                  defaultValue={`${new Date().getHours()}:${new Date().getMinutes()}`}
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  onChange={(e) => {
                    if (payload.date) {
                      const newDate = combineToIST(
                        payload.date,
                        e.target.value
                      );
                      setPayload((prev) => ({ ...prev, date: newDate }));
                    } else {
                      toast.error("Select date first");
                    }
                  }}
                />
              </div>
            </>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SL</TableHead>
              <TableHead>Test Name</TableHead>
              <TableHead>Min Range</TableHead>
              <TableHead>Max Range</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payload.panels.map((t, idx) => (
              <TableRow key={t}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{t}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => {
                      setPayload((prev) => {
                        if (!prev.panels.includes(t)) return prev;

                        const relatedTestIds = new Set(
                          tests
                            .filter((test) =>
                              test.panels?.some((panel) => panel.name === t)
                            )
                            .map((test) => test._id)
                        );

                        return {
                          ...prev,
                          panels: prev.panels.filter((panel) => panel !== t),
                          test: prev.test.filter(
                            (testItem) => !relatedTestIds.has(testItem.name)
                          ),
                        };
                      });
                    }}
                  >
                    <Trash className="h-2 w-2 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {payload.test.filter(t => {
              const found = tests.find((test) => test._id === t.name)
              const panelExist = found?.panels?.find(p => payload.panels.includes(p.name))
              return !panelExist
            }).map((t, idx) => (
              <TableRow key={t.name}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  {tests.find((test) => test._id === t.name)?.name}
                </TableCell>
                <TableCell>
                  {tests.find((test) => test._id === t.name)?.min}
                </TableCell>
                <TableCell>
                  {tests.find((test) => test._id === t.name)?.max}
                </TableCell>
                <TableCell>
                  {tests.find((test) => test._id === t.name)?.unit}
                </TableCell>
                <TableCell>
                  <Button
                    variant={"ghost"}
                    className="cursor-pointer"
                    onClick={() => {
                      setPayload((prev) => ({
                        ...prev,
                        test: prev.test.filter((n) => n.name !== t.name),
                      }));
                    }}
                  >
                    <Trash className="h-2 w-2 text-red-500" size={"sm"} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSubmit}
          >
            New Test
          </Button>
        </DialogFooter>
      </DialogContent>

      <Drawer
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Patient Register"
      >
        <RegisterPatient onClose={() => setOpenCreate(false)} />
      </Drawer>
    </Dialog>
  );
}
