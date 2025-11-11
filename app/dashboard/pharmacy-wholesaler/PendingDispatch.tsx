import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Truck } from "lucide-react";
import React from "react";

export default function PendingDispatch({ orders = 0 }) {
  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-zinc-600 flex items-center gap-2">
            <Truck className="w-4 h-4 text-zinc-500" />
            Pending Dispatch
          </CardTitle>
        </div>
        <div className="text-3xl font-semibold text-zinc-900 leading-none">
          {orders}
        </div>
        <CardDescription className="text-[12px] text-zinc-500">
          Need to ship before 4 PM
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
