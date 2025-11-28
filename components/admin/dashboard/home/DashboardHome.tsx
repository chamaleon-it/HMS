"use client";

import React from "react";
import Statistics from "./Statistics";
import Analytics from "./Analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminDashboardHome() {
    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen bg-gray-50/50">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of system performance and analytics.
                </p>
            </div>

            <Statistics />

            <Analytics />

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px]">
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    User {i} performed an action
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    2 minutes ago
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500">View Details</div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
