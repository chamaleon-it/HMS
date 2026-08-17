import useSWR from "swr";

export interface SubProcedureItemType {
  _id: string;
  name: string;
  price: number;
  code?: string;
  description?: string;
  status: string;
  isDeleted?: boolean;
}

export interface ProcedureItemType {
  _id: string;
  name: string;
  price?: number;
  code?: string;
  description?: string;
  hasSubProcedures?: boolean;
  subProcedures?: SubProcedureItemType[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function useGetProcedure(search?: string, status?: string) {
  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (status && status !== "all") queryParams.set("status", status);

  const query = `/procedure${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  const { data, isLoading, error, mutate } = useSWR<{
    message: string;
    data: ProcedureItemType[];
  }>(query, {
    revalidateOnFocus: false,
  });

  return {
    procedures: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}
