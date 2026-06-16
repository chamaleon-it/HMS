import useSWR from "swr"

export default function useGetPanels(): { panels: { _id: string; name: string; price: number; estimatedTime?: number; mainHeading?: string; method?: string; specimen?: string; subheadings?: string[]; testSubheadings?: Record<string, string>; tests?: any[]; department?: string; }[], mutate: () => void } {

    const { data, mutate } = useSWR<{ message: string, data: { _id: string; name: string; price: number; estimatedTime?: number; mainHeading?: string; specimen?: string; method?: string; subheadings?: string[]; testSubheadings?: Record<string, string>; tests?: any[]; department?: string; }[] }>("/lab/panels")

    return { panels: data?.data ?? [], mutate }
}
