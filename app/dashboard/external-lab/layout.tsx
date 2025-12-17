import AppShell from "@/components/layout/app-shell";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AppShell>
            <div className="flex min-h-screen flex-col bg-slate-50">
                {/* Header removed as it might be handled per page or global header */}
                <div className="flex-1 p-6">{children}</div>
            </div>
        </AppShell>
    );
}
