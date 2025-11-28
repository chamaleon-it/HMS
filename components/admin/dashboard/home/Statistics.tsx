import { Users, DollarSign, Activity, Calendar } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function Statistics() {
    // Mock data for admin dashboard
    const stats = [
        {
            title: "Total Users",
            value: "1,234",
            icon: Users,
            color: "text-blue-500",
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
            color: "text-purple-500",
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                    <Card className="p-6 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{stat.value}</h2>
                            <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
