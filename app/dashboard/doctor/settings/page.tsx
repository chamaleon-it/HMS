"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";
import { Shield, Lock, User } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import SecurityForm from "./SecurityForm";
import ProfileForm from "./ProfileForm";

export default function SettingsPage() {
  const [tab, setTab] = React.useState("profile");

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-80px)] bg-white">
        <div className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" />
              <div>
                <h1 className="text-xl font-semibold">Settings</h1>
                <p className="text-xs text-muted-foreground">
                  Manage your profile, specialization, and security
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white">Mark Hospital</Badge>
              <Badge variant="secondary">HIPAA-ready</Badge>
              <Badge variant="outline">ISO 27001-minded</Badge>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="px-4 py-6"
        >
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 w-full bg-white rounded-xl p-1 shadow-sm border h-12 items-stretch">
              <TabsTrigger
                value="profile"
                className="gap-2 rounded-lg flex items-center justify-center h-10 w-full text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:ring-1 data-[state=active]:ring-slate-200 hover:bg-slate-50 transition"
              >
                <User className="h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="gap-2 rounded-lg flex items-center justify-center h-10 w-full text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:ring-1 data-[state=active]:ring-slate-200 hover:bg-slate-50 transition"
              >
                <Lock className="h-4 w-4" /> Security
              </TabsTrigger>
            </TabsList>

            <SecurityForm />
            <ProfileForm />
          </Tabs>
        </motion.div>
      </div>
    </AppShell>
  );
}
