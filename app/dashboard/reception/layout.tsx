"use client";
import React from 'react';
import { DraftProvider } from '@/app/dashboard/pharmacy/DraftContext';
import { DraftManager } from '@/app/dashboard/pharmacy/DraftManager';

export default function ReceptionLayout({ children }: { children: React.ReactNode }) {
  return (
    <DraftProvider>
      {children}
      <DraftManager />
    </DraftProvider>
  );
}
