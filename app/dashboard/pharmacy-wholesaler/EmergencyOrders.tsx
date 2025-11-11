import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Truck } from "lucide-react";
import React from "react";

export default function EmergencyOrders({ urgentOrders = 0 }) {
  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
            <Truck className="w-4 h-4 text-red-600" />
            Emergency Orders
          </CardTitle>
          <Badge className="bg-red-600 text-white border border-red-600 rounded-full text-[10px] font-medium px-2 py-0.5 shadow-[0_8px_24px_rgba(220,38,38,0.4)]">
            ASAP
          </Badge>
        </div>
        <div className="text-3xl font-semibold text-zinc-900 leading-none">
          {urgentOrders}
        </div>
        <CardDescription className="text-[12px] text-zinc-500">
          Need dispatch now
        </CardDescription>
        <div>
          <Button className="mt-3 rounded-xl h-8 px-3 bg-red-600 text-white hover:bg-red-500 text-[12px] font-semibold shadow-[0_16px_40px_rgba(220,38,38,0.4)] flex items-center gap-2">
            <Truck className="w-3.5 h-3.5" /> View Emergency Queue
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
