import Inventory from "@/components/dashboard/lab/Inventory/Inventory";
import AppShell from "@/components/layout/app-shell";
import React from "react";

export default function page() {
    return (
        <AppShell>
            <Inventory />
        </AppShell>
    );
}
