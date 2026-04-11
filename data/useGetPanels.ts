import useSWR from "swr"

export default function useGetPanels(): { panels: { name: string; price: number; estimatedTime?: number; mainHeading?: string; subheadings?: string[]; testSubheadings?: Record<string, string>; tests?: any[] }[], mutate: () => void } {

    const { data, mutate } = useSWR<{ message: string, data: { name: string; price: number; estimatedTime?: number; mainHeading?: string; subheadings?: string[]; testSubheadings?: Record<string, string>; tests?: any[] }[] }>("/lab/panels")

    return { panels: data?.data ?? [], mutate }
}
