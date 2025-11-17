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
import { Textarea } from "@/components/ui/textarea";
import { Save, Store } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ProfileType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";

export default function General({
  profile,
  profileMutate,
}: {
  profile?: ProfileType;
  profileMutate: () => void;
}) {
  const [payload, setPayload] = useState({
    name: "",
    owner: "",
    phoneNumber: "",
    email: "",
    gstin: "",
    address: "",
  });

  useEffect(() => {
    setPayload((prev) => ({
      ...prev,
      name: profile?.name ?? "",
      owner: profile?.pharmacy?.general?.owner ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
      email: profile?.email ?? "",
      gstin: profile?.pharmacy?.general?.gstin ?? "",
      address: profile?.address ?? "",
    }));
  }, [profile]);

  const [loading, setLoading] = useState(false);

  const updateGeneralSettings = async () => {
    try {
      setLoading(true);
      await toast.promise(api.patch("/users/pharmacy/general", payload), {
        loading: "Updating general settings...!",
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
      <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <Store className="h-5 w-5" />
                </span>
                Pharmacy Profile
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Basic details used in headers, bills and reports.
              </CardDescription>
            </div>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
              Required
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700">
              Pharmacy Name
            </Label>
            <Input
              className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-sky-500/70"
              placeholder="Enter pharmacy name"
              value={payload.name}
              onChange={(e) =>
                setPayload((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Owner / In-charge
              </Label>
              <Input
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-sky-500/70"
                placeholder="Name of responsible person"
                value={payload.owner}
                onChange={(e) =>
                  setPayload((prev) => ({ ...prev, owner: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Contact Number
              </Label>
              <Input
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-sky-500/70"
                placeholder="Primary phone number"
                value={payload.phoneNumber}
                onChange={(e) =>
                  setPayload((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Email
              </Label>
              <Input
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-sky-500/70"
                placeholder="For reports & backup"
                value={payload.email}
                onChange={(e) =>
                  setPayload((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                GSTIN
              </Label>
              <Input
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm uppercase tracking-wide placeholder:text-slate-400 focus-visible:ring-sky-500/70"
                placeholder="18-CHAR GST NUMBER"
                value={payload.gstin}
                onChange={(e) =>
                  setPayload((prev) => ({ ...prev, gstin: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700">
              Address
            </Label>
            <Textarea
              className="min-h-[90px] rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-sky-500/70"
              placeholder="This will appear on printed bills and reports"
              value={payload.address}
              onChange={(e) =>
                setPayload((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="default"
              className="h-9 gap-2 rounded-full bg-slate-900 px-5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
              onClick={updateGeneralSettings}
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              {loading ? "Updating..!" : "Save Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Helper card */}
      <Card className="border border-dashed border-slate-200 bg-white/80 shadow-sm rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-900">
            Where this appears
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            These details are shown on printed bills, prescription headers and
            pharmacy reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-500">
          <ul className="list-disc space-y-1 pl-4">
            <li>Pharmacy name and address in bill header.</li>
            <li>GSTIN included in tax summary section.</li>
            <li>Contact number and email on patient copy.</li>
          </ul>
          <p className="mt-2 text-[11px] text-slate-500">
            Keep this updated whenever license, GST or contact details change.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
