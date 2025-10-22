import useSWR from "swr";

export default function useAppointmentList({
  query,
  activeStatuses,
  date,
}: {
  query?: string;
  activeStatuses?: string[];
  date?: Date;
}) {
  const params = new URLSearchParams();

  if (query) params.append("query", query);
  if (activeStatuses) params.append("status", JSON.stringify(activeStatuses));
  if (date) params.append("date", date.toISOString());

  const { data, isLoading, mutate, error } = useSWR<{
    message: string;
    data: {
      _id: string;
      patient: {
        _id: string;
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
        | "Completed"
        | "Not show";
      isPaid: boolean;
      createdAt: Date;
      visitCount: number;
    }[];
  }>(`/appointments/list?${params?.toString()}`);

  return { data, isLoading, mutate, error };
}
