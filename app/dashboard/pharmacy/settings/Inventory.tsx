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
import { Package, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ProfileType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";

export default function Inventory({
  profile,
  profileMutate,
}: {
  profile?: ProfileType;
  profileMutate: () => void;
}) {
  const [payload, setPayload] = useState({
    lowStockThreshold: 10,
    expiryAlert: 90,
    allowNegativeStock: false,
  });

  useEffect(() => {
    setPayload((prev) => ({
      ...prev,
      lowStockThreshold: profile?.pharmacy?.inventory?.lowStockThreshold ?? 10,
      expiryAlert: profile?.pharmacy?.inventory?.expiryAlert ?? 90,
      allowNegativeStock:
        profile?.pharmacy?.inventory?.allowNegativeStock ?? false,
    }));
  }, [profile]);

  const [loading, setLoading] = useState(false);

  const updateInventorySettings = async () => {
    try {
      setLoading(true);
      await toast.promise(api.patch("/users/pharmacy/inventory", payload), {
        loading: "Updating inventory settings...!",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      profileMutate();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
      {/* Inventory & alerts */}
      <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <Package className="h-5 w-5" />
                </span>
                Inventory & Alerts
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Configure low-stock, expiry and stock control behaviour.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Low stock threshold
              </Label>
              <Input
                type="number"
                min={0}
                value={
                  payload.lowStockThreshold ? payload.lowStockThreshold : ""
                }
                onChange={(e) =>
                  setPayload((prev) => ({
                    ...prev,
                    lowStockThreshold: Number(e.target.value),
                  }))
                }
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-sky-500/70"
                placeholder="0"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "0")}
              />
              <p className="text-xs text-slate-500">
                Alert when available qty falls below this.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Expiry alert (days before)
              </Label>
              <Input
                type="number"
                min={0}
                value={payload.expiryAlert ? payload.expiryAlert : ""}
                onChange={(e) =>
                  setPayload((prev) => ({
                    ...prev,
                    expiryAlert: Number(e.target.value),
                  }))
                }
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-sky-500/70"
                placeholder="0"
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "0")}
              />
              <p className="text-xs text-slate-500">
                Show colour warning on near-expiry batches.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">
                Allow negative stock billing
              </p>
              <p className="text-xs text-slate-500">
                If off, system will block bills when stock is not available.
              </p>
            </div>
            <Switch
              checked={payload.allowNegativeStock}
              onCheckedChange={(v) =>
                setPayload((prev) => ({ ...prev, allowNegativeStock: v }))
              }
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="default"
              className="h-9 gap-2 rounded-full bg-slate-900 px-5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
              onClick={updateInventorySettings}
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              {loading ? "Updating..!" : "Save Inventory"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Helper card */}
      <Card className="border border-dashed border-slate-200 bg-white/80 shadow-sm rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-900">
            Inventory best practices
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Suggested thresholds for pharmacy stock and expiry.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-500">
          <ul className="list-disc space-y-1 pl-4">
            <li>Use higher thresholds for fast-moving medicines.</li>
            <li>Set expiry alerts 60–120 days before expiry date.</li>
            <li>Avoid negative stock unless you reconcile daily.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
