"use client";
import React from 'react';
import { DraftProvider } from './DraftContext';
import { DraftManager } from './DraftManager';


export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <DraftProvider>
      {children}
      <DraftManager />
    </DraftProvider>
  );
}
