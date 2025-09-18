"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  PlusCircle,
  IndianRupee,
  ClipboardCheck,
  ListChecks,
  Users,

} from "lucide-react";
import { motion } from "framer-motion";
import DailyViewTimeline from "./DayView";
import Summery from "./Summery";

export default function Dashboard() {
  const [openAppointment, setOpenAppointment] = useState(false);
  const [openLab, setOpenLab] = useState(false);
  const [openPatient, setOpenPatient] = useState(false);
  const [quickType] = useState<
    "Consultation" | "Lab Test" | "Follow-up"
  >("Consultation");

  const [hideConsulted] = useState(false);

  const colorMap = {
    Consultation: {
      chip: "bg-blue-100 text-blue-800",
      block: "bg-blue-100 text-blue-800",
      ring: "ring-blue-200",
      dot: "bg-blue-500",
      label: "Consultation",
    },
    "Lab Test": {
      chip: "bg-amber-100 text-amber-800",
      block: "bg-amber-100 text-amber-800",
      ring: "ring-amber-200",
      dot: "bg-amber-500",
      label: "Lab Test",
    },
    "Follow-up": {
      chip: "bg-emerald-100 text-emerald-800",
      block: "bg-emerald-100 text-emerald-800",
      ring: "ring-emerald-200",
      dot: "bg-emerald-500",
      label: "Follow-up",
    },
  } as const;

  const consultedStyles = {
    container: "opacity-60 grayscale",
    chip: "bg-gray-200 text-gray-700",
    dot: "bg-gray-400",
    badge:
      "inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200",
  } as const;

  const [, setAppointments] = useState<
    {
      time: string;
      name: string;
      type: string;
      status: string;
    }[]
  >([
    {
      time: "09:00 AM",
      name: "John Mathew",
      type: "Consultation",
      status: "consulted",
    },
    {
      time: "10:00 AM",
      name: "Aisha Kareem",
      type: "Lab Test",
      status: "scheduled",
    },
    {
      time: "11:00 AM",
      name: "Daily Sync",
      type: "Follow-up",
      status: "scheduled",
    },
  ]);

  const monthlyBookings = [
    {
      date: "2025-09-03",
      patient: "Ravi Kumar",
      type: "Consultation",
      status: "consulted",
    },
    {
      date: "2025-09-05",
      patient: "Sara Ali",
      type: "Lab Test",
      status: "scheduled",
    },
    {
      date: "2025-09-10",
      patient: "Mohammed Iqbal",
      type: "Follow-up",
      status: "scheduled",
    },
  ] as const;

  const monthStats = {
    total: monthlyBookings.length,
    consulted: monthlyBookings.filter((b) => b.status === "consulted").length,
    visible: monthlyBookings.filter(
      (b) => !hideConsulted || b.status !== "consulted"
    ).length,
  };

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="grid grid-cols-4 gap-4 p-6">
        {[
          {
            title: "Total",
            value: "932",
            icon: Users,
            color: "text-blue-500",
          },
          {
            title: "Pending",
            value: "120",
            icon: ListChecks,
            color: "text-purple-500",
          },
          {
            title: "Done",
            value: "75",
            icon: ClipboardCheck,
            color: "text-green-500",
          },
          {
            title: "Revenue Today",
            value: "₹1.2L",
            icon: IndianRupee,
            color: "text-yellow-600",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <h2 className="text-2xl font-bold">{stat.value}</h2>
              </div>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </Card>
          </motion.div>
        ))}
      </div>


      {/* Content area with persistent right-hand sidebar (as before) */}
      <div className="flex flex-1 gap-6 px-6 pb-6 overflow-hidden">
        {/* Left: tabs that switch only the main canvas */}
        <Tabs defaultValue="day" className="flex-1 overflow-hidden">
          <TabsList className="mb-4">
            <TabsTrigger value="day" className="cursor-pointer">Day View</TabsTrigger>
            <TabsTrigger value="week" className="cursor-pointer">Week View</TabsTrigger>
            <TabsTrigger value="month" className="cursor-pointer">Month View</TabsTrigger>
          </TabsList>

          {/* Day view timeline */}
          <TabsContent value="day" className="flex-1 overflow-hidden min-h-[50vh]">
          <DailyViewTimeline />
          </TabsContent>

          

          {/* Week view (timeline grid) */}
          <TabsContent
            value="week"
            className="bg-white rounded-xl shadow p-4 overflow-auto h-full"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">This Week</h3>
              <div className="hidden md:flex items-center gap-4 text-xs text-gray-600">
                {Object.entries(colorMap).map(([key, v]) => (
                  <div key={key} className="flex items-center gap-1">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${v.dot}`}
                    ></span>
                    <span>{v.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${consultedStyles.dot}`}
                  ></span>
                  <span>Consulted</span>
                </div>
              </div>
            </div>
            <div className="min-w-[960px]">
              <div className="grid grid-cols-[64px_repeat(7,1fr)] text-xs text-gray-500 px-2">
                <div></div>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (d, i) => (
                    <div key={i} className="text-center font-medium">
                      {d}
                    </div>
                  )
                )}
              </div>
              <div className="grid grid-cols-[64px_repeat(7,1fr)]">
                <div className="flex flex-col">
                  {[...Array(13)].map((_, row) => (
                    <div
                      key={row}
                      className="h-14 px-2 text-[10px] text-gray-500 flex items-start justify-end pt-1 border-t"
                    >
                      {8 + row}:00
                    </div>
                  ))}
                </div>
                {[...Array(7)].map((_, col) => (
                  <div key={col} className="border-l">
                    {[...Array(13)].map((_, row) => (
                      <div key={row} className="h-14 border-t relative" />
                    ))}
                  </div>
                ))}
              </div>
              {/* Sample events overlay */}
              <div className="pointer-events-none -mt-[calc(13*3.5rem)] grid grid-cols-[64px_repeat(7,1fr)]">
                <div></div>
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute left-2 right-2 top-[3.5rem] h-[3.5rem] rounded-lg text-xs p-2 shadow ${consultedStyles.container} ${colorMap["Consultation"].block}`}
                  >
                    Jane Feedback
                    <br />
                    <span className="opacity-70">9:00–10:00</span>
                  </motion.div>
                </div>
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.05 }}
                    className={`absolute left-2 right-2 top-[7rem] h-[3.5rem] rounded-lg text-xs p-2 shadow ${colorMap["Follow-up"].block}`}
                  >
                    Design System
                    <br />
                    <span className="opacity-70">11:00–12:00</span>
                  </motion.div>
                </div>
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className={`absolute left-2 right-2 top-[5.25rem] h-[3.5rem] rounded-lg text-xs p-2 shadow ${colorMap["Consultation"].block}`}
                  >
                    Discuss Holo Project
                    <br />
                    <span className="opacity-70">10:00–11:00</span>
                  </motion.div>
                </div>
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.15 }}
                    className={`absolute left-2 right-2 top-[7rem] h-[3.5rem] rounded-lg text-xs p-2 shadow ${colorMap["Follow-up"].block}`}
                  >
                    Daily Sync
                    <br />
                    <span className="opacity-70">11:00–12:00</span>
                  </motion.div>
                </div>
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                    className={`absolute left-2 right-2 top-[3.5rem] h-[2.625rem] rounded-lg text-xs p-2 shadow ${colorMap["Lab Test"].block}`}
                  >
                    Upload Shots
                    <br />
                    <span className="opacity-70">9:30–10:00</span>
                  </motion.div>
                </div>
                <div className="relative"></div>
                <div className="relative"></div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button size="sm" onClick={() => setOpenAppointment(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </div>
          </TabsContent>

          {/* Month view */}
          <TabsContent
            value="month"
            className="bg-white rounded-xl shadow p-4 overflow-y-auto h-full"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">Monthly Bookings</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Visible {monthStats.visible} / Total {monthStats.total} •
                  Consulted {monthStats.consulted}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-4 text-xs text-gray-600">
                {Object.entries(colorMap).map(([key, v]) => (
                  <div key={key} className="flex items-center gap-1">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${v.dot}`}
                    ></span>
                    <span>{v.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${consultedStyles.dot}`}
                  ></span>
                  <span>Consulted</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(30)].map((_, i) => {
                const date = `2025-09-${String(i + 1).padStart(2, "0")}`;
                const events = monthlyBookings.filter(
                  (b) =>
                    b.date === date &&
                    (!hideConsulted || b.status !== "consulted")
                );
                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="relative border rounded-lg p-2 h-28 overflow-hidden hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="text-xs text-gray-500">{i + 1}</p>
                    {events.length > 0 && (
                      <span className="absolute top-1 right-1 text-[10px] bg-gray-900 text-white rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center">
                        {events.length}
                      </span>
                    )}
                    {events.length === 0 && (
                      <div className="text-[11px] text-gray-400 mt-2">
                        No bookings
                      </div>
                    )}
                    {events.map((ev, j) => {
                      const typeStyle =
                        colorMap[ev.type as keyof typeof colorMap];
                      const isConsulted = ev.status === "consulted";
                      return (
                        <div
                          key={j}
                          className={`mt-1 text-[11px] rounded px-1 truncate ${
                            isConsulted ? consultedStyles.chip : typeStyle.chip
                          }`}
                        >
                          {ev.patient} ({ev.type})
                          {isConsulted && "• consulted"}
                        </div>
                      );
                    })}
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Right: persistent sidebar */}
       <Summery />
      </div>

      {/* Dialogs */}
      {/* Add Appointment */}
      <Dialog open={openAppointment} onOpenChange={setOpenAppointment}>
        <BookApointment
          quickType={quickType}
          setOpenAppointment={setOpenAppointment}
          setAppointments={setAppointments}
        />
      </Dialog>

      {/* Book Lab Test */}
      <Dialog open={openLab} onOpenChange={setOpenLab}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="sticky top-0 bg-white/80 backdrop-blur z-10">
            <DialogTitle>Book Lab Test</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Patient</Label>
              <Input
                className="col-span-3"
                placeholder="Search or enter patient name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Test</Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select test" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MRI">MRI</SelectItem>
                  <SelectItem value="CT">CT Scan</SelectItem>
                  <SelectItem value="CBC">CBC</SelectItem>
                  <SelectItem value="Lipid">Lipid Profile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Lab</Label>
              <Input
                className="col-span-3"
                placeholder="Select lab / location"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Date</Label>
              <Input type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Time</Label>
              <Input type="time" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-2">
              <Label className="col-span-1 pt-2">Notes</Label>
              <Textarea
                className="col-span-3"
                placeholder="Preparation, fasting, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenLab(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpenLab(false)}>Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Patient */}
      <Dialog open={openPatient} onOpenChange={setOpenPatient}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="sticky top-0 bg-white/80 backdrop-blur z-10">
            <DialogTitle>New Patient</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Full Name</Label>
              <Input className="col-span-3" placeholder="Patient name" />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Phone</Label>
              <Input className="col-span-3" placeholder="+91 9xx-xxx-xxxx" />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Age</Label>
              <Input type="number" className="col-span-3" placeholder="Years" />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="col-span-1">Gender</Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-2">
              <Label className="col-span-1 pt-2">Allergies</Label>
              <Textarea
                className="col-span-3"
                placeholder="Penicillin, peanuts, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPatient(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpenPatient(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const BookApointment = ({
  quickType,
  setOpenAppointment,
  setAppointments,
}: {
  quickType: string;
  setOpenAppointment: Dispatch<SetStateAction<boolean>>;
  setAppointments: Dispatch<
    SetStateAction<
      {
        time: string;
        name: string;
        type: string;
        status: string;
      }[]
    >
  >;
}) => {
  const [newAppointment, setNewAppointment] = useState<{
    time: string;
    name: string;
    type: string;
    status: string;
  }>({
    name: "",
    time: "",
    type: quickType,
    status: "scheduled",
  });

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader className="sticky top-0 bg-white/80 backdrop-blur z-10">
        <DialogTitle>Book Appointment</DialogTitle>
      </DialogHeader>
      <div className="grid gap-3 py-3">
        <div className="grid grid-cols-4 items-center gap-2">
          <Label className="col-span-1">Patient</Label>
          <div className="col-span-3 grid gap-2">
            <Input
              placeholder="Search or enter patient name"
              onChange={(e) => {
                setNewAppointment((prev) => ({
                  ...prev,
                  name: e.target.value,
                }));
              }}
              value={newAppointment.name}
            />
            <div className="flex gap-2 overflow-x-auto">
              {["Ravi Kumar", "Sara Ali", "John Mathew"].map((n) => (
                <Button
                  onClick={() =>
                    setNewAppointment((prev) => ({ ...prev, name: n }))
                  }
                  key={n}
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-2">
          <Label className="col-span-1">Type</Label>
          <div className="col-span-3 flex gap-2">
            {(["Consultation", "Lab Test", "Follow-up"] as const).map((t) => (
              <Button
                key={t}
                size="sm"
                variant={t === newAppointment.type ? "default" : "outline"}
                onClick={() =>
                  setNewAppointment((prev) => ({ ...prev, type: t }))
                }
              >
                {t}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-2">
          <Label className="col-span-1">Date</Label>
          <Input type="date" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-2">
          <Label className="col-span-1">Start</Label>
          <div className="col-span-3 flex gap-2">
            <Input
              type="time"
              className="w-40"
              onChange={(e) => {
                setNewAppointment((prev) => ({
                  ...prev,
                  time: e.target.value,
                }));
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                +15m
              </Button>
              <Button size="sm" variant="outline">
                +30m
              </Button>
              <Button size="sm" variant="outline">
                +1h
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-2">
          <Label className="col-span-1">Duration</Label>
          <div className="col-span-3 flex gap-2">
            {[15, 30, 45, 60].map((m) => (
              <Button
                key={m}
                size="sm"
                variant={m === 30 ? "default" : "outline"}
              >
                {m} min
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 items-start gap-2">
          <Label className="col-span-1 pt-2">Notes</Label>
          <Textarea
            className="col-span-3"
            placeholder="Reason for visit, symptoms, etc."
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-2">
          <Label className="col-span-1">Notify</Label>
          <div className="col-span-3 text-xs text-gray-600">
            Patient will receive SMS/WhatsApp reminder.
          </div>
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={() => setOpenAppointment(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            setAppointments(
              (
                prev: {
                  time: string;
                  name: string;
                  type: string;
                  status: string;
                }[]
              ) => [...prev, newAppointment]
            );
            setOpenAppointment(false);
          }}
        >
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
