"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import Statistics from "./Statistics";
import Analytics from "./Analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  Warehouse,
  Truck,
  CreditCard,
  UserCheck,
  FlaskConical,
  ClipboardList,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { formatINR } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";

export default function AdminDashboardHome() {
  const { data: response, isLoading } = useSWR<{
    message: string;
    data: {
      stats: any;
      monthlyAnalytics: any[];
      recentActivity: any[];
    };
  }>("/admin/stats");

  const stats = response?.data?.stats;
  const monthlyAnalytics = response?.data?.monthlyAnalytics;
  const recentActivity = response?.data?.recentActivity || [];

  const quickLinks = [
    {
      title: "Manage Doctors",
      desc: "Profiles, specializations & rounds",
      href: "/dashboard/admin/doctor",
      icon: Stethoscope,
      color: "from-blue-600 to-indigo-600",
    },
    {
      title: "Unified Billing",
      desc: "All Pharmacy & Lab transactions",
      href: "/dashboard/admin/billing",
      icon: CreditCard,
      color: "from-emerald-600 to-teal-600",
    },
    {
      title: "Pharmacy Inventory",
      desc: "Stock levels & expiry alerts",
      href: "/dashboard/admin/inventory",
      icon: Warehouse,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Suppliers Directory",
      desc: "Procurement & vendor records",
      href: "/dashboard/admin/suppliers",
      icon: Truck,
      color: "from-purple-600 to-pink-600",
    },
    {
      title: "Staff Management",
      desc: "Pharmacists & Technicians",
      href: "/dashboard/admin/staff",
      icon: UserCheck,
      color: "from-cyan-600 to-blue-600",
    },
    {
      title: "Lab Catalogue",
      desc: "Investigation tests & panels",
      href: "/dashboard/admin/lab-catalogue",
      icon: FlaskConical,
      color: "from-fuchsia-600 to-purple-600",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 min-h-[calc(100vh-67px)] bg-slate-50/50">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs text-indigo-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            HMS Central Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Real-time overview of hospital departments, revenue analytics, clinical staff, and inventory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer font-medium"
          >
            <Link href="/dashboard/admin/doctor">
              <Stethoscope className="w-4 h-4 mr-2" />
              Add Doctor
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/20 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-xs cursor-pointer"
          >
            <Link href="/dashboard/admin/billing">
              <CreditCard className="w-4 h-4 mr-2" />
              View Billing
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Statistics stats={stats} isLoading={isLoading} />

      {/* Charts */}
      <Analytics data={monthlyAnalytics} />

      {/* Quick Access & Recent Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access */}
        <Card className="rounded-2xl border-slate-200/80 shadow-xs lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Department Portals
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Direct access to administrative operational modules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 transition-all duration-200 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-2xs`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Invoices / Activity */}
        <Card className="rounded-2xl border-slate-200/80 shadow-xs lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Recent Invoices & Activity
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Latest transactions across Pharmacy and Lab departments
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-indigo-600 hover:text-indigo-700">
              <Link href="/dashboard/admin/billing">
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[340px] pr-3">
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    No recent billing activities recorded yet.
                  </div>
                ) : (
                  recentActivity.map((bill: any) => {
                    const totalAmt = (bill.cash || 0) + (bill.online || 0) + (bill.insurance || 0);
                    const isLab = bill.user?.role === "Lab";
                    return (
                      <div
                        key={bill._id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isLab
                                ? "bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200"
                                : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                            }`}
                          >
                            {isLab ? "LAB" : "PHR"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">
                                {bill.patient?.name || "Walk-in Patient"}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                #{bill.mrn}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {fDateandTime(bill.createdAt)} • Billed by {bill.user?.name || "Staff"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-900">
                            {formatINR(totalAmt)}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                              bill.status === "Completed"
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {bill.status || "Completed"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
