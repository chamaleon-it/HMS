"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, FileCheck, TrendingUp, AlertCircle, Building2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ExternalLabTable from "@/components/dashboard/external-lab/Home/ExternalLabTable";
import React from "react";

// Mock combined data for overview
const RECENT_ORDERS = [
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
    },
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
        id: "301",
        patientName: "Ellen Ripley",
        patientMrn: "MRN-2023-042",
        patientDob: new Date("1979-01-07"),
        patientGender: "Female",
        testName: "Full Body CT Scan",
        status: "In Progress",
        createdAt: new Date("2023-10-24T14:00:00"),
        labName: "City Diagnostics",
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
    },

];

export default function ExternalLabOverview() {
    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">External Lab Dashboard</h1>
                    <p className="text-slate-500">Overview of outsourced diagnostics and partner performance.</p>
                </div>
                <div className="flex gap-3">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/external-lab/reports">View All Reports</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/external-lab/send-test">Send New Test</Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground mt-1">Waiting dispatch</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
                        <Activity className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground mt-1">At external labs</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed (Today)</CardTitle>
                        <FileCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-muted-foreground mt-1">Results received</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Turnaround</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24h</div>
                        <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area: Recent Orders & Partner Stats */}
            <div className="grid gap-6 md:grid-cols-7">

                {/* Recent Orders Table - Spans 5 columns */}
                <div className="col-span-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold tracking-tight">Recent Orders</h3>

                    </div>
                    <ExternalLabTable data={RECENT_ORDERS} mode="overview" />
                </div>

                {/* Side Panel: Partner Status & Alerts - Spans 2 columns */}
                <div className="col-span-2 space-y-6">
                    {/* Partner Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Building2 className="h-4 w-4" /> Partner Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Sunrise Path Lab</span>
                                <span className="flex items-center gap-1.5 text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Operational
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">City Diagnostics</span>
                                <span className="flex items-center gap-1.5 text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Operational
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm opacity-60">
                                <span className="font-medium">HealthCheck Plus</span>
                                <span className="flex items-center gap-1.5 text-amber-600 text-xs bg-amber-50 px-2 py-0.5 rounded-full">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Delays
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alerts */}
                    <Card className="bg-rose-50 border-rose-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-rose-700 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" /> Action Required
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-xs text-rose-600 space-y-2">
                                <li>• 2 Reports pending  48h</li>
                                <li>• 1 Validated report requires signature</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
