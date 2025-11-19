import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ReceiptIndianRupee, Save } from "lucide-react";
import React from "react";


export default function Billing() {
  
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
      {/* Billing settings */}
      <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <ReceiptIndianRupee className="h-5 w-5" />
                </span>
                Billing & Invoice
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Control bill series, GST and rounding behaviour.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Bill Prefix
              </Label>
              <Input
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm uppercase tracking-wide placeholder:text-slate-400 focus-visible:ring-sky-500/70"
                maxLength={6}
                placeholder="Eg: PHM, RX, MED"
              />
              <p className="text-xs text-slate-500">
                Appears before bill number. Useful if multiple counters.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Default GST %
              </Label>
              <Select
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-sky-500/70">
                  <SelectValue placeholder="Select GST %" />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white text-sm">
                  <SelectItem value="0">0% (Exempt)</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                  <SelectItem value="18">18%</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Applied when item does not have specific GST set.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">
                  Round off bill total
                </p>
                <p className="text-xs text-slate-500">
                  Rounds to nearest whole rupee.
                </p>
              </div>
              <Switch
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">
                  Auto print after save
                </p>
                <p className="text-xs text-slate-500">
                  Opens print dialog when bill is saved.
                </p>
              </div>
              <Switch
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="default"
              className="h-9 gap-2 rounded-full bg-slate-900 px-5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              Save Billing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Helper card */}
      <Card className="border border-dashed border-slate-200 bg-white/80 shadow-sm rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-900">
            Billing tips
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Recommended defaults for small and mid-sized clinics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-500">
          <ul className="list-disc space-y-1 pl-4">
            <li>Use different prefixes for OP, IP and Pharmacy counters.</li>
            <li>Keep GST default same as most used slab.</li>
            <li>Enable round off to avoid coin differences at counter.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
