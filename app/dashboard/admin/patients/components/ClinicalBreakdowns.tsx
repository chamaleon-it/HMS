"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Pill,
  Sparkles,
  FlaskConical,
  Stethoscope,
  Building2,
  ChevronRight,
} from "lucide-react";

interface RankItem {
  name: string;
  count: number;
}

interface DoctorRankItem {
  doctorName: string;
  count: number;
}

interface ClinicalBreakdownsProps {
  topComplaints?: RankItem[];
  topMedicines?: RankItem[];
  topTherapies?: RankItem[];
  topLabTests?: RankItem[];
  doctorStats?: DoctorRankItem[];
  departmentStats?: RankItem[];
  isLoading?: boolean;
}

export function ClinicalBreakdowns({
  topComplaints = [],
  topMedicines = [],
  topTherapies = [],
  topLabTests = [],
  doctorStats = [],
  departmentStats = [],
  isLoading,
}: ClinicalBreakdownsProps) {
  const renderRankingList = (
    title: string,
    subtitle: string,
    icon: React.ElementType,
    badgeColor: string,
    barColor: string,
    items: { name: string; count: number }[]
  ) => {
    const Icon = icon;
    const maxVal = items.length > 0 ? Math.max(...items.map((i) => i.count)) : 1;

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-2xl ${badgeColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  {title}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="animate-pulse space-y-1">
                  <div className="h-3 bg-slate-100 rounded-md w-3/4" />
                  <div className="h-2 bg-slate-100 rounded-md w-full" />
                </div>
              ))
            ) : items.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                No recorded records in period
              </div>
            ) : (
              items.map((item, idx) => {
                const percent = Math.round((item.count / maxVal) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800 truncate max-w-[200px] flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        {item.name}
                      </span>
                      <span className="font-bold text-slate-900 font-mono">
                        {item.count} <span className="text-[10px] text-slate-400 font-normal">nos</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.max(percent, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* 1. Top Complaints / Diseases */}
      {renderRankingList(
        "Top Diseases & Complaints",
        "Most frequent diagnoses treated",
        Activity,
        "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20",
        "bg-gradient-to-r from-rose-500 to-pink-500",
        topComplaints
      )}

      {/* 2. Most Prescribed Medicines */}
      {renderRankingList(
        "Most Prescribed Medicines",
        "Top medications ordered in period",
        Pill,
        "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20",
        "bg-gradient-to-r from-blue-500 to-cyan-500",
        topMedicines
      )}

      {/* 3. Most Performed Therapies */}
      {renderRankingList(
        "Most Performed Therapies",
        "Top prescribed therapy procedures",
        Sparkles,
        "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20",
        "bg-gradient-to-r from-amber-500 to-yellow-500",
        topTherapies
      )}

      {/* 4. Most Requested Lab Tests */}
      {renderRankingList(
        "Most Requested Lab Tests",
        "Top diagnostic tests & panels",
        FlaskConical,
        "bg-purple-500/10 text-purple-600 ring-1 ring-purple-500/20",
        "bg-gradient-to-r from-purple-500 to-indigo-500",
        topLabTests
      )}

      {/* 5. Doctor-wise Patient Count */}
      {renderRankingList(
        "Doctor-wise Patients",
        "Patient consultations per doctor",
        Stethoscope,
        "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
        "bg-gradient-to-r from-emerald-500 to-teal-500",
        doctorStats.map((d) => ({ name: d.doctorName, count: d.count }))
      )}

      {/* 6. Department / Treatment-wise Stats */}
      {renderRankingList(
        "Department Breakdown",
        "OP, Therapies, Lab & IP distribution",
        Building2,
        "bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20",
        "bg-gradient-to-r from-indigo-500 to-purple-500",
        departmentStats
      )}
    </div>
  );
}
