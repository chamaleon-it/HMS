"use client";

import React from "react";
import { Users, DollarSign, Stethoscope, UserCheck, Calendar, ShoppingBag, CreditCard, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/fNumber";

interface StatisticsProps {
  stats?: {
    totalRevenue?: number;
    totalCash?: number;
    totalOnline?: number;
    totalInsurance?: number;
    totalDoctors?: number;
    totalPharmacists?: number;
    totalTechnicians?: number;
    totalPatients?: number;
    totalAppointments?: number;
    totalBillsCount?: number;
  };
  isLoading?: boolean;
}

export default function Statistics({ stats, isLoading }: StatisticsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: stats?.totalRevenue ? formatINR(stats.totalRevenue) : "₹0",
      subText: `Cash: ${formatINR(stats?.totalCash || 0)} | Online: ${formatINR(stats?.totalOnline || 0)}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50/70 border-emerald-200/60",
      textColor: "text-emerald-900",
    },
    {
      title: "Total Invoices",
      value: stats?.totalBillsCount?.toString() || "0",
      subText: "Completed & processed bills",
      icon: CreditCard,
      gradient: "from-indigo-500 to-blue-600",
      bgLight: "bg-indigo-50/70 border-indigo-200/60",
      textColor: "text-indigo-900",
    },
    {
      title: "Active Doctors",
      value: stats?.totalDoctors?.toString() || "0",
      subText: "Registered medical staff",
      icon: Stethoscope,
      gradient: "from-cyan-500 to-blue-500",
      bgLight: "bg-cyan-50/70 border-cyan-200/60",
      textColor: "text-cyan-900",
    },
    {
      title: "Pharmacists & Techs",
      value: ((stats?.totalPharmacists || 0) + (stats?.totalTechnicians || 0)).toString(),
      subText: `${stats?.totalPharmacists || 0} Pharmacists • ${stats?.totalTechnicians || 0} Technicians`,
      icon: UserCheck,
      gradient: "from-purple-500 to-pink-600",
      bgLight: "bg-purple-50/70 border-purple-200/60",
      textColor: "text-purple-900",
    },
    {
      title: "Registered Patients",
      value: stats?.totalPatients?.toString() || "0",
      subText: "Total patient records",
      icon: Users,
      gradient: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50/70 border-amber-200/60",
      textColor: "text-amber-900",
    },
    {
      title: "Appointments",
      value: stats?.totalAppointments?.toString() || "0",
      subText: "All-time bookings",
      icon: Calendar,
      gradient: "from-rose-500 to-red-600",
      bgLight: "bg-rose-50/70 border-rose-200/60",
      textColor: "text-rose-900",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <Card
              className={`p-4.5 rounded-2xl border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full ${card.bgLight}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider">
                  {card.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-xs`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <div>
                {isLoading ? (
                  <div className="h-7 w-20 bg-slate-200 animate-pulse rounded my-1" />
                ) : (
                  <h3 className={`text-2xl font-bold tracking-tight ${card.textColor}`}>
                    {card.value}
                  </h3>
                )}
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  {card.subText}
                </p>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
