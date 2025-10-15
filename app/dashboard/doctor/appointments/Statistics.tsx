import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock } from "lucide-react";
import React from "react";
import useSWR from "swr";

export default function Statistics() {
  const { data } = useSWR<{
    message: string;
    data: {
      today: number;
      upcoming: number;
      consulted: number;
      observation: number;
      completed: number;
      notShow: number;
    };
  }>("/appointments/statistics");
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 my-4">
      <StatTile
        title="Today"
        value={data?.data.today}
        icon={<CalendarDays className="h-4 w-4" />}
      />
      <StatTile
        title="Upcoming"
        value={data?.data.upcoming}
        icon={<Clock className="h-4 w-4" />}
      />
      <StatTile
        title="Consulted"
        value={data?.data.consulted}
        icon={<Clock className="h-4 w-4" />}
      />
      <StatTile
        title="observation"
        value={data?.data.observation}
        icon={<Clock className="h-4 w-4" />}
      />
      <StatTile
        title="Completed"
        value={data?.data.completed}
        icon={<CheckCircle2 className="h-4 w-4" />}
      />
      <StatTile
        title="No Show"
        value={data?.data.notShow}
        icon={<AlertTriangle className="h-4 w-4" />}
      />
    </div>
  );
}

function StatTile({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number | undefined;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-500">{title}</div>
            <div className="text-2xl font-semibold mt-1">{value}</div>
          </div>
          <div className="h-10 w-10 rounded-2xl grid place-items-center bg-gradient-to-br from-zinc-100 to-white border border-zinc-200">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
