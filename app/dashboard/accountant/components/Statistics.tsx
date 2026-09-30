import {
    Users, DollarSign, Calendar, Stethoscope,
    Wallet, AlertTriangle, Activity
} from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import useSWR from "swr";
import { formatINR } from "@/lib/fNumber";

export default function Statistics() {
    const { data: statsData } = useSWR<{
        data: {
            totalPatients: number;
            totalDoctors: number;
            totalStaff: number;
            totalUsers: number;
            totalAppointments: number;
            todaysRevenue: number;
            monthlyRevenue: number;
            outstandingPayments: number;
            todaysAppointments: number;
            activeDoctors: number;
        }
    }>("/admin/dashboard/stats");

    const data = statsData?.data || {
        totalPatients: 0,
        totalDoctors: 0,
        todaysAppointments: 0,
        todaysRevenue: 0,
        monthlyRevenue: 0,
        outstandingPayments: 0,
    };

    const stats = [
        {
            title: "Total Users",
            value: "1,234",
            icon: Users,
            color: "text-(--color-synapse-light)",
            change: "+12% from last month",
        },
        {
            title: "Total Revenue",
            value: "$45,231",
            icon: DollarSign,
            color: "text-green-500",
            change: "+8% from last month",
        },
        {
            title: "Active Sessions",
            value: "345",
            icon: Activity,
            color: "text-(--color-synapse-light)",
            change: "+24% from last hour",
        },
        {
            title: "Appointments",
            value: "89",
            icon: Calendar,
            color: "text-yellow-600",
            change: "+4% from yesterday",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                    <Card className="p-4 flex flex-col justify-between h-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-1">{stat.title}</h3>
                            <div className={`p-1 rounded-lg bg-gray-50 dark:bg-gray-800 ${stat.color} bg-opacity-20`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{stat.value}</h2>
                            <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
