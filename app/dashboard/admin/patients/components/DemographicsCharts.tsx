"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";
import { Users, PieChart as PieIcon } from "lucide-react";

interface ItemValue {
  name: string;
  value: number;
}

interface DemographicsChartsProps {
  genderDistribution?: ItemValue[];
  ageDistribution?: ItemValue[];
  isLoading?: boolean;
}

const GENDER_COLORS = ["#3b82f6", "#ec4899"];
const AGE_COLORS = ["#10b981", "#8b5cf6", "#3b82f6", "#f59e0b"];

export function DemographicsCharts({
  genderDistribution = [],
  ageDistribution = [],
  isLoading,
}: DemographicsChartsProps) {
  const totalGender = genderDistribution.reduce((acc, curr) => acc + curr.value, 0);
  const totalAge = ageDistribution.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gender Distribution Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center ring-1 ring-purple-500/20">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Gender Distribution
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Male vs Female patient ratio ({totalGender} patients)
            </p>
          </div>
        </div>

        <div className="h-64 w-full relative">
          {isLoading ? (
            <div className="w-full h-full bg-slate-100/60 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-xs font-medium">
              Loading gender distribution...
            </div>
          ) : totalGender === 0 ? (
            <div className="w-full h-full bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center text-slate-400">
              <Users className="w-8 h-8 mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">No patient data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "14px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [
                    `${val} patients (${Math.round((Number(val) / Math.max(totalGender, 1)) * 100)}%)`,
                    "Count",
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs font-bold text-slate-700">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Age Group Distribution Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Age Group Distribution
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Children, Teens, Adults & Elderly breakdown
            </p>
          </div>
        </div>

        <div className="h-64 w-full relative">
          {isLoading ? (
            <div className="w-full h-full bg-slate-100/60 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-xs font-medium">
              Loading age demographics...
            </div>
          ) : totalAge === 0 ? (
            <div className="w-full h-full bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center text-slate-400">
              <Users className="w-8 h-8 mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">No patient data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {ageDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={AGE_COLORS[index % AGE_COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "14px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [
                    `${val} patients (${Math.round((Number(val) / Math.max(totalAge, 1)) * 100)}%)`,
                    "Count",
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs font-bold text-slate-700">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>
    </div>
  );
}
