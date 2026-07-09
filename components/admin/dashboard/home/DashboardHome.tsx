"use client";

import React from "react";
import Statistics from "./Statistics";
import Analytics from "./Analytics";

import AdminHeader from "@/app/dashboard/admin/components/AdminHeader";

export default function AdminDashboardHome() {
    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen bg-gray-50/50">
            <AdminHeader 
                title="Hospital Administration"
                subtitle="Comprehensive overview of all hospital operations, staff attendance, financials, and clinical analytics."
            />

            <Statistics />

            <Analytics />


        </div>
    );
}
