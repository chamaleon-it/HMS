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
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    whileHover={{ y: -2, transition: { duration: 0.2 } }}
  >
    <Card className={cn(
      "relative overflow-hidden border-slate-200/70 transition-all duration-200 shadow-2xs hover:shadow-xs rounded-xl",
      borderClass
    )}>
      <div className={cn("absolute inset-0 bg-linear-to-br opacity-40", colorClass)} />
      <div className="relative px-3.5 py-2.5 flex items-center gap-3">
        <div className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center border border-white/60 shrink-0 shadow-2xs",
          iconBgClass
        )}>
          {React.cloneElement(icon as any, { className: "h-4 w-4" })}
        </div>
        <div className="min-w-0 flex-1 flex items-baseline justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{label}</div>
          </div>
          <div className="text-lg font-bold tracking-tight text-slate-900 leading-none">{value}</div>
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
      color: "from-(--color-synapse-light)/10 to-blue-500/5",
      iconBg: "bg-blue-100 text-(--color-synapse-light)",
      border: "hover:border-blue-200",
    },
    {
      label: "Pending",
      value: appointmentStatistics.observation + appointmentStatistics.upcoming,
      icon: <ListChecks />,
      color: "from-(--color-synapse-light)/10 to-(--color-synapse-purple)/5",
      iconBg: "bg-[#FDF6ED] text-(--color-synapse-light)",
      border: "hover:border-synapse-light/30",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-6 pt-4 pb-2">
      {statItems.map((item, i) => (
        <StatCard
          key={item.label}
          icon={item.icon}
          label={item.label}
          value={item.value}
          colorClass={item.color}
          iconBgClass={item.iconBg}
          borderClass={item.border}
          delay={i * 0.05}
        />
      ))}
    </div>
  );
}
