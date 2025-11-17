import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ProfileType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";

interface PropTypes {
  profile?: ProfileType;
  profileMutate: () => void;
}

export default function Notifications({ profile, profileMutate }: PropTypes) {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<{
    whatsapp: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
    note?: string | null;
  }>({
    whatsapp: false,
    email: false,
    sms: false,
    inApp: false,
    note: null,
  });

  useEffect(() => {
    setPayload({
      whatsapp: profile?.pharmacyWholesaler?.notifications?.whatsapp ?? false,
      email: profile?.pharmacyWholesaler?.notifications?.email ?? false,
      sms: profile?.pharmacyWholesaler?.notifications?.sms ?? false,
      inApp: profile?.pharmacyWholesaler?.notifications?.inApp ?? false,
      note: profile?.pharmacyWholesaler?.notifications?.note ?? null,
    });
  }, [profile]);

  const updateSettings = async () => {
    try {
      setLoading(true);
      await toast.promise(
        api.patch("/users/pharmacy-wholesaler/notifications", payload),
        {
          loading: "Updating notifications settings...!",
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
      {/* Notifications */}
      <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm rounded-22">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <Bell className="h-5 w-5" />
                </span>
                Notifications
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Decide how your team and retailers get notified.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">WhatsApp</p>
                <p className="text-xs text-slate-500">
                  Send a WhatsApp alert when a retailer places a new order.
                </p>
              </div>
              <Switch
                checked={payload.whatsapp}
                onCheckedChange={(v) =>
                  setPayload((prev) => ({ ...prev, whatsapp: v }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">Email</p>
                <p className="text-xs text-slate-500">
                  Send order summary to the official sales email.
                </p>
              </div>
              <Switch
                checked={payload.email}
                onCheckedChange={(v) =>
                  setPayload((prev) => ({ ...prev, email: v }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">SMS</p>
                <p className="text-xs text-slate-500">
                  Inform retailers when their order is packed and dispatched.
                </p>
              </div>
              <Switch
                checked={payload.sms}
                onCheckedChange={(v) =>
                  setPayload((prev) => ({ ...prev, sms: v }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">In App</p>
                <p className="text-xs text-slate-500">
                  Remind about pending invoices before and after due date.
                </p>
              </div>
              <Switch
                checked={payload.inApp}
                onCheckedChange={(v) =>
                  setPayload((prev) => ({ ...prev, inApp: v }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700">
              Internal note (for accounts / dispatch team)
            </Label>
            <Textarea
              value={payload.note ?? ""}
              onChange={(e) =>
                setPayload((prev) => ({ ...prev, note: e.target.value }))
              }
              className="min-h-[90px] rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-emerald-500/70"
              placeholder="Eg: Do not dispatch new orders if previous invoice is overdue by more than 15 days."
            />
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>
              These settings apply to all retailers linked with this wholesaler.
            </span>
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
            Notification rules
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Avoid over-notifying, but never miss a critical update.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-500">
          <ul className="list-disc space-y-1 pl-4">
            <li>Keep WhatsApp alerts only for decision makers.</li>
            <li>Use email for daily order and dispatch summaries.</li>
            <li>Align payment reminders with your credit policy.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
