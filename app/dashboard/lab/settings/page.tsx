"use client";

import React, { useState } from "react";
import { Shield } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import General from "./General";
import Billing from "./Billing";
import Notifications from "./Notifications";
import Security from "./Security";
import { Badge } from "@/components/ui/badge";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import TopSummary from "./TopSummary";
import useSWR from "swr";
import { ProfileType } from "./interface";
import TestCatalogue from "./TestCatalogue";
import LabHeader from "@/components/dashboard/lab/LabHeader";
import Technician from "./Technician";

const LabSettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("general");

  const { data: ProfileData, mutate: profileMutate } = useSWR<{
    message: string;
    data: ProfileType;
  }>("/users/profile");
  const profile = ProfileData?.data;


  return (
    <AppShell>
      <div className="bg-white/70 backdrop-blur border-b p-5">
        <LabHeader
          title="Settings"
          subtitle="Manage your profile, specialization, and security"
          icon={<Shield className="h-5 w-5" />}
        >

        </LabHeader>
      </div>
      <div className="p-5 w-full">
        <AnimatedTabs
          options={[
            { label: "General", value: "general" },
            { label: "Billing", value: "billing" },
            { label: "Technicians", value: "technician" },
            { label: "Notifications", value: "notifications" },
            { label: "Security", value: "security" },
          ]}
          value={activeSection}
          onChange={setActiveSection}
          layoutId="settings-tabs"
          className="w-full grid grid-cols-5"
        />
      </div>
      <div className="flex flex-col gap-6 p-5 w-full text-slate-900">
        <TopSummary profile={profile} />
        {activeSection === "general" && (
          <General profile={profile} profileMutate={profileMutate} />
        )}
        {activeSection === "billing" && (
          <Billing profile={profile} profileMutate={profileMutate} />
        )}


        {activeSection === "technician" &&
          <Technician />
        }
        {activeSection === "notifications" && (
          <Notifications profile={profile} profileMutate={profileMutate} />
        )}
        {activeSection === "security" && <Security />}
      </div>
    </AppShell>
  );
};

export default LabSettingsPage;
