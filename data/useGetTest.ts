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
    type: "Lab" | "Imaging";
    estimatedTime: number;
    min: number;
    max: number;
    unit: string;
    panels: {
        name: string;
        _id: string;
    }[];
    womenMax?: number;
    womenMin?: number;
    childMax?: number;
    childMin?: number;
    nbMax?: number;
    nbMin?: number;
}


