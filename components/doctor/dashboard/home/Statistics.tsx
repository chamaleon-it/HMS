import {
  ClipboardCheck,
  IndianRupee,
  ListChecks,
  UserRoundPlus,
  Users,
} from "lucide-react";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import useSWR from "swr";

export default function Statistics() {
  const { data: appointmentStatisticsData,mutate:appointmentStatisticsMutate } = useSWR<{
    message: string;
    data: {
      completed: number;
      consulted: number;
      notShow: number;
      observation: number;
      today: number;
      upcoming: number;
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

  const { data: patientsStatisticsData,mutate:patientsStatisticsMutate } = useSWR<{
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

 

  useEffect(() => {
    
  appointmentStatisticsMutate()
  patientsStatisticsMutate()
  }, [])
  

  return (
    <div className="grid grid-cols-4 gap-4 p-6">
      {[
        {
          title: "New Patients",
          value: patientsStatistics.today,
          icon: UserRoundPlus,
          color: "text-blue-500",
        },
        {
          title: "Pending/Observation",
          value:
            appointmentStatistics.observation + appointmentStatistics.upcoming,
          icon: ListChecks,
          color: "text-purple-500",
        },
        {
          title: "Completed",
          value:
            appointmentStatistics.completed + appointmentStatistics.consulted,
          icon: ClipboardCheck,
          color: "text-green-500",
        },
        {
          title: "Total",
          value: appointmentStatistics.today,
          icon: Users,
          color: "text-yellow-600",
        },
      ].map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <Card className="p-4 flex items-center justify-between text-center">
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <h2 className="text-2xl font-bold">{stat.value}</h2>
            </div>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
