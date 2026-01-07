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
import { TableSkeleton } from "../components/PharmacySkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import PharmacyHeader from "../components/PharmacyHeader";

const PharmacySettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("general");

  const { data: ProfileData, mutate: profileMutate, isLoading } = useSWR<{
    message: string;
    data: ProfileType;
  }>("/users/profile");
  const profile = ProfileData?.data;

  return (
    <AppShell>
      <div className="px-5 pt-5">

        <PharmacyHeader
          title="Settings"
          subtitle="Manage your profile, specialization, and security"
        />
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
        {isLoading ? (
          <>
            <div className="h-32 w-full rounded-2xl bg-white animate-pulse" />
            <TableSkeleton rows={8} columns={4} />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </AppShell>
  );
};

export default PharmacySettingsPage;
