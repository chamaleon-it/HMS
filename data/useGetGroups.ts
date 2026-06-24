import useSWR from "swr"

export interface GroupItemType {
    name: string;
    price: number;
    status: "Active" | "Inactive" | "Deleted";
    tests: {
        _id: string;
        name: string;
        price: number;
        code: string;
    }[];
    panels: {
        _id: string;
        name: string;
        price: number;
        tests: any[];
    }[];
}

export default function useGetGroups(): { groups: GroupItemType[], mutate: () => void } {
    const { data, mutate } = useSWR<{ message: string, data: GroupItemType[] }>("/lab/panels/groups")
    return { groups: data?.data ?? [], mutate }
}
