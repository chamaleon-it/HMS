"use client";

import ExternalLabTable from "@/components/dashboard/external-lab/Home/ExternalLabTable";
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const MOCK_REPORTS = [
    {
        id: "301",
        patientName: "Ellen Ripley",
        patientMrn: "MRN-2023-042",
        patientDob: new Date("1979-01-07"),
        patientGender: "Female",
        testName: "Full Body CT Scan",
        status: "In Progress",
        createdAt: new Date("2023-10-24T14:00:00"),
        labName: "City Diagnostics",
        sentAt: "2023-10-24 04:00 PM"
    },
    {
        id: "302",
        patientName: "Marty McFly",
        patientMrn: "MRN-2023-055",
        patientDob: new Date("1985-06-12"),
        patientGender: "Male",
        testName: "Thyroid Antibody Panel",
        status: "Completed",
        createdAt: new Date("2023-10-23T09:00:00"),
        labName: "Sunrise Path Lab",
        sentAt: "2023-10-23 10:30 AM"
    },
    {
        id: "303",
        patientName: "Emmett Brown",
        patientMrn: "MRN-2023-001",
        patientDob: new Date("1955-11-05"),
        patientGender: "Male",
        testName: "Heavy Metal Toxicity",
        status: "In Progress",
        createdAt: new Date("2023-10-24T17:00:00"),
        labName: "HealthCheck Plus",
        sentAt: "2023-10-25 09:00 AM"
    }
];

export default function ReportsPage() {
    const [filter, setFilter] = useState("active");

    const filteredData = MOCK_REPORTS.filter(item => {
        if (filter === "active") return item.status === "In Progress";
        if (filter === "history") return item.status === "Completed";
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">External Reports</h2>
                    <p className="text-sm text-muted-foreground">Track active tests and view historical reports</p>
                </div>
            </div>

            <Tabs defaultValue="active" onValueChange={setFilter} className="w-full">
                <TabsList>
                    <TabsTrigger value="active">Active Tests</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
            </Tabs>

            <ExternalLabTable data={filteredData} mode="report" />
        </div>
    );
}
