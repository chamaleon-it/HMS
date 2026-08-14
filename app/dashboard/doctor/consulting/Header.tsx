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
import { fAge, fDateandTime, fAgeString } from "@/lib/fDateAndTime";
import { ActionButton } from "@/components/doctor/dashboard/home/PatientCard";
import toast from "react-hot-toast";
import useGetLabReport from "./useGetLabReport";
import { Button } from "@/components/ui/button";
import DoctorHeader from "../components/DoctorHeader";

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
  const { data } = useGetLabReport({ patientId: appointment.patient._id });

  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-4 mb-6">
      <DoctorHeader
        title={appointment.patient.name}
        subtitle={`(ID: ${appointment.patient.mrn}) • Age ${fAgeString(appointment?.patient?.dateOfBirth)}, ${appointment.patient.gender} ${!!appointment.patient.allergies ? `• Allergies: ${appointment.patient.allergies}` : ""}`}
      >
        <div className="flex gap-2.5 items-center">
          <Button
            variant={"link"}
            className="cursor-pointer text-slate-600 hover:text-slate-900"
            onClick={() =>
              window.open(
                `/dashboard/doctor/patients/single?id=${appointment.patient._id}`,
                "_blank"
              )
            }
          >
            <div className="flex items-center gap-1">
              Open Patient In New Tab
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Button>
          <ActionButton
            onClick={() => toast.success("The consultation bell is ringing.")}
          >
            <div className="flex items-center">
              <Megaphone className="h-4 w-4 mr-2" />
              Call In
            </div>
          </ActionButton>
        </div>
      </DoctorHeader>

      <div className="flex flex-wrap items-center justify-between gap-4 py-2">
        <VitalsCard />
        <div className="flex items-center gap-3">

          <div className="inline-flex rounded-2xl bg-slate-100 p-1 shadow-inner">
            <ToggleChip
              active={activeTab === "consultation"}
              onClick={() => setActiveTab("consultation")}
              icon={<Stethoscope className="h-4 w-4" />}
              activeClass="bg-(--color-synapse-dark) text-white"
            >
              Consultation
            </ToggleChip>
            <ToggleChip
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              icon={<ClipboardList className="h-4 w-4" />}
              activeClass="bg-(--color-synapse-light) text-white"
            >
              History
            </ToggleChip>

            <ToggleChip
              active={activeTab === "report"}
              onClick={() => setActiveTab("report")}
              icon={<FlaskConical className="h-4 w-4" />}
              activeClass="bg-(--color-synapse-light) text-white"
            >
              Reports{" "}
              <span className="ml-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                {data?.length || 0}
              </span>
            </ToggleChip>
          </div>
        </div>
      </div>
    </div>
  );
}
