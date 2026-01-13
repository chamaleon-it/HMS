"use client";
import React, { useState } from "react";

import { Shield, User, Receipt, Boxes, Bell, ReceiptIndianRupee } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import General from "./General";
import Billing from "./Billing";
import Inventory from "./Inventory";
import Notifications from "./Notifications";
import Security from "./Security";
import { motion } from "framer-motion";
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
      <div className="px-5 pt-5">
        <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-100 rounded-full p-1 shadow-sm w-full">
          {[
            { key: "general", label: "General", icon: User },
            { key: "billing", label: "Billing", icon: ReceiptIndianRupee },
            { key: "inventory", label: "Inventory", icon: Boxes },
            { key: "notifications", label: "Notifications", icon: Bell },
            { key: "security", label: "Security", icon: Shield },
          ].map(({ key, label, icon: Icon }) => {
            const active = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={
                  "relative gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer flex-1 text-center justify-center items-center flex " +
                  (active ? "text-white" : "text-slate-600 hover:text-slate-900")
                }
                type="button"
              >
                {active && (
                  <motion.span
                    layoutId="settings-tab-indicator"
                    className="absolute inset-0 rounded-full"
                    style={{ background: "linear-gradient(90deg,#4f46e5,#d946ef)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2 font-medium">
                  <Icon size={16} /> {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-6 p-5 w-full text-slate-900">
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
