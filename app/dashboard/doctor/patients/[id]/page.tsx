"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  FlaskRound as Flask,
  Image as ImageIcon,
  NotebookPen,
  Pill,
  Printer,
  Stethoscope,
  Upload,
  Wallet,
  Download,
  Search,
  Edit3,
  FileArchive,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import Header from "./Header";
import PatientSnapshot from "./PatientSnapshot";
import Overview from "./Overview";
import Med from "./Med";
import Visit from "./Visit";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { ConsultationType, PatientType } from "./interface";

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

export default function PatientFullDetailPage() {
  const ACCENT_CLASS = "bg-[#6E59F9] hover:bg-[#5b46f4]"; // HMS purple

  // ---- STATE ----
  const [tab, setTab] = useState("overview");
  const [showPHI, setShowPHI] = useState(true);
  const [maskIDs, setMaskIDs] = useState(false);

  const [openAddMed, setOpenAddMed] = useState(false);
  const [openAddLab, setOpenAddLab] = useState(false);
  const [openAddImage, setOpenAddImage] = useState(false);
  const [openAddNote, setOpenAddNote] = useState(false);

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

  const params = useParams();
  const { id: patientId } = params;

  const { data: patientData, mutate: patientMutate } = useSWR<{
    message: string;
    data: PatientType;
  }>(`/patients/single/${patientId}`);

  const patient = patientData?.data;

  const { data: consultingData, mutate: consultingMutate } = useSWR<{
    message: string;
    data: ConsultationType[];
  }>(`/consultings/patient/${patientId}`);
  const consult = consultingData?.data || [];

  useEffect(() => {
    patientMutate();
    consultingMutate();
  }, [patientMutate,consultingMutate]);

  return (
    <AppShell>
      <div className="min-h-screen w-full bg-gradient-to-b from-background to-muted/30">
        {/* Sticky Header */}
        <div className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Header
            mask={mask}
            blurIDsClass={blurIDsClass}
            setOpenAddNote={setOpenAddImage}
            showPHI={showPHI}
            patient={patient}
          />

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
          <PatientSnapshot
            blurIDsClass={blurIDsClass}
            maskIDs={maskIDs}
            setMaskIDs={setMaskIDs}
            setOpenAddMed={setOpenAddMed}
            setShowPHI={setShowPHI}
            showPHI={showPHI}
            patient={patient}
            consult={consult}
          />

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
                  <Overview setTab={setTab} consult={consult} />
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
                        {/* {notes.map((n, i) => (
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
                        ))} */}
                      </div>
                    </div>
                  </div>
                )}

                {tab === "labs" && (
                  <div className="space-y-3">
                    {/* {labs.map((d, i) => (
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
                    ))} */}
                    {/* <div className="flex justify-end">
                      <Button
                        size="sm"
                        className={ACCENT_CLASS}
                        onClick={() => setOpenAddLab(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Order / Add Lab
                      </Button>
                    </div> */}
                  </div>
                )}

                {tab === "imaging" && (
                  <div className="space-y-3">
                    {/* {images.map((im, i) => (
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
                    ))} */}
                    {/* <div className="flex justify-end">
                      <Button
                        size="sm"
                        className={ACCENT_CLASS}
                        onClick={() => setOpenAddImage(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Order / Add Imaging
                      </Button>
                    </div> */}
                  </div>
                )}

                {tab === "meds" && <Med consult={consult} />}

                {tab === "visits" && <Visit />}

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
                        <Stat label="Balance" value="₹ 0" />
                        <Stat
                          label="Last Payment"
                          value="₹ 0"
                          sub="12 Sep 2025"
                        />
                        <Stat
                          label="Insurance Claims"
                          value="0"
                          sub="0 pending"
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
                      {/* {[
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
                      ))} */}
                    </div>
                  </div>
                )}

                {tab === "timeline" && (
                  // <div className="space-y-4">
                  //   {/* {[
                  //     {
                  //       t: "2025-10-01 10:20",
                  //       e: "Progress note added (Follow-up HTN)",
                  //       by: "Dr. Nadisha",
                  //     },
                  //     {
                  //       t: "2025-09-02 12:05",
                  //       e: "Lab: CBC uploaded",
                  //       by: "Lab: Chameleon Diagnostics",
                  //     },
                  //     {
                  //       t: "2025-08-15 09:40",
                  //       e: "Lab: Lipid + FBS ordered",
                  //       by: "Dr. Nadisha",
                  //     },
                  //     {
                  //       t: "2025-07-02 15:22",
                  //       e: "Imaging: Chest X-Ray report attached",
                  //       by: "Radiology",
                  //     },
                  //   ].map((i, idx) => (
                  //     <div key={idx} className="relative pl-6">
                  //       <div className="absolute left-0 top-2 h-3 w-3 rounded-full bg-primary" />
                  //       <div className="rounded-xl border p-3">
                  //         <div className="flex items-center justify-between">
                  //           <div className="font-medium">{i.e}</div>
                  //           <div className="text-xs text-muted-foreground">
                  //             {i.t}
                  //           </div>
                  //         </div>
                  //         <div className="text-xs text-muted-foreground">
                  //           {i.by}
                  //         </div>
                  //       </div>
                  //     </div>
                  //   ))} */}
                  // </div>
                  <Visit />
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
              <Button className={ACCENT_CLASS}>Save</Button>
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
              <Button className={ACCENT_CLASS}>Save</Button>
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
              <Button className={ACCENT_CLASS}>Save</Button>
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
              <Button className={ACCENT_CLASS}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
