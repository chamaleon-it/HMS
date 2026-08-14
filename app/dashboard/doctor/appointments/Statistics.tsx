"use client";

import { Card } from "@/components/ui/card";
import {
  AlertTriangle,
  Bed,
  CalendarDays,
  Clock,
  FlaskConical,
  CheckCircle2,
} from "lucide-react";
import React from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STAT_CONFIG = {
  today: {
    label: "Today",
    icon: CalendarDays,
    color: "from-(--color-synapse-light)/10 to-blue-500/5",
    iconColor: "text-(--color-synapse-light)",
    iconBg: "bg-blue-100",
    border: "hover:border-blue-200",
  },
  upcoming: {
    label: "Upcoming",
    icon: Clock,
    color: "from-(--color-synapse-light)/10 to-(--color-synapse-purple)/5",
    iconColor: "text-(--color-synapse-light)",
    iconBg: "bg-synapse-light/20",
    border: "hover:border-synapse-light/30",
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
    color: "from-(--color-synapse-light)/10 to-(--color-synapse-purple)/5",
    iconColor: "text-(--color-synapse-light)",
    iconBg: "bg-[#FDF6ED]",
    border: "hover:border-synapse-light/30",
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 my-2">
      {statItems.map((item, idx) => {
        const config = STAT_CONFIG[item.key as keyof typeof STAT_CONFIG];
        return (
          <StatTile
            key={item.key}
            title={config.label}
            value={item.value}
            icon={<config.icon className={cn("h-4 w-4", config.iconColor)} />}
            colorClass={config.color}
            iconBgClass={config.iconBg}
            borderClass={config.border}
            delay={idx * 0.04}
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <Card
        className={cn(
          "relative overflow-hidden border-zinc-200/70 transition-all duration-200 shadow-2xs hover:shadow-sm rounded-xl",
          borderClass
        )}
      >
        <div className={cn("absolute inset-0 bg-linear-to-br opacity-50", colorClass)} />
        <div className="relative p-2.5">
          <div className="flex items-center justify-between gap-1 mb-1">
            <div
              className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center shadow-2xs border border-white/60 shrink-0",
                iconBgClass
              )}
            >
              {icon}
            </div>
            <div className="text-xl font-bold text-zinc-900 leading-none">
              {value ?? 0}
            </div>
          </div>
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider truncate">
            {title}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
