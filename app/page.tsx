import AppShell from "@/components/layout/app-shell";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MiniLine } from "@/components/charts/mini-line";
import { MiniBar } from "@/components/charts/mini-bar";
import {
  BadgeIndianRupee,
  Briefcase,
  BriefcaseMedical,
  ClipboardClock,
  DollarSign,
  FolderClosed,
  PiggyBank,
  ScrollText,
  Users,
} from "lucide-react";
import { Donut } from "@/components/charts/donut";
import { DualLine } from "@/components/charts/dual-line";
import { MiniColumns } from "@/components/charts/mini-columns";
import { RightRail } from "@/components/right-rail"; // import right rail here
import { SchedulerWeek } from "@/components/scheduler/scheduler-week";
import WeekScheduler from "@/components/scheduler/week-scheduler";

export default function Page() {
  return (
    <AppShell>
      <h1 className="mb-1.5 text-2xl font-semibold">
        Welcome back, Mr. Nadir Sha
      </h1>
      <p className="mb-6">Monday, September 1, 2025</p>

      {/* Top stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Patients Today"
          value="932"
          icon={<BriefcaseMedical className="h-5 w-5" />}
          tone="violet"
        />
        <StatCard
          title="Pending Results"
          value="932"
          icon={<ClipboardClock className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          title="Prescriptions"
          value="932"
          icon={<ScrollText className="h-5 w-5" />}
          tone="blue"
        />
        <StatCard
          title="Revenue Today"
          value="932"
          icon={<BadgeIndianRupee className="h-5 w-5" />}
          tone="violet"
        />
      </div>

      <Card className="my-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WeekScheduler />
        </CardContent>
      </Card>

      {/* Visitors + KPI */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Visitors</CardTitle>
            <div className="text-3xl font-bold">345,678</div>
          </CardHeader>
          <CardContent>
            <MiniLine />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">
                Total Patients
              </div>
              <div className="text-xl font-semibold">345,678</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">New Patients</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">49</span>
                <Badge className="bg-emerald-500">Live</Badge>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Revenue Growth
              </div>
              <div className="text-emerald-600 font-semibold">+10%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Period</div>
              <div className="font-medium">Month</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bars row */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <CardContent className="pt-6">
            <MiniBar />
          </CardContent>
        </Card>
      </div>

      {/* Bottom: profile + stats + weekly */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Patients Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Donut />
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span>Male</span>
                <span>55%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Female</span>
                <span>45%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Other</span>
                <span>5%</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistic</CardTitle>
          </CardHeader>
          <CardContent>
            <DualLine />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Weekly</CardTitle>
            <div className="text-right text-xs">
              <div>
                This Week{" "}
                <span className="text-emerald-600 font-semibold">+20%</span>
              </div>
              <div>
                Last Week{" "}
                <span className="text-amber-600 font-semibold">+13%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MiniColumns />
          </CardContent>
        </Card>
      </div>

      {/* Reviews */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {["Belle Epoque", "Nagita Almania", "Esmeralda Striff"].map((n) => (
          <Card key={n}>
            <CardContent className="pt-6">
              <div className="mb-2 text-amber-500">★★★★★</div>
              <div className="text-sm text-muted-foreground">
                Sed eligendi facere repellendus. Sapien ipsum incidunt minima
                harum tenetur. At ab asperiores architecto repudiandae.
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
