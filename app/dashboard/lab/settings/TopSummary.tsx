import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {  ReceiptIndianRupee, Store } from "lucide-react";
import React from "react";
import { ProfileType } from "./interface";

export default function TopSummary({ profile }: { profile?: ProfileType }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="group border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-slate-500">
              Status
            </CardTitle>
            <p className="flex items-center gap-2 text-base font-semibold text-slate-900">
              Live & Syncing
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Online
              </span>
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
            <Store className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-slate-500">
          Linked with main clinic account. GST active and syncing with cloud
          backup.
        </CardContent>
      </Card>

      <Card className="group border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-slate-500">
              Billing
            </CardTitle>
            <p className="text-base font-semibold text-slate-900">
              GST {profile?.lab?.billing?.defaultGst ?? 12}% • Rounding{" "}
              {profile?.lab?.billing?.roundOff ? "ON" : "OFF"}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
            <ReceiptIndianRupee className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-slate-500">
          Bill prefix{" "}
          <span className="font-semibold text-slate-800">
            {profile?.lab?.billing?.prefix ?? "INV"}
          </span>
          . Print on save{" "}
          {profile?.lab?.billing?.autoPrintAfterSave
            ? "enabled"
            : "disabled"}
          .
        </CardContent>
      </Card>

      
    </div>
  );
}
