"use client";

import { useAuth } from "@/auth/context/auth-context";
import useSWR from "swr";

function formatLocalDate(d: Date | string): string {
  if (!d) return "";
  if (typeof d === "string") return d.includes("T") ? d.split("T")[0] : d;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function useAppointmentList({
  query,
  activeStatuses,
  date,
  activeDate = "Today",
  doctor
}: {
  query?: string;
  activeStatuses?: string[];
  date: Date;
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
  doctor?: string;
}) {
  const { user } = useAuth()
  const params = new URLSearchParams();

  if (query) params.append("query", query);
  if (activeStatuses) params.append("status", JSON.stringify(activeStatuses));
  if (date) params.append("date", formatLocalDate(date));
  if (activeDate) params.append("activeDate", activeDate);
  if (doctor) params.append("doctor", doctor);

  const { data, isLoading, mutate, error } = useSWR<{
    message: string;
    data: {
      _id: string;
      patient: {
        _id: string;
        mrn: string;
        name: string;
        phoneNumber: string;
        gender: string;
        dateOfBirth: Date;
        blood: string;
        allergies: string;
        address: string;
        notes: string;
        createdAt: Date;
      };
      doctor: {
        _id: string;
        name: string;
        email: string;
        phoneNumber: string | null;
        address: string | null;
        profilePic: string | null;
      };
      createdBy: string;
      method: "In clinic" | "Video" | "Phone";
      date: Date;
      notes: string | null;
      internalNotes: string | null;
      type: "New" | "Follow up";
      status:
      | "Upcoming"
      | "Consulted"
      | "Observation"
      // | "Completed"
      | "Not show";
      isPaid: boolean;
      isDeleted: boolean;
      isRefunded?: boolean;
      hasConsultationFee?: boolean;
      token?: string;
      tokenNumber?: number;
      createdAt: Date;
      visitCount: number;
    }[];
  }>(`/appointments/list?${params?.toString()}`, {
    revalidateIfStale: false
  });

  return { data, isLoading, mutate, error };
}
