import useSWR from 'swr'

interface PropsTypes {
    patientId?: string
}

export default function useGetLabReport({ patientId }: PropsTypes) {
    const { data, error, isLoading } = useSWR<{ message: string; data: LabsDataTypes[] }>(patientId ? `lab/report/patient/${patientId}` : null)

    return {
        data: data?.data,
        error,
        isLoading
    }
}


export interface LabsDataTypes {
    _id: string;
    patient: string;
    doctor: Doctor;
    lab: Lab;
    date: Date;
    priority: string;
    name: Name[];
    sampleType: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

interface Doctor {
    _id: string;
    name: string;
    specialization: null;
}

interface Lab {
    _id: string;
    name: string;
}

interface Name {
    code: string;
    name: string;
    unit: string;
    min?: number;
    max?: number;
    type: string;
    _id: string;
    value: string;
    panel?: string;
}
