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
  if (filter.lowStockThreshold) params.set("lowStockThreshold", String(filter.lowStockThreshold));
  if (filter.supplier && filter.supplier !== "All") params.set("supplier", filter.supplier);
  if (filter.lowStockItemsView) params.set("lowStockItemsView", String(filter.lowStockItemsView));

  const { data, mutate, isLoading, isValidating, error } = useSWR<{
    message: string;
    data: ItemType[];
    total: number;
    page: number;
    limit: number;
    lowStockCount: number
  }>(`/pharmacy/items?${params.toString()}`, {
    keepPreviousData: true,
  });

  return {
    items: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? filter.page ?? 1,
    limit: data?.limit ?? filter.limit ?? 10,
    lowStockCount: data?.lowStockCount,
    mutate,
    isLoading,
    isValidating,
    error,
  };
}
