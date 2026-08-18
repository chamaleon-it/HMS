import useSWR from "swr";

export interface SubTherapyItemType {
  _id: string;
  name: string;
  price: number;
  code?: string;
  description?: string;
  status: string;
  isDeleted?: boolean;
}

export interface TherapyItemType {
  _id: string;
  name: string;
  price?: number;
  code?: string;
  description?: string;
  hasSubTherapies?: boolean;
  subTherapies?: SubTherapyItemType[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function useGetTherapy(search?: string, status?: string) {
  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (status && status !== "all") queryParams.set("status", status);

  const query = `/therapy${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  const { data, isLoading, error, mutate } = useSWR<{
    message: string;
    data: TherapyItemType[];
  }>(query, {
    revalidateOnFocus: false,
  });

  return {
    therapies: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}
