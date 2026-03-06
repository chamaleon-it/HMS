import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Bed,
  CalendarDays,
  CheckCircle2,
  Clock,
  FlaskConical,
} from "lucide-react";
import React from "react";
import useSWR from "swr";
import { motion } from "framer-motion";

const STAT_CONFIG = {
  today: {
    label: "Today",
    icon: CalendarDays,
    color: "from-blue-500/10 to-blue-500/5",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    border: "hover:border-blue-200",
  },
  upcoming: {
    label: "Upcoming",
    icon: Clock,
    color: "from-indigo-500/10 to-indigo-500/5",
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-100",
    border: "hover:border-indigo-200",
  },
  consulted: {
    label: "Consulted",
    icon: CheckCircle2,
    color: "from-emerald-500/10 to-emerald-500/5",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
    border: "hover:border-emerald-200",
  },
  observation: {
    label: "Observation",
    icon: Clock,
    color: "from-amber-500/10 to-amber-500/5",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
    border: "hover:border-amber-200",
  },
  test: {
    label: "Send to test",
    icon: FlaskConical,
    color: "from-purple-500/10 to-purple-500/5",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    border: "hover:border-purple-200",
  },
  admit: {
    label: "Admit",
    icon: Bed,
    color: "from-cyan-500/10 to-cyan-500/5",
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-100",
    border: "hover:border-cyan-200",
  },
  notShow: {
    label: "No Show",
    icon: AlertTriangle,
    color: "from-rose-500/10 to-rose-500/5",
    iconColor: "text-rose-600",
    iconBg: "bg-rose-100",
    border: "hover:border-rose-200",
  },
};

export default function Statistics() {
  const { data: response } = useSWR<{
    message: string;
    data: {
      today: number;
      upcoming: number;
      consulted: number;
      observation: number;
      completed: number;
      test: number;
      admit: number;
      notShow: number;
    };
  }>("/appointments/statistics");

  const stats = response?.data;

  const statItems = [
    { key: "today", value: stats?.today },
    { key: "upcoming", value: stats?.upcoming },
    { key: "consulted", value: stats?.consulted },
    { key: "observation", value: stats?.observation },
    { key: "test", value: stats?.test },
    { key: "admit", value: stats?.admit },
    { key: "notShow", value: stats?.notShow },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-4">
      {statItems.map((item, idx) => {
        const config = STAT_CONFIG[item.key as keyof typeof STAT_CONFIG];
        return (
          <StatTile
            key={item.key}
            title={config.label}
            value={item.value}
            icon={<config.icon className={cn("h-5 w-5", config.iconColor)} />}
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className={cn(
        "relative overflow-hidden border-zinc-200/60 transition-all duration-300 shadow-sm hover:shadow-md py-2.5!",
        borderClass
      )}>
        <div className={cn("absolute inset-0 bg-linear-to-br opacity-50", colorClass)} />
        <div className="relative p-4">
          <div className="flex flex-col gap-3">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border border-white/50",
              iconBgClass
            )}>
              {icon}
            </div>
            <div>
              <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{title}</div>
              <div className="text-2xl font-bold mt-0.5 text-zinc-900">
                {value ?? 0}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
