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
import { Save, Truck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ProfileType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";

interface PropTypes {
  profile?: ProfileType;
  profileMutate: () => void;
}

export default function Logistics({ profile, profileMutate }: PropTypes) {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<{
    sameDayDispatchCutOf: string;
    defaultCourier: string;
    returnWindow: number;
    allowPartialDispatch: boolean;
    autoMergeOrders: boolean;
  }>({
    allowPartialDispatch: false,
    autoMergeOrders: false,
    defaultCourier: "",
    returnWindow: 7,
    sameDayDispatchCutOf: "16:00",
  });

  useEffect(() => {
    setPayload({
      allowPartialDispatch:
        profile?.pharmacyWholesaler?.logistics?.allowPartialDispatch ?? false,
      autoMergeOrders:
        profile?.pharmacyWholesaler?.logistics?.autoMergeOrders ?? false,
      defaultCourier:
        profile?.pharmacyWholesaler?.logistics?.defaultCourier ?? "",
      returnWindow: profile?.pharmacyWholesaler?.logistics?.returnWindow ?? 7,
      sameDayDispatchCutOf:
        profile?.pharmacyWholesaler?.logistics?.sameDayDispatchCutOf ?? "16:00",
    });
  }, [profile]);

  const updateSettings = async () => {
    try {
      setLoading(true);
      await toast.promise(
        api.patch("/users/pharmacy-wholesaler/logistics", payload),
        {
          loading: "Updating logistics settings...!",
          success: ({ data }) => data.message,
          error: ({ response }) => response.data.message,
        }
      );
      profileMutate();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
      {/* Logistics & dispatch */}
      <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <Truck className="h-5 w-5" />
                </span>
                Logistics & Dispatch
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Control cut-off time, partial dispatch and courier preferences.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Same-day dispatch cut-off (24h format)
              </Label>
              <Input
              value={payload.sameDayDispatchCutOf}
              onChange={e=>setPayload(prev=>({...prev,sameDayDispatchCutOf:e.target.value}))}
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-sky-500/70"
                placeholder="Eg: 14:00"
              />
              <p className="text-xs text-slate-500">
                Orders after this go to next-day dispatch queue.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Default courier / mode
              </Label>
              <Select value={payload.defaultCourier} onValueChange={v=>setPayload(prev=>({...prev,defaultCourier:v}))}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-sky-500/70">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white text-sm">
                  <SelectItem value="Own vehicle">Own vehicle</SelectItem>
                  <SelectItem value="Local courier">Local courier</SelectItem>
                  <SelectItem value="Parcel / transport">Parcel / transport</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Can be overridden per order.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Return window (days)
              </Label>
              <Input
              value={payload.returnWindow}
              onChange={e=>setPayload(prev=>({...prev,returnWindow:Number(e.target.value)}))}
                type="number"
                min={0}
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-sky-500/70"
                placeholder="Eg: 7"
              />
              <p className="text-xs text-slate-500">
                Used for return eligibility and reports.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">
                  Allow partial dispatch
                </p>
                <p className="text-xs text-slate-500">
                  If on, available items go first and pending remain in queue.
                </p>
              </div>
              <Switch checked={payload.allowPartialDispatch} onCheckedChange={v=>setPayload(prev=>({...prev,allowPartialDispatch:v}))}/>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">
                  Auto-merge orders
                </p>
                <p className="text-xs text-slate-500">
                  Merge multiple small orders from same retailer for same day.
                </p>
              </div>
              <Switch checked={payload.autoMergeOrders} onCheckedChange={v=>setPayload(prev=>({...prev,autoMergeOrders:v}))}/>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="default"
              className="h-9 gap-2 rounded-full bg-slate-900 px-5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
              onClick={updateSettings}
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              {loading ? "Updating...!" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Helper card */}
      <Card className="border border-dashed border-slate-200 bg-white/80 shadow-sm rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-900">
            Dispatch playbook
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Helps your team follow consistent rules at the counter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-500">
          <ul className="list-disc space-y-1 pl-4">
            <li>Keep cut-off realistic based on packing time.</li>
            <li>Use auto-merge to save on transport cost.</li>
            <li>Communicate clear return window to all retailers.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
