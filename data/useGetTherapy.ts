import useSWR from "swr";

export interface TherapyItemType {
  _id: string;
  name: string;
  price?: number;
  description?: string;
}

export default function useGetTherapy() {
  const { data, isLoading, mutate } = useSWR<{
    data: TherapyItemType[];
  }>("/therapy");

  return {
    therapies: data?.data || [],
    isLoading,
    mutate,
  };
}
