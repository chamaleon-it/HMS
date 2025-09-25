"use client"

import React, { useMemo, useState } from "react";
// Self-contained preview-safe version (no shadcn, no alias imports)
// Uses only React + Tailwind + lucide-react icons. Dialog/Sheet/Tabs are custom.
import {
  CalendarDays,
  Clock,
  Plus,
  Search,
  Filter as FilterIcon,
  UserRound,
  Phone,
  ChevronDown,
  Check,
  Video,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppShell from "@/components/layout/app-shell";
import Calendar from "./Calender";
import List from "./List";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ---------- tiny utils/components (preview-safe) ----------
const cx = (...cls: (string | false | null | undefined)[]) => cls.filter(Boolean).join(" ");





const STATUSES = ["Booked", "Checked-in", "Completed", "No-show", "Cancelled"] as const;
const METHODS = ["In-clinic", "Video", "Phone"] as const;

const doctors = [
  { id: "d1", name: "Dr. Aisha Rahman", dept: "Cardiology", avatar: "AR" },
  { id: "d2", name: "Dr. Vivek Menon", dept: "General Medicine", avatar: "VM" },
  { id: "d3", name: "Dr. Sana Joseph", dept: "Pediatrics", avatar: "SJ" },
];

const sample = [
  {
    id: "APT-10021",
    time: "09:30",
    date: new Date(),
    patient: { name: "Muhammad N", phone: "+91 9XX-XXX-1200", email: "muhammad@example.com" },
    doctor: doctors[0],
    method: "In-clinic" as (typeof METHODS)[number],
    status: "Booked" as (typeof STATUSES)[number],
    notes: "Follow-up: BP & lipid panel",
  },
  {
    id: "APT-10022",
    time: "10:15",
    date: new Date(),
    patient: { name: "Anjali K", phone: "+91 9XX-XXX-4421", email: "anjali@example.com" },
    doctor: doctors[1],
    method: "Video" as (typeof METHODS)[number],
    status: "Checked-in" as (typeof STATUSES)[number],
    notes: "Fever since 3 days",
  },
  {
    id: "APT-10023",
    time: "11:00",
    date: new Date(),
    patient: { name: "Rohit P", phone: "+91 9XX-XXX-3344", email: "rohit@example.com" },
    doctor: doctors[2],
    method: "Phone" as (typeof METHODS)[number],
    status: "Completed" as (typeof STATUSES)[number],
    notes: "Child vaccination counseling",
  },
];

const statusTone: Record<(typeof STATUSES)[number], string> = {
  Booked: "bg-blue-100 text-blue-700 border-blue-200",
  "Checked-in": "bg-amber-100 text-amber-700 border-amber-200",
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "No-show": "bg-rose-100 text-rose-700 border-rose-200",
  Cancelled: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

const methodIcon: Record<(typeof METHODS)[number], React.ReactNode> = {
  "In-clinic": <MapPin className="h-4 w-4" />,
  Video: <Video className="h-4 w-4" />,
  Phone: <Phone className="h-4 w-4" />,
};


// ---------------------------------------------------
export default function AppointmentPage() {
  const [query, setQuery] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);
  const [activeMethods,] = useState<string[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openReschedule, setOpenReschedule] = useState<string | null>(null);
  const [openCancel, setOpenCancel] = useState<string | null>(null);
  const [dense, setDense] = useState(false);
  

  const data = useMemo(() => {
    return sample.filter((row) => {
      const matchesQuery = [row.patient.name, row.doctor.name, row.id].some((v) => v.toLowerCase().includes(query.toLowerCase()));
      const matchStatus = activeStatuses.length ? activeStatuses.includes(row.status) : true;
      const matchMethod = activeMethods.length ? activeMethods.includes(row.method) : true;
      return matchesQuery && matchStatus && matchMethod;
    });
  }, [query, activeStatuses, activeMethods]);

  return (
    <AppShell>
    <div className="p-5 min-h-[calc(100vh-80px)]">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6" />
          <h1 className="text-xl md:text-2xl font-semibold">Appointments</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Compact</span>
            <input type="checkbox" className="h-5 w-9 appearance-none rounded-full bg-zinc-200 relative cursor-pointer"
              onChange={(e) => setDense(e.target.checked)} />
          </div>
          <Button size="sm" onClick={() => setOpenCreate(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create
          </Button>
        </div>
      </header>

      {/* Filters Row */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} placeholder="Search by patient, doctor, or #ID" className="pl-9" />
              </div>
              <Button variant="outline">
                <FilterIcon className="h-4 w-4 mr-2" /> Filters <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => {
                const active = activeStatuses.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => setActiveStatuses((prev) => (active ? prev.filter((x) => x !== s) : [...prev, s]))}
                    className={cx(
                      "px-3 h-9 rounded-full border text-sm flex items-center gap-2",
                      active ? "bg-black text-white border-black" : "bg-white hover:bg-zinc-50 border-zinc-200"
                    )}
                  >
                    <Check className={cx("h-4 w-4", active ? "opacity-100" : "opacity-0")} />
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        <StatTile title="Today" value="32" icon={<CalendarDays className="h-4 w-4" />} />
        <StatTile title="Checked-in" value="12" icon={<Clock className="h-4 w-4" />} />
        <StatTile title="Completed" value="18" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatTile title="No-show" value="2" icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      {/* Tabs: List / Calendar */}
      <div className="mt-2">
        


 <Tabs defaultValue="list" className="flex-1 overflow-hidden">
          <TabsList className="mb-4">
            <TabsTrigger value="list" className="cursor-pointer">List</TabsTrigger>
            <TabsTrigger value="calendar" className="cursor-pointer">Calendar</TabsTrigger>
            
          </TabsList>

          <TabsContent value="list">
<List data={data} dense={dense} methodIcon={methodIcon} statusTone={statusTone}/>
          </TabsContent>
          <TabsContent value="calendar">
<Calendar />
          </TabsContent>

          </Tabs>


      </div>



      

      {/* Create Drawer */}
      <Drawer open={openCreate} onClose={() => setOpenCreate(false)} title="Create Appointment">
        <CreateAppointmentForm onClose={() => setOpenCreate(false)} />
      </Drawer>

      {/* Reschedule Modal */}
      <Modal open={!!openReschedule} onClose={() => setOpenReschedule(null)} title="Reschedule Appointment" description="Pick a new time. A notification will be sent to the patient.">
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" />
            </div>
          </div>
          <div>
            <Label>Reason (optional)</Label>
            <Textarea rows={3} placeholder="Add a note" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpenReschedule(null)}>Close</Button>
            <Button>Confirm</Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal open={!!openCancel} onClose={() => setOpenCancel(null)} title="Cancel Appointment" description="Are you sure you want to cancel? This action will notify the patient.">
        <div className="grid gap-3">
          <Label>Reason</Label>
          <Textarea rows={3} placeholder="Doctor on emergency duty" />
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpenCancel(null)}>Close</Button>
            <Button variant="destructive">Cancel Appointment</Button>
          </div>
        </div>
      </Modal>
    </div>
    </AppShell>
  );
}

// --- Stat Tile ---
function StatTile({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-500">{title}</div>
            <div className="text-2xl font-semibold mt-1">{value}</div>
          </div>
          <div className="h-10 w-10 rounded-2xl grid place-items-center bg-gradient-to-br from-zinc-100 to-white border border-zinc-200">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Create Appointment Form (Drawer content) ---
function CreateAppointmentForm({ onClose }: { onClose: () => void }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <div className="space-y-5">
      {/* Patient Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          <h3 className="font-medium">Patient</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Patient Name</Label>
            <Input placeholder="Search or type new" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input placeholder="+91" />
          </div>
          <div className="sm:col-span-2">
            <Label>Email</Label>
            <Input placeholder="name@email.com" type="email" />
          </div>
        </div>
      </section>

      {/* Appointment Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <h3 className="font-medium">Appointment</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Doctor</Label>
            <select className="w-full h-10 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200">
              <option value="">Choose doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name} · {d.dept}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Method</Label>
            <select className="w-full h-10 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200">
              <option value="">In-clinic / Video / Phone</option>
              {METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" />
          </div>
          <div>
            <Label>Time</Label>
            <Input type="time" />
          </div>
          <div className="sm:col-span-2">
            <Label>Reason / Notes</Label>
            <Textarea rows={3} placeholder="Optional" />
          </div>
        </div>
      </section>

      {/* Advanced */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Advanced</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Show</span>
            <input type="checkbox" onChange={(e) => setShowAdvanced(e.target.checked)} />
          </div>
        </div>
        {showAdvanced && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Appointment Type</Label>
                <select className="w-full h-10 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                  <option>New</option>
                  <option>Follow-up</option>
                </select>
              </div>
              <div>
                <Label>Payment Status</Label>
                <select className="w-full h-10 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                  <option>Unpaid</option>
                  <option>Paid</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Internal Note</Label>
              <Textarea rows={3} placeholder="Visible to staff only" />
            </div>
          </div>
        )}
      </section>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button>Create Appointment</Button>
      </div>
    </div>
  );
}




// Simple Modal
function Modal({ open, title, description, onClose, children }: {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <Card className="relative w-[92vw] max-w-md">
        <CardContent>
          <div className="mb-3">
            <div className="text-base font-semibold">{title}</div>
            {description && <div className="text-sm text-zinc-500">{description}</div>}
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

// Drawer (Create Appointment)
function Drawer({ open, onClose, children, title }: {
   open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cx("fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-xl transform transition-transform", open ? "translate-x-0" : "translate-x-full")}> 
      <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
        <div className="text-base font-semibold">{title}</div>
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>
      <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">{children}</div>
    </div>
  );
}
