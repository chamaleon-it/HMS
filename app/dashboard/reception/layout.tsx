"use client";
import React from 'react';
import RouteGuard from "@/components/RouteGuard";
import { DraftProvider } from '@/app/dashboard/pharmacy/DraftContext';
import { DraftManager } from '@/app/dashboard/pharmacy/DraftManager';

export default function ReceptionLayout({ children }: { children: React.ReactNode }) {
  return (
    <DraftProvider>
      <RouteGuard allowedRoles={["Reception"]}>
        {children}
      </RouteGuard>
      <DraftManager />
    </DraftProvider>
  );
}
