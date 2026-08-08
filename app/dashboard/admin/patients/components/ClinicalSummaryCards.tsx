"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  UserCheck,
  UserRound,
  Activity,
  ArrowUpRight,
} from "lucide-react";

interface SummaryData {
  totalPatients: number;
  newPatientsCount: number;
  returningPatientsCount: number;
  malePatientsCount: number;
  femalePatientsCount: number;
  activeInPatientsCount: number;
  dischargedInPatientsCount: number;
  totalVisits: number;
}

interface ClinicalSummaryCardsProps {
  summary?: SummaryData;
  isLoading?: boolean;
}

export function ClinicalSummaryCards({ summary, isLoading }: ClinicalSummaryCardsProps) {
  const total = summary?.totalPatients || 0;
  const newPts = summary?.newPatientsCount || 0;
  const returning = summary?.returningPatientsCount || 0;
  const male = summary?.malePatientsCount || 0;
  const female = summary?.femalePatientsCount || 0;
  const activeIp = summary?.activeInPatientsCount || 0;
  const dischargedIp = summary?.dischargedInPatientsCount || 0;
  const totalVisits = summary?.totalVisits || 0;

  const malePercent = total > 0 ? Math.round((male / total) * 100) : 0;
  const femalePercent = total > 0 ? Math.round((female / total) * 100) : 0;

  const cards = [
    {
      label: "Total Patients",
      value: total.toLocaleString(),
      subtext: `${totalVisits.toLocaleString()} period visits`,
      icon: Users,
      badgeText: "Registered",
      badgeColor: "bg-blue-500/10 text-blue-700 border-blue-200/80",
      gradient: "from-blue-50/60 via-white to-blue-50/20 border-blue-200/60",
      iconBg: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20",
    },
    {
      label: "New Patients",
      value: newPts.toLocaleString(),
      subtext: `${totalVisits > 0 ? Math.round((newPts / totalVisits) * 100) : 0}% of period visits`,
      icon: UserPlus,
      badgeText: "First Visit",
      badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-200/80",
      gradient: "from-emerald-50/60 via-white to-emerald-50/20 border-emerald-200/60",
      iconBg: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
    },
    {
      label: "Returning Patients",
      value: returning.toLocaleString(),
      subtext: "Follow-up consultations",
      icon: UserCheck,
      badgeText: "Follow-ups",
      badgeColor: "bg-indigo-500/10 text-indigo-700 border-indigo-200/80",
      gradient: "from-indigo-50/60 via-white to-indigo-50/20 border-indigo-200/60",
      iconBg: "bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20",
    },
    {
      label: "Gender Ratio",
      value: `${male}M : ${female}F`,
      subtext: `${malePercent}% Male • ${femalePercent}% Female`,
      icon: UserRound,
      badgeText: "Demographics",
      badgeColor: "bg-purple-500/10 text-purple-700 border-purple-200/80",
      gradient: "from-purple-50/60 via-white to-purple-50/20 border-purple-200/60",
      iconBg: "bg-purple-500/10 text-purple-600 ring-1 ring-purple-500/20",
    },
    {
      label: "In-Patient Care",
      value: activeIp.toLocaleString(),
      subtext: `${dischargedIp} patients discharged`,
      icon: Activity,
      badgeText: "Active IP",
      badgeColor: "bg-amber-500/10 text-amber-700 border-amber-200/80",
      gradient: "from-amber-50/60 via-white to-amber-50/20 border-amber-200/60",
      iconBg: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const IconComponent = c.icon;
        return (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${c.gradient} p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.badgeColor}`}
                >
                  {c.badgeText}
                </span>
                <div className={`p-2 rounded-xl ${c.iconBg}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs font-semibold text-slate-500 tracking-tight">
                {c.label}
              </p>

              {isLoading ? (
                <div className="h-8 bg-slate-200/60 animate-pulse rounded-lg w-24 my-1" />
              ) : (
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight my-1">
                  {c.value}
                </h3>
              )}
            </div>

            <p className="text-[11px] font-medium text-slate-500 mt-2 truncate">
              {c.subtext}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
