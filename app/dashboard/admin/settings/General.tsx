"use client";

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
import api from "@/lib/axios";
import { Save, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ProfileType } from "./interface";

export default function General({
  profile,
  profileMutate,
}: {
  profile?: ProfileType;
  profileMutate: () => void;
}) {
  const [payload, setPayload] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    hospital: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPayload({
      name: profile?.name ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
      email: profile?.email ?? "",
      hospital: profile?.hospital ?? "",
    });
  }, [profile]);

  const updateGeneralSettings = async () => {
    try {
      setLoading(true);
      await toast.promise(api.patch("/users", payload), {
        loading: "Updating profile...!",
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
    <div className="grid gap-6">
      <Card className="border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <User className="h-5 w-5" />
                </span>
                Admin Profile
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Basic details for your administrator account.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Full name
              </Label>
              <Input
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-sky-500/70"
                placeholder="Admin name"
                value={payload.name}
                onChange={(e) =>
                  setPayload((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">
                Clinic / Hospital
              </Label>
              <Input
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-sky-500/70"
                placeholder="Clinic name"
                value={payload.hospital}
                onChange={(e) =>
                  setPayload((prev) => ({ ...prev, hospital: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">Phone</Label>
              <Input
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-sky-500/70"
                placeholder="+91 …"
                value={payload.phoneNumber}
                onChange={(e) =>
                  setPayload((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">Email</Label>
              <Input
                type="email"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-sky-500/70"
                placeholder="admin@clinic.com"
                value={payload.email}
                onChange={(e) =>
                  setPayload((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
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
    </div>
  );
}
