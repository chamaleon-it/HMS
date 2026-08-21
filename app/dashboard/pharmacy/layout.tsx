"use client";
import React from 'react';
import RouteGuard from "@/components/RouteGuard";
import { DraftProvider } from './DraftContext';
import { DraftManager } from './DraftManager';


export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <DraftProvider>
      <RouteGuard allowedRoles={["Pharmacy"]}>
        {children}
      </RouteGuard>
      <DraftManager />
    </DraftProvider>
  );
}
