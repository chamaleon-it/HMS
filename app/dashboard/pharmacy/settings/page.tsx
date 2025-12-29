"use client";

import React, { useState } from "react";
import { Shield } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import General from "./General";
import Billing from "./Billing";
import Inventory from "./Inventory";
import Notifications from "./Notifications";
import Security from "./Security";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import TopSummary from "./TopSummary";
import useSWR from "swr";
import { ProfileType } from "./interface";

const PharmacySettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("general");

  const { data: ProfileData, mutate: profileMutate } = useSWR<{
    message: string;
    data: ProfileType;
  }>("/users/profile");
  const profile = ProfileData?.data;

  return (
    <AppShell>
      <div className="bg-white/70 backdrop-blur border-b ">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5" />
            <div>
              <h1 className="text-xl font-semibold">Settings</h1>
              <p className="text-xs text-muted-foreground">
                Manage your profile, specialization, and security
              </p>
            </div>
          </div>
          {/* <div className="hidden md:flex items-center gap-2">
            <Badge className="bg-emerald-600 text-white">Mark Hospital</Badge>
            <Badge variant="secondary">HIPAA-ready</Badge>
            <Badge variant="outline">ISO 27001-minded</Badge>
          </div> */}
        </div>
      </div>
      <Tabs
        value={activeSection}
        onValueChange={setActiveSection}
        className="p-5"
      >
        <TabsList className="grid grid-cols-5 w-full bg-white rounded-xl p-1 shadow-sm border h-12 items-stretch">
          <TabsTrigger
            value="general"
            className="gap-2 rounded-lg flex items-center justify-center h-10 w-full text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:ring-1 data-[state=active]:ring-slate-200 hover:bg-slate-50 transition"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="gap-2 rounded-lg flex items-center justify-center h-10 w-full text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:ring-1 data-[state=active]:ring-slate-200 hover:bg-slate-50 transition"
          >
            Billing
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="gap-2 rounded-lg flex items-center justify-center h-10 w-full text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:ring-1 data-[state=active]:ring-slate-200 hover:bg-slate-50 transition"
          >
            Inventory
          </TabsTrigger>

          <TabsTrigger
            value="notifications"
            className="gap-2 rounded-lg flex items-center justify-center h-10 w-full text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:ring-1 data-[state=active]:ring-slate-200 hover:bg-slate-50 transition"
          >
            Notifications
          </TabsTrigger>

          <TabsTrigger
            value="security"
            className="gap-2 rounded-lg flex items-center justify-center h-10 w-full text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:ring-1 data-[state=active]:ring-slate-200 hover:bg-slate-50 transition"
          >
            Security
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex flex-col gap-6 p-5 w-full bg-slate-50 text-slate-900">
        <TopSummary profile={profile} />
        {activeSection === "general" && (
          <General profile={profile} profileMutate={profileMutate} />
        )}
        {activeSection === "billing" && (
          <Billing profileMutate={profileMutate} profile={profile} />
        )}
        {activeSection === "inventory" && (
          <Inventory profileMutate={profileMutate} profile={profile} />
        )}
        {activeSection === "notifications" && (
          <Notifications profileMutate={profileMutate} profile={profile} />
        )}
        {activeSection === "security" && <Security />}
      </div>
    </AppShell>
  );
};

export default PharmacySettingsPage;
