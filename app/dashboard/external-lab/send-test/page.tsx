"use client";

import ExternalLabTable from "@/components/dashboard/external-lab/Home/ExternalLabTable";
import React from "react";
import { Send } from "lucide-react";

// Mock data for pending tests
const PENDING_TESTS = [
    {
        id: "201",
        patientName: "Michael Brown",
        patientMrn: "MRN-2023-089",
        patientDob: new Date("1980-05-12"),
        patientGender: "Male",
        testName: "MRI Brain Contrast",
        status: "Pending",
        createdAt: new Date("2023-10-25T09:30:00"),
    },
    {
        id: "202",
        patientName: "Sarah Connor",
        patientMrn: "MRN-2023-090",
        patientDob: new Date("1984-08-20"),
        patientGender: "Female",
        testName: "Genetic Screening Panel",
        status: "Pending",
        createdAt: new Date("2023-10-25T10:15:00"),
    },
    {
        id: "203",
        patientName: "Rick Deckard",
        patientMrn: "MRN-2023-091",
        patientDob: new Date("1970-03-15"),
        patientGender: "Male",
        testName: "Advanced Lipid Profile",
        status: "Pending",
        createdAt: new Date("2023-10-25T11:00:00"),
    }
];

export default function SendTestPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Pending Orders</h2>
                    <p className="text-sm text-muted-foreground">Select tests and assign them to external lab partners</p>
                </div>
            </div>

            <ExternalLabTable data={PENDING_TESTS} mode="send" />
        </div>
    );
}
