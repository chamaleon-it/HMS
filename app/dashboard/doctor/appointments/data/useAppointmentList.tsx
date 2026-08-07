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
  doctorId,
}: {
  query?: string;
  activeStatuses?: string[];
  date: Date;
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
  doctorId?: string;
}) {
  const { user } = useAuth()
  const params = new URLSearchParams();

  if (query) params.append("query", query);
  if (activeStatuses) params.append("status", JSON.stringify(activeStatuses));
  if (date) params.append("date", formatLocalDate(date));
  if (activeDate) params.append("activeDate", activeDate);
  if (doctorId) {
    params.append("doctor", doctorId);
  } else if (user?.role === "Doctor" && user?._id) {
    params.append("doctor", user._id);
  }

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
      token?: string;
      tokenNumber?: number;
      isArrived?: boolean;
      createdAt: Date;
      visitCount: number;
    }[];
  }>(user?.role === "Doctor" ? `/appointments/list?${params?.toString()}` : null, {
    revalidateIfStale: false
  });

  return { data, isLoading, mutate, error };
}
