import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ReceiptIndianRupee, Truck } from "lucide-react";
import React from "react";
import { ProfileType } from "./interface";

interface PropTypes {
  profile?: ProfileType;
}

export default function Summery({ profile }: PropTypes) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="group border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-slate-500">
              Status
            </CardTitle>
            <p className="flex items-center gap-2 text-base font-semibold text-slate-900">
              Live & Accepting Orders
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Online
              </span>
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <Building2 className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-slate-500">
          Profile and GST configured. Orders can be placed by linked retailers.
        </CardContent>
      </Card>

      <Card className="group border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-slate-500">
              Commercial Terms
            </CardTitle>
            <p className="text-base font-semibold text-slate-900">
              Margin {profile?.pharmacyWholesaler?.pricing?.defaultMargin ?? 18}
              % • Credit{" "}
              {profile?.pharmacyWholesaler?.pricing?.allowCreditOrder ?? false
                ? `${
                    profile?.pharmacyWholesaler?.pricing?.creditPeriod ?? 30
                  } days`
                : "Disabled"}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <ReceiptIndianRupee className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-slate-500">
          Min order value ₹
          {profile?.pharmacyWholesaler?.pricing?.minOrderValue ?? "—"}.
        </CardContent>
      </Card>

      <Card className="group border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-slate-500">
              Dispatch Rules
            </CardTitle>
            <p className="text-base font-semibold text-slate-900">
              Same-day till{" "}
              {profile?.pharmacyWholesaler?.logistics?.sameDayDispatchCutOf ||
                "—"}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
            <Truck className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-slate-500">
          {profile?.pharmacyWholesaler?.logistics?.allowPartialDispatch
            ? "Partial dispatch allowed"
            : "Only full dispatch"}
          . Auto merge orders{" "}
          {profile?.pharmacyWholesaler?.logistics?.autoMergeOrders
            ? "ON"
            : "OFF"}
          .
        </CardContent>
      </Card>
    </div>
  );
}
