"use client";

import React, { useState } from "react";
import { Shield, User } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import useSWR from "swr";
import General from "./General";
import Security from "./Security";
import TopSummary from "./TopSummary";
import { ProfileType } from "./interface";

const AdminSettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("general");

  const { data: ProfileData, mutate: profileMutate } = useSWR<{
    message: string;
    data: ProfileType;
  }>("/users/profile");
  const profile = ProfileData?.data;

  return (
    <AppShell>
      <div className="p-5 min-h-[calc(100vh-67px)] flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            </div>
            <p className="text-sm text-slate-500">
              Manage your admin profile and security
            </p>
          </div>
        </div>

        <AnimatedTabs
          options={[
            { label: "General", value: "general", icon: User },
            { label: "Security", value: "security", icon: Shield },
          ]}
          value={activeSection}
          onChange={setActiveSection}
          layoutId="admin-settings-tabs"
          className="w-full grid grid-cols-2"
        />

        <div className="flex flex-col gap-6 w-full text-slate-900">
          <TopSummary profile={profile} />
          {activeSection === "general" && (
            <General profile={profile} profileMutate={profileMutate} />
          )}
          {activeSection === "security" && <Security />}
        </div>
      </div>
    </AppShell>
  );
};

export default AdminSettingsPage;
