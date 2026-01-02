import { Badge } from "@/components/ui/badge";
import React from "react";
import { fDate } from "@/lib/fDateAndTime";
import { ConsultationType } from "./interface";

export default function Med({ consult }: { consult: ConsultationType[] }) {



  return (
    <div className="space-y-2">

      {!consult[0]?.medicines.length && <div className="flex flex-col items-center justify-center p-8 text-center  rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-700 mb-1">
          No Results Found
        </h2>
      </div>}
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
      {/* <div className="pt-2">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Medication
        </Button>
      </div> */}
    </div>
  );
}
