"use client";

import { format, addDays, isSameDay } from "date-fns";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

import { Plus, CalendarDays, Clock, FlaskConical, Bed, AlertTriangle, CheckCircle2 } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import Calendar from "./Calender";
import List from "./List";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { CreateAppointmentForm } from "./CreateAppointmentForm";
import Statistics from "./Statistics";
import Filter, { STATUSES } from "./Filter";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Check, Keyboard } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Drawer from "@/components/ui/drawer";
import useAppointmentList from "./data/useAppointmentList";
import PharmacyHeader from "../components/PharmacyHeader";
import Select from "./AppointmentSelect";
import useSWR, { useSWRConfig } from "swr";
import { User, Calendar as CalendarIcon, Clock as ClockIcon, Phone, Mail, MapPin, X } from "lucide-react";
import { motion } from "framer-motion";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

// ... existing imports ...

const APPOINTMENT_STATUSES = [
  { label: "Upcoming", value: "Upcoming", color: "bg-indigo-100 text-indigo-700", key: "U" },
  { label: "Consulted", value: "Consulted", color: "bg-emerald-100 text-emerald-700", key: "C" },
  { label: "Observation", value: "Observation", color: "bg-sky-100 text-sky-700", key: "O" },
  { label: "Not show", value: "Not show", color: "bg-amber-100 text-amber-700", key: "N" },
  { label: "Completed", value: "Completed", color: "bg-emerald-100 text-emerald-700", key: "P" },
  { label: "Admit", value: "Admit", color: "bg-rose-100 text-rose-700", key: "A" },
  { label: "Test", value: "Test", color: "bg-rose-100 text-rose-700", key: "T" },
];

function DoctorAvailabilityCard({ doctorId }: { doctorId: string }) {
  const { data: availabilityData } = useSWR(doctorId ? `/users/doctor_availability/${doctorId}` : null);
  const { data: upcomingAppointments } = useSWR(doctorId ? `/appointments/calender/weekly?doctor=${doctorId}&startOfWeek=${new Date().toISOString()}` : null);

  // Simple Next 5 Days View
  const nextDays = Array.from({ length: 5 }, (_, i) => addDays(new Date(), i + 1));
  const schedule = availabilityData?.data || [];
  const appointments = upcomingAppointments?.data || [];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <CalendarIcon size={14} /> Doctor's Schedule
      </h4>
      <div className="space-y-2">
        {nextDays.map((date) => {
          const dayName = format(date, 'EEE'); // Mon, Tue...
          const fullDayName = format(date, 'EEEE');
          const dayConfig = schedule.find((s: any) => s.day === fullDayName);

          const isWorking = dayConfig?.isWorking ?? false;
          const dateStr = format(date, 'dd MMM');

          // Count appointments for this day
          const busyCount = appointments.filter((a: any) => isSameDay(new Date(a.start), date)).length;

          if (!isWorking) return null; // Skip non-working days or show as Off?

          return (
            <div key={date.toISOString()} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2.5">
                <span className="w-8 font-semibold text-gray-500">{dayName}</span>
                <span className="text-gray-900">{dateStr}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{dayConfig.startTime} - {dayConfig.endTime}</span>
                {busyCount > 0 && <span className="w-5 h-5 flex items-center justify-center bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">{busyCount}</span>}
              </div>
            </div>
          )
        })}
        {schedule.length === 0 && <p className="text-xs text-gray-400 italic">No schedule available.</p>}
      </div>
      <button className="w-full py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">View Full Schedule</button>
    </div>
  );
}

const PrimaryButton = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      "flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

function AppointmentSidePanel({ appointment, onClose, onEdit, onUpdateStatus }: {
  appointment: any,
  onClose: () => void,
  onEdit: (apt: any) => void,
  onUpdateStatus: (id: string, status: string) => void
}) {
  const { patient, start, end, type, status, doctor, visitCount } = appointment;
  const isNew = visitCount === 1 || type === "New";

  // Keyboard Shortcuts for Panel
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'escape':
          e.preventDefault();
          onClose();
          break;
        case 'e':
          e.preventDefault();
          onEdit(appointment);
          break;
      }

      // Status Shortcuts
      // Only trigger if no modifier keys are pressed (to avoid conflicts)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const statusMap: Record<string, string> = {
          "u": "Upcoming",
          "c": "Consulted",
          "o": "Observation",
          "n": "No show",
          "a": "Admit",
          "t": "Test",
        };
        if (statusMap[e.key.toLowerCase()]) {
          e.preventDefault();
          onUpdateStatus(appointment._id, statusMap[e.key.toLowerCase()]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appointment, onClose, onEdit, onUpdateStatus]);

  if (!appointment) return null;

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 340, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white border-l border-y border-gray-200 h-full flex flex-col shrink-0 z-40 rounded-l-2xl relative"
      style={{ borderRight: 'none' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 rounded-tl-2xl">
        <h3 className="font-semibold text-lg text-gray-800 tracking-tight flex items-center gap-2">
          Details
          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 font-normal hidden sm:inline-block">ESC</span>
        </h3>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-gray-50/50 custom-scrollbar">
        {/* Patient Profile Card */}
        <div className="text-center relative">
          <div className="relative inline-block group">
            <div className="w-24 h-24 bg-linear-to-br from-indigo-500 to-purple-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-4 text-4xl font-bold shadow-lg shadow-indigo-200 ring-4 ring-white">
              {patient.name.charAt(0)}
            </div>
            {isNew && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm shimmer-effect">
                NEW
              </span>
            )}
          </div>
          <h4 className="font-bold text-xl text-gray-900 leading-tight">{patient.name}</h4>
          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap text-sm text-gray-500">
            <span className="px-2 py-0.5 bg-gray-100 rounded-md border border-gray-200">MRN: {patient.mrn || "N/A"}</span>
            {visitCount > 0 && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100 font-semibold">{visitCount}th Visit</span>}
          </div>
        </div>

        {/* Status Selector */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Status</label>
            <Keyboard size={14} className="text-gray-300" />
          </div>

          <div className="flex flex-wrap gap-2">
            {APPOINTMENT_STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => onUpdateStatus(appointment._id, s.value)}
                className={`relative group px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${status === s.value
                  ? "ring-2 ring-offset-1 ring-indigo-500 border-transparent shadow-sm " + s.color
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                title={`Press '${s.key}' to select`}
              >
                {s.label}
                <span className="absolute -top-2 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[9px] px-1 rounded shadow-sm scale-75 origin-bottom">
                  {s.key}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Time & Date Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
              <p className="font-semibold text-gray-900 text-sm">
                {new Date(appointment.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          <div className="w-full h-px bg-gray-50" />
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl shrink-0">
              <ClockIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Time</p>
              <p className="font-semibold text-gray-900 text-sm">
                {new Date(appointment.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - {new Date(appointment.end).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Doctor Schedule Card */}
        {doctor?._id && <DoctorAvailabilityCard doctorId={doctor._id} />}

        {/* Contact Info */}
        {patient.phoneNumber && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-indigo-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{patient.phoneNumber}</p>
                <p className="text-xs text-gray-500">Mobile Number</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-5 border-t border-gray-100 bg-white space-y-3 pb-8">
        <button
          onClick={() => onEdit(appointment)}
          className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-gray-200 flex items-center justify-center gap-2 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
          Edit Appointment <span className="text-gray-500 text-[10px] ml-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 px-1 rounded">E</span>
        </button>
        <button
          onClick={() => onEdit(appointment)} // Reschedule often uses same form
          className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-bold transition"
        >
          Reschedule
        </button>
      </div>
    </motion.div>
  )
}

export default function AppointmentPage() {
  const [query, setQuery] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<string[]>(["Upcoming"]);
  const [openCreate, setOpenCreate] = useState<"walk-in" | boolean | any>(false);
  const [date, setDate] = useState(new Date());

  const { mutate } = useAppointmentList({ query, activeStatuses, date });
  const { mutate: globalMutate } = useSWRConfig();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tab = (searchParams.get("tab") as "list" | "calendar") || "list";

  const setTab = (newTab: "list" | "calendar") => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Doctor Selection (Calendar View)
  const { data: doctorsData } = useSWR("/users/doctors");
  const doctors = doctorsData?.data || [];
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  // Initialize selectedDoctorId when doctors are loaded
  React.useEffect(() => {
    if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0]._id);
    }
  }, [doctors, selectedDoctorId]);

  const selectedDoctor = doctors.find((d: any) => d._id === selectedDoctorId);

  // Selected Appointment for Side Panel
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Clear selection when tab changes or doctor changes
  React.useEffect(() => {
    setSelectedAppointment(null);
  }, [tab, selectedDoctorId]);

  // Global Keyboard Shortcuts
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // New Appointment: N
      if (e.key.toLowerCase() === 'n' && !e.shiftKey) {
        e.preventDefault();
        setOpenCreate(true);
      }
      // Walk-in: Shift + W
      if (e.key.toLowerCase() === 'w' && e.shiftKey) {
        e.preventDefault();
        setOpenCreate("walk-in");
      }
      // Tab Switch: Alt + 1/2
      if (e.altKey && e.key === '1') setTab("list");
      if (e.altKey && e.key === '2') setTab("calendar");

      // Calendar Navigation: Left/Right Arrows
      if (tab === 'calendar') {
        if (e.shiftKey && e.key === 'ArrowRight') handleNextWeek();
        if (e.shiftKey && e.key === 'ArrowLeft') handlePrevWeek();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [tab, date]);

  // Week Navigation
  const handleNextWeek = () => {
    const next = new Date(date);
    next.setDate(next.getDate() + 7);
    setDate(next);
  }

  const handlePrevWeek = () => {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 7);
    setDate(prev);
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      // Optimistic update locally
      if (selectedAppointment && selectedAppointment._id === id) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      }

      await toast.promise(
        api.patch(`/appointments/${id}`, { status: newStatus }),
        {
          loading: "Updating status...",
          success: "Status updated!",
          error: "Failed to update status"
        }
      );
      mutate(); // Refresh list
      globalMutate((key) => typeof key === 'string' && key.startsWith('/appointments/calender/weekly'));

      // Auto-prompt follow-up
      if (newStatus === "Consulted" || newStatus === "Completed") {
        const currentApt = selectedAppointment || {}; /* selectedAppointment might be null if not using panel? but here we use panel */
        // Only prompt if we have patient info
        if (currentApt.patient) {
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Appointment Completed
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Would you like to schedule a follow-up for {currentApt.patient?.name}?
                    </p>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => {
                          toast.dismiss(t.id);
                          setOpenCreate({
                            patient: currentApt.patient,
                            doctor: currentApt.doctor,
                            type: "Follow up",
                            date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
                            method: "In clinic",
                            status: "Upcoming"
                          });
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-xs text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Book Follow-up
                      </button>
                      <button
                        onClick={() => toast.dismiss(t.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-xs text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
            </div>
          ), { duration: 6000, position: "bottom-right" });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }


  // We consider "All" active if activeStatuses is empty
  const currentStatus = activeStatuses.length === 0 ? "All" : activeStatuses[0];

  return (
    <AppShell>
      <div className="p-0 sm:p-5 h-[calc(100vh-80px)] overflow-hidden flex flex-col">
        <div className="shrink-0 mb-4 px-4 sm:px-0 print:hidden">
          <PharmacyHeader
            title="Appointments"
            subtitle="Manage patient appointments and schedules"
          >
            <div className="flex gap-3 items-center">
              {tab === 'calendar' && (
                <>
                  <div className="flex items-center bg-white rounded-lg border border-gray-200 p-0.5 shadow-sm mr-2 transition-all hover:border-gray-300">
                    <button onClick={handlePrevWeek} title="Prev Week (Shift + Left)" className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500"><ChevronLeft size={16} /></button>
                    <span className="text-xs font-semibold px-2 min-w-[90px] text-center text-gray-700">
                      {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <button onClick={handleNextWeek} title="Next Week (Shift + Right)" className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500"><ChevronRight size={16} /></button>
                  </div>

                  <div className="w-[180px]">
                    <Select
                      value={selectedDoctorId}
                      onChange={setSelectedDoctorId}
                      options={doctors.map((d: any) => ({ label: `Dr. ${d.name}`, value: d._id }))}
                      placeholder="Select Doctor"
                      className="mt-0"
                    />
                  </div>
                </>
              )}
              <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />
              <PrimaryButton onClick={() => setOpenCreate(true)} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" title="New Appointment (N)">
                <Plus className="h-4 w-4 mr-2" /> Schedule
              </PrimaryButton>

              <PrimaryButton onClick={() => setOpenCreate("walk-in")} className="bg-linear-to-br from-indigo-600 to-pink-500 shadow-indigo-200" title="Walk-in (Shift + W)">
                Walk-in
              </PrimaryButton>

            </div>
          </PharmacyHeader>
        </div>

        {/* Statistics - Only show on List view to save space? Or make it collapsible? User requested optimizing blank space. */}
        {tab === 'list' && <div className="shrink-0  px-4 sm:px-0 print:hidden"><Statistics /></div>}

        {/* Filters Row */}
        {tab === 'list' &&
          <div className="shrink-0 mb-2.5 px-4 sm:px-0 print:hidden">
            <Filter
              activeStatuses={activeStatuses}
              query={query}
              setActiveStatuses={setActiveStatuses}
              setQuery={setQuery}
              date={date}
              setDate={setDate}
            />
          </div>
        }

        {/* Tabs and Content */}
        <div className="flex flex-col flex-1 overflow-hidden px-4 sm:px-0 print:hidden">
          <Tabs
            value={tab}
            onValueChange={(val) => setTab(val as "list" | "calendar")}
            className="flex flex-col h-full"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shrink-0">
              {/* Tab Switcher */}
              <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1 print:hidden w-fit shadow-sm">
                {[
                  { key: "list", label: "List", icon: CalendarDays, short: 'Alt+1' },
                  { key: "calendar", label: "Calendar", icon: CalendarDays, short: 'Alt+2' },
                ].map(({ key, label, icon: Icon, short }) => {
                  const active = tab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setTab(key as "list" | "calendar")}
                      title={`Switch to ${label} (${short})`}
                      className={
                        "relative flex items-center gap-2 rounded-full px-5 py-2.5 transition will-change-transform cursor-pointer font-medium " +
                        (active ? "text-white" : "text-gray-600 hover:text-gray-900")
                      }
                      type="button"
                    >
                      {active && (
                        <motion.span
                          layoutId="appointment-tab-indicator"
                          className="absolute inset-0 rounded-full shadow-md bg-linear-to-r from-indigo-600 to-fuchsia-500"

                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon size={16} /> {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Status Filter Toggle for List */}
              {tab === "list" && <div className="relative inline-flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-full w-fit shadow-sm print:hidden">
                {STATUSES.map((s) => {
                  const active = currentStatus === s;
                  return (
                    <button
                      key={s}
                      onClick={() =>
                        setActiveStatuses(s === "All" ? [] : [s])
                      }
                      className={
                        "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap " +
                        (active ? "text-white" : "text-gray-500 hover:text-gray-800")
                      }
                      type="button"
                    >
                      {active && (
                        <motion.span
                          layoutId="status-filter-indicator"
                          className="absolute inset-0 rounded-full shadow-md bg-linear-to-r from-indigo-600 to-fuchsia-500"

                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10">{s}</span>
                    </button>
                  );
                })}
              </div>}
            </div>

            <TabsContent value="list" className="flex-1 overflow-auto">
              <List query={query} activeStatuses={activeStatuses} date={date} />
            </TabsContent>

            <TabsContent value="calendar" className="flex-1 h-full overflow-hidden">
              <div className="flex gap-0 h-full items-start">
                {/* Left Side Panel */}
                {selectedAppointment && (
                  <AppointmentSidePanel
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                    onEdit={(apt) => setOpenCreate({ ...apt, doctor: doctors.find((d: any) => d._id === apt.doctor?._id || d._id === selectedDoctorId) || apt.doctor })}
                    onUpdateStatus={handleUpdateStatus}
                  />
                )}

                {/* Calendar with Flex Grow */}
                <div className="flex-1 h-full overflow-hidden flex flex-col">
                  <Calendar
                    date={date}
                    doctorId={selectedDoctorId}
                    doctorName={selectedDoctor ? `Dr. ${selectedDoctor.name}` : undefined}
                    onSelectAppointment={setSelectedAppointment}
                    isPanelOpen={!!selectedAppointment}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Drawer
          open={!!openCreate}
          onClose={() => setOpenCreate(false)}
          title={typeof openCreate === 'object' ? "Edit Appointment" : "Create Appointment"}
        >
          <CreateAppointmentForm
            onClose={() => setOpenCreate(false)}
            mutate={mutate}
            walkIn={openCreate === "walk-in"}
            appointment={typeof openCreate === 'object' ? openCreate : undefined}
          />
        </Drawer>
      </div>
    </AppShell>
  );
}
