import React, { Dispatch, SetStateAction, useRef } from "react";
import VitalsCard from "./VitalsCard";
import { ToggleChip } from "./ToggleChip";
import {
  ArrowRight,
  ClipboardList,
  FlaskConical,
  Megaphone,
  Stethoscope,
} from "lucide-react";
import { AppointmentType, DataType } from "./interface";
import { fAge, fDateandTime } from "@/lib/fDateAndTime";
import { ActionButton } from "@/components/doctor/dashboard/home/PatientCard";
import toast from "react-hot-toast";
import useGetLabReport from "./useGetLabReport";
import { Button } from "@/components/ui/button";

export default function Header({
  activeTab,
  setActiveTab,
  appointment,
  data: payload,
  setData
}: {
  activeTab: "consultation" | "history" | "report";
  setActiveTab: Dispatch<SetStateAction<"consultation" | "history" | "report">>;
  appointment: AppointmentType;
  data: DataType;
  setData: Dispatch<SetStateAction<DataType>>
}) {
  const { data } = useGetLabReport({ patientId: appointment?.patient?._id });

  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex justify-between mb-4">
      <div>
        <h2 className="font-semibold">
          {appointment.patient?.name} &nbsp;
          <span className="text-slate-400">
            (ID: {appointment.patient?.mrn})
          </span>
        </h2>
        <div className="flex items-center gap-5">
          <p className="text-xs text-slate-500">
            Age {fAge(appointment?.patient?.dateOfBirth)},{" "}
            {appointment.patient?.gender}{" "}
            {!!appointment.patient.allergies && (
              <>Allergies: {appointment.patient.allergies}</>
            )}
          </p>
          <VitalsCard />
        </div>
      </div>
      <div className="flex gap-2.5 items-center">
        <Button
          variant={"link"}
          className="cursor-pointer"
          onClick={() =>
            window.open(
              `/dashboard/doctor/patients/${appointment?.patient?._id}`,
              "_blank"
            )
          }
        >
          <>
            {/* <Eye className="h-4 w-4 mr-2" /> */}
            Open Patient In New Tab
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </>
        </Button>
        <ActionButton
          onClick={() => toast.success("The consultation bell is ringing.")}
        >
          <>
            <Megaphone className="h-4 w-4 mr-2" />
            Call In
          </>
        </ActionButton>

        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => {
            const data = {
              consultationNotes: payload.consultationNotes,
              examinationNote: payload.examinationNote,
              medicines: payload.medicines,
              test: payload.test,
            };
            const json = JSON.stringify(data, null, 2); // pretty print
            const blob = new Blob([json], { type: "application/json" });

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "consultation-" + fDateandTime(new Date()) + ".json"; // file name
            a.click();

            URL.revokeObjectURL(url);
          }}
        >
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Import
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();

            reader.onload = (event) => {
              try {
                const json = JSON.parse(event.target?.result as string);
                setData(json); // 👈 update your state
              } catch (err) {
                alert("Invalid JSON file");
              }
            };

            reader.readAsText(file);
          }}
        />

        <div className="inline-flex rounded-2xl bg-slate-100 p-1 shadow-inner">
          <ToggleChip
            active={activeTab === "consultation"}
            onClick={() => setActiveTab("consultation")}
            icon={<Stethoscope className="h-4 w-4" />}
            activeClass="bg-emerald-600 text-white"
          >
            Consultation
          </ToggleChip>
          <ToggleChip
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
            icon={<ClipboardList className="h-4 w-4" />}
            activeClass="bg-blue-600 text-white"
          >
            History
          </ToggleChip>

          <ToggleChip
            active={activeTab === "report"}
            onClick={() => setActiveTab("report")}
            icon={<FlaskConical className="h-4 w-4" />}
            activeClass="bg-blue-600 text-white"
          >
            Reports{" "}
            <span className="ml-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              {data?.length || 0}
            </span>
          </ToggleChip>
        </div>

      </div>
    </div>
  );
}
