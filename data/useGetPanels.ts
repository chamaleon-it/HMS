import useSWR from "swr"

export default function useGetPanels(): { panels: string[], mutate: () => void } {

    const { data, mutate } = useSWR<{ message: string, data: string[] }>("/lab/panels")

    return { panels: data?.data ?? [], mutate }
}
