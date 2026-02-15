import { ClipboardCheck, ListChecks, UserRoundPlus, Users } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import useSWR from "swr";
import { cn } from "@/lib/utils";

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  colorClass: string;
  iconBgClass: string;
  borderClass: string;
  delay: number;
}> = ({ icon, label, value, colorClass, iconBgClass, borderClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
  >
    <Card className={cn(
      "relative overflow-hidden border-zinc-200/60 transition-all duration-300 shadow-sm hover:shadow-md",
      borderClass
    )}>
      <div className={cn("absolute inset-0 bg-linear-to-br opacity-50", colorClass)} />
      <div className="relative p-4 flex items-center gap-4">
        <div className={cn(
          "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border border-white/50 shrink-0",
          iconBgClass
        )}>
          {React.cloneElement(icon as any, { className: "h-6 w-6" })}
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900">{value}</div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default function Statistics() {
  const {
    data: appointmentStatisticsData,
  } = useSWR<{
    message: string;
    data: {
      completed: number;
      consulted: number;
      notShow: number;
      observation: number;
      today: number;
      upcoming: number;
      test: number;
      admit: number;
    };
  }>("/appointments/statistics");

  const appointmentStatistics = appointmentStatisticsData?.data ?? {
    completed: 0,
    consulted: 0,
    notShow: 0,
    observation: 0,
    today: 0,
    upcoming: 0,
  };

  const { data: patientsStatisticsData } =
    useSWR<{
      message: string;
      data: {
        total: number;
        today: number;
        thisWeek: number;
        thisMonth: number;
        male: number;
        female: number;
      };
    }>("/patients/statistics");

  const patientsStatistics = patientsStatisticsData?.data ?? {
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    male: 0,
    female: 0,
  };

  const statItems = [
    {
      label: "New Patients",
      value: patientsStatistics.today,
      icon: <UserRoundPlus />,
      color: "from-blue-500/10 to-blue-500/5",
      iconBg: "bg-blue-100 text-blue-600",
      border: "hover:border-blue-200",
    },
    {
      label: "Pending/Observation",
      value: appointmentStatistics.observation + appointmentStatistics.upcoming,
      icon: <ListChecks />,
      color: "from-purple-500/10 to-purple-500/5",
      iconBg: "bg-purple-100 text-purple-600",
      border: "hover:border-purple-200",
    },
    {
      label: "Completed",
      value: appointmentStatistics.completed + appointmentStatistics.consulted,
      icon: <ClipboardCheck />,
      color: "from-emerald-500/10 to-emerald-500/5",
      iconBg: "bg-emerald-100 text-emerald-600",
      border: "hover:border-emerald-200",
    },
    {
      label: "Total Today",
      value: appointmentStatistics.today,
      icon: <Users />,
      color: "from-amber-500/10 to-amber-500/5",
      iconBg: "bg-amber-100 text-amber-600",
      border: "hover:border-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      {statItems.map((item, i) => (
        <StatCard
          key={item.label}
          icon={item.icon}
          label={item.label}
          value={item.value}
          colorClass={item.color}
          iconBgClass={item.iconBg}
          borderClass={item.border}
          delay={i * 0.1}
        />
      ))}
    </div>
  );
}
