import { useAuth } from "@/auth/context/auth-context";
import useSWR from "swr";

export default function useAppointmentList({
  query,
  activeStatuses,
  date,
  activeDate = "Today"
}: {
  query?: string;
  activeStatuses?: string[];
  date: Date;
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
}) {
  const { user } = useAuth()
  const params = new URLSearchParams();

  if (query) params.append("query", query);
  if (activeStatuses) params.append("status", JSON.stringify(activeStatuses));
  if (date) params.append("date", date.toISOString());
  if (activeDate) params.append("activeDate", activeDate);

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
      createdAt: Date;
      visitCount: number;
    }[];
  }>(user?.role === "Doctor" ? `/appointments/list?${params?.toString()}` : null, {
    revalidateIfStale: false
  });

  return { data, isLoading, mutate, error };
}
