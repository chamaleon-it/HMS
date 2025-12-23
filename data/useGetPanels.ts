import useSWR from "swr"

export default function useGetPanels(): { panels: { name: string; price: number }[], mutate: () => void } {

    const { data, mutate } = useSWR<{ message: string, data: { name: string; price: number }[] }>("/lab/panels")

    return { panels: data?.data ?? [], mutate }
}
