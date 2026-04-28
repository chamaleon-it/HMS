"use client";
import React from "react";
import { LabDraftProvider } from "./LabDraftContext";
import { LabDraftManager } from "@/components/dashboard/lab/Home/LabDraftManager";
import { useAuth } from "@/auth/context/auth-context";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <LabDraftProvider userId={user?._id ?? ""}>
      {children}
      <LabDraftManager />
    </LabDraftProvider>
  );
}
