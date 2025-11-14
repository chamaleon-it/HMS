import DashboardLabHome from "@/components/dashboard/lab/Home/LabReport";
import AppShell from "@/components/layout/app-shell";
import React from "react";

export default function page() {
  return (
    <AppShell>
      <DashboardLabHome />
    </AppShell>
  );
}
