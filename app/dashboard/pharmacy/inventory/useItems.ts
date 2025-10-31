// useItems.ts
import useSWR from "swr";
import { FilterType, ItemType } from "./interface";

export default function useItems({ filter }: { filter: FilterType }) {
  const params = new URLSearchParams();
  if (filter.page) params.set("page", String(filter.page));
  if (filter.limit) params.set("limit", String(filter.limit));
  if (filter.q) params.set("q", String(filter.q));
  if (filter.category) params.set("category", filter.category);
  if (filter.stock) params.set("stock", filter.stock);
  if (filter.expiry) params.set("expiry", String(filter.expiry));

  const { data, mutate, isLoading, isValidating, error } = useSWR<{
    message: string;
    data: ItemType[];
    total: number;
    page: number;
    limit: number;
  }>(`/pharmacy/items?${params.toString()}`);

  return {
    items: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? filter.page ?? 1,
    limit: data?.limit ?? filter.limit ?? 10,
    mutate,
    isLoading,
    isValidating,
    error,
  };
}
