import useSWR from "swr"

export interface PanelItemType {
    _id: string;
    name: string;
    price: number;
    estimatedTime?: number;
    mainHeading?: string;
    method?: string;
    specimen?: string;
    subheadings?: string[];
    testSubheadings?: Record<string, string>;
    tests?: any[];
    department?: string;
}

export default function useGetPanels(): { panels: PanelItemType[], mutate: () => void } {

    const { data, mutate } = useSWR<{ message: string, data: PanelItemType[] }>("/lab/panels")

    return { panels: data?.data ?? [], mutate }
}
