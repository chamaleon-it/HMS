"use client";
import React from "react";
import { DraftProvider } from "./DraftContext";
import { DraftManager } from "./DraftManager";
import RequireRole from "@/components/auth/require-role";

export default function PharmacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole allowed={["Pharmacy", "Pharmacy Wholesaler", "Admin"]}>
      <DraftProvider>
        {children}
        <DraftManager />
      </DraftProvider>
    </RequireRole>
  );
}
