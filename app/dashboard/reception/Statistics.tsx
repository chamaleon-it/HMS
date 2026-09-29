import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CalendarRange,
  UserPlus,
  Users,
  UserRound,
  CalendarCheck,
} from "lucide-react";
import React from "react";
import useSWR from "swr";
import { motion } from "framer-motion";

const STAT_CONFIG = {
  todayNewPatient: {
    label: "Today new patient",
    icon: UserPlus,
    color: "from-(--color-synapse-light)/10 to-blue-500/5",
    iconColor: "text-(--color-synapse-light)",
    iconBg: "bg-blue-100",
    border: "hover:border-blue-200",
  },
  todayAppointment: {
    label: "Today appointment",
    icon: CalendarDays,
    color: "from-(--color-synapse-light)/10 to-(--color-synapse-purple)/5",
    iconColor: "text-(--color-synapse-light)",
    iconBg: "bg-synapse-light/20",
    border: "hover:border-synapse-light/30",
  },
  monthNewPatient: {
    label: "This month new patient",
    icon: UserRound,
    color: "from-emerald-500/10 to-emerald-500/5",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
    border: "hover:border-emerald-200",
  },
  monthAppointment: {
    label: "This month appointment",
    icon: CalendarRange,
    color: "from-amber-500/10 to-amber-500/5",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
    border: "hover:border-amber-200",
  },
  totalPatient: {
    label: "Total patient",
    icon: Users,
    color: "from-cyan-500/10 to-cyan-500/5",
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-100",
    border: "hover:border-cyan-200",
  },
  totalAppointment: {
    label: "Total appointment",
    icon: CalendarCheck,
    color: "from-(--color-synapse-light)/10 to-(--color-synapse-purple)/5",
    iconColor: "text-(--color-synapse-light)",
    iconBg: "bg-[#FDF6ED]",
    border: "hover:border-synapse-light/30",
  },
} as const;

type StatKey = keyof typeof STAT_CONFIG;

export default function Statistics() {
  const { data: appointmentResponse } = useSWR<{
    message: string;
    data: {
      today: number;
      thisMonth: number;
      total: number;
    };
  }>("/appointments/statistics");

  const { data: patientsResponse } = useSWR<{
    message: string;
    data: {
      today: number;
      thisMonth: number;
      total: number;
    };
  }>("/patients/statistics");

  const appointments = appointmentResponse?.data;
  const patients = patientsResponse?.data;

  const statItems: { key: StatKey; value: number | undefined }[] = [
    { key: "todayNewPatient", value: patients?.today },
    { key: "todayAppointment", value: appointments?.today },
    { key: "monthNewPatient", value: patients?.thisMonth },
    { key: "monthAppointment", value: appointments?.thisMonth },
    { key: "totalPatient", value: patients?.total },
    { key: "totalAppointment", value: appointments?.total },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
      {statItems.map((item, idx) => {
        const config = STAT_CONFIG[item.key];
        return (
          <StatTile
            key={item.key}
            title={config.label}
            value={item.value}
            icon={<config.icon className={cn("h-4.5 w-4.5", config.iconColor)} />}
            colorClass={config.color}
            iconBgClass={config.iconBg}
            borderClass={config.border}
            delay={idx * 0.05}
          />
        );
      })}
    </div>
  );
}

function StatTile({
  title,
  value,
  icon,
  colorClass,
  iconBgClass,
  borderClass,
  delay,
}: {
  title: string;
  value: string | number | undefined;
  icon: React.ReactNode;
  colorClass: string;
  iconBgClass: string;
  borderClass: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className={cn(
        "relative overflow-hidden border-zinc-200/60 transition-all duration-300 shadow-xs hover:shadow-xs",
        borderClass
      )}>
        <div className={cn("absolute inset-0 bg-linear-to-br opacity-50", colorClass)} />
        <div className="relative p-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-8.5 w-8.5 rounded-lg flex items-center justify-center shadow-xs border border-white/40 shrink-0",
              iconBgClass
            )}>
              {icon}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider truncate">{title}</div>
              <div className="text-xl font-bold text-zinc-900 mt-0.5 leading-none">
                {value ?? 0}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
