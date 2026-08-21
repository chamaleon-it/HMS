"use client";
import React from "react";
import RouteGuard from "@/components/RouteGuard";
import { LabDraftProvider } from "./LabDraftContext";
import { LabDraftManager } from "@/components/dashboard/lab/Home/LabDraftManager";
import { useAuth } from "@/auth/context/auth-context";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <LabDraftProvider userId={user?._id ?? ""}>
      <RouteGuard allowedRoles={["Lab"]}>
        {children}
      </RouteGuard>
      <LabDraftManager />
    </LabDraftProvider>
  );
}
