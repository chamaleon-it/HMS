"use client";
import DashboardLabHome from "@/components/dashboard/lab/Home/LabReport";
import AppShell from "@/components/layout/app-shell";
import React from "react";
import { LabDraftProvider } from "./LabDraftContext";
import { LabDraftManager } from "@/components/dashboard/lab/Home/LabDraftManager";
import { useAuth } from "@/auth/context/auth-context";

export default function LabPage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <LabDraftProvider userId={user?._id ?? ""}>
        <DashboardLabHome />
        <LabDraftManager />
      </LabDraftProvider>
    </AppShell>
  );
}
