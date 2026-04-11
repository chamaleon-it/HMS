import React from 'react'
import useSWR from 'swr'

export default function useGetTest() {
    const { data, mutate } = useSWR<{ message: string, data: TestItemType[] }>('/lab/panels/tests')

    return { tests: data?.data ?? [], mutate }
}




export interface TestItemType {
    _id: string;
    code: string;
    name: string;
    type?: "Lab" | "Imaging" | "Panel";
    estimatedTime?: number;
    price?: number;
    unit?: string;
    panels?: {
        name: string;
        _id: string;
    }[];
    range: {
        name: string;
        min: number | null | undefined;
        max: number | null | undefined;
        fromAge: number | null | undefined;
        toAge: number | null | undefined;
        gender: "Both" | "Male" | "Female";
        dateType: "Year" | "Month" | "Day";

    }[],
    note: string
}


