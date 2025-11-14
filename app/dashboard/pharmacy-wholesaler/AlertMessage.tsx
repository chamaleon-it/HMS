import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import React from "react";

export default function AlertMessage() {
  return (
    <Card className="rounded-2xl border border-amber-200 bg-amber-50/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" /> Alerts
        </CardTitle>
        <CardDescription className="text-[12px] text-amber-700">
          Things that need attention
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 text-[13px] text-amber-800">
        {/* <div className="bg-white/70 border border-amber-200 rounded-xl px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
          <div className="font-medium text-[13px] text-amber-900">
            Payment overdue
          </div>
          <div className="text-[12px] text-amber-700 leading-snug">
            City Meds ({formatINR(31800)}) due on Oct 31.
          </div>
        </div>

        <div className="bg-white/70 border border-amber-200 rounded-xl px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
          <div className="font-medium text-[13px] text-amber-900">
            Azithro 500 mg out of stock
          </div>
          <div className="text-[12px] text-amber-700 leading-snug">
            You’re at 0 box. Retailers asked 6 boxes today.
          </div>
        </div>

        <div className="bg-white/70 border border-amber-200 rounded-xl px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
          <div className="font-medium text-[13px] text-amber-900">
            GST filing
          </div>
          <div className="text-[12px] text-amber-700 leading-snug">
            Monthly GST filing due in 2 days.
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}
