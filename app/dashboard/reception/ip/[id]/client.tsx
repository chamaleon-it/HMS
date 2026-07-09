"use client";
import React from "react";
import AppShell from "@/components/layout/app-shell";

export default function IPDetailsClient({ id }: { id: string }) {
  return (
    <AppShell>
      <div className="p-5 flex flex-col gap-6 min-h-[calc(100vh-67px)]">
        <h1 className="text-2xl font-bold">In-Patient Details</h1>
        <p className="text-gray-500">Details for record ID: {id}</p>
      </div>
    </AppShell>
  );
}
