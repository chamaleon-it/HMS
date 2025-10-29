import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import React from "react";;
import { ConsultationType } from "./interface";

export default function Overview({ setTab,consult }: { setTab: (t: string) => void;consult:ConsultationType[] }) {
  

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
          {/* {labs.slice(0, 3).map((d, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg bg-muted/40 p-2"
                          >
                            <div className="text-sm">
                              {d.type}{" "}
                              <span className="text-xs text-muted-foreground">
                                · {d.date}
                              </span>
                            </div>
                            <Badge
                              variant={
                                d.status === "Normal"
                                  ? "secondary"
                                  : d.status === "High"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {d.status}
                            </Badge>
                          </div>
                        ))} */}
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
          {/* {images.slice(0, 2).map((im, i) => (
                          <li key={i} className="rounded-lg bg-muted/40 p-2">
                            <div className="flex items-center justify-between">
                              <span>{im.type}</span>
                              <span className="text-xs text-muted-foreground">
                                {im.date}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Impression: {im.impression}
                            </div>
                          </li>
                        ))} */}
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
    </div>
  );
}
