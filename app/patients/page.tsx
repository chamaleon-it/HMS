"use client"

import { ForwardRefExoticComponent, RefAttributes, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  UserRound,
  History,
  Stethoscope,
  Mail,
  Phone,
  CalendarClock,
  ExternalLink,
  Printer,
  Share2,
  CircleAlert,
  Sparkles,
  LucideProps,
} from "lucide-react";
import AppShell from "@/components/layout/app-shell";

// =============================
// Types
// =============================
export type Patient = {
  id: string; // P-0001
  name: string;
  gender: "M" | "F" | "O";
  age: number;
  phone: string;
  email?: string;
  lastVisit: string; // YYYY-MM-DD
  status: "active" | "inactive" | "critical" | "discharged";
  conditions: string[]; // badges
  tags?: string[]; // e.g. Insurance, VIP
  referredBy?: string;
  notes?: string;
  history: Array<
    | { type: "visit"; id: string; date: string; summary: string; doctor: string }
    | { type: "lab"; id: string; date: string; test: string; resultId: string; status: "pending" | "completed" | "abnormal" }
    | { type: "rx"; id: string; date: string; meds: string[]; doctor: string }
  >;
};

// New: date preset type
type DatePreset =
  | "all"
  | "today"
  | "this_week"
  | "this_month"
  | "last_7"
  | "last_30"
  | "custom";

// =============================
// Mock Data (replace with API)
// =============================
const seed: Patient[] = [
  {
    id: "P-0001",
    name: "John Mathew",
    gender: "M",
    age: 42,
    phone: "+91 90000 11111",
    email: "john@example.com",
    lastVisit: "2025-09-01",
    status: "active",
    conditions: ["Hypertension"],
    referredBy: "Dr. Nadir Sha",
    tags: ["Insurance"],
    history: [
      { type: "visit", id: "V-1001", date: "2025-09-01", summary: "Routine checkup", doctor: "Dr. Nadir Sha" },
      { type: "lab", id: "LR-001", date: "2025-09-01", test: "CBC", resultId: "LR-001", status: "completed" },
      { type: "rx", id: "RX-1001", date: "2025-09-01", meds: ["Amlodipine 5mg"], doctor: "Dr. Nadir Sha" },
    ],
  },
  {
    id: "P-0002",
    name: "Aisha Kareem",
    gender: "F",
    age: 33,
    phone: "+91 90000 22222",
    email: "aisha@example.com",
    lastVisit: "2025-09-02",
    status: "inactive",
    conditions: ["Hypothyroid"],
    referredBy: "Dr. Nadir Sha",
    tags: ["Self-Pay"],
    history: [
      { type: "visit", id: "V-1002", date: "2025-09-02", summary: "Fatigue, follow-up", doctor: "Dr. Nadir Sha" },
      { type: "lab", id: "LR-002", date: "2025-09-02", test: "TSH", resultId: "LR-002", status: "pending" },
    ],
  },
  {
    id: "P-0003",
    name: "Mohammed Iqbal",
    gender: "M",
    age: 55,
    phone: "+91 90000 33333",
    lastVisit: "2025-09-03",
    status: "active",
    conditions: ["Diabetes", "Hyperlipidemia"],
    referredBy: "Dr. Nadir Sha",
    tags: ["Insurance", "Priority"],
    history: [
      { type: "visit", id: "V-1003", date: "2025-09-03", summary: "Fasting sugar high", doctor: "Dr. Nadir Sha" },
      { type: "lab", id: "LR-003", date: "2025-09-03", test: "Lipid Profile", resultId: "LR-003", status: "completed" },
    ],
  },
  {
    id: "P-0004",
    name: "Sara Ali",
    gender: "F",
    age: 28,
    phone: "+91 90000 44444",
    lastVisit: "2025-09-03",
    status: "critical",
    conditions: ["High fever"],
    referredBy: "Dr. Nadir Sha",
    tags: ["Urgent"],
    history: [
      { type: "visit", id: "V-1004", date: "2025-09-03", summary: "High-grade fever, suspected dengue", doctor: "Dr. Nadir Sha" },
      { type: "lab", id: "LR-004", date: "2025-09-03", test: "NS1 Antigen", resultId: "LR-004", status: "abnormal" },
    ],
  },
  {
    id: "P-0005",
    name: "Ravi Kumar",
    gender: "M",
    age: 47,
    phone: "+91 90000 55555",
    lastVisit: "2025-09-04",
    status: "discharged",
    conditions: ["Back pain"],
    referredBy: "Dr. Nadir Sha",
    tags: ["Corporate"],
    history: [
      { type: "visit", id: "V-1005", date: "2025-09-04", summary: "Physiotherapy referral", doctor: "Dr. Nadir Sha" },
    ],
  },
];

// =============================
// Helpers (pure + testable)
// =============================
function matchesQuery(p: Patient, q: string) {
  if (!q) return true;
  const s = q.toLowerCase().trim();
  return (
    p.name.toLowerCase().includes(s) ||
    p.id.toLowerCase().includes(s) ||
    p.phone.replaceAll(" ", "").includes(s.replaceAll(" ", "")) ||
    (p.email || "").toLowerCase().includes(s) ||
    (p.conditions || []).some((c) => c.toLowerCase().includes(s))
  );
}

function withinAge(p: Patient, min?: number, max?: number) {
  if (!min && !max) return true;
  if (min && p.age < min) return false;
  if (max && p.age > max) return false;
  return true;
}

function byStatus(p: Patient, status: string) {
  if (!status || status === "all") return true;
  return p.status === status;
}

function byGender(p: Patient, gender: string) {
  if (!gender || gender === "all") return true;
  return p.gender === gender;
}

// Date helpers (no external libs)
function parseISO(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, (m || 1) - 1, day || 1);
}
function startOfToday() {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}
function startOfWeek(d = new Date()) {
  const day = d.getDay(); // 0 Sun
  const diff = (day + 6) % 7; // start Monday
  const s = new Date(d);
  s.setDate(d.getDate() - diff);
  s.setHours(0, 0, 0, 0);
  return s;
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(d.getDate() + n);
  return x;
}
function inDatePreset(dateStr: string, preset: DatePreset, customStart?: string, customEnd?: string) {
  if (preset === "all") return true;
  const date = parseISO(dateStr);
  const today = startOfToday();
  let from = new Date(0);
  let to = addDays(today, 1); // exclusive upper bound

  switch (preset) {
    case "today":
      from = today;
      break;
    case "this_week":
      from = startOfWeek(today);
      break;
    case "this_month":
      from = startOfMonth(today);
      break;
    case "last_7":
      from = addDays(today, -7);
      break;
    case "last_30":
      from = addDays(today, -30);
      break;
    case "custom":
      if (!customStart && !customEnd) return true;
      from = customStart ? parseISO(customStart) : new Date(0);
      to = customEnd ? addDays(parseISO(customEnd), 1) : addDays(today, 1);
      break;
  }

  return date >= from && date < to;
}

// =============================
// UI Components
// =============================
function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-xl p-2 bg-muted">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-semibold leading-tight">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: Patient["status"] }) {
  const map: Record<Patient["status"], string> = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    inactive: "bg-slate-100 text-slate-700 border-slate-200",
    discharged: "bg-blue-100 text-blue-700 border-blue-200",
    critical: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <Badge variant="outline" className={`px-2 ${map[status]} capitalize`}>
      {status}
    </Badge>
  );
}

function ConditionChips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((c) => (
        <Badge key={c} variant="secondary" className="rounded-full">
          {c}
        </Badge>
      ))}
    </div>
  );
}

// Utility: visit count
function visitCount(p: Patient) {
  return p.history.filter((h) => h.type === "visit").length;
}

// New: mark recent patients
function isRecent(lastVisit: string) {
  const today = startOfToday();
  const seven = addDays(today, -7);
  const d = parseISO(lastVisit);
  return d >= seven;
}

// =============================
// Main Page
// =============================
export default function PatientsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [gender, setGender] = useState("all");
  const [minAge, setMinAge] = useState<number | undefined>();
  const [maxAge, setMaxAge] = useState<number | undefined>();
  const [selected, setSelected] = useState<Patient | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);

  // New: date filters
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const patients = seed; // replace with SWR/React Query fetch

  const filtered = useMemo(() => {
    return patients
      .filter((p) => matchesQuery(p, query))
      .filter((p) => byStatus(p, status))
      .filter((p) => byGender(p, gender))
      .filter((p) => withinAge(p, minAge, maxAge))
      .filter((p) => inDatePreset(p.lastVisit, datePreset, customStart, customEnd));
  }, [patients, query, status, gender, minAge, maxAge, datePreset, customStart, customEnd]);

  const stats = useMemo(() => {
    return {
      total: patients.length,
      active: patients.filter((p) => p.status === "active").length,
      critical: patients.filter((p) => p.status === "critical").length,
      discharged: patients.filter((p) => p.status === "discharged").length,
    };
  }, [patients]);

  return (
    <AppShell>
    <div className="space-y-4 p-5">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <UserRound className="h-6 w-6" /> Patients
          </h1>
          <p className="text-sm text-muted-foreground">Search, filter, and review patient history — consistent with your current DocHub theme.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl">
            <Printer className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button className="rounded-xl">
            <Sparkles className="mr-2 h-4 w-4" /> New Patient
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total" value={stats.total} icon={UserRound} />
        <Stat label="Active" value={stats.active} icon={Stethoscope} />
        <Stat label="Critical" value={stats.critical} icon={CircleAlert} />
        <Stat label="Discharged" value={stats.discharged} icon={CalendarClock} />
      </div>

      {/* Toolbar */}
      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative md:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, ID, phone, condition…"
                className="pl-9 rounded-xl"
              />
            </div>

            <div className="flex flex-1 flex-wrap gap-3 items-center">
              {/* Status */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[150px] rounded-xl">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="discharged">Discharged</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gender */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="w-[130px] rounded-xl">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Age */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Age</Label>
                <Input
                  type="number"
                  placeholder="Min"
                  className="w-20 rounded-xl"
                  value={minAge ?? ""}
                  onChange={(e) => setMinAge(e.target.value ? Number(e.target.value) : undefined)}
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="w-20 rounded-xl"
                  value={maxAge ?? ""}
                  onChange={(e) => setMaxAge(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              {/* Date Preset */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Last visit</Label>
                <Select value={datePreset} onValueChange={(v: DatePreset) => setDatePreset(v)}>
                  <SelectTrigger className="w-[160px] rounded-xl">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This week</SelectItem>
                    <SelectItem value="this_month">This month</SelectItem>
                    <SelectItem value="last_7">Last 7 days</SelectItem>
                    <SelectItem value="last_30">Last 30 days</SelectItem>
                    <SelectItem value="custom">Custom…</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Range */}
              {datePreset === "custom" && (
                <div className="flex items-center gap-2">
                  <Input type="date" className="rounded-xl" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                  <span className="text-muted-foreground">—</span>
                  <Input type="date" className="rounded-xl" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                </div>
              )}

              <Button variant="outline" className="ml-auto rounded-xl">
                <Filter className="mr-2 h-4 w-4" /> More filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10"></TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Age / Gender</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="">
                  <TableCell>
                    <Checkbox aria-label={`Select ${p.name}`} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <button
                          onClick={() => setSelected(p)}
                          className="text-sm font-medium hover:underline text-left"
                        >
                          {p.name}
                        </button>
                        <div className="text-xs text-muted-foreground">{p.phone}</div>
                      </div>
                      {isRecent(p.lastVisit) && (
                        <Badge className="rounded-full" variant="secondary">New</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.id}</TableCell>
                  <TableCell className="text-sm">{p.age} / {p.gender}</TableCell>
                  <TableCell className="text-sm">{p.lastVisit}</TableCell>
                  <TableCell className="text-sm">{p.referredBy || "—"}</TableCell>
                  <TableCell>
                    <ConditionChips items={p.conditions} />
                  </TableCell>
                  <TableCell className="text-sm">{visitCount(p)}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setSelected(p)}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setNotesOpen(true)}>
                        <History className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-xl">
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-xl">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10}>
                    <div className="py-12 text-center text-muted-foreground">No patients match your filters.</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Side Drawer — Patient Profile & History */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full md:w-[560px] p-0">
          {selected && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <UserRound className="h-5 w-5" /> {selected.name}
                  </SheetTitle>
                  <SheetDescription>{selected.id} · {selected.phone}{selected.email ? ` · ${selected.email}` : ""}</SheetDescription>
                </SheetHeader>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.tags?.map((t) => (
                    <Badge key={t} variant="secondary" className="rounded-full">{t}</Badge>
                  ))}
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              <Tabs defaultValue="timeline" className="flex-1 flex flex-col">
                <div className="px-4 pt-4">
                  <TabsList>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="timeline" className="flex-1 overflow-auto p-4">
                  <div className="space-y-4">
                    {selected.history.map((h) => (
                      <motion.div
                        key={h.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">{h.date}</div>
                          <Badge variant="outline" className="capitalize">
                            {h.type}
                          </Badge>
                        </div>
                        {h.type === "visit" && (
                          <div className="mt-2">
                            <div className="font-medium">OPD Visit — {(h).doctor}</div>
                            <div className="text-sm text-muted-foreground">{(h).summary}</div>
                          </div>
                        )}
                        {h.type === "lab" && (
                          <div className="mt-2">
                            <div className="font-medium">Lab Test: {(h).test}</div>
                            <div className="text-sm text-muted-foreground">Result ID: {(h).resultId} — Status: {(h).status}</div>
                          </div>
                        )}
                        {h.type === "rx" && (
                          <div className="mt-2">
                            <div className="font-medium">Prescription — {(h).doctor}</div>
                            <div className="text-sm text-muted-foreground">{(h).meds.join(", ")}</div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="profile" className="flex-1 overflow-auto p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="col-span-2 md:col-span-1 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-base">Demographics</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        <div><span className="text-muted-foreground">Age:</span> {selected.age}</div>
                        <div><span className="text-muted-foreground">Gender:</span> {selected.gender}</div>
                        <div><span className="text-muted-foreground">Phone:</span> {selected.phone}</div>
                        {selected.email && <div><span className="text-muted-foreground">Email:</span> {selected.email}</div>}
                        <div><span className="text-muted-foreground">Referred by:</span> {selected.referredBy}</div>
                      </CardContent>
                    </Card>

                    <Card className="col-span-2 md:col-span-1 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-base">Conditions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ConditionChips items={selected.conditions} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="flex-1 overflow-auto p-4">
                  <div className="space-y-3">
                    <Textarea placeholder="Write a note for this patient…" className="min-h-[120px] rounded-2xl" />
                    <div className="flex justify-end">
                      <Button className="rounded-xl">Save Note</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="p-4 border-t flex justify-end gap-2">
                <Button variant="outline" className="rounded-xl">
                  <Mail className="mr-2 h-4 w-4" /> Email
                </Button>
                <Button className="rounded-xl">
                  <Phone className="mr-2 h-4 w-4" /> Call
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Quick History Dialog (example) */}
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Recent History</DialogTitle>
            <DialogDescription>Last 5 interactions across visits, labs, and prescriptions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-auto">
            {(selected?.history || seed[0].history).slice(0, 5).map((h) => (
              <div key={h.id} className="rounded-xl border p-3">
                <div className="text-xs text-muted-foreground">{h.date}</div>
                <div className="font-medium capitalize">{h.type}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </AppShell>
  );
}
