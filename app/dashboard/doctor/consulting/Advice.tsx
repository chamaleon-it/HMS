"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { DataType } from "./interface";

interface AdviceProps {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
}

export default function Advice({ data, setData }: AdviceProps) {
  return (
    <Card className="mt-4 border-slate-200 shadow-xs">
      <CardContent className="p-4 sm:p-5">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">
            Clinical Advice & Patient Instructions
          </Label>
          <Textarea
            value={data.advice || ""}
            onChange={(e) =>
              setData((prev) => ({ ...prev, advice: e.target.value }))
            }
            placeholder="Write lifestyle recommendations, dietary advice, precautions, or special instructions for the patient..."
            className="rounded-xl border-slate-200 bg-zinc-50/70 text-xs min-h-22.5 focus-visible:ring-synapse-light/20 focus-visible:border-(--color-synapse-light) transition-all placeholder:text-slate-400"
          />
        </div>
      </CardContent>
    </Card>
  );
}
