"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";
import { Shield, Lock, User } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import SecurityForm from "./SecurityForm";
import ProfileForm from "./ProfileForm";
import DoctorHeader from "../components/DoctorHeader";

export default function SettingsPage() {
  const [tab, setTab] = React.useState("profile");

  const tabs = [
    { key: "profile", label: "Profile", icon: User },
    { key: "security", label: "Security", icon: Lock },
  ];

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-67px)] bg-white p-5 space-y-5">
        <DoctorHeader
          title="Settings"
          subtitle="Manage your profile, specialization, and security"
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className=""
        >
          <Tabs value={tab} onValueChange={setTab}>
            <div className="mb-4 relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1">
              {tabs.map(({ key, label, icon: Icon }) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={
                      "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer w-1/2 text-center justify-center " +
                      (active ? "text-white" : "text-gray-700 hover:text-gray-900")
                    }
                    type="button"
                  >
                    {active && (
                      <motion.span
                        layoutId="settings-tab-indicator"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "linear-gradient(90deg,#4f46e5,#d946ef)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon size={16} /> {label}
                    </span>
                  </button>
                );
              })}
            </div>

            <SecurityForm />
            <ProfileForm />
          </Tabs>
        </motion.div>
      </div>
    </AppShell>
  );
}
