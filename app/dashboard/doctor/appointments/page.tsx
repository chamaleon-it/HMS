"use client";

import React, { useState } from "react";

import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import AppShell from "@/components/layout/app-shell";
import Calendar from "./Calender";
import List from "./List";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateAppointmentForm } from "./CreateAppointmentForm";
import Statistics from "./Statistics";
import Filter from "./Filter";
import Drawer from "@/components/ui/drawer";

export default function AppointmentPage() {
  const [query, setQuery] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <AppShell>
      <div className="p-5 min-h-[calc(100vh-80px)]">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6" />
            <h1 className="text-xl md:text-2xl font-semibold">Appointments</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setOpenCreate(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create
            </Button>
          </div>
        </header>

        {/* Filters Row */}
        <Filter
          activeStatuses={activeStatuses}
          query={query}
          setActiveStatuses={setActiveStatuses}
          setQuery={setQuery}
        />

        {/* Stats Row */}
        <Statistics />

        {/* Tabs: List / Calendar */}
        <div className="mt-2">
          <Tabs defaultValue="list" className="flex-1 overflow-hidden">
            <TabsList className="mb-4">
              <TabsTrigger value="list" className="cursor-pointer">
                List
              </TabsTrigger>
              <TabsTrigger value="calendar" className="cursor-pointer">
                Calendar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <List query={query} activeStatuses={activeStatuses} />
            </TabsContent>
            <TabsContent value="calendar">
              <Calendar />
            </TabsContent>
          </Tabs>
        </div>

        <Drawer
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          title="Create Appointment"
        >
          <CreateAppointmentForm onClose={() => setOpenCreate(false)} />
        </Drawer>
      </div>
    </AppShell>
  );
}
