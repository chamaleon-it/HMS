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
import React from "react";

export default function Notifications() {
  
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
      {/* Notifications */}
      <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <Bell className="h-5 w-5" />
                </span>
                Notifications
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Control how staff get informed about important events.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">
                  WhatsApp alerts
                </p>
                <p className="text-xs text-slate-500">
                  Low stock, expiry and emergency order notifications.
                </p>
              </div>
              <Switch
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">SMS alerts</p>
                <p className="text-xs text-slate-500">
                  Use only if SMS gateway is configured.
                </p>
              </div>
              <Switch
                
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">
                  Sound notification in app
                </p>
                <p className="text-xs text-slate-500">
                  Play a soft tone when new alerts arrive.
                </p>
              </div>
              <Switch
                
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700">
              Internal note (for staff)
            </Label>
            <Textarea
              
              className="min-h-[90px] rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-sky-500/70"
              placeholder="Eg: Do not ignore expiry alerts. Check near-expiry rack daily before closing."
            />
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>
              Notification preferences are per pharmacy, not per user.
            </span>
            <Button
              size="default"
              className="h-9 gap-2 rounded-full bg-slate-900 px-5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
              
            >
              <Save className="h-4 w-4" />
              Save Notifications
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
            Decide which alerts are important enough to interrupt staff.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-500">
          <ul className="list-disc space-y-1 pl-4">
            <li>Enable WhatsApp for owner / in-charge only.</li>
            <li>Keep sound alerts on for billing counters.</li>
            <li>Use notes to instruct staff how to respond.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
