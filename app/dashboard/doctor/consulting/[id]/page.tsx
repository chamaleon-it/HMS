"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppShell from "@/components/layout/app-shell";
import ConsultationAndExaminationNotes from "./ConsultationAndExaminationNotes";
import { redirect, useParams } from "next/navigation";
import FollowUpTime from "./FollowUpTime";
import History from "./History";
import AllergyAlert from "./AllergyAlert";
// import { ConfettiBurst } from "./ConfettiBurst";
import Header from "./Header";
import Advice from "./Advice";
import ActionButton from "./ActionButton";
import LabAndTest from "./LabAndTest";
import useSWR from "swr";
import PrescriptionCard from "./PrescriptionCard";
import { AppointmentType, DataType } from "./interface";

export default function ConsultingMenu() {
  const params = useParams();
  const { id: appointmentId } = params;
  const [activeTab, setActiveTab] = useState<"consultation" | "history">(
    "consultation"
  );
  const { data: appointmentData, isLoading } = useSWR<{
    message: string;
    data: AppointmentType;
  }>(`/appointments/single/${appointmentId}`);

  const [data, setData] = useState<DataType>({
    patient: null,
    appointment: null,
    consultationNotes: {
      presentHistory: null,
      pastHistory: null,
      diagnosis: null,
    },
    examinationNote: {
      hr: null,
      bp: null,
      spo2: null,
      temp: null,
      rs: null,
      cvs: null,
      pa: null,
      cns: null,
      otherNotes: null,
    },
    medicines: [],
    advice: null,
    followUp: null,
    test: [],
  });

  const appointment = appointmentData?.data;

  useEffect(() => {
    if (appointment?._id && appointment.patient._id) {
      setData((prev) => ({
        ...prev,
        appointment: appointment._id,
        patient: appointment.patient._id,
      }));
    }
  }, [appointment]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
          Loading...!
        </div>
      </AppShell>
    );
  }

  if (!appointment) {
    redirect("/dashboard/doctor/appointments");
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="mx-auto p-5">
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            appointment={appointment}
          />
          {appointment.patient.allergies && (
            <AllergyAlert allergies={appointment.patient.allergies} />
          )}
          {activeTab === "consultation" && (
            <div className="mt-4">
              <Card className="p-6">
                <ConsultationAndExaminationNotes
                  data={data}
                  setData={setData}
                />
                <Separator className="my-4" />
                <PrescriptionCard data={data} setData={setData} />
                <Separator className="my-6" />
                <LabAndTest data={data} setData={setData} />
                <Separator className="my-6" />
                <Advice data={data} setData={setData} />
                <FollowUpTime setData={setData} data={data} />
                <ActionButton data={data} />
              </Card>
            </div>
          )}

          {activeTab === "history" && <History patientId={appointment.patient._id} />}
        </div>
      </div>
    </AppShell>
  );
}
