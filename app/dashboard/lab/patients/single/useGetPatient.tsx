
import useSWR from 'swr';

export default function useGetPatient(id?: string) {
    const { data: patient, error, mutate } = useSWR<DataTypes>(
        id ? `patients/single/${id}` : null
    );
    return {
        data: patient?.data,
        error,
        mutate,
    };
}


export interface DataTypes {
    data: Data;
    message: string;
}

export interface Data {
    _id: string;
    name: string;
    phoneNumber: string;
    email: string;
    gender: string;
    dateOfBirth: Date;
    conditions: string[];
    blood: string;
    allergies: string;
    address: string;
    notes: string;
    createdBy: string;
    status: string;
    mrn: string;
    createdAt: Date;
    updatedAt: Date;
    weight?: number;
    guardian?: string;
    guardianRelation?: string;
    guardianPhoneNumber?: string;
}
