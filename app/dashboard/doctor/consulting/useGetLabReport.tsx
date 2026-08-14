import useSWR from 'swr'

interface PropsTypes {
    patientId?: string
}

export default function useGetLabReport({ patientId }: PropsTypes) {
    const { data, error, isLoading } = useSWR<{ message: string; data: LabsDataTypes[] }>(
        patientId ? `lab/report/patient/${patientId}` : null
    )

    return {
        data: data?.data,
        error,
        isLoading
    }
}

export interface RangeItem {
    name?: string;
    min?: number;
    max?: number;
    upto?: number;
    fromAge?: number;
    toAge?: number;
    gender?: string;
    dateType?: string;
}

export interface TestDetail {
    _id: string;
    name: string;
    code?: string | null;
    unit?: string | null;
    type?: string;
    dataType?: string;
    range?: RangeItem[];
    min?: number;
    max?: number;
    method?: string | null;
    specimen?: string | null;
}

export interface TestItem {
    _id: string;
    name: TestDetail | any;
    value: any;
}

export interface Doctor {
    _id: string;
    name: string;
    specialization?: string | null;
}

export interface Lab {
    _id: string;
    name: string;
}

export interface LabsDataTypes {
    _id: string;
    patient: string;
    doctor?: Doctor;
    lab?: Lab;
    date: Date;
    priority?: string;
    test: TestItem[];
    name?: any[];
    sampleType?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
