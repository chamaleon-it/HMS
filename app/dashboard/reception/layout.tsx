"use client";
import React from "react";
import { DraftProvider } from "@/app/dashboard/pharmacy/DraftContext";
import { DraftManager } from "@/app/dashboard/pharmacy/DraftManager";
import RequireRole from "@/components/auth/require-role";

export default function ReceptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole allowed={["Reception", "Admin"]}>
      <DraftProvider>
        {children}
        <DraftManager />
      </DraftProvider>
    </RequireRole>
  );
}
