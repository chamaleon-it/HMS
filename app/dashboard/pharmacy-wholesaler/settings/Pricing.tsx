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
import { Switch } from "@/components/ui/switch";
import { ReceiptIndianRupee, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ProfileType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";

interface PropTypes {
  profile?: ProfileType;
  profileMutate: () => void;
}

export default function Pricing({ profile, profileMutate }: PropTypes) {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<{
    defaultMargin: number;
    minOrderValue: number;
    creditPeriod: number;
    allowCreditOrder: boolean;
  }>({
    defaultMargin: 18,
    allowCreditOrder: false,
    creditPeriod: 30,
    minOrderValue: 5000,
  });

  useEffect(() => {
    setPayload({
      defaultMargin: profile?.pharmacyWholesaler?.pricing?.defaultMargin ?? 18,
      allowCreditOrder:
        profile?.pharmacyWholesaler?.pricing?.allowCreditOrder ?? false,
      creditPeriod: profile?.pharmacyWholesaler?.pricing?.creditPeriod ?? 30,
      minOrderValue:
        profile?.pharmacyWholesaler?.pricing?.minOrderValue ?? 5000,
    });
  }, [profile]);

  const updateSettings = async () => {
    try {
      setLoading(true);
      await toast.promise(
        api.patch("/users/pharmacy-wholesaler/pricing", payload),
        {
          loading: "Updating pricing settings...!",
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
      {/* Pricing & terms */}
      <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <ReceiptIndianRupee className="h-5 w-5" />
                </span>
                Pricing & Terms
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Default margin, credit days and order limits for retailers.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Default margin (%)
              </Label>
              <Input
                type="number"
                min={0}
                max={99}
                value={payload.defaultMargin === 0 ? "" : payload.defaultMargin}
                onChange={(e) =>
                  setPayload((prev) => ({
                    ...prev,
                    defaultMargin: Number(e.target.value),
                  }))
                }
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-emerald-500/70"
                placeholder="Eg: 18"
              />
              <p className="text-xs text-slate-500">
                Used when item-specific margin is not set.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Min order value (₹)
              </Label>
              <Input
                value={payload.minOrderValue === 0 ? "" : payload.minOrderValue}
                onChange={(e) =>
                  setPayload((prev) => ({
                    ...prev,
                    minOrderValue: Number(e.target.value),
                  }))
                }
                type="number"
                min={0}
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-emerald-500/70"
                placeholder="Eg: 5000"
              />
              <p className="text-xs text-slate-500">
                Orders below this will be flagged or blocked.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Credit period (days)
              </Label>
              <Input
                value={payload.creditPeriod === 0 ? "" : payload.creditPeriod}
                onChange={(e) =>
                  setPayload((prev) => ({
                    ...prev,
                    creditPeriod: Number(e.target.value),
                  }))
                }
                type="number"
                min={0}
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-emerald-500/70"
                placeholder="Eg: 30"
              />
              <p className="text-xs text-slate-500">
                Used for due date and payment reminders.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">
                  Allow credit orders
                </p>
                <p className="text-xs text-slate-500">
                  If off, all retailers must pay in advance.
                </p>
              </div>
              <Switch
                checked={payload.allowCreditOrder}
                onCheckedChange={(v) =>
                  setPayload((prev) => ({ ...prev, allowCreditOrder: v }))
                }
              />
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
            Pricing strategy
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Suggested defaults for B2B medicine wholesale.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-500">
          <ul className="list-disc space-y-1 pl-4">
            <li>Use higher margins on slow movers, lower on fast movers.</li>
            <li>Keep min order value aligned with your logistics cost.</li>
            <li>
              Use different price lists for hospitals vs retail pharmacies.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
