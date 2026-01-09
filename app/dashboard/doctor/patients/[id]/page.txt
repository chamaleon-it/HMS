"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  Upload,
  Wallet,
  Download,
  FileArchive,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
import { cn } from "@/lib/utils";
import Clinical from "./Clinical";
import useGetLabReport from "./useGetLabReport";
import Labs from "./Labs";
import Imaging from "./Imaging";

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
  const [tab, setTab] = useState("clinical");
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

  const { data: patientData, mutate: mutatePatient } = useSWR<{
    message: string;
    data: PatientType;
  }>(`/patients/single/${patientId}`);

  const patient = patientData?.data;

  const { data: consultingData } = useSWR<{
    message: string;
    data: ConsultationType[];
  }>(`/consultings/patient/${patientId}`);
  const consult = consultingData?.data || [];


  const { data: labData } = useGetLabReport({ patientId: patientId as string })



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
                <TabsTrigger value="clinical">Clinical Notes</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
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
          {tab !== "clinical" && <PatientSnapshot
            blurIDsClass={blurIDsClass}
            maskIDs={maskIDs}
            setMaskIDs={setMaskIDs}
            setOpenAddMed={setOpenAddMed}
            setShowPHI={setShowPHI}
            showPHI={showPHI}
            patient={patient}
            consult={consult}
          />}

          {/* Right Column: Main Tabs */}
          <div className={cn("space-y-4", tab === "clinical" ? "col-span-full" : "lg:col-span-8")}>
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

                </div>
              </CardHeader>

              <CardContent>

                {tab === "clinical" && (<Clinical consult={consult} />)}

                {tab === "overview" && (
                  <Overview setTab={setTab} consult={consult} patient={patient} mutatePatient={mutatePatient} />
                )}



                {tab === "labs" && (
                  <Labs labs={labData?.filter((e) => e.name.some((e) => e.type === "Lab"))} />
                )}

                {tab === "imaging" && (
                  <Imaging labs={labData?.filter((e) => e.name.some((e) => e.type === "Imaging"))} />
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

                      <div className="flex flex-col items-center justify-center p-8 text-center  rounded-xl shadow-sm">
                        <h2 className="text-lg font-semibold text-zinc-700 mb-1">
                          No Results Found
                        </h2>
                      </div>
                    </div>
                  </div>
                )}

                {tab === "timeline" && (

                  <Visit />
                )}
              </CardContent>
            </Card>

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
