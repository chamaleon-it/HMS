import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import React, { useState } from "react";;
import { ConsultationType, PatientType } from "./interface";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { fDateandTime } from "@/lib/fDateAndTime";

export default function Overview({ setTab, consult, patient, mutatePatient }: { setTab: (t: string) => void; consult: ConsultationType[]; patient?: PatientType, mutatePatient: () => void }) {


  const [remarks, setRemarks] = useState(patient?.remarks || "")

  const handleSaveRemarks = async () => {
    try {
      await toast.promise(api.patch(`/patients/remarks/${consult[0]?.patient._id}`, { remarks }), {
        loading: "Saving remarks...",
        success: "Remarks saved successfully",
        error: "Failed to save remarks"
      })
      mutatePatient()
    } catch (error) {
      toast.error("Failed to save remarks " + error)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Latest Summary</div>
          <Button size="sm" variant="ghost" onClick={() => setTab("clinical")}>
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
        {consult[0]?.consultationNotes.diagnosis && (
          <p className="mt-2 text-sm text-muted-foreground leading-6">
            {consult[0]?.consultationNotes.diagnosis}
          </p>
        )}
      </div>

      <div className="rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Recent Labs</div>
          <Button size="sm" variant="ghost" onClick={() => setTab("labs")}>
            See Labs
          </Button>
        </div>
        <div className="mt-2 space-y-2">
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Imaging</div>
          <Button size="sm" variant="ghost" onClick={() => setTab("imaging")}>
            See Imaging
          </Button>
        </div>
        <ul className="mt-2 space-y-2 text-sm">

        </ul>
      </div>

      <div className="rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Upcoming</div>
          <Button size="sm" variant="ghost">
            Open Calendar
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          No upcoming appointments.
        </div>
      </div>
      <div className="col-span-full">
        <div className="rounded-xl border p-4 ">
          <div className="flex items-center justify-between">
            <div className="font-medium flex gap-1 items-center">Past History <p className="col-span-full text-xs text-muted-foreground text-right mt-0">(Last Updated: {fDateandTime(consult[0]?.createdAt)})</p></div>

          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {consult[0]?.consultationNotes.pastHistory}
          </div>
        </div>

      </div>

      <div className="col-span-full rounded-xl border p-4">

        <div className="flex items-center justify-between mb-2">
          <div className="font-medium flex gap-1 items-center">Remarks <p className="col-span-full text-xs text-muted-foreground text-right mt-0">(Last Updated: {fDateandTime(patient?.remarksDate)})</p></div>

        </div>
        <Textarea className="h-[150px] w-full rounded-xl border px-2 py-1" placeholder="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        <div className="flex justify-end">
          <Button className="mt-2 bg-emerald-600 hover:bg-emerald-600" onClick={handleSaveRemarks}>Save Remarks</Button>
        </div>
      </div>

    </div>
  );
}
