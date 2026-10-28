"use client";
import LabHeader from "../LabHeader";
import TestCatalogue from "@/app/dashboard/lab/settings/TestCatalogue";

export default function Inventory() {
    return (
        <div className="min-h-[calc(100vh-67px)] w-full bg-linear-to-b from-white to-zinc-50/50 p-6 space-y-6">
            <LabHeader
                title="Lab Catalogue"
                subtitle="Manage Tests and Panels."
            />

            <TestCatalogue />
        </div>
    );
}
