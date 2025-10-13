import React, { Dispatch, SetStateAction } from 'react'
import VitalsCard from './VitalsCard';
import { ToggleChip } from './ToggleChip';
import { ClipboardList, Stethoscope } from 'lucide-react';

const patient = {
    id: "P-001",
    name: "Ravi Kumar",
    age: 34,
    gender: "Male",
    allergies: ["Penicillin", "Ibuprofen"],
  } as const;


export default function Header({activeTab,setActiveTab}:{activeTab: "consultation" | "history",setActiveTab: Dispatch<SetStateAction<"consultation" | "history">>}) {
  return (
     <div className="flex justify-between mb-4">
            <div>
              <h2 className="font-semibold">
                {patient.name}
                <span className="text-slate-400">(ID: {patient.id})</span>
              </h2>
              <div className="flex items-center gap-5">
                <p className="text-xs text-slate-500">
                  Age {patient.age}, {patient.gender} • Allergies:
                  {patient.allergies.join(", ")}
                </p>
                <VitalsCard />
              </div>
            </div>
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
  )
}
