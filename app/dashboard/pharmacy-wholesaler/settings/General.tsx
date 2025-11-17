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
import { Building2, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ProfileType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";

interface PropTypes {
  profile?: ProfileType;
  profileMutate: () => void;
}

export default function General({ profile, profileMutate }: PropTypes) {
  const [loading, setLoading] = useState(false)
  const [payload, setPayload] = useState<{
    name: string;
    contactPerson: string;
    phoneNumber: string;
    email: string;
    gstin: string;
    address: string;
  }>({
    name: "",
    contactPerson: "",
    phoneNumber: "",
    email: "",
    gstin: "",
    address: "",
  });

  useEffect(() => {
    setPayload({
      address: profile?.address ?? "",
      contactPerson: profile?.pharmacyWholesaler?.general.contactPerson ?? "",
      email: profile?.email ?? "",
      gstin: profile?.pharmacyWholesaler?.general.gstin ?? "",
      name: profile?.name ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
    });
  }, [profile]);

   const updateSettings = async () => {
    try {
      setLoading(true);
      await toast.promise(api.patch("/users/pharmacy-wholesaler/general", payload), {
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
      {/* General profile */}
      <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <Building2 className="h-5 w-5" />
                </span>
                Wholesaler Profile
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Basic identity and GST details shown on purchase bills and
                invoices.
              </CardDescription>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Required
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700">
              Company / Firm Name
            </Label>
            <Input
              className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-emerald-500/70"
              placeholder="Enter wholesaler name"
              value={payload.name}
              onChange={e=>setPayload(prev=>({...prev,name:e.target.value}))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Contact Person
              </Label>
              <Input
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-emerald-500/70"
                placeholder="Name of primary contact"
                value={payload.contactPerson}
              onChange={e=>setPayload(prev=>({...prev,contactPerson:e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Contact Number
              </Label>
              <Input
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-emerald-500/70"
                placeholder="Primary phone number"
                value={payload.phoneNumber}
              onChange={e=>setPayload(prev=>({...prev,phoneNumber:e.target.value}))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Email (for orders & invoices)
              </Label>
              <Input
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-emerald-500/70"
                placeholder="Official sales email"
                value={payload.email}
              onChange={e=>setPayload(prev=>({...prev,email:e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                GSTIN
              </Label>
              <Input
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm uppercase tracking-wide placeholder:text-slate-400 focus-visible:ring-emerald-500/70"
                placeholder="18-CHAR GST NUMBER"
                value={payload.gstin}
              onChange={e=>setPayload(prev=>({...prev,gstin:e.target.value}))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700">
              Address
            </Label>
            <Textarea
              className="min-h-[90px] rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-emerald-500/70"
              placeholder="This will appear on purchase bills and invoices"
              value={payload.address}
              onChange={e=>setPayload(prev=>({...prev,address:e.target.value}))}
            />
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
            Where this appears
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            These details are shown to all linked retailers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-500">
          <ul className="list-disc space-y-1 pl-4">
            <li>Header of purchase order and tax invoice.</li>
            <li>Retailer order portal info (name, city and GSTIN).</li>
            <li>Shared with accounting / export modules.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
