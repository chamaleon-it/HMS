import { useParams } from "next/navigation";
import React from "react";
import useSWR from "swr";
import { Consultations } from "../../consulting/[id]/History";
import { fDate } from "@/lib/fDateAndTime";

export default function Visit() {
  const params = useParams();
  const { id: patientId } = params;

  const { data: consultingData } = useSWR<{
    message: "string";
    data: Consultations[];
  }>(`/consultings/patient/${patientId}`);
  const consult = consultingData?.data || [];

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="grid grid-cols-12 bg-muted/50 px-3 py-2 text-xs font-medium uppercase tracking-wider">
        <div className="col-span-4">Date & Time</div>
        <div className="col-span-5">Diagnosis</div>
        <div className="col-span-3">Doctor</div>
      </div>
      <div>
        {!consult.length && (
          <div className="flex flex-col items-center justify-center p-8 text-center  rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-700 mb-1">
              No Results Found
            </h2>
          </div>
        )}

        {consult?.map((v, i) => (
          <div key={i} className="grid grid-cols-12 px-3 py-3 border-t text-sm">
            <div className="col-span-4">{fDate(v.createdAt)}</div>
            <div className="col-span-5">{v.consultationNotes.diagnosis}</div>
            <div className="col-span-3">{v.doctor.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
