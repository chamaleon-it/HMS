"use client";

import React, {  useState } from "react";
import {
  Calendar,
  FileText,
  FlaskRound as Flask,
  Heart,
  Image as ImageIcon,
  Info,
  NotebookPen,
  Phone,
  Pill,
  Plus,
  Printer,
  Share2,
  Stethoscope,
  Upload,
  User2,
  Wallet,
  AlertTriangle,
  Download,
  Search,
  Edit3,
  Eye,
  ShieldAlert,
  FileArchive,
} from "lucide-react";

// shadcn/ui components (assumed available)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import AppShell from "@/components/layout/app-shell";

// --- Helper small components ---
function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="text-lg font-semibold leading-tight">{value}</div>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

function LabeledRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 items-start gap-3 py-2">
      <div className="col-span-4 md:col-span-3 text-[13px] text-muted-foreground">
        {label}
      </div>
      <div className="col-span-8 md:col-span-9 text-sm">{children}</div>
    </div>
  );
}

const initialAllergies = [
  { name: "Penicillin", severity: "High" },
  { name: "Seafood", severity: "Medium" },
  { name: "Dust", severity: "Low" },
];

const initialMeds = [
  {
    brand: "T Dolo 650 mg",
    generic: "Paracetamol/Acetaminophen",
    hsn: "30045019",
    barcode: "8901234567890",
    sig: "SOS",
    start: "2025-07-21",
    active: true,
  },
  {
    brand: "T Xtan 40 mg",
    generic: "Telmisartan",
    hsn: "30049099",
    barcode: "8901234567891",
    sig: "1-0-0",
    start: "2025-08-10",
    active: true,
  },
  {
    brand: "T Acemax SP",
    generic: "Aceclofenac+Serratiopeptidase+Paracetamol",
    hsn: "30049079",
    barcode: "8901234567892",
    sig: "1-0-1",
    start: "2025-06-02",
    active: false,
  },
];

const initialVitals = [
  { k: "BP", v: "128/84", sub: "mmHg" },
  { k: "Pulse", v: "76", sub: "bpm" },
  { k: "Temp", v: "98.4", sub: "°F" },
  { k: "SpO₂", v: "97%", sub: "RA" },
  { k: "BMI", v: "26.6", sub: "kg/m²" },
];

const initialLabs = [
  { type: "CBC", date: "2025-09-02", status: "Normal" },
  { type: "Fasting Blood Sugar", date: "2025-08-15", status: "High" },
  { type: "Lipid Panel", date: "2025-08-15", status: "Borderline" },
];

const initialImages = [
  {
    type: "Chest X-Ray PA",
    date: "2025-07-02",
    impression: "No active disease",
  },
  {
    type: "Abdominal USG",
    date: "2025-06-18",
    impression: "Fatty liver grade I",
  },
];

const initialVisits = [
  { date: "2025-10-01 10:20", reason: "Follow-up HTN", by: "Dr. Nadisha" },
  { date: "2025-08-12 11:40", reason: "Headache", by: "Dr. Nadisha" },
  { date: "2025-06-05 09:15", reason: "Annual Check-up", by: "Dr. Abbas" },
];

export default function PatientFullDetailPage() {
  // ---- CONFIG ----
  const API_BASE = "/api"; // change to your backend base URL
  const patientId = "0045238"; // pass via route or prop in real app
  const ACCENT_CLASS = "bg-[#6E59F9] hover:bg-[#5b46f4]"; // HMS purple

  // ---- STATE ----
  const [tab, setTab] = useState("overview");
  const [showPHI, setShowPHI] = useState(true);
  const [maskIDs, setMaskIDs] = useState(false);

  const [meds, setMeds] = useState(initialMeds);
  const [labs, setLabs] = useState(initialLabs);
  const [images, setImages] = useState(initialImages);
  const [notes, setNotes] = useState([
    {
      d: "2025-10-01",
      t: "Follow-up: BP stable; lifestyle advice.",
      by: "Dr. Nadisha",
    },
    {
      d: "2025-08-12",
      t: "Migraine suspected; start prophylaxis if persists.",
      by: "Dr. Nadisha",
    },
  ]);

  // Dialog states
  const [openAddMed, setOpenAddMed] = useState(false);
  const [openAddLab, setOpenAddLab] = useState(false);
  const [openAddImage, setOpenAddImage] = useState(false);
  const [openAddNote, setOpenAddNote] = useState(false);

  // Temp form states
  const [formMed, setFormMed] = useState({
    brand: "",
    generic: "",
    hsn: "",
    barcode: "",
    sig: "",
    start: "",
  });
  const [formLab, setFormLab] = useState({
    type: "",
    date: "",
    status: "Pending",
  });
  const [formImg, setFormImg] = useState({
    type: "",
    date: "",
    impression: "",
  });
  const [formNote, setFormNote] = useState({ d: "", t: "", by: "Dr. Nadisha" });

  const mask = (val: string) => {
    if (showPHI) return val;
    if (!val) return "";
    if (val.includes(" "))
      return val
        .split(" ")
        .map((chunk, i) => (i === 0 ? chunk[0] + "***" : "***"))
        .join(" ");
    return val[0] + "***";
  };

  const blurIDsClass = maskIDs ? "blur-sm" : "";

  // ---- ACTION HANDLERS (with API + optimistic UI) ----
  const handleAddMed = async () => {
    if (!formMed.brand) return alert("Enter Brand name");
    const payload = {
      brand: formMed.brand,
      generic: formMed.generic,
      hsn: formMed.hsn,
      barcode: formMed.barcode,
      sig: formMed.sig || "1-0-1",
      start: formMed.start || new Date().toISOString().slice(0, 10),
      active: true,
    };
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/meds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      const saved = await res.json();
      setMeds((prev) => [saved, ...prev]);
    } catch  {
      setMeds((prev) => [payload, ...prev]);
    }
    setFormMed({
      brand: "",
      generic: "",
      hsn: "",
      barcode: "",
      sig: "",
      start: "",
    });
    setOpenAddMed(false);
  };

  const handleAddLab = async () => {
    if (!formLab.type) return alert("Enter lab test type");
    const payload = {
      type: formLab.type,
      date: formLab.date || new Date().toISOString().slice(0, 10),
      status: formLab.status || "Pending",
    };
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/labs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setLabs((prev) => [saved, ...prev]);
    } catch {
      setLabs((prev) => [payload, ...prev]);
    }
    setFormLab({ type: "", date: "", status: "Pending" });
    setOpenAddLab(false);
  };

  const handleAddImage = async () => {
    if (!formImg.type) return alert("Enter imaging type");
    const payload = {
      type: formImg.type,
      date: formImg.date || new Date().toISOString().slice(0, 10),
      impression: formImg.impression || "--",
    };
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/imaging`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setImages((prev) => [saved, ...prev]);
    } catch {
      setImages((prev) => [payload, ...prev]);
    }
    setFormImg({ type: "", date: "", impression: "" });
    setOpenAddImage(false);
  };

  const handleAddNote = async () => {
    if (!formNote.t) return alert("Write a note");
    const payload = {
      d: formNote.d || new Date().toISOString().slice(0, 10),
      t: formNote.t,
      by: formNote.by || "Dr. Nadisha",
    };
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setNotes((prev) => [saved, ...prev]);
    } catch {
      setNotes((prev) => [payload, ...prev]);
    }
    setFormNote({ d: "", t: "", by: "Dr. Nadisha" });
    setOpenAddNote(false);
  };

  return (
    <AppShell>
      <div className="min-h-screen w-full bg-gradient-to-b from-background to-muted/30">
        {/* Sticky Header */}
        <div className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-5 flex items-center gap-3 md:gap-4">
            <User2 className="h-9 w-9 md:h-10 md:w-10" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base md:text-xl font-semibold">
                  {mask("Aarav K.")}{" "}
                  <span className={blurIDsClass}>(MRN: 0045238)</span>
                </h1>
                <Badge variant="secondary" className="rounded-full">
                  Age 34
                </Badge>
                <Badge variant="secondary" className="rounded-full">
                  M
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  B+ve
                </Badge>
                <Badge className="rounded-full bg-amber-500 text-black">
                  Allergy
                </Badge>
                <Badge className="rounded-full bg-blue-500">
                  Insurance: Star Health
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                <span className={blurIDsClass}>
                  {showPHI ? "+91 98XXXXXX12" : "+91 ******"}
                </span>{" "}
                · Nilambur ·{" "}
                <span className={blurIDsClass}>UHID: HMS-2025-1129</span>
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alert("Print triggered (hook to /print)")}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Print summary / prescription</TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Share</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => alert("Downloading PDF...")}>
                    {" "}
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => alert("Email modal -> send summary")}
                  >
                    {" "}
                    <FileText className="h-4 w-4 mr-2" />
                    Email summary
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                className={ACCENT_CLASS}
                onClick={() => setOpenAddNote(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mx-auto max-w-[1400px] px-4">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="clinical">Clinical Notes</TabsTrigger>
                <TabsTrigger value="labs">Labs</TabsTrigger>
                <TabsTrigger value="imaging">Imaging</TabsTrigger>
                <TabsTrigger value="meds">Medications</TabsTrigger>
                <TabsTrigger value="visits">Visits</TabsTrigger>
                <TabsTrigger value="docs">Documents</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Left Column: Patient Snapshot */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" /> Patient Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4">
                  {initialVitals.map((v) => (
                    <div key={v.k} className="rounded-xl border p-3">
                      <Stat label={v.k} value={v.v} sub={v.sub} />
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <LabeledRow label="Primary Doctor">Dr. Nadisha</LabeledRow>
                <LabeledRow label="Conditions">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Hypertension</Badge>
                    <Badge variant="outline">Mixed Dyslipidemia</Badge>
                  </div>
                </LabeledRow>
                <LabeledRow label="Allergies">
                  <div className="flex flex-wrap gap-2">
                    {initialAllergies.map((a) => (
                      <Badge
                        key={a.name}
                        className={
                          "rounded-full " +
                          (a.severity === "High"
                            ? "bg-red-500 text-white"
                            : a.severity === "Medium"
                            ? "bg-amber-500 text-black"
                            : "bg-slate-200")
                        }
                      >
                        {a.name}
                      </Badge>
                    ))}
                  </div>
                </LabeledRow>
                <LabeledRow label="Insurance">
                  Star Health (Valid till 31 Dec 2025)
                </LabeledRow>
                <LabeledRow label="Emergency Contact">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />{" "}
                    <span className={blurIDsClass}>
                      {showPHI ? "Afsal · 98XXXXXX90" : "A. · ******"}
                    </span>
                  </div>
                </LabeledRow>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    {
                      label: "Allergy",
                      icon: <AlertTriangle className="h-3.5 w-3.5" />,
                      color: "bg-red-500/10 text-red-600",
                    },
                    {
                      label: "Chronic",
                      icon: <Heart className="h-3.5 w-3.5" />,
                      color: "bg-rose-500/10 text-rose-600",
                    },
                    {
                      label: "Insurance",
                      icon: <Wallet className="h-3.5 w-3.5" />,
                      color: "bg-emerald-500/10 text-emerald-600",
                    },
                  ].map((f) => (
                    <span
                      key={f.label}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${f.color}`}
                    >
                      {f.icon}
                      {f.label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" /> Active Medications
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {meds.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div>
                      <div className="font-medium">
                        {m.brand}{" "}
                        <span className="text-muted-foreground text-xs">
                          (Gen: {m.generic})
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        HSN: {m.hsn} · SIG: {m.sig} · Since {m.start}
                      </div>
                      <div className="mt-1 text-[11px] tracking-wider">
                        Barcode: {m.barcode || "—"}
                      </div>
                    </div>
                    <Badge variant={m.active ? "default" : "secondary"}>
                      {m.active ? "Active" : "Stopped"}
                    </Badge>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpenAddMed(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" /> Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Show PHI</div>
                    <div className="text-xs text-muted-foreground">
                      Toggle to quickly mask sensitive info on screen share
                    </div>
                  </div>
                  <Switch checked={showPHI} onCheckedChange={setShowPHI} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Mask IDs</div>
                    <div className="text-xs text-muted-foreground">
                      Blur MRN, UHID on export & UI
                    </div>
                  </div>
                  <Switch checked={maskIDs} onCheckedChange={setMaskIDs} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Main Tabs */}
          <div className="lg:col-span-8 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Stethoscope className="h-5 w-5" />{" "}
                    {tab === "overview"
                      ? "Clinical Overview"
                      : tab === "clinical"
                      ? "Clinical Notes"
                      : tab === "labs"
                      ? "Lab Results"
                      : tab === "imaging"
                      ? "Imaging"
                      : tab === "meds"
                      ? "Medications"
                      : tab === "visits"
                      ? "Visits"
                      : tab === "docs"
                      ? "Documents"
                      : tab === "billing"
                      ? "Billing & Claims"
                      : "Timeline"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2">
                      <Input
                        placeholder="Search within patient…"
                        className="w-64"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="find"
                        onClick={() => alert("Search coming soon")}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Quick actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setOpenAddNote(true)}>
                          <NotebookPen className="h-4 w-4 mr-2" />
                          Add Progress Note
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setOpenAddLab(true)}>
                          <Flask className="h-4 w-4 mr-2" />
                          Order Lab
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setOpenAddImage(true)}>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Order Imaging
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setOpenAddMed(true)}>
                          <Pill className="h-4 w-4 mr-2" />
                          Add Prescription
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => alert("Open scheduler")}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Follow-up
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {tab === "overview" && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Latest Summary</div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setTab("clinical")}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View All
                        </Button>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground leading-6">
                        Patient with HTN on Telmisartan, BP controlled. Reports
                        intermittent headaches and poor sleep. Lifestyle
                        counselling provided. Next review in 4 weeks.
                      </p>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Recent Labs</div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setTab("labs")}
                        >
                          See Labs
                        </Button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {labs.slice(0, 3).map((d, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg bg-muted/40 p-2"
                          >
                            <div className="text-sm">
                              {d.type}{" "}
                              <span className="text-xs text-muted-foreground">
                                · {d.date}
                              </span>
                            </div>
                            <Badge
                              variant={
                                d.status === "Normal"
                                  ? "secondary"
                                  : d.status === "High"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {d.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Imaging</div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setTab("imaging")}
                        >
                          See Imaging
                        </Button>
                      </div>
                      <ul className="mt-2 space-y-2 text-sm">
                        {images.slice(0, 2).map((im, i) => (
                          <li key={i} className="rounded-lg bg-muted/40 p-2">
                            <div className="flex items-center justify-between">
                              <span>{im.type}</span>
                              <span className="text-xs text-muted-foreground">
                                {im.date}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Impression: {im.impression}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Upcoming</div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => alert("Open calendar")}
                        >
                          Open Calendar
                        </Button>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        No upcoming appointments.
                      </div>
                    </div>
                  </div>
                )}

                {tab === "clinical" && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-xl border">
                      <div className="flex items-center justify-between p-3">
                        <div className="font-semibold">Add Progress Note</div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert("Templates list")}
                          >
                            Templates
                          </Button>
                          <Button
                            size="sm"
                            className={ACCENT_CLASS}
                            onClick={() => setOpenAddNote(true)}
                          >
                            Quick Note
                          </Button>
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        <div>
                          <Label>Chief Complaint</Label>
                          <Input
                            placeholder="e.g., Headache since 2 days"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Onset & Duration</Label>
                          <Input
                            placeholder="e.g., Gradual, 2 days"
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>History of Present Illness</Label>
                          <Textarea
                            rows={6}
                            className="mt-1"
                            placeholder="HPI..."
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Examination</Label>
                          <Textarea
                            rows={4}
                            className="mt-1"
                            placeholder="General, systemic..."
                          />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setOpenAddLab(true)}
                          >
                            <Flask className="h-4 w-4 mr-2" />
                            Order Lab
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setOpenAddImage(true)}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Order Imaging
                          </Button>
                          <Button
                            className={ACCENT_CLASS}
                            onClick={() => setOpenAddMed(true)}
                          >
                            <Pill className="h-4 w-4 mr-2" />
                            Add Prescription
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="font-medium mb-2">Previous Notes</div>
                      <div className="space-y-3">
                        {notes.map((n, i) => (
                          <div
                            key={i}
                            className="rounded-lg bg-muted/40 p-3 text-sm"
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{n.d}</div>
                              <span className="text-xs text-muted-foreground">
                                {n.by}
                              </span>
                            </div>
                            <div>{n.t}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {tab === "labs" && (
                  <div className="space-y-3">
                    {labs.map((d, i) => (
                      <div key={i} className="rounded-xl border p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{d.type}</div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" /> {d.date}{" "}
                            <Badge>{d.status}</Badge>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="rounded-lg bg-muted/40 p-2">
                            Hemoglobin: 14.1 g/dL
                          </div>
                          <div className="rounded-lg bg-muted/40 p-2">
                            WBC: 7.2 x10⁹/L
                          </div>
                          <div className="rounded-lg bg-muted/40 p-2">
                            Platelets: 240 x10⁹/L
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert("Open lab report viewer")}
                          >
                            {" "}
                            <FileText className="h-4 w-4 mr-2" />
                            Report
                          </Button>
                          <Button asChild size="sm" variant="outline">
                            <label className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2 inline" />
                              Attach
                              <input
                                type="file"
                                className="hidden"
                                onChange={async (e) => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;
                                  const fd = new FormData();
                                  fd.append("file", f);
                                  try {
                                    await fetch(
                                      `${API_BASE}/patients/${patientId}/upload`,
                                      { method: "POST", body: fd }
                                    );
                                    alert("Uploaded");
                                  } catch {
                                    alert("Upload failed");
                                  }
                                }}
                              />
                            </label>
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        className={ACCENT_CLASS}
                        onClick={() => setOpenAddLab(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Order / Add Lab
                      </Button>
                    </div>
                  </div>
                )}

                {tab === "imaging" && (
                  <div className="space-y-3">
                    {images.map((im, i) => (
                      <div key={i} className="rounded-xl border p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{im.type}</div>
                          <div className="text-sm text-muted-foreground">
                            {im.date}
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          Impression: {im.impression}
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert("Open DICOM/image viewer")}
                          >
                            {" "}
                            <ImageIcon className="h-4 w-4 mr-2" />
                            View Image
                          </Button>
                          <Button asChild size="sm" variant="outline">
                            <label className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2 inline" />
                              Attach
                              <input
                                type="file"
                                className="hidden"
                                onChange={async (e) => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;
                                  const fd = new FormData();
                                  fd.append("file", f);
                                  try {
                                    await fetch(
                                      `${API_BASE}/patients/${patientId}/upload`,
                                      { method: "POST", body: fd }
                                    );
                                    alert("Uploaded");
                                  } catch {
                                    alert("Upload failed");
                                  }
                                }}
                              />
                            </label>
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        className={ACCENT_CLASS}
                        onClick={() => setOpenAddImage(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Order / Add Imaging
                      </Button>
                    </div>
                  </div>
                )}

                {tab === "meds" && (
                  <div className="space-y-2">
                    {meds.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between rounded-xl border p-3"
                      >
                        <div>
                          <div className="font-medium">
                            {m.brand}{" "}
                            <span className="text-muted-foreground text-xs">
                              (Gen: {m.generic})
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            HSN: {m.hsn} · SIG: {m.sig} · Since {m.start}
                          </div>
                          <div className="mt-1 text-[11px] tracking-wider">
                            Barcode: {m.barcode || "—"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={m.active ? "default" : "secondary"}>
                            {m.active ? "Active" : "Stopped"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert("Edit medication modal")}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2">
                      <Button
                        className={ACCENT_CLASS}
                        onClick={() => setOpenAddMed(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medication
                      </Button>
                    </div>
                  </div>
                )}

                {tab === "visits" && (
                  <div className="rounded-xl border overflow-hidden">
                    <div className="grid grid-cols-12 bg-muted/50 px-3 py-2 text-xs font-medium uppercase tracking-wider">
                      <div className="col-span-4">Date & Time</div>
                      <div className="col-span-5">Reason</div>
                      <div className="col-span-3">Doctor</div>
                    </div>
                    <div>
                      {initialVisits.map((v, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-12 px-3 py-3 border-t text-sm"
                        >
                          <div className="col-span-4">{v.date}</div>
                          <div className="col-span-5">{v.reason}</div>
                          <div className="col-span-3">{v.by}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "docs" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Aadhaar",
                      "Consent Form",
                      "Discharge Summary",
                      "Insurance Card",
                    ].map((d, i) => (
                      <div key={i} className="rounded-xl border p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-medium flex items-center gap-2">
                            <FileArchive className="h-4 w-4" />
                            {d}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => alert(`Downloading ${d}...`)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button asChild size="sm" variant="outline">
                              <label className="cursor-pointer">
                                <Upload className="h-4 w-4 mr-2 inline" />
                                Upload
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const f = e.target.files?.[0];
                                    if (!f) return;
                                    const fd = new FormData();
                                    fd.append("file", f);
                                    try {
                                      await fetch(
                                        `${API_BASE}/patients/${patientId}/upload`,
                                        { method: "POST", body: fd }
                                      );
                                      alert("Uploaded");
                                    } catch {
                                      alert("Upload failed");
                                    }
                                  }}
                                />
                              </label>
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Last updated: 2025-08-11
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "billing" && (
                  <div className="space-y-3">
                    <div className="rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Outstanding</div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alert("Collect payment flow")}
                        >
                          {" "}
                          <Wallet className="h-4 w-4 mr-2" />
                          Collect
                        </Button>
                      </div>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Stat label="Balance" value="₹ 1,250" />
                        <Stat
                          label="Last Payment"
                          value="₹ 500"
                          sub="12 Sep 2025"
                        />
                        <Stat
                          label="Insurance Claims"
                          value="2"
                          sub="1 pending"
                        />
                        <Stat label="Packages" value="0" />
                      </div>
                    </div>
                    <div className="rounded-xl border overflow-hidden">
                      <div className="grid grid-cols-12 bg-muted/50 px-3 py-2 text-xs font-medium uppercase tracking-wider">
                        <div className="col-span-4">Date</div>
                        <div className="col-span-5">Item</div>
                        <div className="col-span-3 text-right">Amount</div>
                      </div>
                      {[
                        { d: "2025-09-02", item: "Consultation", amt: "₹ 500" },
                        { d: "2025-09-02", item: "CBC Test", amt: "₹ 400" },
                        { d: "2025-08-15", item: "FBS Test", amt: "₹ 350" },
                      ].map((r, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-12 px-3 py-3 border-t text-sm"
                        >
                          <div className="col-span-4">{r.d}</div>
                          <div className="col-span-5">{r.item}</div>
                          <div className="col-span-3 text-right">{r.amt}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "timeline" && (
                  <div className="space-y-4">
                    {[
                      {
                        t: "2025-10-01 10:20",
                        e: "Progress note added (Follow-up HTN)",
                        by: "Dr. Nadisha",
                      },
                      {
                        t: "2025-09-02 12:05",
                        e: "Lab: CBC uploaded",
                        by: "Lab: Chameleon Diagnostics",
                      },
                      {
                        t: "2025-08-15 09:40",
                        e: "Lab: Lipid + FBS ordered",
                        by: "Dr. Nadisha",
                      },
                      {
                        t: "2025-07-02 15:22",
                        e: "Imaging: Chest X-Ray report attached",
                        by: "Radiology",
                      },
                    ].map((i, idx) => (
                      <div key={idx} className="relative pl-6">
                        <div className="absolute left-0 top-2 h-3 w-3 rounded-full bg-primary" />
                        <div className="rounded-xl border p-3">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{i.e}</div>
                            <div className="text-xs text-muted-foreground">
                              {i.t}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {i.by}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bottom Sticky Action Bar */}
            <div className="sticky bottom-3 z-30">
              <div className="mx-auto w-full">
                <div className="mx-auto max-w-[900px] rounded-2xl border bg-background/80 p-2 backdrop-blur shadow-lg flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setOpenAddNote(true)}
                  >
                    <NotebookPen className="h-4 w-4 mr-2" />
                    Note
                  </Button>
                  <Button variant="outline" onClick={() => setOpenAddLab(true)}>
                    <Flask className="h-4 w-4 mr-2" />
                    Lab
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setOpenAddImage(true)}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Imaging
                  </Button>
                  <Button variant="outline" onClick={() => setOpenAddMed(true)}>
                    <Pill className="h-4 w-4 mr-2" />
                    Rx
                  </Button>
                  <Button
                    className={ACCENT_CLASS}
                    onClick={() => alert("Print / Save")}
                  >
                    {" "}
                    <Printer className="h-4 w-4 mr-2" />
                    Print / Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== DIALOGS ===== */}
        <Dialog open={openAddMed} onOpenChange={setOpenAddMed}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Medication</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Brand Name</Label>
                  <Input
                    value={formMed.brand}
                    onChange={(e) =>
                      setFormMed({ ...formMed, brand: e.target.value })
                    }
                    placeholder="T Dolo 650 mg"
                  />
                </div>
                <div>
                  <Label>Generic (in brackets)</Label>
                  <Input
                    value={formMed.generic}
                    onChange={(e) =>
                      setFormMed({ ...formMed, generic: e.target.value })
                    }
                    placeholder="Paracetamol/Acetaminophen"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>HSN</Label>
                  <Input
                    value={formMed.hsn}
                    onChange={(e) =>
                      setFormMed({ ...formMed, hsn: e.target.value })
                    }
                    placeholder="3004…"
                  />
                </div>
                <div>
                  <Label>Barcode</Label>
                  <Input
                    value={formMed.barcode}
                    onChange={(e) =>
                      setFormMed({ ...formMed, barcode: e.target.value })
                    }
                    placeholder="EAN/UPC/Code128 value"
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formMed.start}
                    onChange={(e) =>
                      setFormMed({ ...formMed, start: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>SIG</Label>
                <Input
                  value={formMed.sig}
                  onChange={(e) =>
                    setFormMed({ ...formMed, sig: e.target.value })
                  }
                  placeholder="1-0-1 / SOS"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAddMed(false)}>
                Cancel
              </Button>
              <Button className={ACCENT_CLASS} onClick={handleAddMed}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openAddLab} onOpenChange={setOpenAddLab}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Order / Add Lab</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div>
                <Label>Test Type</Label>
                <Input
                  value={formLab.type}
                  onChange={(e) =>
                    setFormLab({ ...formLab, type: e.target.value })
                  }
                  placeholder="CBC, FBS, Lipid Panel"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formLab.date}
                    onChange={(e) =>
                      setFormLab({ ...formLab, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Input
                    value={formLab.status}
                    onChange={(e) =>
                      setFormLab({ ...formLab, status: e.target.value })
                    }
                    placeholder="Pending/Normal/High"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAddLab(false)}>
                Cancel
              </Button>
              <Button className={ACCENT_CLASS} onClick={handleAddLab}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openAddImage} onOpenChange={setOpenAddImage}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Order / Add Imaging</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div>
                <Label>Imaging Type</Label>
                <Input
                  value={formImg.type}
                  onChange={(e) =>
                    setFormImg({ ...formImg, type: e.target.value })
                  }
                  placeholder="Chest X-Ray PA, USG Abdomen"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formImg.date}
                    onChange={(e) =>
                      setFormImg({ ...formImg, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Impression</Label>
                  <Input
                    value={formImg.impression}
                    onChange={(e) =>
                      setFormImg({ ...formImg, impression: e.target.value })
                    }
                    placeholder="e.g., No active disease"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAddImage(false)}>
                Cancel
              </Button>
              <Button className={ACCENT_CLASS} onClick={handleAddImage}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openAddNote} onOpenChange={setOpenAddNote}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quick Progress Note</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formNote.d}
                    onChange={(e) =>
                      setFormNote({ ...formNote, d: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>By</Label>
                  <Input
                    value={formNote.by}
                    onChange={(e) =>
                      setFormNote({ ...formNote, by: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Note</Label>
                <Textarea
                  rows={5}
                  value={formNote.t}
                  onChange={(e) =>
                    setFormNote({ ...formNote, t: e.target.value })
                  }
                  placeholder="Type progress note..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAddNote(false)}>
                Cancel
              </Button>
              <Button className={ACCENT_CLASS} onClick={handleAddNote}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
