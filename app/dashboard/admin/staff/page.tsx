"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import Pharmacist from "@/app/dashboard/pharmacy/settings/Pharmacist";
import Technician from "@/app/dashboard/lab/settings/Technician";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, Pill, FlaskConical } from "lucide-react";

export default function AdminStaffPage() {
  const [activeTab, setActiveTab] = useState<"pharmacists" | "technicians">("pharmacists");

  return (
    <AppShell>
      <div className="p-5 min-h-[calc(100vh-67px)] flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <h1 className="text-2xl font-bold text-slate-900">
                Staff Management
              </h1>
            </div>
            <p className="text-sm text-slate-500">
              Manage clinical support staff, licenses, credentials, designations, and In-Charge assignments
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/70">
            <button
              onClick={() => setActiveTab("pharmacists")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "pharmacists"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              Pharmacists
            </button>
            <button
              onClick={() => setActiveTab("technicians")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "technicians"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Lab Technicians
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          {activeTab === "pharmacists" ? (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Pharmacy Staff & In-Charge
                </h2>
                <p className="text-xs text-slate-500">
                  Register, update licenses, and set Pharmacist In-Charge
                </p>
              </div>
              <Pharmacist />
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Laboratory Technicians & In-Charge
                </h2>
                <p className="text-xs text-slate-500">
                  Register, update credentials, and set Laboratory Technician In-Charge
                </p>
              </div>
              <Technician />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
