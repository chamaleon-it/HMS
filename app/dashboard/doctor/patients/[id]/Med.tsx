import { Badge } from "@/components/ui/badge";
import React from "react";
import useSWR from "swr";
import { Consultations } from "../../consulting/[id]/History";
import { useParams } from "next/navigation";
import { fDate } from "@/lib/fDateAndTime";

export default function Med() {
  const params = useParams();
  const { id: patientId } = params;

  const { data: consultingData } = useSWR<{
    message: "string";
    data: Consultations[];
  }>(`/consultings/patient/${patientId}`);
  const counsult = consultingData?.data || [];

  return (
    <div className="space-y-2">
      {counsult[0]?.medicines.map((m, i) => (
        <div
          key={i}
          className="flex items-start justify-between rounded-lg border p-3"
        >
          <div>
            <div className="font-medium">
              {m.drug}{" "}
              <span className="text-muted-foreground text-xs">
                (Dose: {m.dosage})
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Frequancy: {m.frequency} · Duration: {m.duration} · Since{" "}
              {fDate(counsult[0]?.createdAt)}
            </div>
          </div>
          <Badge variant={true ? "default" : "secondary"}>
            {true ? "Active" : "Stopped"}
          </Badge>
        </div>
      ))}
      {/* <div className="pt-2">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Medication
        </Button>
      </div> */}
    </div>
  );
}
