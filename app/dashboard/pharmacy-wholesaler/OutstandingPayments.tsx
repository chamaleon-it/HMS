import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatINR } from "@/lib/fNumber";
import { IndianRupee } from "lucide-react";
import React from "react";

export default function OutstandingPayments({ amount = 0 }) {
  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-zinc-600 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-zinc-500" />
            Outstanding Payments
          </CardTitle>
        </div>
        <div className="text-3xl font-semibold text-zinc-900 leading-none">
          {formatINR(amount)}
        </div>
        <CardDescription className="text-[12px] text-zinc-500">
          7 retailers overdue
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
