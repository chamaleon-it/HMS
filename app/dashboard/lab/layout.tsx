"use client";
import React from "react";
import { LabDraftProvider } from "./LabDraftContext";
import { LabDraftManager } from "@/components/dashboard/lab/Home/LabDraftManager";
import { useAuth } from "@/auth/context/auth-context";
import RequireRole from "@/components/auth/require-role";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <RequireRole allowed={["Lab", "Admin"]}>
      <LabDraftProvider userId={user?._id ?? ""}>
        {children}
        <LabDraftManager />
      </LabDraftProvider>
    </RequireRole>
  );
}
