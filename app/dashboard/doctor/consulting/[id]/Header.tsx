import React, { Dispatch, SetStateAction } from "react";
import VitalsCard from "./VitalsCard";
import { ToggleChip } from "./ToggleChip";
import { ClipboardList, Megaphone, Stethoscope } from "lucide-react";
import { AppointmentType } from "./interface";
import { fAge } from "@/lib/fDateAndTime";
import { ActionButton } from "@/components/doctor/dashboard/home/PatientCard";
import toast from "react-hot-toast";

export default function Header({
  activeTab,
  setActiveTab,
  appointment,
}: {
  activeTab: "consultation" | "history";
  setActiveTab: Dispatch<SetStateAction<"consultation" | "history">>;
  appointment: AppointmentType;
}) {
  return (
    <div className="flex justify-between mb-4">
      <div>
        <h2 className="font-semibold">
          {appointment.patient.name} &nbsp;
          <span className="text-slate-400">
            (ID: {appointment.patient.mrn})
          </span>
        </h2>
        <div className="flex items-center gap-5">
          <p className="text-xs text-slate-500">
            Age {fAge(appointment?.patient?.dateOfBirth)},{" "}
            {appointment.patient.gender}{" "}
            {!!appointment.patient.allergies && (
              <>Allergies: {appointment.patient.allergies}</>
            )}
          </p>
          <VitalsCard />
        </div>
      </div>
      <div className="flex gap-2.5 items-center">
        <ActionButton
          onClick={() => toast.success("The consultation bell is ringing.")}
        >
          <>
            <Megaphone className="h-4 w-4 mr-2" />
            Call In
          </>
        </ActionButton>

        <div className="inline-flex rounded-2xl bg-slate-100 p-1 shadow-inner">
          <ToggleChip
            active={activeTab === "consultation"}
            onClick={() => setActiveTab("consultation")}
            icon={<Stethoscope className="h-4 w-4" />}
            activeClass="bg-green-600 text-white"
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
        </div>
      </div>
    </div>
  );
}
