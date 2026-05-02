"use client";
import DashboardLabHome from "@/components/dashboard/lab/Home/LabReport";
import AppShell from "@/components/layout/app-shell";
import React from "react";
import { useAuth } from "@/auth/context/auth-context";

export default function LabPage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <DashboardLabHome />
    </AppShell>
  );
}
