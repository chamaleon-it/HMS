import React from "react";
import { Users, Stethoscope, AlertCircle, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default function Statistics({
  statistics,
}: {
  statistics:
  | {
    total: number;
    active: number;
    inactive: number;
    critical: number;
    discharged: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    male: number;
    female: number;
  }
  | undefined;
}) {
  const statItems = [
    {
      label: "Total",
      value: statistics?.total ?? 0,
      icon: Users,
      color: "from-violet-500/10 to-violet-500/5",
      iconColor: "text-violet-600",
      iconBg: "bg-violet-100",
      border: "hover:border-violet-200",
    },
    {
      label: "Active",
      value: statistics?.active ?? 0,
      icon: Stethoscope,
      color: "from-emerald-500/10 to-emerald-500/5",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      border: "hover:border-emerald-200",
    },
    {
      label: "Critical",
      value: statistics?.critical ?? 0,
      icon: AlertCircle,
      color: "from-rose-500/10 to-rose-500/5",
      iconColor: "text-rose-600",
      iconBg: "bg-rose-100",
      border: "hover:border-rose-200",
    },
    {
      label: "Discharged",
      value: statistics?.discharged ?? 0,
      icon: LogOut,
      color: "from-blue-500/10 to-blue-500/5",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      border: "hover:border-blue-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, idx) => (
        <StatCard
          key={item.label}
          icon={<item.icon className={cn("h-5 w-5", item.iconColor)} />}
          label={item.label}
          value={item.value}
          colorClass={item.color}
          iconBgClass={item.iconBg}
          borderClass={item.border}
          delay={idx * 0.1}
        />
      ))}
    </div>
  );
}

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
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900">{value}</div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</div>
        </div>
      </div>
    </Card>
  </motion.div>
);
