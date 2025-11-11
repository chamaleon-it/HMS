import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package } from "lucide-react";
import React from "react";

export default function TotalOrder({ orders = 0 }) {
  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-zinc-600 flex items-center gap-2">
            <Package className="w-4 h-4 text-zinc-500" />
            Total Orders
          </CardTitle>
          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-medium px-2 py-0.5">
            +12%
          </Badge>
        </div>
        <div className="text-3xl font-semibold text-zinc-900 leading-none">
          {orders}
        </div>
        <CardDescription className="text-[12px] text-zinc-500">
          vs yesterday
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
