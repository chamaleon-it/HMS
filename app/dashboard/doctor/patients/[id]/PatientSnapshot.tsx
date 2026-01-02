import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  Info,
  Phone,
  Pill,
  Plus,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import React from "react";
import { fDate } from "@/lib/fDateAndTime";
import { ConsultationType, PatientType } from "./interface";

export default function PatientSnapshot({
  blurIDsClass,
  showPHI,
  setOpenAddMed,
  setShowPHI,
  setMaskIDs,
  maskIDs,
  consult,
  patient,
}: {
  blurIDsClass: "" | "blur-sm";
  showPHI: boolean;
  setOpenAddMed: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPHI: React.Dispatch<React.SetStateAction<boolean>>;
  setMaskIDs: React.Dispatch<React.SetStateAction<boolean>>;
  maskIDs: boolean;
  consult: ConsultationType[];
  patient: PatientType | undefined;
}) {
  return (
    <div className="lg:col-span-4 space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" /> Patient Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            {consult[0]?.examinationNote?.hr && (
              <div className="rounded-xl border p-3">
                <Stat
                  label={"HR"}
                  value={consult[0]?.examinationNote.hr}
                  sub={"bpm"}
                />
              </div>
            )}

            {consult[0]?.examinationNote?.bp && (
              <div className="rounded-xl border p-3">
                <Stat
                  label={"BP"}
                  value={consult[0]?.examinationNote.bp}
                  sub={"mmHg"}
                />
              </div>
            )}

            {consult[0]?.examinationNote?.spo2 && (
              <div className="rounded-xl border p-3">
                <Stat
                  label={"SpO2"}
                  value={consult[0]?.examinationNote.spo2}
                  sub={"%"}
                />
              </div>
            )}

            {consult[0]?.examinationNote?.temp && (
              <div className="rounded-xl border p-3">
                <Stat
                  label={"Temp"}
                  value={consult[0]?.examinationNote.temp}
                  sub={consult[0]?.examinationNote.tempUnit || "°C"}
                />
              </div>
            )}

            {consult[0]?.examinationNote?.rs && (
              <div className="rounded-xl border p-3">
                <Stat
                  label={"RS"}
                  value={consult[0]?.examinationNote.rs}
                  sub={""}
                />
              </div>
            )}

            {consult[0]?.examinationNote?.cvs && (
              <div className="rounded-xl border p-3">
                <Stat
                  label={"CVS"}
                  value={consult[0]?.examinationNote.cvs}
                  sub={""}
                />
              </div>
            )}

            {consult[0]?.examinationNote?.pa && (
              <div className="rounded-xl border p-3">
                <Stat
                  label={"P/A"}
                  value={consult[0]?.examinationNote.pa}
                  sub={""}
                />
              </div>
            )}

            {consult[0]?.examinationNote?.cns && (
              <div className="rounded-xl border p-3">
                <Stat
                  label={"CNS"}
                  value={consult[0]?.examinationNote.cns}
                  sub={""}
                />
              </div>
            )}
          </div>
          <Separator className="my-4" />
          <LabeledRow label="Primary Doctor">
            {consult[0]?.doctor?.name ?? patient?.doctor?.name}
          </LabeledRow>

          {/* {!!consult[0]?.consultationNotes?.diagnosis && (
            <LabeledRow label="Conditions">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {consult[0]?.consultationNotes?.diagnosis}
                </Badge>
              </div>
            </LabeledRow>
          )} */}

          {!!patient?.conditions.length && (
            <LabeledRow label="Conditions">
              <div className="flex flex-wrap gap-2">
                {patient?.conditions?.map((condition) => (
                  <Badge key={condition} variant="outline">
                    {condition}
                  </Badge>
                ))}
              </div>
            </LabeledRow>
          )}
          {patient?.allergies && (
            <LabeledRow label="Allergies">
              <div className="flex flex-wrap gap-2">
                <Badge className={"rounded-full " + "bg-amber-500 text-black"}>
                  {patient?.allergies}
                </Badge>
              </div>
            </LabeledRow>
          )}
          {patient?.insurance && (
            <LabeledRow label="Insurance">
              {patient.insurance} (Valid till {fDate(patient.insuranceValidity)}
              )
            </LabeledRow>
          )}
          {patient?.emergencyContactNumber && (
            <LabeledRow label="Emergency Contact">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />{" "}
                <span className={blurIDsClass}>
                  {showPHI ? patient?.emergencyContactNumber : "A. · ******"}
                </span>
              </div>
            </LabeledRow>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              {
                view: Boolean(patient?.allergies),
                label: "Allergy",
                icon: <AlertTriangle className="h-3.5 w-3.5" />,
                color: "bg-red-500/10 text-red-600",
              },
              // {
              //   view: true,
              //   label: "Chronic",
              //   icon: <Heart className="h-3.5 w-3.5" />,
              //   color: "bg-rose-500/10 text-rose-600",
              // },
              {
                view: Boolean(patient?.insurance),
                label: "Insurance",
                icon: <Wallet className="h-3.5 w-3.5" />,
                color: "bg-emerald-500/10 text-emerald-600",
              },
            ]?.map(
              (f) =>
                f.view && (
                  <span
                    key={f.label}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${f.color}`}
                  >
                    {f.icon}
                    {f.label}
                  </span>
                )
            )}
          </div>
        </CardContent>
      </Card>

      {Boolean(consult[0]?.medicines.length) && <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" /> Last Prescribed Medicine
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {consult[0]?.medicines?.map((m, i) => (
            <div
              key={i}
              className="flex items-start justify-between rounded-lg border p-3"
            >
              <div>
                <div className="font-medium">
                  {m.name.name}{" "}
                  <span className="text-muted-foreground text-xs">
                    (Dose: {m.dosage})
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Frequancy: {m.frequency} · Duration: {m.duration} · Since{" "}
                  {fDate(consult[0]?.createdAt)}
                </div>
              </div>
              <Badge variant={true ? "default" : "secondary"}>
                {true ? "Active" : "Stopped"}
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
      </Card>}

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
      <div className="text-lg font-semibold leading-tight">
        {value}{" "}
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}
